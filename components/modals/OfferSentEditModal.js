// OfferSentEditModal.js
// The tasker revised the price of an accepted offer: the client sees the task's time, name and tasker,
// the old and the new price with the reason, and accepts or refuses the revision (unless it was already
// answered). After answering, My Tasks reloads.
import React from "react"
import { View, Text, Pressable, ScrollView, Dimensions, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import { PromptTime, PromptParty } from "../sheets/TaskPromptParts"
import PriceTag from "../offer/PriceTag"
import FastImageComponent from "../media/FastImageComponent"
import useRevisionActions from "../../hooks/offers/useRevisionActions"
import useUiStore from "../../stores/uiStore"
import { amount } from "../../Helpers"
import { acceptedTimeOf, timeRangeOf } from "../../Helpers/taskStatus"
import { translate } from "../../Helpers/language.utils"
import { SheetDivider } from "../sheets/SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// (amount: the push sends the price as a number, a loaded task as "22000.00"; both show "22.000")
const Price = ({ label, offer, resizeMode, style }) => (
  <View style={[styles.half, style]}>
    <Text style={styles.priceLabel}>{translate(label)}</Text>
    <PriceTag price={offer && offer.price && amount(offer.price)} resizeMode={resizeMode} style={styles.arrow} textStyle={atoms.fontSize14} valueStyle={atoms.fontSize14} />
  </View>
)

// the tasker's whole name (the row cuts it with "…" where it does not fit); the revision push sends full_name and
// last_name, a loaded task name and last_name
const taskerName = (tasker) => [tasker.name ?? tasker.full_name, tasker.last_name].filter(Boolean).join(" ")

const OfferSentEditModal = ({ onClose, visible, data }) => {
  const navigation = useNavigation()
  const language = useUiStore((state) => state.language)

  const done = () => {
    onClose()
    navigation.navigate("MyTasks", { refresh: true })
  }
  const revision = useRevisionActions({ onAccepted: done, onDeclined: done })
  const range = timeRangeOf(acceptedTimeOf(data.acceptedTime))

  return (
    <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} colors={BLUE} closeStyle={styles.close} outerStyle={styles.sheet} keyboardAvoiding={false}>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.centered}>
          <FastImageComponent style={styles.icon} source={require("../../assets/iconeditoffer.png")} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {translate("offerSentEditModal.yourOfferHasBeenRevised")}
        </Text>
        <SheetDivider thick gap={10} />
        {range ? <PromptTime {...range} language={language} /> : null}
        <Text style={styles.task} ellipsizeMode="tail" numberOfLines={1}>
          {data.task.name}
        </Text>
        <PromptParty user={{ avatar: data.acceptedBy.avatar, name: taskerName(data.acceptedBy) }} />
        <View style={atoms.flexDirectionRow}>
          <Price label={"offerSentEditModal.oldOffer"} offer={data.acceptedOffer} resizeMode="stretch" style={atoms.paddingRight10} />
          <Price label={"offerSentEditModal.revisedOffer"} offer={data.editedOffer} resizeMode="cover" style={atoms.paddingLeft10} />
        </View>
        <Text style={[styles.small, styles.boldText]}>{translate("common.reason")}</Text>
        <Text style={[styles.small, atoms.marginBottom10]}>{data.editedOffer.explanation}</Text>
        {!data.taskOfferStatusEdited ? (
          <>
            <Pressable onPress={() => revision.acceptRevision(data.editedOffer.id)} android_ripple={{ color: palette.blueDark, borderless: false }} style={styles.accept}>
              <Text style={styles.acceptText}>{translate("offerSentEditModal.acceptRevision")}</Text>
              <FastImageComponent source={require("../../assets/revisionIcon.png")} style={styles.acceptIcon} />
            </Pressable>
            {/* refusing used to open a dispute (switched off): openDispute(data) */}
            <Pressable onPress={() => revision.declineRevision(data.editedOffer.id)}>
              <Text style={styles.refuse}>{translate("common.refuseRevision")}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  half: { marginTop: 5, width: "50%" },
  sheet: { paddingTop: 20, paddingBottom: 20 },
  icon: { width: 75, height: 75 },
  boldText: { marginTop: 10, fontFamily: "Montserrat_700Bold" },
  close: { right: "3%", top: "3%", zIndex: 10 },
  content: { borderRadius: 20, padding: 20, overflow: "hidden" },
  centered: { justifyContent: "center", alignItems: "center", marginVertical: 10 },
  title: { fontSize: 24, color: palette.white, textAlign: "center", fontFamily: "Montserrat_500Medium" },
  task: { fontSize: 22, fontFamily: "Montserrat_500Medium", color: palette.white, marginTop: 10, maxWidth: 230, textAlign: "center" },
  priceLabel: { marginBottom: 5, marginTop: 10, color: palette.white, fontSize: 12, fontFamily: "Montserrat_700Bold", textAlign: "right" },
  arrow: { maxWidth: "100%", justifyContent: "flex-end", alignItems: "flex-end", paddingVertical: 5, paddingRight: 10 },
  small: { color: palette.white, fontSize: 12, fontFamily: "Montserrat_400Regular" },
  accept: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingBottom: 8,
    elevation: 2,
    backgroundColor: palette.white,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 40
  },
  acceptText: {
    color: palette.blueDark,
    width: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: small ? 16 : 18,
    fontSize: small ? 16 : 18,
    fontFamily: "Montserrat_500Medium"
  },
  acceptIcon: { height: 22, position: "absolute", right: 15, top: "35%", width: 33 },
  refuse: { color: palette.white, fontSize: 16, fontFamily: "Montserrat_700Bold", marginVertical: 10, textAlign: "center" }
})

export default OfferSentEditModal
