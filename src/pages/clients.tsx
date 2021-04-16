// Alternate Admin Home view that displays clients
import 'twin.macro'
import Head from 'next/head'
import { PlusIcon, EditIcon } from 'icons'
import { Fragment } from 'react'
import { QueryFunction, useQuery } from 'react-query'
import { ClientsData } from './api/clients'
import { IconLink } from '@components/icon-link'

export default function Clients() {
  const { status, data } = useQuery('clients', fetchClients)

  // TODO: figure out the loading state
  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    return (
      <h1 tw="bl-text-3xl max-w-prose text-center text-matisse-red-200">
        Something went wrong
      </h1>
    )
  }

  return (
    <>
      <Head>
        <title>Clients | Project Journal</title>
      </Head>
      <main tw="pt-10 max-w-max mx-auto space-y-8">
        <IconLink pathName="#">
          <PlusIcon tw="w-6 h-6" />
          <span tw="bl-text-2xl">Add client</span>
        </IconLink>
        {data?.map(({ id, name, employees }) => (
          <div key={id} tw="space-y-4">
            <IconLink pathName="#">
              <EditIcon tw="w-6 h-6" />
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
        )) ?? null}
      </main>
    </>
  )
}

const fetchClients: QueryFunction<ClientsData> = async () => {
  const res = await fetch(`/api/clients`)
  if (!res.ok) {
    throw new Error(`Something went wrong fetching clients`)
  }
  return res.json()
}
