import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'
import type { User } from '@prisma/client'

export type ProjectData = UnwrapPromise<ReturnType<typeof getProject>>

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
          employees: {
            select: {
              userId: true,
            },
          },
        },
      },
      team: true,
      summary: true,
      updates: true,
    },
  })

  if (userRole === 'USER') {
    const projectHasUser = project?.client?.employees?.find(
      ({ userId: id }) => id === userId
    )
    if (!projectHasUser) return
  }

  return project
}
