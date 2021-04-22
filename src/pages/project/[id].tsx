import { css } from 'twin.macro'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import Header from 'next/head'
import { useRouter } from 'next/router'

import {
  Timeline,
  ProjectInformation,
  Summary,
  HashLinkProvider,
} from '@components/project'
import { appBarHeight } from '@components/app-bar'

import type { QueryFunction } from 'react-query'
import type { ProjectData } from '../api/project'
import type { Update } from '@prisma/client'

export type Updates = Array<Update & { hashLink: string }>

export default function Project() {
  const { query } = useRouter()
  const { id } = query
  if (id === undefined || Array.isArray(id)) {
    throw new Error(`Invalid id: ${id}`)
  }
  const { data, status } = useQuery(
    ['project', { id: Number(id) }],
    fetchProject
  )

  //convert the string dates to dates and add the hash for the links
  const updates = useMemo(
    () =>
      data?.updates.map((update) => ({
        ...update,
        createdAt: new Date(update.createdAt),
        updatedAt: new Date(update.updatedAt),
        hashLink: `#update-${update.id}`,
      })) ?? [],
    [data]
  )

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

type ProjectQueryKey = ['project', { id: number }]
const fetchProject: QueryFunction<ProjectData, ProjectQueryKey> = async ({
  queryKey,
}) => {
  const [, { id }] = queryKey

  if (!id) {
    throw new Error(`No project provided`)
  }

  const res = await fetch(`/api/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
