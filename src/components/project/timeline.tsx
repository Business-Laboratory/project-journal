import tw, { css, theme } from 'twin.macro'
import { useEffect, useRef, forwardRef, useState } from 'react'
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
  // updates = [
  //   {
  //     id: 0,
  //     title: '',
  //     body: '',
  //     createdAt: new Date('01/13/2021'),
  //     updatedAt: new Date('01/04/2021'),
  //     projectId: null,
  //   },
  //   {
  //     id: 0,
  //     title: '',
  //     body: '',
  //     createdAt: new Date('01/14/2021'),
  //     updatedAt: new Date('01/04/2021'),
  //     projectId: null,
  //   },
  //   {
  //     id: 0,
  //     title: '',
  //     body: '',
  //     createdAt: new Date('01/24/2021'),
  //     updatedAt: new Date('01/04/2021'),
  //     projectId: null,
  //   },
  //   {
  //     id: 0,
  //     title: '',
  //     body: '',
  //     createdAt: new Date('02/01/2021'),
  //     updatedAt: new Date('01/04/2021'),
  //     projectId: null,
  //   },
  // ]

  const datesContainerRef = useRef<null | HTMLDivElement>(null)
  const height = useObserverHeight(datesContainerRef)

  // some things that need to be backed out
  const delineatorHeight = parseFloat(theme('spacing.5')) * 16
  const circleHeight = 48

  const maxNumberOfDelineators =
    height !== null
      ? Math.floor(
          (height - delineatorHeight) / (delineatorHeight + circleHeight)
        )
      : 4

  const datesDelineators = pickDateDelineators(updates, maxNumberOfDelineators)
  const groupedUpdateDates = groupUpdates(updates, datesDelineators.dates)

  const segmentHeight =
    height !== null
      ? (height - delineatorHeight * datesDelineators.dates.length) /
        groupedUpdateDates.length
      : 0

  const maxNumberOfCircles = Math.floor(segmentHeight / circleHeight)

  return (
    <nav tw="relative w-20 h-full overflow-hidden bg-gray-yellow-600 border-r-2 border-gray-yellow-300">
      <Bar />
      <FlexWrapper ref={datesContainerRef}>
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
        tw="py-5 space-y-5"
      >
        {groupedUpdateDates.map((dates, idx) => (
          <CircleWrapper key={idx}>
            {shortenArray(dates, maxNumberOfCircles).map((date) => (
              <UpdateCircle key={date.valueOf()} />
            ))}
          </CircleWrapper>
        ))}
      </FlexWrapper>
    </nav>
  )
}

/**
 * filters the array to the size of the target length by applying a naive algorithm
 * @param array
 * @param targetLength
 * @returns
 */
function shortenArray<T>(array: T[], targetLength: number) {
  const arrayLength = array.length
  // return the original array if it doesn't need to be shortened
  if (targetLength >= arrayLength) {
    return array
  }
  const chunkSize = arrayLength / targetLength
  const midChunkSize = chunkSize / 2
  const indexes = Array.from({ length: targetLength }).map((_, idx) => {
    const middleOfChunk = idx * chunkSize + midChunkSize
    return Math.floor(middleOfChunk)
  })

  return indexes.map((idx) => array[idx])
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

const FlexWrapper = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  return (
    <div
      ref={ref}
      css={[absoluteCenterCss, tw`flex flex-col items-center justify-between`]}
      {...props}
    />
  )
})

type DateDelineatorProps = {
  date: Date
  format: DelineatorType
}
function DateDelineator({ date, format }: DateDelineatorProps) {
  return (
    <div tw="h-5 text-center border rounded w-14 bg-gray-yellow-100 border-copper-300 bl-text-xs">
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

function useObserverHeight(ref: React.MutableRefObject<HTMLElement | null>) {
  const [height, setHeight] = useState<null | number>(null)
  useEffect(() => {
    const node = ref.current
    if (node === null) return

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries
      if (entry === undefined) {
        throw new Error('No entry found in resize observer')
      }
      setHeight(entry.contentRect.height)
    })
    resizeObserver.observe(node)
    return () => {
      resizeObserver.unobserve(node)
    }
  }, [ref])

  return height
}

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
    // TODO: Fix in database... this is supposed to be a date
    const createdAtValue = new Date(update.createdAt).valueOf()
    // find which two dates the update was created between
    const intervalIndex = intervals.findIndex(([laterDate, earlierDate]) => {
      return earlierDate <= createdAtValue && createdAtValue <= laterDate
    })
    if (intervalIndex === -1) {
      throw new Error(
        `Date ${
          update.createdAt
        } does not exist in one of the intervals ${intervals.map((dates) =>
          dates.map((d) => new Date(d)).join('\n')
        )}`
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

/**
 * pick the first interval that has between 2-4 dates, defaulting to quarters
 * @param updates
 * @param maxNumberOfDelineators
 * @returns
 */
function pickDateDelineators(
  updates: Update[],
  maxNumberOfDelineators: number
) {
  const intervals = getDateIntervals(updates)
  let type: DelineatorType =
    intervals.weeks.length <= 4
      ? 'weeks'
      : intervals.months.length <= 4
      ? 'months'
      : // TODO: handle when there are more than for quarters
        'quarters'
  let dates = intervals[type]
  // if the number of delineators can't fit we only show the first and last one
  const numberOfDates = dates.length
  if (numberOfDates > maxNumberOfDelineators) {
    dates = [dates[0], dates[numberOfDates - 1]]
  }
  return { dates, type }
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
