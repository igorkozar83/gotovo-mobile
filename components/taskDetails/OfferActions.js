// OfferActions.js
// What a tasker can do on an open task: ask a question, accept the terms and propose an offer.
import React from "react"
import { View, Platform, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import Button from "../ui/Button"
import TermsAgreement from "../auth/TermsAgreement"
import TitleWithBorder from "../ui/TitleWithBorder"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

export const AskQuestionButton = ({ onPress }) => (
  <View style={styles.actions}>
    <Button onPress={onPress} background={palette.gray600} title={"common.askAQuestion"}>
      <MaterialCommunityIcons name="comment-question-outline" size={20} color={palette.white} />
    </Button>
  </View>
)

export const ProposeOffer = ({ agreement, setAgreement, onPropose }) => {
  return (
    <>
      <View style={atoms.marginTop30}>
        <TitleWithBorder title={translate("common.agreement")} />
      </View>
      <TermsAgreement checked={agreement} onChange={setAgreement} style={styles.agreement} textStyle={styles.agreementText} linkStyle={styles.link} />
      <View style={atoms.marginTop10}>
        <Button title={"offerActions.proposeAnOffer"} onPress={onPropose} iconSize={{ width: 25, height: 20 }} iconTop={Platform.OS === "ios" ? "65%" : "60%"}>
          <FastImageComponent contentFit="cover" style={styles.offerIcon} source={require("../../assets/propose.png")} />
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  actions: { marginTop: 10, marginBottom: 40 },
  offerIcon: { width: 25, height: 16 },
  agreement: { flexDirection: "row", justifyContent: "space-between", marginTop: 35 },
  agreementText: { fontFamily: "Montserrat_400Regular", fontSize: 12, width: "75%" },
  link: { color: palette.orange, fontFamily: "Montserrat_600SemiBold", fontSize: 12 }
})

export default ProposeOffer
