import tw from 'twin.macro'
import Link from 'next/link'

export { NavLink }
export type { NavLinkChildren }

type NavLinkChildren = {
  children: React.ReactNode
  pathName: string
}
function NavLink({ pathName, children }: NavLinkChildren) {
  return (
    <Link href={pathName} passHref>
      <a
        tw="inline-flex space-x-2 items-center hover:text-copper-300
            focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400"
      >
        {children}
      </a>
    </Link>
  )
}
