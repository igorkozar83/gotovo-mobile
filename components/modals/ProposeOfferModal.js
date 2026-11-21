// ProposeOfferModal.js
// A tasker's offer on an open task: an amount and an explanation. An offer that is not complete is
// explained in an alert whose OK brings the modal back; a sent one is confirmed, then the inbox shows
// the offers.
import React, { useEffect, useRef, useState } from "react"
import { View, Platform, Dimensions, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import OfferSheet from "../offer/OfferSheet"
import { AmountField, ExplanationField } from "../offer/OfferFields"
import Button from "../ui/Button"
import FastImageComponent from "../media/FastImageComponent"
import OfferSentModal from "./OfferSentModal"
import useOfferForm from "../../hooks/offer/useOfferForm"
import useAlert from "../../hooks/useAlert"
import useChatKeyboard from "../../hooks/chat/useChatKeyboard"
import { useRefreshInboxCount } from "../../hooks/queries/useInboxCount"
import { useCreateOffer } from "../../hooks/offer/useOfferActions"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const ProposeOfferModal = ({ task, onClose, visible, onReopen }) => {
  const navigation = useNavigation()
  const refreshInboxCount = useRefreshInboxCount()
  const { showErrorThen } = useAlert()
  const form = useOfferForm()
  const [sent, setSent] = useState(false)

  // with the keyboard up, the explanation scrolls into view
  const scroll = useRef(null)
  const keyboard = useChatKeyboard(() => {})
  const [explaining, setExplaining] = useState(false)
  useEffect(() => {
    if (explaining && keyboard.open && scroll.current) scroll.current.scrollToEnd({ animated: true })
  }, [explaining, keyboard.open])

  const createOffer = useCreateOffer({
    onSuccess: () => {
      form.clear()
      setSent(true)
    }
  })

  const send = () => {
    onClose()
    const problems = form.problems()
    if (problems) return showErrorThen("proposeOfferModal.sendOfferError", problems, onReopen)
    createOffer.run(task.id, { explanation: form.explanation, price: form.price })
  }

  return (
    <>
      <OfferSheet
        visible={visible}
        onClose={onClose}
        icon={require("../../assets/acceptedofferbig.png")}
        title="PROPOSE AN OFFER"
        clientName={task.posted_by_user.name + " " + task.posted_by_user.last_name.charAt(0) + "."}
        clientNameStyle={atoms.maxWidth200}
        clientNameProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}
        taskName={task.is_sos ? "S.O.S. task: " + task.name : task.name}
        closeStyle={styles.closeButton}
        outerStyle={[keyboard.open && Platform.OS === "ios" && { paddingBottom: 150 }, keyboard.open && { paddingVertical: 20 }]}
        avoidingStyle={[keyboard.open && { marginTop: 20 }]}
        scrollRef={scroll}
      >
        <AmountField label={"proposeOfferModal.enterAmount"} value={form.price} onChange={form.setPrice} arrowMode="contain" currencyStyle={styles.amountField} />
        <ExplanationField value={form.explanation} onChange={form.setExplanation} onFocus={() => setExplaining(true)} onBlur={() => setExplaining(false)} />
        <Button
          onPress={send}
          background={palette.white}
          textColor={palette.black}
          title={"proposeOfferModal.sendOffer"}
          iconSize={{ width: 24 }}
          buttonStyle={atoms.height40}
          textStyle={{ lineHeight: Dimensions.get("screen").width < 380 ? 16 : 18 }}
        >
          <View style={styles.iconBox}>
            <FastImageComponent style={styles.icon} source={require("../../assets/acceptedofferorange.png")} />
          </View>
        </Button>
      </OfferSheet>
      <OfferSentModal
        visible={sent}
        onClose={() => {
          setSent(false)
          refreshInboxCount()
          navigation.navigate("Notifications", { refreshOffers: true, viewOffers: true })
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  amountField: { top: -13, paddingRight: 5 },
  iconBox: { width: "100%", position: "relative", alignItems: "center", justifyContent: "center" },
  icon: { width: 24, height: 15, position: "absolute", top: 3 }
})

export default ProposeOfferModal
