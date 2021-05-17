import { css } from 'twin.macro'
import Header from 'next/head'
import { QueryStatus } from 'react-query'
import React, { memo } from 'react'
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
import { useAuth } from '@components/auth-context'
import { useUpdates } from '@queries/useUpdates'

import type { Project } from '@queries/useProject'
import type { Role } from '@prisma/client'

export default function Project() {
  const { query } = useRouter()
  const { id } = query
  // doesn't render anything when id is undefined, which is the case when
  // next tries to build the page statically
  if (id === undefined) {
    return null
  }

  const numberId = Number(id)
  if (!id || Array.isArray(id)) {
    throw new Error(`Invalid id: ${id}`)
  }

  if (Number.isNaN(numberId)) {
    return <ExistingProject projectId={numberId} />
  }

  if (id === 'new') {
    return <NewProject />
  }

  throw new Error(`Invalid id: ${id}`)
}

function ExistingProject({ projectId }: { projectId: number }) {
  const { data, status } = useProject(projectId)
  // we need to be loading all of the loading indicators if the user hasn't loaded, since it effects the layout
  const user = useAuth()
  const userRole = user?.role ?? null

  return (
    <>
      <Header>
        <title>{getProjectTitle(status, data?.name ?? undefined)}</title>
      </Header>
      <Wrapper>
        <TimelineAndProjectInformation
          projectId={projectId}
          userRole={userRole}
        />
        {userRole === null || status !== 'success' || data === undefined ? (
          <LoadingSummary status={status} />
        ) : (
          <Summary projectId={projectId} userRole={userRole} project={data} />
        )}
      </Wrapper>
    </>
  )
}

const emptyProject = {
  imageUrl: null,
  name: null,
  clientId: null,
  client: null,
  team: [],
  summary: null,
}

function NewProject() {
  // we need to be loading all of the loading indicators if the user hasn't loaded, since it effects the layout
  const user = useAuth()
  const userRole = user?.role ?? null

  return (
    <>
      <Header>
        <title>New Project | Project Journal</title>
      </Header>
      <Wrapper>
        <HashLinkProvider>
          {userRole === null ? (
            <>
              <LoadingTimeline />
              <LoadingProjectInformation status={'loading'} />
            </>
          ) : (
            <>
              <Timeline updates={[]} />
              <ProjectInformation
                projectId={'new'}
                userRole={userRole}
                updates={[]}
              />
            </>
          )}
        </HashLinkProvider>
        {userRole === null ? (
          <LoadingSummary status={'loading'} />
        ) : (
          <Summary
            projectId={'new'}
            userRole={userRole}
            project={emptyProject}
          />
        )}
      </Wrapper>
    </>
  )
}

// Auxillary components

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <main
      tw="fixed overflow-hidden h-full w-full"
      css={css`
        height: calc(100% - ${appBarHeight});
        display: grid;
        grid-template-columns: 80px auto 500px;
      `}
    >
      {children}
    </main>
  )
}

type TimelineAndProjectInformationProps = {
  projectId: number
  userRole: Role | null
}
// this function is memoized because it is simplest to render it inside of another function that has data
// that doesn't directly relate to it, however we don't want this function to rerender in those cases
const TimelineAndProjectInformation = memo(
  function TimelineAndProjectInformation({
    projectId,
    userRole,
  }: TimelineAndProjectInformationProps) {
    const { data, status } = useUpdates(projectId)
    // convert the string dates to dates and add the hash for the links
    const updates = data ?? []

    return (
      <HashLinkProvider>
        {userRole === null || status !== 'success' || data === undefined ? (
          <>
            <LoadingTimeline />
            <LoadingProjectInformation status={status} />
          </>
        ) : (
          <>
            <Timeline updates={updates} />
            <ProjectInformation
              projectId={projectId}
              userRole={userRole}
              updates={updates}
            />
          </>
        )}
      </HashLinkProvider>
    )
  }
)

function getProjectTitle(status: QueryStatus, name?: string) {
  if (status === 'loading') {
    return 'Loading Project...'
  }

  if (status === 'error') {
    return 'Project Failed To Load'
  }

  return `${name ?? 'Untitled Project'} | Project Journal`
}
