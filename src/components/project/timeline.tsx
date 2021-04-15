import { css } from 'twin.macro'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'

export function Timeline() {
  return (
    <nav tw="relative w-20 h-full overflow-hidden bg-gray-yellow-600 border-r-2 border-gray-yellow-300 py-10">
      <Bar />
      <FlexWrapper>
        <DateDelineator date={new Date('03/10/2021')} format="month" />
        <DateDelineator date={new Date('02/01/2021')} format="month" />
        <DateDelineator date={new Date('01/01/2021')} format="month" />
      </FlexWrapper>
    </nav>
  )
}

function Bar() {
  return (
    <div
      tw="absolute left-0 right-0 mx-auto h-full bg-copper-300"
      css={css`
        width: 2px;
        /* TODO: Fix height */
        height: calc(100% - 5rem);
      `}
    />
  )
}

function FlexWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      tw="h-full flex flex-col items-center justify-between"
      css={css`
        isolation: isolate;
      `}
    >
      {children}
    </div>
  )
}

type DateFormat = 'week' | 'month'
type DateDelineatorProps = {
  date: Date
  format: DateFormat
}
function DateDelineator({ date, format }: DateDelineatorProps) {
  return (
    <div tw="w-14 bg-gray-yellow-100 border border-copper-300 rounded bl-text-xs text-center">
      {formatDate(date, format)}
    </div>
  )
}

function formatDate(date: Date, format: DateFormat) {
  switch (format) {
    case 'week': {
      return dateFnsFormat(date, 'MM/dd/yy')
    }
    case 'month': {
      return dateFnsFormat(date, 'MM/yyyy')
    }
  }
}

function UpdateCircle() {
  return null
}
