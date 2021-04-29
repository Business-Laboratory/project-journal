// Assign and remove admin users
import 'twin.macro'
import Head from 'next/head'
import { IconLink } from '@components/icon-link'
import { EditIcon } from 'icons'
import { AdminsData } from './api/admins'
import { QueryFunction, useQuery } from 'react-query'
import { useWaitTimer } from '@utils/use-wait-timer'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'

export default function DefaultComponent() {
  return (
    <>
      <Head>
        <title>Admins | Project Journal</title>
      </Head>
      <main tw="pt-10 w-9/12 min-w-max mx-auto space-y-8">
        <IconLink pathName="#">
          <EditIcon tw="w-6 h-6 fill-copper-300" />
          <span tw="bl-text-3xl">Admins</span>
        </IconLink>
        <AdminsGrid />
      </main>
    </>
  )
}

function AdminsGrid() {
  const { data, status } = useQuery('users', fetchAdmins)
  console.log(data)
  const wait = useWaitTimer()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load admins" />
  }

  if (wait === 'finished' && status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading admins" />
  }

  const admins = data ?? []

  return admins.length > 0 ? (
    <p>I'm a grid</p>
  ) : status === 'success' ? (
    <h1 tw="bl-text-3xl max-w-prose text-center">No admins are available</h1>
  ) : null
}

const fetchAdmins: QueryFunction<AdminsData> = async () => {
  const res = await fetch(`/api/admins`)
  if (!res.ok) {
    throw new Error(`Something went wrong fetching admins`)
  }
  return res.json()
}
