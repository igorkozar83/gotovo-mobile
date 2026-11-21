// ModalBadge.js
// A "done" modal with a badge picture (from a URL, at its own proportions), a title and a text, in the
// client's blue or the tasker's orange (badge.type "client" / "tasker").
import React, { useEffect, useState } from "react"
import { View, Text, Image, StyleSheet } from "react-native"

import GradientModal, { BLUE, ORANGE } from "./GradientModal"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { reportError } from "../../Helpers/reportError"
import { SheetDivider } from "./SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// badge: { image, title, text, type }
const ModalBadge = ({ visible, onClose, badge }) => {
  const [ratio, setRatio] = useState(1)

  useEffect(() => {
    Image.getSize(
      badge.image,
      (width, height) => width && height && setRatio(width / height),
      (error) => reportError(error, "ModalBadge.imageSize")
    )
  }, [badge.image])

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      colors={badge.type === "tasker" ? ORANGE : BLUE}
      closeStyle={styles.closeButton}
      keyboardAvoiding={false}
    >
      <View style={atoms.padding20}>
        <View style={[styles.centered, atoms.marginTop20]}>
          <FastImageComponent source={badge.image} style={{ width: 200, aspectRatio: ratio }} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {translate(badge.title)}
        </Text>
        <SheetDivider gap={10} />
        <Text style={styles.text}>{translate(badge.text)}</Text>
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  centered: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center" },
  text: { fontSize: 20, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center", lineHeight: 30 }
})

export default ModalBadge
