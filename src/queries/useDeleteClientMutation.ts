import { useQueryClient, useMutation } from 'react-query'

// import type { Clients } from './useClients'

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation(deleteClient, {
    // onSuccess: async (_, id) => {},
    onSettled: () => {
      queryClient.invalidateQueries('clients')
    },
  })
}
async function deleteClient(id: number) {
  const res = await fetch(`/api/client`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data?.error ?? `Something went wrong`)
  }
  return
}
