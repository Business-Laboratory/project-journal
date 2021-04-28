import { useQuery, useQueryClient } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectData } from 'pages/api/project'
import type { useProjects } from './useProjects'

import { useMemo } from 'react'

export { useProject }

type Projects = ReturnType<typeof useProjects>['data']

function useProject(id: number) {
  const placeholderData = useProjectPlaceholderData(id)
  return useQuery(['project', { id }], fetchProject, {
    placeholderData,
  })
}

function useProjectPlaceholderData(projectId: number): ProjectData | undefined {
  const queryClient = useQueryClient()
  const projects = queryClient.getQueryData('projects') as Projects
  const project = projects?.find(({ id }) => id === projectId)
  return useMemo(() => {
    return project
      ? {
          id: project.id,
          imageUrl: project.imageUrl,
          name: project.name,
          client: null,
          team: [],
          summary: project.summary
            ? {
                id: project.summary.id,
                description: project.summary.description,
                roadmap: null,
                projectId: null,
              }
            : null,
        }
      : undefined
  }, [project])
}

type ProjectQueryKey = ['project', { id: number }]
const fetchProject: QueryFunction<ProjectData, ProjectQueryKey> = async ({
  queryKey,
}) => {
  const [, { id }] = queryKey

  if (!id) {
    throw new Error(`No project provided`)
  }

  const res = await fetch(`/api/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
