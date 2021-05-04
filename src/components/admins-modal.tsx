import tw, { css } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { Fragment, useReducer } from 'react'
import produce from 'immer'

import { Modal, SaveButton } from '@components/modal'
import { PlusSmallIcon, DeleteIcon } from 'icons'

import { AdminsData } from '../pages/api/admins'

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
      <EditAdminsModalContent currentAdmins={currentAdmins} />
    </Modal>
  )
}

type EditAdminsModalContentProps = {
  currentAdmins: AdminsData
}
function EditAdminsModalContent({
  currentAdmins,
}: EditAdminsModalContentProps) {
  const [admins, adminsDispatch] = useReducer(
    admindsReducer,
    initAdminState(currentAdmins)
  )

  console.log(admins)

  return (
    <div tw="space-y-10 flex flex-col items-end">
      <div tw="space-y-2">
        <button
          css={[
            tw`w-full inline-flex space-x-2 items-center hover:text-copper-300
            focus:outline-none`,
            css`
              &.focus-visible {
                ${tw`ring-2 ring-copper-400`}
              }
            `,
          ]}
          onClick={() =>
            adminsDispatch({ type: 'add', id: new Date().valueOf() })
          }
        >
          <PlusSmallIcon tw="w-4 h-4 fill-copper-300" />
          <span tw="bl-text-xl">Add admin</span>
        </button>
        <div
          css={[
            css`
              grid-template-columns: 0.75rem 10rem 24rem;
            `,
            tw`grid gap-y-2 bl-text-lg`,
          ]}
        >
          <span tw="col-start-2 col-end-3 pl-4">Name</span>
          <span tw="col-start-3 col-end-4 pl-8">Email</span>
          {admins.map(({ id, name, email }) => (
            <Fragment key={id}>
              <button
                className={`${id}`}
                onClick={() => adminsDispatch({ type: 'delete', id: id })}
                css={[
                  tw`focus:outline-none`,
                  css`
                    &.focus-visible {
                      ${tw`ring-2 ring-copper-400`}
                    }
                  `,
                ]}
              >
                <DeleteIcon tw="w-3 h-3 fill-matisse-red-200 hover:fill-matisse-red-300 self-center visibility: visible" />
              </button>
              <AdminInfoInput
                value={name}
                onChange={(name) =>
                  adminsDispatch({ type: 'edit', id: id, name: name })
                }
                placeHolder="Name"
                className={`${id}`}
                tw="pl-4"
              />
              <AdminInfoInput
                value={email}
                onChange={(email) =>
                  adminsDispatch({ type: 'edit', id: id, email: email })
                }
                placeHolder="Email"
                className={`${id}`}
                tw="pl-8"
              />
            </Fragment>
          ))}
        </div>
      </div>
      <SaveButton
        tw="float-right"
        onClick={() => {}}
        disabled={false}
        error={false}
      >
        Save admins
      </SaveButton>
    </div>
  )
}

type AdminInfoInput = {
  value: string | null
  onChange: (value: string) => void
  placeHolder: string
  className?: string
}
function AdminInfoInput({
  value,
  onChange,
  placeHolder,
  className,
}: AdminInfoInput) {
  return (
    <label className={className} tw="flex flex-col w-full">
      <input
        css={[
          tw`bl-text-base placeholder-gray-yellow-400`,
          tw`focus:outline-none border-b border-gray-yellow-600`,
        ]}
        value={value === null ? '' : value}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
      />
    </label>
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
        name: adminObject.name,
        email: adminObject.email,
        new: false,
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
