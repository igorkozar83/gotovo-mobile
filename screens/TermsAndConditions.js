// TermsAndConditions.js
// A legal page as a screen (the terms, the privacy policy or the FAQ: each has its route) with a button back
// to where the user came from.
import React from "react"
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

import Header from "../components/Header"
import InfoPageHeader from "../components/ui/InfoPageHeader"
import FastImageComponent from "../components/media/FastImageComponent"
import LegalContent, { LEGAL_PAGES } from "../components/legal/LegalContent"
import { translate } from "../Helpers/language.utils"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

// page: "terms", "privacy" or "faq"
const LegalPage = ({ page }) => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={atoms.flex1}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={atoms.flexGrow1}>
        <Header back transparent />
        <View style={styles.mainContent}>
          <InfoPageHeader title={LEGAL_PAGES[page].title} />
          <LegalContent page={page} />
          <Pressable android_ripple={{ color: palette.blue, borderless: false }} style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>{translate("termsAndConditions.okIGotIt")}</Text>
            <FastImageComponent style={styles.buttonIcon} source={require("../assets/gotitbutton.png")} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const TermsAndConditions = () => <LegalPage page="terms" />
export const PrivacyPolicy = () => <LegalPage page="privacy" />
export const Faq = () => <LegalPage page="faq" />

const styles = StyleSheet.create({
  mainContent: { zIndex: 2, paddingBottom: 100 },
  button: {
    borderRadius: 0,
    elevation: 2,
    flexDirection: "row",
    marginHorizontal: 22,
    marginTop: 20,
    minHeight: 42,
    backgroundColor: palette.blueDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25
  },
  buttonText: { width: "100%", color: palette.white, paddingLeft: 10, textAlignVertical: "center", fontSize: 18, fontFamily: "Montserrat_600SemiBold", textAlign: "center" },
  buttonIcon: { width: 25, aspectRatio: 1.21, position: "absolute", right: 20 }
})

export default TermsAndConditions
