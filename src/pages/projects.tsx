// Client/Admin Home that displays project cards
import tw from 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { PlusIcon } from 'icons'
import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectsData } from './api/projects'

export default function Projects() {
  const { status, data } = useQuery('projects', fetchProjects)

  if (status === 'loading') {
    return <p>It's loading</p>
  }

  if (status === 'error') {
    return <p>It's error'</p>
  }

  const projects = data ?? []

  return (
    <>
      <Head>
        <title>Projects | Project Journal</title>
      </Head>
      <Main>
        <Link href={'#'} passHref>
          <a tw="p-5 inline-flex space-x-4 items-center hover:text-copper-300">
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add project</span>
          </a>
        </Link>
        {projects.length > 0 ? (
          <div tw="grid p-5 lg:grid-cols-2 grid-cols-1 gap-x-16 gap-y-5">
            {projects.map((project, idx) => (
              <Card
                key={project.id}
                name={project.name ?? `Untitled Project (${idx + 1})`}
                description={project.summary?.description ?? null}
                imageUrl={project.imageUrl}
              />
            ))}
          </div>
        ) : (
          <h1 tw="bl-text-3xl max-w-prose text-center">
            There are currently no projects assigned to you
          </h1>
        )}
      </Main>
    </>
  )
}

const fetchProjects: QueryFunction<ProjectsData> = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/projects`)
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}

type MainProps = {
  className?: string
  children?: React.ReactNode
}
function Main({ className, children }: MainProps) {
  return (
    <main tw="w-9/12 mt-8 mx-auto text-gray-yellow-600" className={className}>
      {children}
    </main>
  )
}

type CardProps = {
  name: string
  description: string | null
  imageUrl: string | null
}
function Card({ name, description, imageUrl }: CardProps) {
  return (
    <Link href={'#'} passHref>
      <a
        css={[
          tw`grid grid-cols-3 col-auto border-2 rounded border-copper-300 shadow-bl`,
          tw`transition duration-300 ease-in-out transform hover:shadow-bl-lg hover:-translate-y-1 hover:-translate-x-1`,
        ]}
      >
        <div tw="col-span-2 border-r border-gray-yellow-300">
          <div tw="p-3 pb-0.5 bl-text-3xl">{name}</div>
          <div tw="px-3 pb-3 bl-text-base">{description}</div>
        </div>
        <div tw="relative col-span-1">
          {imageUrl ? (
            <Image tw="object-cover" layout="fill" src={imageUrl} alt={name} />
          ) : null}
        </div>
      </a>
    </Link>
  )
}

type ProjectProps = {
  id: number
  name: string
  description: string
  imageUrl: string
}
const PROJECTS = [
  {
    id: 1,
    name: 'Project Tracker 2.1',
    description:
      'Update the Project Tracker. Fix bugs. Add TypeScript. Add Testing. Update Input Utilization for multi-project and multi-month input. Add Explore People.',
    imageUrl: '/images/project_tracker.png',
  },
  {
    id: 2,
    name: 'Calumet Optimizer',
    description:
      'Optimization of a lubrication plant schedule that generates high revenue + plant value change for a given scenario.',
    imageUrl: '/images/calumet_optimizer.png',
  },
]
