// TabNavigation.js
// The My Tasks tabs: current, finished and the calendar.
import React from "react"
import { View, Pressable, Text, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const TABS = [
  { id: "CURRENTONE", label: "tabNavigation.current" },
  { id: "FINISHED", label: "tabNavigation.finished" },
  { id: "CALENDAR", label: "tabNavigation.calendar" }
]

const TabNavigation = ({ screen, setScreen, style }) => (
  <View style={[styles.bar, style]}>
    {TABS.map((tab) => (
      <Pressable key={tab.id} style={[atoms.width33Percent, screen === tab.id && styles.activeTab]} onPress={() => setScreen(tab.id)}>
        <Text style={screen === tab.id ? styles.activeText : styles.text}>{translate(tab.label)}</Text>
      </Pressable>
    ))}
  </View>
)

const styles = StyleSheet.create({
  bar: { flexDirection: "row", justifyContent: "space-between", borderBottomColor: palette.gray700, borderBottomWidth: 1, paddingHorizontal: 20, paddingTop: 10 },
  text: {
    fontSize: 14,
    marginRight: 10,
    fontFamily: "Montserrat_400Regular",
    paddingBottom: 10,
    textAlign: "center",
    borderBottomWidth: 3,
    borderBottomColor: palette.transparent,
    width: "100%"
  },
  activeText: { fontSize: 14, marginRight: 20, fontFamily: "Montserrat_700Bold", paddingBottom: 10, textAlign: "center", width: "100%" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: palette.black }
})

export default TabNavigation
