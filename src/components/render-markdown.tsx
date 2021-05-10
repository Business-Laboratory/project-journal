import tw, { css } from 'twin.macro'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import { CustomCheckboxContainer, CustomCheckboxInput } from '@reach/checkbox'
import type { ReactMarkdownOptions } from 'react-markdown'
import gfm from 'remark-gfm'
import breaks from 'remark-breaks'

import { CheckIcon } from 'icons'

import '@reach/checkbox/styles.css'

export { RenderMarkdown }

function RenderMarkdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      css={markdownCss}
      components={{
        h1: 'h3',
        h2: 'h4',
        h3: 'h5',
        li: ({ className, children, checked }) => {
          if (className === 'task-list-item') {
            if (typeof checked !== 'boolean') {
              throw new Error(`checked must be a boolean, received ${checked}`)
            }

            return (
              <li className={className}>
                <label tw="flex items-center">
                  <CustomCheckboxContainer
                    disabled
                    checked={checked}
                    css={[
                      tw`w-4 h-4`,
                      !checked ? tw`border-2 border-gray-yellow-600` : null,
                    ]}
                  >
                    <CustomCheckboxInput value="whatever" checked={checked} />
                    {checked ? (
                      <CheckIcon aria-hidden tw="fill-copper-300" />
                    ) : null}
                  </CustomCheckboxContainer>
                  {
                    // the last child should always been the label
                    children[children.length - 1]
                  }
                </label>
              </li>
            )
          }

          // these seem to be all that needs to be passed along
          return <li className={className}>{children}</li>
        },
        input: (props) => {
          console.log(props)
          const checked = props.checked
          if (typeof checked !== 'boolean') {
            throw new Error(`checked must be a boolean, received ${checked}`)
          }
          return (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label tw="flex items-center">
              <CustomCheckboxContainer
                disabled
                checked={checked}
                css={[
                  tw`w-4 h-4`,
                  !checked ? tw`border-2 border-gray-yellow-600` : null,
                ]}
              >
                <CustomCheckboxInput value="whatever" checked={checked} />
                {checked ? (
                  <CheckIcon aria-hidden tw="fill-copper-300" />
                ) : null}
              </CustomCheckboxContainer>
              This is a pretty cool checkbox; do you agree?
            </label>
          )
        },
      }}
      plugins={[breaks, gfm]}
      transformLinkUri={uriTransformer}
      {...props}
    />
  )
}

const markdownCss = [
  tw`bl-text-base space-y-4`,
  css`
    .control-me {
      /* Default state */
    }
    .checkbox:checked ~ .control-me {
      /* A toggled state! No JavaScript! */
    }

    h3 {
      ${tw`bl-text-2xl`}
    }

    h4 {
      ${tw`bl-text-xl`}
    }

    h5 {
      ${tw`bl-text-lg`}
    }

    a {
      ${tw`text-copper-300`}
      &:hover {
        ${tw`text-copper-400`}
      }
      &.focus-visible {
        ${tw`outline-none ring-2 ring-copper-400`}
      }
    }

    em {
      ${tw`italic`}
    }

    /* only normal text can have bold applied */
    p strong {
      ${tw`font-semibold`}
    }

    del {
      ${tw`line-through`}
    }

    ul {
      list-style-position: inside;
      li {
        display: list-item;
        list-style-type: disc;
        p {
          display: inline;
        }
      }
    }
    ol {
      list-style-position: inside;
      li {
        display: list-item;
        list-style-type: decimal;
      }
      p {
        display: inline;
      }
    }

    .task-list-item {
      list-style-type: none;
    }
    input[type='checkbox'] {
    }
  `,
]
