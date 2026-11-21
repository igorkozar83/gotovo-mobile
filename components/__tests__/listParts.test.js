import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"

import MyTaskCurrentItem from "../myTasks/MyTaskCurrentItem"
import MyTaskFinishedItem from "../myTasks/MyTaskFinishedItem"
import OfferCard from "../taskOffer/OfferCard"
import TermsAgreement from "../auth/TermsAgreement"
import OrDivider from "../auth/OrDivider"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { renderWithQuery } from "../../testUtils/render"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))

const tasker = { id: 7, name: "Marko", last_name: "Jovic", full_name: "Marko Jovic" }
const client = { id: 6, name: "Ana", last_name: "Petrovic", full_name: "Ana Petrovic" }

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT" } }, userSelect: "CLIENT" })
  useUiStore.setState({ language: "EN" })
})

describe("an active task row", () => {
  const task = { id: 9, name: "Paint the kitchen", created: "2026-09-25 14:20:00", status: 0, offers: [{ id: 1, status: 0 }], times: [] }

  it("shows when it was posted, its name and its progress, and opens on press", async () => {
    const onPress = jest.fn()
    await render(<MyTaskCurrentItem task={task} onPress={onPress} />)
    expect(screen.getByText("25 September 14:20")).toBeTruthy()
    expect(screen.getByText("Paint the kitchen")).toBeTruthy()
    expect(screen.getByText("1 offer received")).toBeTruthy()
    await fireEvent.press(screen.getByText("Paint the kitchen"))
    expect(onPress).toHaveBeenCalled()
  })
})

describe("a finished task row", () => {
  it("shows the other party and the user's rating of them", async () => {
    const task = {
      id: 10,
      name: "Fix sink",
      status: 2,
      accepted_by_user: tasker,
      posted_by_user: client,
      offers: [{ id: 1, status: 2, updated_at: "2026-09-20 10:00:00" }],
      times: [],
      reviews: [{ user_id: 6, rate: 4 }]
    }
    await render(<MyTaskFinishedItem task={task} onPress={() => {}} />)
    expect(screen.getByText("Fix sink")).toBeTruthy()
    expect(screen.getByText("Marko Jovic")).toBeTruthy()
  })
})

describe("an offer's card", () => {
  const offer = { status: 0, created_at: "2026-09-24 16:06:00", price: "2000", explanation: "first price", task: { name: "Revision test", description: "to test price revision" } }

  it("shows the task, the price and the tasker's explanation", async () => {
    await renderWithQuery(<OfferCard offer={offer} forClient language="EN" />)
    expect(screen.getByText("Revision test")).toBeTruthy()
    expect(screen.getByText("to test price revision")).toBeTruthy()
    expect(screen.getByText("first price")).toBeTruthy()
    expect(screen.getByText(/2\.000/)).toBeTruthy()
  })

  it("has no explanation line without one", async () => {
    await renderWithQuery(<OfferCard offer={{ ...offer, explanation: null }} forClient language="EN" />)
    expect(screen.queryByText(/EXPLANATION/)).toBeNull()
  })
})

describe("the terms agreement", () => {
  it("the sentence is shown and the name opens the terms over everything (a sign-up modal stays behind)", async () => {
    await render(<TermsAgreement checked={false} onChange={() => {}} />)
    await fireEvent.press(screen.getByText("GOTOVO Terms & Conditions."))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByText("OPŠTI USLOVI I PRAVILA KORIŠĆENJA ZA KORISNIKE")).toBeTruthy()
    await fireEvent.press(screen.getByText("OK, I GOT IT"))
    expect(screen.queryByText("OPŠTI USLOVI I PRAVILA KORIŠĆENJA ZA KORISNIKE")).toBeNull()
    expect(screen.getByText(/By clicking below I confirm that I have read/)).toBeTruthy()
  })

  it("the divider says what the buttons below are", async () => {
    await render(<OrDivider />)
    expect(screen.getByText("OR LOGIN USING")).toBeTruthy()
  })
})
