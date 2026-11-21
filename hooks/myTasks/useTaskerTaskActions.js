// useTaskerTaskActions.js
// Actions the tasker can take on their accepted task (moved out of TaskerTaskDetails).
import { useNavigation } from "@react-navigation/native"

import { useInvalidateOfferDetails } from "../queries/useDetails"
import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import useTaskDetailsActions from "./useTaskDetailsActions"
import { getTaskerOffer } from "../../Helpers/taskStatus"
import { completeTask, acceptTaskDate, startTask } from "../../Services/TasksAPI"

const useTaskerTaskActions = ({ task, setTask, onBackToList }) => {
  const navigation = useNavigation()
  const invalidateOfferDetails = useInvalidateOfferDetails()
  const { showError, showSuccess } = useAlert()
  const { proposeNewTaskDate } = useTaskDetailsActions(task)

  const goToMessageUser = () => navigation.navigate("Chat", { userId: task.posted_by_user.id, taskId: task.id })

  const proposeNewDate = (date) => proposeNewTaskDate(date, getTaskerOffer(task).id)

  const complete = useApiAction(completeTask, {
    success: { title: "useTaskerTaskActions.taskClaimedComplete", text: "useTaskerTaskActions.clientMustConfirmThatTaskIs" },
    error: "common.taskCompleteError",
    failed: "useTaskerTaskActions.taskCouldNotBeCompletedPlease",
    invalidate: [["myTasks"]],
    onSuccess: () => onBackToList()
  })
  const doCompleteTask = () => complete.run(task.id)

  const acceptDate = useApiAction(acceptTaskDate, {
    success: { title: "useTaskerTaskActions.taskTimeAcceptSuccess", text: "useTaskerTaskActions.taskDateSuccessfullyAccepted" },
    error: "common.taskTimeAcceptError",
    failed: "useTaskerTaskActions.taskTimeCouldNotBeAccepted",
    invalidate: [["myTasks"]],
    onSuccess: (resp, dateId) => {
      const updated = { ...task, times: task.times.map((time) => (time.id === dateId ? { ...time, status: 1 } : time)) }
      setTask(updated)
      // (an offer screen of this task shows the accepted time once it reloads)
      invalidateOfferDetails()
    }
  })

  const doAcceptDate = (selectedDate) => {
    if (!selectedDate) return showError("common.taskTimeAcceptError", "useTaskerTaskActions.pleaseChooseTime")
    acceptDate.run(selectedDate.id)
  }

  const start = useApiAction(startTask, {
    error: "common.startTaskError",
    failed: "useTaskerTaskActions.thereWasAnErrorWhileStarting",
    invalid: {},
    invalidate: [["myTasks"]],
    onSuccess: () => {
      showSuccess("common.taskStarted", "useTaskerTaskActions.waitingForClientToConfirmThat")
      navigation.navigate("MyTasks", { refresh: true })
    }
  })
  const doStartTask = (type) => start.run(type, getTaskerOffer(task).id)

  return { goToMessageUser, proposeNewDate, doCompleteTask, doAcceptDate, doStartTask }
}

export default useTaskerTaskActions
