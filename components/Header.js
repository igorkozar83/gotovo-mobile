// Header.js
// The bar on top of every screen: the logo (home) or a back arrow on the left, the menu on the right,
// over a dark fade or transparent. The screen says which (back, transparent, taskerLogo); Android's back
// button is the navigator's (Home asks before leaving the app: screens/Home).
import React from "react"
import { View, Pressable, Platform, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

import FastImageComponent from "./media/FastImageComponent"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import { palette } from "../styles/palette"
import { translate } from "../Helpers/language.utils"
import { HIT_SLOP } from "../Helpers/accessibility"
import { atoms } from "../styles/atoms"

const DARK_FADE = [palette.slate, palette.slateClear]
const NO_FADE = ["transparent", "transparent"]

// the bar's top. iOS: clear of the status bar and the notch (the inset); Android keeps the 30 it was
// laid out with (its inset counts the camera cutout the translucent status bar already sits beside)
export const barTop = (insetTop, os = Platform.OS) => (os === "ios" ? Math.max(30, insetTop + 6) : 30)

/**
 * back: a back arrow instead of the logo (a screen opened over another); transparent: no dark fade (the
 * screen's picture shows through); taskerLogo: a tasker sees the tasker logo
 */
export default function Header({ back: withBack = false, transparent = false, taskerLogo = false }) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const userType = useAuthStore((state) => state.user.userData?.type)
  const menuOpen = useUiStore((state) => state.openMenuContext)
  const setMenuOpen = useUiStore((state) => state.setOpenMenuContext)
  const arrowScreen = withBack

  const goHome = () => {
    navigation.navigate("Home")
    setMenuOpen(false)
  }

  const back = () => {
    navigation.goBack()
    setMenuOpen(false)
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <LinearGradient colors={transparent ? NO_FADE : DARK_FADE} style={styles.bar}>
        <View style={[styles.inner, { paddingTop: barTop(insets.top) }]} pointerEvents="box-none">
          <View style={styles.row}>
            {!arrowScreen ? (
              <Pressable accessibilityRole="button" accessibilityLabel={translate("common.home")} onPress={goHome} style={styles.backButton}>
                {userType !== "CLIENT" && taskerLogo ? (
                  <FastImageComponent style={styles.logoTasker} source={require("../assets/logotaksergotovo.png")} />
                ) : (
                  <FastImageComponent style={styles.logo} source={require("../assets/logonooutlinegotovo.png")} />
                )}
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel={translate("common.back")} hitSlop={HIT_SLOP} onPress={back} style={atoms.paddingTop15}>
                <FastImageComponent style={styles.backArrow} source={require("../assets/backarrowheader.png")} />
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("header.menu")}
              onPress={() => setMenuOpen(!menuOpen)}
              style={[arrowScreen && { paddingTop: 10 }, styles.menuButton]}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <FastImageComponent style={styles.menu} source={require("../assets/menubut.png")} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  // over the top of the screen, as tall as the bar: a zero-height box (with the bar absolute in it) left
  // the buttons outside its bounds, where Android's accessibility (TalkBack) does not reach them
  overlay: { zIndex: 999, position: "absolute", top: 0, left: 0, right: 0 },
  backButton: { padding: 20, paddingLeft: 0 },
  menuButton: { padding: 10, paddingRight: 0 },
  bar: { zIndex: 202 },
  inner: { padding: 20, position: "relative", top: 0 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menu: { height: 24, width: 24 },
  logo: { height: 20, width: 122, left: -20 },
  logoTasker: { width: 235, height: 20, left: -20 },
  backArrow: { height: 30, width: 43, position: "relative", top: -5 }
})
