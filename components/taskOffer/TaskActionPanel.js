// TaskActionPanel.js
// What can be done with an offer's task, for those taking part in it (not once the offer is canceled):
// the tasker picks or accepts one of the client's dates, proposes another (flexible dates), starts the
// task and claims it complete; both can message each other once the offer is accepted; the client can
// cancel the task, the tasker their offer.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import Button from "../ui/Button"
import FastImageComponent from "../media/FastImageComponent"
import { DateRow, DateRadio, spokenTime } from "../taskDetails/DateChoice"
import { isDayReached } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// (contain: a picture that is not square, the check, is never cut to the square box)
const ButtonIcon = ({ source, style }) => (
  <View>
    <FastImageComponent contentFit="contain" style={[styles.icon, style]} source={source} />
  </View>
)

/**
 * offer: the shown offer; me: the user's data; accepted: the task's accepted time (false without one)
 * dates: { selected, init, selectable, onSelect } the tasker's choice among the proposed dates
 * canceled: the offer was just canceled; actions: onAcceptDate, onStart, onComplete, onCancel,
 * onProposeDate, onMessage
 */
const TaskActionPanel = ({ offer, me, userSelect, colors, language, accepted, dates, canceled, actions }) => {
  const navigation = useNavigation()
  const task = offer.task
  const tasker = me.type !== "CLIENT"
  const startsByNow = accepted && isDayReached(accepted.date)
  // only the tasker whose offer the client accepted starts and completes the task (a refused offer's tasker
  // sees the task's time, not its buttons)
  const myOffer = offer.user_id === me.id
  const mayStart = myOffer && offer.status === 1

  if (!(task.offered || task.posted_by === me.id) || offer.status === 4) return null

  return (
    <View style={styles.panel}>
      {!accepted && tasker ? (
        <>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.textColor }]}>
            {translate("taskActionPanel.clientProposedDates")}
          </Text>
          {task.status === 1 || task.status === 0
            ? task.times.map((time, index) => (
                <DateRow key={`task-details-times-proposed-list-${index}`} time={time} language={language}>
                  {task.status === 1 ? (
                    <DateRadio
                      accessibilityLabel={spokenTime(time, language)}
                      selected={(dates.selected && dates.selected.id === time.id) || (dates.init && dates.init.id === time.id)}
                      onPress={dates.selectable ? () => dates.onSelect(time) : null}
                      color={colors.bgColor}
                    />
                  ) : null}
                </DateRow>
              ))
            : null}
        </>
      ) : null}

      {!accepted && offer.user_id === me.id && tasker && task.status === 1 ? (
        <View style={styles.dates}>
          <Button title={"taskActionPanel.acceptDate"} onPress={actions.onAcceptDate}>
            <ButtonIcon source={require("../../assets/acceptdate.png")} />
          </Button>
        </View>
      ) : null}

      {startsByNow && mayStart && (task.status === 1 || task.status === 0) && !canceled && tasker ? (
        <View style={atoms.marginVertical20}>
          <Button title={translate("taskActionPanel.startTask")} onPress={actions.onStart}>
            <ButtonIcon source={require("../../assets/gotitbutton.png")} style={atoms.top4} />
          </Button>
        </View>
      ) : null}

      {startsByNow && myOffer && task.status === 9 && !canceled && tasker ? (
        <View style={atoms.marginVertical20}>
          <Button title={translate("taskActionPanel.claimTaskComplete")} onPress={actions.onComplete}>
            <ButtonIcon source={require("../../assets/gotitbutton.png")} />
          </Button>
        </View>
      ) : null}

      {task.flexible_dates && !accepted && task.status === 1 && tasker ? (
        <>
          <View style={atoms.marginBottom10}>
            <Button onPress={actions.onProposeDate} background={palette.gray600} title={"taskActionPanel.proposeNewDate"}>
              <ButtonIcon source={require("../../assets/adddate.png")} />
            </Button>
          </View>
          <Text style={styles.clientNote}>{translate("taskActionPanel.clientIndicatedThatDatesAreFlexible")}.</Text>
        </>
      ) : null}

      {offer.status === 1 ? (
        <View style={[atoms.marginBottom20, !tasker && { marginTop: 20 }]}>
          <Button background={palette.gray600} title={translate("common.sendMessage")} onPress={actions.onMessage}>
            <ButtonIcon source={require("../../assets/sendmessage.png")} style={atoms.top7} />
          </Button>
        </View>
      ) : null}

      {/* (only a sent or an accepted offer: a refused, replaced, started or finished one has nothing to cancel) */}
      {[0, 1].includes(offer.status) && !canceled && userSelect !== "TASKER" ? (
        <Pressable
          android_ripple={{ color: palette.blue, borderless: false }}
          onPress={() => (offer.status === 0 ? navigation.navigate("MyTasks", { taskdetails: task.id }) : actions.onCancel())}
        >
          <Text style={[styles.link, styles.cancelText]}>
            {translate(userSelect === "CLIENT" ? "taskActionPanel.doYouNeedToCancelThisTask" : "taskActionPanel.doYouNeedToCancelThisOffer")}
          </Text>
        </Pressable>
      ) : null}

      {userSelect === "TASKER" && offer.status === 0 && !canceled ? (
        <Pressable onPress={actions.onCancel}>
          <Text style={[styles.link, atoms.fontSize14]}>{translate("taskActionPanel.somethingCameUpCancelOffer")}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 20, marginBottom: 20 },
  dates: { marginBottom: 20, marginTop: 10 },
  cancelText: { fontSize: 16, marginTop: 20 },
  clientNote: { fontFamily: "Montserrat_500Medium", fontSize: 16, marginBottom: 20 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 12, marginTop: 20 },
  icon: { width: 18.0, height: 18.0 },
  link: { fontFamily: "Montserrat_700Bold", textAlign: "center" }
})

export default TaskActionPanel
