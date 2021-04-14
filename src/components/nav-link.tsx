import tw, { css } from 'twin.macro'
import Link from 'next/link'

export { NavLink }
export type { NavLinkChildren }

type NavLinkChildren = {
  children: React.ReactNode
  pathName: string
}
function NavLink({ pathName, children }: NavLinkChildren) {
  //Ring color is copper-400
  return (
    <Link href={pathName} passHref>
      <a
        css={[
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
        ]}
      >
        {children}
      </a>
    </Link>
  )
}
