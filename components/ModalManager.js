// ModalManager.js
// Renders the app-wide modals: the alert, login / register / reset password, and the task modals that
// notifications and screens open through stores/modalStore.
import React from "react"
import { View } from "react-native"

import useModalStore from "../stores/modalStore"
import useAuthStore from "../stores/authStore"
import { useAppSettingsQuery } from "../hooks/queries/useAppSettings"

import Auth from "./Auth"
import Register from "./modals/Register"
import ResetPass from "./modals/ResetPass"
import AlertModal from "./modals/AlertModal"
import OfferSentEditModal from "./modals/OfferSentEditModal"
import NewMessageReceived from "./modals/NewMessageReceived"
import TaskCompleteConfirmModal from "./modals/TaskCompleteConfirmModal"
import TaskDisputeModal from "./modals/TaskDisputeModal"
import NewTimeProposed from "./modals/NewTimeProposed"
import ReviewReceived from "./modals/ReviewReceived"
import CanceledTaskModal from "./modals/CanceledTaskModal"
import CanceledTaskByTaskerModal from "./modals/CanceledTaskByTaskerModal"
import ScheduledModal from "./modals/ScheduledModal"
import DisputedModal from "./modals/DisputedModal"
import TaskConfirmedModal from "./modals/TaskConfirmedModal"
import TaskStartedModal from "./modals/TaskStartedModal"
import SwitchToTaskerModal from "./modals/SwitchToTaskerModal"
import { hideAlert } from "../stores/alerts"
import { atoms } from "../styles/atoms"
import useUiStore, { textsKey } from "../stores/uiStore"

// what the modals got before any data was set (they read fields of it while closed)
const EMPTY_TASK_DATA = { acceptedTime: {}, postedBy: {}, posted_by: {}, accepted_by: {}, acceptedBy: {}, task: {} }
const EMPTY_OFFER_SENT = { acceptedBy: {}, acceptedTime: {}, postedBy: {}, task: {}, editedOffer: {} }

const ModalManager = () => {
  // drawn again with new texts
  useUiStore(textsKey)
  const appSettings = useAppSettingsQuery()
  const userType = useAuthStore((state) => state.user?.userData?.type)
  const modals = useModalStore((state) => state.modals)
  const mainAlert = useModalStore((state) => state.mainAlert)
  const { openModal, closeModal } = useModalStore.getState()

  const isOpen = (name) => Boolean(modals[name] && modals[name].open)
  const dataOf = (name, empty = {}) => (modals[name] && modals[name].data) || empty

  // the confirm-complete and dispute modals pass the same task to each other
  const confirmData = dataOf("confirmComplete", EMPTY_TASK_DATA)
  const disputeData = dataOf("dispute", EMPTY_TASK_DATA)
  const timeAccepted = dataOf("timeAccepted", { data: { task: {}, user: {} }, confirmedDate: null })

  return (
    <View>
      <TaskCompleteConfirmModal
        data={confirmData}
        onClose={() => closeModal("confirmComplete")}
        visible={isOpen("confirmComplete")}
        onDispute={() => {
          closeModal("confirmComplete")
          openModal("dispute", confirmData)
        }}
      />
      <TaskStartedModal data={dataOf("startedTask", EMPTY_TASK_DATA)} onClose={() => closeModal("startedTask")} visible={isOpen("startedTask")} />
      <TaskDisputeModal
        onSubmitted={() => {
          closeModal("confirmComplete")
          closeModal("dispute")
        }}
        data={disputeData}
        onVisibleChange={(open) => (open ? openModal("dispute", disputeData) : closeModal("dispute"))}
        onClose={() => {
          closeModal("dispute")
          openModal("confirmComplete", disputeData)
        }}
        visible={isOpen("dispute")}
        onShow={() => {
          closeModal("confirmComplete")
          openModal("dispute", disputeData)
        }}
        onHide={() => {
          closeModal("dispute")
          closeModal("confirmComplete")
          closeModal("offerSent")
        }}
      />
      <NewMessageReceived message={dataOf("newMessage")} visible={isOpen("newMessage")} onClose={() => closeModal("newMessage")} />
      <NewTimeProposed data={dataOf("newTime")} visible={isOpen("newTime")} onClose={() => closeModal("newTime")} />
      <OfferSentEditModal visible={isOpen("offerSent")} onClose={() => closeModal("offerSent")} data={dataOf("offerSent", EMPTY_OFFER_SENT)} />
      <ReviewReceived visible={isOpen("reviewReceived")} onClose={() => closeModal("reviewReceived")} data={dataOf("reviewReceived")} type={userType} />
      <CanceledTaskByTaskerModal visible={isOpen("canceledByTasker")} onClose={() => closeModal("canceledByTasker")} data={dataOf("canceledByTasker", { task: {} })} />
      <CanceledTaskModal visible={isOpen("canceledTask")} onClose={() => closeModal("canceledTask")} data={dataOf("canceledTask", { task: {} })} />
      <ScheduledModal
        visible={isOpen("scheduled")}
        data={dataOf("scheduled", { time: {}, user: {} })}
        currency={appSettings.data ? appSettings.data.settings.currency : undefined}
        onClose={() => closeModal("scheduled")}
      />
      <SwitchToTaskerModal visible={isOpen("taskerIntro")} onClose={() => closeModal("taskerIntro")} />
      <DisputedModal visible={isOpen("disputed")} data={dataOf("disputed")} onClose={() => closeModal("disputed")} />
      <TaskConfirmedModal confirmedDate={timeAccepted.confirmedDate} visible={isOpen("timeAccepted")} onClose={() => closeModal("timeAccepted")} data={timeAccepted.data} />
      <View style={atoms.positionAbsolute}>
        <Auth openForgotPass={() => openModal("forgotPassword", {}, { over: true })} />
        <Register />
        <ResetPass visible={isOpen("forgotPassword")} onClose={() => closeModal("forgotPassword")} />
        {/* once, last: an alert opens over any modal (the login one too) */}
        <AlertModal alert={mainAlert} onClose={() => hideAlert()} />
      </View>
    </View>
  )
}

export default ModalManager
