import tw, { css } from 'twin.macro'
import Link from 'next/link'

import type { LinkProps } from 'next/link'
import type { Url } from 'url'

export { IconLink }
export type { IconLinkProps }

type IconLinkProps = LinkProps & {
  children: React.ReactNode
  className?: string
  as?: (string & Url) | undefined // not sure why, but LinkProps['as'] is not actually correct
}

function IconLink({ className, children, href, ...props }: IconLinkProps) {
  return (
    <Link href={href} passHref {...props}>
      <a css={iconLinkCss} className={className}>
        {children}
      </a>
    </Link>
  )
}

// ring color is copper-400
const iconLinkCss = [
  tw`inline-flex space-x-2 items-center hover:text-copper-300
    focus:outline-none`,
  css`
    &.focus-visible {
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
        var(--tw-ring-offset-width) var(--tw-ring-offset-color);
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
        calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
        var(--tw-shadow, 0 0 #0000);
      --tw-ring-opacity: 1;
      --tw-ring-color: rgba(171, 133, 94, var(--tw-ring-opacity));
    }
  `,
]
