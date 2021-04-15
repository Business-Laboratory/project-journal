import tw, { css } from 'twin.macro'
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
    <aside tw="relative h-full px-14 overflow-y-auto">
      <div tw="w-full mx-auto py-10 space-y-8">
        {user?.role === 'ADMIN' ? (
          <IconLink pathName={`/project/${projectId}/#`}>
            <GearIcon tw="h-6 w-6" />
            <span tw="bl-text-4xl">{name}</span>
          </IconLink>
        ) : (
          <div tw="bl-text-4xl">{name}</div>
        )}
        <div tw="relative h-60 w-full">
          {imageUrl ? (
            <Image tw="object-fill" layout="fill" src={imageUrl} alt={name} />
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
            <MarkdownWrapper>
              <ReactMarkdown plugins={[gfm]}>
                {summary.description}
              </ReactMarkdown>
            </MarkdownWrapper>
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
            <MarkdownWrapper>
              <ReactMarkdown plugins={[gfm]}>{summary.roadmap}</ReactMarkdown>
            </MarkdownWrapper>
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

function MarkdownWrapper({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  )
}

function ClientSection({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
