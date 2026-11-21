// TaskOffer.js
// An offer's details, opened from the inbox: the other party, the offer, the task's scheduled time, what
// either side can do next and, at the bottom, accepting (client) or editing (tasker) the offer. A client
// opening an offer whose task has a newly proposed time is asked to answer it. The route has the offer's
// id (offerId; useOpenTaskOffer opens it): the offer is loaded by it, shown at once when it was at hand,
// and refreshed.
import React, { useState } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import UserInfo from "../components/profile/UserInfo"
import FastImageComponent from "../components/media/FastImageComponent"
import DateTimePicker from "../components/dateTime/DateTimePicker"
import EditOfferModal from "../components/modals/EditOfferModal"
import PaymentModal from "../components/modals/PaymentModal"
import TaskConfirmedModal from "../components/modals/TaskConfirmedModal"
import OfferCard from "../components/taskOffer/OfferCard"
import CancellationNotice from "../components/taskOffer/CancellationNotice"
import ScheduledInfoBlock from "../components/taskOffer/ScheduledInfoBlock"
import TaskActionPanel from "../components/taskOffer/TaskActionPanel"
import OfferDecision from "../components/taskOffer/OfferDecision"
import useTaskOfferActions from "../hooks/taskOffer/useTaskOfferActions"
import useAcceptOffer from "../hooks/taskOffer/useAcceptOffer"
import useOfferPayment from "../hooks/taskOffer/useOfferPayment"
import useAppSettings from "../hooks/queries/useAppSettings"
import useProposedTimePrompt from "../hooks/myTasks/useProposedTimePrompt"
import { useOfferDetail } from "../hooks/queries/useDetails"
import useListSpinner from "../hooks/useListSpinner"
import { apiError } from "../Helpers/apiErrors"
import useUiStore from "../stores/uiStore"
import { calcStars } from "../Helpers"
import { getAcceptedTime } from "../Helpers/taskStatus"
import { translate } from "../Helpers/language.utils"
import { FEATURES } from "../Helpers/features"

import styles from "../styles/TaskOffer.style.js"
import useAuthStore from "../stores/authStore"
import useRoleColors from "../hooks/useRoleColors"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

// the task's category picture (or the role's default) with the screen's title
const TaskOfferHero = ({ task, forClient }) => {
  const category = task.sub_category_task
  const source = category
    ? { uri: forClient ? category.image : category.image_task_details }
    : forClient
      ? require("../assets/taskerprof.png")
      : require("../assets/taskoffertasker.png")
  return (
    <View>
      <View style={atoms.width100Percent}>
        <FastImageComponent style={styles.mainImage} source={source} />
      </View>
      <View style={local.titles}>
        <Text style={{ marginBottom: -5, ...styles.textBoldTop }}>{translate("taskOffer.taskOfferDetailstaskoffer")}</Text>
        <Text style={styles.textRegular}>{translate("taskOffer.detailstaskoffer")}</Text>
      </View>
    </View>
  )
}

const TaskOffer = ({ route }) => {
  const offerQuery = useOfferDetail(route?.params?.offerId)
  useListSpinner(!offerQuery.data && offerQuery.isFetching)

  // not loaded yet (the header and the spinner), or it could not be (why: the server's reason)
  if (!offerQuery.data) {
    return (
      <>
        <ActivityInd />
        <ScrollView contentContainerStyle={{ ...styles.containerStyle, backgroundColor: palette.white }} bounces={false}>
          <Header back transparent />
          {offerQuery.isError ? <Text style={local.failed}>{apiError(offerQuery.error)?.message || translate("taskOffer.weCouldntGetTaskOfferInfo")}</Text> : null}
        </ScrollView>
      </>
    )
  }
  return <TaskOfferBody offer={offerQuery.data} />
}

