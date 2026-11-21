// PaymentsAPI.js
// Payments through KOPA (LedPay): the link to the page where the client pays the fee (accepting an offer) or the
// task price (once the tasker started), and a tasker's bank account and saved cards.
// (Payments are switched off for now: the two link endpoints are not routed on the server, nor in v2.)
import { api } from "./client"

// a signed link that stays valid for a short time: open it right away
export const createPaymentLinkForTaskPrice = async (taskId) => (await api.get("payments/payment-start-task-payment/" + taskId)).data

export const createPaymentLink = async (taskOfferId) => (await api.get("payments/payment-fee-get-url/" + taskOfferId)).data

// the saved account (it replaces the one before)
export const storeBankAccount = async (data) => (await api.post("me/bank-accounts", { ...data })).data.data

export const removeCardInfo = async (cardId) => {
  await api.delete("me/cards/" + cardId)
}

export const removeBankInfo = async (bankId) => {
  await api.delete("me/bank-accounts/" + bankId)
}
