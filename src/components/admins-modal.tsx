import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { Modal } from '@components/modal'

export { AdminsModal, createEditAdminsPath }

function AdminsModal() {
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
      Test
    </Modal>
  )
}

function createEditAdminsPath() {
  return {
    pathname: `/admins`,
    query: { edit: 'update' },
  }
}
