import tw, { css } from 'twin.macro'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'
import { EditIcon, GearIcon } from 'icons'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { useWaitTimer } from '@utils/use-wait-timer'
import { ProjectModal } from './index'

import type { ProjectData } from 'pages/api/project'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type Team = ProjectData['team']

type SummaryProps = {
  projectId: number
  name: string
  imageUrl: string
  summary: ProjectData['summary']
  clientName: string
  clientEmployees: Team // TODO: update this. There's probably a better way to do this, but I'm just replacing what was here
  team: Team
  status: string
}

export function Summary({
  projectId,
  name,
  imageUrl,
  summary,
  clientName,
  clientEmployees,
  team,
  status,
}: SummaryProps) {
  const user = useAuth()
  const router = useRouter()
  const wait = useWaitTimer()
  let edit = router.query.edit
  if (!edit || Array.isArray(edit)) {
    edit = undefined
  }
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!edit && open) {
      setOpen(false)
    }
    if (!edit) return
    setOpen(true)
  }, [edit, open])

  const close = () => {
    setOpen(false)
    router.replace(`/project/${projectId}`, undefined, { shallow: true })
  }

  if (status === 'error') {
    return (
      <aside
        css={[
          user?.role === 'ADMIN'
            ? css`
                padding-top: 11.875rem;
              `
            : css`
                padding-top: 7.625rem;
              `,
        ]}
      >
        <DataErrorMessage errorMessage="Unable to load summary" />
      </aside>
    )
  }

  if (wait === 'finished' && status === 'loading') {
    //Need precise rem to match the y coordinate of the loading updates spinner
    return (
      <aside
        css={[
          user?.role === 'ADMIN'
            ? css`
                padding-top: 11.875rem;
              `
            : css`
                padding-top: 7.625rem;
              `,
        ]}
      >
        <LoadingSpinner loadingMessage="Loading project summary" />
      </aside>
    )
  }

  // Is there a situation where summary would ever be null?
  if (!summary) return null

  return (
    <aside tw="relative h-full px-14 overflow-y-auto">
      <div tw="space-y-8 py-10">
        {user?.role === 'ADMIN' ? (
          <IconLink pathName={`/project/${projectId}/#`}>
            <GearIcon tw="h-6 w-6 fill-copper-300" />
            {name === '' ? (
              <h1 tw="bl-text-4xl text-gray-yellow-300 inline capitalize">
                Untitled project
              </h1>
            ) : (
              <h1 tw="bl-text-4xl inline">{name}</h1>
            )}
          </IconLink>
        ) : (
          <h1 tw="bl-text-4xl">{name === '' ? 'Untitled Project' : name}</h1>
        )}
        {imageUrl ? (
          <div tw="relative h-60 w-full">
            <Image
              tw="object-contain"
              layout="fill"
              src={imageUrl}
              alt={name}
            />
          </div>
        ) : null}
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink
              pathName={{
                pathname: `/project/${projectId}`,
                query: { edit: 'description' },
              }}
              replace={true}
            >
              <EditIcon tw="h-6 w-6" />
              <h2 tw="bl-text-3xl inline">Project Description</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Description</h2>
          )}
          {summary.description ? (
            <MarkdownWrapper>{summary.description}</MarkdownWrapper>
          ) : null}
        </div>
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink
              pathName={{
                pathname: `/project/${projectId}`,
                query: { edit: 'roadmap' },
              }}
              replace={true}
            >
              <EditIcon tw="h-6 w-6" />
              <h2 tw="bl-text-3xl inline">Project Roadmap</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Roadmap</h2>
          )}
          {summary.roadmap ? (
            <MarkdownWrapper>{summary.roadmap}</MarkdownWrapper>
          ) : null}
        </div>
        <div tw="space-y-2">
          <h3 tw="bl-text-3xl">Project Personnel</h3>
          <div tw="space-y-6">
            <div>
              <div tw="bl-text-2xl">Client</div>
              <div tw="bl-text-base">{clientName}</div>
            </div>
            <TeamSection title="Client Team" team={clientEmployees} />
            <TeamSection title="Project Team" team={team} />
          </div>
        </div>
      </div>
      {(edit === 'description' || edit === 'roadmap') &&
      user?.role === 'ADMIN' ? (
        <ProjectModal
          isOpen={open}
          close={close}
          projectId={projectId}
          data={{
            id: summary.id,
            title:
              edit === 'description'
                ? 'Project Description'
                : 'Project Roadmap',
            // Also don't see any way description/roadmap will be null as
            // they will be initialized as string
            body:
              edit === 'description'
                ? summary.description ?? ''
                : summary.roadmap ?? '',
          }}
        />
      ) : null}
    </aside>
  )
}

function MarkdownWrapper({ children }: { children: string }) {
  return (
    // took list styling from here https://stackoverflow.com/questions/11737266/what-is-default-list-styling-css
    <div
      css={[
        tw`bl-text-base`,
        css`
          ul {
            list-style-type: disc;
            list-style-position: inside;
          }
          ol {
            list-style-type: decimal;
            list-style-position: inside;
          }
          ul ul,
          ol ul {
            list-style-type: circle;
            list-style-position: inside;
            margin-left: 1rem;
          }
          ol ol,
          ul ol {
            list-style-type: lower-latin;
            list-style-position: inside;
            margin-left: 1rem;
          }
        `,
      ]}
    >
      <ReactMarkdown plugins={[gfm]}>{children}</ReactMarkdown>
    </div>
  )
}

type TeamSectionProps = {
  title: string
  team: Team
}
function TeamSection({ title, team }: TeamSectionProps) {
  return (
    <div>
      <div tw="bl-text-2xl">{title}</div>
      <div tw="space-y-2">
        {team.map(({ id, name, email }) => (
          <div key={id}>
            <div tw="bl-text-lg">{name}</div>
            <div tw="bl-text-base">{email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
