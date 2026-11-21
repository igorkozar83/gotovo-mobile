// useDisputeForm.js
// Opening a dispute on a task: a reason, the details and up to three photos. The modal closes while
// the dispute uploads (hide) and comes back if it fails (show); a success is confirmed in an alert
// whose OK runs onDisputed.
import { useState } from "react"

import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import usePhotoList from "../usePhotoList"
import { disputeTask } from "../../Services/TasksAPI"
import { failedRules } from "../../Helpers/validation"
import { showSuccessThen } from "../../stores/alerts"

export const MAX_DISPUTE_PHOTOS = 3

const useDisputeForm = ({ data, hide, show, onSubmitted, onDisputed }) => {
  const { showError } = useAlert()
  const [reason, setReason] = useState("")
  const [detail, setDetail] = useState("")
  const photoList = usePhotoList(MAX_DISPUTE_PHOTOS, {
    title: "Task dispute images error",
    text: "You already selected 3 images. Please remove some images before you try to select another one."
  })
  const { photos } = photoList
  const taskId = data && (data.task && data.task.id ? data.task.id : data.taskId)

  const clear = () => {
    setReason("")
    setDetail("")
    photoList.clear()
  }

  const dispute = useApiAction(disputeTask, {
    error: "useDisputeForm.taskDisputeError",
    invalid: {},
    failed: "useDisputeForm.thereWasAnErrorWhileCreating",
    invalidate: [["myTasks"], ["inbox", "offers"]],
    onSuccess: () => {
      onSubmitted()
      clear()
      showSuccessThen("useDisputeForm.taskDisputeSuccess", "useDisputeForm.disputeOpenedSuccessfully", onDisputed)
    },
    onError: () => show()
  })

  return {
    reason,
    setReason,
    detail,
    setDetail,
    photos,
    addPhoto: photoList.add,
    removePhoto: photoList.remove,
    // true when another photo may be added (else the user is told to remove one)
    canAddPhoto: photoList.canAdd,
    submit: () => {
      const errors = failedRules([
        [!taskId, "useDisputeForm.taskIdIsNotSetPlease"],
        [!reason, "useDisputeForm.pleaseEnterReason"],
        [!detail, "useDisputeForm.pleaseEnterDetails"],
        [photos.length > MAX_DISPUTE_PHOTOS, "useDisputeForm.pleaseSelectUpToThreeImages"]
      ])
      if (errors) return showError("useDisputeForm.taskDisputeError", errors)
      hide()
      dispute.run({ taskId, reason, detail }, photos)
    }
  }
}

export default useDisputeForm
