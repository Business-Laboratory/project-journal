import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'
import type { User } from '@prisma/client'

export type ClientsData = UnwrapPromise<ReturnType<typeof getClients>>

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
  // bail if there's no user
  if (!user) return

  try {
    const projects = await getClients(user)
    res.status(200).json(projects)
  } catch (error) {
    console.log(error)
    res.status(501).json({ error })
  }
}

async function getClients(user: User) {
  if (user.role !== 'ADMIN') return

  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      employees: {
        select: {
          id: true,
          title: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })
  return clients
}
