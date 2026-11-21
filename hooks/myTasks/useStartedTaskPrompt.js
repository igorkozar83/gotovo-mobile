// useStartedTaskPrompt.js
// A client opening a task the tasker has started (status 8) is asked to confirm the start.
import { useEffect } from "react"

import useModalStore from "../../stores/modalStore"
import { startedTaskRequest } from "../../Helpers/taskStatus"

// task: the client's task (null for a tasker)
const useStartedTaskPrompt = (task) => {
  const requestStartedTask = useModalStore((state) => state.requestStartedTask)

  useEffect(() => {
    if (task && task.status === 8) requestStartedTask(startedTaskRequest(task))
  }, [task, requestStartedTask])
}

export default useStartedTaskPrompt
