// LegalModal.js
// A legal page over everything, the open modal included (the terms from the sign-up modal opened behind it
// before): read, then closed back to the form as it was.
import React from "react"
import { Modal, ScrollView, View, Text, Pressable, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

import LegalContent, { LEGAL_PAGES } from "./LegalContent"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { palette } from "../../styles/palette"

// page: "terms", "privacy" or "faq"; visible / onClose
const LegalModal = ({ page = "terms", visible, onClose }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Text accessibilityRole="header" style={styles.title}>
          {translate(LEGAL_PAGES[page].title)}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={translate("common.close")} hitSlop={HIT_SLOP} onPress={onClose}>
          <Ionicons name="close" size={28} color={palette.black} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <LegalContent page={page} />
        <Pressable android_ripple={{ color: palette.blue, borderless: false }} style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{translate("legalModal.okIGotIt")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  </Modal>
)

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100
  },
  title: { flex: 1, fontSize: 20, fontFamily: "Montserrat_600SemiBold", color: palette.black },
  content: { paddingBottom: 40 },
  button: { marginHorizontal: 22, marginTop: 20, minHeight: 42, backgroundColor: palette.blueDark, justifyContent: "center", alignItems: "center" },
  buttonText: { color: palette.white, fontSize: 18, fontFamily: "Montserrat_600SemiBold" }
})

export default LegalModal