const TaskOfferBody = ({ offer }) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const colors = useRoleColors()
  const language = useUiStore((state) => state.language)
  const me = user.userData
  const forClient = userSelect === "CLIENT"

  const [agreed, setAgreed] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [canceledOffer, setCanceledOffer] = useState(false)
  // the accepted offer's confirmation, with the task's agreed time when it has one
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmedDate, setConfirmedDate] = useState(null)
  // the tasker's pick among the client's dates; an accepted time is fixed
  const [picked, setPicked] = useState(null)

  // a client answers a time the tasker proposed
  useProposedTimePrompt(forClient ? offer.task : null, offer.user)

  const accepted = getAcceptedTime(offer.task)
  const actions = useTaskOfferActions({ offerId: offer.id, acceptedDate: accepted, selectedDate: accepted || picked, onOfferCanceled: () => setCanceledOffer(true) })
  const onAccepted = (acceptedTime) => {
    setConfirmOpen(true)
    if (acceptedTime) setConfirmedDate(acceptedTime)
  }
  const acceptOffer = useAcceptOffer({ offerId: offer.id, agreed, onAccepted })
  // with payments on, accepting goes through paying the fee (FEATURES.payments)
  const payment = useOfferPayment({ offerId: offer.id, onPaid: onAccepted })
  const [paymentOpen, setPaymentOpen] = useState(false)
  const appSettings = useAppSettings()
  const other = forClient ? offer.user : offer.task.posted_by_user

  return (
    <>
      <ActivityInd />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ ...styles.containerStyle, backgroundColor: palette.white }}
        style={atoms.backgroundColorWhite}
        bounces={false}
      >
        <Header back transparent />
        <View style={{ ...styles.mainContent, backgroundColor: palette.white }}>
          <TaskOfferHero task={offer.task} forClient={forClient} />
          <UserInfo
            stars={calcStars(other, 1)}
            user={other}
            countTasks={forClient ? other.tasks_count_tasker : other.tasks_count_client}
            type={userSelect}
            onOpenProfile={() => navigation.navigate("TaskerProfile", { profile: other })}
          />
          <OfferCard offer={offer} forClient={forClient} language={language} />
          <CancellationNotice offer={offer} />
          <ScheduledInfoBlock offer={offer} accepted={accepted} language={language} color={forClient ? palette.blue : palette.orange} />
          <TaskActionPanel
            offer={offer}
            me={me}
            userSelect={userSelect}
            colors={colors}
            language={language}
            accepted={accepted}
            dates={{ selected: accepted || picked, init: accepted, selectable: !accepted, onSelect: setPicked }}
            canceled={canceledOffer}
            actions={{
              onAcceptDate: actions.doAcceptDate,
              onStart: () => actions.doStartTask("TASKER"),
              onComplete: actions.doCompleteTask,
              onCancel: actions.doCancelOffer,
              onProposeDate: () => setPickerOpen(true),
              onMessage: actions.goToMessageUser
            }}
          />
          <OfferDecision
            offer={offer}
            isClient={me.type === "CLIENT"}
            accepted={accepted}
            agreed={agreed}
            onAgree={setAgreed}
            onAccept={FEATURES.payments ? () => setPaymentOpen(true) : acceptOffer}
            onAcceptRevision={actions.doAcceptRevision}
            onRefuseRevision={actions.refuseRevise}
            onEdit={() => setEditOpen(true)}
          />
        </View>
      </ScrollView>
      <View>
        {FEATURES.payments ? (
          <PaymentModal
            paymentLink={payment.paymentLink}
            onRequestLink={payment.requestPaymentLink}
            visible={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            item={offer.task}
            offer={offer}
            fee={appSettings.settings.fee}
            confirmStart={false}
            onOpenPayment={payment.openPaymentLink}
            onVisibleChange={setPaymentOpen}
          />
        ) : null}
        <EditOfferModal taskOffer={offer} visible={editOpen} onClose={() => setEditOpen(false)} />
        <TaskConfirmedModal confirmedDate={confirmedDate} visible={confirmOpen} onClose={() => setConfirmOpen(false)} data={offer} />
        <DateTimePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onPick={actions.proposeNewTaskDate} />
      </View>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  titles: { position: "absolute", bottom: 5, left: 22 },
  failed: { marginTop: 140, paddingHorizontal: 20, fontSize: 16, fontFamily: "Montserrat_400Regular", textAlign: "center" }
})

export default TaskOffer
