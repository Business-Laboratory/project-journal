import { useQueryClient, useMutation } from 'react-query'
import { preprocessUpdate } from './useUpdates'
import { createNewProject } from './useProjectMutation'

import type { Updates } from './useUpdates'
import type { Update } from 'pages/api/update'
import { useRouter } from 'next/router'

export { useUpdateMutation, createUpdateKey }
export type UpdateBody = Parameters<
  ReturnType<typeof useUpdateMutation>['mutate']
>[0]

function useUpdateMutation(projectId: number | 'new') {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation(createOrUpdateUpdate, {
    onSuccess: async (update, { id }) => {
      // redirect if we created a new project
      if (projectId === 'new') {
        const newProjectId = update.projectId
        queryClient.setQueryData(
          ['updates', { projectId: newProjectId }],
          [update]
        )
        router.replace(`./${newProjectId}`)
        return
      }

      const updateKey = createUpdateKey(projectId)

      await queryClient.cancelQueries(updateKey)
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
    onSettled: (update) => {
      if (projectId === 'new') {
        if (update === undefined) return
        queryClient.invalidateQueries(createUpdateKey(update.projectId))
      } else {
        queryClient.invalidateQueries(createUpdateKey(projectId))
      }
    },
  })
}

type UpdateData = {
  id: number | 'new'
  title: string
  body: string
  projectId: number | 'new'
}
async function createOrUpdateUpdate(data: UpdateData) {
  // if this update belongs to a new project, create the project first
  let bodyData = data
  if (data.projectId === 'new') {
    const newProject = await createNewProject()
    bodyData = { ...bodyData, projectId: newProject.id }
  }
  const res = await fetch(`/api/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as Update
}

function createUpdateKey(projectId: number) {
  return ['updates', { projectId }]
}
