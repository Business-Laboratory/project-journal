import { useQueryClient, useMutation } from 'react-query'
import { useRouter } from 'next/router'
import { createNewProject } from './useProjectMutation'
import { createProjectKey } from './useProject'
import { createUpdateKey } from './useUpdateMutation'

import type { Project } from './useProject'
import type { UpdateSummaryBody, Summary } from 'pages/api/summary'
import type { ProjectId } from 'pages/api/project'

export { useUpdateSummary }
export type UpdateBody = Parameters<
  ReturnType<typeof useUpdateSummary>['mutate']
>[0]

function useUpdateSummary(projectId: ProjectId) {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation(updateSummary(projectId), {
    onSuccess: async (summary) => {
      // use the projectId from the summary here in case we just made a project
      const projectKey = createProjectKey(summary.projectId)
      await queryClient.cancelQueries(projectKey)
      const previousProject =
        queryClient.getQueryData<Project>(projectKey) ??
        createEmptyProject(summary.projectId)

      const newProject = { ...previousProject, summary }
      queryClient.setQueryData<Project>(projectKey, newProject)
      if (projectId === 'new') {
        // set the updates in the cache so it doesn't load the page
        queryClient.setQueryData(createUpdateKey(summary.projectId), [])
        router.replace(`./${summary.projectId}`)
      }
    },
    onSettled: () => {
      if (projectId !== 'new') {
        queryClient.invalidateQueries(createProjectKey(projectId))
      }
    },
  })
}

function updateSummary(projectId: ProjectId) {
  return async function (data: UpdateSummaryBody) {
    let bodyData = data
    if (projectId === 'new') {
      const newProject = await createNewProject()
      bodyData = { ...bodyData, id: newProject.summary.id }
    }
    if (bodyData.id === undefined) {
      throw new Error('Summary id cannot be undefined')
    }
    const res = await fetch(`/api/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })
    const response = await res.json()
    if (!res.ok) {
      throw new Error(response.error)
    }
    return response as Summary
  }
}

function createEmptyProject(id: number): Project {
  return {
    id,
    imageUrl: '',
    name: '',
    clientId: null,
    client: null,
    team: [],
    summary: null,
  }
}
