import { checkDiffDates } from "./index"

// Pure helpers describing a task's offer/time state. Offer statuses (API):
// 0 created, 1 accepted, 2 finished, 3 revision accepted, 4 canceled, 5 disputed, 8 started by tasker, 9 started by client

const offersOf = (task) => (task && Array.isArray(task.offers) ? task.offers : [])
const timesOf = (task) => (task && Array.isArray(task.times) ? task.times : [])

// the last offer matching the predicate wins, as in the original .map() loops
const lastOffer = (task, predicate) => offersOf(task).filter(predicate).pop()

const checkIfOfferIsRevised = (offers) => Array.isArray(offers) && offers.some((offer) => offer.edit_id && offer.status !== 5 && offer.status !== 1 && offer.status !== 6)

const checkIfOfferDisputed = (offers) => Array.isArray(offers) && offers.some((offer) => offer.status === 5)

export const isScheduled = (task) => timesOf(task).some((time) => time.status === 1)

// an accepted task whose agreed time has come: the days since that day (0 on the day); false otherwise
export const daysPastSchedule = (task) => {
  const time = timesOf(task)
    .filter((t) => t.status === 1)
    .pop()

  if (!time || task.status !== 1) return false

  const diff = checkDiffDates(time.date + " " + time.start)
  return diff >= 0 ? diff : false
}

// status as seen by the client
export const offerStatus = (task) => {
  if (task.status === 0 && (!task.offers || !task.offers.length)) return "wait"
  if (task.status === 3) return "completion"
  if (task.status === 4) return "canceled"
  if (task.status === 8) return "startedByTasker"
  if (task.status === 9) return "startedByClient"
  if (checkIfOfferIsRevised(task.offers) && task.status !== 2) return "revised"
  if (checkIfOfferDisputed(task.offers)) return "disputed"
  if (task.status === 0 && task.offers) return task.offers.length ? "received" : "wait"
  if (task.status === 2) return "finished"
  if (isScheduled(task)) return "scheduled"
  if (task.status === 1 && task.offers) return task.offers.length ? "accepted" : "wait"
  return "wait"
}

// status as seen by the tasker
export const offerStatusTasker = (task) => {
  if (task.status === 0 && (!task.offers || !task.offers.length)) return "wait"
  if (task.status === 2) return "finished"
  if (task.status === 3) return "completion"
  if (task.status === 4) return "canceled"
  if (task.status === 8) return "startedByTasker"
  if (task.status === 9) return "startedByClient"
  if (checkIfOfferIsRevised(task.offers)) return "revised"
  if (checkIfOfferDisputed(task.offers)) return "disputed"
  if (task.status === 0 && task.offers) return task.offers.length ? "received" : "wait"
  if (task.status === 1 && isScheduled(task)) return "scheduled"
  if (task.status === 1 && !daysPastSchedule(task)) return "accepted"
  return "wait"
}

const EMPTY_OFFER = { user: {} }

export const getAcceptedOffer = (task) => lastOffer(task, (o) => [1, 2, 3, 8, 9].includes(o.status)) || { ...EMPTY_OFFER }

// the tasker's own offer, also while it is disputed (status 5)
export const getTaskerOffer = (task) => lastOffer(task, (o) => [1, 2, 3, 5, 8, 9].includes(o.status)) || { ...EMPTY_OFFER }

// the offer of a finished task (status 2 only)
export const getFinishedOffer = (task) => lastOffer(task, (o) => o.status === 2) || { ...EMPTY_OFFER }

export const getCompletedOffer = (task) => lastOffer(task, (o) => o.status === 2 || o.status === 4) || { ...EMPTY_OFFER }

export const getDisputedOffer = (task) => lastOffer(task, (o) => o.status === 5) || { ...EMPTY_OFFER }

export const getCanceledTaskOffer = (task) => lastOffer(task, (o) => o.status === 4) || { ...EMPTY_OFFER }

