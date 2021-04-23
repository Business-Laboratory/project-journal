import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'focus-visible'

import { AuthProvider } from '@components/auth-context'
import { AppBar } from '@components/app-bar'

import '../styles/globals.css'
import { Button } from '@components/button'

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  return (
    <form
      tw="flex flex-col w-56 space-y-2 py-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (selectedImage === null) {
          return
        }
        try {
          const result = await fetch('/api/generate-upload-blob-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: 1,
              fileName: selectedImage.name,
            }),
          })
          const data = await result.json()
          console.log(data)
        } catch (error) {
          console.error(error)
        }
      }}
    >
      <label htmlFor="img">Select image:</label>
      <input
        type="file"
        id="img"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          if (file) {
            setSelectedImage(file)
          }
        }}
        name="img"
        accept="image/*"
      />
      <Button type="submit" disabled={selectedImage === null}>
        Upload image
      </Button>
    </form>
  )
}

export default App
