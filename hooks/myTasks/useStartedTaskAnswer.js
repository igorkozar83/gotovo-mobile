// useStartedTaskAnswer.js
// The client answering "has the task started?" for a task the tasker marked started: yes starts it on
// the client's side, no reports it as not started. Either way the modal closes and My Tasks reloads.
import { useNavigation } from "@react-navigation/native"

import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { startTask, taskNotStarted } from "../../Services/TasksAPI"
import useAuthStore from "../../stores/authStore"

const MY_TASKS = [["myTasks"]]

// data: the started-task modal's data; close: closes the modal
const useStartedTaskAnswer = (data, close) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const { showSuccess } = useAlert()
  const toMyTasks = () => navigation.navigate("MyTasks", { refresh: true })

  const notStarted = useApiAction(taskNotStarted, {
    error: "useStartedTaskAnswer.taskNotStartedError",
    failed: "common.taskCouldNotBeCanceledPlease",
    invalidate: MY_TASKS,
    onSuccess: toMyTasks
  })

  const start = useApiAction(startTask, {
    error: "common.startTaskError",
    invalid: {},
    failed: "useStartedTaskAnswer.thereWasAnErrorWhileStarting",
    invalidate: MY_TASKS,
    onSuccess: () => {
      showSuccess("common.taskStarted", "useStartedTaskAnswer.youSuccessfullyStartedTheTask")
      toMyTasks()
    }
  })

  // the other party of the task
  const other = data && data.postedBy && data.acceptedByUser ? (data.postedBy.id !== user.userData.id ? data.postedBy : data.acceptedByUser) : {}

  return {
    other,
    confirm: () => {
      close()
      start.run("CLIENT", data.taskOffer.id)
    },
    deny: () => {
      close()
      notStarted.run(data.taskOffer.id)
    }
  }
}

export default useStartedTaskAnswer
