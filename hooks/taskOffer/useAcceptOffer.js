// useAcceptOffer.js
// A client accepting the offer shown on the offer details screen (TaskOffer).
import { useOfferCache } from "../queries/useDetails"
import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { useRefreshInboxCount } from "../queries/useInboxCount"
import { useInvalidateOffers } from "../queries/useInbox"
import { acceptTaskOffer } from "../../Services/TasksAPI"

// the offer `offerId` is accepted (or paid): the screen shows it accepted, the lists and counts reload
export const useMarkOfferAccepted = (offerId) => {
  const offerCache = useOfferCache(offerId)
  const refreshInboxCount = useRefreshInboxCount()
  const invalidateOffers = useInvalidateOffers()

  return () => {
    refreshInboxCount()
    invalidateOffers()
    offerCache.update((current) => ({ ...current, status: 1 }))
  }
}

// the agreement has to be ticked, except for a revision of an offer on a task still open for offers
export const needsAgreement = (offer) => offer.task.status !== 1 || !offer.edit_id

/**
 * offerId: the offer shown; agreed: the client ticked the agreement
 * onAccepted(acceptedTime): the offer is accepted; acceptedTime is the task's agreed time, or null
 * Returns accept().
 */
const useAcceptOffer = ({ offerId, agreed, onAccepted }) => {
  const { showError } = useAlert()
  const offerCache = useOfferCache(offerId)
  const markAccepted = useMarkOfferAccepted(offerId)

  const action = useApiAction(acceptTaskOffer, {
    error: "useAcceptOffer.taskOfferAcceptError",
    onSuccess: (resp) => {
      onAccepted(resp.accepted_time ?? null)
      markAccepted()
    }
  })

  return () => {
    const offer = offerCache.get()
    if (!agreed && needsAgreement(offer)) return showError("useAcceptOffer.taskOfferAcceptError2", "useAcceptOffer.pleaseAcceptAgreementFirst")
    return action.run(offer.id)
  }
}

export default useAcceptOffer
