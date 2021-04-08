// Alternate Admin Home view that displays clients
import 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import { PlusIcon, EditIcon } from 'icons'
import { Fragment } from 'react'

export default function Clients() {
  return (
    <div>
      <Head>
        <title>Clients | Project Journal</title>
      </Head>
      <Main>
        <Link href={'#'} passHref>
          <a>
            <div tw="inline-flex space-x-4 items-center hover:text-copper-300">
              <PlusIcon tw="w-6 h-6" />
              <span tw="bl-text-2xl">Add client</span>
            </div>
          </a>
        </Link>
        {CLIENTS.map(({ id, name, employees }: ClientProps) => (
          <div key={id} tw="space-y-4">
            <div tw="inline-flex items-center space-x-2">
              <EditIcon tw="cursor-pointer w-7 h-7" />
              <span tw="bl-text-3xl">{name}</span>
            </div>
            <div tw="grid grid-cols-3 gap-x-3 gap-y-2 bl-text-lg">
              <span tw="col-span-1">Name</span>
              <span tw="col-span-1">Email</span>
              <span tw="col-span-1">Role</span>
              {employees.map(
                ({ id: eId, name, email, role }: EmployeeProps) => (
                  <Fragment key={eId}>
                    <span tw="bl-text-base col-span-1">{name}</span>
                    <span tw="bl-text-base col-span-1">{email}</span>
                    <span tw="bl-text-base col-span-1">{role}</span>
                  </Fragment>
                )
              )}
            </div>
          </div>
        ))}
      </Main>
    </div>
  )
}

type MainProps = {
  className?: string
  children?: React.ReactNode
}
function Main({ className, children }: MainProps) {
  return (
    <main
      tw="max-w-max mt-10 mx-auto space-y-8 text-gray-yellow-600 overflow-x-hidden overflow-y-auto"
      className={className}
    >
      {children}
    </main>
  )
}

type ClientProps = {
  id: number
  name: string
  employees: EmployeeProps[]
}
type EmployeeProps = {
  id: number
  name: string
  email: string
  role: string
}
const CLIENTS = [
  {
    id: 1,
    name: 'Kaneka',
    employees: [
      {
        id: 1,
        name: 'Tove Jansson',
        email: 'tv@lit.com',
        role: 'Fiction Writer',
      },
      {
        id: 2,
        name: 'B.H. Fairchild',
        email: 'midwest@lit.com',
        role: 'Poet',
      },
      {
        id: 3,
        name: 'James Wood',
        email: 'forestlover@lit.com',
        role: 'Critic',
      },
    ],
  },
  {
    id: 2,
    name: 'Chevron',
    employees: [
      {
        id: 1,
        name: 'Gunter Grass',
        email: 'german@lit.com',
        role: 'Fiction Writer',
      },
    ],
  },
  {
    id: 3,
    name: 'Calumet',
    employees: [
      {
        id: 1,
        name: 'Marilynne Robinson',
        email: 'lila@lit.com',
        role: 'Essayist',
      },
      {
        id: 2,
        name: 'Mary Ruffle',
        email: 'honey@lit.com',
        role: 'Poet',
      },
    ],
  },
]
