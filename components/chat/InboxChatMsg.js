// InboxChatMsg.js
// A chat message: a received one on grey from the left with the sender's photo
// and name, a sent one on the role's colour from the right; both with their time.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// typeMsg: "receive" or sent; sender: the name shown above (may be empty)
const InboxChatMsg = ({ typeMsg, time, sender, chatMsg, workerImage }) => {
  const colors = useRoleColors()
  const received = typeMsg === "receive"

  return (
    <View style={atoms.backgroundColorWhite}>
      <View style={received ? styles.received : styles.sent}>
        <View style={styles.row}>
          <View style={atoms.flex0_3}>
            <View style={atoms.paddingHorizontal20}>
              {received ? (
                <FastImageComponent contentFit="cover" source={workerImage || require("../../assets/emptyavatar.png")} style={styles.photo} />
              ) : (
                <View style={styles.avatarBox}></View>
              )}
            </View>
          </View>
          <View style={styles.ownBubble}>
            {sender.length ? <Text style={styles.sender}>{sender}</Text> : null}
            {received ? (
              <View>
                <Text style={[styles.message, styles.senderName]}>{chatMsg}</Text>
                <Text style={[styles.time, styles.sentTime]}>{time}</Text>
              </View>
            ) : (
              <View style={[styles.bubble, { backgroundColor: colors.bgColor }]}>
                <Text style={[styles.message, styles.ownText]}>{chatMsg}</Text>
                <Text style={[styles.time, styles.ownTime]}>{time}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatarBox: { width: 56, height: 30 },
  ownBubble: { marginLeft: "auto", flex: 0.8 },
  ownText: { color: palette.white, paddingHorizontal: 20 },
  senderName: { fontFamily: "Montserrat_600SemiBold", paddingLeft: 10, paddingRight: 15 },
  sentTime: { color: palette.gray600, marginLeft: "auto", marginRight: 5, marginTop: 5 },
  ownTime: { color: palette.white, position: "absolute", bottom: 5, right: 5 },
  received: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
    backgroundColor: palette.gray100,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15
  },
  sent: { flexDirection: "row", backgroundColor: palette.white, alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", paddingVertical: 10, alignItems: "flex-start" },
  photo: { width: 56, height: 56, borderRadius: 76 },
  sender: { fontSize: 20, fontFamily: "Montserrat_700Bold", paddingLeft: 10 },
  message: { fontSize: 16, fontFamily: "Montserrat_400Regular" },
  time: { fontSize: 12, textAlign: "center", fontFamily: "Montserrat_300Light" },
  bubble: { borderTopLeftRadius: 15, borderBottomLeftRadius: 15, paddingVertical: 16 }
})

export default InboxChatMsg
