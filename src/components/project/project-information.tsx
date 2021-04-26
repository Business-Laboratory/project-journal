import tw, { css } from 'twin.macro'
import React, {
  useLayoutEffect,
  useRef,
  createRef,
  Children,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { SearchBar } from './index'
import { PlusIcon, EditIcon } from 'icons'
import { format } from 'date-fns'
import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'
import { useSetCurrentHashLink } from './hash-link-context'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { useWaitTimer } from '@utils/use-wait-timer'

import type { Updates } from 'pages/project/[id]'
import { useRouter } from 'next/router'

// Main component

type ProjectInformationProps = {
  projectId: number
  updates: Updates
  status: string
}
export function ProjectInformation({
  projectId,
  updates,
  status,
}: ProjectInformationProps) {
  const user = useAuth()
  return (
    <ProjectInformationContainer>
      <div tw="w-9/12 mx-auto py-10 space-y-8">
        <SearchBar updates={updates} status={status} />
        {user?.role === 'ADMIN' && (
          <IconLink pathName={`/project/${projectId}/#`}>
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add update</span>
          </IconLink>
        )}
        <UpdatesList
          updates={updates}
          role={user?.role}
          projectId={projectId}
          status={status}
        />
      </div>
    </ProjectInformationContainer>
  )
}

// Container which handles scroll events

export type OnScrollFunction = () => void
const OnScrollRefContext = createContext<
  React.MutableRefObject<OnScrollFunction | null> | undefined
>(undefined)

function ProjectInformationContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLElement | null>(null)
  const onScrollRef = useOnScrollEventListenerRef(containerRef)

  return (
    <article
      ref={containerRef}
      css={[
        tw`h-full overflow-y-auto border-r-2 border-gray-yellow-300`,
        // applying these because the timeline acts as the scrollbar
        // this might be a bad idea accessibility-wise  ¯\_(ツ)_/¯
        css`
          ::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `,
      ]}
    >
      <OnScrollRefContext.Provider value={onScrollRef}>
        {children}
      </OnScrollRefContext.Provider>
    </article>
  )
}

function useOnScrollEventListenerRef(
  containerRef: React.MutableRefObject<HTMLElement | null>
) {
  const onScrollRef = useRef<OnScrollFunction | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (node === null) {
      return
    }

    const handleScroll = () => {
      const onScrollFunction = onScrollRef.current
      if (onScrollFunction) {
        onScrollFunction()
      }
    }
    node.addEventListener('scroll', handleScroll)
    return () => {
      node.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef])

  return onScrollRef
}

function useOnScroll(onScroll: OnScrollFunction) {
  const onScrollRef = useContext(OnScrollRefContext)
  if (onScrollRef === undefined) {
    throw new Error(
      `useOnScroll must be called in a child of ProjectInformationContainer`
    )
  }
  onScrollRef.current = onScroll
}

// container for all of the updates which provisions refs for each of the children through context providers
// and also handles all of the complex logic for synchronizing the scroll with the hash links

const UpdateRefContext = createContext<
  React.RefObject<HTMLElement> | undefined
>(undefined)

function UpdatesContainer({ children }: { children: React.ReactNode }) {
  const childrenWithRefs = useChildrenWithRefs(children)
  useSynchronizeHashLinkWithScroll(childrenWithRefs)

  return (
    <div tw="space-y-12">
      {childrenWithRefs.map(({ child, ref }, idx) => (
        <UpdateRefContext.Provider key={getChildKey(child) ?? idx} value={ref}>
          {child}
        </UpdateRefContext.Provider>
      ))}
    </div>
  )
}

/**
 * Simple function to get the key of a react child if one exists
 * @param child
 * @returns
 */
function getChildKey(child: any) {
  if (child !== null && typeof child === 'object' && 'key' in child) {
    return child?.key
  } else {
    return undefined
  }
}

function useChildrenWithRefs(children: React.ReactNode) {
  return useMemo(() => {
    return (
      Children.map(children, (child) => {
        return {
          child,
          ref: createRef<HTMLElement>(),
        }
      }) ?? []
    )
  }, [children])
}
type ChildrenWithRefs = ReturnType<typeof useChildrenWithRefs>

