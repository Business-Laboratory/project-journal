import tw, { css, theme } from 'twin.macro'
import { useRef, useState, useMemo } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import { useRouter } from 'next/router'
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import { SearchIcon } from 'icons'

import type { Updates } from 'pages/project/[id]'

const inputPaddingY = theme('spacing.3')

type SearchBarProps = {
  updates: Updates
  id?: string
}
export function SearchBar({
  updates,
  id = 'projects-search-bar',
}: SearchBarProps) {
  const router = useRouter()
  const ref = useRef<HTMLLabelElement | null>(null)
  const rect = useRect(ref)
  const [searchTerm, setSearchTerm] = useState('')
  const matchedProjects = useProjectMatch(updates, searchTerm)

  return (
    <Combobox
      aria-label="search projects"
      openOnFocus
      onSelect={(selectedValue) => {
        setSearchTerm(selectedValue)
        const selectedProject = matchedProjects.find(
          ({ value }) => value === selectedValue
        )
        const hashLink = selectedProject?.hashLink
        if (hashLink) {
          router.push(`./${router.query.id}${hashLink}`)
        }
      }}
    >
      <label ref={ref} htmlFor={id} css={labelCss}>
        <SearchIcon tw="w-5 h-5" />
        <ComboboxInput
          id={id}
          tw="ml-3 w-full placeholder-gray-yellow-300 focus:outline-none"
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          placeholder="Search project updates..."
          autoComplete="off"
          autocomplete={false}
        />
      </label>

      <ComboboxPopover css={comboboxPopoverCss(rect)}>
        <ComboboxList>
          {matchedProjects.length > 0 ? (
            matchedProjects.slice(0, 10).map(({ value }, idx) => {
              return (
                <ComboboxOption
                  key={idx} // key has to be index to that using the arrow keys has the correct order
                  css={comboboxOptionCss}
                  value={value}
                >
                  <ComboboxOptionText />
                </ComboboxOption>
              )
            })
          ) : (
            <span css={optionCss}>No results</span>
          )}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  )
}

/**
 * Inspired by https://github.com/reach/reach-ui/blob/develop/packages/combobox/examples/utils.ts
 * @param term
 */
function useProjectMatch(updates: Updates, searchTerm: string) {
  const projectKeyValues = useMemo(
    () =>
      updates.map(({ id, title, hashLink }, idx) => ({
        value: title,
        hashLink,
      })),
    [updates]
  )
  return useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return normalizedSearchTerm === ''
      ? projectKeyValues
      : matchSorter(projectKeyValues, searchTerm, {
          keys: [(item) => item.value],
        })
  }, [searchTerm, projectKeyValues])
}

// styles

const comboboxPopoverCss = (rect: DOMRect | null) => [
  tw`py-1 bg-white border rounded border-copper-400`,
  css`
    margin-top: calc(${inputPaddingY} + ${theme('spacing.2')});
  `,
  rect
    ? // unfortunately have to pass important in here to override reach's default positioning
      css`
        left: ${rect.left}px !important;
        width: ${rect.width}px !important;
      `
    : null,
]

const labelCss = [
  tw`
    flex items-center w-full px-8 bl-text-base text-gray-yellow-600
    ring-1 ring-inset ring-gray-yellow-600
    hover:(ring-2 ring-copper-300) focus-within:(ring-2 ring-copper-400)
  `,
  css`
    padding-top: ${inputPaddingY};
    padding-bottom: ${inputPaddingY};
  `,
]

const optionCss = tw`block px-8 py-2 bl-text-xs`

const comboboxOptionCss = [
  optionCss,
  css`
    &[aria-selected='true'],
    :hover {
      ${tw`bg-copper-100`}
    }
    [data-user-value] {
      ${tw`text-gray-yellow-500`}
    }
  `,
]
