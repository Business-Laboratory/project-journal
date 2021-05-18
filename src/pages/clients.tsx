// Alternate Admin Home view that displays clients
import tw, { css, theme } from 'twin.macro'
import Head from 'next/head'
import { Fragment, useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import produce from 'immer'

import { PlusIcon, PlusSmallIcon, EditIcon, DeleteIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { DeleteSection, Modal, SaveButton } from '@components/modal'
import { TextInput } from '@components/text-input'
import { IconButton } from '@components/icon-button'
import { useClients } from '@queries/useClients'
import { useClientMutation } from '@queries/useClientMutation'
import { useDeleteClientMutation } from '@queries/useDeleteClientMutation'
import { isValidEmail } from '@utils/is-valid-email'

import type { Clients as ClientsData } from '@queries/useClients'
import type { ClientBody } from '@queries/useClientMutation'

export default function Clients() {
  return (
    <>
      <Head>
        <title>Clients | Project Journal</title>
      </Head>

      <ClientList />
    </>
  )
}

function ClientList() {
  const { data, status } = useClients()

  if (status === 'error') {
    return (
      <NoClientsWrapper>
        <DataErrorMessage errorMessage="Unable to load clients" />
      </NoClientsWrapper>
    )
  }

  if (status === 'loading') {
    return (
      <NoClientsWrapper>
        <LoadingSpinner loadingMessage="Loading clients" />
      </NoClientsWrapper>
    )
  }

  const clients = data ?? []

  return clients.length > 0 ? (
    <main tw="py-10 w-5/6 md:w-3/4 xl:w-1/2 min-w-max mx-auto px-8">
      <AddClientLink />

      <section
        tw="grid gap-x-3 gap-y-2 bl-text-lg mt-2"
        css={css`
          grid-template-columns: 1fr 1fr auto;
        `}
      >
        {clients.map(({ id, name, employees }) => (
          <Fragment key={id}>
            <IconLink href={createEditClientHref(id)} tw="col-span-3 pt-6 pb-2">
              <EditIcon tw="w-6 h-6 fill-copper-300" />
              <span tw="bl-text-3xl">{name}</span>
            </IconLink>
            <span tw="col-span-1">Name</span>
            <span tw="col-span-1">Email</span>
            <span tw="col-span-1">Role</span>
            {employees.map(({ userId, clientId, title, user }) => (
              <Fragment key={`${userId}-${clientId}`}>
                <span tw="bl-text-base col-span-1">{user.name}</span>
                <span tw="bl-text-base col-span-1">{user.email}</span>
                <span tw="bl-text-base col-span-1">{title}</span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </section>

      <EditClientModal clients={clients} />
    </main>
  ) : (
    <NoClientsWrapper>
      <AddClientLink />
      <h1 tw="bl-text-3xl">No clients are available</h1>
    </NoClientsWrapper>
  )
}

function NoClientsWrapper({ children }: { children: React.ReactNode }) {
  return <main tw="pt-10 px-8 space-y-8 mx-auto max-w-fit">{children}</main>
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
        client={
          clientId !== 'new'
            ? clients.find(({ id }) => id === Number(clientId))
            : undefined
        }
        onDismiss={handleOnDismiss}
      />
    </Modal>
  )
}

type EditClientModalContentProps = {
  client?: ClientsData[0]
  onDismiss: () => void
}
function EditClientModalContent({
  client,
  onDismiss,
}: EditClientModalContentProps) {
  const [{ data, status }, dispatch] = useReducer(
    clientReducer,
    client,
    initClient
  )
  const { id, name, employees } = data
  useRedirectNewClient(id)
  const clientMutation = useClientMutation()
  const deleteClientMutation = useDeleteClientMutation()

  return (
    <>
      <section tw="flex flex-col justify-start">
        <TextInput
          tw="bl-text-3xl w-full"
          label="Client name"
          placeholder="Client name"
          value={name}
          onChange={(name) => dispatch({ type: 'updateName', name })}
        />

        <IconButton
          tw="mt-9 max-w-max"
          onClick={() => dispatch({ type: 'addEmployee' })}
        >
          <PlusSmallIcon tw="w-4 h-4 fill-copper-300" />
          <span tw="bl-text-xl">Add employee</span>
        </IconButton>

        <div
          css={[
            tw`grid gap-x-3 items-center mt-2`,
            css`
              min-width: 650px;
              grid-template-columns: repeat(3, minmax(0, 1fr)) ${theme(
                  'width.12'
                )};
              margin-right: calc(
                calc(${theme('width.12')} - ${theme('width.3')}) / -2
              );
            `,
          ]}
        >
          <ColumnHeader>Name</ColumnHeader>
          <ColumnHeader>Email</ColumnHeader>
          <ColumnHeader>Role</ColumnHeader>

          {employees.map(({ userId, name, email, title }, idx) => {
            return (
              <Fragment key={userId}>
                <TextInput
                  tw="col-start-1"
                  aria-label={`employee ${idx} name`}
                  value={name}
                  onChange={(name) =>
                    dispatch({ type: 'editEmployee', userId, name })
                  }
                />
                <TextInput
                  aria-label={`employee ${idx} email`}
                  type="email"
                  value={email}
                  onChange={(email) =>
                    dispatch({ type: 'editEmployee', userId, email })
                  }
                />
                <TextInput
                  aria-label={`employee ${idx} role`}
                  value={title ?? ''}
                  onChange={(title) =>
                    dispatch({ type: 'editEmployee', userId, title })
                  }
                />
                <button
                  className="group"
                  onClick={() => dispatch({ type: 'deleteEmployee', userId })}
                  css={[
                    tw`focus:outline-none w-12 h-12`,
                    css`
                      &.focus-visible > svg {
                        ${tw`ring-2 ring-copper-400`}
                      }
                    `,
                  ]}
                >
                  <DeleteIcon tw="h-3 fill-matisse-red-200 group-hover:fill-matisse-red-400 inline-flex" />
                </button>
              </Fragment>
            )
          })}
        </div>
        <SaveButton
          tw="self-end mt-10"
          variant="important"
          disabled={status === 'invalid' || clientMutation.status === 'loading'}
          onClick={() => {
            if (status === 'invalid') return
            // all employees with strings are new, so we need to remove the id field
            clientMutation.mutate(
              { id, name, employees },
              { onSuccess: onDismiss }
            )
          }}
          error={clientMutation.status === 'error'}
        >
          {clientMutation.status === 'loading'
            ? 'saving client...'
            : 'save client'}
        </SaveButton>
      </section>

      {id !== 'new' ? (
        <DeleteSection
          tw="mt-16"
          label="Verify client name"
          verificationText={name || 'Client name'}
          buttonText={
            deleteClientMutation.status === 'loading'
              ? 'deleting...'
              : 'delete client'
          }
          onDelete={() => {
            deleteClientMutation.mutate(id, { onSuccess: onDismiss })
          }}
          status={deleteClientMutation.status}
        />
      ) : null}
    </>
  )
}

function ColumnHeader(props: React.ComponentPropsWithoutRef<'th'>) {
  return <div tw="bl-text-lg text-left" {...props} />
}

// logic/hooks

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

type ActionType =
  | { type: 'updateName'; name: string }
  | {
      type: 'editEmployee'
      userId: number
      name?: string
      email?: string
      title?: string
    }
  | { type: 'addEmployee' }
  | { type: 'deleteEmployee'; userId: number }
type ClientStatus = 'invalid' | 'valid'
const clientReducer = produce(
  (client: ReturnType<typeof initClient>, action: ActionType) => {
    const { data } = client
    switch (action.type) {
      case 'updateName': {
        data.name = action.name
        break
      }
      case 'editEmployee': {
        const { userId, name, email, title } = action
        const employee = data.employees.find((e) => e.userId === userId)
        if (employee === undefined) {
          throw new Error(`No employee found with userId ${userId}`)
        }
        if (name !== undefined) {
          employee.name = name
        }
        if (email !== undefined) {
          employee.email = email
        }
        if (title !== undefined) {
          employee.title = title ?? null // title is the only nullable field
        }
        break
      }
      case 'addEmployee': {
        data.employees.push({
          userId: Date.now(),
          name: '',
          email: '',
          title: null,
        })
        break
      }
      case 'deleteEmployee': {
        const { userId } = action
        const employeeIdx = data.employees.findIndex((e) => e.userId === userId)
        if (employeeIdx === -1) {
          throw new Error(`No employee found with userId ${userId}`)
        }
        data.employees.splice(employeeIdx, 1)
        break
      }
    }

    // always check the status after making changes
    client.status = getClientStatus(data)
  }
)

function initClient(client?: ClientsData[0]) {
  const clientData: ClientBody = !client
    ? {
        id: 'new',
        name: '',
        // add one employee by default
        employees: [{ userId: Date.now(), name: '', email: '', title: null }],
      }
    : {
        id: client.id,
        name: client.name,
        employees: client.employees.map(({ userId, user, title }) => ({
          userId,
          name: user.name ?? '',
          email: user.email ?? '',
          title: title,
        })),
      }

  return { status: getClientStatus(clientData), data: clientData }
}

/**
 * Checks that the client has a name and all the employees have names and emails and that all emails are unique
 * @param clientData
 * @returns
 */
function getClientStatus(clientData: ClientBody): ClientStatus {
  if (!clientData.name) {
    return 'invalid'
  }
  if (
    clientData.employees.some(
      ({ name, email }) => !name || !email || !isValidEmail(email)
    )
  ) {
    return 'invalid'
  }
  const emails = new Set(clientData.employees.map(({ email }) => email))
  if (emails.size !== clientData.employees.length) {
    return 'invalid'
  }

  return 'valid'
}
