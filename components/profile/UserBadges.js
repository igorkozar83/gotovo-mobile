import React from "react"
import { View, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { getUserBadges } from "../../Helpers/badges"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const IMAGES = {
  TASKER: {
    completion100: require("../../assets/100perctasker.png"),
    completion80: require("../../assets/80perctasker.png"),
    completion60: require("../../assets/60perctasker.png"),
    completion40: require("../../assets/40perctasker.png"),
    completion20: require("../../assets/20perctasker.png"),
    starter: require("../../assets/startertasker.png"),
    qualified: require("../../assets/qualifiedtasker.png"),
    pro: require("../../assets/protasker.png"),
    expert: require("../../assets/experttasker.png"),
    guru: require("../../assets/gurutasker.png"),
    rating: require("../../assets/highratingtasker.png"),
    hundredVerified: require("../../assets/hundredverifiedtasker.png"),
    idVerified: require("../../assets/idverifiedtasker.png"),
    gas: require("../../assets/gastasker.png"),
    assembly: require("../../assets/assembly.png"),
    electrician: require("../../assets/electrician.png"),
    plumber: require("../../assets/plumber.png")
  },
  CLIENT: {
    completion100: require("../../assets/100perc.png"),
    completion80: require("../../assets/80perc.png"),
    completion60: require("../../assets/60perc.png"),
    completion40: require("../../assets/40perc.png"),
    completion20: require("../../assets/20perc.png"),
    starter: require("../../assets/starter.png"),
    regular: require("../../assets/regular.png"),
    platinum: require("../../assets/platinum.png"),
    rating: require("../../assets/highrating.png"),
    hundredVerified: require("../../assets/hundredverified.png"),
    idVerified: require("../../assets/idverified.png")
  }
}

// variant → size, and where the licences go
const VARIANTS = {
  // one wrapping row, small (side menu)
  compact: { size: 33, inline: true },
  // badges row, then the licences under a title (own reviews)
  sections: { size: 75 },
  // like sections, with "100% verified" in the first row (profiles of others)
  profile: { size: 75, verifiedInFirstRow: true, firstRowStyle: { marginTop: -20 } }
}

// A badge image with a number on it (level: tasks count, rating: stars)
const NumberedBadge = ({ source, size, value, compact, style }) => (
  <View style={style}>
    <FastImageComponent style={{ width: size, height: size }} source={source} />
    <Text style={[styles.number, compact && styles.numberCompact]}>{value}</Text>
  </View>
)

// The badges a user earned (completion, level, rating, licences) for the given role's badge set.
// count: the completed tasks the level is based on.
const UserBadges = ({ user, role, count, variant = "sections", style }) => {
  const { size, inline, verifiedInFirstRow, firstRowStyle } = VARIANTS[variant]
  const images = IMAGES[role === "TASKER" ? "TASKER" : "CLIENT"]
  const badges = getUserBadges(user, role, count)
  const image = (key) => <FastImageComponent key={key} style={{ width: size, height: size }} source={images[key]} />

  const completion = badges.completion ? image(badges.completion) : null
  const level = badges.level ? <NumberedBadge source={images[badges.level]} size={size} value={count} compact={inline} style={styles.relative} /> : null
  const rating = badges.rating ? <NumberedBadge source={images.rating} size={size} value={badges.rating} compact={inline} style={styles.ratingSpacing} /> : null

  if (inline) {
    return (
      <View style={style}>
        {completion}
        {level}
        {rating}
        {badges.licences.map(image)}
      </View>
    )
  }

  const verified = verifiedInFirstRow && badges.licences.includes("hundredVerified")
  const licences = verifiedInFirstRow ? badges.licences.filter((key) => key !== "hundredVerified") : badges.licences

  return (
    <View style={style}>
      <View style={[styles.firstRow, firstRowStyle]}>
        {completion}
        {level}
        {verified ? <FastImageComponent style={{ width: size, height: size, marginHorizontal: 5 }} source={images.hundredVerified} /> : null}
        {rating}
      </View>
      {/* the title only over licences there are (a client usually has none) */}
      {licences.length ? (
        <>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" style={styles.title}>
              {translate("userBadges.licencesQualifications")}
            </Text>
          </View>
          <View style={[styles.licences, role === "TASKER" && verifiedInFirstRow && styles.wrap]}>{licences.map(image)}</View>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  relative: { position: "relative" },
  ratingSpacing: { marginLeft: 10 },
  number: { position: "absolute", color: palette.white, fontFamily: "Montserrat_500Medium", bottom: 15, alignSelf: "center" },
  numberCompact: { bottom: 5, fontSize: 8 },
  firstRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  titleRow: { marginTop: 0, marginBottom: 10 },
  title: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  licences: { flexDirection: "row" },
  wrap: { flexWrap: "wrap" }
})

export default UserBadges
