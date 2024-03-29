import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'

export type Update = PrepareAPIData<ReturnType<typeof addOrUpdateUpdate>>

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
  const { id, title, body, projectId } = req.body
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: 'User not authorized.' })
    return
  }
  if (method !== 'POST' && method !== 'DELETE') {
    res.status(501).json({ error: `${method} not implemented.` })
    return
  }

  if (method === 'POST') {
    try {
      const update = await addOrUpdateUpdate(id, title, body, projectId)
      res.status(200).json(update)
    } catch (error) {
      res.status(501).json({ error })
    }
  }
  if (method === 'DELETE') {
    try {
      await deleteUpdate(id)
      res.status(200).end()
    } catch (error) {
      res.status(501).json({ error })
    }
  }
}

async function addOrUpdateUpdate(
  id: number | 'new',
  title: string,
  body: string,
  projectId: number
) {
  checkData(id, title, body)
  const data = {
    title,
    body,
    updatedAt: new Date(),
  }
  if (id === 'new') {
    const update = await prisma.update.create({
      data: { ...data, projectId },
    })
    return update
  }
  const update = await prisma.update.update({
    where: {
      id,
    },
    data,
  })

  return update
}

async function deleteUpdate(id: number) {
  await prisma.update.delete({
    where: {
      id,
    },
  })
}

function checkData(id: number | 'new', title: string, body: string) {
  if (typeof id !== 'number' && id !== 'new') {
    throw new Error(`Invalid update id: ${id}`)
  }
  if (typeof title !== 'string' || title === '') {
    throw new Error(`Invalid update title: ${title}`)
  }
  if (typeof body !== 'string' || body === '') {
    throw new Error(`Invalid update body: ${body}`)
  }
}
