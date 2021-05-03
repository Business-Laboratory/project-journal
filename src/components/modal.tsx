import tw, { css } from 'twin.macro'
import { useState } from 'react'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { Button } from '@components/button'
import { TextInput } from '@components/text-input'
import { CloseIcon } from 'icons'

import type { QueryStatus } from 'react-query'
import type { ButtonProps } from '@components/button'

import '@reach/dialog/styles.css'

export { Modal, MarkdownTextArea, SaveButton }

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
}
function Modal({ children, onDismiss, ...props }: ModalProps) {
  return (
    <DialogOverlay
      css={[
        tw`bg-gray-yellow-200 bg-opacity-50 z-20`,
        // does not work in firefox
        css`
          backdrop-filter: blur(4px);
        `,
      ]}
      onDismiss={onDismiss}
      {...props}
    >
      <DialogContent
        tw="relative min-w-max bg-gray-yellow-100 py-16 px-24 shadow-bl border-2 border-copper-300 rounded z-30"
        aria-label="modal-content"
      >
        <button
          tw="absolute top-3 right-3"
          onClick={onDismiss}
          aria-label="close modal"
        >
          <CloseIcon tw="w-4 h-4" />
        </button>
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}

function MarkdownTextArea(props: React.ComponentPropsWithoutRef<'textarea'>) {
  return (
    <textarea
      // Padding bottom doesn't work. Found this age old bug https://bugzilla.mozilla.org/show_bug.cgi?id=748518
      tw="w-full h-64 py-6 px-5 overflow-y-scroll resize-none focus:outline-none border border-gray-yellow-600"
      css={css`
        min-width: 500px;
      `}
      {...props}
    />
  )
}

function SaveButton({
  onClick,
  disabled,
  variant = 'important',
  children,
  error,
}: ButtonProps & { error: boolean }) {
  return (
    <div tw="space-y-3">
      <Button variant={variant} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
      {error ? (
        <div tw="bl-text-lg uppercase text-matisse-red-200">Failed to save</div>
      ) : null}
    </div>
  )
}

type DeleteSectionProps = {
  className?: string
  label: string
  verificationText: string
  onDelete: () => void
  status: QueryStatus
}
export function DeleteSection({
  className,
  label,
  verificationText,
  status,
  onDelete,
}: DeleteSectionProps) {
  const [verifyText, setVerifyText] = useState('')
  const isTitleUnverified = verificationText !== verifyText

  return (
    <div tw="space-y-10" className={className}>
      <div tw="w-full border-b border-dashed border-matisse-red-200" />
      <div tw="w-full grid grid-cols-2 col-auto gap-x-4">
        <TextInput
          tw="text-left col-span-1"
          label={label}
          placeholder={verificationText}
          value={verifyText}
          onChange={(value) => setVerifyText(value)}
        />
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
