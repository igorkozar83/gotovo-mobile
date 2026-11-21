// useCreateQuestion.js
// Asking a question on a task, or answering one (questionId), with an optional image.
import useApiAction from "../useApiAction"
import { useRefreshInboxCount } from "../queries/useInboxCount"
import { createTaskQuestion } from "../../Services/TasksAPI"
import { apiError } from "../../Helpers/apiErrors"

// onSuccess(question) after the question was saved; onFailed() after the request failed or the form was invalid
// (not when the server refused it: its alert says why)
const useCreateQuestion = ({ onSuccess, onFailed } = {}) => {
  const refreshInboxCount = useRefreshInboxCount()

  const action = useApiAction(createTaskQuestion, {
    error: "useCreateQuestion.taskQuestionCreateError",
    failed: "common.thereWasAnErrorWhileCreating",
    invalid: {},
    invalidate: [["taskQuestions"], ["inbox", "questions"]],
    onSuccess: (resp) => {
      refreshInboxCount()
      if (onSuccess) onSuccess(resp)
    },
    onError: (error) => {
      const refusal = apiError(error)
      if (onFailed && !(refusal && refusal.code !== "invalid")) onFailed()
    }
  })

  // data: { question }; image may be null; uploadProgress(percent)
  return (data, taskId, image, uploadProgress, questionId = null) => action.run(data, taskId, image, uploadProgress, questionId)
}

export default useCreateQuestion
