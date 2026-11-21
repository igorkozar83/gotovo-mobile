// ClientTaskParts.js
// Pieces of the client's active task details: the accepted offer's card and a revision to answer.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"

import PriceTag from "../offer/PriceTag"
import WideButton from "../ui/WideButton"
import PartyCard from "../taskDetails/PartyCard"
import { calcStars, localPriceFixed, timeFormat } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// the tasker whose offer was accepted, their rating and the price
export const AcceptedOfferCard = ({ taskName, tasker, price }) => (
  <PartyCard taskName={taskName} user={tasker} name={tasker.full_name} stars={calcStars(tasker, 1)} count={tasker.tasks_count} price={localPriceFixed(parseInt(price))} />
)

// the tasker's new price with its reason, to accept or refuse
export const RevisionToAnswer = ({ revision, language, onAccept, onRefuse }) => (
  <>
    <View style={styles.revision}>
      <View>
        <Text accessibilityRole="header" style={styles.revisionTitle}>
          {translate("clientTaskParts.revisedOffer")}
        </Text>
        <Text style={styles.light12}>{revision.explanation}</Text>
      </View>
      <View style={styles.side}>
        <View style={styles.badge}>
          <PriceTag price={localPriceFixed(parseInt(revision.price))} style={[styles.arrow, atoms.width125]} valueStyle={styles.price} />
        </View>
        <Text style={styles.rightText}>{timeFormat(revision.created_at, language)}</Text>
      </View>
    </View>
    <View style={atoms.padding20}>
      <WideButton
        text={translate("clientTaskParts.acceptRevison")}
        onPress={onAccept}
        color={palette.blueDark}
        textStyle={atoms.fontSize18}
        icon={require("../../assets/icon6.png")}
        iconStyle={{ top: "45%", width: 28, height: 18, aspectRatio: 142 / 94 }}
      />
      <Pressable onPress={onRefuse} style={styles.refuse}>
        <Text style={styles.refuseText}>{translate("common.refuseRevision")}</Text>
      </Pressable>
    </View>
  </>
)

const styles = StyleSheet.create({
  side: { marginLeft: "auto", marginTop: 15 },
  badge: { position: "relative", left: 10 },
  rightText: { textAlign: "right", fontFamily: "Montserrat_300Light" },
  arrow: {
    aspectRatio: 130 / 39,
    minWidth: "30%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    position: "relative",
    left: 12
  },
  price: { fontSize: small ? 12 : 14 },
  revision: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, alignItems: "center" },
  revisionTitle: { fontFamily: "Montserrat_700Bold", fontSize: 12, color: palette.blue, marginBottom: 10 },
  light12: { fontFamily: "Montserrat_300Light", fontSize: 12 },
  refuse: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", position: "relative", paddingVertical: 5, marginBottom: 10 },
  refuseText: { width: "100%", fontSize: 16, fontFamily: "Montserrat_700Bold", lineHeight: 30, textAlign: "center" }
})
