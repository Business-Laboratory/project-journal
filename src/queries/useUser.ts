import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { UserData } from 'pages/api/user'

export { useUser }

function useUser(email: string) {
  const user = useQuery(['user', { email }], fetchUser, {
    enabled: Boolean(email), // only fetch the user's data if they're logged in with an email
  })

  return user
}

type UserQueryKey = ['user', { email: string }]
const fetchUser: QueryFunction<UserData, UserQueryKey> = async ({
  queryKey,
}) => {
  const [, { email }] = queryKey

  if (!email) {
    throw new Error(`No email provided`)
  }

  const res = await fetch(`/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (res.status === 401) {
    throw new Error(`User is not authorized to use this app`)
  } else if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
