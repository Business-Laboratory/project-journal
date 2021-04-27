import { useQuery } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectsData } from 'pages/api/projects'

export { useProjects }

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
