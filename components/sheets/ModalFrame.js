// ModalFrame.js
// What every centered modal of the app shares: the dimmed backdrop and the white card in its middle, and
// when a form needs them, keyboard handling (iOS padding, a tap outside the fields hides the keyboard).
// GradientModal and WhiteModal are its two looks; CloseX is the close button they place on the card.
import React, { useEffect, useRef } from "react"
import { View, Pressable, Modal, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

import useModalStore from "../../stores/modalStore"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"

// the card's shadow: "strong" for the sheets, "soft" for the login / register style forms
const SHADOWS = {
  strong: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },
  soft: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }
}

// the X in a card's corner; style places it (right / top / zIndex)
export const CloseX = ({ onPress, color = palette.white, size = 30, style }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} hitSlop={HIT_SLOP} style={[styles.close, style]} onPress={onPress}>
    <Text>
      <Ionicons name="close" size={size} color={color} />
    </Text>
  </Pressable>
)

/**
 * visible; onRequestClose(): Android back; animationType: "slide" (default) or "fade"
 * backdropStyle, avoidingStyle, cardStyle: this modal's differences
 * shadow: "strong" (default) or "soft"; keyboardAvoiding, dismissKeyboardOnTap: for forms
 * onCardLayout(event): the card was laid out (e.g. to size its content)
 * blur: the screen behind is blurred instead of veiled in white
 */
const ModalFrame = ({
  visible,
  onRequestClose,
  animationType = "slide",
  backdropStyle,
  avoidingStyle,
  cardStyle,
  shadow = "strong",
  keyboardAvoiding = false,
  dismissKeyboardOnTap = false,
  onCardLayout,
  blur = false,
  children
}) => {
  // tells the modal store this modal is on the screen, and when it has gone (iOS: after it slid out; a
  // late "slid out" of a modal that is visible again by then is not its going)
  const onScreen = useRef(false)
  const visibleNow = useRef(visible)
  visibleNow.current = visible
  const release = () => {
    if (!onScreen.current) return
    onScreen.current = false
    useModalStore.getState().frameGone()
  }
  const dismissed = () => {
    if (!visibleNow.current) release()
  }
  useEffect(() => {
    if (visible && !onScreen.current) {
      onScreen.current = true
      useModalStore.getState().frameShown()
    } else if (!visible && Platform.OS !== "ios") release()
  }, [visible])
  useEffect(() => release, [])

  const card = (
    <View style={[styles.card, SHADOWS[shadow], cardStyle]} onLayout={onCardLayout}>
      {children}
    </View>
  )
  const content = keyboardAvoiding ? (
    // (Android too: drawn edge to edge, the system no longer moves a modal's window over the keyboard)
    <KeyboardAvoidingView behavior="padding" enabled style={avoidingStyle}>
      {card}
    </KeyboardAvoidingView>
  ) : (
    card
  )
  const backdrop = blur ? (
    <BlurView accessibilityViewIsModal intensity={100} tint="light" style={[styles.blurred, backdropStyle]}>
      {content}
    </BlurView>
  ) : (
    <View accessibilityViewIsModal style={[styles.backdrop, backdropStyle]}>
      {content}
    </View>
  )

  // no wrapper around the Modal: it draws in its own window (accessibilityViewIsModal: VoiceOver stays in it)
  return (
    <Modal animationType={animationType} transparent={true} visible={visible} onRequestClose={onRequestClose} onDismiss={dismissed}>
      {dismissKeyboardOnTap ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {backdrop}
        </TouchableWithoutFeedback>
      ) : (
        backdrop
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.overlay, position: "relative" },
  blurred: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "85%", backgroundColor: palette.white, alignItems: "center", borderRadius: 20, shadowColor: palette.black, elevation: 5 },
  close: { position: "absolute", zIndex: 5 }
})

export default ModalFrame
