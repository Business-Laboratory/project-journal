import 'twin.macro'
import React, { useState } from 'react'

import { Button } from '@components/button'
import { useQueryClient } from 'react-query'

type DeleteSectionProps = {
  id: number
  title: string
  close: () => void
  post: () => Promise<void>
}
export function DeleteSection({ id, title, close, post }: DeleteSectionProps) {
  const [verifyTitle, setVerifyTitle] = useState('')
  const [deleteState, setDeleteState] = useState<'standby' | 'error'>('standby')
  const queryClient = useQueryClient()
  const postDelete = async () => {
    try {
      await post()
      setDeleteState('standby')
      queryClient.invalidateQueries('project')
      close()
    } catch {
      setDeleteState('error')
    }
  }

  return (
    <div tw="space-y-12">
      <div tw="w-full border-b border-dashed border-matisse-red-200" />
      <div tw="w-full grid grid-cols-2 col-auto gap-x-4">
        <div tw="text-left col-span-1">
          <div tw="bl-text-xs text-gray-yellow-300">Verify update title</div>
          <input
            tw="w-full placeholder-gray-yellow-400 border-b border-gray-yellow-600 focus:outline-none"
            type="text"
            value={verifyTitle}
            onChange={(e) => setVerifyTitle(e.target.value)}
            placeholder="Update #"
          />
        </div>
        <div tw="text-right col-span-1 pr-2 space-y-2">
          <Button disabled={title !== verifyTitle} onClick={() => postDelete()}>
            Delete update
          </Button>
          {deleteState === 'error' ? (
            <div tw="bl-text-lg text-matisse-red-200 uppercase">
              Failed to delete
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
