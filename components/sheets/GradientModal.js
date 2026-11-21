// GradientModal.js
// The shell of the app's form modals (a ModalFrame): a centered card with the role's gradient and a close
// X. The content (usually a ScrollView) is the children. Without onClose there is no X (the user must
// answer).
//   dismissKeyboardOnTap: a tap outside the fields hides the keyboard; keyboardAvoiding: iOS padding
import React from "react"
import { StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import ModalFrame, { CloseX } from "./ModalFrame"
import { palette } from "../../styles/palette"

export const ORANGE = [palette.orangeDeep, palette.orange]
export const BLUE = [palette.blueDark, palette.blue]

/**
 * colors: the gradient; closeStyle / closeSize: the X; outerStyle, avoidingStyle, cardStyle, shadow,
 * gradientStyle, onCardLayout: this modal's differences (see ModalFrame)
 */
const GradientModal = ({
  visible,
  onClose,
  onRequestClose,
  colors = ORANGE,
  closeStyle,
  closeSize = 30,
  outerStyle,
  avoidingStyle,
  cardStyle,
  gradientStyle,
  shadow,
  keyboardAvoiding = true,
  dismissKeyboardOnTap = true,
  onCardLayout,
  children
}) => (
  <ModalFrame
    visible={visible}
    onRequestClose={onRequestClose}
    backdropStyle={outerStyle}
    avoidingStyle={avoidingStyle}
    cardStyle={[styles.card, cardStyle]}
    shadow={shadow}
    keyboardAvoiding={keyboardAvoiding}
    dismissKeyboardOnTap={dismissKeyboardOnTap}
    onCardLayout={onCardLayout}
  >
    <LinearGradient colors={colors} style={[styles.gradient, gradientStyle]}>
      {onClose ? <CloseX onPress={onClose} size={closeSize} style={closeStyle} /> : null}
      {children}
    </LinearGradient>
  </ModalFrame>
)

const styles = StyleSheet.create({
  gradient: { width: "100%", borderRadius: 20, overflow: "hidden" },
  card: { marginVertical: 0, padding: 0 }
})

export default GradientModal
