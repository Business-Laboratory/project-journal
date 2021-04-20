import { createContext, useContext, useState, useEffect, useRef } from 'react'

export { HashLinkProvider, useCurrentHashLink }

const HashLinkContext = createContext<string | null | undefined>(undefined)

function HashLinkProvider({ children }: { children: React.ReactNode }) {
  const [hashLink, setHashLink] = useState('')

  let mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      const hash = window.location.hash
      setHashLink(hash ?? null)
    }
    mounted.current = true
  }, [])

  return (
    <HashLinkContext.Provider value={hashLink}>
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
