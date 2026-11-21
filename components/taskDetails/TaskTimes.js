// TaskTimes.js
// The task's preferred times and whether its dates are flexible. With `originalTimes` only the times the
// client posted are shown (not the ones proposed later).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import TitleWithBorder from "../ui/TitleWithBorder"
import ReadOnlyCheck from "../ui/ReadOnlyCheck"
import FastImageComponent from "../media/FastImageComponent"
import { timeFormatNoTime } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const TimeRow = ({ time, language }) => (
  <View style={styles.row}>
    <View style={styles.cell}>
      <FastImageComponent contentFit="cover" style={styles.calendarIcon} source={require("../../assets/cal.png")} />
      <Text style={styles.text}>{timeFormatNoTime(time.date, language)}</Text>
    </View>
    <View style={styles.cell}>
      <FastImageComponent contentFit="cover" style={styles.clockIcon} source={require("../../assets/clock1.png")} />
      <Text style={styles.text}>
        {time.start.slice(0, -3)}-{time.end.slice(0, -3)}
      </Text>
    </View>
  </View>
)

const TaskTimes = ({ task, language, originalTimes }) => (
  <>
    <View style={atoms.marginBottom10}>
      <TitleWithBorder title={translate("taskTimes.preferredTime")} />
    </View>
    {task.times
      .filter((time) => !time.user_id || !originalTimes)
      .map((time, index) => (
        <TimeRow key={`task-time-${index}`} time={time} language={language} />
      ))}
    <View style={styles.flexible}>
      <Text style={styles.flexibleText}>{translate("taskTimes.datesAreFlexible")}</Text>
      <ReadOnlyCheck label={translate("taskTimes.datesAreFlexible")} checked={task.flexible_dates === 1} />
    </View>
  </>
)

const styles = StyleSheet.create({
  calendarIcon: { width: 18.5, height: 17.5, marginRight: 5 },
  clockIcon: { width: 18, height: 18, marginRight: 5, aspectRatio: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cell: { flexDirection: "row", alignItems: "center" },
  text: { fontSize: 14, fontFamily: "Montserrat_600SemiBold" },
  flexible: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  flexibleText: { fontSize: 16, fontFamily: "Montserrat_500Medium", color: palette.black }
})

export default TaskTimes
