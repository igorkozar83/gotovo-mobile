// ResetPass.js
// "Forgot password": the user's email gets a reset link. The modal closes on sending; a badge then asks
// the user to check their email.
import React, { useState } from "react"
import { Text, Pressable, ScrollView, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import GradientModal from "../sheets/GradientModal"
import ModalBadge from "../sheets/ModalBadge"
import { AuthField } from "../auth/AuthField"
import useAlert from "../../hooks/useAlert"
import useRoleColors from "../../hooks/useRoleColors"
import { isValidEmail } from "../../Helpers/validation"
import { translate } from "../../Helpers/language.utils"
import { useRequestPasswordReset } from "../../hooks/auth/useAccountActions"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const sentBadge = () => ({
  image: "https://app.gotovo.rs/images/okbadge.png",
  title: translate("resetPass.requestedResetPassword"),
  text: translate("resetPass.weHaveSentYouAnEmail"),
  type: "client"
})

const ResetPass = ({ visible, onClose }) => {
  const colors = useRoleColors()
  const { showError } = useAlert()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const requestReset = useRequestPasswordReset({
    onSuccess: () => {
      setEmail("")
      setSent(true)
    }
  })

  const submit = () => {
    if (!isValidEmail(email)) return showError("resetPass.changePassworsError", "resetPass.pleaseEnterValidEmail")
    onClose()
    requestReset.run(email)
  }

  return (
    <>
      <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} colors={colors.gradient} closeStyle={styles.closeButton} avoidingStyle={atoms.borderRadius20}>
        <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>
            {translate("resetPass.resetPassword")}
          </Text>
          <AuthField label={"resetPass.email"} labelStyle={atoms.marginTop10} onChangeText={setEmail} placeholder={translate("resetPass.enterYourEmail")} value={email} />
          <Pressable style={styles.button} onPress={submit}>
            <Text style={[styles.buttonText, { color: colors.onWhite }]}>{translate("resetPass.requestReset")}</Text>
            <MaterialCommunityIcons name="lock-reset" size={20} color={colors.onWhite} style={styles.buttonIcon} />
          </Pressable>
        </ScrollView>
      </GradientModal>
      <ModalBadge visible={sent} onClose={() => setSent(false)} badge={sentBadge()} />
    </>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: 10, top: 10 },
  content: { flexGrow: 1, borderRadius: 20, overflow: "hidden", padding: 35 },
  title: { marginBottom: 15, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 36, color: palette.white, paddingBottom: 30 },
  button: {
    padding: 15,
    paddingBottom: 10,
    elevation: 2,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: palette.white,
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  },
  buttonText: { width: "100%", textAlign: "center", textAlignVertical: "center", lineHeight: 18, fontSize: 18, fontFamily: "Montserrat_500Medium" },
  buttonIcon: { marginRight: 10, position: "relative", right: 15, top: -3 }
})

export default ResetPass
