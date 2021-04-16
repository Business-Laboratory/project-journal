import tw, { css, theme } from 'twin.macro'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export function MarkdownWrapper({ children }: { children: string }) {
  return (
    // took list styling from here https://stackoverflow.com/questions/11737266/what-is-default-list-styling-css
    <div
      css={[
        tw`bl-text-base`,
        css`
          h2 {
            ${tw`bl-text-2xl`}
          }
          strong {
            ${tw`bl-text-lg`}
          }
          ul {
            list-style-type: none;
            list-style-position: inside;
          }
          ul > li:before {
            display: inline-block;
            content: '-';
            padding-right: ${theme('spacing.2')};
          }
          ol {
            list-style-type: decimal;
            list-style-position: inside;
          }
          ul ul,
          ol ul {
            list-style-position: inside;
            margin-left: 1rem;
          }
          ol ol,
          ul ol {
            list-style-type: lower-latin;
            list-style-position: inside;
            margin-left: 1rem;
          }
        `,
      ]}
    >
      <ReactMarkdown plugins={[gfm]}>{children}</ReactMarkdown>
    </div>
  )
}
