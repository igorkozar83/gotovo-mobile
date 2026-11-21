import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { Entypo, FontAwesome } from "@expo/vector-icons"

import PriceTag from "../offer/PriceTag"
import TaskDetailsOfferComponent from "./TaskDetailsOfferComponent"
import { localPriceFixed, shortenName, shortenString, calcStars } from "../../Helpers"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// The tasker's offer on a task: client, their rating and the offered price.
const TaskerOfferCard = ({ task, offer, client, arrowStyle }) => {
  return (
    <View style={styles.card}>
      <View style={styles.priceWrap}>
        <PriceTag price={localPriceFixed(parseInt(offer.price))} style={[arrowStyle, { width: 150, aspectRatio: 130 / 39 }]} textStyle={styles.price} valueStyle={styles.price} />
      </View>
      <View>
        <TaskDetailsOfferComponent reloadUser={() => client} />
      </View>
      <View>
        <Text style={styles.taskName}>{task.name}</Text>
        <Text style={styles.clientName}>{shortenString(shortenName(client?.full_name), 100)}</Text>
        <View style={styles.row}>
          <FontAwesome style={styles.icon} name="star" size={small ? 10 : 16} color={palette.orange} />
          <Text style={[styles.stat, atoms.marginRight10]}>{calcStars(client, 1)}</Text>
          <Entypo style={styles.icon} name="check" size={small ? 10 : 16} color={palette.orange} />
          <Text style={styles.stat}>{client?.tasks_count}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: palette.gray100, paddingBottom: 10, paddingTop: 20, marginBottom: 10 },
  priceWrap: { position: "absolute", right: 0, bottom: 15, height: 30 },
  price: { fontSize: small ? 12 : 16 },
  taskName: { fontSize: 12, fontFamily: "Montserrat_300Light" },
  clientName: { fontSize: small ? 10 : 16, fontFamily: "Montserrat_700Bold" },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 5 },
  stat: { fontSize: small ? 10 : 16, fontFamily: "Montserrat_500Medium" }
})

export default TaskerOfferCard
