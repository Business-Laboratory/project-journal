import tw, { css } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { Fragment, useReducer } from 'react'
import produce from 'immer'

import { Modal, SaveButton } from '@components/modal'
import { PlusSmallIcon } from 'icons'

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
              grid-template-columns: 10rem 21rem;
            `,
            tw`grid gap-x-12 gap-y-2 bl-text-lg`,
          ]}
        >
          <span tw="col-span-1">Name</span>
          <span tw="col-span-1">Email</span>
          {admins.map(({ id, name, email }) => (
            <Fragment key={id}>
              <AdminInfoInput
                value={name}
                onChange={(name) =>
                  adminsDispatch({ type: 'edit', id: id, name: name })
                }
                placeHolder="Name"
              />
              <AdminInfoInput
                value={email}
                onChange={(email) =>
                  adminsDispatch({ type: 'edit', id: id, email: email })
                }
                placeHolder="Email"
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
}
function AdminInfoInput({ value, onChange, placeHolder }: AdminInfoInput) {
  return (
    <label tw="flex flex-col w-full">
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
      }
    }) ?? []
  )
}

type ActionTypes =
  | { type: 'edit'; id: number; name?: string; email?: string }
  | { type: 'add'; id: number }

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
        })
        break
      }
      default:
        throw new Error()
    }
  }
)
