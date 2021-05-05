import { useQuery } from 'react-query'
import { AdminsData } from 'pages/api/admins'

import type { QueryFunction } from 'react-query'
import type { QueryData } from '@types'

export { useAdmins }
export type Admins = QueryData<typeof useAdmins>

function useAdmins() {
  return useQuery('admins', fetchuseAdmins)
}

const fetchuseAdmins: QueryFunction<AdminsData> = async () => {
  const res = await fetch(`/api/admins`)
  if (!res.ok) {
    throw new Error(`Something went wrong fetching admins`)
  }
  return res.json()
}
