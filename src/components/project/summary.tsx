import 'twin.macro'
import Image from 'next/image'

import { IconLink } from '@components/icon-link'
import { EditIcon, GearIcon } from 'icons'
import { LoadingSpinner } from '@components/loading-spinner'
import { DataErrorMessage } from '@components/data-error-message'
import { RenderMarkdown } from '@components/render-markdown'
import {
  SummaryModal,
  SettingsModal,
  createEditDescriptionHref,
  createEditRoadmapHref,
  createSettingsHref,
} from './index'
import type { QueryStatus } from 'react-query'
import type { Role } from '@prisma/client'
import type { ProjectData, ProjectId } from 'pages/api/project'

export { Summary, LoadingSummary }

// types
type Team = ProjectData['team']

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
  userRole: Role
  project: Omit<ProjectData, 'id'> & { id: ProjectId }
}
function Summary({ userRole, project }: SummaryProps) {
  const { id: projectId, name, imageUrl, client, team, summary } = project
  const clientEmployees = client?.employees.map(({ user }) => user) ?? []

  return (
    <>
      <SummaryWrapper>
        {userRole === 'ADMIN' ? (
          <IconLink href={createSettingsHref(projectId)} replace={true}>
            <GearIcon tw="h-6 w-6 fill-copper-300" />
            {!name || name === '' ? (
              <h1 tw="bl-text-4xl text-gray-yellow-300 inline capitalize">
                Untitled project
              </h1>
            ) : (
              <h1 tw="bl-text-4xl inline">{name}</h1>
            )}
          </IconLink>
        ) : (
          <h1 tw="bl-text-4xl">
            {name === '' || !name ? 'Untitled Project' : name}
          </h1>
        )}
        {imageUrl ? (
          <div tw="relative h-60 w-full">
            <Image
              tw="object-contain"
              layout="fill"
              src={imageUrl ?? ''}
              alt={name ?? ''}
            />
          </div>
        ) : null}
        <div tw="space-y-2">
          {userRole === 'ADMIN' ? (
            <IconLink
              href={createEditDescriptionHref(projectId)}
              replace={true}
            >
              <EditIcon tw="h-6 w-6 fill-copper-300" />
              <h2 tw="bl-text-3xl inline">Project Description</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Description</h2>
          )}
          {summary?.description ? (
            <RenderMarkdown>{summary.description}</RenderMarkdown>
          ) : null}
        </div>
        <div tw="space-y-2">
          {userRole === 'ADMIN' ? (
            <IconLink href={createEditRoadmapHref(projectId)} replace={true}>
              <EditIcon tw="h-6 w-6 fill-copper-300" />
              <h2 tw="bl-text-3xl inline">Project Roadmap</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Roadmap</h2>
          )}
          {summary?.roadmap ? (
            <RenderMarkdown>{summary.roadmap}</RenderMarkdown>
          ) : null}
        </div>
        <div tw="space-y-2">
          <h3 tw="bl-text-3xl">Project Personnel</h3>
          <div tw="space-y-6">
            <div>
              <div tw="bl-text-2xl">Client</div>
              <div tw="bl-text-base">{client?.name ?? ''}</div>
            </div>
            <TeamSection title="Client Team" team={clientEmployees} />
            <TeamSection title="Project Team" team={team} />
          </div>
        </div>
      </SummaryWrapper>
      {userRole === 'ADMIN' ? (
        <>
          <SummaryModal projectId={projectId} summary={summary} />
          <SettingsModal project={project} />
        </>
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
