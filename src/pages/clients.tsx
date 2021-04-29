// Alternate Admin Home view that displays clients
import 'twin.macro'
import { Fragment } from 'react'
import Head from 'next/head'
import { PlusIcon, EditIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { useWaitTimer } from '@utils/use-wait-timer'
import { useClients } from '@queries/useClients'

export default function Clients() {
  return (
    <>
      <Head>
        <title>Clients | Project Journal</title>
      </Head>
      <main tw="pt-10 w-9/12 min-w-max mx-auto space-y-8">
        <IconLink pathName="#">
          <PlusIcon tw="w-6 h-6 fill-copper-300" />
          <span tw="bl-text-2xl">Add client</span>
        </IconLink>
        <ClientList />
      </main>
    </>
  )
}

function ClientList() {
  const { data, status } = useClients()

  const wait = useWaitTimer()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load clients" />
  }

  if (wait === 'finished' && status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading clients" />
  }

  const clients = data ?? []

  return clients.length > 0 ? (
    <>
      {clients.map(({ id, name, employees }) => (
        <div key={id} tw="space-y-4">
          <IconLink pathName="#">
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
      ))}
    </>
  ) : status === 'success' ? (
    <h1 tw="bl-text-3xl max-w-prose text-center">No clients are available</h1>
  ) : null
}
