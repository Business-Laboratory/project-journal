// Client/Admin Home that displays project cards
import tw, { css } from 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import { PlusIcon } from 'icons'

export default function Projects() {
  return (
    <div tw="h-full bg-gray-yellow-100">
      <Head>
        <title>Project Journal</title>
      </Head>
      <Main>
        <Link href={'#'} passHref>
          <a>
            <div tw="p-5 inline-flex space-x-4 items-center">
              <PlusIcon tw="fill-copper-300" />
              <text tw="bl-text-2xl text-gray-yellow-600 hover:text-copper-300">
                Add project
              </text>
            </div>
          </a>
        </Link>
        <div tw="grid p-5 lg:grid-cols-2 grid-cols-1  gap-x-16 gap-y-5">
          {PROJECTS.map((project: ProjectProps) => (
            <Card key={project.id} project={project} />
          ))}
          {PROJECTS.map((project: ProjectProps) => (
            <Card key={project.id} project={project} />
          ))}
        </div>
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
      tw="w-9/12 mt-8 mx-auto overflow-x-hidden overflow-y-auto"
      className={className}
    >
      {children}
    </main>
  )
}

function Card({ project }: { project: ProjectProps }) {
  const { name, description, image } = project

  return (
    <Link href={'#'} passHref>
      <a>
        <div
          css={[
            tw`col-auto grid grid-cols-3 border-2 border-copper-300 rounded shadow-bl`,
            tw`transition duration-300 ease-in-out hover:shadow-bl-lg transform hover:-translate-y-1 hover:-translate-x-1`,
          ]}
        >
          <div tw="col-span-2 border-r border-gray-yellow-300">
            <div tw="p-3 pb-0.5 bl-text-3xl text-gray-yellow-600">{name}</div>
            <div tw="px-3 pb-3 bl-text-base text-gray-yellow-600">
              {description}
            </div>
          </div>
          <div tw="col-span-1">
            <img tw="h-full w-full object-cover" src={image} alt={name} />
          </div>
        </div>
      </a>
    </Link>
  )
}

type ProjectProps = {
  id: number
  name: string
  description: string
  image: string
}
const PROJECTS = [
  {
    id: 1,
    name: 'Project Tracker 2.1',
    description:
      'Update the Project Tracker. Fix bugs. Add TypeScript. Add Testing. Update Input Utilization for multi-project and multi-month input. Add Explore People.',
    image: '/images/project_tracker.png',
  },
  {
    id: 2,
    name: 'Calumet Optimizer',
    description:
      'Optimization of a lubrication plant schedule that generates high revenue + plant value change for a given scenario.',
    image: '/images/calumet_optimizer.png',
  },
]
