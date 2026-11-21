// PriceTag.js
// A price on the arrow picture, followed by the currency. The arrow's colour tells the offer's state.
import React from "react"
import { Text, ImageBackground, StyleSheet } from "react-native"

import useCurrency from "../../hooks/useCurrency"
import { palette } from "../../styles/palette"
import { amount } from "../../Helpers"

const ARROWS = {
  offer: require("../../assets/arrowoffer.png"),
  refused: require("../../assets/arrowrefused.png"),
  finished: require("../../assets/arrowfinished.png"),
  // the long orange tag of an offer's details
  tag: require("../../assets/priceTag.png")
}

/**
 * price: the amount as shown (formatted by the caller); kind: offer, refused, finished or tag
 * style: the arrow's size and place; textStyle: the currency's text; valueStyle: the amount's text
 */
const PriceTag = ({ price, kind = "offer", resizeMode, style, textStyle, valueStyle, numberOfLines }) => {
  const currency = useCurrency()
  return (
    <ImageBackground source={ARROWS[kind]} resizeMode={resizeMode} style={style}>
      <Text style={[styles.text, textStyle]} numberOfLines={numberOfLines}>
        <Text style={[styles.value, valueStyle]}>{amount(price)}</Text> {currency}
      </Text>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  text: { color: palette.white, fontFamily: "Montserrat_500Medium" },
  value: { color: palette.white, fontFamily: "Montserrat_700Bold" }
})

export default PriceTag
