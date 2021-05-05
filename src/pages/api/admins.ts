import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'

export type AdminsData = PrepareAPIData<ReturnType<typeof getAdmins>>

export type UpdateAdminsBody = { name: string; email: string }[]
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
    if (req.method === 'GET') {
      const admins = await getAdmins(user)
      res.status(200).json(admins)
    }
    if (req.method === 'POST') {
      await updateAdmins(req.body)
      res.status(200).json({})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

async function getAdmins(user: UserData) {
  if (user.role !== 'ADMIN') return

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  })
  return admins
}

async function updateAdmins(admins: UpdateAdminsBody) {
  return new Promise((res) => {
    setTimeout(res, 3000)
  })
}
