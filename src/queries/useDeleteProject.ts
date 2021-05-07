import { useQueryClient, useMutation } from 'react-query'

import { Projects } from './useProjects'

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const updateKey = ['projects']
  return useMutation(deleteProject, {
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries(updateKey)
      const projects = queryClient.getQueryData<Projects>(updateKey) ?? []
      const deleteIdIdx = projects.findIndex((u) => u.id === id)
      if (deleteIdIdx === -1) {
        throw new Error(`Project with id ${id} not found in query cache`)
      }
      let newProjects = [...projects]
      newProjects.splice(deleteIdIdx, 1)
      queryClient.setQueryData(updateKey, newProjects)
    },
    onSettled: () => {
      queryClient.invalidateQueries(updateKey)
    },
  })
}
async function deleteProject(id: number) {
  const res = await fetch(`/api/project`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id }),
  })
  if (!res.ok) {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error ?? `Something went wrong`)
    }
  }
}
