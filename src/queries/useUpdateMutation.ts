import { useQueryClient, useMutation } from 'react-query'
import { preprocessUpdate } from './useUpdates'
import { createNewProject } from './useProjectMutation'
import { createProjectKey } from './useProject'

import type { Updates } from './useUpdates'
import type { Update } from 'pages/api/update'
import type { ProjectId } from 'pages/api/project'
import type { Project } from './useProject'

export { useUpdateMutation, createUpdateKey }
export type UpdateBody = Parameters<
  ReturnType<typeof useUpdateMutation>['mutate']
>[0]

function useUpdateMutation(projectId: ProjectId) {
  const queryClient = useQueryClient()
  return useMutation(createOrUpdateUpdate, {
    onSuccess: async (update, { id }) => {
      // redirect if we created a new project
      if (projectId === 'new') {
        const newProjectId = update.projectId
        queryClient.setQueryData(createUpdateKey(newProjectId), [update])
        queryClient.setQueryData<Project>(createProjectKey(newProjectId), {
          id: newProjectId,
          imageUrl: null,
          name: null,
          clientId: null,
          client: null,
          team: [],
          summary: null,
        })
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
  id: ProjectId
  title: string
  body: string
  projectId: ProjectId
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
