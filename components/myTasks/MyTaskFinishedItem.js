// MyTaskFinishedItem.js
// A finished or canceled task in My Tasks: the date, the task and the other party, the user's rating of
// them (when given), and a finished / canceled mark.
import React from "react"
import { Pressable, View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import StarRow from "../reviews/StarRow"
import { reviewStars } from "../../Helpers/reviews"
import { finishedTaskRow } from "../../Helpers/listRows"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// task: the task (status 4 = canceled); onPress: opens it
const MyTaskFinishedItem = ({ task, onPress }) => {
  const userSelect = useAuthStore((state) => state.userSelect)
  const meId = useAuthStore((state) => state.user.userData.id)
  const language = useUiStore((state) => state.language)
  const row = finishedTaskRow(task, { userSelect, meId, language })
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={atoms.maxWidth75Percent}>
        <Text style={[styles.date, row.review != null ? null : { marginBottom: 5, position: "relative", top: 5 }]}>{row.date}</Text>
        <Text style={styles.title}>{row.title}</Text>
        <View style={atoms.height40}>
          <Text style={styles.party} ellipsizeMode="tail" numberOfLines={1}>
            {row.party}
          </Text>
          {row.review ? <StarRow value={reviewStars(row.review) || 1} size={16} spacing={3} style={atoms.justifyContentFlexStart} /> : null}
        </View>
      </View>
      <FastImageComponent contentFit="cover" style={styles.statusIcon} source={row.completed ? require("../../assets/takscomplete.png") : require("../../assets/cancelred.png")} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  statusIcon: { width: 40, height: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingHorizontal: 20 },
  date: { color: palette.black, fontSize: 13, fontFamily: "Montserrat_300Light" },
  title: { fontSize: 20, fontFamily: "Montserrat_700Bold", maxWidth: "100%" },
  party: { color: palette.black, fontSize: 16, fontFamily: "Montserrat_600SemiBold", marginRight: 10, marginBottom: 5, maxWidth: 200 }
})

export default MyTaskFinishedItem
