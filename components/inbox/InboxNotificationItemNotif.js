// InboxNotificationItemNotif.js
// A notification in the inbox list: its date, title and text in the app's language, new ones on grey.
// Tapping marks it read and, for most kinds, opens what it is about.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import useNotificationTarget from "../../hooks/notifications/useNotificationTarget"
import { notificationText, notificationTexts, OPENABLE_NOTIFICATIONS } from "../../Helpers/notifications"
import { translate } from "../../Helpers/language.utils"
import useUiStore from "../../stores/uiStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// notification: the stored notification (data parsed as `data`); doReadNotification(id): marks it read
const InboxNotificationItemNotif = ({ viewStatus, date, notification, titleNotification, data, doReadNotification, id }) => {
  const open = useNotificationTarget()
  const language = useUiStore((state) => state.language)
  const isNew = viewStatus === "new"
  // the server sends its words in every language: the app's own, else the stored text translated
  const own = notificationTexts(data, language)

  return (
    <Pressable
      style={[styles.row, isNew ? styles.new : styles.old]}
      onPress={() => {
        doReadNotification(id)
        open(data)
      }}
    >
      <View style={atoms.maxWidth85Percent}>
        <Text style={styles.small}>{date}</Text>
        <Text style={[styles.title, { fontFamily: isNew ? "Montserrat_700Bold" : "Montserrat_500Medium" }]}>{own ? own.title : translate(titleNotification)}</Text>
        <Text style={styles.small}>{own ? own.body : notificationText(notification, data)}</Text>
      </View>
      {OPENABLE_NOTIFICATIONS.includes(data.type) ? <AntDesign name="right" size={24} color={palette.black} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, paddingHorizontal: 20 },
  new: { backgroundColor: palette.gray100, marginBottom: 10 },
  old: { backgroundColor: palette.white, borderBottomColor: palette.gray350, borderBottomWidth: 1 },
  small: { fontSize: 12, fontFamily: "Montserrat_300Light" },
  title: { fontSize: 20 }
})

export default InboxNotificationItemNotif
