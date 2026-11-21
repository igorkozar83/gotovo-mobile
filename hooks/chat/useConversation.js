// useConversation.js
// The conversation the chat screen shows: the one opened from the inbox ({ conversation }), or the one
// with a user about a task ({ userId, taskId }), which the server creates when there is none yet.
import { useEffect, useState } from "react"

import { checkConversation } from "../../Services/NotificationsAPI"
import useApiAction from "../useApiAction"

const useConversation = ({ conversation: opened, userId, taskId }) => {
  const [conversation, setConversation] = useState(opened || null)
  const { run: check } = useApiAction(checkConversation, { onSuccess: (found) => setConversation(found) })

  useEffect(() => {
    if (opened) setConversation(opened)
    else if (userId) check(userId, taskId)
  }, [opened, userId, taskId, check])

  return conversation
}

export default useConversation
