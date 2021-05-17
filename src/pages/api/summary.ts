import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'

// have to make the id optional for creating a project by creating the summary first in `useUpdateSummary`
export type UpdateSummaryBody =
  | { id?: number; description: string }
  | { id?: number; roadmap: string }
  | { id?: number; description: string; roadmap: string }
export type Summary = PrepareAPIData<ReturnType<typeof updateSummary>>

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
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: 'User not authorized.' })
    return
  }
  if (method !== 'POST') {
    res.status(501).json({ error: `${method} not implemented.` })
    return
  }

  if (!isValidData(req.body)) {
    res.status(400).json({ error: `Invalid data, ${req.body}` })
    return
  }

  if (method === 'POST') {
    try {
      const summary = await updateSummary(req.body)
      res.status(200).json(summary)
    } catch (error) {
      res.status(500).json({ error })
    }
  }
}

async function updateSummary({ id, ...data }: UpdateSummaryBody) {
  return await prisma.summary.update({
    where: {
      id,
    },
    data,
  })
}
function isValidData(data: any): data is UpdateSummaryBody {
  if (typeof data.id !== 'number') return false
  const hasDescription = 'description' in data
  const hasRoadmap = 'roadmap' in data

  return hasDescription || hasRoadmap
}
