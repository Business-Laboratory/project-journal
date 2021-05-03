import {
  checkAuthentication,
  UserData as OriginalUserData,
} from '@utils/api/check-authentication'

import type { PrepareAPIData } from '@types'
import type { NextApiRequest, NextApiResponse } from 'next'

export type UserData = PrepareAPIData<OriginalUserData>

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