// the other party of the task for the current user
export const getOtherUser = (task, userSelect) => {
  if (userSelect !== "CLIENT") return task.posted_by_user

  return offersOf(task).some((o) => [1, 2, 3, 4, 5, 8, 9].includes(o.status)) ? task.accepted_by_user : { ...EMPTY_OFFER }
}

export const getAcceptedTime = (task) =>
  timesOf(task)
    .filter((t) => t.status === 1)
    .pop() || false

// when the task was canceled (null if it wasn't)
export const getCanceledDate = (task) => (task.status === 4 ? task.updated : null)

// the review the given user left on the task (null if none)
export const getUserReview = (task, userId) => (Array.isArray(task.reviews) ? task.reviews.filter((review) => review.user_id === userId).pop() : undefined) || null

// revision (edited offer) of the accepted offer
export const getEditedOffer = (task) => {
  const acceptedId = getAcceptedOffer(task).id
  return lastOffer(task, (o) => o.edit_id && o.edit_id === acceptedId) || {}
}

const getEditedOfferAccepted = (task) => lastOffer(task, (o) => o.edit_id && (o.status === 1 || o.status === 3)) || {}

// the revision waiting for the client's answer
export const getPendingRevision = (task) => lastOffer(task, (o) => o.edit_id && o.status === 0)

// the offer a client's task shows: the disputed one while disputed, otherwise the accepted, finished or
// started one (or an original offer with status 7)
export const getClientTaskOffer = (task, progress) =>
  progress === "disputed" ? getDisputedOffer(task) : lastOffer(task, (o) => [1, 2, 3, 8, 9].includes(o.status) || (o.status === 7 && !o.edit_id)) || { ...EMPTY_OFFER }

// the price a client's task shows: an accepted revision's, then an accepted edit's, then the offer's
export const getClientTaskPrice = (task, progress) => {
  const acceptedRevision = getEditedOfferAccepted(task)
  if (acceptedRevision.id) return acceptedRevision.price
  const revision = getEditedOffer(task)
  return revision.status === 1 ? revision.price : getClientTaskOffer(task, progress).price
}

// { id, avatar, name } of a task's user, as the task modals expect it
export const userBrief = (user) => ({ id: user.id, avatar: user.avatar, name: user.full_name })

// the new-time modal's data for the time proposed on a task (null without one); acceptedBy: the tasker
export const newTimeRequest = (task, acceptedBy) => {
  const proposed = task && task.proposed_time && task.proposed_time.length ? task.proposed_time[0] : null
  if (!proposed) return null
  return {
    acceptedBy: { id: acceptedBy.id, fullName: acceptedBy.full_name, avatar: acceptedBy.avatar },
    taskId: task.id,
    taskName: task.name,
    type: "new-task-time",
    date: [proposed.date + " " + proposed.start, proposed.date + " " + proposed.end],
    timeId: proposed
  }
}

// a modal's accepted time: the push sends all the task's times (the accepted one has status 1), the app
// sends the accepted time itself
export const acceptedTimeOf = (times) => {
  if (!Array.isArray(times)) return times || null
  return times.find((time) => time && time.status === 1) || times[0] || null
}

// { from, to } datetimes of a time as the modals get it: { date, start, end } with clock times, or full
// datetimes in start / end (the pushes); null when the date is not known
export const timeRangeOf = (time) => {
  if (!time || !time.start) return null
  if (time.date) return { from: time.date + " " + time.start, to: time.date + " " + time.end }
  if (String(time.start).includes(" ")) return { from: time.start, to: time.end }
  return null
}

// the started-task modal's data for a task the tasker started
export const startedTaskRequest = (task) => ({
  type: "tasker-start-task",
  taskId: task.id,
  taskOffer: getAcceptedOffer(task),
  taskName: task.name,
  acceptedTime: timesOf(task)
    .filter((t) => t.status === 1)
    .pop(),
  postedBy: userBrief(task.posted_by_user),
  acceptedByUser: userBrief(task.accepted_by_user)
})
