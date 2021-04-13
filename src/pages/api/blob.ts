import type { NextApiRequest, NextApiResponse } from 'next'
import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob'

export async function downloadImage() {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING ?? ''
  )

  const containerClient = blobServiceClient.getContainerClient('test')
  const blockBlobClient = containerClient.getBlockBlobClient(
    'calumet_optimizer.png'
  )

  const expiresOn = new Date()
  expiresOn.setMinutes(expiresOn.getMinutes() + 5)

  await blockBlobClient.downloadToFile('./calumet_optimizer.png')

  return await blockBlobClient.generateSasUrl({
    permissions: ContainerSASPermissions.parse('r'),
    expiresOn,
    cacheControl: 'public, max-age=300, immutable',
  })

  // let i = 1
  // for await (const container of blobServiceClient.listContainers()) {
  //   console.log(`Container ${i++}: ${container.name}`)
  // }

  // // Create a container
  // const containerName = `newcontainer${new Date().getTime()}`
  // const containerClient = blobServiceClient.getContainerClient(containerName)

  // const createContainerResponse = await containerClient.create()
  // console.log(
  //   `Create container ${containerName} successfully`,
  //   createContainerResponse.requestId
  // )

  // // Delete container
  // await containerClient.delete()

  // console.log('deleted container')
}
export async function uploadImage(name: string, data: string) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING ?? ''
  )

  const containerClient = blobServiceClient.getContainerClient('test')
  const blockBlobClient = containerClient.getBlockBlobClient(name)

  let base64Image = data.split(';base64,').pop()
  if (base64Image === undefined) {
    throw new Error(`Invalid base64 image string`)
  }
  const buffer = Buffer.from(base64Image, 'base64')
  const uploadBlobResponse = await blockBlobClient.uploadData(buffer)
  console.log(
    `Upload block blob ${name} successfully`,
    uploadBlobResponse.requestId
  )
  return
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // bail if there's no user

  if (req.method === 'GET') {
    try {
      const image = await downloadImage()
      res.status(200).json({ image })
    } catch (error) {
      console.log(error)
      res.status(501).json({ error })
    }
  } else if (req.method === 'POST') {
    const { name, data } = req.body

    await uploadImage(name, data)
    res.status(200).json({ message: 'file successfully uploaded' })
  }
}
