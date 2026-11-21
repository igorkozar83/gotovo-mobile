// InboxQuestions.js
// The inbox's QA tab: the questions about the user's tasks (a client's) or asked by them (a tasker's),
// with their answers. Loads while it is shown; a tasker's questions are marked read when it shows.
import React, { useLayoutEffect, useState } from "react"
import { useIsFocused } from "@react-navigation/native"

import QuestionsAndAnswers from "../../components/inbox/QuestionsAndAnswers"
import ImageFullScreen from "../../components/media/ImageFullScreen"
import useApiAction from "../../hooks/useApiAction"
import useListSpinner from "../../hooks/useListSpinner"
import { useTaskQuestions } from "../../hooks/queries/useInbox"
import { useRefreshInboxCount } from "../../hooks/queries/useInboxCount"
import { readTasksQuestionsTasker } from "../../Services/TasksAPI"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { inboxRoute } from "./inboxTabs"

export default function InboxQuestions({ navigation }) {
  const isFocused = useIsFocused()
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const language = useUiStore((state) => state.language)
  const [fullImage, setFullImage] = useState(null)
  const refreshInboxCount = useRefreshInboxCount()

  const qaList = useTaskQuestions(user.userData.type, isFocused)
  useListSpinner(isFocused && qaList.isFetching)

  const { run: readQuestions } = useApiAction(readTasksQuestionsTasker, { spinner: false, onSuccess: () => refreshInboxCount() })
  useLayoutEffect(() => {
    if (isFocused && userSelect === "TASKER") readQuestions()
  }, [isFocused, userSelect, readQuestions])

  return (
    <>
      <QuestionsAndAnswers
        questions={qaList.questions}
        userSelect={userSelect}
        meId={user.userData.id}
        language={language}
        fetching={qaList.isFetching}
        canLoadMore={qaList.canLoadMore}
        onLoadMore={qaList.loadMore}
        onRefresh={() => qaList.refresh()}
        onOpenImage={setFullImage}
        tab="QA"
        onTab={(key) => navigation.navigate(inboxRoute(key))}
      />
      <ImageFullScreen visible={!!fullImage} onClose={() => setFullImage(null)} image={fullImage} />
    </>
  )
}
