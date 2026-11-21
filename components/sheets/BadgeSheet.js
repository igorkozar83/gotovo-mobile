// BadgeSheet.js
// An orange "done" modal: a big badge, a title and a message (translation keys).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import GradientModal from "./GradientModal"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { SheetDivider } from "./SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const BadgeSheet = ({ visible, onClose, badge, title, message }) => (
  <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} closeStyle={styles.closeButton} keyboardAvoiding={false}>
    <View style={atoms.padding20}>
      <View style={styles.badge}>
        <FastImageComponent style={styles.badgeImage} contentFit="contain" source={badge} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {translate(title)}
      </Text>
      <SheetDivider thick gap={20} />
      <Text style={styles.message}>{translate(message)}</Text>
    </View>
  </GradientModal>
)

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  badgeImage: { width: 192, height: 192 },
  badge: { justifyContent: "center", alignItems: "center", marginVertical: 20 },
  title: { fontSize: 24, color: palette.white, textAlign: "center", fontFamily: "Montserrat_500Medium" },
  message: { textAlign: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", color: palette.white, marginBottom: 40 }
})

export default BadgeSheet
