// reviews.js
// Reading a user's reviews.
import { fName, lName } from "./index"

const STAR_FIELDS = { 1: "one_star", 2: "two_star", 3: "three_star", 4: "four_star", 5: "five_star" }

// the stars a single review gave (its one_star ... five_star flag), undefined when none is set
export const reviewStars = (review) => [1, 2, 3, 4, 5].find((stars) => review[STAR_FIELDS[stars]])

// how many of a user's reviews gave `stars`, and their share in % (0 without reviews)
export const starCount = (summary, stars) => (summary && summary[STAR_FIELDS[stars]]) || 0
export const starShare = (summary, stars) => {
  const count = starCount(summary, stars)
  return count && summary.total ? ((count / summary.total) * 100).toFixed(0) : 0
}

// "First Last." of the reviewer ("First_Last" full names); just "First" without a last name
export const reviewerName = (user) => {
  const last = lName(user.full_name)
  return fName(user.full_name) + (last ? " " + last + "." : "")
}
