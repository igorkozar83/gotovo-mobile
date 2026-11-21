// useHourRange.js
// A from-to range of whole hours (1-24) picked for a day: "to" is always at least an hour after "from" (the server
// takes no empty period), and for today "from" can't be an hour that has passed.
import { useEffect, useState } from "react"

const FIRST = 1
const LAST = 24

const isToday = (day) => new Date().toDateString() === new Date(day).toDateString()

const useHourRange = (day, initial = { from: 18, to: 20 }) => {
  const [range, setRange] = useState(initial)

  const setFrom = (from) => setRange((current) => ({ from, to: Math.max(current.to, from + 1) }))
  const setTo = (to) => setRange((current) => ({ ...current, to: Math.max(to, current.from + 1) }))
  const step = (set, value, by, last) => {
    if (value + by >= FIRST && value + by <= last) set(value + by)
  }

  // (late in the evening there is no hour left today: the last one stays)
  useEffect(() => {
    const now = new Date().getHours()
    if (isToday(day) && range.from < now) setFrom(Math.min(now + 1, LAST - 1))
  }, [day, range.from])

  return {
    from: range.from,
    to: range.to,
    stepFrom: (by) => step(setFrom, range.from, by, LAST - 1),
    stepTo: (by) => step(setTo, range.to, by, LAST)
  }
}

export default useHourRange
