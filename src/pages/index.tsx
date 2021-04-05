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
        {auth !== null ? (
          <>
            <div tw="flex items-center space-x-4">
              {auth.user.image ? (
                <div tw="w-12 h-12 rounded-full overflow-hidden">
                  <img src={auth.user.image} alt="" />
                </div>
              ) : null}{' '}
              <h1 tw="bl-text-4xl">
                Welcome {auth.user.name ?? 'unidentified user'}
              </h1>
            </div>
            <button
              tw="py-2 px-8 border-2 w-64 border-copper-400 bl-text-lg hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)"
              // sing out and go to the login page
              onClick={() => {
                signOut({
                  callbackUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL}/login`,
                })
              }}
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
