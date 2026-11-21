// DayCell.js
// A day of the date picker's calendar: marked when a time is already chosen on it, highlighted when
// selected, bold on weekends, grey when it can't be picked (past, or more than about a year ahead).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import { checkDiffToday } from "../../Helpers"
import { palette } from "../../styles/palette"

const isWeekend = (day) => [0, 6].includes(new Date(day).getDay())
const outOfRange = (day) => checkDiffToday(day) > 0 || checkDiffToday(day) < -360

const DayCell = ({ date, onPress, marked, selected }) => (
  <Pressable onPress={() => onPress(date)}>
    <View style={[marked ? styles.marked : null, selected ? styles.selected : null]}>
      <Text
        style={[
          marked ? styles.markedText : { color: palette.black },
          selected ? styles.selectedText : null,
          styles.day,
          { fontFamily: isWeekend(date.dateString) ? "Montserrat_600SemiBold" : "Montserrat_400Regular" },
          outOfRange(date.dateString) ? styles.grayedOut : null
        ]}
      >
        {date.day}
      </Text>
    </View>
  </Pressable>
)

const circle = { width: 26, height: 26, alignItems: "center", justifyContent: "center", borderRadius: 16, marginTop: -6 }

const styles = StyleSheet.create({
  day: { textAlign: "center", fontSize: 18, width: 26, height: 26, marginVertical: -3 },
  marked: { ...circle, backgroundColor: palette.blueSoft },
  markedText: { color: palette.white },
  selected: { ...circle, backgroundColor: palette.blue },
  selectedText: { color: palette.white, position: "relative" },
  grayedOut: { color: palette.gray300 }
})

export default DayCell
