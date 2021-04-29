import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'

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
  const { id, edit, body } = req.body
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: 'User not authorized.' })
    return
  }
  if (method !== 'POST') {
    res.status(501).json({ error: `${method} not implemented.` })
    return
  }

  if (method === 'POST' && edit === 'description') {
    try {
      const project = await postDescription(id, body)
      res.status(200).json(project)
    } catch (error) {
      res.status(500).json({ error })
    }
  }
  if (method === 'POST' && edit === 'roadmap') {
    try {
      const project = await postRoadmap(id, body)
      res.status(200).json(project)
    } catch (error) {
      res.status(500).json({ error })
    }
  }
}

async function postDescription(id: number, body: string) {
  const descriptionUpdate = await prisma.summary.update({
    where: {
      id,
    },
    data: {
      description: body,
    },
  })

  return descriptionUpdate
}

async function postRoadmap(id: number, body: string) {
  const roadmapUpdate = await prisma.summary.update({
    where: {
      id,
    },
    data: {
      roadmap: body,
    },
  })

  return roadmapUpdate
}
