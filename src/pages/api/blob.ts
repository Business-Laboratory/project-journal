import type { NextApiRequest, NextApiResponse } from 'next'
import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob'

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
    const { name, contentType, dataUrl } = req.body

    const result = await uploadImage(name, contentType, dataUrl)
    res.status(200).json(result)
  }
}

export async function uploadImage(
  name: string,
  contentType: string,
  dataUrl: string
) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING ?? ''
  )

  const containerClient = blobServiceClient.getContainerClient('test')
  const blockBlobClient = containerClient.getBlockBlobClient(name)

  // remove the the Data-URL declaration if it was passed along https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  let base64Image = dataUrl.replace(/^data:.+;base64?,/, '')
  const buffer = Buffer.from(base64Image, 'base64')
  const uploadBlobResponse = await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  })
  return uploadBlobResponse
}

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
