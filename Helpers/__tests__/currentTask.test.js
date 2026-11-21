import { currentTaskStatus } from "../currentTask"

describe("currentTaskStatus", () => {
  it("shows a client's task", () => {
    expect(currentTaskStatus("wait", "CLIENT")).toEqual({ lines: ["Waiting for offers"], color: "#006EFF", icon: "posted" })
    expect(currentTaskStatus("received", "CLIENT", { offers: 3 }).lines).toEqual([{ count: 3, key: "offers received" }])
    expect(currentTaskStatus("received", "CLIENT", { offers: 0 }).lines).toEqual([])
    expect(currentTaskStatus("disputed", "CLIENT")).toEqual({ lines: ["Task disputed"], color: "#D10913", icon: "disputed" })
    expect(currentTaskStatus("finished", "CLIENT").icon).toBeNull()
  })

  it("shows a tasker's task with its completion reminder", () => {
    expect(currentTaskStatus("scheduled", "TASKER", { completion: false })).toEqual({ lines: ["Task Scheduled"], color: "#FE7F2D", icon: "scheduled" })
    expect(currentTaskStatus("scheduled", "TASKER", { completion: 0 }).lines).toEqual(["Sheduled for today, completion to be confirmed"])
    expect(currentTaskStatus("accepted", "TASKER", { completion: 2 }).lines).toEqual(["Offer accepted", "Sheduled for earlier, completion to be confirmed"])
    expect(currentTaskStatus("revised", "TASKER", { completion: 2 })).toEqual({ lines: ["Offer revised"], color: "#B82812", icon: "revised" })
    expect(currentTaskStatus("wait", "TASKER").icon).toBeNull()
  })
})
