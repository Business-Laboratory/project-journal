// TODO: replace with the real thing, this is temporary

import 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import { signOut } from 'next-auth/client'
import { useAuth } from '@components/auth-context'

export default function Home() {
  const auth = useAuth()

  return (
    <>
      <Head>
        <title>Temporary Home Page</title>
      </Head>

      <div tw="relative flex flex-col items-center mx-auto space-y-16 max-w-max top-24">
        {auth ? (
          <>
            <h1 tw="bl-text-4xl">
              Welcome {auth.user.name ?? 'unidentified user'}
            </h1>
            <button
              tw="py-2 px-8 border-2 w-64 border-copper-400 bl-text-lg hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <h1 tw="bl-text-4xl">Please login!</h1>
            <Link href="/login" passHref>
              <button tw="py-2 px-8 border-2 w-64 border-copper-400 bl-text-lg hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)">
                Log in
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
