import { useQueryClient, useMutation } from 'react-query'
import { preprocessUpdate } from './useUpdates'

import type { Updates } from './useUpdates'
import type { Summary, UpdateSummaryBody } from 'pages/api/summary'

export { useUpdateSummary }
export type UpdateBody = Parameters<
  ReturnType<typeof useUpdateSummary>['mutate']
>[0]

function useUpdateSummary(projectId: number) {
  const queryClient = useQueryClient()
  const projectKey = ['project', { id: projectId }]
  return useMutation(updateSummary, {
    onSuccess: async (update, { id }) => {
      // await queryClient.cancelQueries('updates')
      // const previousUpdates = queryClient.getQueryData<Updates>(updateKey) ?? []
      // let newUpdates = [...previousUpdates]
      // const newUpdate = preprocessUpdate(update)
      // const updateId = update.id
      // if (id === 'new') {
      //   newUpdates.splice(0, 0, newUpdate)
      // } else {
      //   const changingUpdateIdx = previousUpdates.findIndex((u) => u.id === id)
      //   if (changingUpdateIdx === -1) {
      //     throw new Error(`Update with id ${updateId} not found in query cache`)
      //   }
      //   newUpdates.splice(changingUpdateIdx, 1, newUpdate)
      // }
      // queryClient.setQueryData(updateKey, newUpdates)
    },
    onSettled: () => {
      queryClient.invalidateQueries(projectKey)
    },
  })
}

async function updateSummary(data: UpdateSummaryBody) {
  const res = await fetch(`/api/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as Summary
}
