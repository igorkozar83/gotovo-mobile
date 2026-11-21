// ReviewReceived.js
// Someone reviewed the user: who, for which task, the stars and message. The user can rate them back
// (unless already done), reply to the review, or just close it; each closes the modal and shows the
// finished tasks.
import React, { useState } from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AntDesign, FontAwesome } from "@expo/vector-icons"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact, SheetDivider } from "../sheets/SheetParts"
import StarRow from "../reviews/StarRow"
import Button from "../ui/Button"
import SubmitReviewPopup from "./SubmitReviewPopup"
import ReplyReview from "./ReplyReview"
import { getUserReview } from "../../Helpers/taskStatus"
import { translate } from "../../Helpers/language.utils"
import { useTaskDetail } from "../../hooks/queries/useDetails"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const WhiteButton = ({ text, onPress, color = palette.black, icon }) => (
  <Button onPress={onPress} background={palette.white} textColor={color} title={translate(text)}>
    {icon}
  </Button>
)

const ONE_LINE = { numberOfLines: 1, ellipsizeMode: "tail" }

// data: { userName, taskName, rate, message, reviewed, reviews, alreadyRated, ... }; type: the user's role
const ReviewReceived = ({ onClose, visible, data, type }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const [rating, setRating] = useState(false)
  const [replying, setReplying] = useState(false)

  // the notification's data is from when it was sent: the task, loaded as the modal opens, tells whether the user
  // has rated back or replied since. Both buttons wait for it, so neither is offered once done; a task that could
  // not be loaded offers neither (rating back stays in My Tasks)
  const task = useTaskDetail(visible ? data.taskId : null)
  const me = user.userData.id
  const known = !data.taskId || (task.isSuccess && !task.isFetching)
  const reviewedBack = data.reviewed || data.alreadyRated || !!getUserReview({ reviews: data.reviews }, me) || !!(task.data && getUserReview(task.data, me))
  const repliedTo = !!task.data?.reviews?.some((review) => review.receiver_user_id === me && review.reply)
  const mayRate = known && !reviewedBack
  const mayReply = known && !repliedTo
  const close = () => {
    navigation.navigate("MyTasks", { type: "finished" })
    onClose()
  }
  const star = <FontAwesome name="star-o" size={20} color={palette.black} />

  return (
    <>
      <GradientModal
        visible={visible}
        onClose={close}
        onRequestClose={close}
        colors={type === "CLIENT" ? BLUE : ORANGE}
        closeStyle={styles.close}
        outerStyle={styles.sheet}
        keyboardAvoiding={false}
      >
        <ScrollView automaticallyAdjustKeyboardInsets={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SheetIcon source={require("../../assets/submiticon.png")} style={atoms.marginTop10} />
          <SheetTitle style={atoms.marginVertical10}>{"reviewReceived.reviewReceived"}</SheetTitle>
          {/* (name and last name, cut with "…" where they do not fit) */}
          <Fact label={type === "CLIENT" ? "common.tasker" : "common.client"} textProps={ONE_LINE}>
            {data.userName}
          </Fact>
          <Fact label={"common.taskName"}>{data.taskName}</Fact>
          <StarRow value={data.rate} size={32} style={atoms.marginVertical10} />
          <Text style={styles.label}>{data.message}</Text>
          <SheetDivider gap={10} />
          {mayRate ? (
            <WhiteButton
              text={type === "CLIENT" ? "reviewReceived.rateTasker" : "reviewReceived.rateClient"}
              icon={star}
              onPress={() => {
                close()
                setRating(true)
              }}
            />
          ) : null}
          <View style={styles.reply}>
            {mayReply ? (
              <WhiteButton
                text={"reviewReceived.replyToReview"}
                icon={star}
                onPress={() => {
                  close()
                  setReplying(true)
                }}
              />
            ) : null}
          </View>
          <WhiteButton text={"common.ok"} color={palette.blueDark} icon={<AntDesign name="check" size={20} color={palette.blueDark} />} onPress={close} />
        </ScrollView>
      </GradientModal>
      <SubmitReviewPopup onClose={setRating} visible={rating} data={data} type={type} />
      <ReplyReview onClose={() => setReplying(false)} visible={replying} data={data} type={type} />
    </>
  )
}

const styles = StyleSheet.create({
  sheet: { paddingTop: 20, paddingBottom: 20 },
  reply: { marginTop: 10, marginBottom: 20 },
  close: { right: "3%", top: "3%", zIndex: 10 },
  content: { flexGrow: 1, borderRadius: 20, padding: 20, overflow: "hidden" },
  label: { fontSize: 18, fontFamily: "Montserrat_400Regular", color: palette.white }
})

export default ReviewReceived
