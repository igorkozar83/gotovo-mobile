// DateChoice.js
// A task time as a row (calendar date, clock hours) and the round radio a tasker picks one with.
import React from "react"
import { View, Text, TouchableWithoutFeedback, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { timeFormatNoTime, hourMin } from "../../Helpers"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

// children: what follows the hours (a radio)
export const DateRow = ({ time, language, children }) => (
  <View style={styles.row}>
    <View style={styles.inline}>
      <FastImageComponent style={styles.icon} source={require("../../assets/cal.png")} />
      <Text style={styles.value}>{timeFormatNoTime(time.date, language)}</Text>
    </View>
    <View style={styles.inline}>
      <FastImageComponent style={styles.icon} source={require("../../assets/clock.png")} />
      <Text style={styles.value}>
        {hourMin(time.date + " " + time.start)}-{hourMin(time.date + " " + time.end)}
      </Text>
    </View>
    {children}
  </View>
)

// what a screen reader says for a time: the date and the hours
export const spokenTime = (time, language) => timeFormatNoTime(time.date, language) + ", " + hourMin(time.date + " " + time.start) + "-" + hourMin(time.date + " " + time.end)

// selected: the dot shows; onPress: null when the choice can't change; color: the dot's; accessibilityLabel: spokenTime
export const DateRadio = ({ selected, onPress, color, accessibilityLabel }) => (
  <View>
    <TouchableWithoutFeedback
      accessibilityRole="radio"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={onPress || undefined}
    >
      <View style={styles.radio}>{selected ? <View style={[styles.radioDot, { backgroundColor: color }]}></View> : null}</View>
    </TouchableWithoutFeedback>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  inline: { flexDirection: "row", alignItems: "center" },
  icon: { width: 18.5, height: 18.5, marginRight: 10 },
  value: { fontFamily: "Montserrat_600SemiBold", fontSize: 14 },
  radio: { height: 22, width: 22, borderRadius: 22, backgroundColor: palette.gray100, alignItems: "center", justifyContent: "center" },
  radioDot: { height: 12, width: 12, borderRadius: 16 }
})
