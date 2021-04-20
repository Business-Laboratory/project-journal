import {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
} from 'react'

export { HashLinkProvider, useCurrentHashLink }

const HashLinkContext = createContext<string | null | undefined>(undefined)

function HashLinkProvider({ children }: { children: React.ReactNode }) {
  const [hashLink, setHashLink] = useState<{
    state: 'checking' | 'checked'
    value: null | string
  }>({ state: 'checking', value: null })

  let mounted = useRef(false)

  useLayoutEffect(() => {
    if (!mounted.current) {
      const hash = window.location.hash
      const value = hash ?? null
      setHashLink({ state: 'checked', value })
      mounted.current = true
    }
  }, [])

  // wait to render the provider and all the children until after the hash link has been checked for
  // that way the correct update can be scrolled to as soon as it loads
  if (hashLink.state === 'checking') {
    return null
  }

  return (
    <HashLinkContext.Provider value={hashLink.value}>
      {children}
    </HashLinkContext.Provider>
  )
}

function useCurrentHashLink() {
  const hashLink = useContext(HashLinkContext)
  if (hashLink === undefined) {
    throw new Error(
      `useCurrentHashLink must be called in a decedent of HasLinkProvider`
    )
  }
  return hashLink
}
