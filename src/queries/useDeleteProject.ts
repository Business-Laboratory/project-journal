import produce from 'immer'
import { useQueryClient, useMutation } from 'react-query'
import { Projects } from './useProjects'

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation(deleteProject, {
    onSuccess: async (_, id) => {
      const updateKey = ['project', { id }]
      await queryClient.cancelQueries(updateKey)
      const previousProjects = queryClient.getQueryData<Projects>('projects')
      if (!previousProjects) return
      const deleteIdIdx = previousProjects.findIndex((u) => u.id === id)
      if (deleteIdIdx !== -1) {
        const newProjects = produce(previousProjects, (draft) => {
          draft.splice(deleteIdIdx, 1)
        })
        queryClient.setQueryData('projects', newProjects)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('projects')
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
