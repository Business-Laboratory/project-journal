// Assign and remove admin users
import tw, { css } from 'twin.macro'
import Head from 'next/head'
import { Fragment } from 'react'
import { IconLink } from '@components/icon-link'
import { EditIcon } from 'icons'
import { AdminsData } from './api/admins'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { AdminsModal, createEditAdminsPath } from '@components/admins-modal'
import { useAdmins } from '@queries/useAdmins'

export default function DefaultComponent() {
  return (
    <>
      <Head>
        <title>Admins | Project Journal</title>
      </Head>
      <main tw="pt-10 px-16 max-w-max mx-auto space-y-8">
        <AdminsContent />
      </main>
    </>
  )
}

function AdminsContent() {
  const { data, status } = useAdmins()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load admins" />
  }

  if (status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading admins" />
  }

  const admins = data ?? []

  return admins.length > 0 ? (
    <>
      <ContentTitle currentAdmins={admins} />
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
    </>
  ) : status === 'success' ? (
    <>
      <ContentTitle currentAdmins={admins} />
      <h1 tw="bl-text-3xl max-w-prose text-center">No admins are available</h1>
    </>
  ) : null
}

type ContentTitleProps = {
  currentAdmins: AdminsData
}
function ContentTitle({ currentAdmins }: ContentTitleProps) {
  return (
    <>
      <IconLink href={createEditAdminsPath()}>
        <EditIcon tw="w-6 h-6 fill-copper-300" />
        <span tw="bl-text-3xl">Admins</span>
      </IconLink>
      <AdminsModal currentAdmins={currentAdmins} />
    </>
  )
}
