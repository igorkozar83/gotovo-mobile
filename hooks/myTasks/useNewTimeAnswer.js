// useNewTimeAnswer.js
// Answering a time the other party proposed for a task. Declining explains that a new time has to be
// agreed and opens the chat with the other party.
import { useNavigation } from "@react-navigation/native"

import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { actionTaskTime } from "../../Services/TasksAPI"
import useAuthStore from "../../stores/authStore"

const ACCEPT = 1
const DECLINE = 3

// data: the new-time modal's data; close: closes the modal
const useNewTimeAnswer = (data, close) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const { showError } = useAlert()

  // the other party of the task
  const otherUserId = () => (data?.acceptedBy?.id === user.userData.id ? data?.timeId?.user_id : data?.acceptedBy?.id)

  const acceptTime = useApiAction(actionTaskTime, {
    success: { title: "useNewTimeAnswer.taskTimeAccepted", text: "useNewTimeAnswer.timeacceptedtaskerdescription" },
    error: "common.taskTimeAcceptError",
    failed: "useNewTimeAnswer.taskTimeCouldNotBeAccepted",
    invalidate: [["myTasks"]],
    onSuccess: close
  })

  const declineTime = useApiAction(actionTaskTime, {
    error: "useNewTimeAnswer.taskTimeDeclineError",
    failed: "useNewTimeAnswer.taskTimeCouldNotBeDeclined",
    invalidate: [["myTasks"]],
    onSuccess: () => {
      showError("useNewTimeAnswer.taskTimeDeclined", userSelect === "CLIENT" ? "useNewTimeAnswer.youDeclinedTheTimeTheTasker" : "useNewTimeAnswer.youDeclinedTheTimeTheClient")
      navigation.navigate("Chat", { userId: otherUserId(), taskId: data.taskId })
      close()
    }
  })

  return {
    accept: () => acceptTime.run(data.timeId.id, ACCEPT),
    decline: () => declineTime.run(data.timeId.id, DECLINE)
  }
}

export default useNewTimeAnswer
