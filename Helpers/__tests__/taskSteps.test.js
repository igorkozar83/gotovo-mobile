import { getActiveTaskSteps, getFinishedTaskSteps } from "../taskSteps"
import { palette } from "../../styles/palette"

const task = (fields) => ({ status: 0, created: "2026-09-20 10:00:00", offers: [], times: [], ...fields })

const icons = (steps) => steps.map((s) => s.icon)
const active = (steps) => steps.map((s) => s.active)

describe("getActiveTaskSteps", () => {
  it("client, waiting: only the posted step is active, with its date", () => {
    const steps = getActiveTaskSteps(task(), "wait", "CLIENT", "EN")
    expect(icons(steps)).toEqual(["taskPosted", "offerReceived", "offerAccepted", "taskCompleted"])
    expect(active(steps)).toEqual([true, false, false, false])
    expect(steps[0].date).toBe("20. Sep 10:00")
    expect(steps[3].dateVisible).toBe(false)
  })

  it("client, scheduled: offers received and accepted", () => {
    expect(active(getActiveTaskSteps(task({ status: 1 }), "scheduled", "CLIENT", "EN"))).toEqual([true, true, true, false])
  })

  it("client, revised and started: the third step changes", () => {
    expect(icons(getActiveTaskSteps(task(), "revised", "CLIENT", "EN"))[2]).toBe("offerRevised")
    expect(icons(getActiveTaskSteps(task(), "startedByClient", "CLIENT", "EN"))[2]).toBe("inProgress")
  })

  it("client, to be confirmed: scheduled and the red completion step", () => {
    const steps = getActiveTaskSteps(task(), "completion", "CLIENT", "EN")
    expect(icons(steps)).toEqual(["taskPosted", "scheduled", "completion", "taskCompleted"])
    expect(steps[2].color).toBe("#B82812")
  })

  it("client, disputed: the last step is the dispute with its date", () => {
    const disputed = task({ offers: [{ status: 5, updated_at: "2026-09-22 12:30:00" }] })
    const last = getActiveTaskSteps(disputed, "disputed", "CLIENT", "EN").pop()
    expect(last).toMatchObject({ icon: "disputed", active: true, date: "22. Sep 12:30" })
  })

  it("tasker, disputed: the dispute replaces completion and completed stays last", () => {
    const disputed = task({ offers: [{ status: 5, updated_at: "2026-09-22 12:30:00" }] })
    expect(icons(getActiveTaskSteps(disputed, "disputed", "TASKER", "EN"))).toEqual(["offerAcceptedTasker", "scheduled", "disputed", "taskCompleted"])
  })

  it("tasker, scheduled: completion not asked yet, accepted date shown", () => {
    const steps = getActiveTaskSteps(task({ status: 1 }), "scheduled", "TASKER", "EN")
    expect(icons(steps)).toEqual(["offerAcceptedTasker", "scheduled", "completionTasker", "taskCompleted"])
    expect(active(steps)).toEqual([true, true, false, false])
    expect(steps[0].dateVisible).toBe(true)
  })

  it("tasker, completion asked: the red completion step", () => {
    const steps = getActiveTaskSteps(task(), "completion", "TASKER", "EN")
    expect(steps[2]).toMatchObject({ icon: "completion", color: palette.redMuted, active: true })
  })
})

describe("getFinishedTaskSteps", () => {
  it("client, completed: all active, the completed date last", () => {
    const done = task({ status: 2, offers: [{ status: 2, updated_at: "2026-09-25 09:15:00" }] })
    const steps = getFinishedTaskSteps(done, "CLIENT", "EN")
    expect(icons(steps)).toEqual(["taskPosted", "offerReceived", "offerAccepted", "taskCompleted"])
    expect(steps[3].date).toBe("25. Sep 09:15")
  })

  it("client, canceled without offers: no date on the canceled step", () => {
    const steps = getFinishedTaskSteps(task({ status: 4 }), "CLIENT", "EN")
    expect(icons(steps)).toEqual(["taskPosted", "offerReceived", "offerAccepted", "canceled"])
    expect(active(steps)).toEqual([true, false, false, true])
    expect(steps[3].date).toBe("")
  })

  it("tasker, completed: confirmation step instead of offer accepted", () => {
    const done = task({ status: 2, offers: [{ status: 2, updated_at: "2026-09-25 09:15:00", accepted_at: "2026-09-21 08:00:00" }] })
    const steps = getFinishedTaskSteps(done, "TASKER", "EN")
    expect(icons(steps)).toEqual(["offerAcceptedTasker", "scheduled", "completionTasker", "taskCompleted"])
    expect(steps[0].date).toBe("21. Sep 08:00")
  })
})
