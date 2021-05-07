import tw, { css } from 'twin.macro'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import gfm from 'remark-gfm'
import breaks from 'remark-breaks'

import type { ReactMarkdownOptions } from 'react-markdown'

export { RenderMarkdown }

function RenderMarkdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      css={markdownCss}
      components={{
        h1: 'h3',
        h2: 'h4',
        h3: 'h5',
        // attempting to implement something similar to this: https://css-tricks.com/the-checkbox-hack/
        input: ({ index }) => {
          const id = `checkbox-${index}`
          return (
            <>
              <label htmlFor={id}>Do Something</label>
              <input className="checkbox" type="checkbox" id={id} />
              <div className="control-me">Control me</div>
            </>
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

    em {
      ${tw`italic`}
    }

    strong {
      ${tw`font-semibold`}
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

    /* ul {
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
    }
    ol ol,
    ul ol {
      list-style-type: lower-latin;
      list-style-position: inside;
    } */
  `,
]
