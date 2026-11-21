// TaskQuestions.js
// The questions asked on a task and the client's answers (Q:/A:), each with its picture if it has one.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import TitleWithBorder from "../ui/TitleWithBorder"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const QuestionRow = ({ question, onOpenImage }) => {
  const isAnswer = question.user_id === question.task.posted_by
  return (
    <View style={[styles.row, isAnswer ? { marginBottom: 15 } : {}]}>
      <Text style={styles.text}>{translate(isAnswer ? "taskQuestions.a" : "taskQuestions.q")}:</Text>
      <View>
        <Text style={styles.text}>{question.question}</Text>
        {question.image ? (
          <View style={atoms.flexDirectionRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={translate("common.openPhoto")} onPress={() => onOpenImage(question.image)}>
              <FastImageComponent contentFit="cover" source={question.image} style={styles.image} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const TaskQuestions = ({ questions, onOpenImage }) => (
  <>
    {questions.length ? (
      <View style={atoms.marginBottom10}>
        <TitleWithBorder title={"taskQuestions.questionsAnswers"} />
      </View>
    ) : null}
    <View style={styles.question}>
      {questions.map((question, index) => (
        <QuestionRow key={`task-question-${index}`} question={question} onOpenImage={onOpenImage} />
      ))}
    </View>
  </>
)

const styles = StyleSheet.create({
  question: { marginBottom: 10, paddingRight: 30 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  text: { marginRight: 10, fontFamily: "Montserrat_700Bold", fontSize: 16, color: palette.ink },
  image: { width: 100, height: 90, borderRadius: 5, marginRight: 5 }
})

export default TaskQuestions
