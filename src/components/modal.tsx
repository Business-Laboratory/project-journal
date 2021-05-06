import tw, { css } from 'twin.macro'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { Button } from '@components/button'
import { TextInput } from '@components/text-input'
import { CloseIcon } from 'icons'
import { useState } from 'react'

import type { DialogOverlayProps } from '@reach/dialog'
import type { QueryStatus } from 'react-query'
import type { ButtonProps } from '@components/button'

export { Modal, MarkdownTextArea, SaveButton }

function Modal({ children, onDismiss, ...props }: DialogOverlayProps) {
  return (
    <DialogOverlay css={dialogCss} onDismiss={onDismiss} {...props}>
      <DialogContent css={dialogContentCss} aria-label="modal-content">
        <button
          className="group"
          css={closeIconButtonCss}
          onClick={onDismiss}
          aria-label="close modal"
        >
          <CloseIcon tw="w-4 h-4 m-auto fill-gray-yellow-400 group-hover:fill-copper-300" />
        </button>
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}

const dialogCss = [
  // need z-10 because the app bar is in the same stacking context, and also z-10
  tw`bg-gray-yellow-200 bg-opacity-50 z-10 inset-0 fixed overflow-auto`,
  // does not work in firefox
  css`
    backdrop-filter: blur(4px);
  `,
]
const dialogContentCss = tw`relative w-1/2 my-16 mx-auto outline-none min-w-max bg-gray-yellow-100 py-16 px-24 shadow-bl border-2 border-copper-300 rounded`
const closeIconButtonCss = [
  tw`absolute w-12 h-12 top-0 right-0 hover:text-copper-300 focus:outline-none`,
  css`
    &.focus-visible > svg {
      ${tw`ring ring-copper-400`}
    }
  `,
]

function MarkdownTextArea(props: React.ComponentPropsWithoutRef<'textarea'>) {
  return <textarea css={markdownTextAreaCss} {...props} />
}

const markdownTextAreaCss = [
  // padding bottom doesn't work. Found this age old bug https://bugzilla.mozilla.org/show_bug.cgi?id=748518
  tw`w-full h-64 py-6 px-5 overflow-y-scroll resize-none focus:outline-none border border-gray-yellow-600`,
  css`
    min-width: 500px;
  `,
]

function SaveButton({
  onClick,
  disabled,
  variant = 'important',
  children,
  error,
  className,
}: ButtonProps & { error: boolean }) {
  return (
    <div tw="space-y-3" className={className}>
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
  buttonText: string
  onDelete: () => void
  status: QueryStatus
}
export function DeleteSection({
  className,
  label,
  verificationText,
  buttonText,
  status,
  onDelete,
}: DeleteSectionProps) {
  const [verifyText, setVerifyText] = useState('')
  const isTitleUnverified = verificationText !== verifyText

  return (
    <section tw="space-y-10" className={className}>
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
            {buttonText}
          </Button>
          {status === 'error' ? (
            <div role="alert" tw="bl-text-lg text-matisse-red-200 uppercase">
              Failed to delete
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
