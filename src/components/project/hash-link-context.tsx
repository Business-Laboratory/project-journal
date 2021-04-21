import { useRouter } from 'next/router'
import {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from 'react'

export { HashLinkProvider, useSetCurrentHashLink, useCurrentHashLink }

type SetHashLink = (hashLink: string | null) => void
const SetHashLinkContext = createContext<SetHashLink | undefined>(undefined)
const HashLinkContext = createContext<string | null | undefined>(undefined)

function HashLinkProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hashLink, setHashLink] = useState<{
    state: 'checking' | 'checked'
    value: null | string
  }>({ state: 'checking', value: null })

  let mounted = useRef(false)

  useLayoutEffect(() => {
    if (!mounted.current) {
      setHashLink({ state: 'checked', value: getWindowHash() })
      mounted.current = true
    }
  }, [])

  const handleSetHashLink = useCallback((value: string | null) => {
    setHashLink((prev) => ({ ...prev, value }))
  }, [])

  // update the current hash if the route's hash changes
  useEffect(() => {
    const handleHashChange = () => {
      console.log('the hash changed!')
      handleSetHashLink(getWindowHash())
    }

    router.events.on('hashChangeComplete', handleHashChange)
    return () => {
      router.events.off('hashChangeComplete', handleHashChange)
    }
  }, [router.events, handleSetHashLink])

  // wait to render the provider and all the children until after the hash link has been checked for
  // that way the correct update can be scrolled to as soon as it loads
  if (hashLink.state === 'checking') {
    return null
  }

  return (
    <SetHashLinkContext.Provider value={handleSetHashLink}>
      <HashLinkContext.Provider value={hashLink.value}>
        {children}
      </HashLinkContext.Provider>
    </SetHashLinkContext.Provider>
  )
}

function getWindowHash() {
  const hash = window.location.hash
  return hash ?? null
}

function useSetCurrentHashLink() {
  const setHashLink = useContext(SetHashLinkContext)
  if (setHashLink === undefined) {
    throw new Error(
      `useSetCurrentHashLink must be called in a decedent of SetHashLinkProvider`
    )
  }
  return setHashLink
}

function useCurrentHashLink() {
  const hashLink = useContext(HashLinkContext)
  if (hashLink === undefined) {
    throw new Error(
      `useCurrentHashLink must be called in a decedent of HashLinkProvider`
    )
  }
  return hashLink
}
