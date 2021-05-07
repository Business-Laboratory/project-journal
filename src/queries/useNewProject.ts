import { useQueryClient, useMutation } from 'react-query'

import type { Project } from './useProject'
import type { ProjectMutationBody, NewProjectData } from 'pages/api/project'

export { useNewProject }
export type UpdateBody = Parameters<
  ReturnType<typeof useNewProject>['mutate']
>[0]

function useNewProject() {
  const queryClient = useQueryClient()
  return useMutation(projectMutation, {
    onSuccess: async (project) => {
      const projectKey = ['project', { id: project.id }]
      queryClient.setQueryData<Project>(projectKey, project)
      return projectKey
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
  return response as NewProjectData
}
