import { act } from "@testing-library/react-native"
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"

import useOfferPayment from "../taskOffer/useOfferPayment"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery, makeQueryClient } from "../../testUtils/render"
import { createPaymentLink } from "../../Services/PaymentsAPI"
import { getTaskOffer } from "../../Services/TasksAPI"

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn(), dismissBrowser: jest.fn() }))
jest.mock("expo-linking", () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  parse: (url) => ({ queryParams: Object.fromEntries(new URL(url).searchParams) })
}))
jest.mock("../../Services/PaymentsAPI", () => ({ createPaymentLink: jest.fn() }))
jest.mock("../../Services/TasksAPI", () => ({ getTaskOffer: jest.fn(), acceptTaskOffer: jest.fn() }))

const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
// the shown offer, in the query cache the hook reads
let client
const shown = () => client.getQueryData(["taskOffer", 30])

// pays: asks for the link, opens it, and comes back to the app with `returnUrl`
const payAndReturn = async (returnUrl, onPaid = jest.fn()) => {
  createPaymentLink.mockResolvedValue({ success: 1, payment_link: "https://api.test/payments/payment-fee-open-url?signature=s" })
  const rendered = await renderHookWithQuery(() => useOfferPayment({ offerId: 30, onPaid }), { client })
  await act(async () => rendered.result.current.requestPaymentLink())
  await act(async () => rendered.result.current.openPaymentLink())
  const backToTheApp = Linking.addEventListener.mock.calls[0][1]
  await act(async () => backToTheApp({ url: returnUrl }))
  return { ...rendered, onPaid }
}

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT" } }, userSelect: "CLIENT" })
  useUiStore.setState({ spinners: 0 })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  client = makeQueryClient()
  client.setQueryData(["taskOffer", 30], { id: 30, status: 0 })
})

describe("paying the fee of an offer", () => {
  it("opens the link the server signed for the offer", async () => {
    await payAndReturn("gotovo://pay?error=x")
    expect(createPaymentLink).toHaveBeenCalledWith(30)
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith("https://api.test/payments/payment-fee-open-url?signature=s")
  })

  it("shows the offer accepted only when the server has it accepted", async () => {
    getTaskOffer.mockResolvedValue({ id: 30, status: 1 })
    await payAndReturn("gotovo://pay?success=Payment_was_successfull.")
    expect(getTaskOffer).toHaveBeenCalledWith(30)
    expect(shown().status).toBe(1)
    expect(alert()).toMatchObject({ open: true, type: "success" })
  })

  it("a 'success' the server does not confirm (yet) accepts nothing", async () => {
    // (anyone can open the app's link with success: it used to mark the offer accepted)
    getTaskOffer.mockResolvedValue({ id: 30, status: 0 })
    await payAndReturn("gotovo://pay?success=Payment_was_successfull.")
    expect(shown().status).toBe(0)
    expect(alert()).toMatchObject({ open: true, title: "Payment is being processed" })
  })

  it("a failed check counts as not confirmed", async () => {
    getTaskOffer.mockRejectedValue(new Error("offline"))
    jest.spyOn(console, "log").mockImplementation(() => {})
    await payAndReturn("gotovo://pay?success=x")
    expect(shown().status).toBe(0)
  })

  it("an error from the payment page is shown and nothing is asked", async () => {
    await payAndReturn("gotovo://pay?error=There_was_an_error")
    expect(getTaskOffer).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "error", text: "There was an error" })
  })
})
