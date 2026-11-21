import { calcStars } from "./index"

// Which badges a user earns. role picks the badge set: "TASKER" or "CLIENT".
// count: the completed tasks the level badge is based on (the callers pick tasks_count,
// tasks_count_tasker or tasks_count_client).
// Returns image keys (see components/UserBadges.js):
// { completion, level, rating, licences: [...] }; completion/level/rating are null when not earned.

const completionKey = (completed) => {
  if (completed === 100) return "completion100"
  if (completed >= 80) return "completion80"
  if (completed >= 60) return "completion60"
  if (completed >= 40) return "completion40"
  if (completed >= 20) return "completion20"
  return null
}

const TASKER_LEVELS = [
  [21, "guru"],
  [11, "expert"],
  [5, "pro"],
  [2, "qualified"],
  [1, "starter"]
]

const CLIENT_LEVELS = [
  [5, "platinum"],
  [2, "regular"],
  [1, "starter"]
]

const levelKey = (count, role) => {
  const level = (role === "TASKER" ? TASKER_LEVELS : CLIENT_LEVELS).find(([min]) => count >= min)
  return level ? level[1] : null
}

// verification flag → badge key, in display order
const TASKER_LICENCES = [
  ["hundred_perc_verified", "hundredVerified"],
  ["id_verified", "idVerified"],
  ["gas_installer_verified", "gas"],
  ["assembly_verified", "assembly"],
  ["electrician_verified", "electrician"],
  ["plumber_verified", "plumber"]
]

const CLIENT_LICENCES = TASKER_LICENCES.slice(0, 2)

export const getUserBadges = (user, role, count) => {
  const verifications = (user && user.verifications) || {}
  const hasRating = count >= 1 && parseFloat(calcStars(user, 2)) >= 4

  return {
    completion: completionKey(user && user.completed),
    level: levelKey(count, role),
    count,
    rating: hasRating ? calcStars(user, 1) : null,
    licences: (role === "TASKER" ? TASKER_LICENCES : CLIENT_LICENCES).filter(([flag]) => verifications[flag]).map(([, key]) => key)
  }
}
