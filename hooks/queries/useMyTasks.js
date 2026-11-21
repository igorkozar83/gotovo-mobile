// useMyTasks.js
// My Tasks: the current and the finished tasks of the selected role (page by page), the calendar, and
// marking them stale after a change.
import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import useCursorList from "./useCursorList"
import { getTasks, getTasksTasker } from "../../Services/TasksAPI"
import { getCalendar } from "../../Services/NotificationsAPI"

export const myTasksKeys = {
  all: ["myTasks"],
  list: (userSelect, finished) => ["myTasks", userSelect, finished ? "finished" : "current"],
  calendar: ["myTasks", "calendar"]
}

const fetchPage = (userSelect, finished, cursor) => (userSelect === "CLIENT" ? getTasks(cursor, finished) : getTasksTasker(cursor, finished, true))

export const useMyTasksList = (userSelect, finished, enabled) => {
  const list = useCursorList({ queryKey: myTasksKeys.list(userSelect, finished), fetchPage: (cursor) => fetchPage(userSelect, finished, cursor), enabled })
  const firstPage = list.pages[0]
  return {
    tasks: list.items,
    // the "no tasks yet" message: the first page came back empty
    noTasks: !!firstPage && (!firstPage.data || !firstPage.data.length),
    canLoadMore: list.canLoadMore,
    loadMore: list.loadMore,
    refresh: list.refresh,
    isFetching: list.isFetching
  }
}

export const useMyTasksCalendar = (enabled) =>
  useQuery({
    queryKey: myTasksKeys.calendar,
    queryFn: getCalendar,
    select: (calendar) => calendar || [],
    enabled
  })

// marks the task lists (and the calendar) stale; the visible one reloads right away
export const useInvalidateMyTasks = () => {
  const queryClient = useQueryClient()
  return useCallback(
    (userSelect, finished) => queryClient.invalidateQueries({ queryKey: userSelect === undefined ? myTasksKeys.all : myTasksKeys.list(userSelect, finished) }),
    [queryClient]
  )
}
