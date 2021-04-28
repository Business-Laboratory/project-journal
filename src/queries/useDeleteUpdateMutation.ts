import { useQueryClient, useMutation } from 'react-query'

import type { Updates } from './useUpdates'

export function useDeleteUpdateMutation() {
  const queryClient = useQueryClient()
  return useMutation(deleteUpdate, {
    onSuccess: async (_, { projectId, updateId }) => {
      await queryClient.cancelQueries('updates')
      const updateKey = ['updates', { projectId }]
      const previousUpdates = queryClient.getQueryData<Updates>(updateKey) ?? []
      const deleteUpdateIdIdx = previousUpdates.findIndex(
        ({ id }) => id === updateId
      )
      if (deleteUpdateIdIdx === -1) {
        throw new Error(`Update with id ${updateId} not found in query cache`)
      }
      let newUpdates = [...previousUpdates]
      newUpdates.splice(deleteUpdateIdIdx, 1)
      queryClient.setQueryData(updateKey, newUpdates)
    },
    onSettled: (_, error, { projectId }) => {
      queryClient.invalidateQueries(['updates', { projectId }])
    },
  })
}

type DeleteUpdateProps = {
  projectId: number
  updateId: number
}
async function deleteUpdate({ projectId, updateId }: DeleteUpdateProps) {
  const res = await fetch(`/api/update`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: updateId }),
  })
  if (!res.ok) {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error ?? `Something went wrong`)
    }
  }
}
