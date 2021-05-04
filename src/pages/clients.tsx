// Alternate Admin Home view that displays clients
import 'twin.macro'
import React, { Fragment, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { PlusIcon, EditIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { DeleteSection, Modal } from '@components/modal'
import { useClients } from '@queries/useClients'

import type { Clients as ClientsData } from '@queries/useClients'
import { TextInput } from '@components/text-input'
import { IconButton } from '@components/icon-button'
import { Button } from '@components/button'

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
            <IconLink href={createEditClientHref(id)}>
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
      <EditClientModal clients={clients} />
    </>
  )
}

function AddClientLink() {
  return (
    <IconLink href={createEditClientHref('new')}>
      <PlusIcon tw="w-6 h-6 fill-copper-300" />
      <span tw="bl-text-2xl">Add client</span>
    </IconLink>
  )
}

type EditClientModalProps = {
  clients: ClientsData
}
function EditClientModal({ clients }: EditClientModalProps) {
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
        data={
          clientId !== 'new'
            ? clients.find(({ id }) => id === Number(clientId))
            : undefined
        }
        onDismiss={handleOnDismiss}
      />
    </Modal>
  )
}

// TODO: Get this from api/client
type ClientBody = {
  id: 'new' | number
  name: string
  employees: {
    title: string | null
    id: number
    user: {
      name: string | null
      email: string | null
    }
  }[]
}

const newClientData: ClientBody = { id: 'new', name: '', employees: [] }

type EditClientModalContentProps = {
  data?: ClientBody
  onDismiss: () => void
}
function EditClientModalContent({
  data = newClientData,
  onDismiss,
}: EditClientModalContentProps) {
  const { id, name } = data
  useRedirectNewClient(id)

  // TODO: convert to state
  const employees = data.employees

  return (
    <>
      <section tw="flex flex-col">
        <TextInput
          tw="bl-text-3xl w-full"
          label="Client name"
          placeholder="Client name"
          value={name}
          onChange={() => {}}
        />

        <IconButton tw="mt-9">
          <PlusIcon tw="w-4 h-4 fill-copper-300" />
          <span tw="bl-text-xl">Add employee</span>
        </IconButton>

        <table tw="w-full mt-2">
          <thead>
            <TableRow>
              <HeaderCell>Name</HeaderCell>
              <HeaderCell>Email</HeaderCell>
              <HeaderCell>Role</HeaderCell>
            </TableRow>
          </thead>
          <tbody tw="block mt-2 space-y-2">
            {employees.map(
              ({ id, title: role, user: { email, name } }, idx) => {
                return (
                  <TableRow key={id}>
                    <InputCell
                      aria-label={`employee ${idx} name`}
                      value={name ?? ''}
                      onChange={() => {}}
                    />
                    <InputCell
                      aria-label={`employee ${idx} email`}
                      type="email"
                      value={email ?? ''}
                      onChange={() => {}}
                    />
                    <InputCell
                      aria-label={`employee ${idx} role`}
                      value={role ?? ''}
                      onChange={() => {}}
                    />
                  </TableRow>
                )
              }
            )}
          </tbody>
        </table>
        <Button tw="self-end mt-10" variant="important">
          save client
        </Button>
      </section>

      <DeleteSection
        tw="mt-16"
        label="Verify client name"
        verificationText={name}
        buttonText={'success' === 'loading' ? 'deleting...' : 'delete client'}
        onDelete={() => {}}
        status={'success'}
      />
    </>
  )
}

function TableRow(props: React.ComponentPropsWithoutRef<'tr'>) {
  return <tr tw="grid grid-cols-3 gap-x-3 justify-start" {...props} />
}
function HeaderCell(props: React.ComponentPropsWithoutRef<'th'>) {
  return <th tw="bl-text-lg text-left" {...props} />
}

function InputCell(props: React.ComponentPropsWithoutRef<'input'>) {
  return (
    <td tw="bl-text-lg text-left">
      <TextInput tw="w-full" {...props} onChange={(newValue) => {}} />
    </td>
  )
}

/**
 * Any client id that isn't found in our data defaults to path /clients?id=new
 */
function useRedirectNewClient(id: ClientBody['id']) {
  const router = useRouter()
  const { id: clientId } = router.query

  useEffect(() => {
    if (id === 'new' && clientId !== 'new') {
      router.replace(createEditClientHref('new'), undefined, { shallow: true })
    }
  }, [clientId, id, router])
}

function createEditClientHref(id: ClientBody['id']) {
  return {
    query: { id },
  }
}
