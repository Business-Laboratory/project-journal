// Assign and remove admin users
import 'twin.macro'
import Head from 'next/head'
import { IconLink } from '@components/icon-link'
import { EditIcon } from 'icons'

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
        {/* Add grid of admins */}
      </main>
    </>
  )
}
