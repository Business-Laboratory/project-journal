import { BlockBlobClient } from '@azure/storage-blob'

export async function uploadImage(sasUrl: string, file: File) {
  const blobService = new BlockBlobClient(sasUrl)

  const arrayBuffer = await file.arrayBuffer()
  blobService.uploadData(arrayBuffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  })
}
