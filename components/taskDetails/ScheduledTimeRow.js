// ScheduledTimeRow.js
// A task's accepted time in large type: the day and month, then the hours.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import { monthThree, day, hourMin } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// style: the row's spacing
const ScheduledTimeRow = ({ time, language, style }) => (
  <View style={[styles.row, style]}>
    <View style={styles.inline}>
      <FontAwesome5 name="calendar-alt" size={20} color={palette.black} />
      <View style={styles.dateRow}>
        <Text style={[styles.big, atoms.marginLeft10]}>{day(time.date, language)}</Text>
        <Text style={styles.label}>{translate("scheduledTimeRow.th")}</Text>
        <Text style={styles.big}> {monthThree(time.date, language)}</Text>
      </View>
    </View>
    <View style={styles.inline}>
      <FastImageComponent style={styles.icon} source={require("../../assets/clock.png")} />
      <Text style={[styles.big, atoms.marginLeft10]}>
        {hourMin(time.date + " " + time.start)}-{hourMin(time.date + " " + time.end)}
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: "Montserrat_600SemiBold" },
  dateRow: { flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" },
  icon: { width: 18.5, height: 18.5, marginRight: 0 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 20 },
  inline: { flexDirection: "row", alignItems: "center" },
  big: { fontSize: small ? 16 : 24, fontFamily: "Montserrat_600SemiBold" }
})

export default ScheduledTimeRow
