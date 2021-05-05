import { useQuery } from 'react-query'
import { ClientsData } from 'pages/api/clients'

import type { QueryFunction } from 'react-query'
import type { QueryData } from '@types'

export { useAdmins }
export type Clients = QueryData<typeof useAdmins>

function useAdmins() {
  return useQuery('admins', fetchClients)
}

const fetchClients: QueryFunction<ClientsData> = async () => {
  const res = await fetch(`/api/admins`)
  if (!res.ok) {
    throw new Error(`Something went wrong fetching clients`)
  }
  return res.json()
}
