// OfferCard.js
// An offer's details: when it was sent and its status, the task, the price and the tasker's explanation.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import PriceTag from "../offer/PriceTag"
import { timeFormat, localPriceFixed } from "../../Helpers"
import { offerStatusLabel } from "../../Helpers/offer"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/TaskOffer.style.js"
import { atoms } from "../../styles/atoms"

// forClient: the client sees a sent offer as new
const OfferCard = ({ offer, forClient, language }) => {
  const label = offerStatusLabel(offer.status, forClient)
  return (
    <View style={styles.holder}>
      <View style={local.top}>
        <Text style={styles.textNormal}>{timeFormat(offer.created_at, language)}</Text>
        <Text style={styles.yellowText}>{translate(label ? label.text : "offerCard.canceled")}</Text>
      </View>
      <Text style={styles.textBottomBold}>{offer.task.name}</Text>
      <View style={atoms.flexDirectionRow}>
        <View style={atoms.width65Percent}>
          <Text style={styles.textBottomNormal}>{offer.task.description}</Text>
        </View>
      </View>
      <View style={local.priceRow}>
        <PriceTag
          kind="tag"
          price={localPriceFixed(parseInt(offer.price))}
          resizeMode="contain"
          style={styles.arrow}
          numberOfLines={1}
          textStyle={local.priceText}
          valueStyle={atoms.fontSize14}
        />
      </View>
      <View style={local.bottom}>
        {offer.explanation ? (
          <Text style={local.noteLabel}>
            {translate("offerCard.explanation")} <Text style={local.noteText}>{translate(offer.explanation)}</Text>
          </Text>
        ) : null}
      </View>
    </View>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  noteLabel: { fontSize: 12, fontFamily: "Montserrat_700Bold" },
  noteText: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  top: { flexDirection: "row", justifyContent: "space-between", alignContent: "center", flex: 1 },
  priceRow: { flexDirection: "row", justifyContent: "flex-end", alignContent: "flex-end", flex: 1, width: "100%", position: "relative", left: 4 },
  priceText: { fontSize: 14, width: "100%", paddingRight: 10, paddingLeft: 10 },
  bottom: { flexDirection: "row", flex: 1, width: "100%" }
})

export default OfferCard
