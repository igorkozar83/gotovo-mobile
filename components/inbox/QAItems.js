// QAItems.js
// The client's rows in the Q&A inbox tab, one per task, for its latest question: a tasker's question
// (tapping it marks it read, REPLY answers it), or the client's own question with the answer to it.
import React, { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import AnswerQuestionModal from "../modals/AnswerQuestionModal"
import { translate } from "../../Helpers/language.utils"
import { useReadQuestion } from "../../hooks/questions/useReadQuestion"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

/**
 * task: the task with its questions (the latest first); date: when the question was asked
 * onRefresh: reloads the list (after it was read or answered)
 */
export const QuestionItem = ({ task, date, onRefresh }) => {
  const question = task.questions[0]
  const [answering, setAnswering] = useState(false)

  const markRead = useReadQuestion({ onSuccess: () => onRefresh() })
  const read = () => markRead.run(question.id)

  // (the modal stays inside the row as before, so a tap on it also marks the question read)
  return (
    <Pressable onPress={read}>
      <View style={[styles.row, styles.questionRow]}>
        <View style={styles.line}>
          <Text style={styles.label}>{translate("qAItems.newQuestion")}</Text>
          <Text style={styles.small}>{date}</Text>
        </View>
        <Text style={styles.small}>{task.name}</Text>
        <View style={styles.line}>
          <Text style={styles.questionText}>{question.question}</Text>
          {!question.answer ? (
            <Pressable style={styles.reply} onPress={() => setAnswering(true)}>
              <Text style={styles.replyText}>{translate("common.reply")}</Text>
            </Pressable>
          ) : null}
        </View>
        {question.answer && question.answer.question ? <Text style={[styles.answer, styles.questionLine]}>{question.answer.question}</Text> : null}
      </View>
      <AnswerQuestionModal
        visible={answering}
        onVisibleChange={setAnswering}
        task={task}
        question={question.question}
        onClose={() => setAnswering(false)}
        onAnswered={() => {
          onRefresh()
          read()
        }}
      />
    </Pressable>
  )
}

// a reply comes with the question it answers (get_question); a question with its answer
const questionAndAnswer = (item) => {
  const other = item.get_question ? item.get_question.question : ""
  return item.reply ? { question: other, answer: item.question } : { question: item.question, answer: other }
}

export const AnswerItem = ({ task, date }) => {
  const { question, answer } = questionAndAnswer(task.questions[0])
  return (
    <View style={[styles.row, styles.answerRow]}>
      <View style={styles.line}>
        <Text style={styles.small}>{task.name}</Text>
        <Text style={styles.small}>{date}</Text>
      </View>
      <View style={atoms.width70Percent}>
        <Text style={styles.taskName}>{question}</Text>
        <Text style={[styles.answer, atoms.maxWidth90Percent]}>{answer}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: "Montserrat_700Bold", fontSize: 12 },
  questionLine: { maxWidth: "72%", marginTop: 10 },
  taskName: { fontSize: 18, fontFamily: "Montserrat_500Medium" },
  questionText: { fontSize: 18, maxWidth: "72%", fontFamily: "Montserrat_700Bold" },
  replyText: { color: palette.white, fontSize: 15, fontFamily: "Montserrat_700Bold" },
  row: { paddingHorizontal: 20, paddingVertical: 20 },
  questionRow: { marginBottom: 10, backgroundColor: palette.gray100 },
  answerRow: { borderBottomColor: palette.gray350, borderBottomWidth: 1 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  small: { fontSize: 12, fontFamily: "Montserrat_300Light" },
  reply: { backgroundColor: palette.orange, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15 },
  answer: { color: palette.orange, fontSize: 12, fontFamily: "Montserrat_600SemiBold" }
})
