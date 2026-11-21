// useReviewForm.js
// The review popup's form: a review draft starting at one star. A form that doesn't pass is explained
// in an alert whose OK brings the popup back (hide / show); after a saved review the user is thanked
// and taken to the finished tasks.
import { useNavigation } from "@react-navigation/native"

import useReviewDraft from "./useReviewDraft"
import useAlert from "../useAlert"
import { showSuccess } from "../../stores/alerts"

export { MAX_REVIEW_PHOTOS } from "./useReviewDraft"

const useReviewForm = ({ data, hide, show }) => {
  const navigation = useNavigation()
  const { showErrorThen } = useAlert()

  const draft = useReviewDraft({
    taskId: data?.taskId,
    receiverId: data?.userIdClient,
    initialRate: 1,
    onSaved: () => {
      showSuccess("useReviewForm.thankYouYourReviewHasBeen", "")
      draft.clear()
      hide()
      navigation.navigate("MyTasks", { type: "finished" })
    }
  })

  return {
    ...draft,
    submit: () => {
      const problems = draft.problems()
      if (!problems) return draft.send()
      hide()
      showErrorThen("common.taskReviewCreateError", problems, show)
    }
  }
}

export default useReviewForm
