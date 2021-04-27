import { prisma } from '@lib/prisma'
import { generateSasUrl } from '@lib/azure-storage-blob'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { User } from '@prisma/client'

export type ProjectsData = PrepareAPIData<ReturnType<typeof getProjects>>

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
    const projects = await getProjects(user)
    res.status(200).json(projects)
  } catch (error) {
    res.status(501).json({ error })
  }
}

async function getProjects(user: User) {
  let where = undefined
  // if the role is a user, get the client id to apply to the where clause
  if (user.role === 'USER') {
    const userId = user.id
    const client = await prisma.employee.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        clientId: true,
      },
    })
    // USERs with no clients have no projects
    if (client === null) {
      return []
    }
    where = {
      client: {
        id: client.clientId,
      },
    }
  }

  // get the project data
  const projects = await prisma.project.findMany({
    where,
    include: {
      summary: {
        select: {
          description: true,
        },
      },
    },
  })

  const projectsWithImageUrls = projects.map(
    async ({ imageStorageBlobUrl, ...project }) => {
      const { imageUrl } = project

      // if there's no storage blob we can just continue
      if (imageStorageBlobUrl === null) {
        return project
      }

      // create a sas url, this will just return the existing one if it's valid
      const newImageUrl = await generateSasUrl(imageUrl, imageStorageBlobUrl)
      // if the imageUrl changed the database needs to be updated
      if (imageUrl !== newImageUrl) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            imageUrl: newImageUrl,
          },
        })
      }

      return { ...project, imageUrl: newImageUrl }
    }
  )

  return Promise.all(projectsWithImageUrls)
}
