import { useQueryClient, useMutation } from 'react-query'

import type { Project } from './useProject'
import type { ProjectMutationBody, ProjectUpdateData } from 'pages/api/project'

export { useProjectMutation }
export type UpdateBody = Parameters<
  ReturnType<typeof useProjectMutation>['mutate']
>[0]

function useProjectMutation(projectId: number) {
  const queryClient = useQueryClient()
  const projectKey = ['project', { id: projectId }]
  return useMutation(projectMutation, {
    onSuccess: async (project) => {
      await queryClient.cancelQueries(projectKey)
      const previousProject = queryClient.getQueryData<Project>(projectKey)

      if (previousProject !== undefined) {
        const newProject = { ...previousProject, ...project }
        queryClient.setQueryData<Project>(projectKey, newProject)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(projectKey)
    },
  })
}

async function projectMutation(data: ProjectMutationBody) {
  const res = await fetch(`/api/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as ProjectUpdateData
}
