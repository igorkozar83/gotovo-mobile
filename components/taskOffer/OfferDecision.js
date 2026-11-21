// OfferDecision.js
// The bottom of an offer's details. The client accepts a new offer (after agreeing to the terms) or a
// revision, or refuses the revision; the tasker edits an accepted offer once a date is set.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import TermsAgreement from "../auth/TermsAgreement"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/TaskOffer.style.js"
import { palette } from "../../styles/palette"

const Agreement = ({ agreed, onAgree }) => {
  return (
    <View>
      <Text accessibilityRole="header" style={{ ...styles.sectionTitle, marginTop: 0 }}>
        {translate("common.agreement")}
      </Text>
      <TermsAgreement checked={agreed} onChange={onAgree} style={local.termsRow} textStyle={styles.agreementText} linkStyle={styles.agreementBold} />
    </View>
  )
}

/**
 * offer: the shown offer; isClient: the user is a client; accepted: the task has an accepted time
 * agreed / onAgree: the terms checkbox; onAccept, onAcceptRevision, onRefuseRevision, onEdit
 */
const OfferDecision = ({ offer, isClient, accepted, agreed, onAgree, onAccept, onAcceptRevision, onRefuseRevision, onEdit }) => {
  const revision = !!offer.edit_id
  const clientDecides = isClient && (offer.status === 0 || (offer.task.status === 0 && revision))

  return (
    <>
      {isClient && offer.status === 0 && offer.task.status === 0 ? <Agreement agreed={agreed} onAgree={onAgree} /> : null}
      {clientDecides ? (
        <>
          <Pressable android_ripple={{ color: palette.blue, borderless: false }} style={styles.button} onPress={revision ? onAcceptRevision : onAccept}>
            <Text style={styles.textStyle}>{revision ? translate("offerDecision.acceptRevison") : translate("offerDecision.acceptOffer")}</Text>
            <FastImageComponent style={{ ...styles.buttonIcon, top: "35%" }} source={require("../../assets/acceptOfferBtn.png")} />
          </Pressable>
          {offer.task.status === 1 && revision ? (
            <Pressable onPress={onRefuseRevision} style={local.refuseButton}>
              <Text style={local.refuseText}>{translate("common.refuseRevision")}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
      {!clientDecides && !isClient && offer.status === 1 && accepted && !revision ? (
        <Pressable
          android_ripple={{ color: palette.blue, borderless: false }}
          style={{ ...styles.buttonTasker, marginBottom: 5, borderRadius: 5, marginTop: -20 }}
          onPress={onEdit}
        >
          <Text style={styles.textStyle}>{translate("offerDecision.editOffer")}</Text>
          <FastImageComponent style={{ ...styles.buttonIcon, top: 15, right: 10 }} source={require("../../assets/editoffer.png")} />
        </Pressable>
      ) : null}
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  termsRow: { flexDirection: "row", marginHorizontal: 22, justifyContent: "space-between", alignItems: "center", marginTop: 35 },
  refuseButton: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", position: "relative", paddingVertical: 5, marginBottom: 10 },
  refuseText: { width: "100%", fontSize: 16, fontFamily: "Montserrat_700Bold", lineHeight: 30, textAlign: "center" }
})

export default OfferDecision
