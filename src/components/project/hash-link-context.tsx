import { createContext, useContext } from 'react'

export { HashLinkProvider, useCurrentHashLink }

const HashLinkContext = createContext<string | undefined>(undefined)

function HashLinkProvider({ children }: { children: React.ReactNode }) {
  return (
    <HashLinkContext.Provider value={'update-1'}>
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
