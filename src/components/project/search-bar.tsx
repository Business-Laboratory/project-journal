import tw, { css, theme } from 'twin.macro'
import { useRef } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import { useRect } from '@reach/rect'

import { SearchIcon } from 'icons'

import '@reach/combobox/styles.css'

const inputPaddingY = theme('spacing.3')

type SearchBarProps = {
  id?: string
}
export function SearchBar({ id = 'projects-search-bar' }: SearchBarProps) {
  const ref = useRef<HTMLLabelElement | null>(null)
  const rect = useRect(ref)

  return (
    <Combobox aria-label="search projects" openOnFocus>
      <label
        ref={ref}
        htmlFor={id}
        css={[
          tw`
            flex items-center w-full px-8 bl-text-base text-gray-yellow-600
            ring-1 ring-inset ring-gray-yellow-600
            hover:(ring-2 ring-copper-300) focus-within:(ring-2 ring-copper-400)
          `,
          css`
            padding-top: ${inputPaddingY};
            padding-bottom: ${inputPaddingY};
          `,
        ]}
      >
        <SearchIcon tw="w-5 h-5" />
        <ComboboxInput
          id={id}
          tw="ml-3 w-full placeholder-gray-yellow-300 focus:outline-none"
          placeholder="Search project updates..."
        />
      </label>
      <ComboboxPopover
        css={[
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
        ]}
      >
        <ComboboxList>
          <ComboboxOption value="Apple">
            <ComboboxOptionText />
          </ComboboxOption>
          <ComboboxOption value="Banana">
            <ComboboxOptionText />
          </ComboboxOption>
          <ComboboxOption value="Orange">
            <ComboboxOptionText />
          </ComboboxOption>
          <ComboboxOption value="Pineapple">
            <ComboboxOptionText />
          </ComboboxOption>
          <ComboboxOption value="Kiwi">
            <ComboboxOptionText />
          </ComboboxOption>
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  )
}
