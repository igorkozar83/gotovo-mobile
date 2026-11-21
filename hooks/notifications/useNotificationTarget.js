// useNotificationTarget.js
// Opening what a tapped notification in the inbox is about: a task of the user's (its details, a finished one's
// finished details), an offer, a review (in its modal, over the reviews), a chat or the Q&A tab.
import { useNavigation } from "@react-navigation/native"

import useLoadTask, { useLoadTaskOffer } from "../queries/useLoadTask"
import { useOpenMyTask } from "../queries/useDetails"
import useModalStore from "../../stores/modalStore"

const useNotificationTarget = () => {
  const navigation = useNavigation()
  const loadTask = useLoadTask({ errorTitle: "Notification error", failed: "We couldnt get task info" })
  const loadTaskOffer = useLoadTaskOffer({ errorTitle: "Notification error", failed: "We couldnt get task offer info" })

  const openMyTask = useOpenMyTask()

  // (loaded first: its status says which details it opens in)
  const openInMyTasks = async (taskId) => {
    const task = await loadTask(taskId)
    if (task) openMyTask(task)
  }

  const openOffer = async (offerId) => {
    // (loaded into the cache: the offer screen shows it)
    const offer = await loadTaskOffer(offerId)
    if (!offer) return
    navigation.navigate("TaskOffer", { offerId: offer.id })
  }

  // data: the notification's parsed data
  return (data) => {
    switch (data.type) {
      case "new-task-offer":
        return openOffer(data.taskOfferId)
      case "edit-task-offer":
        return openInMyTasks(data.task.task.id)
      case "new-task-time":
      case "claim-complete":
      case "tasker-start-task":
      case "accept-task-offer":
      case "resolved-dispute":
        return openInMyTasks(data.taskId)
      case "review-received":
        // the review opens in its modal over the reviews
        useModalStore.getState().requestReviewReceived(data.name ? { ...data, userName: data.name } : data)
        return navigation.navigate("MyReviews")
      case "new-message-received":
        return navigation.navigate("Chat", { userId: data.userId, taskId: data.taskId })
      case "new-task-question":
      case "answer-task-question":
        return navigation.navigate("Notifications", { qa: true })
    }
  }
}

export default useNotificationTarget
