// Client/Admin Project
import { css } from 'twin.macro'
import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectData } from '../api/project'
import { useRouter } from 'next/router'

import { Timeline, ProjectInformation, Summary } from '@components/project'

export default function Project() {
  const { query } = useRouter()
  const { id } = query
  if (id === undefined || Array.isArray(id)) {
    throw new Error(`Invalid id: ${id}`)
  }
  const { status, data } = useQuery(
    ['project', { id: Number(id) }],
    fetchProject
  )

  // TODO: figure out the loading state
  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    return (
      <h1 tw="bl-text-3xl max-w-prose text-center text-matisse-red-200">
        Something went wrong
      </h1>
    )
  }

  const project = data ?? null

  if (!project) return null

  return (
    <div
      tw="fixed overflow-hidden h-full w-full -mt-10"
      css={css`
        display: grid;
        grid-template-columns: 80px auto 500px;
      `}
    >
      <Timeline />
      <ProjectInformation updates={project?.updates ?? []} />
      <Summary name={project?.name ?? ''} />
    </div>
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
