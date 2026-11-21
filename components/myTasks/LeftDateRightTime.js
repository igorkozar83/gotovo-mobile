// LeftDateRightTime.js
// One row of a finished task: the day on the left ("24th Sep 2026") and the time on the right.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Octicons, FontAwesome5 } from "@expo/vector-icons"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const LeftDateRightTime = ({ dateNumber, dateText, year, time }) => (
  <View style={styles.row}>
    <View style={styles.part}>
      <FontAwesome5 name="calendar-alt" size={20} color={palette.black} />
      <View style={styles.dateRow}>
        <Text style={[styles.big, atoms.marginLeft10]}>{dateNumber}</Text>
        <Text style={styles.suffix}>{translate("leftDateRightTime.th")} </Text>
        <Text style={styles.big}>
          {" " + dateText} {year}
        </Text>
      </View>
    </View>
    <View style={styles.part}>
      <Octicons name="clock" size={20} color={palette.black} />
      <Text style={[styles.big, atoms.marginLeft10]}>{time}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  dateRow: { flexDirection: "row", alignItems: "flex-start" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingHorizontal: 20 },
  part: { flexDirection: "row", alignItems: "center" },
  big: { fontSize: 20, fontFamily: "Montserrat_600SemiBold" },
  suffix: { fontSize: 10, fontFamily: "Montserrat_600SemiBold" }
})

export default LeftDateRightTime
