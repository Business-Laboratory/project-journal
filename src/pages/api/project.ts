import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { User } from '@prisma/client'

// TODO: apply PrepareAPIData to all APIs
export type ProjectData = PrepareAPIData<ReturnType<typeof getProject>>

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
  const { id } = req.body
  // bail if there's no user
  if (!user) return

  try {
    const project = await getProject(user, id)
    res.status(200).json(project)
  } catch (error) {
    res.status(501).json({ error })
  }
}

async function getProject(user: User, id: number) {
  const userId = user.id
  const userRole = user.role
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      imageUrl: true,
      client: {
        select: {
          name: true,
          employees: {
            select: {
              user: true,
            },
          },
        },
      },
      team: true,
      summary: true,
      updates: {
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      },
    },
  })

  if (project === null) {
    throw new Error(`Project does not exist`)
  }

  if (userRole === 'USER') {
    const projectHasUser = project?.client?.employees?.find(
      ({ user }) => user.id === userId
    )
    if (!projectHasUser) {
      throw new Error(`User does not belong to this project`)
    }
  }

  return project
}
