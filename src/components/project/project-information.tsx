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

import type { Updates } from 'pages/project/[id]'
import { useRouter } from 'next/router'

type ProjectInformationProps = {
  projectId: number
  updates: Updates
}
export function ProjectInformation({
  projectId,
  updates,
}: ProjectInformationProps) {
  const user = useAuth()
  return (
    <ProjectInformationContainer>
      <div tw="w-9/12 mx-auto py-10 space-y-8">
        <SearchBar />
        {user?.role === 'ADMIN' && (
          <IconLink pathName={`/project/${projectId}/#`}>
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add update</span>
          </IconLink>
        )}
        <UpdatesContainer>
          {updates.map(({ id, hashLink, title, body, createdAt }) => {
            return (
              <UpdateContainer key={id} id={hashLink.replace('#', '')}>
                <div tw="inline-flex items-center space-x-2">
                  {user?.role === 'ADMIN' ? (
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
      </div>
    </ProjectInformationContainer>
  )
}

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
  const onScrollRef = useRef<OnScrollFunction | null>(null)

  useEffect(() => {
    const node = containerRef.current

    if (node === null) {
      return
    }

    const onScroll = () => {
      const onScrollFunction = onScrollRef.current
      if (onScrollFunction) {
        onScrollFunction()
      }
    }

    const handleScroll = onScroll
    node.addEventListener('scroll', handleScroll)
    return () => {
      node.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

function useOnScroll(onScroll: OnScrollFunction) {
  const onScrollRef = useContext(OnScrollRefContext)
  if (onScrollRef === undefined) {
    throw new Error(
      `useOnScroll must be called in a child of ProjectInformationContainer`
    )
  }
  onScrollRef.current = onScroll
}

const UpdateRefContext = createContext<
  React.RefObject<HTMLElement> | undefined
>(undefined)

function UpdatesContainer({ children }: { children: React.ReactNode }) {
  const childrenWithRefs = useUpdateHashLinkOnScroll(children)

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

function useUpdateHashLinkOnScroll(children: React.ReactNode) {
  const router = useRouter()
  const setHashLink = useSetCurrentHashLink()
  const childrenWithRefs = useMemo(() => {
    return (
      Children.map(children, (child) => {
        return {
          child,
          ref: createRef<HTMLElement>(),
        }
      }) ?? []
    )
  }, [children])
  const [hashLinkState, setHashLinkState] = useState<'setting' | 'finished'>(
    'setting'
  )

  // set initial hash link
  let mounted = useRef(false)
  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout
    // when the updates first render, set the hashLink to the window's hash link and
    // scroll to that element, or set the hashLink to the id of the first element
    if (!mounted.current) {
      setHashLinkState('setting')
      const hashLink = window.location.hash
      if (hashLink) {
        setHashLink(hashLink)

        applyToFirstChild(childrenWithRefs, ({ node, child }) => {
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

      timeoutId = setTimeout(() => setHashLinkState('finished'), 50)
      mounted.current = true
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [childrenWithRefs, setHashLink])

  // synchronize scroll position with hash link
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleHashChange = () => {
      setHashLinkState('setting')
      setHashLink(window.location.hash ?? null)
      // might be too hacky, but simplest way to wait until the scroll is finished before resuming the scroll handler
      timeoutId = setTimeout(() => setHashLinkState('finished'), 50)
    }

    router.events.on('hashChangeComplete', handleHashChange)
    return () => {
      router.events.off('hashChangeComplete', handleHashChange)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router.events, setHashLink])

  // NOTE: This function assumes that the children are in layout order to check
  // which element is the first one whose top is >= 0
  useOnScroll(() => {
    // bail if currently setting the hash link state
    if (hashLinkState === 'setting') {
      return
    }

    const applied = applyToFirstChild(childrenWithRefs, ({ node }) => {
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

type ChildrenWithRefs = Array<{
  child: React.ReactNode
  ref: React.RefObject<HTMLElement>
}>
type MatchWithAction = (args: {
  node: HTMLElement
  child: React.ReactNode
}) => boolean

/**
 * Helper function to apply some callback to the first node that matches the condition
 */
const applyToFirstChild = (
  childrenWithRefs: ChildrenWithRefs,
  matchWithAction: MatchWithAction
) => {
  let applied = false
  for (const { ref, child } of childrenWithRefs) {
    const node = ref.current
    if (node === null) continue
    if (matchWithAction({ node, child })) {
      applied = true
      break
    }
  }
  return applied
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

function useContainerRef() {
  const containerRef = useContext(UpdateRefContext)
  if (containerRef === undefined) {
    throw new Error(
      `useContainerRef must be called in a child of UpdatesContainer `
    )
  }
  return containerRef
}

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
