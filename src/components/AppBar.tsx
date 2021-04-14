import tw, { css, theme } from 'twin.macro'
import Link from 'next/link'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuLink,
} from '@reach/menu-button'

import { useAuth } from '@components/auth-context'
import { LogoIcon } from 'icons'

import '@reach/menu-button/styles.css'

export default function AppBar() {
  const { pathname } = useRouter()
  // Will pull auth and projects/clients from context once implemented
  const user = useAuth()

  return (
    <Header>
      <nav tw="inline-flex">
        <NavHome linkDisplay={'Project Journal'} />
        {user?.role === 'ADMIN' &&
        (pathname === '/projects' || pathname === '/clients') ? (
          <div tw="ml-12 space-x-4">
            <NavLink
              pathName={pathname}
              linkName={'/projects'}
              linkDisplay={'Projects'}
            />
            <NavLink
              pathName={pathname}
              linkName={'/clients'}
              linkDisplay={'Clients'}
            />
          </div>
        ) : null}
      </nav>
      {user ? <UserMenu imageUrl={user.image ?? undefined} /> : null}
    </Header>
  )
}

type HeaderProps = {
  className?: string
  children?: React.ReactNode
}
function Header({ className, children }: HeaderProps) {
  return (
    <header
      tw="w-screen h-12 px-4 flex flex-row items-center justify-between bg-gray-yellow-500 top-0 sticky z-10"
      className={className}
    >
      {children}
    </header>
  )
}

type MenuProps = {
  imageUrl?: string
}
function UserMenu({ imageUrl }: MenuProps) {
  const user = useAuth()
  return (
    <Menu>
      <MenuButton tw=" focus:outline-none focus:ring-2 focus:ring-copper-100">
        <div tw="w-6 h-6 rounded-full overflow-hidden hover:ring-2 hover:ring-copper-300">
          {imageUrl ? <img src={imageUrl} alt="" /> : <LogoIcon />}
        </div>
      </MenuButton>
      <MenuList
        css={[
          tw`
            mt-4 py-1 flex flex-col items-center text-gray-yellow-200 bg-gray-yellow-600
            border-solid border border-copper-300
            rounded
            focus:outline-none
          `,
          css`
            [data-reach-menu-item][data-selected] {
              background-color: ${theme('colors[gray-yellow].200')};
              color: ${theme('colors[gray-yellow].600')};
            }
          `,
        ]}
      >
        {user?.role === 'ADMIN' && (
          <Link href="/edit-admins" passHref>
            <MenuLink css={menuItemTw} as="a">
              EDIT ADMINS
            </MenuLink>
          </Link>
        )}
        <MenuItem
          css={menuItemTw}
          onSelect={() => {
            signOut({
              callbackUrl: `/login`,
            })
          }}
        >
          Log out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

type NavHomeProps = {
  linkDisplay: string
}
function NavHome({ linkDisplay }: NavHomeProps) {
  //Ring color is copper-100
  return (
    <Link href="/" passHref>
      <a
        css={[
          tw`bl-text-3xl font-bold text-gray-yellow-100 hover:text-copper-300
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
              --tw-ring-color: rgba(251, 215, 183, var(--tw-ring-opacity));
            }
          `,
        ]}
      >
        {linkDisplay}
      </a>
    </Link>
  )
}

type NavLinkProps = {
  pathName: string
  linkName: string
  linkDisplay: string
}
function NavLink({ pathName, linkName, linkDisplay }: NavLinkProps) {
  //Ring color is copper-100
  return (
    <Link href={linkName} passHref>
      <a
        css={[
          tw`bl-text-3xl focus:outline-none`,
          pathName === linkName
            ? tw`text-gray-yellow-100 hover:underline`
            : tw`text-gray-yellow-300 hover:underline`,
          css`
            &.focus-visible {
              --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                var(--tw-ring-offset-width) var(--tw-ring-offset-color);
              --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
                calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
              box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
                var(--tw-shadow, 0 0 #0000);
              --tw-ring-opacity: 1;
              --tw-ring-color: rgba(251, 215, 183, var(--tw-ring-opacity));
            }
          `,
        ]}
      >
        {linkDisplay}
      </a>
    </Link>
  )
}

const menuItemTw = tw`flex w-full px-3 py-1 text-xs uppercase cursor-pointer text-gray-yellow-200 hover:bg-gray-yellow-200 hover:text-gray-yellow-600 focus:bg-gray-yellow-200 focus:text-gray-yellow-600`
