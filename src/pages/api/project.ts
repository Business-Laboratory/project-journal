import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'
import { updateProjectImageUrl } from '@utils/api/update-project-image-url'
import { generateSasUrl, deleteImage } from '@lib/azure-storage-blob'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'
import type { Summary } from '@prisma/client'

export type ProjectData = PrepareAPIData<ReturnType<typeof getProject>>
export type ProjectUpdateData = PrepareAPIData<ReturnType<typeof updateProject>>
export type NewProjectData = PrepareAPIData<ReturnType<typeof newProject>>
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
      return
    }
    if (method === 'POST') {
      if (user.role !== 'ADMIN') {
        res.status(401).json({ error: 'User not authorized.' })
        return
      }

      if (req.body.id === 'new') {
        const project = await newProject()
        res.status(200).json(project)
        return
      }

      const { id, name, imageStorageBlobUrl, clientId, team } =
        req.body as ProjectMutationBody
      const project = await updateProject(
        id,
        name,
        imageStorageBlobUrl,
        clientId,
        team
      )
      res.status(200).json(project)
      return
    }

    if (method === 'DELETE') {
      if (user.role !== 'ADMIN') {
        res.status(401).json({ error: 'User not authorized.' })
        return
      }
      const id: number = req.body.id
      if (!id || typeof id !== 'number') {
        res.status(400).json({ error: `Invalid client id ${id}` })
        return
      }
      await deleteProject(id)
      res.status(200).end()
      return
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
    include: includeClause,
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
  let imageUrl = undefined
  if (imageStorageBlobUrl !== undefined) {
    // get the previous image storage blob url
    const previousProject = await prisma.project.findUnique({
      where: { id },
      select: { imageStorageBlobUrl: true },
    })
    const previousImageStorageBlobUrl = previousProject?.imageStorageBlobUrl
    // update the url to the newest url
    imageUrl = await generateSasUrl(null, imageStorageBlobUrl)
    // delete previous image if one existed and is different than the new one
    if (
      previousImageStorageBlobUrl &&
      previousImageStorageBlobUrl !== imageStorageBlobUrl
    ) {
      await deleteImage(previousImageStorageBlobUrl)
    }
  }

  const projectPromise = prisma.project.update({
    where: { id },
    data: {
      name,
      clientId,
      imageStorageBlobUrl,
      imageUrl,
    },
    include: includeClause,
  })
  // no idea why, but this has to be done separately
  const teamPromise = prisma.project.update({
    where: { id },
    data: {
      team: {
        set: team.map((id) => ({ id })),
      },
    },
    select: {
      team: true,
    },
  })

  const [newProject, newTeam] = await Promise.all([projectPromise, teamPromise])
  return { ...newProject, team: newTeam.team }
}

async function newProject() {
  const project = await prisma.project.create({
    data: {
      name: 'Untitled Project',
      summary: {
        create: {
          description: '',
          roadmap: '',
        },
      },
    },
    include: {
      summary: true,
    },
  })

  const summary = project.summary
  if (!hasSummary(summary)) {
    throw new Error(
      'Project does not have a summary. It should have just been created'
    )
  }

  return { ...project, summary }
}

function hasSummary(summary: Summary | null): summary is Summary {
  return summary !== null
}

async function deleteProject(id: number) {
  // Change to delete once the projectId is marked as unique in schema
  const deleteSummary = prisma.summary.deleteMany({
    where: {
      projectId: id,
    },
  })
  const deleteUpdates = prisma.update.deleteMany({
    where: {
      projectId: id,
    },
  })
  await Promise.all([deleteSummary, deleteUpdates])
  await prisma.project.delete({
    where: {
      id,
    },
  })
}

const includeClause = {
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
}
