import { useQueryClient, useMutation } from 'react-query'
import produce from 'immer'

import type { Clients } from './useClients'
import type { Client, UpdateClientBody } from 'pages/api/client'

export { useClientMutation }
export type ClientBody = Parameters<
  ReturnType<typeof useClientMutation>['mutate']
>[0]

function useClientMutation() {
  const queryClient = useQueryClient()
  const clientsKey = 'clients'
  return useMutation(createOrUpdateClient, {
    onSuccess: async (newClient, { id }) => {
      await queryClient.cancelQueries(clientsKey)
      const previousClients =
        queryClient.getQueryData<Clients>(clientsKey) ?? []
      const newClients = produce(previousClients, (draft) => {
        if (id === 'new') {
          draft.splice(0, 0, newClient)
          return
        }
        const changingClientIdx = previousClients.findIndex((c) => c.id === id)
        if (changingClientIdx === -1) {
          throw new Error(`Client with id ${id} not found in query cache`)
        }
        draft.splice(changingClientIdx, 1, newClient)
      })
      queryClient.setQueryData<Clients>(clientsKey, newClients)
    },
    onSettled: () => {
      queryClient.invalidateQueries(clientsKey)
    },
  })
}

async function createOrUpdateClient(data: UpdateClientBody) {
  const res = await fetch(`/api/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as Client
}
