import { useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import type { QueryFunction } from 'react-query'
import type { ProjectData } from 'pages/api/project'
import type { Projects } from './useProjects'
import type { QueryData } from '@types'

export { useProject, usePrefetchProject }
export type Project = QueryData<typeof useProject>

function useProject(id: number) {
  const placeholderData = useProjectPlaceholderData(id)
  return useQuery(['project', { id }], fetchProject, {
    placeholderData,
  })
}

/**
 * Prefetch the users updates
 */
function usePrefetchProject(id: number, staleTime = 10000) {
  const queryClient = useQueryClient()
  // The results of this query will be cached like a normal query
  return async () =>
    await queryClient.prefetchQuery(
      ['project', { id }],
      fetchProject,
      { staleTime } // wait this long before another prefetch is attempted
    )
}

function useProjectPlaceholderData(projectId: number): ProjectData | undefined {
  const queryClient = useQueryClient()
  const projects = queryClient.getQueryData<Projects>('projects')
  const project = projects?.find(({ id }) => id === projectId)

  return useMemo(() => {
    return project
      ? {
          id: project.id,
          imageUrl: project.imageUrl,
          name: project.name,
          clientId: null,
          client: null,
          team: [],
          summary: project.summary
            ? {
                id: project.summary.id,
                projectId: project.summary.projectId,
                description: project.summary.description,
                roadmap: null,
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

  const res = await fetch(`/api/project?id=${id}`, {
    method: 'GET',
  })
  if (!res.ok) {
    throw new Error(`Something went wrong`)
  }
  return res.json()
}
