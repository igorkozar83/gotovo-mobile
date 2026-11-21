// useOfferActions.js
// A tasker's offer on a task: sending it and revising it (the error alerts and the lists to reload are
// set here; the screen decides what happens next).
import useApiAction from "../useApiAction"
import { createTaskOffer, editTaskOffer } from "../../Services/TasksAPI"

// run(taskId, { price, explanation })
export const useCreateOffer = ({ onSuccess } = {}) =>
  useApiAction(createTaskOffer, {
    error: "useOfferActions.taskOfferCreateError",
    invalid: {},
    failedTitle: "useOfferActions.taskOfferError",
    failed: "useOfferActions.thereWasAnErrorWhileCreating",
    invalidate: [["taskerJobs"], ["inbox", "offers"]],
    onSuccess
  })

// run(taskId, { price, explanation })
export const useEditOffer = ({ onSuccess } = {}) =>
  useApiAction(editTaskOffer, {
    error: "useOfferActions.taskOfferEditError",
    invalid: {},
    failedTitle: "useOfferActions.taskOfferError",
    failed: "useOfferActions.thereWasAnErrorWhileEditing",
    invalidate: [["myTasks"], ["inbox", "offers"]],
    onSuccess
  })
