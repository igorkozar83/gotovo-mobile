// ChoiceControls.js
// A checkbox and a radio dot in the role's color, and the forms' self-toggling checkbox.
// accessibilityLabel: what a screen reader says for it (the text shown next to it).
import React from "react"
import { Pressable, View, Platform, StyleSheet } from "react-native"
import { Octicons } from "@expo/vector-icons"

import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

export const CheckBox = ({ checked, onPress, style, accessibilityLabel }) => {
  const colors = useRoleColors()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.box, { backgroundColor: checked ? colors.bgColor : palette.gray200 }, style]}
    >
      {checked && <Octicons name="check" size={24} color={palette.white} />}
    </Pressable>
  )
}

/**
 * A box that toggles: onChange(!checked). The forms' one is filled with the role's color when checked;
 * `small` is the white one of the sign-up and welcome modals, with a blue check.
 */
export const ToggleBox = ({ checked, onChange, small, testID, accessibilityLabel }) => {
  const colors = useRoleColors()
  const on = checked === true
  const box = small ? [styles.toggleSmall, { backgroundColor: on ? palette.white : palette.gray50 }] : [styles.toggle, { backgroundColor: on ? colors.bgColor : palette.gray50 }]
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!on }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={() => onChange(!checked)}
      style={box}
      testID={testID}
    >
      {on && <Octicons name="check" size={small ? 18 : 24} color={small ? palette.blueDark : palette.white} />}
    </Pressable>
  )
}

export const RadioDot = ({ selected, onPress, accessibilityLabel }) => {
  const colors = useRoleColors()
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.radio, Platform.OS !== "ios" && styles.radioAndroid]}
    >
      {selected && <View style={[styles.dot, { backgroundColor: colors.bgColor }, Platform.OS !== "ios" && styles.dotAndroid]} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  box: { width: 27, height: 27, borderRadius: 5, justifyContent: "center", alignItems: "center" },
  toggle: { width: 27, height: 27, borderRadius: 5, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: palette.gray200 },
  toggleSmall: { width: 20, height: 20, borderRadius: 4, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: palette.gray200 },
  radio: { backgroundColor: palette.gray200, width: 27.5, height: 27.5, alignItems: "center", justifyContent: "center", borderRadius: 28, marginRight: 5 },
  radioAndroid: { width: 20, height: 20 },
  dot: { width: 13, height: 13, borderRadius: 13 },
  dotAndroid: { width: 10, height: 10, borderRadius: 10 }
})
