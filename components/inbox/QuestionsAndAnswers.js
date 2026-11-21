// QuestionsAndAnswers.js
// The inbox QA tab, a list under the inbox's top (more loaded near its end). A client sees the questions
// on their tasks (to answer) and the answers to their own questions; a tasker sees, per task, their
// questions with the client's answers and, under them, can ask a new one about the same tasks.
import React, { useState } from "react"
import { View, Text, Pressable, TouchableWithoutFeedback, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import FastImageComponent from "../media/FastImageComponent"
import { QuestionItem, AnswerItem } from "./QAItems"
import InboxListHeader, { INBOX_HEADER_HEIGHT } from "./InboxListHeader"
import InboxAskQuestionModal from "../modals/InboxAskQuestionModal"
import CollapsingList from "../lists/CollapsingList"
import Button from "../ui/Button"
import useAlert from "../../hooks/useAlert"
import { timeFormat, timeFormatFullYear, shortenName } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// a question's or answer's photo; tapping it opens it full screen
const QAPhoto = ({ image, onOpen }) =>
  image ? (
    <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} onPress={() => onOpen(image)}>
      <View style={styles.photoRow}>
        <FastImageComponent contentFit="cover" source={image} style={styles.photo} />
      </View>
    </Pressable>
  ) : null

// one task with the tasker's questions (oldest first) and the client's answers
const TaskerQuestions = ({ task, language, onOpenImage }) => (
  <View style={styles.card}>
    <View style={styles.cardHead}>
      <Text style={styles.bold}>{shortenName(task.posted_by.full_name)}</Text>
      <Text style={styles.light}>{task.questions.length ? timeFormatFullYear(task.questions[0].created_at, language) : ""}</Text>
    </View>
    <Text style={[styles.light, atoms.marginBottom10]}>{task.name}</Text>
    {task.questions
      .slice(0)
      .reverse()
      .map((question, index) => (
        <View key={`qa-tasker-list-questions-${index}`}>
          <Text style={[styles.bold, atoms.marginRight10]}>
            {translate("questionsAndAnswers.q")}
            {"   "}
            <Text style={styles.bold}>{question.question}</Text>
          </Text>
          <QAPhoto image={question.image} onOpen={onOpenImage} />
          {question.answer ? (
            <>
              <Text style={[styles.bold, atoms.marginRight10]}>
                {translate("questionsAndAnswers.a")}
                {"   "}
                <Text style={styles.answerText}>{question.answer.question}</Text>
              </Text>
              <QAPhoto image={question.answer.image} onOpen={onOpenImage} />
            </>
          ) : null}
        </View>
      ))}
  </View>
)

// under a tasker's questions: asking a new one, and where to ask about other tasks
const TaskerFooter = ({ onAsk, onHome }) => (
  <View>
    <View style={styles.askButton}>
      <Button onPress={onAsk} title={"questionsAndAnswers.askANewQuestion"}>
        <MaterialCommunityIcons name="comment-question-outline" size={20} color={palette.white} />
      </Button>
    </View>
    <View style={styles.note}>
      <Text style={styles.noteTitle}>{translate("common.note")}</Text>
      <Text style={styles.light}>{translate("questionsAndAnswers.byTappingTheAboveButtonYou")}.</Text>
    </View>
    <View style={styles.homeNote}>
      <Text style={styles.light}>
        {translate("questionsAndAnswers.forQuestionsRegardingAllOtherTasks")}{" "}
        <TouchableWithoutFeedback onPress={onHome}>
          <Text style={styles.homeLink}>{translate("common.home")} </Text>
        </TouchableWithoutFeedback>
        {translate("questionsAndAnswers.selectATaskYouAreInterested")}.
      </Text>
    </View>
  </View>
)

/**
 * questions, fetching, canLoadMore, onLoadMore: the tasks with their questions; meId: the user's id
 * onRefresh: reloads them; onOpenImage(image): shows a photo full screen; tab / onTab: the inbox bar
 */
const QuestionsAndAnswers = ({ questions, userSelect, meId, language, fetching, canLoadMore, onLoadMore, onRefresh, onOpenImage, tab = "QA", onTab }) => {
  const navigation = useNavigation()
  const { showError } = useAlert()
  const [asking, setAsking] = useState(false)
  const isClient = userSelect === "CLIENT"

  const askNew = () => {
    if (!questions.length) return showError("questionsAndAnswers.askNewQuestionError", "questionsAndAnswers.noEligibleTasks")
    setAsking(true)
  }

  const renderClientItem = ({ item: task }) => {
    const first = task.questions[0]
    const date = timeFormat(first.created_at, language)
    return first.user_id !== meId ? <QuestionItem task={task} date={date} onRefresh={onRefresh} /> : <AnswerItem task={task} date={date} />
  }
  const renderTaskerItem = ({ item: task }) => <TaskerQuestions task={task} language={language} onOpenImage={onOpenImage} />

  return (
    <>
      <CollapsingList
        header={<InboxListHeader tab={tab} onTab={onTab} />}
        headerHeight={INBOX_HEADER_HEIGHT}
        background={palette.white}
        fetching={fetching}
        canLoadMore={canLoadMore}
        onLoadMore={onLoadMore}
        data={questions || []}
        extraData={[language, meId, userSelect, onRefresh]}
        estimatedItemSize={isClient ? 120 : 200}
        keyExtractor={(task, index) => String(task.id ?? "qa-list-" + index)}
        renderItem={isClient ? renderClientItem : renderTaskerItem}
        ListFooterComponent={isClient ? null : <TaskerFooter onAsk={askNew} onHome={() => navigation.navigate("Home")} />}
      />
      <InboxAskQuestionModal
        visible={asking}
        onClose={() => {
          setAsking(false)
          onRefresh()
        }}
        questions={questions}
      />
    </>
  )
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: "row", width: "100%" },
  cardHead: { flexDirection: "row", justifyContent: "space-between" },
  answerText: { fontSize: 16, fontFamily: "Montserrat_400Regular" },
  askButton: { marginTop: 30, marginHorizontal: 20 },
  note: { marginHorizontal: 20, marginVertical: 10 },
  noteTitle: { fontSize: 12, fontFamily: "Montserrat_600SemiBold" },
  homeNote: { marginHorizontal: 20, marginBottom: 100 },
  homeLink: { color: palette.orange, fontFamily: "Montserrat_700Bold", fontSize: 12 },
  card: { borderBottomWidth: 1, borderBottomColor: palette.gray100, marginHorizontal: 20, paddingBottom: 20, marginBottom: 20 },
  bold: { fontSize: 16, fontFamily: "Montserrat_700Bold" },
  light: { fontSize: 12, fontFamily: "Montserrat_300Light" },
  photo: { width: "33%", height: 90, borderRadius: 5, marginRight: 5 }
})

export default QuestionsAndAnswers
