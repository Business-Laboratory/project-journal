import { prisma } from '@lib/prisma'
import { checkAuthentication } from '@utils/api/check-authentication'
import { generateSasUrl, deleteImage } from '@lib/azure-storage-blob'

import type { NextApiRequest, NextApiResponse } from 'next'

// NOTE: This api will be replaced once we add the full update project api

/**
 * Updates the project image
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await checkAuthentication(req, res)
  const { id, imageStorageBlobUrl } = req.body
  if (!imageStorageBlobUrl || typeof imageStorageBlobUrl !== 'string') {
    throw new Error(
      `Invalid imageStorageBlobUrl: ${imageStorageBlobUrl}. Must be a string`
    )
  }
  // bail if there's no user
  if (!user || user.role === 'USER') return

  try {
    // get the previous image storage blob url
    const previousProject = await prisma.project.findUnique({
      where: { id },
      select: { imageStorageBlobUrl: true },
    })
    const previousImageStorageBlobUrl = previousProject?.imageStorageBlobUrl
    // update the url to the newest url
    const newImageUrl = await generateSasUrl(null, imageStorageBlobUrl)
    await prisma.project.update({
      where: { id },
      data: {
        imageStorageBlobUrl,
        imageUrl: newImageUrl,
      },
    })
    // delete previous image if one existed and is different than the new one
    if (
      previousImageStorageBlobUrl &&
      previousImageStorageBlobUrl !== imageStorageBlobUrl
    ) {
      await deleteImage(previousImageStorageBlobUrl)
    }
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(501).json({ error })
  }
}
