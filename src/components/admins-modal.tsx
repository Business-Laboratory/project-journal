import tw, { css } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { Fragment, useReducer } from 'react'
import produce from 'immer'

import { Modal, SaveButton } from '@components/modal'
import { IconButton } from '@components/icon-button'
import { TextInput } from '@components/text-input'
import { PlusSmallIcon, DeleteIcon } from 'icons'

import { AdminsData } from '../pages/api/admins'
import { useAdminsMutation } from '@queries/useAdminsMutation'

export { AdminsModal, createEditAdminsPath }

type AdminsModalProps = {
  currentAdmins: AdminsData
}
function AdminsModal({ currentAdmins }: AdminsModalProps) {
  const router = useRouter()
  const { edit } = router.query

  if (!edit || Array.isArray(edit)) {
    return null
  }

  const handleOnDismiss = () => {
    router.replace(`/admins`, undefined, { shallow: true })
  }

  return (
    <Modal isOpen={edit === 'update'} onDismiss={handleOnDismiss}>
      <EditAdminsModalContent
        currentAdmins={currentAdmins}
        onDismiss={handleOnDismiss}
      />
    </Modal>
  )
}

type EditAdminsModalContentProps = {
  currentAdmins: AdminsData
  onDismiss: () => void
}
function EditAdminsModalContent({
  currentAdmins,
  onDismiss,
}: EditAdminsModalContentProps) {
  const [admins, adminsDispatch] = useReducer(
    admindsReducer,
    initAdminState(currentAdmins)
  )

  const adminsMutation = useAdminsMutation()

  console.log(admins)

  return (
    <div tw="space-y-10 flex flex-col items-end">
      <div tw="space-y-2">
        <IconButton
          onClick={() =>
            adminsDispatch({ type: 'add', id: new Date().valueOf() })
          }
        >
          <PlusSmallIcon tw="w-4 h-4 fill-copper-300" />
          <span tw="bl-text-xl">Add admin</span>
        </IconButton>
        <div
          css={[
            css`
              grid-template-columns: 10rem 24rem 3rem;
            `,
            tw`grid bl-text-lg`,
          ]}
        >
          <span tw="col-start-1 col-end-2 self-center">Name</span>
          <span tw="col-start-2 col-end-4 pl-8 self-center">Email</span>
          {admins.map(({ id, name, email }) => (
            <Fragment key={id}>
              <TextInput
                tw="flex flex-col w-full self-center"
                placeholder="Name"
                value={name === null ? '' : name}
                onChange={(name) =>
                  adminsDispatch({ type: 'edit', id: id, name: name })
                }
              />
              <TextInput
                tw="flex flex-col w-full pl-8 self-center"
                placeholder="Email"
                value={email === null ? '' : email}
                onChange={(email) =>
                  adminsDispatch({ type: 'edit', id: id, email: email })
                }
              />
              <button
                className="group"
                onClick={() => adminsDispatch({ type: 'delete', id: id })}
                css={[
                  tw`focus:outline-none h-12`,
                  css`
                    &.focus-visible > svg {
                      ${tw`ring-2 ring-copper-400`}
                    }
                  `,
                ]}
              >
                <DeleteIcon tw="w-3 h-3 fill-matisse-red-200 group-hover:fill-matisse-red-400 inline-flex" />
              </button>
            </Fragment>
          ))}
        </div>
      </div>
      <SaveButton
        tw="mr-4"
        onClick={() => {
          adminsMutation.mutate(admins, {
            onSuccess: onDismiss,
          })
        }}
        disabled={adminsMutation.isLoading}
        error={adminsMutation.isError}
      >
        {adminsMutation.isLoading ? 'Saving admins...' : 'Save admins'}
      </SaveButton>
    </div>
  )
}

function createEditAdminsPath() {
  return {
    pathname: `/admins`,
    query: { edit: 'update' },
  }
}

function initAdminState(adminsData: AdminsData) {
  return (
    adminsData?.map((adminObject) => {
      return {
        id: adminObject.id,
        name: adminObject.name ?? '',
        email: adminObject.email ?? '',
      }
    }) ?? []
  )
}

type ActionTypes =
  | { type: 'edit'; id: number; name?: string; email?: string }
  | { type: 'add'; id: number }
  | { type: 'delete'; id: number }

const admindsReducer = produce(
  (state: ReturnType<typeof initAdminState>, action: ActionTypes) => {
    switch (action.type) {
      case 'edit': {
        const adminToEdit = state.find(
          (adminObject) => adminObject.id === action.id
        )
        if (!adminToEdit) {
          throw new Error('You are missing the admin object.')
        }
        if (action.name) {
          adminToEdit.name = action.name
        }
        if (action.email) {
          adminToEdit.email = action.email
        }
        break
      }
      case 'add': {
        state.push({
          id: action.id,
          name: '',
          email: '',
          new: true,
        })
        break
      }
      case 'delete': {
        const adminIndex = state.findIndex(
          (adminObject) => adminObject.id === action.id
        )
        state.splice(adminIndex, 1)
        break
      }
      default:
        throw new Error()
    }
  }
)
