import 'twin.macro'
import { forwardRef } from 'react'
import { iconLinkCss } from './icon-link'

export { IconButton }
export type { IconButtonProps }

type IconButtonProps = React.ComponentPropsWithRef<'button'>

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ children, ...props }, ref) {
    return (
      <button ref={ref} css={iconLinkCss} {...props}>
        {children}
      </button>
    )
  }
)
