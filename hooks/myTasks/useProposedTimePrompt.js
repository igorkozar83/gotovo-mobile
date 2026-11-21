// useProposedTimePrompt.js
// When a task shows up with a time the other party proposed, the accept/decline modal opens.
import { useLayoutEffect } from "react"

import useEvent from "../useEvent"
import useModalStore from "../../stores/modalStore"
import { newTimeRequest } from "../../Helpers/taskStatus"

// task: the shown task (null to skip); acceptedBy: its tasker; asks(proposed): whether this user answers it
const useProposedTimePrompt = (task, acceptedBy, asks = () => true) => {
  const requestNewTime = useModalStore((state) => state.requestNewTime)

  // asked when the task (re)arrives, with the latest tasker and check
  const prompt = useEvent(() => {
    const request = task && acceptedBy ? newTimeRequest(task, acceptedBy) : null
    if (request && asks(request.timeId)) requestNewTime(request)
  })
  useLayoutEffect(() => {
    prompt()
  }, [task, prompt])
}

export default useProposedTimePrompt
