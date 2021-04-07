import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/client'
import type { Session } from 'next-auth'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import type { QueryFunction } from 'react-query'
import type { UserData } from 'pages/api/user'

const AuthContext = createContext<Session | null | undefined>(undefined)

export { AuthProvider, useAuth }

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
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, loading] = useSession()
  // state to keep track of if the route has been checked or not, so we don't
  // flash teh wrong screen unintentionally
  const [routeCheck, setRouteCheck] = useState<'unchecked' | 'checked'>(
    'unchecked'
  )
  const router = useRouter()

  const email = session?.user.email ?? ''
  const user = useQuery(['user', { email }], fetchUser, {
    enabled: Boolean(email), // only fetch the user's data if they're logged in with an email
  })

  if (user.status === 'success') {
    console.log(user.data.updatedAt)
  }
  // console.log(session)

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
  }, [loading, router, session])

  // TODO: add loading screen instead of bailing
  if (loading || routeCheck === 'unchecked') return null

  return (
    <AuthContext.Provider value={session ?? null}>
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
