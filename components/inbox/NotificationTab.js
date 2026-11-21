// NotificationTab.js
// The inbox NOTIFICATIONS tab: the user's notifications, new ones marked, and a bar to mark them all read;
// the list reloads when the server says there are new ones.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

import InboxNotificationItemNotif from "./InboxNotificationItemNotif"
import InboxListHeader, { INBOX_HEADER_HEIGHT } from "./InboxListHeader"
import CollapsingList from "../lists/CollapsingList"
import useLiveChannel from "../../hooks/useLiveChannel"
import useUiStore from "../../stores/uiStore"
import { dateDotTime } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"

// the inbox's top and the mark-all bar (as high as the offers' order bar)
const HEADER_HEIGHT = INBOX_HEADER_HEIGHT + 46

// onReadAll: marks every notification read; null while none is unread (the bar is then dimmed)
const ReadAllBar = ({ onReadAll }) => (
  <View style={styles.bar}>
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !onReadAll }}
      disabled={!onReadAll}
      onPress={onReadAll}
      hitSlop={10}
      style={[styles.readAll, !onReadAll && styles.dimmed]}
    >
      <Feather name="check-circle" size={16} color={palette.gray600} />
      <Text style={styles.readAllText}>{translate("notificationTab.markAllAsRead")}</Text>
    </Pressable>
  </View>
)

/**
 * notifications, fetching, canLoadMore, onLoadMore, onRefresh: the list; onRead(id): marks one read; onReadAll:
 * marks them all read (null: none unread)
 * tab / onTab: the inbox tabs
 */
const NotificationTab = ({ notifications, fetching, canLoadMore, onLoadMore, onRefresh, onRead, onReadAll = null, tab, onTab }) => {
  const user = useAuthStore((state) => state.user)
  const language = useUiStore((state) => state.language)

  const channel = user.userData.channel
  useLiveChannel(channel && "hotovo-refresh-notifications-" + channel, onRefresh)

  return (
    <CollapsingList
      headerHeight={HEADER_HEIGHT}
      header={
        <>
          <InboxListHeader tab={tab} onTab={onTab} />
          <ReadAllBar onReadAll={onReadAll} />
        </>
      }
      fetching={fetching}
      canLoadMore={canLoadMore}
      onLoadMore={onLoadMore}
      data={notifications}
      estimatedItemSize={200}
      keyExtractor={(item) => item.id.toString()}
      extraData={[language]}
      renderItem={({ item }) => (
        <InboxNotificationItemNotif
          data={JSON.parse(item.data)}
          viewStatus={item.status === 0 ? "new" : ""}
          date={dateDotTime(item.created_at, language)}
          titleNotification={item.title}
          notification={item}
          id={item.id}
          doReadNotification={onRead}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  bar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    borderBottomColor: palette.gray350,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },
  readAll: { flexDirection: "row", alignItems: "center" },
  readAllText: { fontFamily: "Montserrat_700Bold", color: palette.gray600, fontSize: 12, marginLeft: 6 },
  dimmed: { opacity: 0.4 }
})

export default NotificationTab
