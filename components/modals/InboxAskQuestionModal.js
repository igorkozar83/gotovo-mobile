// InboxAskQuestionModal.js
// Asking from the inbox: the tasker picks one of the tasks they asked about before (the first one
// to start with) and writes a new question. A posted question is confirmed.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native"
import OutsidePressHandler from "react-native-outside-press"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import GradientModal from "../sheets/GradientModal"
import { SheetIcon, SheetTitle } from "../sheets/SheetParts"
import { QuestionField } from "../question/QuestionParts"
import Button from "../ui/Button"
import InboxDropDown from "../inbox/InboxDropDown"
import QuestionPostedModal from "./QuestionPostedModal"
import useQuestionForm from "../../hooks/questions/useQuestionForm"
import useCreateQuestion from "../../hooks/questions/useCreateQuestion"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const choiceOf = (task) => ({ name: task.name, id: task.id, posted_by_user: task.posted_by })

const InboxAskQuestionModal = ({ onClose, visible, questions }) => {
  const form = useQuestionForm()
  const [posted, setPosted] = useState(false)
  const [selected, setSelected] = useState({})
  // bumped to close the task drop-down
  const [closeDropDown, setCloseDropDown] = useState(0)

  const scroll = useRef(null)
  const [focused, setFocused] = useState(false)
  useLayoutEffect(() => {
    if (focused && scroll.current) scroll.current.scrollToEnd({ animated: true })
  }, [focused])

  useEffect(() => {
    if (questions && questions.length) setSelected(choiceOf(questions[0]))
  }, [questions])

  const sendQuestion = useCreateQuestion({
    onSuccess: () => {
      setPosted(true)
      onClose()
      form.clear()
    }
  })

  const send = () => {
    if (form.validated("Task question create error")) sendQuestion({ question: form.text }, selected.id, null)
  }

  return (
    <>
      <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} closeStyle={styles.closeButton} outerStyle={styles.sheet} keyboardAvoiding={false}>
        <ScrollView scrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" ref={scroll}>
          <SheetIcon source={require("../../assets/questionbig.png")} />
          <SheetTitle>{"common.askAQuestion"}</SheetTitle>
          <View style={atoms.marginBottom20}>
            <Text style={styles.label}>{translate("common.toClient")}</Text>
            <Text style={[styles.value, styles.taskLabel]}>{selected.posted_by_user ? selected.posted_by_user.full_name : ""}</Text>
          </View>
          <View style={atoms.marginBottom30}>
            <Text style={[styles.label, atoms.marginBottomMinus5]}>{translate("common.taskName")}</Text>
            <OutsidePressHandler style={atoms.zIndex90} onOutsidePress={() => setCloseDropDown((count) => count + 1)}>
              <InboxDropDown close={closeDropDown} title={selected.name}>
                {questions.map((task, index) => (
                  <Pressable
                    key={`ask-question-task-${index}`}
                    onPress={() => {
                      setSelected(choiceOf(task))
                      setCloseDropDown((count) => count + 1)
                    }}
                  >
                    <Text style={[styles.value, styles.taskOption]}>{task.name}</Text>
                  </Pressable>
                ))}
              </InboxDropDown>
            </OutsidePressHandler>
          </View>
          <View style={styles.underline}></View>
          <QuestionField
            label={"inboxAskQuestionModal.yourQuestion"}
            style={atoms.marginBottom30}
            value={form.text}
            onChange={form.setText}
            onFocus={() => {
              setFocused(true)
              setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 500)
            }}
            onBlur={() => setFocused(false)}
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
    </>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "3%", top: "3%" },
  sheet: { paddingTop: 20, paddingBottom: 20 },
  taskLabel: { color: palette.white, marginVertical: 10 },
  taskOption: { color: palette.black, marginVertical: 3, paddingLeft: 10 },
  underline: { width: "100%", backgroundColor: palette.white, height: 1, marginBottom: 30 },
  content: { borderRadius: 20, overflow: "hidden", padding: 20 },
  label: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: palette.white },
  value: { lineHeight: 18, textTransform: "uppercase", fontSize: 16, fontFamily: "Montserrat_500Medium" }
})

export default InboxAskQuestionModal
