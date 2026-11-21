import { useQuery } from "@tanstack/react-query"

import { getTaskQuestions } from "../../Services/TasksAPI"

// public questions and answers on one task
const useTaskQuestionsOf = (taskId) => {
  const query = useQuery({
    queryKey: ["taskQuestions", taskId],
    queryFn: () => getTaskQuestions(taskId),
    enabled: !!taskId
  })
  return { questions: query.data || [], refresh: () => query.refetch() }
}

export default useTaskQuestionsOf
