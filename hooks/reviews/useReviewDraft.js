// useReviewDraft.js
// A review of the other party of a finished task being written: the stars, a message and up to two
// photos. problems() explains what is missing; send() saves it (onSaved after a saved review).
import { useState } from "react"

import useSubmitReview from "./useSubmitReview"
import usePhotoList from "../usePhotoList"
import { failedRules } from "../../Helpers/validation"

export const MAX_REVIEW_PHOTOS = 2

// taskId, receiverId: the task and the user reviewed; initialRate: the stars to start from (null: none)
const useReviewDraft = ({ taskId, receiverId, initialRate = null, onSaved }) => {
  const [message, setMessage] = useState("")
  const [rate, setRate] = useState(initialRate)
  const photoList = usePhotoList(MAX_REVIEW_PHOTOS)
  const submitReview = useSubmitReview({ onSuccess: onSaved })

  return {
    message,
    setMessage,
    rate,
    setRate,
    photos: photoList.photos,
    addPhoto: photoList.add,
    removePhoto: photoList.remove,
    clear: () => {
      photoList.clear()
      setMessage("")
      setRate(initialRate)
    },
    // the translated problems, one per line ("" when the review can be sent)
    problems: () =>
      failedRules([
        [!taskId, "useReviewDraft.taskIdIsNotSet"],
        [!message, "useReviewDraft.pleaseEnterMessage"],
        [!rate, "useReviewDraft.pleaseClickRate"],
        [!receiverId, "useReviewDraft.taskUserIdIsNotSet"]
      ]),
    send: () => submitReview({ task_id: taskId, receiver_user_id: receiverId, rate, message }, photoList.photos)
  }
}

export default useReviewDraft
