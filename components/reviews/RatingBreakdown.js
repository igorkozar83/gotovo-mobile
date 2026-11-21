// RatingBreakdown.js
// A user's reviews by stars, 5 to 1: a bar of each one's share, the share and the count.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import FastImageComponent from "../media/FastImageComponent"
import { starCount, starShare } from "../../Helpers/reviews"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const StarRow = ({ stars, summary }) => {
  const share = starShare(summary, stars)
  const textStyle = [styles.text, stars === 5 && styles.textBold]
  return (
    <View style={[styles.row, atoms.marginBottom5]}>
      <View style={styles.starsColumn}>
        <Text style={styles.textFirst}>{stars}</Text>
        <FastImageComponent style={styles.star} source={require("../../assets/smallstarorange.png")} />
      </View>
      <View style={styles.progress}>
        <LinearGradient colors={[palette.blue, palette.blueDark]} start={[0.0, 0.0]} end={[1.0, 1.0]} style={[styles.progressProgress, { width: share + "%" }]}></LinearGradient>
      </View>
      <View style={styles.barColumn}>
        <View style={atoms.marginLeft16}>
          <Text style={textStyle} numberOfLines={1}>
            {share}%
          </Text>
        </View>
        <View style={atoms.marginLeft10}>
          <Text style={textStyle}>{starCount(summary, stars)}</Text>
        </View>
      </View>
    </View>
  )
}

const RatingBreakdown = ({ summary }) => (
  <View style={styles.holder}>
    {[5, 4, 3, 2, 1].map((stars) => (
      <StarRow key={stars} stars={stars} summary={summary} />
    ))}
  </View>
)

const styles = StyleSheet.create({
  starsColumn: { flexDirection: "row", width: 50 },
  barColumn: { flexDirection: "row", width: 80 },
  holder: { marginVertical: 10, paddingVertical: 25, paddingHorizontal: 25, backgroundColor: palette.gray100, alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  star: { width: 18, height: undefined, aspectRatio: 1, marginLeft: 7, marginRight: 21 },
  text: { fontFamily: "Montserrat_300Light", fontSize: 14, width: 45 },
  textBold: { fontFamily: "Montserrat_600SemiBold", fontSize: 14 },
  textFirst: { fontFamily: "Montserrat_300Light", fontSize: 18, width: 10 },
  progress: { backgroundColor: palette.white, flexGrow: 1, height: 12, borderRadius: 6, overflow: "hidden" },
  progressProgress: { flex: 1, position: "absolute", left: 0, top: 0, height: "100%" }
})

export default RatingBreakdown
