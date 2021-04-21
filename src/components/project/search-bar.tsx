import 'twin.macro'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import { SearchIcon } from 'icons'

import '@reach/combobox/styles.css'

type SearchBarProps = {
  id?: string
}
export function SearchBar({ id = 'projects-search-bar' }: SearchBarProps) {
  return (
    <Combobox aria-label="search projects">
      <label
        htmlFor={id}
        tw="
          flex items-center w-full px-8 py-3 bl-text-base text-gray-yellow-600
          ring-1 ring-inset ring-gray-yellow-600
          hover:(ring-2 ring-copper-300) focus-within:(ring-2 ring-copper-400)
        "
      >
        <SearchIcon tw="w-5 h-5" />
        <ComboboxInput
          id={id}
          tw="ml-3 w-full placeholder-gray-yellow-300 focus:outline-none"
          placeholder="Search project updates..."
        />
      </label>
      <ComboboxPopover>
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
