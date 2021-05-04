export type UpdateClientBody = {
  id: 'new' | number
  name: string
  employees: {
    id: number
    name: string
    email: string
    title: string | null
  }[]
}
