import tw, { css } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useEffect, useState, Fragment } from 'react'

import { Modal, SaveButton } from '@components/modal'
import { PlusIcon, PlusSmallIcon } from 'icons'
import { IconLink } from '@components/icon-link'

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
  const admins = currentAdmins ?? []

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
          onClick={() => {}}
        >
          <PlusSmallIcon tw="w-4 h-4 fill-copper-300" />
          <span tw="bl-text-xl">Add admin</span>
        </button>
        <div
          css={[
            css`
              grid-template-columns: repeat(2, minmax(0, max-content));
            `,
            tw`grid gap-x-12 gap-y-2 bl-text-lg`,
          ]}
        >
          <span tw="col-span-1">Name</span>
          <span tw="col-span-1">Email</span>
          {admins.map(({ id, name, email }) => (
            <Fragment key={id}>
              <span tw="bl-text-base col-span-1">{name}</span>
              <span tw="bl-text-base col-span-1">{email}</span>
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

function createEditAdminsPath() {
  return {
    pathname: `/admins`,
    query: { edit: 'update' },
  }
}
