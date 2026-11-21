// InfoPageHeader.js
// The picture on top of the info pages (contact, terms) with "GOTOVO" and the page's title over it.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { atoms } from "../../styles/atoms"

const InfoPageHeader = ({ title }) => (
  <View>
    <View style={atoms.width100Percent}>
      <FastImageComponent style={styles.image} source={require("../../assets/headerterms.png")} />
    </View>
    <View style={styles.titles}>
      <Text style={[styles.brand, atoms.marginBottomMinus10]}>GOTOVO</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {translate(title)}
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  titles: { position: "absolute", bottom: 5, left: 22 },
  image: { width: "100%", height: undefined, aspectRatio: 1.27 },
  brand: { fontSize: 30, fontFamily: "Montserrat_600SemiBold" },
  title: { fontSize: 24, fontFamily: "Montserrat_400Regular" }
})

export default InfoPageHeader
