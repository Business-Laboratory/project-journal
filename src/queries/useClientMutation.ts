import { useQueryClient, useMutation } from 'react-query'

// import type { Clients } from './useClients'
import type { Client, UpdateClientBody } from 'pages/api/client'

export { useClientMutation }
export type ClientBody = Parameters<
  ReturnType<typeof useClientMutation>['mutate']
>[0]

function useClientMutation() {
  const queryClient = useQueryClient()
  return useMutation(createOrUpdateClient, {
    // onSuccess: async (client, { id }) => {},
    onSettled: () => {
      queryClient.invalidateQueries('clients')
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
