import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { UpdatesData } from 'pages/api/updates'

export { useUpdates }

export type Updates = ReturnType<typeof useUpdates>['data']
function useUpdates(projectId: number) {
  return useQuery(['updates', { projectId }], fetchProjectUpdates)
}

type UpdatesQueryKey = ['updates', { projectId: number }]
const fetchProjectUpdates: QueryFunction<
  UpdatesData,
  UpdatesQueryKey
> = async ({ queryKey }) => {
  const [, { projectId }] = queryKey

  if (!projectId) {
    throw new Error(`No project provided`)
  }

  const res = await fetch(`/api/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error ?? `Something went wrong`)
  }
  return data
}
