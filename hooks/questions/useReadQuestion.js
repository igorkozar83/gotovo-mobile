// useReadQuestion.js
// Marking a tasker's question read by the client, quietly (no spinner, no alerts); the inbox count follows.
import useApiAction from "../useApiAction"
import { useRefreshInboxCount } from "../queries/useInboxCount"
import { clientReadQuestion } from "../../Services/TasksAPI"

// run(questionId)
export const useReadQuestion = ({ onSuccess } = {}) => {
  const refreshInboxCount = useRefreshInboxCount()
  return useApiAction(clientReadQuestion, {
    spinner: false,
    onSuccess: (...args) => {
      if (onSuccess) onSuccess(...args)
      refreshInboxCount()
    }
  })
}
