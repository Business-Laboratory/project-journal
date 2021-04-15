// Client/Admin Home that displays project cards
import tw, { css, theme } from 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { PlusIcon } from 'icons'
import { useQuery } from 'react-query'
import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'

import type { QueryFunction } from 'react-query'
import type { ProjectsData } from './api/projects'

export default function Projects() {
  const user = useAuth()
  const { status, data } = useQuery('projects', fetchProjects)

  if (status === 'error') {
    return (
      <div tw="space-y-6">
        <h1 tw="bl-text-3xl text-center text-matisse-red-200 uppercase">
          Unable to load projects
        </h1>
        <div tw="max-w-max mx-auto">
          <p tw="bl-text-2xl text-center">If the issue continues email</p>
          <a
            href="mailto:help@business-laboratory.com"
            tw="bl-text-2xl text-copper-300"
          >
            help@business-laboratory.com
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Projects | Project Journal</title>
      </Head>
      <main tw="pt-10 w-9/12 space-y-8 mx-auto max-w-lg lg:max-w-none">
        {user?.role === 'ADMIN' ? (
          <IconLink pathName="#">
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add project</span>
          </IconLink>
        ) : null}

        <CardGrid status={status} data={data} />
      </main>
    </>
  )
}

const fetchProjects: QueryFunction<ProjectsData> = async () => {
  const res = await fetch(`/api/projects`)
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}

type CardProps = {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
}
function Card({ id, name, description, imageUrl }: CardProps) {
  //Ring color is copper-400
  return (
    <Link href={`/project/${id}`} passHref>
      <a
        css={[
          tw`grid grid-cols-3 col-auto overflow-hidden border-2 rounded border-copper-300 shadow-bl focus:outline-none`,
          tw`transition duration-300 ease-in-out hover:shadow-bl-lg`,
          css`
            :hover {
              transform: translate(
                -${theme('spacing.1')},
                -${theme('spacing.1')}
              );
            }
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

type Project = {
  name: string | null
  imageUrl: string | null
  summary: {
    description: string | null
  } | null
  id: number
}

type CardGridProps = {
  status: string
  data:
    | {
        id: number
        name: string | null
        imageUrl: string | null
        summary: {
          description: string | null
        } | null
      }[]
    | undefined
}
function CardGrid({ status, data }: CardGridProps) {
  if (status === 'loading') {
    return <p>ToDo: spinner</p>
  }

  //const projects = data ?? []
  const projects = [
    {
      clientId: null,
      id: 2,
      imageUrl:
        'https://projectjournalassets.blob.core.windows.net/project-images/project_tracker.png?sv=2020-06-12&se=2021-04-15T21%3A08%3A55Z&sr=b&sp=r&sig=raBPY7YzcXwyeS5koabseruCBbNKIEzTFtIjuhCjqvk%3D&rscc=public%2C%20max-age%3D86400%2C%20immutable',
      name: 'Project Tracker 2.1',
      summary: null,
    },
    {
      clientId: 3,
      id: 1,
      imageUrl: null,
      name: 'Calumet Optimizer',
      summary: {
        description:
          'Optimization of a lubrication plant schedule that …evenue + plant value change for a given scenario.',
      },
    },
  ]

  return projects.length > 0 ? (
    <div tw="grid lg:grid-cols-2 grid-cols-1 gap-x-16 gap-y-5">
      {projects.map((project: Project, idx) => (
        <Card
          key={project.id}
          id={project.id}
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
  )
}
