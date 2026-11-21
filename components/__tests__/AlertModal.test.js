import React from "react"
import { AccessibilityInfo } from "react-native"
import { render, screen } from "@testing-library/react-native"

import AlertModal from "../modals/AlertModal"

const alert = (fields) => ({ open: true, type: "error", title: "NO INTERNET", text: "Check your connection", okText: "OK", ...fields })

beforeEach(() =>
  jest
    .spyOn(AccessibilityInfo, "announceForAccessibility")
    .mockClear()
    .mockImplementation(() => {})
)
afterEach(() => jest.restoreAllMocks())

describe("AlertModal", () => {
  it("a screen reader hears an alert as it opens, and its title is a heading", async () => {
    await render(<AlertModal alert={alert()} onClose={() => {}} />)
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith("NO INTERNET. Check your connection")
    expect(screen.getByRole("header", { name: "NO INTERNET" })).toBeTruthy()
  })

  it("a closed alert says nothing", async () => {
    await render(<AlertModal alert={alert({ open: false })} onClose={() => {}} />)
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled()
  })
})
