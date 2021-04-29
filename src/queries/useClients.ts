import { useQuery } from 'react-query'
import { ClientsData } from 'pages/api/clients'

import type { QueryFunction } from 'react-query'
import type { QueryData } from '@types'

export { useClients }
export type Clients = QueryData<typeof useClients>

function useClients() {
  return useQuery('clients', fetchClients)
}

const fetchClients: QueryFunction<ClientsData> = async () => {
  const res = await fetch(`/api/clients`)
  if (!res.ok) {
    throw new Error(`Something went wrong fetching clients`)
  }
  return res.json()
}
