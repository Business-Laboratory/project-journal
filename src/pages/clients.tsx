// Alternate Admin Home view that displays clients
import 'twin.macro'
import Head from 'next/head'

export default function Clients() {
  return (
    <div tw="flex flex-col h-screen bg-gray-yellow-100">
      <Head>
        <title>Layout examples</title>
      </Head>

      <div tw="flex flex-row flex-1 overflow-hidden">
        <Main></Main>
      </div>
    </div>
  )
}

type MainProps = {
  className?: string
  children?: React.ReactNode
}
function Main({ className, children }: MainProps) {
  return (
    <main tw="flex-1 overflow-x-hidden overflow-y-auto" className={className}>
      {children}
    </main>
  )
}
