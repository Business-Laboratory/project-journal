import tw, { css } from 'twin.macro'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
}
export function Modal({ children, ...props }: ModalProps) {
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
        tw="bg-gray-yellow-100 xl:py-16 xl:px-24 md:py-8 md:px-12 py-4 px-6 shadow-bl border-2 border-copper-300 rounded relative z-30"
        aria-label="modal-content"
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}
