// listRows.js
// What a row of the app's lists shows, worked out from its object: an open job on the tasker's Home, a
// finished task in My Tasks, an offer in the inbox. The rows only lay these out.
import { timeFormat, dateDotTime, calcStars } from "./index"
import { offerStatus, offerStatusTasker, daysPastSchedule, getCompletedOffer, getCanceledDate, getUserReview } from "./taskStatus"
import { smallAvatar } from "./pictures"

const fullName = (user) => (user ? user.name + " " + user.last_name : "")
const shortName = (user) => `${user?.name} ${user?.last_name?.charAt(0)}.`

// an open task on the tasker's Home; the client is the one who posted it
export const jobRow = (task, language) => {
  const client = task.posted_by_user
  return {
    client,
    sos: !!task.is_sos,
    clientName: shortName(client),
    date: timeFormat(task.created, language),
    title: task.is_sos ? `S.O.S. task: ${task.name}` : task.name,
    stars: calcStars(client),
    taskCount: client?.tasks_count,
    avatar: smallAvatar(client) || ""
  }
}

// an active task in My Tasks, in the user's role: when it was posted, its name, its status (for
// Helpers/currentTask), how many offers it has, and false or the days since its scheduled day
export const currentTaskRow = (task, { userSelect, language }) => ({
  date: timeFormat(task.created, language),
  title: task.name,
  status: userSelect === "TASKER" ? offerStatusTasker(task) : offerStatus(task),
  offers: (task.offers || []).length,
  completion: daysPastSchedule(task)
})

// a finished (or canceled, status 4) task in My Tasks, seen by the user (meId) in their role
export const finishedTaskRow = (task, { userSelect, meId, language }) => ({
  date: task.status === 4 ? dateDotTime(getCanceledDate(task), language) : dateDotTime(getCompletedOffer(task).updated_at, language),
  title: task.name,
  party: fullName(userSelect === "CLIENT" ? task.accepted_by_user : task.posted_by_user),
  review: getUserReview(task, meId),
  completed: offerStatusTasker(task) === "finished"
})

// the other party of an offer: the tasker for a client, the client for a tasker
export const offerParty = (offer, userSelect) => (userSelect === "CLIENT" ? offer.user : offer.task.posted_by_user)

// an offer in the inbox; a new offer (status 0) shows the short name
export const offerRow = (offer, { userSelect, language }) => {
  const party = offerParty(offer, userSelect)
  return {
    party,
    status: offer.status,
    partyName: offer.status === 0 ? party?.name + " " + party?.last_name?.charAt(0) + "." : party?.full_name,
    stars: calcStars(party),
    taskCount: party?.tasks_count,
    price: parseInt(offer.price),
    date: timeFormat(offer.created_at, language),
    title: offer.task.is_sos ? "SOS task: " + offer.task.name : offer.task.name
  }
}
