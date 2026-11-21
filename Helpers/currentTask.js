// currentTask.js
// How an active task shows in My Tasks: its status line (translation keys, joined) with a colour, and the
// status icon. `status` is Helpers/taskStatus's offerStatus / offerStatusTasker.
import { palette } from "../styles/palette"

const BLUE = palette.blue
const ORANGE = palette.orange
const RED = palette.red
const REVISED = palette.orangeDeep

const CLIENT = {
  wait: { text: ["Waiting for offers"], icon: "posted" },
  startedByClient: { text: ["In PROGRESS"], icon: "inProgress" },
  accepted: { text: ["Offer accepted"], icon: "offerAccepted" },
  received: { text: [], icon: "received" },
  scheduled: { text: ["Task scheduled"], icon: "offerAccepted" },
  startedByTasker: { text: ["Task scheduled"], icon: "offerAccepted" },
  completion: { text: ["Waiting for completition"], color: RED, icon: "completion" },
  disputed: { text: ["Task disputed"], color: RED, icon: "disputed" },
  revised: { text: ["Offer revised"], color: REVISED, icon: "revised" }
}

const TASKER = {
  wait: { text: ["Waiting for offers"] },
  startedByClient: { text: ["In PROGRESS"], icon: "inProgress" },
  accepted: { text: ["Offer accepted"], icon: "accepted" },
  completion: { text: ["Waiting for client to confirm completition"], icon: "completion" },
  scheduled: { text: [], icon: "scheduled" },
  startedByTasker: { text: [], icon: "scheduled" },
  disputed: { text: ["Task disputed"], color: RED, icon: "disputed" },
  revised: { text: ["Offer revised"], color: REVISED, icon: "revised" }
}

/**
 * role: "CLIENT" or "TASKER"; offers: how many offers the task got (the client's "received" line);
 * completion: daysPastSchedule(task) (false, or the days since the scheduled day) for the tasker's lines
 * Returns { lines: [key or { count, key }], color, icon } (lines empty and icon null for nothing to show)
 */
export const currentTaskStatus = (status, role, { offers = 0, completion = false } = {}) => {
  if (role === "CLIENT") {
    const shown = CLIENT[status]
    if (!shown) return { lines: [], color: BLUE, icon: null }
    const lines = status === "received" && offers ? [{ count: offers, key: offers < 2 ? "offer received" : "offers received" }] : shown.text
    return { lines, color: shown.color || BLUE, icon: shown.icon }
  }
  const shown = TASKER[status] || { text: [] }
  const lines = [...shown.text]
  if (status === "revised") return { lines, color: REVISED, icon: shown.icon }
  if ((status === "scheduled" || status === "startedByTasker") && completion === false) lines.push("Task Scheduled")
  if (completion !== false && completion === 0) lines.push("Sheduled for today, completion to be confirmed")
  if (completion !== false && completion > 0) lines.push("Sheduled for earlier, completion to be confirmed")
  return { lines, color: shown.color || ORANGE, icon: shown.icon || null }
}
