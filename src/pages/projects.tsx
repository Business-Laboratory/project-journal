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

  // TODO: figure out the loading state
  if (status === 'loading') {
    return null
  }

  if (status === 'error') {
    return (
      <h1 tw="bl-text-3xl max-w-prose text-center text-matisse-red-200">
        Something went wrong
      </h1>
    )
  }

  const projects = data ?? []

  return (
    <>
      <Head>
        <title>Projects | Project Journal</title>
      </Head>
      <Main>
        {user?.role === 'ADMIN' ? (
          <IconLink pathName="#">
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add project</span>
          </IconLink>
        ) : null}
        {projects.length > 0 ? (
          <div tw="grid lg:grid-cols-2 grid-cols-1 gap-x-16 gap-y-5">
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
  const res = await fetch(`/api/projects`)
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
    <div
      tw="w-9/12 space-y-8 mx-auto max-w-lg lg:max-w-none"
      className={className}
    >
      {children}
    </div>
  )
}

type CardProps = {
  name: string
  description: string | null
  imageUrl: string | null
}
function Card({ name, description, imageUrl }: CardProps) {
  //Ring color is copper-400
  return (
    <Link href={'#'} passHref>
      <a
        css={[
          tw`grid grid-cols-3 col-auto overflow-hidden border-2 rounded border-copper-300 shadow-bl
          focus:outline-none`,
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
