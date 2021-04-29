import tw, { css } from 'twin.macro'
import { useState } from 'react'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { Button } from '@components/button'

import type { QueryStatus } from 'react-query'
import '@reach/dialog/styles.css'

export { Modal }

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
}
function Modal({ children, ...props }: ModalProps) {
  return (
    <DialogOverlay
      css={[
        tw`bg-gray-yellow-200 bg-opacity-50 z-20`,
        // does not work in firefox
        css`
          backdrop-filter: blur(4px);
        `,
      ]}
      {...props}
    >
      <DialogContent
        tw="min-w-max bg-gray-yellow-100 py-16 px-24 shadow-bl border-2 border-copper-300 rounded relative z-30"
        aria-label="modal-content"
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}

type DeleteSectionProps = {
  verificationText: string
  onDelete: () => void
  status: QueryStatus
}
export function DeleteSection({
  verificationText,
  status,
  onDelete,
}: DeleteSectionProps) {
  const [verifyText, setVerifyText] = useState('')
  const isTitleUnverified = verificationText !== verifyText

  return (
    <div tw="space-y-10">
      <div tw="w-full border-b border-dashed border-matisse-red-200" />
      <div tw="w-full grid grid-cols-2 col-auto gap-x-4">
        <div tw="text-left col-span-1">
          <div tw="bl-text-xs text-gray-yellow-300">Verify update title</div>
          <input
            tw="w-full placeholder-gray-yellow-400 border-b border-gray-yellow-600 focus:outline-none"
            type="text"
            value={verifyText}
            onChange={(e) => setVerifyText(e.target.value)}
            placeholder={verificationText}
          />
        </div>
        <div tw="text-center ml-auto max-w-max col-span-1 space-y-2">
          <Button
            disabled={isTitleUnverified || status === 'loading'}
            onClick={() => {
              if (isTitleUnverified) return
              onDelete()
            }}
            variant="danger"
          >
            {status === 'loading' ? 'Deleting...' : 'Delete update'}
          </Button>
          {status === 'error' ? (
            <div tw="bl-text-lg text-matisse-red-200 uppercase">
              Failed to delete
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
