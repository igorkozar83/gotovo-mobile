// useConfirmComplete.js
// The client confirming that the tasker finished a task, then going on to review the tasker.
// data: the confirm-complete modal's task data (taskId, taskName, postedBy, acceptedBy, acceptedByUser).
import { useNavigation } from "@react-navigation/native"

import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import useAuthStore from "../../stores/authStore"
import { confirmCompleteTask } from "../../Services/TasksAPI"
import { showSuccessThen } from "../../stores/alerts"

// the other side of the task: the client for the tasker, else the tasker who did it
export const otherParty = (data, userId) => {
  if (!data || !data.postedBy || !data.acceptedBy) return {}
  if (data.postedBy.id !== userId) return data.postedBy
  return data.acceptedByUser || data.acceptedBy
}

const useConfirmComplete = (data, { onSend }) => {
  const navigation = useNavigation()
  const userId = useAuthStore((state) => state.user.userData.id)
  const { showError } = useAlert()
  const other = otherParty(data, userId)

  const confirm = useApiAction(confirmCompleteTask, {
    error: "common.taskCompleteError",
    invalid: {},
    failedTitle: "useConfirmComplete.taskConfirmCompleteError",
    failed: "common.thereWasAnErrorWhileCreating",
    invalidate: [["myTasks"], ["inbox", "offers"]],
    onSuccess: () => {
      const submitReview = {
        taskId: data.taskId,
        userIdClient: other.id,
        type: "CLIENT",
        taskName: data.taskName,
        userId,
        userName: data.acceptedBy.name ? data.acceptedBy.name : data.acceptedByUser.name,
        reviewed: true,
        userNameResend: data.postedBy.name
      }
      showSuccessThen("useConfirmComplete.taskCompleteSuccess", "useConfirmComplete.taskConfirmCompleteSuccessfully", () => navigation.navigate("MyTasks", { submitReview }))
    }
  })

  return {
    other,
    confirm: () => {
      if (!data.taskId) return showError("common.taskCompleteError", "useConfirmComplete.taskIdIsNotSetPlease")
      onSend()
      confirm.run(data.taskId)
    }
  }
}

export default useConfirmComplete
