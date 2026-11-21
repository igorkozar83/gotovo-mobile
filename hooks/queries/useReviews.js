import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useCursorList from "./useCursorList"
import { getReviews } from "../../Services/TasksAPI"

// Reviews of a user, sorted ("Newest", "Oldest", "Best rating", "Worst rating").
// Without userId: the logged-in user's own reviews. userType: 0 tasker, 1 client (of the viewer).
export const useReviews = ({ userId = null, userType = null, sort = null }, enabled = true) => {
  const list = useCursorList({
    queryKey: ["reviews", userId, userType, sort],
    fetchPage: (cursor) => getReviews(cursor, sort, userId, userType),
    enabled,
    // a new sort of the same user's reviews keeps the list (and its sort menu) up while it loads
    keepPrevious: (previousKey) => previousKey[1] === userId && previousKey[2] === userType
  })
  return { ...list, reviews: list.items }
}

export const useInvalidateReviews = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ["reviews"] }), [queryClient])
}
