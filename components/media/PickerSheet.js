// PickerSheet.js
// The small modal offering where a picture comes from (camera, gallery...), with a close X; and its
// full-width option button.
import React from "react"
import { StyleSheet, View, Pressable, Text } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import { translate } from "../../Helpers/language.utils"
import ModalFrame from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"
import { HIT_SLOP } from "../../Helpers/accessibility"

export const PickerOption = ({ label, icon, color, onPress, style }) => (
  <View style={[styles.optionRow, style]}>
    <Pressable onPress={onPress}>
      <View style={[styles.option, { backgroundColor: color }]}>
        <Text style={styles.optionText}>{translate(label)}</Text>
        <View style={styles.closeBox}>{icon}</View>
      </View>
    </Pressable>
  </View>
)

const PickerSheet = ({ visible, onClose, closeColor, children }) => (
  <ModalFrame visible={visible} onRequestClose={onClose} cardStyle={styles.card}>
    <View style={styles.closeButton}>
      <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} hitSlop={HIT_SLOP} onPress={onClose}>
        <AntDesign name="close" size={24} color={closeColor} />
      </Pressable>
    </View>
    {children}
  </ModalFrame>
)

const styles = StyleSheet.create({
  optionRow: { width: "100%", marginBottom: 5 },
  closeBox: { position: "absolute", right: "7%" },
  closeButton: { position: "absolute", top: 20, right: 20 },
  card: { marginVertical: 20, padding: 20 },
  option: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", position: "relative", paddingVertical: 5, marginBottom: 10 },
  optionText: { width: "70%", fontSize: 20, fontFamily: "Montserrat_500Medium", lineHeight: 30, textAlign: "center", color: palette.white }
})

export default PickerSheet
