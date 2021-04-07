// Alternate Admin Home view that displays clients
import tw, { css } from 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import { PlusIcon, EditIcon } from 'icons'

export default function Clients() {
  return (
    <div tw="h-full bg-gray-yellow-100">
      <Head>
        <title>Project Journal</title>
      </Head>
      <Main>
        <Link href={'#'} passHref>
          <a>
            <div tw="py-5 inline-flex space-x-4 items-center text-gray-yellow-600 hover:text-copper-300">
              <PlusIcon tw="fill-copper-300" />
              <text tw="bl-text-2xl ">Add client</text>
            </div>
          </a>
        </Link>
        {CLIENTS.map(({ id, name, employees }: ClientProps) => (
          <div key={id} tw="pb-6">
            <div tw="pb-2 inline-flex items-center space-x-2">
              <EditIcon tw="stroke-copper-300 cursor-pointer" />
              <text tw="bl-text-3xl text-gray-yellow-600">{name}</text>
            </div>
            {employees.map(({ id: eId, name, email, role }: EmployeeProps) => (
              <div key={eId} tw="grid grid-cols-3 col-auto">
                <text tw="bl-text-base text-gray-yellow-600 col-span-1 py-1">
                  {name}
                </text>
                <text tw="bl-text-base text-gray-yellow-600 col-span-1 py-1">
                  {email}
                </text>
                <text tw="bl-text-base text-gray-yellow-600 col-span-1 py-1">
                  {role}
                </text>
              </div>
            ))}
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
      tw="w-7/12 mt-8 mx-auto overflow-x-hidden overflow-y-auto"
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
