import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'
import { updateProjectImageUrl } from '@utils/api/update-project-image-url'
import { generateSasUrl, deleteImage } from '@lib/azure-storage-blob'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'

export type ProjectData = PrepareAPIData<ReturnType<typeof getProject>>
export type ProjectUpdateData = PrepareAPIData<ReturnType<typeof updateProject>>
export type ProjectMutationBody = {
  id: number
  name: string
  imageStorageBlobUrl?: string
  clientId: number | null
  team: number[]
}

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
  const { method } = req

  try {
    if (method === 'GET') {
      const { id } = req.query
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: `Invalid id, ${id}` })
        return
      }
      const project = await getProject(user, Number(id))
      res.status(200).json(project)
    }
    if (method === 'POST') {
      if (user.role !== 'ADMIN') {
        res.status(401).json({ error: 'User not authorized.' })
        return
      }
      const {
        id,
        name,
        imageStorageBlobUrl,
        clientId,
        team,
      } = req.body as ProjectMutationBody
      const project = await updateProject(
        id,
        name,
        imageStorageBlobUrl,
        clientId,
        team
      )
      res.status(200).json(project)
    }
    res.status(501).json({ error: `${method} not implemented.` })
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
          id: true,
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

// team update not ready yet
async function updateProject(
  id: number,
  name: string,
  imageStorageBlobUrl: string | undefined,
  clientId: number | null,
  team: number[]
) {
  if (imageStorageBlobUrl !== undefined) {
    // get the previous image storage blob url
    const previousProject = await prisma.project.findUnique({
      where: { id },
      select: { imageStorageBlobUrl: true },
    })
    const previousImageStorageBlobUrl = previousProject?.imageStorageBlobUrl
    // update the url to the newest url
    const newImageUrl = await generateSasUrl(null, imageStorageBlobUrl)
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        imageStorageBlobUrl,
        imageUrl: newImageUrl,
        clientId,
        // When uncommented, TS complains about an error related to clientId
        // All examples in prisma docs show this working
        // team: {
        //   set: team.map(id => ({ id }))
        // }
      },
    })
    // delete previous image if one existed and is different than the new one
    if (
      previousImageStorageBlobUrl &&
      previousImageStorageBlobUrl !== imageStorageBlobUrl
    ) {
      await deleteImage(previousImageStorageBlobUrl)
    }

    return project
  }
  return await prisma.project.update({
    where: { id },
    data: {
      name,
      clientId,
      // When uncommented, TS complains about an error related to clientId
      // All examples in prisma docs show this working
      // team: {
      //   set: team.map(id=> ({ id }))
      // }
    },
  })
}
