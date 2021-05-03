import tw, { css } from 'twin.macro'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { IconLink } from '@components/icon-link'
import { EditIcon, GearIcon } from 'icons'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { SummaryModal } from './index'

import type { QueryStatus } from 'react-query'
import type { Role } from '@prisma/client'
import type { Project } from '@queries/useProject'
import { createDescriptionPath, createRoadmapProject } from './summary-modal'

export { Summary, LoadingSummary }

// types

type Team = Project['team']
type ClientEmployees = Exclude<
  Project['client'],
  null
>['employees'][0]['user'][]

type LoadingSummaryProps = {
  status: QueryStatus
}
function LoadingSummary({ status }: LoadingSummaryProps) {
  return (
    <SummaryWrapper>
      {status === 'error' ? (
        <DataErrorMessage errorMessage="Unable to load summary" />
      ) : (
        <LoadingSpinner loadingMessage="Loading project summary" />
      )}
    </SummaryWrapper>
  )
}

type SummaryProps = {
  projectId: number
  userRole: Role
  name: string
  imageUrl: string
  summary: Project['summary']
  clientName: string
  clientEmployees: ClientEmployees
  team: Team
}
function Summary({
  projectId,
  userRole,
  name,
  imageUrl,
  summary,
  clientName,
  clientEmployees,
  team,
}: SummaryProps) {
  // Is there a situation where summary would ever be null?
  if (!summary) return null

  return (
    <>
      <SummaryWrapper>
        {userRole === 'ADMIN' ? (
          <IconLink href={`/project/${projectId}/#`}>
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
          {userRole === 'ADMIN' ? (
            <IconLink href={createDescriptionPath(projectId)} replace={true}>
              <EditIcon tw="h-6 w-6 fill-copper-300" />
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
          {userRole === 'ADMIN' ? (
            <IconLink href={createRoadmapProject(projectId)} replace={true}>
              <EditIcon tw="h-6 w-6 fill-copper-300" />
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
      </SummaryWrapper>

      {userRole === 'ADMIN' ? (
        <SummaryModal projectId={projectId} summary={summary} />
      ) : null}
    </>
  )
}

function SummaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <aside tw="relative h-full px-14 overflow-y-auto space-y-8 py-10">
      {children}
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
