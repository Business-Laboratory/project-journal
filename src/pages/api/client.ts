import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import { isValidEmail } from '@utils/is-valid-email'

export type UpdateClientBody = {
  id: 'new' | number
  name: string
  employees: {
    userId: number
    name: string
    email: string
    title: string | null
  }[]
}
export type Client = PrepareAPIData<ReturnType<typeof updateClient>>

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
      return
    }
    if (method === 'DELETE') {
      const id = data?.id
      if (!id || typeof id !== 'number') {
        res.status(400).json({ error: `Invalid client id ${id}` })
        return
      }
      // delete the employees of the client
      await removeEmployees(id, [])
      // delete the client
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

  const removeEmployeesPromise = removeEmployees(id, employees)
  const clientUpdatePromise = prisma.client.update({
    where: {
      id,
    },
    data: {
      name,
      employees: {
        upsert: employees.map(({ title, email }) => {
          const userId = emailToUserId.get(email)
          if (userId === undefined) {
            throw new Error(`No user id found for email ${email}`)
          }
          return {
            where: { clientId_userId: { clientId: id, userId } },
            update: { title },
            create: { title, userId },
          }
        }),
      },
    },
  })

  const [client] = await Promise.all([
    clientUpdatePromise,
    removeEmployeesPromise,
  ] as const)

  return client
}

async function updateAndCreateUsers(employees: UpdateClientBody['employees']) {
  const users = employees.map(async ({ email, name }) => {
    const currentRole = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })
    const role = currentRole?.role
    return prisma.user.upsert({
      where: { email },
      // keep the users previous role
      update: { name, updatedAt: new Date(), role: role ?? 'USER' },
      create: { name, email, role: 'USER' },
    })
  })
  return await Promise.all(users)
}

/**
 * Removes the employees associated with the client that aren't in the incoming array
 * @param id
 * @param newEmployees
 * @returns
 */
async function removeEmployees(
  id: number,
  newEmployees: UpdateClientBody['employees']
) {
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      employees: {
        select: {
          userId: true,
          clientId: true,
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      },
    },
  })
  const previousEmployees = client?.employees

  // bail if there were no employees before
  if (!previousEmployees || previousEmployees.length === 0) {
    return
  }

  const newEmployeeEmails = new Set(newEmployees.map(({ email }) => email))

  // filter all previous employee who somehow didn't have an email, or who are in the new employees
  const employeesToDelete = previousEmployees.filter((employees) => {
    const { email } = employees.user
    return email !== null && !newEmployeeEmails.has(email)
  })

  // delete employees
  const deleteEmployeesPromise = prisma.employee.deleteMany({
    where: {
      AND: {
        userId: { in: employeesToDelete.map(({ userId }) => userId) },
        clientId: { in: employeesToDelete.map(({ clientId }) => clientId) },
      },
    },
  })

  // if the user is not an ADMIN and they are not an employee anywhere else
  // then change their role so they no longer have access to the app
  const updateUsersPromises = employeesToDelete.map(async (employee) => {
    const { role } = employee.user
    if (role === 'ADMIN') return

    const countOfOtherEmployments = await prisma.employee.count({
      where: {
        AND: {
          clientId: { not: id },
          userId: employee.userId,
        },
      },
    })
    if (countOfOtherEmployments > 0) return

    await prisma.user.update({
      where: { id: employee.userId },
      data: { role: null },
    })
    return
  })

  await Promise.all([deleteEmployeesPromise, Promise.all(updateUsersPromises)])
  return
}

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
  if (!('name' in data && typeof data.name === 'string' && data.name !== '')) {
    return false
  }
  if (
    !(
      'email' in data &&
      typeof data.email === 'string' &&
      data.email !== '' &&
      isValidEmail(data.email)
    )
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
