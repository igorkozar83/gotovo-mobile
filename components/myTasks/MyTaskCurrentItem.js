// MyTaskCurrentItem.js
// An active task in My Tasks: when it was posted, its name, its status line and status icon, in the
// role's colour (Helpers/currentTask).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { currentTaskStatus } from "../../Helpers/currentTask"
import { currentTaskRow } from "../../Helpers/listRows"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { palette } from "../../styles/palette"

const ICONS = {
  posted: require("../../assets/taskposted.png"),
  inProgress: require("../../assets/icontaskinprogress.png"),
  received: require("../../assets/offerreceived.png"),
  offerAccepted: require("../../assets/offeraccepted.png"),
  accepted: require("../../assets/accepted.png"),
  scheduled: require("../../assets/scheduled.png"),
  completion: require("../../assets/completion.png"),
  disputed: require("../../assets/disputediconmyasks.png"),
  revised: require("../../assets/offerrevised.png")
}

const lineText = (line) => (typeof line === "string" ? translate(line) : `${line.count} ${translate(line.key)}`)

// task: the active task; onPress: opens it
const MyTaskCurrentItem = ({ task, onPress }) => {
  const role = useAuthStore((state) => state.userSelect)
  const language = useUiStore((state) => state.language)
  const row = currentTaskRow(task, { userSelect: role, language })
  const status = currentTaskStatus(row.status, role, { offers: row.offers, completion: row.completion })
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View>
        <Text style={styles.date}>{row.date}</Text>
        <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
          {row.title}
        </Text>
        {/* the row around the status keeps a long status from pushing the icon off the row */}
        <View style={styles.itemRow}>
          {status.lines.length ? (
            <Text style={[styles.status, { color: status.color }, role === "TASKER" && row.status !== "revised" && { width: "80%" }]}>{status.lines.map(lineText).join("")}</Text>
          ) : null}
        </View>
      </View>
      {status.icon ? <FastImageComponent contentFit="cover" style={styles.statusIcon} source={ICONS[status.icon]} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: "row", alignItems: "center" },
  statusIcon: { width: 40, height: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingHorizontal: 20 },
  date: { color: palette.black, fontSize: 13, fontFamily: "Montserrat_300Light" },
  name: { fontSize: 20, fontFamily: "Montserrat_700Bold", maxWidth: 220 },
  status: { fontSize: 16, fontFamily: "Montserrat_600SemiBold", marginRight: 10 }
})

export default MyTaskCurrentItem
