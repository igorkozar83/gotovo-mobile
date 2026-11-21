// VerifyPhoneModal.js
// Verifying the user's phone: the number (Serbian) first; once the SMS is sent the modal comes back
// with the six code fields, and a filled code is checked (the user is reloaded when it is right).
import React, { useEffect, useState, useRef } from "react"
import { StyleSheet, View, Text } from "react-native"
import PhoneInput from "react-native-phone-number-input"
import OTPInputView from "@twotalltotems/react-native-otp-input"

import Button from "../ui/Button"
import GradientModal from "../sheets/GradientModal"
import { useSendVerificationSms, useCheckVerificationCode } from "../../hooks/auth/useAccountActions"
import useReloadUser from "../../hooks/useReloadUser"
import useAlert from "../../hooks/useAlert"
import useAuthStore from "../../stores/authStore"
import { roleColors } from "../../Helpers/roleColors"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

/**
 * visible / onVisibleChange(visible): shown or not; onClose(): hides it
 * (the modal hides while a request runs and comes back for the code)
 */
const VerifyPhoneModal = ({ onClose, visible, onVisibleChange }) => {
  const userType = useAuthStore((state) => state.user.userData?.type)
  const reloadUser = useReloadUser()
  const { showError } = useAlert()
  const otpInput = useRef()

  const [value, setValue] = useState("")
  const [formattedValue, setFormattedValue] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  // the code fields get the focus once they show
  useEffect(() => {
    if (!codeSent) return
    const timer = setTimeout(() => otpInput.current && otpInput.current.focusField(0), 500)
    return () => clearTimeout(timer)
  }, [codeSent])

  const sendCode = useSendVerificationSms({
    onSuccess: () => {
      setCodeSent(true)
      onVisibleChange(true)
    }
  })

  const verify = useCheckVerificationCode({
    onSuccess: () => {
      onVisibleChange(false)
      setCodeSent(false)
      setValue("")
      setFormattedValue("")
      reloadUser()
    }
  })

  const sendVerificationCode = () => {
    if (!formattedValue) return showError("verifyPhoneModal.sendVerificationCodeError", "verifyPhoneModal.pleaseEnterPhoneNumber")
    onClose()
    sendCode.run(formattedValue)
  }

  const checkCode = (code) => {
    const problems = [!formattedValue && "Please enter phone number.", !code && "Please enter verification code."].filter(Boolean)
    if (problems.length) return showError("verifyPhoneModal.sendVerificationCodeError", problems.map((problem) => translate(problem)).join("\n"))
    onClose()
    verify.run(formattedValue, code)
  }

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      colors={roleColors(userType).gradient}
      closeStyle={styles.closeButton}
      closeSize={38}
      cardStyle={atoms.margin20}
      keyboardAvoiding={false}
      dismissKeyboardOnTap={false}
    >
      <View style={atoms.padding35}>
        <Text accessibilityRole="header" style={styles.title}>
          {translate("common.verifyPhoneNumber")}
        </Text>
        {!codeSent ? (
          <>
            <View style={styles.centered}>
              <PhoneInput
                countryPickerProps={{ countryCodes: ["RS"], withAlphaFilter: true }}
                containerStyle={styles.phoneInput}
                placeholder={translate("verifyPhoneModal.phoneNo")}
                textInputStyle={styles.phoneText}
                codeTextStyle={styles.phoneText}
                flagButtonStyle={styles.phoneFlag}
                textContainerStyle={styles.phoneTextBox}
                textInputProps={{ numberOfLines: 1 }}
                defaultValue={value}
                defaultCode="RS"
                layout="first"
                onChangeText={setValue}
                onChangeFormattedText={setFormattedValue}
                withShadow
                autoFocus
              />
            </View>
            <Button title={"verifyPhoneModal.sendVerificationCode"} onPress={sendVerificationCode} />
          </>
        ) : (
          <OTPInputView
            ref={otpInput}
            style={styles.codeInput}
            pinCount={6}
            autoFocusOnLoad={false}
            editable={true}
            codeInputFieldStyle={styles.codeField}
            codeInputHighlightStyle={atoms.borderColorTeal}
            onCodeFilled={checkCode}
          />
        )}
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  centered: { justifyContent: "center", alignItems: "center" },
  phoneInput: { width: "85%", marginTop: 10, marginBottom: 20 },
  // (smaller than the library's 16, so "Br. telefona" fits beside the country code)
  phoneText: { fontSize: 14 },
  // only Serbia to pick: a narrow flag button and less padding leave the number room, so "Br. telefona" is one line
  phoneFlag: { width: 56 },
  phoneTextBox: { paddingHorizontal: 8 },
  codeInput: { height: 100, justifyContent: "center", alignItems: "center" },
  title: { color: palette.white, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 22, marginTop: 20 },
  codeField: { width: 25, height: 45, borderWidth: 0, borderBottomWidth: 1, fontSize: 16 }
})

export default VerifyPhoneModal
