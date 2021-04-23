import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob'

export {
  blobServiceClient,
  generateSasUrl,
  uploadImage,
  generateSasUrlForImageUpload,
}

declare global {
  var blobServiceClientGlobal: BlobServiceClient
}

let blobServiceClient: BlobServiceClient
// check to use this workaround only in development and not in production
if (process.env.NODE_ENV === 'production') {
  blobServiceClient = createBlobServiceClient()
} else {
  if (!global.blobServiceClientGlobal) {
    global.blobServiceClientGlobal = createBlobServiceClient()
  }
  blobServiceClient = global.blobServiceClientGlobal
}

function createBlobServiceClient() {
  return BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING ?? ''
  )
}

/**
 * Generates a SAS url for a default of 1 day. Returns the existing url if it is not expired
 * @param url
 * @param storageBlobUrl
 * @param maxAge
 * @returns
 */
async function generateSasUrl(
  url: string | null,
  storageBlobUrl: string,
  maxAge = 60 * 60 * 24
) {
  // return the url if it's not expired
  if (url !== null && !isSasUrlExpired(url)) {
    return url
  }

  // otherwise create a new url

  // remove the beginning of the url to get the path
  const storageBlobSegments = storageBlobUrl
    .replace(blobServiceClient.url, '')
    .split('/')
  if (storageBlobSegments.length !== 2) {
    throw new Error(
      `Invalid URL: ${storageBlobUrl}. Must contain only 2 segments, contained ${storageBlobSegments.length}`
    )
  }
  const [containerName, blockBlobName] = storageBlobSegments

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blockBlobName)

  const expiresOn = new Date(Date.now() + maxAge * 1000)

  return await blockBlobClient.generateSasUrl({
    permissions: ContainerSASPermissions.parse('r'),
    expiresOn,
    cacheControl: `public, max-age=${maxAge}, immutable`,
  })
}

/**
 * Checks whether or not a SAS url is expire
 * @param sasUrl
 */
function isSasUrlExpired(sasUrl: string) {
  const params = new URLSearchParams(sasUrl)
  const expiration = params.get('se')
  // if there is no expiration stamp, assume it is expired so a new url will be generated
  if (expiration === null) {
    return true
  }

  const timeLeft = new Date(expiration).valueOf() - Date.now()

  return Number.isNaN(timeLeft) || timeLeft <= 0
}

// TODO: Update to not require a base64 dataURL
async function uploadImage(name: string, contentType: string, dataUrl: string) {
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

async function generateSasUrlForImageUpload(
  containerName: string,
  blockBlobName: string,
  maxAge = 60
) {
  // get the container, creating it if none exists
  const containerClient = blobServiceClient.getContainerClient(containerName)
  await containerClient.createIfNotExists()
  const blockBlobClient = containerClient.getBlockBlobClient(blockBlobName)

  const expiresOn = new Date(Date.now() + maxAge * 1000)

  return await blockBlobClient.generateSasUrl({
    permissions: ContainerSASPermissions.parse('w'),
    expiresOn,
    cacheControl: `public, max-age=${maxAge}, immutable`,
  })
}
