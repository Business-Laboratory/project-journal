import { css } from 'twin.macro'
import { useMemo } from 'react'
import Header from 'next/head'
import { useRouter } from 'next/router'

import {
  Timeline,
  ProjectInformation,
  Summary,
  HashLinkProvider,
  LoadingSummary,
  LoadingTimeline,
  LoadingProjectInformation,
} from '@components/project'
import { appBarHeight } from '@components/app-bar'
import { useProject } from '@queries/useProject'

import type { ProjectData } from 'pages/api/project'
import { QueryStatus } from 'react-query'
import { useAuth } from '@components/auth-context'

export type Updates = ReturnType<typeof useUpdates>

export default function Project() {
  const { query } = useRouter()
  const { id } = query
  // doesn't render anything when id is undefined, which is the case when
  // next tries to build the page statically
  if (id === undefined) {
    return null
  }

  const numberId = Number(id)
  if (!id || Array.isArray(id) || Number.isNaN(numberId)) {
    throw new Error(`Invalid id: ${id}`)
  }

  return <ProjectById id={numberId} />
}

function ProjectById({ id }: { id: number }) {
  const { data, status } = useProject(Number(id))
  // we need to be loading all of the loading indicators if the user hasn't loaded, since it effects the layout
  const user = useAuth()
  // convert the string dates to dates and add the hash for the links
  const updates = useUpdates(data?.updates ?? [])
  const userRole = user?.role ?? null

  return (
    <>
      <Header>
        <title>{getProjectTitle(status, data?.name ?? undefined)}</title>
      </Header>
      <main
        tw="fixed overflow-hidden h-full w-full"
        css={css`
          height: calc(100% - ${appBarHeight});
          display: grid;
          grid-template-columns: 80px auto 500px;
        `}
      >
        {userRole === null || status !== 'success' || data === undefined ? (
          <>
            <HashLinkProvider>
              <LoadingTimeline />
              <LoadingProjectInformation
                projectId={id}
                status={status}
                userRole={userRole}
              />
            </HashLinkProvider>
            <LoadingSummary status={status} userRole={userRole} />
          </>
        ) : (
          <>
            <HashLinkProvider>
              <Timeline updates={updates} />
              <ProjectInformation
                projectId={Number(id)}
                userRole={userRole}
                updates={updates}
              />
            </HashLinkProvider>
            <Summary
              projectId={Number(id)}
              userRole={userRole}
              name={data.name ?? ''}
              imageUrl={data.imageUrl ?? ''}
              summary={data.summary}
              clientName={data.client?.name ?? ''}
              clientEmployees={
                data.client?.employees.map(({ user }) => user) ?? []
              }
              team={data.team}
            />
          </>
        )}
      </main>
    </>
  )
}

function getProjectTitle(status: QueryStatus, name?: string) {
  if (status === 'loading') {
    return 'Loading Project...'
  }

  if (status === 'error') {
    return 'Project Failed To Load'
  }

  return `${name ?? 'Untitled Project'} | Project Journal`
}

function useUpdates(originalUpdates: ProjectData['updates']) {
  return useMemo(
    () =>
      originalUpdates.map((update) => ({
        ...update,
        createdAt: new Date(update.createdAt),
        updatedAt: new Date(update.updatedAt),
        hashLink: `#update-${update.id}`,
      })) ?? [],
    [originalUpdates]
  )
}
