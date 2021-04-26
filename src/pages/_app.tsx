import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'focus-visible'

import { AuthProvider } from '@components/auth-context'
import { AppBar } from '@components/app-bar'
import { Button } from '@components/button'

import '../styles/globals.css'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      {/* this style is applied to avoid the "bounce" on iOS/macOS: https://stackoverflow.com/a/21247262/10128987 */}
      <div tw="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-yellow-100 text-gray-yellow-600">
        <AuthProvider>
          <AppBar />
          <TempImageUpload />
          {
            // get a page root if one was set
            Component.PageLayout ? (
              <Component.PageLayout>
                <Component {...pageProps} />
              </Component.PageLayout>
            ) : (
              <Component {...pageProps} />
            )
          }
        </AuthProvider>
      </div>
    </QueryClientProvider>
  )
}

function TempImageUpload() {
  const [{ selectedImage, status }, setSelectedImage] = useState<{
    selectedImage: File | null
    status: 'noData' | 'ready' | 'uploading' | 'successful' | 'error'
  }>({ selectedImage: null, status: 'noData' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedImage === null || status === 'uploading') {
      return
    }

    setSelectedImage((prev) => ({ ...prev, status: 'uploading' }))

    try {
      const result = await fetch('/api/generate-upload-blob-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 1,
          fileName: selectedImage.name,
        }),
      })
      const { sasUrl } = await result.json()

      // lazy load the image uploader since it's pretty large
      const { uploadImage } = await import('@utils/upload-image')

      const imageStorageBlobUrl = await uploadImage(sasUrl, selectedImage)
      await fetch('/api/update-project-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          imageStorageBlobUrl,
        }),
      })
      // force the projects to re-query so the image changes
      queryClient.invalidateQueries('projects')
      setSelectedImage((prev) => ({ ...prev, status: 'successful' }))
    } catch (error) {
      setSelectedImage((prev) => ({ ...prev, status: 'error' }))
      console.error(error)
    }
  }

  return (
    <form tw="flex flex-col w-56 space-y-2 py-4" onSubmit={handleSubmit}>
      <label htmlFor="img">Select image:</label>
      <input
        type="file"
        id="img"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          if (file) {
            setSelectedImage({ selectedImage: file, status: 'ready' })
          }
        }}
        name="img"
        accept="image/*"
      />
      <Button
        type="submit"
        disabled={
          status === 'noData' ||
          status === 'uploading' ||
          status === 'successful'
        }
      >
        {status === 'uploading'
          ? 'uploading image...'
          : status === 'successful'
          ? 'upload successful'
          : 'upload image'}
      </Button>
    </form>
  )
}

export default App
