// PaymentModal.js
// Paying the Gotovo fee when the client accepts an offer (or, with confirmStart, the task price): the
// amount and the total, the terms to accept, and CONFIRM PAYMENT, which opens the payment page.
// Opening the modal asks for the payment link; the button shows once it is there.
// (Not used while the payments are switched off; TaskOffer has it commented out.)
import React, { useEffect, useState } from "react"
import { StyleSheet, View, Pressable, Text, ScrollView } from "react-native"
import { Image } from "expo-image"

import FastImageComponent from "../media/FastImageComponent"
import TermsAgreement from "../auth/TermsAgreement"
import useAppSettings from "../../hooks/queries/useAppSettings"
import useCurrency from "../../hooks/useCurrency"
import { feeFor } from "../../Helpers/payments"
import PaymentSummary from "../payment/PaymentSummary"
import { translate } from "../../Helpers/language.utils"
import ModalFrame, { CloseX } from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"
import { showErrorThen } from "../../stores/alerts"

const PAY_BLUE = palette.bluePayment

/**
 * item: the task; offer: the offer (its price); fee: the settings' fees
 * confirmStart: paying the task price instead of the fee
 * onRequestLink(): asks for paymentLink; onOpenPayment(): opens it
 * visible / onVisibleChange(visible) / onClose(): shown or not
 */
const PaymentModal = ({ item, offer, fee, onOpenPayment, confirmStart, onClose, visible, onRequestLink, onVisibleChange, paymentLink }) => {
  const { settings } = useAppSettings()
  const currency = useCurrency()
  const [agreed, setAgreed] = useState(false)

  // a new payment link each time the modal opens (not when the caller's function changes)
  useEffect(() => {
    if (visible) onRequestLink()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const price = offer ? offer.price : null
  const gotovoFee = feeFor(price, fee)
  // (the notes under the table show the currency as the settings have it)
  const rawCurrency = settings ? settings.currency : ""

  // the terms must be accepted: the modal steps aside for the alert and comes back after it
  const confirm = () => {
    if (agreed) return onOpenPayment()
    onVisibleChange(false)
    showErrorThen("paymentModal.proceedPaymentError", "paymentModal.pleaseAcceptTermsConditions", () => onVisibleChange(true))
  }

  // mounted only while open, so the terms box starts unticked every time
  if (!visible) return null

  return (
    <ModalFrame visible={visible} cardStyle={styles.card}>
      <CloseX onPress={onClose} color={PAY_BLUE} style={styles.closeBtn} />
      <ScrollView scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps={"handled"}>
        <View style={styles.modalIn}>
          <Text accessibilityRole="header" style={styles.title}>
            {translate("paymentModal.payment")}
          </Text>
          <PaymentSummary task={item} known={!!offer} price={price} fee={gotovoFee} taskPrice={confirmStart} currency={currency} settingsCurrency={rawCurrency} />
          <Text>{translate("paymentModal.noteYouWillBeRedirectedTo")}.</Text>
          <TermsAgreement small checked={agreed} onChange={setAgreed} style={styles.terms} textStyle={styles.termsText} linkStyle={styles.termsLink} />
          <View style={styles.footer}>
            {paymentLink ? (
              <Pressable style={styles.button} android_ripple={{ color: palette.orangeSoft, borderless: false }} onPress={confirm}>
                <Text style={styles.buttonText}>{translate("paymentModal.confirmPayment")}</Text>
                <FastImageComponent style={styles.buttonIcon} source={require("../../assets/confpayment.png")} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.logos}>
            <Image style={styles.cardsImage} source={require("../../assets/paylogonew.png")} />
          </View>
        </View>
      </ScrollView>
    </ModalFrame>
  )
}

const styles = StyleSheet.create({
  scroll: { borderRadius: 20, overflow: "hidden" },
  footer: { paddingTop: 22, paddingBottom: 30 },
  cardsImage: { width: "100%", height: 68 },
  card: { marginVertical: 20, overflow: "hidden" },
  closeBtn: { right: 10, top: 10, zIndex: 5 },
  modalIn: { width: "100%", maxWidth: "100%", borderRadius: 0, paddingHorizontal: 24, justifyContent: "center", overflow: "hidden" },
  title: { color: PAY_BLUE, fontFamily: "Montserrat_700Bold", fontSize: 24, textAlign: "center", marginTop: 40 },
  terms: { flexDirection: "row", justifyContent: "space-between", marginTop: 35, alignItems: "center" },
  termsText: { fontFamily: "Montserrat_300Light", fontSize: 12, color: palette.black, maxWidth: "90%" },
  termsLink: { fontSize: 12, color: palette.black, fontFamily: "Montserrat_600SemiBold" },
  button: { backgroundColor: PAY_BLUE, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 5 },
  buttonText: { fontFamily: "Montserrat_600SemiBold", fontSize: 18, color: palette.white },
  buttonIcon: { position: "absolute", right: 12, width: 21, height: 16, top: "40%" },
  logos: { backgroundColor: palette.white, overflow: "hidden", height: 100, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: "center" }
})

export default PaymentModal
