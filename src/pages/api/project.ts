import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'
import { updateProjectImageUrl } from '@utils/api/update-project-image-url'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'

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

async function getProject(user: UserData, id: number) {
  const userId = user.id
  const userRole = user.role

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      imageStorageBlobUrl: true,
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

  const { imageStorageBlobUrl, ...returnProject } = project

  const newImageUrl = await updateProjectImageUrl(project)

  return { ...returnProject, imageUrl: newImageUrl }
}
