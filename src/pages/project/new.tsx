import { css } from 'twin.macro'
import Header from 'next/head'
// import { QueryStatus } from 'react-query'
import { memo } from 'react'
// import { useRouter } from 'next/router'

import {
  Timeline,
  ProjectInformation,
  // Summary,
  HashLinkProvider,
  // LoadingSummary,
  LoadingTimeline,
  LoadingProjectInformation,
} from '@components/project'
import { appBarHeight } from '@components/app-bar'

import { useAuth } from '@components/auth-context'

// import type { Project } from '@queries/useProject'
import type { Updates } from '@queries/useUpdates'
import type { Role } from '@prisma/client'

export default function NewProject() {
  // const data: Project = {
  //   imageUrl: null,
  //   id: -1, // TODO: change
  //   name: null,
  //   clientId: null,
  //   client: null,
  //   team: [],
  //   summary: null,
  // }
  // we need to be loading all of the loading indicators if the user hasn't loaded, since it effects the layout
  const user = useAuth()
  const userRole = user?.role ?? null

  return (
    <>
      <Header>
        <title>New Project | Project Journal</title>
      </Header>
      <main
        tw="fixed overflow-hidden h-full w-full"
        css={css`
          height: calc(100% - ${appBarHeight});
          display: grid;
          grid-template-columns: 80px auto 500px;
        `}
      >
        <TimelineAndProjectInformation projectId={'new'} userRole={userRole} />
        {/* <Summary projectId={projectId} userRole={userRole} project={data} /> */}
      </main>
    </>
  )
}

type TimelineAndProjectInformationProps = {
  projectId: 'new'
  userRole: Role | null
}
// this function is memoized because it is simplest to render it inside of another function that has data
// that doesn't directly relate to it, however we don't want this function to rerender in those cases
const TimelineAndProjectInformation = memo(
  function TimelineAndProjectInformation({
    projectId,
    userRole,
  }: TimelineAndProjectInformationProps) {
    const data: Updates = []
    // convert the string dates to dates and add the hash for the links
    const updates = data ?? []

    return (
      <HashLinkProvider>
        {userRole === null ? (
          <>
            <LoadingTimeline />
            <LoadingProjectInformation status={'loading'} />
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
