import { useQueryClient, useMutation } from 'react-query'
import produce from 'immer'

import type { Clients } from './useClients'

const clientsKey = 'clients'
export function useDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation(deleteClient, {
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries(clientsKey)
      const previousClients =
        queryClient.getQueryData<Clients>(clientsKey) ?? []
      const deleteIdIdx = previousClients.findIndex((c) => c.id === id)
      if (deleteIdIdx === -1) {
        throw new Error(`Client with id ${id} not found in query cache`)
      }
      const newClients = produce(previousClients, (draft) => {
        draft.splice(deleteIdIdx, 1)
      })
      queryClient.setQueryData(clientsKey, newClients)
    },
    onSettled: () => {
      queryClient.invalidateQueries(clientsKey)
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
