// useInboxCount.js
// The unread counts of the inbox tabs (and their total for the bottom bar badge).
import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import useAuthStore from "../../stores/authStore"
import { countNotifications } from "../../Services/NotificationsAPI"

const EMPTY = { total: 0, questions: 0, offers: 0, chat: 0, notifications: 0 }

const toCount = (counts) => ({
  total: counts.count_questions + counts.count_offers + counts.count_messages + counts.count_notifications,
  questions: counts.count_questions,
  offers: counts.count_offers,
  chat: counts.count_messages,
  notifications: counts.count_notifications
})

// Unread counts of the inbox for the current role. Loaded after login and on a role change;
// otherwise only refreshed through useRefreshInboxCount (actions, socket events).
export const useInboxCount = () => {
  const user = useAuthStore((state) => state.user)
  const loggedIn = user.loggedIn === true
  const type = user.userData && user.userData.type

  const { data } = useQuery({
    queryKey: ["inboxCount", type],
    // (the server counts for the role it has; the key follows it)
    queryFn: () => countNotifications(),
    select: toCount,
    enabled: loggedIn && !!type,
    staleTime: Infinity
  })

  return (loggedIn && data) || EMPTY
}

export const useRefreshInboxCount = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ["inboxCount"] }), [queryClient])
}
