import { useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { UpdatesData } from 'pages/api/updates'
import type { QueryData } from '@types'

export { useUpdates, usePrefetchUpdates, preprocessUpdate }
export type Updates = QueryData<typeof useUpdates>

function useUpdates(projectId: number | 'new') {
  const query = useQuery(['updates', { projectId }], fetchProjectUpdates)

  const originalData = query.data
  // preprocess the data to convert dates and add hash links
  const data = useMemo(() => {
    return originalData ? originalData.map(preprocessUpdate) : originalData
  }, [originalData])

  return { ...query, data }
}

/**
 * Prefetch the users updates
 */
function usePrefetchUpdates(projectId: number, staleTime = 10000) {
  const queryClient = useQueryClient()
  // The results of this query will be cached like a normal query
  return async () =>
    await queryClient.prefetchQuery(
      ['updates', { projectId }],
      fetchProjectUpdates,
      { staleTime } // wait this long before another prefetch is attempted
    )
}

type UpdatesQueryKey = ['updates', { projectId: number | 'new' }]
const fetchProjectUpdates: QueryFunction<UpdatesData, UpdatesQueryKey> =
  async ({ queryKey }) => {
    const [, { projectId }] = queryKey

    if (!projectId) {
      throw new Error(`No project provided`)
    }
    if (projectId === 'new') return

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
