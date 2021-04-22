import { prisma } from '@lib/prisma'
import { getSession } from 'next-auth/client'

import type { NextApiRequest, NextApiResponse } from 'next'

export { checkAuthentication }

/**
 * Checks if the user is authenticated (has a session) and if they're role is not
 * null. If either of those checks fail, set the status and error message, otherwise
 * return the user's object
 * @param req
 * @param res
 * @returns
 */
async function checkAuthentication(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    setUnauthorized(res)
    return
  }

  try {
    const user = await getUser(session?.user?.email ?? '')
    if (user.role === null) {
      setUnauthorized(res)
      return
    }
    return user
  } catch (error) {
    res.status(501).json({ error: `No user found` })
    return
  }
}

function setUnauthorized(res: NextApiResponse) {
  res.status(401).json({ error: 'User is not authorized' })
}

async function getUser(email: string) {
  if (email === '') {
    throw new Error(`User does not have an email`)
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      projects: true,
      employee: true,
    },
  })

  if (user === null) {
    throw new Error(`No user found`)
  }

  return user
}
