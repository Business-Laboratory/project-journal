import { useQueryClient, useMutation } from 'react-query'

import type { Updates } from './useUpdates'

export function useDeleteUpdateMutation(projectId: number) {
  const queryClient = useQueryClient()
  const updateKey = ['updates', { projectId }]
  return useMutation(deleteUpdate, {
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries('updates')
      const previousUpdates = queryClient.getQueryData<Updates>(updateKey) ?? []
      const deleteIdIdx = previousUpdates.findIndex((u) => u.id === id)
      if (deleteIdIdx === -1) {
        throw new Error(`Update with id ${id} not found in query cache`)
      }
      let newUpdates = [...previousUpdates]
      newUpdates.splice(deleteIdIdx, 1)
      queryClient.setQueryData(updateKey, newUpdates)
    },
    onSettled: () => {
      queryClient.invalidateQueries(updateKey)
    },
  })
}
async function deleteUpdate(id: number) {
  const res = await fetch(`/api/update`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id }),
  })
  if (!res.ok) {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error ?? `Something went wrong`)
    }
  }
}
