// PartyCard.js
// The other party of a task on grey: their photo with badges, the task, their name, stars and task count,
// and (when given) the agreed price.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { Entypo, FontAwesome } from "@expo/vector-icons"

import PriceTag from "../offer/PriceTag"
import TaskDetailsOfferComponent from "../myTasks/TaskDetailsOfferComponent"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380
const windowWidth = Dimensions.get("window").width

// user: for the photo and badges; name, stars, count: what the card says; price: the shown amount or
// none; priceKind: the arrow (PriceTag kind)
const PartyCard = ({ taskName, user, name, stars, count, price, priceKind = "offer" }) => (
  <View style={styles.card}>
    <TaskDetailsOfferComponent reloadUser={() => user} />
    <View style={{ width: windowWidth - 120, marginLeft: 10 }}>
      <Text style={styles.task}>{taskName}</Text>
      <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
        {name}
      </Text>
      <View style={atoms.flexDirectionRow}>
        <View style={styles.stats}>
          <FontAwesome style={atoms.marginRight5} name="star" size={small ? 10 : 16} color={palette.orange} />
          <Text style={[styles.stat, atoms.marginRight10]}>{stars}</Text>
          <Entypo style={atoms.marginRight5} name="check" size={small ? 10 : 16} color={palette.orange} />
          <Text style={styles.stat}>{count}</Text>
        </View>
        {price != null ? (
          <View style={styles.side}>
            <View style={styles.avatar}>
              <PriceTag kind={priceKind} price={price} style={styles.arrow} textStyle={styles.price} valueStyle={styles.price} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  side: { marginLeft: "auto", paddingRight: 20 },
  avatar: { position: "relative", top: 10 },
  card: { flexDirection: "row", position: "relative", paddingBottom: 10, paddingTop: 20, marginBottom: 10, backgroundColor: palette.gray100 },
  task: { fontSize: small ? 10 : 12, marginBottom: 5, fontFamily: "Montserrat_300Light", maxWidth: windowWidth - 140 },
  name: { fontSize: small ? 14 : 16, marginBottom: 5, fontFamily: "Montserrat_700Bold", width: 220 },
  stats: { flexDirection: "row", alignItems: "center", position: "relative", top: -5 },
  stat: { fontSize: small ? 10 : 16, fontFamily: "Montserrat_500Medium" },
  arrow: {
    width: 130,
    aspectRatio: 130 / 39,
    minWidth: "30%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    position: "relative",
    left: 12
  },
  price: { fontSize: small ? 12 : 14 }
})

export default PartyCard
