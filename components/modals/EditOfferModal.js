// EditOfferModal.js
// A tasker revising the price of an accepted offer: the previous amount, the new one and an
// explanation. An incomplete revision is explained in an alert (the modal stays); a sent one goes back
// to the inbox offers.
import React, { useRef } from "react"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import ActivityInd from "../ui/ActivityInd"
import ButtonWithPicture from "../ui/ButtonWithPicture"
import OfferSheet from "../offer/OfferSheet"
import { AmountField, ExplanationField } from "../offer/OfferFields"
import useOfferForm from "../../hooks/offer/useOfferForm"
import useAlert from "../../hooks/useAlert"
import { localPriceFixed } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { useEditOffer } from "../../hooks/offer/useOfferActions"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const EditOfferModal = ({ taskOffer, onClose, visible }) => {
  const navigation = useNavigation()
  const { showError } = useAlert()
  const form = useOfferForm()
  const scroll = useRef(null)

  const editOffer = useEditOffer({
    onSuccess: () => {
      form.clear()
      navigation.navigate("Notifications", { refreshOffers: true })
    }
  })

  const send = () => {
    const problems = form.problems()
    if (problems) return showError("editOfferModal.editTaskOfferError", problems)
    onClose()
    editOffer.run(taskOffer.task.id, { explanation: form.explanation, price: form.price })
  }

  return (
    <>
      <ActivityInd />
      <OfferSheet
        visible={visible}
        onClose={onClose}
        onRequestClose={onClose}
        icon={require("../../assets/iconeditoffer.png")}
        title="EDIT OFFER"
        clientName={taskOffer.task.posted_by_user.full_name}
        taskName={taskOffer.task.name}
        closeStyle={styles.close}
        outerStyle={atoms.paddingVertical20}
        scrollRef={scroll}
        scrollProps={{ automaticallyAdjustKeyboardInsets: true }}
      >
        <AmountField label={"editOfferModal.previousAmount"} value={localPriceFixed(parseInt(taskOffer.price, 10))} dimmed />
        <AmountField label={"editOfferModal.enterNewAmount"} value={form.price} onChange={form.setPrice} />
        <ExplanationField
          value={form.explanation}
          onChange={form.setExplanation}
          onFocus={() => setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 100)}
        />
        <ButtonWithPicture
          onPress={send}
          text={translate("editOfferModal.confirmEdit")}
          icon={require("../../assets/acceptedofferorange.png")}
          backgroundColor={palette.white}
          textColor={palette.black}
          widthPicture={20}
          heightPicture={14}
        />
      </OfferSheet>
    </>
  )
}

const styles = StyleSheet.create({
  close: { right: 5, top: 10, zIndex: 2 }
})

export default EditOfferModal
