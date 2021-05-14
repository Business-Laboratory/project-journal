import { useQueryClient, useMutation } from 'react-query'

import type { Project } from './useProject'
import type { NewProjectData } from 'pages/api/project'
import { Projects } from './useProjects'
import produce from 'immer'

export { useNewProject, createNewProject }
export type UpdateBody = Parameters<
  ReturnType<typeof useNewProject>['mutate']
>[0]

function useNewProject() {
  const queryClient = useQueryClient()
  const projectsKey = 'projects'
  return useMutation(createNewProject, {
    onSuccess: async (project) => {
      await queryClient.cancelQueries(projectsKey)
      const projectKey = ['project', { id: project.id }]
      const previousProjects =
        queryClient.getQueryData<Projects>(projectsKey) ?? []
      const newProjects = produce(previousProjects, (draft) => {
        // Spread this to match the Projects type
        const newProject = { ...project, clientId: project?.client?.id ?? null }
        draft.splice(0, 0, newProject)
        return
      })
      queryClient.setQueryData<Projects>(projectsKey, newProjects)
      queryClient.setQueryData<Project>(projectKey, project)
    },
    onSettled: () => {
      queryClient.invalidateQueries(projectsKey)
    },
  })
}

async function createNewProject() {
  const res = await fetch(`/api/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'new' }),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as NewProjectData
}
