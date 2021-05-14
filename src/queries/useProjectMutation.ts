import { useQueryClient, useMutation } from 'react-query'
import { useRouter } from 'next/router'
import produce from 'immer'
import { createProjectKey } from './useProject'

import type { Project } from './useProject'
import type {
  ProjectMutationBody,
  ProjectUpdateData,
  NewProjectData,
} from 'pages/api/project'
import type { Projects } from './useProjects'
import { createUpdateKey } from './useUpdateMutation'

export { useProjectMutation, createProjectKey, createNewProject }
export type UpdateBody = Parameters<
  ReturnType<typeof useProjectMutation>['mutate']
>[0]

function useProjectMutation(projectId: number | 'new') {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation(projectMutation, {
    onSuccess: async (project) => {
      const projectKey = createProjectKey(project.id)
      await queryClient.cancelQueries(projectKey)
      await queryClient.cancelQueries('projects')
      const previousProject =
        queryClient.getQueryData<Project>(projectKey) ?? {}
      const newProject = { ...previousProject, ...project }
      queryClient.setQueryData<Project>(projectKey, newProject)

      const previousProjects =
        queryClient.getQueryData<Projects>('projects') ?? []
      const newProjects = produce(previousProjects, (draft) => {
        const previousProjectIdx = draft.findIndex(
          ({ id }) => project.id === id
        )
        // Spread this to match the Projects type
        const p = { ...newProject, clientId: project?.client?.id ?? null }
        if (previousProjectIdx === -1) {
          draft.splice(0, 0, p)
        } else {
          draft.splice(previousProjectIdx, 1, p)
        }
      })
      queryClient.setQueryData<Projects>('projects', newProjects)
      if (projectId === 'new') {
        queryClient.setQueryData(createUpdateKey(project.id), [])
        router.replace(`./${project.id}`)
      }
    },
    onSettled: () => {
      if (projectId !== 'new') {
        queryClient.invalidateQueries(createProjectKey(projectId))
      }
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

async function createNewProject() {
  const res = await fetch(`/api/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emptyProject),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as NewProjectData
}

const emptyProject: ProjectMutationBody = {
  id: 'new',
  name: '',
  clientId: null,
  team: [],
}
