// AlertModal.js
// The app-wide alert (stores/modalStore.mainAlert) in the role's colours: a success or error picture, the
// title and text (translation keys), and up to three buttons: OK (closes, then okAction), cancel (closes)
// and proceed (runs proceedAction, which closes it itself). showClose adds an X.
import React, { useEffect } from "react"
import { View, Pressable, Text, ScrollView, StyleSheet } from "react-native"

import GradientModal from "../sheets/GradientModal"
import FastImageComponent from "../media/FastImageComponent"
import useAuthStore from "../../stores/authStore"
import { roleColors } from "../../Helpers/roleColors"
import { translate } from "../../Helpers/language.utils"
import { announce } from "../../Helpers/accessibility"
import { SheetDivider } from "../sheets/SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const PICTURES = {
  CLIENT: { success: require("../../assets/checkmrk.png"), error: require("../../assets/exclmark.png") },
  TASKER: { success: require("../../assets/checktasker.png"), error: require("../../assets/excltasker.png") }
}

// a white button (red for cancel) with its text and a small picture on the right
const AlertButton = ({ text, onPress, icon, iconStyle, textColor, style }) => (
  <Pressable android_ripple={{ color: palette.bluePale, borderless: false }} style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, textColor && { color: textColor }]}>{translate(text)}</Text>
    <FastImageComponent style={[styles.buttonIcon, iconStyle]} source={icon} />
  </Pressable>
)

// alert: { open, type, title, text, okText, cancelText, proceedText, proceedAction, okAction, showClose }
const AlertModal = ({ alert, onClose }) => {
  const userSelect = useAuthStore((state) => state.userSelect)
  const client = userSelect === "CLIENT"
  const { type, title, text, okText, cancelText, proceedText, proceedAction, okAction, showClose } = alert
  const picture = PICTURES[client ? "CLIENT" : "TASKER"][type]
  const buttonText = client ? null : palette.black

  // a screen reader says the alert as it opens
  useEffect(() => {
    if (alert.open) announce(title, text)
  }, [alert.open, title, text])

  return (
    <GradientModal
      visible={!!alert.open}
      onClose={showClose ? onClose : undefined}
      colors={roleColors(userSelect).gradient}
      closeStyle={styles.closeButton}
      keyboardAvoiding={false}
    >
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.centered, atoms.marginTop15]}>{picture ? <FastImageComponent style={styles.picture} source={picture} /> : null}</View>
        <View style={styles.centered}>
          <Text accessibilityRole="header" style={styles.title}>
            {title ? translate(title) : null}
          </Text>
        </View>
        {text ? (
          <>
            <SheetDivider />
            <Text style={styles.text}>{translate(text)}</Text>
          </>
        ) : null}
        {okText ? (
          <AlertButton
            text={okText}
            textColor={buttonText}
            icon={client ? require("../../assets/iconcheck.png") : require("../../assets/exctasker1.png")}
            onPress={() => {
              onClose()
              if (okAction) okAction()
            }}
          />
        ) : null}
        {cancelText ? (
          <AlertButton
            text={cancelText}
            textColor={palette.white}
            style={atoms.backgroundColorOrangeDeep}
            icon={require("../../assets/icon5.png")}
            iconStyle={styles.proceedIcon}
            onPress={onClose}
          />
        ) : null}
        {proceedText ? (
          <AlertButton
            text={proceedText}
            textColor={buttonText}
            icon={client ? require("../../assets/mytasksblue.png") : require("../../assets/exctasker1.png")}
            onPress={() => proceedAction()}
          />
        ) : null}
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: 5, top: 10 },
  proceedIcon: { width: 18, height: 18 },
  content: { borderRadius: 20, padding: 25, overflow: "hidden" },
  centered: { justifyContent: "center", alignItems: "center" },
  picture: { height: 150, aspectRatio: 1 },
  title: { fontSize: 22, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center", textTransform: "uppercase" },
  text: { textAlign: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", color: palette.white, marginBottom: 10 },
  button: {
    borderRadius: 5,
    elevation: 2,
    flexDirection: "row",
    minHeight: 42,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10
  },
  buttonText: { width: "100%", color: palette.blueDark, paddingLeft: 10, textAlignVertical: "center", fontSize: 16, fontFamily: "Montserrat_600SemiBold", textAlign: "center" },
  buttonIcon: { width: 20, height: 15, position: "absolute", right: 20, top: 12 }
})

export default AlertModal
