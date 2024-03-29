import { checkAuthentication } from '@utils/api/check-authentication'
import { prisma } from '@lib/prisma'
import { generateSasUrlForImageUpload } from '@lib/azure-storage-blob'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { ProjectId } from './project'
import type { PrepareAPIData } from '@types'

export type UploadBlobTokenData = PrepareAPIData<
  ReturnType<typeof generateUploadBlobToken>
>

// This api will need to be amended to be a little more usable for generating tokens for all sorts of image uploads
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await checkAuthentication(req, res)
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: `User is not authenticated` })
    return
  }

  try {
    const { id, fileName } = checkBody(req.body)
    const data = await generateUploadBlobToken({ id, fileName })
    res.status(200).json(data)
  } catch (error) {
    res.status(501).json(error)
  }
}

async function generateUploadBlobToken({
  id,
  fileName,
}: ReturnType<typeof checkBody>) {
  const fileNameNoWhitespace = fileName.replace(/\s/g, '')
  // assuming id is project id for now
  let projectId
  if (id === 'new') {
    const newProject = await prisma.project.create({ data: {} })
    projectId = newProject.id
  } else {
    projectId = id
  }
  checkIfProjectExists(projectId)

  // get a SAS url to upload the image. This will also create the container if it does not exist
  const sasUrl = await generateSasUrlForImageUpload(
    'project-images', // for now we're just adding all project images to the same container
    `project-${id}-${fileNameNoWhitespace}`
  )

  return { id: projectId, sasUrl }
}

function checkBody({ id, fileName }: { id: unknown; fileName: unknown }): {
  id: ProjectId
  fileName: string
} {
  if (
    !(id === 'new' || (typeof id === 'number' && !Number.isNaN(Number(id))))
  ) {
    throw new Error(`Invalid id ${JSON.stringify(id)}`)
  }

  if (typeof fileName !== 'string' || fileName === '') {
    throw new Error(`Invalid fileName ${JSON.stringify(fileName)}`)
  }

  return { id, fileName }
}

async function checkIfProjectExists(id: number) {
  const projects = await prisma.project.count({
    where: {
      id,
    },
  })
  if (projects !== 1) {
    throw new Error(`Project with project id of ${id} does not exist`)
  }
}
