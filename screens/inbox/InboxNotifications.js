// InboxNotifications.js
// The inbox's NOTIFICATIONS tab: the user's notifications; a tapped one is marked read (quietly), or all of
// them at once, and the unread count reloads. Loads while it is shown; a failed load shows the old alert.
import React, { useEffect } from "react"
import { useIsFocused } from "@react-navigation/native"

import NotificationTab from "../../components/inbox/NotificationTab"
import useApiAction from "../../hooks/useApiAction"
import useAlert from "../../hooks/useAlert"
import useEvent from "../../hooks/useEvent"
import { useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead } from "../../hooks/queries/useInbox"
import { useInboxCount, useRefreshInboxCount } from "../../hooks/queries/useInboxCount"
import { readAllNotifications, readNotification } from "../../Services/NotificationsAPI"
import { apiError } from "../../Helpers/apiErrors"
import { inboxRoute } from "./inboxTabs"

export default function InboxNotifications({ navigation }) {
  const isFocused = useIsFocused()
  const { showError } = useAlert()
  const refreshInboxCount = useRefreshInboxCount()
  const unread = useInboxCount().notifications

  const notificationsList = useNotificationsList(isFocused)
  const markNotificationRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const readAll = useApiAction(readAllNotifications, {
    error: "inboxNotifications.markAllAsReadError",
    onSuccess: () => {
      markAllRead()
      refreshInboxCount()
    }
  })

  const read = useApiAction(readNotification, {
    spinner: false,
    onSuccess: (resp, notificationId) => {
      markNotificationRead(notificationId)
      refreshInboxCount()
    }
  })

  const reportError = useEvent(() => {
    // the server's reason, when it gave one
    const reason = apiError(notificationsList.error)?.message
    showError("inboxNotifications.errorWhileRetrievingConversation", reason || "inboxNotifications.pleaseTryAgainLater")
  })
  useEffect(() => {
    if (notificationsList.errorUpdatedAt) reportError()
  }, [notificationsList.errorUpdatedAt, reportError])

  return (
    <NotificationTab
      notifications={notificationsList.notifications}
      fetching={notificationsList.isFetching}
      canLoadMore={notificationsList.canLoadMore}
      onLoadMore={notificationsList.loadMore}
      onRefresh={() => notificationsList.refresh()}
      onRead={(id) => read.run(id)}
      onReadAll={unread ? () => readAll.run() : null}
      tab="NOTIFICATIONS"
      onTab={(key) => navigation.navigate(inboxRoute(key))}
    />
  )
}
