// WelcomeModal.js
// The first start: a welcome in the chosen language (EN / SR toggle) that the user closes by accepting
// the terms. Without the terms ticked an alert says so and the welcome comes back.
import React, { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import TermsAgreement from "../auth/TermsAgreement"
import useAlert from "../../hooks/useAlert"
import useUiStore from "../../stores/uiStore"
import { chooseLanguage } from "../../hooks/main/useLanguageSetup"
import { translate, translatedOrNull } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// open / setOpen: the modal; onDone: the terms were accepted
const WelcomeModal = ({ visible, onVisibleChange, onDone }) => {
  const language = useUiStore((state) => state.language)
  const { showErrorThen } = useAlert()
  const [agreed, setAgreed] = useState(false)
  const other = language === "EN" ? "SR" : "EN"
  const intro = translatedOrNull("welcomeModal.introTekst")

  const accept = () => {
    if (agreed) return onDone()
    onVisibleChange(false)
    showErrorThen("welcomeModal.error", "welcomeModal.pleaseAcceptTermsConditions", () => onVisibleChange(true))
  }

  return (
    <GradientModal visible={visible} colors={BLUE} keyboardAvoiding={false}>
      <View style={atoms.padding25}>
        <Pressable style={styles.language} onPress={() => chooseLanguage(other)}>
          <Text style={styles.boldText}>{other}</Text>
        </Pressable>
        <View style={styles.welcome}>
          <Text accessibilityRole="header" style={styles.title}>
            {translate("welcomeModal.dobrodosliUGotovo")}
          </Text>
        </View>
        {/* (the admin's introduction: nothing until it is written, never its key) */}
        {intro ? <Text style={styles.text}>{intro}</Text> : null}
        <TermsAgreement small checked={agreed} onChange={setAgreed} style={styles.termsRow} textStyle={styles.agreement} linkStyle={[styles.agreement, styles.agreementBold]} />
        <Pressable android_ripple={{ color: palette.bluePale, borderless: false }} style={styles.button} onPress={accept}>
          <Text style={styles.buttonText}>{translate("common.ok")}</Text>
        </Pressable>
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  boldText: { color: palette.white, fontSize: 15, fontWeight: "700" },
  welcome: { justifyContent: "center", alignItems: "center", marginVertical: 52 },
  termsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 35, alignItems: "center" },
  language: { position: "absolute", right: "5%", top: "5%", zIndex: 5 },
  title: { fontSize: 24, fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center", textTransform: "uppercase" },
  text: { textAlign: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", color: palette.white, marginBottom: 10 },
  agreement: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: palette.white, width: "88%" },
  agreementBold: { fontFamily: "Montserrat_600SemiBold" },
  button: {
    borderRadius: 5,
    elevation: 2,
    flexDirection: "row",
    minHeight: 42,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20
  },
  buttonText: { width: "100%", color: palette.blueDark, paddingLeft: 10, textAlignVertical: "center", fontSize: 20, fontFamily: "Montserrat_500Medium", textAlign: "center" }
})

export default WelcomeModal
