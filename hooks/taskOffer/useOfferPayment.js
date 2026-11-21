// useOfferPayment.js
// The KOPA payment of an offer (accepting it by paying). Payments are off: nothing calls this hook until
// they are turned back on (see the PaymentModal note in screens/TaskOffer).
import { useRef, useState } from "react"
import * as WebBrowser from "expo-web-browser"
import * as Linking from "expo-linking"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

import useUiStore from "../../stores/uiStore"
import { useOfferCache } from "../queries/useDetails"
import useAlert from "../useAlert"
import { useMarkOfferAccepted } from "./useAcceptOffer"
import { createPaymentLink } from "../../Services/PaymentsAPI"
import { getTaskOffer } from "../../Services/TasksAPI"
import { reportError } from "../../Helpers/reportError"

const ACCEPTED_TIME_KEY = "@acceptedTime"
const OFFER_ACCEPTED = 1

// whether the server has the offer accepted: only KOPA's callback, once it recorded the payment, accepts it
const acceptedOnServer = async (offerId) => {
  try {
    const offer = await getTaskOffer(offerId)
    return offer?.status === OFFER_ACCEPTED
  } catch (e) {
    reportError(e, "useOfferPayment")
    return false
  }
}

/**
 * onPaid(acceptedTime): the payment went through and the task has an agreed time
 * Returns { paymentLink, requestPaymentLink(), openPaymentLink() }.
 */
const useOfferPayment = ({ offerId, onPaid }) => {
  const offerCache = useOfferCache(offerId)
  const { showError, showSuccess, showNotice } = useAlert()
  const markAccepted = useMarkOfferAccepted(offerId)
  const [paymentLink, setPaymentLink] = useState(null)
  const linkListener = useRef(null)

  const removeLinkListener = () => {
    if (linkListener.current) linkListener.current.remove()
  }

  // back from the payment page (deep link). What the page says is only a hint (anyone can open the app's link
  // with "success"): the offer counts as accepted when the server says so
  const handleRedirect = async (event) => {
    if (Platform.OS === "ios") WebBrowser.dismissBrowser()
    else removeLinkListener()

    const { queryParams } = Linking.parse(event.url)
    if (queryParams.error) return showError("useOfferPayment.paymentError", queryParams.error.replace(/_/g, " "))

    if (!(await acceptedOnServer(offerId))) {
      return showNotice("useOfferPayment.paymentIsBeingProcessed", "useOfferPayment.theOfferShowsAsAcceptedAs")
    }

    let acceptedTime = null
    try {
      const stored = await AsyncStorage.getItem(ACCEPTED_TIME_KEY)
      if (stored) acceptedTime = JSON.parse(stored)
    } catch (e) {
      reportError(e, "useOfferPayment")
    }
    if (acceptedTime) {
      onPaid(acceptedTime)
      AsyncStorage.removeItem(ACCEPTED_TIME_KEY).catch((e) => reportError(e, "useOfferPayment"))
    } else {
      showSuccess("useOfferPayment.taskOfferSuccessfullyAccepted", "useOfferPayment.youSuccessfullyAcceptedTaskOffer")
    }
    markAccepted()
  }

  const openPaymentLink = async () => {
    linkListener.current = Linking.addEventListener("url", handleRedirect)
    await WebBrowser.openBrowserAsync(paymentLink)
    if (Platform.OS === "ios") removeLinkListener()
  }

  // asks the server for the offer's payment page (a signed link, valid for a short time: opened right away)
  const requestPaymentLink = async () => {
    const offer = offerCache.get()
    const hideSpinner = useUiStore.getState().showSpinner()
    try {
      const resp = await createPaymentLink(offer.id)
      if (!resp.success) {
        showError("useOfferPayment.taskOfferAcceptError", resp.error)
        return setPaymentLink(null)
      }
      if (resp.accepted_time) await AsyncStorage.setItem(ACCEPTED_TIME_KEY, JSON.stringify(resp.accepted_time)).catch((e) => reportError(e, "useOfferPayment"))
      setPaymentLink(resp.payment_link)
    } catch (e) {
      reportError(e, "useOfferPayment")
    } finally {
      hideSpinner()
    }
  }

  return { paymentLink, requestPaymentLink, openPaymentLink }
}

export default useOfferPayment
