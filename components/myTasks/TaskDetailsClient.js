// TaskDetailsClient.js
// The client's part of an active task's details: the original task and the received offers, the
// accepted offer with its price, a revision to answer, the scheduled time and reposting a finished task.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import ButtonWithPicture from "../ui/ButtonWithPicture"
import WideButton from "../ui/WideButton"
import { AcceptedOfferCard, RevisionToAnswer } from "./ClientTaskParts"
import ScheduledTimeRow from "../taskDetails/ScheduledTimeRow"
import { translate } from "../../Helpers/language.utils"
import { getOtherUser, getEditedOffer, getClientTaskPrice, isScheduled } from "../../Helpers/taskStatus"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const SHOWS_OFFERS = ["received", "disputed", "revised", "finished", "accepted", "scheduled", "startedByClient"]
const HAS_ACCEPTED_OFFER = ["scheduled", "revised", "completion", "disputed", "accepted", "startedByClient"]
const CAN_MESSAGE = ["scheduled", "revised", "accepted", "disputed", "startedByClient"]
const CAN_REPOST = ["disputed", "finished", "canceled"]

const TaskDetailsClient = ({ task, taskProgress, language, openTaskDetails, viewOffers, goToMessageUser, doAcceptRevision, doDeclineRevision }) => {
  const navigation = useNavigation()

  return (
    <>
      <View style={atoms.padding20}>
        <ButtonWithPicture
          onPress={() => openTaskDetails(true)}
          text={translate("common.viewOriginalTask")}
          icon={require("../../assets/icon2.png")}
          backgroundColor={palette.gray600}
        />
        {!task.offers.length ? <Text style={styles.waiting}>{translate("taskDetailsClient.waitingForTaskersToSendOffers")}</Text> : null}
        {SHOWS_OFFERS.includes(taskProgress) ? (
          <WideButton
            text={translate("taskDetailsClient.viewReceivedOffers")}
            onPress={viewOffers}
            style={atoms.marginBottom40}
            icon={require("../../assets/icon1.png")}
            iconStyle={styles.offersIcon}
          />
        ) : null}
      </View>
      {HAS_ACCEPTED_OFFER.includes(taskProgress) ? (
        <>
          <View style={styles.buttons}>
            <Text accessibilityRole="header" style={styles.blueTitle}>
              {translate("taskDetailsClient.acceptedOffer")}
            </Text>
          </View>
          <AcceptedOfferCard taskName={task.name} tasker={getOtherUser(task, "CLIENT")} price={getClientTaskPrice(task, taskProgress)} />
          {CAN_MESSAGE.includes(taskProgress) ? (
            <View style={atoms.margin20}>
              <ButtonWithPicture
                onPress={goToMessageUser}
                text={translate("common.sendMessage")}
                icon={require("../../assets/sendmessage.png")}
                backgroundColor={palette.gray600}
              />
            </View>
          ) : null}
          {taskProgress === "revised" ? <RevisionToAnswer revision={getEditedOffer(task)} language={language} onAccept={doAcceptRevision} onRefuse={doDeclineRevision} /> : null}
          {isScheduled(task) || taskProgress === "startedByClient" ? (
            <View style={styles.scheduled}>
              <Text accessibilityRole="header" style={styles.blueTitle}>
                {translate("taskDetailsClient.taskScheduledFor")}
              </Text>
            </View>
          ) : null}
          <View style={[task.status === 8 || task.status === 9 ? { paddingBottom: 50 } : null]}>
            {task.times
              .filter((time) => time.status === 1)
              .map((time) => (
                <ScheduledTimeRow key={`task-details-time-${time.id}`} time={time} language={language} />
              ))}
          </View>
        </>
      ) : null}
      {CAN_REPOST.includes(taskProgress) ? (
        <View style={styles.footer}>
          <WideButton
            text={translate("common.postThisTaskAgain")}
            onPress={() => navigation.navigate("PostTask", { repost: task.id })}
            color={palette.blueDark}
            textStyle={atoms.fontSize18}
            icon={require("../../assets/icon2.png")}
            iconStyle={styles.buttonIcon}
          />
          {task.dispute ? <Text style={styles.dispute}>{translate("taskDetailsClient.taskIsCurrentlyUnderDisputeYou")}</Text> : null}
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  offersIcon: { height: 12, width: 18 },
  buttons: { paddingHorizontal: 20, marginBottom: 10 },
  footer: { paddingHorizontal: 20, marginBottom: 50 },
  scheduled: { marginBottom: 20, paddingTop: 20, paddingHorizontal: 20 },
  buttonIcon: { aspectRatio: 1, width: 18, height: 18 },
  waiting: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, marginBottom: 20 },
  blueTitle: { fontSize: 12, color: palette.blue, fontFamily: "Montserrat_700Bold" },
  dispute: { fontFamily: "Montserrat_600SemiBold", color: palette.redSoft, fontSize: 12, marginTop: 10 }
})

export default TaskDetailsClient
