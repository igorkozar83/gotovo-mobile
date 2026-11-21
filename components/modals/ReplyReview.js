// ReplyReview.js
// Replying to a received review: who wrote it, for which task, its stars and message, and the reply.
import React, { useRef } from "react"
import { Text, ScrollView, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact, SheetDivider } from "../sheets/SheetParts"
import { ExplanationField } from "../offer/OfferFields"
import StarRow from "../reviews/StarRow"
import Button from "../ui/Button"
import useReviewReply from "../../hooks/reviews/useReviewReply"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// data: { taskId, userName, taskName, rate, message }; type: the user's role (the reviewer has the other)
const ReplyReview = ({ onClose, visible, data, type }) => {
  const form = useReviewReply(data, onClose)
  const scroll = useRef(null)

  return (
    <GradientModal
      visible={visible}
      onClose={onClose}
      onRequestClose={onClose}
      colors={type === "CLIENT" ? BLUE : ORANGE}
      closeStyle={styles.close}
      outerStyle={atoms.paddingVertical20}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ref={scroll}
      >
        <SheetIcon source={require("../../assets/submiticon.png")} />
        <SheetTitle>{"replyReview.replyToReview"}</SheetTitle>
        {/* (name and last name, cut with "…" where they do not fit) */}
        <Fact label={type === "CLIENT" ? "common.tasker" : "common.client"} textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}>
          {data.userName}
        </Fact>
        <Fact label={"common.taskName"}>{data.taskName}</Fact>
        <StarRow value={data.rate} size={32} style={atoms.marginVertical10} />
        <Text style={styles.label}>{data.message}</Text>
        <SheetDivider gap={20} />
        <ExplanationField
          label={"replyReview.yourReplyToTheReview"}
          value={form.message}
          onChange={form.setMessage}
          onFocus={() => setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 500)}
        />
        <Button onPress={form.submit} background={palette.white} textColor={palette.blueDark} title={"common.reply"}>
          <AntDesign name="check" size={20} color={palette.blueDark} />
        </Button>
      </ScrollView>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  close: { right: 5, top: 10, zIndex: 2 },
  content: { flexGrow: 1, borderRadius: 20, overflow: "hidden", padding: 20 },
  label: { fontSize: 18, fontFamily: "Montserrat_400Regular", color: palette.white }
})

export default ReplyReview
