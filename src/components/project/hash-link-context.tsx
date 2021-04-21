import { createContext, useContext, useState } from 'react'

export { HashLinkProvider, useSetCurrentHashLink, useCurrentHashLink }

type SetHashLink = (hashLink: string | null) => void
const SetHashLinkContext = createContext<SetHashLink | undefined>(undefined)
const HashLinkContext = createContext<string | null | undefined>(undefined)

function HashLinkProvider({ children }: { children: React.ReactNode }) {
  const [hashLink, setHashLink] = useState<null | string>(null)

  return (
    <SetHashLinkContext.Provider value={setHashLink}>
      <HashLinkContext.Provider value={hashLink}>
        {children}
      </HashLinkContext.Provider>
    </SetHashLinkContext.Provider>
  )
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
