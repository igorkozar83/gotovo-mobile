// ReadOnlyCheck.js
// A yes/no shown as a checked box or a crossed one (not editable); a screen reader says label and the state.
import React from "react"
import { View, StyleSheet } from "react-native"
import { Fontisto } from "@expo/vector-icons"

import { ToggleBox } from "./ChoiceControls"
import { palette } from "../../styles/palette"

const ReadOnlyCheck = ({ checked, label }) => (
  <View accessible accessibilityRole="checkbox" accessibilityState={{ checked: !!checked, disabled: true }} accessibilityLabel={label}>
    {checked ? (
      <ToggleBox checked={true} onChange={() => {}} />
    ) : (
      <View style={styles.no}>
        <Fontisto name="close-a" size={14} color={palette.black} />
      </View>
    )}
  </View>
)

const styles = StyleSheet.create({
  no: { width: 27, height: 27, backgroundColor: palette.gray50, borderWidth: 1, borderColor: palette.gray200, borderRadius: 5, alignItems: "center", justifyContent: "center" }
})

export default ReadOnlyCheck
