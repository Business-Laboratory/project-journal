import { checkAuthentication } from '@utils/api/check-authentication'
import { prisma } from '@lib/prisma'
import { generateSasUrlForImageUpload } from '@lib/azure-storage-blob'

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
  const user = await checkAuthentication(req, res)
  // bail if there's no user
  if (!user || user.role !== 'ADMIN') {
    res.status(401).json({ error: `User is not authenticated` })
    return
  }

  try {
    const { projectId, fileName } = checkBody(req.body)
    checkIfProjectExists(projectId)

    const newFileName = `${fileName}_${new Date().toISOString()}`

    // get a SAS url to upload the image. This will also create the container if it does not exist
    const sasUrl = await generateSasUrlForImageUpload(
      `project-${projectId}`,
      newFileName
    )

    res.status(200).json({ sasUrl, newFileName })
  } catch (error) {
    res.status(501).json(error)
  }
}

function checkBody({
  projectId,
  fileName,
}: {
  projectId: unknown
  fileName: unknown
}) {
  if (
    (typeof projectId !== 'string' && typeof projectId !== 'number') ||
    projectId === '' ||
    Number.isNaN(Number(projectId))
  ) {
    throw new Error(`Invalid projectId ${JSON.stringify(projectId)}`)
  }

  if (typeof fileName !== 'string' || fileName === '') {
    throw new Error(`Invalid fileName ${JSON.stringify(fileName)}`)
  }

  return { projectId: Number(projectId), fileName }
}

async function checkIfProjectExists(projectId: number) {
  const projects = await prisma.project.count({
    where: {
      id: projectId,
    },
  })
  if (projects !== 1) {
    throw new Error(`Project with project id of ${projectId} does not exist`)
  }
}
