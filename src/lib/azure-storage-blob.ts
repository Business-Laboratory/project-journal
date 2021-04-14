import { BlobServiceClient } from '@azure/storage-blob'

export { blobServiceClient }

declare global {
  var blobServiceClientGlobal: BlobServiceClient
}

let blobServiceClient: BlobServiceClient
// check to use this workaround only in development and not in production
if (process.env.NODE_ENV === 'production') {
  blobServiceClient = createBlobServiceClient()
} else {
  if (!global.prismaClient) {
    global.blobServiceClientGlobal = createBlobServiceClient()
  }
  blobServiceClient = global.blobServiceClientGlobal
}

function createBlobServiceClient() {
  return BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING ?? ''
  )
}
