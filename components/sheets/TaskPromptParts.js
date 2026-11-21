// TaskPromptParts.js
// The pieces of the blue "please confirm" task modals (started, complete): the big check, the question,
// the accepted time, the task's name and the other party.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { dateMonth, hourMin } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { SheetDivider } from "./SheetParts"
import { palette } from "../../styles/palette"

// the picture (the big check unless given) and the question (a translation key)
export const PromptHead = ({ question, icon = require("../../assets/iconcheckBig.png"), iconStyle, style }) => (
  <>
    <View style={[styles.centered, style]}>
      <FastImageComponent style={[styles.check, iconStyle]} source={icon} />
    </View>
    <View style={[styles.centered, style]}>
      <Text style={styles.question}>{translate(question)}</Text>
    </View>
    <SheetDivider />
  </>
)

// from, to: the start and end ("YYYY-MM-DD HH:mm:ss"); Helpers/taskStatus.timeRangeOf gives them
// stacked: the date above the hours
export const PromptTime = ({ from, to, language, stacked, style }) => (
  <View style={[stacked ? { width: "100%" } : { flexDirection: "row", justifyContent: "space-between", overflow: "hidden" }, style]}>
    <View style={styles.row}>
      <FastImageComponent style={styles.icon} source={require("../../assets/iconcal.png")} />
      <Text style={styles.time}>{dateMonth(from, language)}</Text>
    </View>
    <View style={styles.row}>
      <FastImageComponent style={styles.icon} source={require("../../assets/iconclock.png")} />
      <Text style={styles.time}>
        {hourMin(from)}-{hourMin(to)}
      </Text>
    </View>
  </View>
)

export const PromptTaskName = ({ children, style, textStyle }) => (
  <View style={[styles.taskRow, style]}>
    <Text style={[styles.big, textStyle]}>{children}</Text>
  </View>
)

// the other party's photo (the empty avatar without one) and name
export const PromptParty = ({ user, style }) => (
  <View style={[styles.partyRow, style]}>
    <FastImageComponent
      source={user && user.avatar ? (typeof user.avatar === "string" ? { uri: user.avatar } : user.avatar) : require("../../assets/emptyavatar.png")}
      style={styles.avatar}
    />
    <Text style={[styles.big, styles.name]} ellipsizeMode="tail" numberOfLines={1}>
      {user && user.name}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  taskRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  partyRow: { flexDirection: "row", marginTop: 20, alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  centered: { justifyContent: "center", alignItems: "center", marginTop: 10 },
  check: { height: 60, aspectRatio: 1.23 },
  question: { fontSize: 22, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 16, height: 16, marginRight: 12 },
  time: { fontFamily: "Montserrat_300Light", fontSize: 18, color: palette.white },
  big: { fontSize: 28, fontFamily: "Montserrat_600SemiBold", color: palette.white, textAlign: "center", lineHeight: 30 },
  name: { marginLeft: 20, fontSize: 18, flex: 1, flexShrink: 1 }
})
