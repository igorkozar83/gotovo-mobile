// features.js
// Parts of the app that are built but switched off. Their code stays compiled, linted and tested; turning
// one on is changing its flag here.
//   payments: accepting an offer goes through paying the Gotovo fee (PaymentModal, useOfferPayment) and
//             a tasker manages their income accounts
//   disputes: a client can open a dispute from the confirm-complete modal
export const FEATURES = {
  payments: false,
  disputes: false
}
