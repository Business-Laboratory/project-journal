import tw, { css, theme } from 'twin.macro'
import { useEffect, useRef, forwardRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
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
import { getDocumentFontSize } from '@utils/get-document-font-size'

import type { Interval } from 'date-fns'
import type { Updates } from 'pages/project/[id]'

type DelineatorType = 'weeks' | 'months' | 'quarters'

type TimelineProps = {
  updates: Updates
}
export function Timeline({ updates }: TimelineProps) {
  const { query } = useRouter()
  const datesContainerRef = useRef<null | HTMLDivElement>(null)
  const { delineatorDates, groupedUpdateDates } = useTimelineDates(
    updates,
    datesContainerRef
  )

  return (
    <nav tw="relative w-20 h-full overflow-hidden bg-gray-yellow-600 border-r-2 border-gray-yellow-300">
      <Bar />
      <FlexWrapper ref={datesContainerRef}>
        {delineatorDates.dates.map((date) => (
          <DateDelineator
            key={date.valueOf()}
            date={date}
            format={delineatorDates.type}
          />
        ))}
      </FlexWrapper>
      <FlexWrapper
        // add this padding and gap so that the circles are evenly spaced between the delineators
        tw="py-5 space-y-5"
      >
        {groupedUpdateDates.map((updates, idx) => (
          <CircleWrapper key={idx}>
            {updates.map(({ id, title, hash }) => (
              <UpdateCircle
                key={id}
                href={`./${query.id}#${hash}`}
                aria-label={`Go to update ${title}`}
              />
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

// this height needs to be a constant so it can be used in `useTimelineDates`
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
// 2.5rem + 0.5rem = 3rem, which is the size of the touch area we want
const updateCirclePadding = theme('spacing.5')
const circleSize = theme('width.12')
function UpdateCircle({ href }: { href: string }) {
  return (
    <Link href={href} passHref>
      <a
        className="group"
        css={[
          tw`w-12`,
          css`
            width: ${circleSize};
            height: ${circleSize};
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
      </a>
    </Link>
  )
}

// styles/constants

const absoluteCenterCss = tw`absolute left-0 right-0 mx-auto top-10 bottom-10`
const MAX_DELINEATORS = 4

// hooks/logic

/**
 * Determine which dates should be used for the delineators as well as the circles in between
 * based on the updates, their dates, and the height of the timeline (derived form the `containerRef`)
 * @param updates
 * @param containerRef
 * @returns
 */
function useTimelineDates(
  updates: Updates,
  containerRef: React.MutableRefObject<HTMLElement | null>
) {
  const heightInPixels = useObserverHeight(containerRef)
  const height = heightInPixels ? heightInPixels / getDocumentFontSize() : null

  const delineatorHeight = parseFloat(dateDelineatorHeight)
  const circleHeight = parseFloat(circleSize)

  const maxNumberOfDelineators =
    height !== null
      ? Math.floor(
          (height - delineatorHeight) / (delineatorHeight + circleHeight)
        )
      : MAX_DELINEATORS

  const delineatorDates = useDelineatorDates(updates, maxNumberOfDelineators)

  const numberOfDelineators = delineatorDates.dates.length
  const segmentHeight =
    height !== null
      ? (height - delineatorHeight * numberOfDelineators) /
        (numberOfDelineators - 1)
      : 0

  const maxDatesInGroup = Math.floor(segmentHeight / circleHeight)
  const groupedUpdateDates = groupUpdates(
    updates,
    delineatorDates.dates,
    maxDatesInGroup
  )

  return { delineatorDates, groupedUpdateDates }
}

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

/**
 * Group updates that occur between every pair of dates
 * @param updates
 * @param dates
 * @returns
 */
function groupUpdates(
  updates: Updates,
  dates: Date[],
  maxDatesInGroup: number
) {
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

  let groups: Updates[] = Array.from({ length: intervals.length }).map(() => [])
  for (const update of updates) {
    const createdAtValue = update.createdAt.valueOf()
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
    groups[intervalIndex].push(update)
  }

  // Shorten each of the groups if need be
  return groups.map((group) => shortenArray(group, maxDatesInGroup))
}

/**
 * Filters the array to the size of the target length by applying a naive algorithm
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
 * Pick the first interval that has less than 2-4s dates, defaulting to quarters
 * @param updates
 * @param maxNumberOfDelineators
 * @returns
 */
function useDelineatorDates(updates: Updates, maxNumberOfDelineators: number) {
  const intervals = useDateIntervals(updates)
  let type: DelineatorType =
    intervals.weeks.length <= MAX_DELINEATORS
      ? 'weeks'
      : intervals.months.length <= MAX_DELINEATORS
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

function useDateIntervals(updates: Updates) {
  // This is memoized to prevent it from rerendering when the height changes
  return useMemo(() => {
    let dates = updates.map(({ createdAt }) => createdAt)
    if (dates.length <= 0) {
      dates = [new Date()]
    }

    const interval = { start: minDate(dates), end: maxDate(dates) }

    return {
      weeks: eachDateOfInterval(interval, 'weeks'),
      months: eachDateOfInterval(interval, 'months'),
      quarters: eachDateOfInterval(interval, 'quarters'),
    } as const
  }, [updates])
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
