import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'

export type ClientsData = PrepareAPIData<ReturnType<typeof getClients>>

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

async function getClients(user: UserData) {
  if (user.role !== 'ADMIN') return

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      employees: {
        include: {
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
