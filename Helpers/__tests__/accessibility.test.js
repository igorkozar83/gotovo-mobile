import { AccessibilityInfo } from "react-native"

import { spokenLabel, announce } from "../accessibility"

describe("spokenLabel", () => {
  it("drops what a label shows around its name", () => {
    expect(spokenLabel("EMAIL:")).toBe("EMAIL")
    expect(spokenLabel("NAME*:")).toBe("NAME")
    expect(spokenLabel("CITY *")).toBe("CITY")
    expect(spokenLabel("Type a message...")).toBe("Type a message")
    expect(spokenLabel("SWIFT")).toBe("SWIFT")
  })

  it("passes a missing label through", () => {
    expect(spokenLabel(undefined)).toBeUndefined()
  })
})

describe("announce", () => {
  beforeEach(() =>
    jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockClear()
      .mockImplementation(() => {})
  )
  afterEach(() => jest.restoreAllMocks())

  it("says the parts that are there as sentences", () => {
    announce("ERROR", null, "Please try again")
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith("ERROR. Please try again")
  })

  it("says nothing when there is nothing to say", () => {
    announce(null, "")
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled()
  })
})
