import { useMemo } from 'react'
import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { UpdatesData } from 'pages/api/updates'
import type { QueryData } from '@types'

export { useUpdates, preprocessUpdate }
export type Updates = QueryData<typeof useUpdates>

function useUpdates(projectId: number) {
  const query = useQuery(['updates', { projectId }], fetchProjectUpdates)

  const originalData = query.data
  // preprocess the data to convert dates and add hash links
  const data = useMemo(() => {
    return originalData ? originalData.map(preprocessUpdate) : originalData
  }, [originalData])

  return { ...query, data }
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

function preprocessUpdate(update: UpdatesData[0]) {
  return {
    ...update,
    createdAt: new Date(update.createdAt),
    updatedAt: new Date(update.updatedAt),
    hashLink: `#update-${update.id}`,
  }
}
