// AskQuestionModal.js
// A tasker's question about a task to its client, with an optional picture. The modal steps aside for
// the picture picker and comes back after it (open); a posted question is confirmed.
import React, { useLayoutEffect, useRef, useState } from "react"
import { ScrollView, Platform, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import GradientModal from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact } from "../sheets/SheetParts"
import { QuestionField, SinglePicture } from "../question/QuestionParts"
import Button from "../ui/Button"
import ActivityInd from "../ui/ActivityInd"
import QuestionPostedModal from "./QuestionPostedModal"
import NewPictureAndVideoModal from "./NewPictureAndVideoModal"
import useQuestionForm from "../../hooks/questions/useQuestionForm"
import useCreateQuestion from "../../hooks/questions/useCreateQuestion"
import useChatKeyboard from "../../hooks/chat/useChatKeyboard"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const clientOf = (task) => (task.posted_by_user ? task.posted_by_user.full_name : task.posted_by ? task.posted_by.full_name : "")

const AskQuestionModal = ({ onClose, visible, onReopen, taskDetails }) => {
  const form = useQuestionForm()
  const [posted, setPosted] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const keyboard = useChatKeyboard(() => {})

  const scroll = useRef()
  const [focused, setFocused] = useState(false)
  useLayoutEffect(() => {
    if (focused && scroll.current) scroll.current.scrollToEnd({ animated: true })
  }, [focused])

  const sendQuestion = useCreateQuestion({
    onSuccess: () => {
      form.clear()
      setPosted(true)
      onClose()
    }
  })

  const send = () => {
    if (form.validated("Task question create error")) sendQuestion({ question: form.text }, taskDetails.id, form.image)
  }

  return (
    <>
      <ActivityInd />
      <GradientModal
        visible={visible}
        onClose={onClose}
        onRequestClose={onClose}
        closeStyle={styles.closeButton}
        outerStyle={keyboard.open && { paddingVertical: 20 }}
        avoidingStyle={[keyboard.open && { marginTop: 20 }]}
        cardStyle={keyboard.open && Platform.OS === "ios" && { marginBottom: 150 }}
      >
        <ScrollView scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" ref={scroll}>
          <SheetIcon source={require("../../assets/questionbig.png")} />
          <SheetTitle>{"common.askAQuestion"}</SheetTitle>
          <Fact label={"common.toClient"}>{clientOf(taskDetails)}</Fact>
          <Fact label={"common.taskName"}>{taskDetails.name}</Fact>
          <QuestionField
            label={"askQuestionModal.yourQuestion"}
            style={atoms.marginBottom30}
            value={form.text}
            onChange={form.setText}
            onFocus={() => {
              setFocused(true)
              setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 500)
            }}
            onBlur={() => setFocused(false)}
          />
          <SinglePicture
            image={form.image}
            style={atoms.marginBottom30}
            addStyle={atoms.maxWidth33Percent}
            onRemove={form.removeImage}
            onAdd={() => {
              onClose()
              setPickerOpen(true)
            }}
          />
          <Button onPress={send} background={palette.white} textColor={palette.black} title={"common.askAQuestion"}>
            <MaterialCommunityIcons name="comment-question-outline" size={20} color={palette.orange} />
          </Button>
        </ScrollView>
      </GradientModal>
      <QuestionPostedModal
        title={"YOUR QUESTION HAS BEEN POSTED"}
        message={"You will be notified when the client posts an answer."}
        visible={posted}
        onClose={() => setPosted(false)}
      />
      <NewPictureAndVideoModal
        visible={pickerOpen}
        onClose={() => {
          setPickerOpen(false)
          onReopen()
        }}
        onPick={form.setImage}
        onlyImages={true}
      />
    </>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  content: { borderRadius: 20, overflow: "hidden", padding: 20 }
})

export default AskQuestionModal
