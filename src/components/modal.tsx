import 'twin.macro'
import { Dialog } from '@reach/dialog'

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  close: () => void
}
export function Modal({ children, isOpen, close, ...props }: ModalProps) {
  console.log(isOpen)
  return (
    <Dialog isOpen={isOpen} onDismiss={close} aria-label="modal">
      {children}
    </Dialog>
  )
}
