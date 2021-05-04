import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'

export type UpdateClientBody = {
  id: 'new' | number
  name: string
  employees: {
    id?: number // if there is no id, it's a new employee, and thus needs to be created
    name: string
    email: string
    title: string | null
  }[]
}
// TODO: Remove the exclude
export type Client = Exclude<
  PrepareAPIData<ReturnType<typeof updateClient>>,
  undefined
>

/**
 * Gets projects based on their role:
 * ADMIN — Gets all projects
 * USER — Gets the projects for the client they belong to (returns empty array if they do not belong to a client)
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await checkAuthentication(req, res)
  const { method } = req
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: 'User not authorized.' })
    return
  }
  if (method !== 'POST' && method !== 'DELETE') {
    res.status(501).json({ error: `${method} not implemented.` })
    return
  }

  const data = req.body

  if (!isValidData(data)) {
    res.status(400).json({ error: `Invalid data, ${JSON.stringify(req.body)}` })
    return
  }

  if (method === 'POST') {
    try {
      const client = await updateClient(data)
      res.status(200).json(client)
    } catch (error) {
      res.status(500).json({ error })
    }
  }
}

async function updateClient({ id, name }: UpdateClientBody) {
  if (id === 'new') {
    const update = await prisma.client.create({
      data: {
        name,
        // projects           Project[]
        // employees          Employee[]
      },
    })
    return update
  }
  // const update = await prisma.update.update({
  //   where: {
  //     id,
  //   },
  //   data,
  // })

  // return update
}
function isValidData(data: any): data is UpdateClientBody {
  if (data.id !== 'new' && typeof data.id !== 'number') {
    return false
  }
  if (
    !('name' in data) &&
    typeof data.name !== 'string' &&
    Boolean(data.name)
  ) {
    return false
  }
  if (
    !('employees' in data) &&
    !Array.isArray(data.employees) &&
    data.employees.some((e: any) => !isValidEmployee(e))
  ) {
    return false
  }

  return true
}

function isValidEmployee(data: any): data is UpdateClientBody['employees'] {
  if (!('id' in data) && typeof data.id !== 'number') return false
  if (!('name' in data) && typeof data.name !== 'number') return false
  if (!('email' in data) && typeof data.email !== 'string') return false
  if (
    !('title' in data) &&
    (typeof data.title !== 'string' || data.title !== null)
  ) {
    return false
  }

  return true
}
