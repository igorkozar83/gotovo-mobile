// WhiteModal.js
// A white card sliding up over the dimmed screen (a ModalFrame), the frame of the small forms and pickers.
import React from "react"
import { StyleSheet } from "react-native"

import ModalFrame from "./ModalFrame"

/**
 * onClose: Android back; cardStyle: the card's differences (padding, width, height)
 * the other ModalFrame options (animationType, shadow, keyboardAvoiding, ...) pass through
 */
const WhiteModal = ({ visible, onClose, cardStyle, children, ...frame }) => (
  <ModalFrame visible={visible} onRequestClose={onClose} cardStyle={[styles.card, cardStyle]} {...frame}>
    {children}
  </ModalFrame>
)

const styles = StyleSheet.create({
  card: { marginVertical: 20, paddingVertical: 20 }
})

export default WhiteModal
