// TaskDetailsTasker.js
// A task as a tasker sees it: who posted it, what it is, when and where, the questions on it, and asking
// a question or proposing an offer. The route has the task's id (taskId; useOpenTaskDetails opens it):
// the task is loaded by it, shown at once when it was at hand (a list), and refreshed.
import React, { useState } from "react"
import { ScrollView, View, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import Header from "../components/Header"
import TitleWithBorder from "../components/ui/TitleWithBorder"
import ProposeOfferModal from "../components/modals/ProposeOfferModal"
import AskQuestionModal from "../components/modals/AskQuestionModal"
import ImageFullScreen from "../components/media/ImageFullScreen"
import { TaskHero, PosterSummary } from "../components/taskDetails/TaskHeader"
import AboutTask from "../components/taskDetails/AboutTask"
import TaskMediaGrid from "../components/taskDetails/TaskMediaGrid"
import TaskTimes from "../components/taskDetails/TaskTimes"
import TaskPlace from "../components/taskDetails/TaskPlace"
import TaskQuestions from "../components/taskDetails/TaskQuestions"
import { AskQuestionButton, ProposeOffer } from "../components/taskDetails/OfferActions"

import LoadingTask from "../components/taskDetails/LoadingTask"
import useTaskDetails from "../hooks/taskDetails/useTaskDetails"
import { useTaskDetail } from "../hooks/queries/useDetails"
import useTaskMediaThumbs from "../hooks/taskDetails/useTaskMediaThumbs"
import useTaskQuestionsOf from "../hooks/queries/useTaskQuestions"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import { palette } from "../styles/palette"

const TaskDetailsTasker = ({ route }) => {
  const taskQuery = useTaskDetail(route?.params?.taskId)
  if (!taskQuery.data) return <LoadingTask query={taskQuery} />
  return <TaskDetailsBody task={taskQuery.data} originalTimes={route?.params?.originalTimes} />
}

const TaskDetailsBody = ({ task, originalTimes }) => {
  const navigation = useNavigation()
  const details = useTaskDetails(task)
  const userSelect = useAuthStore((state) => state.userSelect)
  const language = useUiStore((state) => state.language)
  const tiles = useTaskMediaThumbs(task.images)
  const taskQuestions = useTaskQuestionsOf(task.id)

  const [fullImage, setFullImage] = useState(null)
  const [agreement, setAgreement] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)

  return (
    <>
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} bounces={false}>
        <Header back />
        <View style={styles.content}>
          <TaskHero task={task} userSelect={userSelect} />
          <PosterSummary poster={details.poster} avatar={details.posterAvatar} onOpenProfile={() => navigation.navigate("TaskerProfile", { profile: details.poster })} />
          <View style={styles.buttons}>
            <TitleWithBorder title={"taskDetailsTasker.aboutTask"} />
          </View>
          <View style={styles.footer}>
            <AboutTask task={task} language={language} />
            <TaskMediaGrid tiles={tiles} onOpen={setFullImage} />
            <TaskTimes task={task} language={language} originalTimes={originalTimes} />
            <TaskPlace task={task} takesPart={details.takesPart} />
            <TaskQuestions questions={taskQuestions.questions} onOpenImage={setFullImage} />
            {details.canAsk ? <AskQuestionButton onPress={() => details.mayAsk() && setAskOpen(true)} /> : null}
            {details.canOffer && <ProposeOffer agreement={agreement} setAgreement={setAgreement} onPropose={() => details.mayOffer(agreement) && setOfferOpen(true)} />}
          </View>
        </View>
        {details.offerOpen && <ProposeOfferModal task={task} visible={offerOpen} onReopen={() => setOfferOpen(true)} onClose={() => setOfferOpen(false)} />}
      </ScrollView>
      <AskQuestionModal
        visible={askOpen}
        taskDetails={task}
        onReopen={() => setAskOpen(true)}
        onClose={() => {
          setAskOpen(false)
          taskQuestions.refresh()
        }}
      />
      <ImageFullScreen image={fullImage} visible={!!fullImage} onClose={() => setFullImage(null)} />
    </>
  )
}

const styles = StyleSheet.create({
  buttons: { paddingHorizontal: 20, marginBottom: 10 },
  footer: { paddingHorizontal: 20, marginBottom: 40 },
  content: { marginBottom: 50, zIndex: 2, backgroundColor: palette.white },
  container: { flexGrow: 1, backgroundColor: palette.white },
  failed: { marginTop: 140, paddingHorizontal: 20, fontSize: 16, fontFamily: "Montserrat_400Regular", textAlign: "center" }
})

export default TaskDetailsTasker
