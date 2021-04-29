import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'
import type { User } from '@prisma/client'

export type AdminsData = UnwrapPromise<ReturnType<typeof getAdmins>>

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
    const admins = await getAdmins(user)
    res.status(200).json(admins)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

async function getAdmins(user: User) {
  if (user.role !== 'ADMIN') return

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  })
  return admins
}
