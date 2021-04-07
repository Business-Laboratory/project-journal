import 'twin.macro'
import { createContext, useContext, useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { QueryStatus, useQuery } from 'react-query'

import { Button } from './button'
import type { QueryFunction } from 'react-query'
import type { UserData } from 'pages/api/user'

const AuthContext = createContext<UserData | null | undefined>(undefined)

export { AuthProvider, useAuth }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useUserQuery()

  // TODO: add loading screen instead of bailing
  if (user.status === 'loading') {
    return null
  }

  if (user.status === 'error') {
    let message = 'Something went wrong'
    if (user.error instanceof Error) {
      message = user.error.message
    }

    return (
      <div tw=" mx-auto px-4 max-w-max my-10 text-gray-yellow-600 flex flex-col items-center space-y-8">
        <h1 tw="bl-text-4xl text-center">{message}</h1>
        <Button
          tw="max-w-fit"
          onClick={() => {
            signOut({
              callbackUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL}/login`,
            })
          }}
        >
          Login with another account
        </Button>
      </div>
    )
  }

  console.log(user.data)

  return (
    <AuthContext.Provider value={user.data ?? null}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const auth = useContext(AuthContext)
  if (auth === undefined) {
    throw new Error(`useAuth must be used inside a child of AuthProvider`)
  }
  return auth
}

function useUserQuery() {
  const [session, loading] = useSession()
  const routeCheck = useRedirect(session, loading)

  const email = session?.user.email ?? ''
  const user = useQuery(['user', { email }], fetchUser, {
    enabled: Boolean(email), // only fetch the user's data if they're logged in with an email
  })

  // next-auth loading or any redirecting means that the data is still loading
  const status: QueryStatus =
    loading || routeCheck === 'unchecked' ? 'loading' : user.status

  return { ...user, status }
}

function useRedirect(...args: ReturnType<typeof useSession>) {
  // state to keep track of if the route has been checked or not, so we don't
  // flash the wrong screen unintentionally
  const [routeCheck, setRouteCheck] = useState<'unchecked' | 'checked'>(
    'unchecked'
  )
  const router = useRouter()
  const [session, loading] = args

  useEffect(() => {
    // perform checks after the user session has finished loading
    if (loading) return

    // unauthenticated users must login via the login page
    // authenticated users are not allowed on the login page
    if (!session && router.pathname !== '/login') {
      router.replace('/login')
    } else if (session && router.pathname === '/login') {
      router.replace('/')
    } else {
      setRouteCheck('checked')
    }
    setRouteCheck('checked')
  }, [loading, router, session])

  return routeCheck
}

type UserQueryKey = ['user', { email: string }]
// async function fetchUser() {
const fetchUser: QueryFunction<UserData, UserQueryKey> = async ({
  queryKey,
}) => {
  const [, { email }] = queryKey

  if (!email) {
    throw new Error(`No email provided`)
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (res.status === 401) {
    throw new Error(`User is not authorized to use this app`)
  } else if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
