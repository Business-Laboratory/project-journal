import type { NextApiRequest, NextApiResponse } from 'next'
import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob'

export async function main() {
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

main().catch((err) => {
  console.error('Error running sample:', err.message)
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // bail if there's no user

  try {
    const image = await main()
    res.status(200).json({ image })
  } catch (error) {
    console.log(error)
    res.status(501).json({ error })
  }
}
