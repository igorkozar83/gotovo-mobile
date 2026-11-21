// InboxChatMain.js
// A conversation in the inbox CHAT tab: the other person's photo, the last message's time, the task and
// the person, and the unread count (unread ones on grey).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { palette } from "../../styles/palette"

const InboxChatMain = ({ chatFunction, workerImage, date, task, msgSender, numNotification }) => (
  <Pressable onPress={chatFunction} style={[styles.row, numNotification ? styles.unread : styles.read]}>
    <View style={styles.avatarColumn}>
      <FastImageComponent source={workerImage || require("../../assets/emptyavatar.png")} style={styles.photo} />
    </View>
    <View style={styles.texts}>
      <Text style={styles.light}>{date}</Text>
      <Text style={styles.nameText}>{task}</Text>
      <Text style={styles.light}>{msgSender}</Text>
    </View>
    <View style={styles.arrow}>
      {numNotification ? (
        <View style={styles.count}>
          <Text style={styles.name}>{numNotification}</Text>
        </View>
      ) : null}
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  avatarColumn: { paddingHorizontal: 20, marginRight: 5 },
  texts: { marginLeft: -8, maxWidth: "50%" },
  nameText: { fontSize: 20, fontFamily: "Montserrat_700Bold" },
  arrow: { marginLeft: "auto", paddingRight: 20 },
  name: { fontFamily: "Montserrat_700Bold", color: palette.white, fontSize: 18 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  unread: { backgroundColor: palette.gray100, marginBottom: 10 },
  read: { backgroundColor: palette.white, borderBottomColor: palette.gray350, borderBottomWidth: 1 },
  photo: { width: 76, height: 76, position: "relative", borderRadius: 76 },
  light: { fontSize: 12, fontFamily: "Montserrat_300Light" },
  count: { justifyContent: "center", alignItems: "center", backgroundColor: palette.orange, width: 31.5, height: 31.5, borderRadius: 31.5 }
})

export default InboxChatMain
