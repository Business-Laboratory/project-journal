import { prisma } from '@lib/prisma'
import { generateSasUrl } from '@lib/azure-storage-blob'

import type { Project } from '@prisma/client'

/**
 * Checks if the image url of the project is expired, and if so generates a new
 * SAS token and updates the project in the data base
 * @returns new image url (null if there was no url initially)
 */
export async function updateProjectImageUrl({
  id,
  imageStorageBlobUrl,
  imageUrl,
}: Pick<Project, 'id' | 'imageStorageBlobUrl' | 'imageUrl'>) {
  // if there's no storage blob we can just bail
  if (imageStorageBlobUrl === null) {
    return imageUrl
  }

  // create a sas url, this will just return the existing one if it's valid
  const newImageUrl = await generateSasUrl(imageUrl, imageStorageBlobUrl)
  // if the imageUrl changed the database needs to be updated
  if (imageUrl !== newImageUrl) {
    await prisma.project.update({
      where: { id },
      data: {
        imageUrl: newImageUrl,
      },
    })
  }

  return newImageUrl
}
