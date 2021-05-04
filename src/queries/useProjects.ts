import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectsData } from 'pages/api/projects'
import type { QueryData } from '@types'

export { useProjects }
export type Projects = QueryData<typeof useProjects>

function useProjects() {
  return useQuery('projects', fetchProjects)
}

const fetchProjects: QueryFunction<ProjectsData> = async () => {
  const res = await fetch(`/api/projects`)
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
