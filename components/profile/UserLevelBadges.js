// UserLevelBadges.js
// Another user's level ribbon (laid over the bottom of their photo) and the row of small badges under it:
// their level, a high rating and, for a tasker, their licences. `set` is the badge set of the user shown:
// "TASKER" (their tasks as a tasker count) or "CLIENT".
import React from "react"
import { View, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { getUserBadges } from "../../Helpers/badges"

const RIBBONS = {
  TASKER: {
    starter: require("../../assets/starterlenta.png"),
    qualified: require("../../assets/qualifiedlenta.png"),
    pro: require("../../assets/prolenta.png"),
    expert: require("../../assets/expertlenta.png"),
    guru: require("../../assets/gurulenta.png")
  },
  CLIENT: {
    starter: require("../../assets/startercllenta.png"),
    regular: require("../../assets/regularcllenta.png"),
    platinum: require("../../assets/platinumcllenta.png")
  }
}

const MINIS = {
  TASKER: {
    starter: require("../../assets/startertaskerm.png"),
    qualified: require("../../assets/qualifiedtaskerm.png"),
    pro: require("../../assets/protaskerm.png"),
    expert: require("../../assets/experttaskerm.png"),
    guru: require("../../assets/gurutaskerm.png"),
    rating: require("../../assets/highrtaskerm.png"),
    gas: require("../../assets/gasm.png"),
    assembly: require("../../assets/assemblym.png"),
    electrician: require("../../assets/electr.png"),
    plumber: require("../../assets/plumberm.png")
  },
  CLIENT: {
    starter: require("../../assets/starterm.png"),
    regular: require("../../assets/regularm.png"),
    platinum: require("../../assets/platinumm.png"),
    rating: require("../../assets/highrm.png")
  }
}

const MINI = { width: 23, height: 23 }

// count: the completed tasks the level is based on (the set's own count unless given)
const badgesOf = (user, set, count) => getUserBadges(user, set, count !== undefined ? count : set === "TASKER" ? user?.tasks_count_tasker : user?.tasks_count_client)

// style: the ribbon's place (by default over the bottom right of the photo)
export const LevelRibbon = ({ user, set, count, style }) => {
  const { level } = badgesOf(user, set, count)
  return level ? <FastImageComponent style={[styles.ribbon, style]} source={RIBBONS[set][level]} /> : null
}

// ratingGap: the space before the rating badge; style: the row's
export const MiniBadges = ({ user, set, count, ratingGap = 10, style }) => {
  const { level, rating, licences } = badgesOf(user, set, count)
  const minis = MINIS[set]
  return (
    <View style={[styles.minis, style]}>
      {level ? <FastImageComponent style={MINI} source={minis[level]} /> : null}
      {rating ? (
        <View style={{ marginLeft: ratingGap }}>
          <FastImageComponent style={MINI} source={minis.rating} />
        </View>
      ) : null}
      {licences
        .filter((key) => minis[key])
        .map((key) => (
          <FastImageComponent key={key} style={MINI} source={minis[key]} />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  ribbon: { position: "absolute", left: "37.5%", bottom: 5, width: 61, height: 16 },
  minis: { flexDirection: "row", alignItems: "center", justifyContent: "center" }
})