function useSynchronizeHashLinkWithScroll(childrenWithRefs: ChildrenWithRefs) {
  const syncState = useSyncHashWithUrl(childrenWithRefs)
  const setHashLink = useSetCurrentHashLink()

  useOnScroll(() => {
    // bail if currently syncing the hash link state
    if (syncState === 'syncing') {
      return
    }

    const applied = applyToFirstChild(childrenWithRefs, (node) => {
      const { top } = node.getBoundingClientRect()
      const cond = top >= 0
      if (cond) {
        setHashLink(`#${node.id}`)
      }
      return cond
    })
    if (!applied) {
      setHashLink(null)
    }
  })

  return childrenWithRefs
}

function useSyncHashWithUrl(childrenWithRefs: ChildrenWithRefs) {
  const router = useRouter()
  const setHashLink = useSetCurrentHashLink()
  const [syncState, setSyncState] = useState<'syncing' | 'synced'>('syncing')

  // set initial hash link
  // when the updates first render, set the hashLink to the window's hash link and
  // scroll to that element, or set the hashLink to the id of the first element
  let mounted = useRef(false)
  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (!mounted.current) {
      setSyncState('syncing')
      const hashLink = window.location.hash
      if (hashLink) {
        setHashLink(hashLink)

        applyToFirstChild(childrenWithRefs, (node) => {
          const childId = node.id
          const cond = childId === hashLink.replace('#', '')
          if (cond) {
            node.scrollIntoView()
          }
          return cond
        })
      } else {
        const firstChildId = childrenWithRefs[0]?.ref.current?.id
        if (firstChildId) {
          setHashLink(`#${firstChildId}`)
        } else {
          setHashLink(null)
        }
      }

      timeoutId = setTimeout(() => setSyncState('synced'), 50)
      mounted.current = true
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [childrenWithRefs, setHashLink])

  // synchronize window's hash with internal hashLink
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleHashChange = () => {
      setSyncState('syncing')
      setHashLink(window.location.hash ?? null)
      // might be too hacky, but simplest way to wait until the scroll is synced before resuming the scroll handler
      timeoutId = setTimeout(() => setSyncState('synced'), 50)
    }

    router.events.on('hashChangeComplete', handleHashChange)
    return () => {
      router.events.off('hashChangeComplete', handleHashChange)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router.events, setHashLink])

  return syncState
}

/**
 * Helper function to apply some callback to the first node that matches the condition
 * NOTE: This function assumes that the children are in layout order to check
 * which element is the first one whose top is >= 0
 */
const applyToFirstChild = (
  childrenWithRefs: ChildrenWithRefs,
  matchWithAction: (node: HTMLElement) => boolean
) => {
  let applied = false
  for (const { ref } of childrenWithRefs) {
    const node = ref.current
    if (node === null) continue
    if (matchWithAction(node)) {
      applied = true
      break
    }
  }
  return applied
}

// List of all updates

type UpdatesListProps = {
  updates: Updates
  role: string | undefined | null
  projectId: number
  status: string
}
function UpdatesList({ updates, role, projectId, status }: UpdatesListProps) {
  const wait = useWaitTimer()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load updates" />
  }

  if (wait === 'finished' && status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading updates" />
  }

  return updates?.length > 0 ? (
    <UpdatesContainer>
      {updates.map(({ id, hashLink, title, body, createdAt }) => {
        return (
          <UpdateContainer key={id} id={hashLink.replace('#', '')}>
            <div tw="inline-flex items-center space-x-2">
              {role === 'ADMIN' ? (
                <IconLink pathName={`/project/${projectId}/#`}>
                  <EditIcon tw="w-6 h-6" />
                  <span tw="bl-text-3xl">{title}</span>
                </IconLink>
              ) : (
                <span tw="bl-text-3xl">{title}</span>
              )}

              <span tw="bl-text-sm self-end pb-2">
                {format(createdAt, 'M/d/yy')}
              </span>
            </div>
            <ReactMarkdown plugins={[gfm]}>{body}</ReactMarkdown>
          </UpdateContainer>
        )
      })}
    </UpdatesContainer>
  ) : status === 'success' ? (
    <h1 tw="bl-text-3xl max-w-prose">No updates have been added</h1>
  ) : null
}

// update container, which gets the hook provisioned for it and applies it to the top level element

type UpdateContainerProps = {
  id: string
  children: React.ReactNode
}
function UpdateContainer({ id, children }: UpdateContainerProps) {
  const containerRef = useContainerRef()

  return (
    <section ref={containerRef} id={id} tw="space-y-6">
      {children}
    </section>
  )
}

function useContainerRef() {
  const containerRef = useContext(UpdateRefContext)
  if (containerRef === undefined) {
    throw new Error(
      `useContainerRef must be called in a child of UpdatesContainer `
    )
  }
  return containerRef
}
