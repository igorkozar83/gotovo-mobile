// TaskDetailsFinished.js
// A finished or canceled task: its steps, the other party with the agreed price, how it was canceled or
// how a dispute ended, when it was completed, the user's review and (for a client) posting it again.
import React from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import TaskStepper from "./TaskStepper"
import FinishedTaskButtons from "./FinishedTaskButtons"
import LeftDateRightTime from "./LeftDateRightTime"
import FinishedRating from "./FinishedRating"
import PartyCard from "../taskDetails/PartyCard"
import CancellationNotice from "../taskOffer/CancellationNotice"
import WideButton from "../ui/WideButton"
import useUiStore from "../../stores/uiStore"
import { calcStars, localPriceFixed, day, monthThree, year, hourMin } from "../../Helpers"
import { offerStatus, getOtherUser, getCompletedOffer, getCanceledTaskOffer, getCanceledDate } from "../../Helpers/taskStatus"
import { getFinishedTaskSteps } from "../../Helpers/taskSteps"
import { translate } from "../../Helpers/language.utils"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

// the other party: the tasker for the client who posted it, the client for the tasker
const partyOf = (task, meId) => (task.accepted_by_user && meId !== task.accepted_by_user.id ? task.accepted_by_user : task.posted_by_user) || {}

const TaskDetailsFinished = ({ taskDetails: task, userSelect, openTaskDetails, viewOffers, onReviewSubmitted }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const language = useUiStore((state) => state.language)

  const status = offerStatus(task)
  const party = partyOf(task, user.userData.id)
  const completed = getCompletedOffer(task)
  const canceled = getCanceledTaskOffer(task)
  const roleColor = userSelect === "CLIENT" ? palette.blue : palette.orange
  // when it was completed, or canceled (a task canceled before any offer has no completed offer)
  const when = (status === "canceled" && getCanceledDate(task)) || completed.updated_at

  return (
    <>
      <View style={atoms.padding20}>
        <View style={atoms.marginBottom20}>
          <Text accessibilityRole="header" style={styles.heading}>
            {task?.name}
          </Text>
        </View>
        <TaskStepper steps={getFinishedTaskSteps(task, userSelect, language)} lineColor={palette.blueBright} />
        <FinishedTaskButtons userSelect={userSelect} openTaskDetails={openTaskDetails} viewOffers={viewOffers} />
        {task.accepted_by_user ? (
          <Text accessibilityRole="header" style={[styles.title, { color: roleColor }]}>
            {userSelect === "CLIENT" ? translate("taskDetailsFinished.acceptedOffer") : translate("taskDetailsFinished.myOffer")}
          </Text>
        ) : null}
      </View>
      {task.accepted_by_user ? (
        <PartyCard
          taskName={task.name}
          user={getOtherUser(task, userSelect)}
          name={party.name + " " + party.last_name}
          stars={calcStars(party, 1)}
          count={userSelect !== "CLIENT" ? task.posted_by_user?.tasks_count_client : task.accepted_by_user.tasks_count_tasker}
          price={status === "finished" ? localPriceFixed(parseInt(completed.price)) : null}
          priceKind="finished"
        />
      ) : null}
      <View style={atoms.marginTop10}>
        <CancellationNotice offer={canceled} />
      </View>
      {task.dispute && (task.dispute.status === 2 || task.dispute.status === 3) ? (
        <View style={atoms.paddingHorizontal22}>
          <Text style={styles.warning}>
            {translate(task.dispute.status === 2 ? "taskDetailsFinished.theDisputeWasResolvedInFavourOfTheClient" : "taskDetailsFinished.theDisputeWasResolvedInFavourOfTheTasker")}
          </Text>
        </View>
      ) : null}
      <View style={[styles.block, task.accepted_by_user && { paddingTop: 20 }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: roleColor }]}>
          {status !== "canceled" ? translate("taskDetailsFinished.taskCompleted") : translate("taskDetailsFinished.taskCanceled")}
        </Text>
      </View>
      {when ? <LeftDateRightTime dateNumber={day(when, language)} dateText={monthThree(when, language)} year={year(when)} time={hourMin(when)} /> : null}
      <FinishedRating userSelect={userSelect} task={task} onReviewSubmitted={onReviewSubmitted} />
      <View style={styles.footer}>
        {userSelect === "CLIENT" ? (
          <WideButton
            text={translate("common.postThisTaskAgain")}
            onPress={() => navigation.navigate("PostTask", { repost: task.id })}
            color={palette.blueDark}
            textStyle={atoms.fontSize18}
            icon={require("../../assets/icon2.png")}
            iconStyle={styles.buttonIcon}
          />
        ) : null}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  heading: { fontFamily: "Montserrat_700Bold", fontSize: 22 },
  block: { marginBottom: 20, paddingHorizontal: 20 },
  footer: { marginBottom: 50, paddingHorizontal: 20 },
  buttonIcon: { aspectRatio: 1, width: 18, height: 18 },
  title: { fontSize: 12, fontFamily: "Montserrat_700Bold" },
  warning: { fontFamily: "Montserrat_600SemiBold", color: palette.redSoft, fontSize: small ? 10 : 12, marginVertical: 20 }
})

export default TaskDetailsFinished
