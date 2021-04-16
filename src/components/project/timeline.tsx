import tw, { css, theme } from 'twin.macro'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'

export function Timeline() {
  return (
    <nav tw="relative w-20 h-full overflow-hidden bg-gray-yellow-600 border-r-2 border-gray-yellow-300">
      <Bar />
      <FlexWrapper>
        <DateDelineator date={new Date('04/01/2021')} format="month" />
        <DateDelineator date={new Date('03/01/2021')} format="month" />
        <DateDelineator date={new Date('02/01/2021')} format="month" />
        <DateDelineator date={new Date('01/01/2021')} format="month" />
      </FlexWrapper>
      <FlexWrapper>
        <CircleWrapper>
          <UpdateCircle />
          <UpdateCircle />
          <UpdateCircle />
        </CircleWrapper>
        <CircleWrapper>
          <UpdateCircle />
          <UpdateCircle />
        </CircleWrapper>
        <CircleWrapper>
          <UpdateCircle />
          <UpdateCircle />
          <UpdateCircle />
        </CircleWrapper>
      </FlexWrapper>
    </nav>
  )
}

// components

function Bar() {
  return (
    <div
      css={[
        absoluteCenterCss,
        tw`bg-copper-300`,
        css`
          width: 2px;
        `,
      ]}
    />
  )
}

function FlexWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      css={[absoluteCenterCss, tw`flex flex-col items-center justify-between`]}
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

// There is like a better, but more complicated to figure this out, but this is the height
// of these elements when the text is bl-text-xs
const dateDelineatorHeight = theme('height.5')
function DateDelineator({ date, format }: DateDelineatorProps) {
  return (
    <div
      css={[
        tw`text-center border rounded w-14 bg-gray-yellow-100 border-copper-300 bl-text-xs`,
        css`
          height: ${dateDelineatorHeight};
        `,
      ]}
    >
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

function CircleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      css={[
        tw`flex flex-col items-center flex-grow justify-evenly`,
        // add this padding so that the circles are evenly spaced between the delineators
        css`
          padding-top: calc(${updateCirclePadding} + ${dateDelineatorHeight});
          padding-bottom: calc(
            ${updateCirclePadding} + ${dateDelineatorHeight}
          );
        `,
      ]}
    >
      {children}
    </div>
  )
}

// A note on the padding/width and height. We need a touch area of 48px -> 3rem.
// p-5 is 1.25 rem on each side, so 2.5rem. w-2 and h-2 are each 0.5rem
// 2.5rem + 0.5rem = 3rem, which is the size of hte touch area we want
const updateCirclePadding = theme('spacing.5')
function UpdateCircle() {
  return (
    <button
      className="group"
      css={[
        css`
          padding: ${updateCirclePadding};
          /* must subtract the border width so that the border is on the outside */
          :hover,
          :focus {
            padding: calc(${updateCirclePadding} - ${theme('borderWidth.2')});
          }
        `,
      ]}
    >
      <div
        // box-content makes the border on the outside
        tw="
          w-2 h-2 bg-gray-yellow-100 rounded-full box-content
          group-hover:(border-2 border-matisse-blue-100)
          group-focus:(border-2 border-matisse-blue-100)
        "
      />
    </button>
  )
}

// hooks/logic/styles

const absoluteCenterCss = tw`absolute left-0 right-0 mx-auto top-10 bottom-10`
