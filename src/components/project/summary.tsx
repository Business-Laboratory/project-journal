import 'twin.macro'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { useAuth } from '@components/auth-context'
import { Summary as SummaryModel, User } from '.prisma/client'
import { IconLink } from '@components/icon-link'
import { EditIcon, GearIcon } from 'icons'
import React from 'react'

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
    <aside tw="relative h-full py-10 px-14 overflow-y-auto">
      <div tw="w-full mx-auto space-y-8">
        {user?.role === 'ADMIN' ? (
          <IconLink pathName={`/project/${projectId}/#`}>
            <GearIcon tw="h-6 w-6" />
            <span tw="bl-text-4xl">{name}</span>
          </IconLink>
        ) : (
          <div tw="bl-text-4xl">{name}</div>
        )}
        <div tw="relative">
          {imageUrl ? (
            <Image tw="object-cover" layout="fill" src={imageUrl} alt={name} />
          ) : null}
        </div>
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink pathName={`/project/${projectId}/#`}>
              <EditIcon tw="h-6 w-6" />
              <span tw="bl-text-3xl">Project Description</span>
            </IconLink>
          ) : (
            <div tw="bl-text-3xl">Project Description</div>
          )}
          {summary?.description ? (
            <ReactMarkdown plugins={[gfm]}>{summary.description}</ReactMarkdown>
          ) : null}
        </div>
        <div tw="space-y-2">
          {user?.role === 'ADMIN' ? (
            <IconLink pathName={`/project/${projectId}/#`}>
              <EditIcon tw="h-6 w-6" />
              <span tw="bl-text-3xl">Project Roadmap</span>
            </IconLink>
          ) : (
            <div tw="bl-text-3xl">Project Roadmap</div>
          )}
          {summary?.roadmap ? (
            <div tw="bl-text-base">
              <ReactMarkdown plugins={[gfm]}>
                {`## Prep
    1. ~~Test versus HVM1 — because we want to see that the old/new versions of the generator work on that problem~~
    2. Move the block length correction out of the simulation — because our algorithm will otherwise give uncorrected block lengths
    3. Write a test for schedule format — to make sure the new stuff is generating the correct format for the simulator
    4. Modify optimization code and deploy
    5. Build lookups to make accessing data more straightforward
## Write Algorithm
    1. Run tree class on actual data to generate tree of units
    2. Trace the unit alignment forward using the tiers of the tree
    3. Trace the unit alignment backward using the tiers of the tree`}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
        <div tw="space-y-6">
          <span tw="bl-text-3xl">Project Personnel</span>
          <ClientSection>
            <div tw="bl-text-2xl">Client</div>
            <div tw="bl-text-base">{clientName}</div>
          </ClientSection>
          <ClientSection>
            <div tw="bl-text-2xl">Client Team</div>
            {clientEmployees.map(({ id, name, email }) => (
              <span key={id}>
                <div tw="bl-text-xl">{name}</div>
                <div tw="bl-text-base">{email}</div>
              </span>
            ))}
          </ClientSection>
          <ClientSection>
            <div tw="bl-text-2xl">Project Team</div>
            {team.map(({ id, name, email }) => (
              <span key={id}>
                <div tw="bl-text-xl">{name}</div>
                <div tw="bl-text-base">{email}</div>
              </span>
            ))}
          </ClientSection>
        </div>
      </div>
    </aside>
  )
}

function ClientSection({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
