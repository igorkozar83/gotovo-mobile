// AnswerQuestionModal.js
// The client answering a tasker's question on their task, with an optional picture. The modal steps
// aside for the picture picker and comes back after it. After sending (or a failed request) the
// question list is refreshed (callback) and the form is cleared.
import React, { useRef, useState } from "react"
import { View, ScrollView, Platform, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import GradientModal, { BLUE } from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact } from "../sheets/SheetParts"
import { QuestionField, SinglePicture } from "../question/QuestionParts"
import Button from "../ui/Button"
import ActivityInd from "../ui/ActivityInd"
import NewPictureAndVideoModal from "./NewPictureAndVideoModal"
import useQuestionForm from "../../hooks/questions/useQuestionForm"
import useCreateQuestion from "../../hooks/questions/useCreateQuestion"
import useChatKeyboard from "../../hooks/chat/useChatKeyboard"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const AnswerQuestionModal = ({ onClose, visible, onVisibleChange, task, onAnswered, question }) => {
  const form = useQuestionForm()
  const [pickerOpen, setPickerOpen] = useState(false)
  const keyboard = useChatKeyboard(() => {})

  // the answer field is scrolled into view when focused
  const scroll = useRef(null)
  const fieldY = useRef(0)
  const showField = () => setTimeout(() => scroll.current && scroll.current.scrollTo({ x: 0, y: fieldY.current + 50, animated: true }), 100)

  const done = () => {
    onAnswered()
    form.clear()
    onClose()
  }
  const sendAnswer = useCreateQuestion({ onSuccess: done, onFailed: done })

  const send = () => {
    if (!form.validated("Send question error")) return
    onClose()
    sendAnswer({ question: form.text }, task.id, form.image, undefined, task.questions[0].id)
  }

  const asker = task.questions && task.questions.length ? task.questions[0].user.full_name : ""
  return (
    <>
      <ActivityInd />
      <GradientModal
        visible={visible}
        onClose={onClose}
        onRequestClose={onClose}
        colors={BLUE}
        closeStyle={styles.closeButton}
        outerStyle={styles.sheet}
        dismissKeyboardOnTap={false}
      >
        <ScrollView
          bounces={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          ref={scroll}
          keyboardShouldPersistTaps={"handled"}
          keyboardDismissMode={"none"}
        >
          <View style={[styles.content, Platform.OS === "ios" && keyboard.open && { marginBottom: 150 }]}>
            <SheetIcon source={require("../../assets/questionbig.png")} style={atoms.marginTop10} />
            <SheetTitle style={styles.title}>{"answerQuestionModal.answerQuestion"}</SheetTitle>
            <Fact label={"answerQuestionModal.toTasker"}>{asker}</Fact>
            <Fact label={"common.taskName"}>{task.name}</Fact>
            <Fact label={"answerQuestionModal.question"}>{question}</Fact>
            <QuestionField
              label={"answerQuestionModal.yourAnswer"}
              style={atoms.marginBottom10}
              numberOfLines={4}
              value={form.text}
              onChange={form.setText}
              onLayout={(event) => {
                fieldY.current = event.nativeEvent.layout.y
              }}
              onFocus={showField}
            />
            <SinglePicture
              image={form.image}
              style={atoms.marginBottom10}
              onRemove={form.removeImage}
              onAdd={() => {
                onClose()
                setPickerOpen(true)
              }}
            />
            <Button onPress={send} background={palette.white} textColor={palette.blueDark} title={"answerQuestionModal.sendReply"}>
              <MaterialCommunityIcons name="comment-question-outline" size={20} color={palette.blue} />
            </Button>
          </View>
        </ScrollView>
      </GradientModal>
      <NewPictureAndVideoModal
        visible={pickerOpen}
        onClose={() => {
          setPickerOpen(false)
          onVisibleChange(true)
        }}
        onPick={form.setImage}
        onlyImages={true}
      />
    </>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: 5, top: 10 },
  sheet: { paddingTop: 20, paddingBottom: 20 },
  scroll: { borderRadius: 20, overflow: "hidden" },
  title: { fontSize: 22, marginVertical: 10 },
  content: { borderRadius: 20, overflow: "hidden", padding: 25 }
})

export default AnswerQuestionModal
