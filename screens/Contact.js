// Contact.js
// Contact & Support: the support email, the company's details and the app version.
import React from "react"
import { ScrollView, View, Text, StyleSheet, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import Header from "../components/Header"
import InfoPageHeader from "../components/ui/InfoPageHeader"
import { translate } from "../Helpers/language.utils"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

const COMPANY = [
  "Ime: GOTOVO DOO BEOGRAD",
  "Adresa: Bulevar Kralja Aleksandra 18/2",
  "Delatnost i šifra: Računarsko programiranje - 6201",
  "Matični broj: 21981931",
  "PIB: 114168867",
  "Web: gotovo.rs"
]

const Contact = () => {
  return (
    <SafeAreaView style={atoms.flex1}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={atoms.flexGrow1}>
        <Header />
        <InfoPageHeader title={"contact.contact"} />
        <View style={styles.intro}>
          <Text style={styles.introText}>{translate("contact.forAnyQuestionsFeelFreeTo")}</Text>
        </View>
        <View style={styles.emailRow}>
          <Text onPress={() => Linking.openURL("mailto:hello@gotovo.rs")} style={styles.link}>
            hello@gotovo.rs
          </Text>
        </View>
        <View style={styles.introBlock}>
          <Text accessibilityRole="header" style={styles.companyTitle}>
            Podaci o kompaniji
          </Text>
          {COMPANY.map((line) => (
            <Text key={line} style={styles.companyInfo}>
              {line}
            </Text>
          ))}
          <Text style={styles.companyInfo} onPress={() => Linking.openURL("mailto:gotovosrb@gmail.com")}>
            e-mail: gotovosrb@gmail.com
          </Text>
          <Text style={styles.companyInfo} onPress={() => Linking.openURL("tel:+381692502855")}>
            Telefon: 0692502855
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={atoms.textAlignCenter}>{translate("contact.appVersion")} 0.13</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  introBlock: { marginTop: 30, paddingHorizontal: 30 },
  form: { marginTop: 30, marginBottom: 80 },
  intro: { marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  introText: { textAlign: "center", fontSize: 14, fontFamily: "Montserrat_400Regular" },
  emailRow: { justifyContent: "center", alignItems: "center", marginTop: 10 },
  link: { fontSize: 14, fontFamily: "Montserrat_400Regular", color: palette.blueDark, textDecorationLine: "underline" },
  companyTitle: { fontSize: 18, fontFamily: "Montserrat_600SemiBold", marginBottom: 10 },
  companyInfo: { fontSize: 14, fontFamily: "Montserrat_400Regular", marginBottom: 5, color: palette.gray800 }
})

export default Contact
