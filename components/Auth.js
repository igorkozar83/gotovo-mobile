// Auth.js
// The login modal: email and password, Google or Apple, and the links to a forgotten password and to
// registering (the form and its checks are in useLoginForm).
import React, { useRef } from "react"
import { View, Text, Pressable, ScrollView, Platform, StyleSheet } from "react-native"
import { SimpleLineIcons } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"

import VerifyPhoneModal from "./modals/VerifyPhoneModal"
import GradientModal from "./sheets/GradientModal"
import ModalAppleNameLastName from "./modals/ModalAppleNameLastName"
import { AuthField, PasswordField } from "./auth/AuthField"
import SocialIcons from "./auth/SocialIcons"
import OrDivider from "./auth/OrDivider"
import useLoginForm from "../hooks/auth/useLoginForm"
import useFocusScroll from "../hooks/auth/useFocusScroll"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import { translate } from "../Helpers/language.utils"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

WebBrowser.maybeCompleteAuthSession()

const SCROLL_MARGIN = Platform.OS === "ios" ? 60 : 30

export default function Auth({ openForgotPass }) {
  const userSelect = useAuthStore((state) => state.userSelect)
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const authOpen = useUiStore((state) => state.authOpen)
  const { setAuthOpen, setRegisterOpen } = useUiStore.getState()

  const { email, setEmail, password, setPassword, submit, loginWithGoogle, apple, verifyPhoneOpen, setVerifyPhoneOpen } = useLoginForm()
  const passwordRef = useRef(null)
  const scroll = useFocusScroll({ keyboardEvents: "Will", target: (fieldY) => fieldY - SCROLL_MARGIN })

  const client = userSelect === "CLIENT"
  const accent = client ? palette.blueDark : palette.orangeDark
  return (
    <>
      <VerifyPhoneModal visible={verifyPhoneOpen} onVisibleChange={setVerifyPhoneOpen} onClose={() => setVerifyPhoneOpen(false)} />
      <GradientModal
        visible={authOpen}
        colors={client ? [palette.blueDark, palette.blue] : [palette.orangeDark, palette.orange]}
        onClose={() => {
          setAuthOpen(false)
          if (!loggedIn) useAuthStore.getState().setUserSelect("CLIENT")
        }}
        closeStyle={[styles.closeBtn, Platform.OS === "ios" && scroll.keyboardVisible && styles.closeRaised]}
        outerStyle={styles.backdrop}
        cardStyle={[styles.card, scroll.keyboardVisible && styles.cardLow]}
        gradientStyle={styles.gradient}
        shadow="soft"
      >
        <ScrollView ref={scroll.scrollRef} scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.modalTitle}>
            {translate("common.login")}
          </Text>
          <AuthField
            label={"auth.username"}
            onLayout={scroll.fieldLayout(0)}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={translate("auth.enterEmail")}
            value={email}
            multiline={true}
            onFocus={() => scroll.fieldFocus(0)}
            onSubmitEditing={() => passwordRef.current.focus()}
          />
          <PasswordField
            ref={passwordRef}
            label={"auth.password"}
            lineHeight={20}
            onLayout={scroll.fieldLayout(1)}
            onChangeText={setPassword}
            placeholder={translate("auth.enterPassword")}
            value={password}
            onFocus={() => scroll.fieldFocus(1)}
            onSubmitEditing={submit}
          />
          <Pressable style={styles.loginButton} onPress={submit}>
            <Text style={[styles.loginText, { color: accent }]}>{translate("common.login")}</Text>
            <SimpleLineIcons name="login" size={20} color={accent} style={styles.appleIcon} />
          </Pressable>
          <View>
            <Pressable
              style={styles.forgotLink}
              onPress={() => {
                setAuthOpen(false)
                openForgotPass()
              }}
            >
              <Text style={styles.link}>{translate("auth.forgotYourPassword")}</Text>
            </Pressable>
            <Pressable
              style={atoms.marginBottom40}
              onPress={() => {
                setAuthOpen(false)
                setRegisterOpen(true)
              }}
            >
              <Text style={styles.link}>{translate("auth.donTHaveAGotovoAccount")}</Text>
            </Pressable>
          </View>
          <OrDivider />
          <SocialIcons client={client} onGoogle={loginWithGoogle} apple={apple} />
        </ScrollView>
      </GradientModal>
      <ModalAppleNameLastName visible={apple.nameModal.open} onClose={apple.nameModal.close} userSelect={userSelect} onSubmit={apple.nameModal.submit} />
    </>
  )
}

const styles = StyleSheet.create({
  forgotLink: { marginBottom: 20, marginTop: 10 },
  appleIcon: { marginRight: 10, position: "relative", right: 15, top: -3 },
  backdrop: { paddingBottom: 20 },
  card: { marginVertical: 20, marginHorizontal: 20 },
  cardLow: { marginBottom: 0 },
  closeBtn: { right: 5, top: 10, zIndex: 2 },
  closeRaised: { top: 20 },
  gradient: { overflow: "visible" },
  content: { flexGrow: 1, borderRadius: 20, overflow: "hidden", padding: 35 },
  modalTitle: { marginBottom: 15, textAlign: "center", fontFamily: "Montserrat_700Bold", fontSize: 36, color: palette.white, paddingBottom: 30 },
  loginButton: {
    padding: 15,
    paddingBottom: 10,
    elevation: 2,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: palette.white,
    flexDirection: "row",
    position: "relative",
    borderRadius: 20
  },
  loginText: {
    width: "100%",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    lineHeight: 18,
    fontSize: 18,
    fontFamily: "Montserrat_500Medium"
  },
  link: { color: palette.white, fontSize: 16, textAlign: "center", fontFamily: "Montserrat_700Bold" }
})
