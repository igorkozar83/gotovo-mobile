// taskSteps.js
// Steps of the progress bar above a task (TaskStepper). Every step carries its own icon and label,
// so the icon row and the label row always line up.
// step: { icon, title: [translation keys, one per line], color, active, date?, dateVisible? }
import { dateDotShortMonthTime } from "./index"
import { daysPastSchedule, getAcceptedOffer, getCompletedOffer, getDisputedOffer, offerStatus } from "./taskStatus"
import { palette } from "../styles/palette"

const BLUE = palette.blue
const DARK_BLUE = palette.blueDark
const RED = palette.orangeDeep
const DISPUTE_RED = palette.red
const COMPLETION_RED = palette.redMuted

const step = (icon, title, color, active, extra = {}) => ({ icon, title, color, active, ...extra })

const OFFER_RECEIVED_STATES = ["received", "scheduled", "revised", "finished", "disputed", "accepted", "startedByTasker", "startedByClient"]
const TASKER_SCHEDULED_STATES = ["finished", "scheduled", "completion", "disputed", "startedByTasker", "startedByClient"]
const TASKER_ACCEPTED_DATE_STATES = ["finished", "scheduled", "accepted", "revised", "disputed", "completion", "startedByTasker", "startedByClient"]

const disputedStep = (task, fmt) => step("disputed", ["TASKTopBarFinished", "DISPUTEDTopBarFinished"], DISPUTE_RED, true, { date: fmt(getDisputedOffer(task).updated_at) })

// done once the task is finished; its date shows only then
const completedStep = (task, progress, fmt) =>
  step("taskCompleted", ["TASKTopBarFinished", "COMPLETEDTopBarFinished"], DARK_BLUE, progress === "finished", {
    date: fmt(getCompletedOffer(task).updated_at),
    dateVisible: progress === "finished"
  })

// the last step of an active task (client): completed, or disputed
const activeEndStep = (task, progress, fmt) => (progress === "disputed" ? disputedStep(task, fmt) : completedStep(task, progress, fmt))

const clientActiveSteps = (task, progress, fmt) => {
  const steps = [step("taskPosted", ["TASKTopBarFinished", "POSTEDTopBarFinished"], BLUE, true, { date: fmt(task.created) })]

  if (progress === "completion") {
    steps.push(step("scheduled", ["TASKTopBarFinished", "SCHEDULEDTopBarFinished"], BLUE, true))
    steps.push(step("completion", ["COMPLETITIONTopBarFinished", "TO BETopBarFinished", "CONFIRMEDTopBarFinished"], RED, true))
  } else {
    steps.push(step("offerReceived", ["OFFERSTopBarFinished", "RECEIVEDTopBarFinished"], BLUE, OFFER_RECEIVED_STATES.includes(progress)))

    if (progress === "revised") steps.push(step("offerRevised", ["OFFERTopBarFinished", "REVISEDTopBarFinished"], RED, true))
    else if (progress === "startedByClient") steps.push(step("inProgress", ["INTOPBAR", "PROGRESSTPBR"], BLUE, true))
    else steps.push(step("offerAccepted", ["OFFERTopBarFinished", "ACCEPTEDTopBarFinished"], BLUE, ["finished", "scheduled", "accepted", "disputed"].includes(progress)))
  }

  steps.push(activeEndStep(task, progress, fmt))
  return steps
}

const taskerActiveSteps = (task, progress, fmt) => {
  const steps = [
    step("offerAcceptedTasker", ["OFFERTopBarFinished", "ACCEPTEDTopBarFinished"], BLUE, true, {
      date: fmt(getAcceptedOffer(task).updated_at),
      dateVisible: TASKER_ACCEPTED_DATE_STATES.includes(progress)
    }),
    step("scheduled", ["TASKTopBarFinished", "SCHEDULEDTopBarFinished"], BLUE, TASKER_SCHEDULED_STATES.includes(progress))
  ]

  if (progress === "startedByClient") {
    steps.push(step("inProgress", ["INTOPBAR", "PROGRESSTPBR"], BLUE, true))
  } else if (progress === "disputed") {
    // the dispute replaces the completion step, "completed" stays last
    steps.push(disputedStep(task, fmt))
  } else if (progress === "completion" || daysPastSchedule(task)) {
    steps.push(step("completion", ["COMPLETIONTopBarFinished", "TO BETopBarFinished", "CONFIRMEDTopBarFinished"], COMPLETION_RED, ["finished", "completion"].includes(progress)))
  } else {
    steps.push(step("completionTasker", ["COMPLETIONTopBarFinished", "CONFIRMEDTopBarFinished"], BLUE, progress === "finished"))
  }

  steps.push(completedStep(task, progress, fmt))
  return steps
}

// steps of an active task; progress is offerStatus (client) or offerStatusTasker (tasker)
export const getActiveTaskSteps = (task, progress, userSelect, language) => {
  const fmt = (date) => dateDotShortMonthTime(date, language)
  return userSelect === "CLIENT" ? clientActiveSteps(task, progress, fmt) : taskerActiveSteps(task, progress, fmt)
}

// steps of a finished (completed or canceled) task
export const getFinishedTaskSteps = (task, userSelect, language) => {
  const fmt = (date) => dateDotShortMonthTime(date, language)
  const status = offerStatus(task)
  const hasOffers = !!(task.offers && task.offers.length)
  const completedAt = getCompletedOffer(task).updated_at

  const steps =
    userSelect === "CLIENT"
      ? [
          step("taskPosted", ["TASKTopBar", "POSTEDTopBar"], BLUE, true, { date: fmt(task.created) }),
          step("offerReceived", ["OFFERSTopBar", "RECEIVEDTopBar"], BLUE, hasOffers),
          step("offerAccepted", ["OFFERTopBar", "ACCEPTEDTopBar"], BLUE, hasOffers)
        ]
      : [
          step("offerAcceptedTasker", ["OFFERTopBar", "ACCEPTEDTopBar"], BLUE, true, { date: fmt(getCompletedOffer(task).accepted_at) }),
          step("scheduled", ["TASKTopBar", "SCHEDULEDTopBar"], BLUE, true),
          status === "canceled"
            ? step("offerAccepted", ["OFFERTopBar", "ACCEPTEDTopBar"], BLUE, hasOffers)
            : step("completionTasker", ["COMPLETITIONTopBar", "CONFIRMEDTopBar"], BLUE, true)
        ]

  if (status === "finished") steps.push(step("taskCompleted", ["TASKTopBar", "COMPLETETopBar"], DARK_BLUE, true, { date: fmt(completedAt) }))
  if (status === "canceled") steps.push(step("canceled", ["TASKTopBar", "CANCELEDTopBar"], RED, true, { date: hasOffers ? fmt(completedAt) : "" }))

  return steps
}
