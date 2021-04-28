import 'twin.macro'
import { createContext, useContext, useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { Button } from '@components/button'
import { useUser } from '@queries/useUser'

import type { QueryStatus } from 'react-query'
import type { UserData } from 'pages/api/user'

// this is typed out because I was having trouble removing the nulls from
// the data that comes from useSession
type User = UserData & {
  email: string | null
  name: string | null
  image: string | null
}
const AuthContext = createContext<User | null | undefined>(undefined)

export { AuthProvider, useAuth }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useGetUser()

  if (user.status === 'error') {
    let message = 'Something went wrong'
    if (user.error instanceof Error) {
      message = user.error.message
    }

    return (
      <div tw="mx-auto px-4 max-w-max flex flex-col items-center space-y-8">
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

function useGetUser() {
  const [session, loading] = useSession()
  const routeCheck = useRedirect(session, loading)

  const user = useUser(session?.user?.email ?? '')

  // next-auth loading or any redirecting means that the data is still loading
  const status: QueryStatus =
    loading || routeCheck === 'unchecked' ? 'loading' : user.status

  let data: User | undefined = undefined
  if (session?.user && user?.data) {
    const { email = '', name = '', image = '' } = session.user
    const { id, role } = user.data
    data = { email, name, image, id, role }
  }

  return { ...user, data, status }
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
