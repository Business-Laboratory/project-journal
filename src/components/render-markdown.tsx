import tw, { css } from 'twin.macro'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import type { ReactMarkdownOptions } from 'react-markdown'

export { RenderMarkdown }

function RenderMarkdown(props: ReactMarkdownOptions) {
  return (
    <div css={markdownCss}>
      <ReactMarkdown plugins={[gfm]} {...props} />
    </div>
  )
}

const markdownCss = [
  tw`bl-text-base`,
  css`
    h1 {
      ${tw`bl-text-2xl`}
    }

    h2 {
      ${tw`bl-text-xl`}
    }

    h3 {
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
