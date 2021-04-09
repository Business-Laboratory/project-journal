import tw, { css } from 'twin.macro'
import Link from 'next/link'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button'

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
        <Link href="/" passHref>
          <a tw="bl-text-3xl font-bold text-gray-yellow-100">Project Journal</a>
        </Link>
        {user?.role === 'ADMIN' &&
        (pathname === '/projects' || pathname === '/clients') ? (
          <div tw="ml-12 space-x-4">
            <Link href="/projects" passHref>
              <a
                css={[
                  tw`bl-text-3xl`,
                  pathname === '/projects'
                    ? tw`underline text-gray-yellow-100`
                    : tw`text-gray-yellow-300`,
                ]}
              >
                Projects
              </a>
            </Link>
            <Link href="/clients" passHref>
              <a
                css={[
                  tw`bl-text-3xl`,
                  pathname === '/clients'
                    ? tw`underline text-gray-yellow-100`
                    : tw`text-gray-yellow-300`,
                ]}
              >
                Clients
              </a>
            </Link>
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
  const router = useRouter()
  return (
    <Menu>
      <MenuButton>
        <div tw="w-6 h-6 rounded-full overflow-hidden">
          {imageUrl ? <img src={imageUrl} alt="" /> : <LogoIcon />}
        </div>
      </MenuButton>
      <MenuList
        css={[
          tw`
            mt-4 py-1 flex flex-col items-center bg-gray-yellow-600
            border-solid border border-copper-300
            rounded
          `,
          css`
            // #FFFEFD is gray-yellow-100 and #2C2925 is gray-yellow-600
            [data-reach-menu-item][data-selected] {
              background-color: #fffefd;
              color: #2c2925;
            }
          `,
        ]}
      >
        <MenuItem
          css={menuItemTw}
          onSelect={() => {
            router.push('/edit-admins')
          }}
        >
          EDIT ADMINS
        </MenuItem>
        <MenuItem
          css={menuItemTw}
          onSelect={() => {
            signOut({
              callbackUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL}/login`,
            })
          }}
        >
          Log out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

const menuItemTw = tw`flex w-full px-3 py-1 text-xs uppercase cursor-pointer text-gray-yellow-200 hover:bg-gray-yellow-200 hover:text-gray-yellow-600 focus:bg-gray-yellow-200 focus:text-gray-yellow-600`
