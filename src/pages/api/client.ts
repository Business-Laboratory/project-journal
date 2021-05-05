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

  const data = req.body

  try {
    if (method === 'POST') {
      if (!isValidData(data)) {
        res
          .status(400)
          .json({ error: `Invalid data, ${JSON.stringify(req.body)}` })
        return
      }
      const client = await updateClient(data)
      res.status(200).json(client)
    }
    if (method === 'DELETE') {
      const id = data?.id
      if (!id || typeof id !== 'number') {
        res.status(400).json({ error: `Invalid client id ${id}` })
        return
      }
      // TODO: delete all of the employees. We won't delete the users though, as they may be used elsewhere
      await prisma.client.delete({ where: { id } })
      res.status(200).end()
    } else {
      res.status(501).json({ error: `${method} not implemented.` })
      return
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

async function updateClient({ id, name, employees }: UpdateClientBody) {
  // update/create users in the database based on the employees that are coming in
  const users = await updateAndCreateUsers(employees)
  const emailToUserId = new Map(users.map(({ email, id }) => [email, id]))
  if (id === 'new') {
    const createEmployees = employees.map(({ title, email }) => {
      const userId = emailToUserId.get(email)
      if (userId === undefined) {
        throw new Error(`No user id found for email ${email}`)
      }
      return { title, userId }
    })
    const client = await prisma.client.create({
      data: {
        name,
        employees: {
          create: createEmployees,
        },
      },
    })
    return client
  }

  // TODO remove employees that no longer exist
  // TODO change users role to null if they are no longer a part of a project
  const client = await prisma.client.update({
    where: {
      id,
    },
    data: {
      name,
      employees: {
        connectOrCreate: employees.map(({ id, title, email }) => {
          const userId = emailToUserId.get(email)
          if (userId === undefined) {
            throw new Error(`No user id found for email ${email}`)
          }
          return {
            where: { id },
            create: { title, userId },
          }
        }),
      },
    },
  })

  return client
}

async function updateAndCreateUsers(employees: UpdateClientBody['employees']) {
  const users = employees.map(({ email, name }) => {
    return prisma.user.upsert({
      where: { email },
      update: { name, updatedAt: new Date() },
      create: { name, email, role: 'USER' },
    })
  })
  return await Promise.all(users)
}

// Employees flow
// 1. Check for emails that don't associate with users
//  1.1 Create new users with name and email
//  1.2 Update existing users names
// 2. Split employees into create, update, and delete
//  2.1 Create new employees, associating them with the project and correct user
//  2.2 Update existing employees titles, and associating them with the correct user
//  2.2 Delete users

function isValidData(data: any): data is UpdateClientBody {
  if (!(data.id === 'new' || typeof data.id === 'number')) {
    return false
  }
  if (!('name' in data && typeof data.name === 'string' && data.name !== '')) {
    return false
  }
  if (
    !(
      'employees' in data &&
      Array.isArray(data.employees) &&
      data.employees.every((e: any) => isValidEmployee(e))
    )
  ) {
    return false
  }

  return true
}

function isValidEmployee(data: any): data is UpdateClientBody['employees'] {
  if (!('id' in data && typeof data.id === 'number')) {
    return false
  }
  if (!('name' in data && typeof data.name === 'string' && data.name !== '')) {
    return false
  }
  if (
    !('email' in data && typeof data.email === 'string' && data.email !== '')
  ) {
    return false
  }
  if (
    !(
      'title' in data &&
      (typeof data.title === 'string' || data.title === null)
    )
  ) {
    return false
  }

  return true
}
