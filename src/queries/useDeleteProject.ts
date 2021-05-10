import { useQueryClient, useMutation } from 'react-query'

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation(deleteProject, {
    onSuccess: async (_, id) => {
      const updateKey = ['projects', { id }]
      await queryClient.cancelQueries(updateKey)
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
