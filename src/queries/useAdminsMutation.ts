import { useQueryClient, useMutation } from 'react-query'

import { UpdateAdminsBody, AdminsData } from 'pages/api/admins'

export { useAdminsMutation }

function useAdminsMutation() {
  const queryClient = useQueryClient()
  const adminsKey = 'admins'
  return useMutation(updateAdmins, {
    onSuccess: async (admins) => {
      queryClient.cancelQueries(adminsKey)
      queryClient.setQueryData<AdminsData>(adminsKey, admins)
    },
    onSettled: () => {
      queryClient.invalidateQueries(adminsKey)
    },
  })
}

async function updateAdmins(data: UpdateAdminsBody) {
  const res = await fetch(`/api/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const response = await res.json()
  if (!res.ok) {
    throw new Error(response.error)
  }
  return response as AdminsData
}
