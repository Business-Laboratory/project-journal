// Client/Admin Home

import tw, { css } from 'twin.macro'
import { useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/projects')
  }, [router])
  return null
}
