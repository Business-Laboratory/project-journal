import { useQueryClient, useMutation } from 'react-query'
import { preprocessUpdate } from './useUpdates'

import type { Updates } from './useUpdates'
import type { Update } from 'pages/api/update'

export function useUpdateMutation(projectId: number) {
  const queryClient = useQueryClient()
  const updateKey = ['updates', { projectId }]
  return useMutation(createOrUpdateUpdate, {
    onSuccess: async (update, { id }) => {
      await queryClient.cancelQueries('updates')
      const previousUpdates = queryClient.getQueryData<Updates>(updateKey) ?? []
      let newUpdates = [...previousUpdates]
      const newUpdate = preprocessUpdate(update)
      const updateId = update.id
      if (id === 'new') {
        newUpdates.splice(0, 0, newUpdate)
      } else {
        const changingUpdateIdx = previousUpdates.findIndex((u) => u.id === id)
        if (changingUpdateIdx === -1) {
          throw new Error(`Update with id ${updateId} not found in query cache`)
        }
        newUpdates.splice(changingUpdateIdx, 1, newUpdate)
      }
      queryClient.setQueryData(updateKey, newUpdates)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['updates', { projectId }])
    },
  })
}

type UpdateData = {
  id: number | 'new'
  title: string
  body: string
  projectId: number
}
async function createOrUpdateUpdate(data: UpdateData) {
  const res = await fetch(`/api/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as Update
}
