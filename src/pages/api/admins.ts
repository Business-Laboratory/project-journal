import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PrepareAPIData } from '@types'
import type { UserData } from '@utils/api/check-authentication'
import { isValidEmail } from '@utils/is-valid-email'

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

  // bail if there's no user or the user is not an admin
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: 'You are not an admin.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const admins = await getAdmins(user)
      res.status(200).json(admins)
    }
    if (req.method === 'POST') {
      if (!isValidData(req.body)) {
        res.status(400).json({ error: 'Input not valid.' })
        return
      }
      const admins = await updateAdmins(req.body, user)
      res.status(200).json(admins)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

async function getAdmins(user: UserData) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  })
  return admins
}

async function updateAdmins(
  admins: UpdateAdminsBody,
  user: UserData
): Promise<ReturnType<typeof getAdmins>> {
  const currentAdmins = await getAdmins(user)

  const deletingAdmins = []

  for (const admin of currentAdmins) {
    const included = admins.find(({ email }) => email === admin.email)

    if (!included) {
      deletingAdmins.push(admin)
    }
  }

  const deletePromise = prisma.user.updateMany({
    where: { id: { in: deletingAdmins.map((e) => e.id) } },
    data: { role: null, updatedAt: new Date() },
  })

  const createUpdatePromise = admins.map(({ email, name }) => {
    return prisma.user.upsert({
      where: { email },
      update: { name, role: 'ADMIN', updatedAt: new Date() },
      create: { email, name, role: 'ADMIN' },
    })
  })

  await deletePromise
  const newAdmins = await Promise.all(createUpdatePromise)

  return newAdmins
}

function isValidData(data: any): data is UpdateAdminsBody {
  if (!Array.isArray(data) || data.some((e: any) => !isValidAdmin(e))) {
    return false
  }
  return true
}
function isValidAdmin(data: any): data is UpdateAdminsBody[0] {
  if (!('name' in data && typeof data.name === 'string' && data.name !== ''))
    return false
  if (
    !(
      'email' in data &&
      typeof data.email === 'string' &&
      data.email !== '' &&
      isValidEmail(data.email)
    )
  )
    return false
  return true
}
