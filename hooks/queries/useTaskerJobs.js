// useTaskerJobs.js
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useCursorList from "./useCursorList"
import { getTasksTasker } from "../../Services/TasksAPI"

// the open tasks a tasker can offer on (Home), filtered and sorted
// filter: { sort_date, sort_type, category_id, filter_job }
export const useTaskerJobs = (filter, enabled) => {
  const list = useCursorList({
    queryKey: ["taskerJobs", filter],
    fetchPage: (cursor) => getTasksTasker(cursor, false, false, filter),
    enabled
  })
  return { ...list, tasks: list.items }
}

export const useInvalidateTaskerJobs = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ["taskerJobs"] }), [queryClient])
}
