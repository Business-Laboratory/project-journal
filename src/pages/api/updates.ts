import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'

export type UpdatesData = PrepareAPIData<ReturnType<typeof getUpdates>>

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
    const { projectId } = req.body
    const updates = await getUpdates(user, projectId)
    res.status(200).json(updates)
  } catch (error) {
    let message = 'Something went wrong'
    if (error instanceof Error) {
      message = error.message
    }
    res.status(501).json({ error: message })
  }
}

async function getUpdates(user: UserData, projectId: number) {
  const userId = user.id
  const userRole = user.role

  // for regular users, check if the user is an employee of the client of the project
  if (userRole === 'USER') {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        client: {
          select: {
            employees: {
              where: {
                userId,
              },
            },
          },
        },
      },
    })

    if (!project || !project.client) {
      throw new Error(`User does not belong to this project`)
    }
  }

  return await prisma.update.findMany({
    where: {
      projectId,
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  })
}
