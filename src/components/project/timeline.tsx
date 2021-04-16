import tw, { css, theme } from 'twin.macro'
import React from 'react'
import {
  format as dateFnsFormat,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  addMonths,
  min as minDate,
  max as maxDate,
  addWeeks,
  addQuarters,
} from 'date-fns'

import type { Interval } from 'date-fns'
import type { Update } from '@prisma/client'

type TimelineProps = {
  updates: Update[]
}
export function Timeline({ updates }: TimelineProps) {
  updates = [
    {
      id: 0,
      title: '',
      body: '',
      createdAt: new Date('01/13/2020'),
      updatedAt: new Date('01/04/2020'),
      projectId: null,
    },
    {
      id: 0,
      title: '',
      body: '',
      createdAt: new Date('01/14/2020'),
      updatedAt: new Date('01/04/2020'),
      projectId: null,
    },
    {
      id: 0,
      title: '',
      body: '',
      createdAt: new Date('01/24/2020'),
      updatedAt: new Date('01/04/2020'),
      projectId: null,
    },
    {
      id: 0,
      title: '',
      body: '',
      createdAt: new Date('02/01/2020'),
      updatedAt: new Date('01/04/2020'),
      projectId: null,
    },
  ]

  const datesDelineators = pickDateDelineators(updates)

  const groupedUpdateDates = groupUpdates(updates, datesDelineators.dates)

  return (
    <nav tw="relative w-20 h-full overflow-hidden bg-gray-yellow-600 border-r-2 border-gray-yellow-300">
      <Bar />
      <FlexWrapper>
        {datesDelineators.dates.map((date) => (
          <DateDelineator
            key={date.valueOf()}
            date={date}
            format={datesDelineators.type}
          />
        ))}
      </FlexWrapper>
      <FlexWrapper
        // add this padding and gap so that the circles are evenly spaced between the delineators
        css={css`
          padding-top: ${dateDelineatorHeight};
          padding-bottom: ${dateDelineatorHeight};
          gap: ${dateDelineatorHeight};
        `}
      >
        {groupedUpdateDates.map((dates, idx) => (
          <CircleWrapper key={idx}>
            {dates.map((date) => (
              <UpdateCircle key={date.valueOf()} />
            ))}
          </CircleWrapper>
        ))}
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

function FlexWrapper(props: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      css={[absoluteCenterCss, tw`flex flex-col items-center justify-between`]}
      {...props}
    />
  )
}

// There is likely a better, but more complicated to figure this out, but this is the height
// of these elements when the text is bl-text-xs
const dateDelineatorHeight = theme('height.5')
type DateDelineatorProps = {
  date: Date
  format: DelineatorType
}
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

function CircleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div tw="flex flex-col items-center flex-1 justify-evenly">{children}</div>
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

/**
 * group updates that occur in between every pair of dates
 * @param updates
 * @param dates
 * @returns
 */
function groupUpdates(updates: Update[], dates: Date[]) {
  if (dates.length < 2) {
    throw new Error(
      `dates must have at least 2 dates, only had ${dates.length} dates`
    )
  }

  // ensure that the dates are sorted in descending order, as it affects the grouping
  const sortedDates = [...dates].sort((a, b) => b.valueOf() - a.valueOf())
  let intervals: [number, number][] = []
  // create tuples of the dates
  for (let i = 0; i < sortedDates.length - 1; i++) {
    intervals.push([sortedDates[i].valueOf(), sortedDates[i + 1].valueOf()])
  }

  let groups: Date[][] = Array.from({ length: intervals.length }).map(() => [])
  for (const update of updates) {
    const createdAtValue = update.createdAt.valueOf()
    // find which two dates the update was created between
    const intervalIndex = intervals.findIndex(([laterDate, earlierDate]) => {
      return earlierDate <= createdAtValue && createdAtValue <= laterDate
    })
    if (intervalIndex === -1) {
      throw new Error(
        `Date ${update.createdAt} does not exist in one of the intervals ${intervals}`
      )
    }
    groups[intervalIndex].push(update.createdAt)
  }

  return groups
}

type DelineatorType = 'weeks' | 'months' | 'quarters'

function formatDate(date: Date, format: DelineatorType) {
  switch (format) {
    case 'weeks': {
      return dateFnsFormat(date, 'MM/dd/yy')
    }
    case 'months': {
      return dateFnsFormat(date, 'MM/yyyy')
    }
    case 'quarters': {
      return dateFnsFormat(date, 'MM/yyyy')
    }
  }
}

// pick the first interval that has between 2-4 dates, defaulting to quarters
function pickDateDelineators(updates: Update[]) {
  const intervals = getDateIntervals(updates)
  let type: DelineatorType =
    intervals.weeks.length <= 4
      ? 'weeks'
      : intervals.months.length <= 4
      ? 'months'
      : 'quarters'
  return { dates: intervals[type], type }
}

function getDateIntervals(updates: Update[]) {
  let dates = updates.map(({ createdAt }) => {
    return new Date(createdAt)
  })
  if (dates.length <= 0) {
    dates = [new Date()]
  }

  const interval = { start: minDate(dates), end: maxDate(dates) }

  return {
    weeks: eachDateOfInterval(interval, 'weeks'),
    months: eachDateOfInterval(interval, 'months'),
    quarters: eachDateOfInterval(interval, 'quarters'),
  } as const
}

/**
 * Gets the dates in an interval, specified by the type. Dates are returned in descending order
 * @param interval
 * @param type
 * @returns
 */
function eachDateOfInterval(interval: Interval, type: DelineatorType) {
  // get the correct date-fns utilities
  let intervalFunction
  let addDateFunction
  switch (type) {
    case 'weeks': {
      intervalFunction = eachWeekOfInterval
      addDateFunction = addWeeks
      break
    }
    case 'months': {
      intervalFunction = eachMonthOfInterval
      addDateFunction = addMonths
      break
    }
    case 'quarters': {
      intervalFunction = eachQuarterOfInterval
      addDateFunction = addQuarters
      break
    }
  }

  // find the dates in the interval depending on the type
  const dates = intervalFunction(interval).sort(
    (a, b) => b.valueOf() - a.valueOf()
  )

  const firstDate = dates[0]
  if (dates === undefined) {
    throw new Error(`No interval dates found for the interval ${interval}`)
  }
  return [addDateFunction(firstDate, 1), ...dates]
}
