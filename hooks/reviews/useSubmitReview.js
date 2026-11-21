// useSubmitReview.js
// Rating the other party of a finished task (stars, message, photos/videos).
import useApiAction from "../useApiAction"
import { createReview } from "../../Services/TasksAPI"

// onSuccess(resp) after the review was saved
const useSubmitReview = ({ onSuccess } = {}) => {
  const action = useApiAction(createReview, {
    error: "common.taskReviewCreateError",
    failed: "useSubmitReview.thereWasAnErrorWhileCreating",
    invalid: {},
    invalidate: [["myTasks"], ["reviews"]],
    onSuccess: (resp) => onSuccess && onSuccess(resp)
  })

  // data: the review fields; files: [{ type: "image" | "video", uri }]; uploadProgress(percent)
  return (data, files, uploadProgress) => action.run(data, files, uploadProgress)
}

export default useSubmitReview
