// Alternate Admin Home view that displays clients
import 'twin.macro'
import { Fragment, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { PlusIcon, EditIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { Modal } from '@components/modal'
import { useClients } from '@queries/useClients'
import { UpdateModal } from '@components/project'

export default function Clients() {
  return (
    <>
      <Head>
        <title>Clients | Project Journal</title>
      </Head>
      <main tw="pt-10 w-9/12 min-w-max mx-auto space-y-8">
        <ClientList />
      </main>
    </>
  )
}

function ClientList() {
  const { data, status } = useClients()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load clients" />
  }

  if (status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading clients" />
  }

  const clients = data ?? []

  return (
    <>
      <AddClientLink />
      {clients.length > 0 ? (
        clients.map(({ id, name, employees }) => (
          <div key={id} tw="space-y-4">
            <IconLink href={{ query: { id: String(id) } }}>
              <EditIcon tw="w-6 h-6 fill-copper-300" />
              <span tw="bl-text-3xl">{name}</span>
            </IconLink>
            <div tw="grid grid-cols-3 gap-x-3 gap-y-2 bl-text-lg">
              <span tw="col-span-1">Name</span>
              <span tw="col-span-1">Email</span>
              <span tw="col-span-1">Role</span>
              {employees.map(({ id: eId, title, user }) => (
                <Fragment key={eId}>
                  <span tw="bl-text-base col-span-1">{user.name}</span>
                  <span tw="bl-text-base col-span-1">{user.email}</span>
                  <span tw="bl-text-base col-span-1">{title}</span>
                </Fragment>
              ))}
            </div>
          </div>
        ))
      ) : (
        <h1 tw="bl-text-3xl max-w-prose text-center">
          No clients are available
        </h1>
      )}
      <EditClientModal />
    </>
  )
}

function AddClientLink() {
  return (
    <IconLink href="#">
      <PlusIcon tw="w-6 h-6 fill-copper-300" />
      <span tw="bl-text-2xl">Add client</span>
    </IconLink>
  )
}

function EditClientModal() {
  const router = useRouter()
  const { id: clientId } = router.query

  if (!clientId || Array.isArray(clientId)) {
    return null
  }

  const handleOnDismiss = () => {
    router.replace('/clients', undefined, { shallow: true })
  }

  return (
    <Modal isOpen={Boolean(clientId)} onDismiss={handleOnDismiss}>
      <EditClientModalContent
        data={{ id: 'new' }}
        onDismiss={handleOnDismiss}
      />
    </Modal>
  )
}

// TODO: Get this from api/client
type ClientBody = {
  id: 'new' | number
}

type EditClientModalContentProps = {
  data?: ClientBody
  onDismiss: () => void
}
function EditClientModalContent({
  data = { id: 'new' },
  onDismiss,
}: EditClientModalContentProps) {
  const { id } = data
  useRedirectNewClient(id)

  return null
}

/**
 * Any client id that isn't found in our data defaults to path /clients?id=new
 */
function useRedirectNewClient(id: ClientBody['id']) {
  const router = useRouter()
  const { id: clientId } = router.query

  useEffect(() => {
    if (id === 'new' && clientId !== 'new') {
      router.replace({ query: { id: 'new' } }, undefined, { shallow: true })
    }
  }, [clientId, id, router])
}
