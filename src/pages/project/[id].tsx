import { css } from 'twin.macro'
import { useMemo } from 'react'
import Header from 'next/head'
import { useRouter } from 'next/router'

import {
  Timeline,
  ProjectInformation,
  Summary,
  HashLinkProvider,
} from '@components/project'
import { appBarHeight } from '@components/app-bar'
import { useProject } from '@queries/useProject'

import type { ProjectData } from 'pages/api/project'

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
  // convert the string dates to dates and add the hash for the links
  const updates = useUpdates(data?.updates ?? [])

  const project = data ?? null

  if (project === null) return null

  return (
    <>
      <Header>
        <title>{project.name ?? 'New Project'} | Project Journal</title>
      </Header>
      <main
        tw="fixed overflow-hidden h-full w-full"
        css={css`
          height: calc(100% - ${appBarHeight});
          display: grid;
          grid-template-columns: 80px auto 500px;
        `}
      >
        <HashLinkProvider>
          <Timeline updates={updates} status={status} />
          <ProjectInformation
            projectId={Number(id)}
            updates={updates}
            status={status}
          />
        </HashLinkProvider>
        <Summary
          projectId={Number(id)}
          name={project.name ?? ''}
          imageUrl={project.imageUrl ?? ''}
          summary={project.summary}
          clientName={project.client?.name ?? ''}
          clientEmployees={
            project.client?.employees.map(({ user }) => user) ?? []
          }
          team={project.team}
          status={status}
        />
      </main>
    </>
  )
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
