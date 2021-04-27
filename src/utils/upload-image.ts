import { BlockBlobClient } from '@azure/storage-blob'

export async function uploadImage(sasUrl: string, file: File) {
  const blobService = new BlockBlobClient(sasUrl)

  const arrayBuffer = await file.arrayBuffer()
  await blobService.uploadData(arrayBuffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  })

  // everything before the query parameter should be the blob's url
  const imageStorageBlobUrl = sasUrl.split('?')[0]
  return imageStorageBlobUrl
}
