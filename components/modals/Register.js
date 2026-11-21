// Register.js
// The register modal: name, email and password with the accepted terms, or Google or Apple (the form
// and its checks are in useRegisterForm).
import React, { useRef } from "react"
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"

import ModalAppleNameLastName from "./ModalAppleNameLastName"
import GradientModal from "../sheets/GradientModal"
import { AuthField, PasswordField } from "../auth/AuthField"
import SocialButtons from "../auth/SocialButtons"
import TermsAgreement from "../auth/TermsAgreement"
import useRegisterForm from "../../hooks/auth/useRegisterForm"
import useFocusScroll from "../../hooks/auth/useFocusScroll"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

WebBrowser.maybeCompleteAuthSession()

export default function Register() {
  const userSelect = useAuthStore((state) => state.userSelect)
  const registerOpen = useUiStore((state) => state.registerOpen)
  const language = useUiStore((state) => state.language)
  const { setRegisterOpen } = useUiStore.getState()

  const { field, agreement, setAgreement, submit, onGoogle, onApple, apple } = useRegisterForm()
  const refs = { lastname: useRef(null), email: useRef(null), password: useRef(null), confirmPassword: useRef(null) }
  const scroll = useFocusScroll({ keyboardEvents: "Did", target: (fieldY, keyboardHeight) => fieldY - keyboardHeight + 50 })

  // each field's scroll position and focus, and where Enter goes next
  const fieldProps = (index, next) => ({
    onLayout: scroll.fieldLayout(index),
    onFocus: () => scroll.fieldFocus(index),
    onSubmitEditing: next ? () => refs[next].current.focus() : submit
  })

  return (
    <>
      <GradientModal
        visible={registerOpen}
        colors={[palette.blueDark, palette.blue]}
        onClose={() => setRegisterOpen(false)}
        closeSize={26}
        closeStyle={styles.closeBtn}
        outerStyle={styles.backdrop}
        cardStyle={[styles.card, scroll.keyboardVisible && styles.cardLow]}
        gradientStyle={styles.gradient}
        shadow="soft"
        dismissKeyboardOnTap={false}
      >
        <ScrollView ref={scroll.scrollRef} scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text accessibilityRole="header" style={[styles.modalTitle, language === "SR" && { fontSize: 30 }]}>
              {translate("register.register")}
            </Text>
            <AuthField
              label={"register.firstName"}
              placeholder={translate("register.yourName")}
              {...field("name")}
              {...fieldProps(0, "lastname")}
              // the name field scrolls a moment later
              onFocus={() => setTimeout(() => scroll.fieldFocus(0), 1500)}
            />
            <AuthField ref={refs.lastname} label={"register.lastName"} placeholder={translate("register.yourLastName")} {...field("lastname")} {...fieldProps(1, "email")} />
            <AuthField
              ref={refs.email}
              label={"register.email"}
              keyboardType="email-address"
              placeholder={translate("register.enterEmail")}
              {...field("email")}
              {...fieldProps(2, "password")}
            />
            <PasswordField
              ref={refs.password}
              label={"register.password"}
              lineHeight={18}
              tapFocuses
              multiline={false}
              placeholder={translate("register.enterPassword")}
              {...field("password")}
              {...fieldProps(3, "confirmPassword")}
            />
            <PasswordField
              ref={refs.confirmPassword}
              label={"register.confirmPassword"}
              lineHeight={18}
              tapFocuses
              multiline={false}
              placeholder={translate("register.passwordConfirm")}
              {...field("confirmPassword")}
              {...fieldProps(4)}
            />
            <TermsAgreement small checked={agreement} onChange={setAgreement} />
            <Pressable style={styles.button} onPress={submit}>
              <Text style={styles.buttonText}>{translate("register.register")}</Text>
              <Text style={styles.chevron}>
                <Feather name="chevrons-right" color={palette.white} size={25} />
              </Text>
            </Pressable>
            <Text style={styles.semiBold}>{translate("register.orLoginUsing")}</Text>
            <Text style={styles.line}></Text>
            <SocialButtons onGoogle={onGoogle} onApple={onApple} appleAvailable={apple.available} />
          </View>
        </ScrollView>
      </GradientModal>
      <ModalAppleNameLastName visible={apple.nameModal.open} onClose={apple.nameModal.close} userSelect={userSelect} onSubmit={apple.nameModal.submit} />
    </>
  )
}

const styles = StyleSheet.create({
  form: { borderRadius: 20, overflow: "hidden", padding: 35 },
  backdrop: { paddingTop: 10, paddingBottom: 20 },
  card: { marginVertical: 20, marginHorizontal: 20 },
  cardLow: { marginBottom: 0 },
  closeBtn: { right: 5, top: 10, zIndex: 10 },
  gradient: { height: "100%" },
  content: { flexGrow: 1, borderRadius: 20, overflow: "hidden" },
  modalTitle: { marginBottom: 15, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 36, color: palette.white, paddingBottom: 30 },
  button: {
    padding: 10,
    elevation: 2,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: palette.blueDark,
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  },
  buttonText: {
    width: "100%",
    color: palette.white,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    // (taller than the font: a line as high as the letters cut the bottom of j and g, "Registracija")
    lineHeight: 24,
    fontSize: 18,
    fontFamily: "Montserrat_500Medium"
  },
  chevron: { width: 25, height: 25, position: "absolute", right: "5%", top: "50%", transform: [{ translateY: -2 }] },
  semiBold: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: palette.white, textAlign: "center" },
  line: { width: "100%", height: 2, backgroundColor: palette.white, marginTop: 20, marginBottom: 20 }
})
