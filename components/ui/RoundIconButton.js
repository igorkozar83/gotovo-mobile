// RoundIconButton.js
// The small round buttons next to list items: remove (grey, x) and edit (role color, pencil).
// `small`: the smaller pair next to the task form's dates.
import React from "react"
import { Pressable, StyleSheet } from "react-native"
import { Feather, SimpleLineIcons } from "@expo/vector-icons"

import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP_ROW } from "../../Helpers/accessibility"

export const RemoveButton = ({ onPress, small }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={translate("roundIconButton.remove")}
    hitSlop={HIT_SLOP_ROW}
    onPress={onPress}
    style={[styles.round, small && styles.small, styles.remove]}
  >
    <Feather name="x" size={small ? 22 : 24} color={palette.black} />
  </Pressable>
)

export const EditButton = ({ onPress, small }) => {
  const colors = useRoleColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate("roundIconButton.edit")}
      hitSlop={HIT_SLOP_ROW}
      onPress={onPress}
      style={[styles.round, small && styles.small, { backgroundColor: colors.bgColor }]}
    >
      <SimpleLineIcons name="pencil" size={small ? 16 : 18} color={palette.white} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  round: { width: 35, height: 35, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  small: { width: 30, height: 30, borderRadius: 30 },
  remove: { backgroundColor: palette.gray350, marginRight: 5 }
})
