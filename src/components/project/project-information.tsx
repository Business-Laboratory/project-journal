import tw, { css } from 'twin.macro'
import {
  useLayoutEffect,
  useRef,
  createRef,
  Children,
  createContext,
  useContext,
  useMemo,
  useEffect,
} from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { SearchBar } from './index'
import { PlusIcon, EditIcon } from 'icons'
import { format } from 'date-fns'
import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'
import { useCurrentHashLink, useSetCurrentHashLink } from './hash-link-context'

import type { Updates } from 'pages/project/[id]'

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
              <UpdateContainer key={id} hashLink={hashLink}>
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
        console.log('scroll function!')
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
      {childrenWithRefs.map(({ child, ref }, idx) => {
        return (
          <UpdateRefContext.Provider
            key={getChildKey(child) ?? idx}
            value={ref}
          >
            {child}
          </UpdateRefContext.Provider>
        )
      })}
    </div>
  )
}

function useUpdateHashLinkOnScroll(children: React.ReactNode) {
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

  const setHashLink = useSetCurrentHashLink()

  // NOTE: This function assumes that the children are in layout order to check
  // which element is the first one whose top is >= 0
  useOnScroll(() => {
    let topElementId = null
    for (const { ref } of childrenWithRefs) {
      const node = ref.current
      if (node !== null) {
        const { top } = node.getBoundingClientRect()
        if (top >= 0) {
          topElementId = node.id
          break
        }
      }
    }
    setHashLink(topElementId)
  })

  return childrenWithRefs
}

/**
 * Simple function to get the key of a react child if one exists
 * @param child
 * @returns
 */
function getChildKey(child: any) {
  if (child !== null && typeof child === 'object' && 'key' in child) {
    return child.key
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
  hashLink: string
  children: React.ReactNode
}
function UpdateContainer({ hashLink, children }: UpdateContainerProps) {
  const containerRef = useContainerRef()
  useImmediatelyScrollToHashLink(containerRef, hashLink)

  return (
    <section ref={containerRef} id={hashLink.replace('#', '')} tw="space-y-6">
      {children}
    </section>
  )
}

function useImmediatelyScrollToHashLink(
  containerRef: React.MutableRefObject<HTMLElement | null>,
  hashLink: string
) {
  const currentHashLink = useCurrentHashLink()

  const mounted = useRef(false)
  useLayoutEffect(() => {
    const node = containerRef.current
    if (!mounted.current && node !== null) {
      if (currentHashLink === hashLink) {
        node.scrollIntoView()
      }
      mounted.current = true
    }
  }, [containerRef, currentHashLink, hashLink])
}
