import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/client'
import type { Session } from 'next-auth'
import { useRouter } from 'next/router'

const AuthContext = createContext<Session | null | undefined>(undefined)

export { AuthProvider, useAuth }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, loading] = useSession()
  // state to keep track of if the route has been checked or not, so we don't
  // flash teh wrong screen unintentionally
  const [routeCheck, setRouteCheck] = useState<'unchecked' | 'checked'>(
    'unchecked'
  )
  const router = useRouter()

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
