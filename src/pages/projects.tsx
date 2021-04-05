// Client/Admin Home that displays project cards
import tw, { css } from 'twin.macro'
import Head from 'next/head'

export default function Projects() {
  return (
    <div tw="h-full bg-gray-yellow-100">
      <Head>
        <title>Project Journal</title>
      </Head>
      <Main>
        <div tw="grid px-4 pb-4 grid-cols-2 gap-x-16 gap-y-4">
          {PROJECTS.map((project: ProjectProps, i: number) => (
            <Card key={i} project={project} />
          ))}
          {PROJECTS.map((project: ProjectProps, i: number) => (
            <Card key={i} project={project} />
          ))}
        </div>
      </Main>
    </div>
  )
}

type MainProps = {
  className?: string
  children?: React.ReactNode
}
function Main({ className, children }: MainProps) {
  return (
    <main
      tw="w-9/12 mt-8 mx-auto overflow-x-hidden overflow-y-auto"
      className={className}
    >
      {children}
    </main>
  )
}

function Card({ project }: { project: ProjectProps }) {
  const { name, description, image } = project

  return (
    <div tw="col-auto grid grid-cols-3 border-2 border-copper-300 rounded shadow-bl">
      <div tw="col-span-2 border-r border-gray-yellow-300">
        <div tw="p-3 pb-0.5 bl-text-3xl text-gray-yellow-600">{name}</div>
        <div tw="px-3 pb-3 bl-text-base text-gray-yellow-600">
          {description}
        </div>
      </div>
      <div tw="col-span-1">
        <img tw="h-full w-full object-cover" src={image} alt={name} />
      </div>
    </div>
  )
}

type ProjectProps = {
  name: string
  description: string
  image: string
}
const PROJECTS = [
  {
    name: 'Project Tracker 2.1',
    description:
      'Update the Project Tracker. Fix bugs. Add TypeScript. Add Testing. Update Input Utilization for multi-project and multi-month input. Add Explore People.',
    image: '/images/project_tracker.png',
  },
  {
    name: 'Calumet Optimizer',
    description:
      'Optimization of a lubrication plant schedule that generates high revenue + plant value change for a given scenario.',
    image: '/images/calumet_optimizer.png',
  },
]
