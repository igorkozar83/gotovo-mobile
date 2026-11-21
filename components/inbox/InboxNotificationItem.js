// InboxNotificationItem.js
// An offer in the inbox list: the other party's photo (opening their profile) with their badges, the
// date, task and name, their rating, and the offer's status and price. Refused and canceled offers are
// faded; a sent offer stands out on grey.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Entypo, FontAwesome } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import PriceTag from "../offer/PriceTag"
import { LevelRibbon, MiniBadges } from "../profile/UserLevelBadges"
import { localPriceFixed } from "../../Helpers"
import { offerRow } from "../../Helpers/listRows"
import useUiStore from "../../stores/uiStore"
import { offerStatusLabel, offerPriceKind, isFadedOffer } from "../../Helpers/offer"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"
import { smallAvatar } from "../../Helpers/pictures"

const small = Dimensions.get("screen").width < 380

// offer: the offer (with its task); onPress: opens it
const InboxNotificationItem = ({ offer, onPress }) => {
  const navigation = useNavigation()
  const me = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const language = useUiStore((state) => state.language)
  const row = offerRow(offer, { userSelect, language })
  const user = row.party
  const offerStatus = row.status

  // a client sees taskers' badges, a tasker clients'
  const forClient = me.userData.type === "CLIENT"
  const set = forClient ? "TASKER" : "CLIENT"
  const fade = isFadedOffer(offerStatus) ? { opacity: 0.5 } : null
  const label = offerStatusLabel(offerStatus, forClient)
  const priceKind = offerPriceKind(offerStatus)

  return (
    <Pressable onPress={onPress} style={offerStatus === 0 ? styles.offerContainer : styles.otherContainer}>
      <View style={styles.photoColumn}>
        <View style={[atoms.paddingHorizontal20, fade]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("inboxNotificationItem.taskerProfile")}
            onPress={() => navigation.navigate("TaskerProfile", { profile: user })}
          >
            <FastImageComponent source={smallAvatar(user) || require("../../assets/emptyavatar.png")} style={[styles.avatar, fade]} />
          </Pressable>
          <LevelRibbon user={user} set={set} />
        </View>
        <View style={styles.badges}>
          <MiniBadges user={user} set={set} ratingGap={forClient ? 0 : 10} style={forClient ? fade : { marginTop: -3 }} />
        </View>
      </View>
      <View style={[styles.texts, fade]}>
        <Text style={styles.date}>{row.date}</Text>
        <Text style={styles.task} ellipsizeMode="tail" numberOfLines={10}>
          {row.title}{" "}
        </Text>
        <Text style={styles.name} ellipsizeMode="tail" numberOfLines={2}>
          {row.partyName}
        </Text>
        <View style={styles.stats}>
          <FontAwesome style={atoms.marginRight5} name="star" size={small ? 10 : 16} color={palette.orange} />
          <Text style={[styles.stat, atoms.marginRight10]}>{row.stars}</Text>
          <Entypo style={atoms.marginRight5} name="check" size={small ? 10 : 16} color={palette.orange} />
          <Text style={styles.stat}>{row.taskCount ? row.taskCount : 0}</Text>
        </View>
      </View>

      <View style={atoms.paddingRight10}>
        {label ? <Text style={[styles.status, { color: label.color }]}>{translate(label.text)}</Text> : null}
        <View style={styles.priceTag}>
          {priceKind ? <PriceTag kind={priceKind} price={localPriceFixed(row.price)} resizeMode="contain" style={styles.arrow} valueStyle={styles.price} /> : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  badges: { maxWidth: 90, overflow: "hidden" },
  texts: { marginLeft: -8, flex: 1 },
  photoColumn: { position: "relative", marginRight: 5, alignItems: "center" },
  priceTag: { position: "relative", right: -30, top: 10, marginTop: "auto" },
  offerContainer: { flexDirection: "row", backgroundColor: palette.gray100, paddingVertical: 10, marginBottom: 10 },
  otherContainer: { flexDirection: "row", backgroundColor: palette.white, paddingVertical: 10, marginBottom: 0, borderBottomColor: palette.gray350, borderBottomWidth: 1 },
  avatar: { width: 76, height: 76, position: "relative", borderRadius: 76 },
  date: { textAlign: "left", fontSize: 12, marginBottom: 9, fontFamily: "Montserrat_300Light" },
  task: { fontSize: small ? 10 : 12, marginBottom: 9, fontFamily: "Montserrat_500Medium", flexWrap: "wrap" },
  name: { fontSize: small ? 12 : 16, fontFamily: "Montserrat_700Bold", marginBottom: small ? 25 : 15 },
  stats: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", position: "relative", top: -5 },
  stat: { fontSize: small ? 10 : 16, fontFamily: "Montserrat_500Medium" },
  status: { fontFamily: "Montserrat_700Bold", fontSize: small ? 10 : 12, textAlign: "right" },
  price: { fontSize: small ? 12 : 14 },
  arrow: { paddingVertical: 5, paddingHorizontal: 5, justifyContent: "center", alignItems: "center", height: 40, width: 150 }
})

export default InboxNotificationItem
