import { useQueryClient, useMutation } from 'react-query'
import produce from 'immer'

import type { Updates } from './useUpdates'
import type { ProjectId } from 'pages/api/project'

export function useDeleteUpdateMutation(projectId: ProjectId) {
  const queryClient = useQueryClient()
  const updateKey = ['updates', { projectId }]
  const callback = projectId === 'new' ? noopDeleteUpdate : deleteUpdate
  return useMutation(callback, {
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries(updateKey)
      const previousUpdates = queryClient.getQueryData<Updates>(updateKey) ?? []
      const deleteIdIdx = previousUpdates.findIndex((u) => u.id === id)
      if (deleteIdIdx === -1) {
        throw new Error(`Update with id ${id} not found in query cache`)
      }
      const newUpdates = produce(previousUpdates, (draft) => {
        draft.splice(deleteIdIdx, 1)
      })
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
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error ?? `Something went wrong`)
    }
  }
}

// you can't delete an update on a new project, this just keeps all the types tidy
async function noopDeleteUpdate(id: number) {}
