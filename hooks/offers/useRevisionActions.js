// useRevisionActions.js
// The client accepts or declines a tasker's price revision (an edited offer).
import useApiAction from "../useApiAction"
import { acceptRevision, refuseRevision } from "../../Services/TasksAPI"

const CHANGED = [["myTasks"], ["inbox", "offers"]]

// onAccepted(resp) / onDeclined(resp) after a success; acceptedAlert: false when onAccepted shows its own
const useRevisionActions = ({ onAccepted, onDeclined, acceptedAlert = true } = {}) => {
  const accept = useApiAction(acceptRevision, {
    success: acceptedAlert ? { title: "Task revision accept success", text: "Task revision accepted successfully." } : undefined,
    error: "useRevisionActions.taskRevisionAcceptError",
    failed: "useRevisionActions.somethingWentWrongPleaseTryAgain",
    invalidate: CHANGED,
    onSuccess: (resp) => onAccepted && onAccepted(resp)
  })

  const decline = useApiAction(refuseRevision, {
    success: {
      title: "useRevisionActions.priceRevisionDeclined",
      text: "useRevisionActions.youDeclinedTheRevisedOfferFrom"
    },
    error: "useRevisionActions.taskRevisionAcceptError",
    failed: "useRevisionActions.somethingWentWrongPleaseTryAgain",
    invalidate: CHANGED,
    onSuccess: (resp) => onDeclined && onDeclined(resp)
  })

  return {
    // editedOfferId: the revision (the new offer the tasker sent)
    acceptRevision: (editedOfferId) => accept.run(editedOfferId),
    declineRevision: (editedOfferId) => decline.run(editedOfferId)
  }
}

export default useRevisionActions
