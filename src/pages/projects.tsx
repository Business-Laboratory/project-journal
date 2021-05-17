// Client/Admin Home that displays project cards
import tw, { css, theme } from 'twin.macro'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import { PlusIcon } from 'icons'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { useAuth } from '@components/auth-context'
import { useProjects } from '@queries/useProjects'
import { usePrefetchProject } from '@queries/useProject'
import { usePrefetchUpdates } from '@queries/useUpdates'
import { IconLink } from '@components/icon-link'
import { createSettingsHref } from '@components/project'

export default function Projects() {
  return (
    <>
      <Head>
        <title>Projects | Project Journal</title>
      </Head>
      <main tw="pt-10 w-9/12 space-y-8 mx-auto max-w-lg lg:max-w-none">
        <CardGrid />
      </main>
    </>
  )
}

function CardGrid() {
  const user = useAuth()
  const { data, status } = useProjects()

  if (status === 'error') {
    return <DataErrorMessage errorMessage="Unable to load projects" />
  }

  // when the user or the projects data is still loading, return nothing for 1 second, and then a spinner
  if (!user || status === 'loading') {
    return <LoadingSpinner loadingMessage="Loading projects" />
  }

  const userNameFormatted = user.name ?? 'you'
  const projects = data ?? []

  return (
    <>
      <IconLink href={createSettingsHref('new')}>
        <PlusIcon tw="w-6 h-6 fill-copper-300" />
        <span tw="bl-text-2xl">Add project</span>
      </IconLink>
      {projects.length > 0 ? (
        <div tw="grid lg:grid-cols-2 grid-cols-1 gap-x-16 gap-y-5">
          {projects.map((project, idx) => (
            <Card
              key={project.id}
              id={project.id}
              name={
                project.name ? project.name : `Untitled Project (${idx + 1})`
              }
              description={project.summary?.description ?? null}
              imageUrl={project.imageUrl}
            />
          ))}
        </div>
      ) : (
        <h1 tw="bl-text-3xl max-w-prose text-center">
          There are currently no projects assigned to {userNameFormatted}
        </h1>
      )}
    </>
  )
}

type CardProps = {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
}
function Card({ id, name, description, imageUrl }: CardProps) {
  const prefetchProject = usePrefetchProject(id)
  const prefetchUpdates = usePrefetchUpdates(id)

  return (
    <Link href={`/project/${id}`} passHref>
      <a
        css={[
          tw`grid grid-cols-3 col-auto overflow-hidden border-2 rounded border-copper-300 shadow-bl focus:outline-none`,
          tw`transition duration-300 ease-in-out hover:shadow-bl-lg`,
          css`
            min-height: 10rem;
            :hover {
              transform: translate(
                -${theme('spacing.1')},
                -${theme('spacing.1')}
              );
            }
            &.focus-visible {
              ${tw`ring-2 ring-copper-400 `}
            }
          `,
        ]}
        onFocus={() => {
          prefetchProject()
          prefetchUpdates()
        }}
        onMouseOver={() => {
          prefetchProject()
          prefetchUpdates()
        }}
      >
        {imageUrl ? (
          <>
            <div tw="col-span-2 border-r border-gray-yellow-300">
              <div tw="p-3 pb-0.5 bl-text-3xl">{name}</div>
              <div tw="px-3 pb-3 bl-text-base">{description}</div>
            </div>
            <div tw="relative col-span-1">
              <Image
                tw="object-cover"
                layout="fill"
                src={imageUrl}
                alt={name}
              />
            </div>
          </>
        ) : (
          <div tw="col-span-3 border-gray-yellow-300">
            <div tw="p-3 pb-0.5 bl-text-3xl">{name}</div>
            <div tw="px-3 pb-3 bl-text-base">{description}</div>
          </div>
        )}
      </a>
    </Link>
  )
}
