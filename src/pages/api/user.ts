import { checkAuthentication } from '@utils/api/check-authentication'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'

export type UserData = Exclude<
  UnwrapPromise<typeof checkAuthentication>,
  undefined
>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const email = req.body.email
  if (!email) {
    res.status(501).json({ error: `No email given` })
    return
  }

  const user = await checkAuthentication(req, res)
  // bail if there's no user
  if (!user) return

  res.status(200).json(user)
}
