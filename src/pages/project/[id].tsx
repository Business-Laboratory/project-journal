// Client/Admin Project
import 'twin.macro'
import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectData } from '../api/project'
import { useRouter } from 'next/router'

import { Timeline } from '@components/project/timeline'
import { WeeklyUpdates } from '@components/project/weekly-updates'
import { Summary } from '@components/project/summary'

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
    <>
      <Timeline />
      <div tw="grid grid-cols-3 col-auto -mt-10">
        <WeeklyUpdates />
        <Summary name={project?.name ?? ''} />
      </div>
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
    body: JSON.stringify({ projectId: id }),
  })
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
