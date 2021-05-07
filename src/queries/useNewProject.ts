import { useQueryClient, useMutation } from 'react-query'

import type { Project } from './useProject'
import type { NewProjectData } from 'pages/api/project'

export { useNewProject }
export type UpdateBody = Parameters<
  ReturnType<typeof useNewProject>['mutate']
>[0]

function useNewProject() {
  const queryClient = useQueryClient()
  return useMutation(newProjectMutation, {
    onSuccess: async (project) => {
      const projectKey = ['project', { id: project.id }]
      queryClient.setQueryData<Project>(projectKey, project)
    },
  })
}

async function newProjectMutation(data: { id: 'new' }) {
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
