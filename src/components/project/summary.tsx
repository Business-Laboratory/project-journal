import 'twin.macro'
import Image from 'next/image'

import { useAuth } from '@components/auth-context'
import { Summary as SummaryModel, User } from '.prisma/client'
import { IconLink } from '@components/icon-link'
import { EditIcon, GearIcon } from 'icons'
import React from 'react'
import { MarkdownWrapper } from '@components/markdown-wrapper'

type SummaryProps = {
  projectId: number
  name: string
  imageUrl: string
  summary: SummaryModel | null
  clientName: string
  clientEmployees: User[]
  team: User[]
}

export function Summary({
  projectId,
  name,
  imageUrl,
  summary,
  clientName,
  clientEmployees,
  team,
}: SummaryProps) {
  const user = useAuth()
  return (
    <aside tw="relative h-full px-14 overflow-y-auto">
      <div tw="space-y-8 py-10">
        {user?.role === 'ADMIN' ? (
          <IconLink pathName={`/project/${projectId}/#`}>
            <GearIcon tw="h-6 w-6" />
            <h1 tw="bl-text-4xl inline">{name}</h1>
          </IconLink>
        ) : (
          <h1 tw="bl-text-4xl">{name}</h1>
        )}
        <div tw="relative h-60 w-full">
          {imageUrl ? (
            <Image
              tw="object-contain"
              layout="fill"
              src={imageUrl}
              alt={name}
            />
          ) : null}
        </div>
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink pathName={`/project/${projectId}/#`}>
              <EditIcon tw="h-6 w-6" />
              <h2 tw="bl-text-3xl inline">Project Description</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Description</h2>
          )}
          {summary?.description ? (
            <MarkdownWrapper>{summary.description}</MarkdownWrapper>
          ) : null}
        </div>
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink pathName={`/project/${projectId}/#`}>
              <EditIcon tw="h-6 w-6" />
              <h2 tw="bl-text-3xl inline">Project Roadmap</h2>
            </IconLink>
          ) : (
            <h2 tw="bl-text-3xl">Project Roadmap</h2>
          )}
          {summary?.roadmap ? (
            <MarkdownWrapper>{summary.roadmap}</MarkdownWrapper>
          ) : null}
        </div>
        <div tw="space-y-6">
          <h3 tw="bl-text-3xl">Project Personnel</h3>
          <div>
            <div tw="bl-text-2xl">Client</div>
            <div tw="bl-text-base">{clientName}</div>
          </div>
          <TeamSection title="Client Team" team={clientEmployees} />
          <TeamSection title="Project Team" team={team} />
        </div>
      </div>
    </aside>
  )
}

type TeamSectionProps = {
  title: string
  team: User[]
}
function TeamSection({ title, team }: TeamSectionProps) {
  return (
    <div>
      <div tw="bl-text-2xl">{title}</div>
      {team.map(({ id, name, email }) => (
        <span key={id}>
          <div tw="bl-text-lg">{name}</div>
          <div tw="bl-text-base">{email}</div>
        </span>
      ))}
    </div>
  )
}
