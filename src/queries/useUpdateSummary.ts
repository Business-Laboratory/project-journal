import { useQueryClient, useMutation } from 'react-query'

import type { Project } from './useProject'
import type { UpdateSummaryBody, Summary } from 'pages/api/summary'

export { useUpdateSummary }
export type UpdateBody = Parameters<
  ReturnType<typeof useUpdateSummary>['mutate']
>[0]

function useUpdateSummary(projectId: number) {
  const queryClient = useQueryClient()
  const projectKey = ['project', { id: projectId }]
  return useMutation(updateSummary, {
    onSuccess: async (summary) => {
      await queryClient.cancelQueries(projectKey)
      const previousProject = queryClient.getQueryData<Project>(projectKey)

      if (previousProject !== undefined) {
        const newProject = { ...previousProject, summary }
        queryClient.setQueryData<Project>(projectKey, newProject)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(projectKey)
    },
  })
}

async function updateSummary(data: UpdateSummaryBody) {
  const res = await fetch(`/api/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as Summary
}
