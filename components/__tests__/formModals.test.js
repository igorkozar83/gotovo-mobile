import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"

import { makeQueryClient, renderWithQuery } from "../../testUtils/render"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import ProposeOfferModal from "../modals/ProposeOfferModal"
import EditOfferModal from "../modals/EditOfferModal"
import AskQuestionModal from "../modals/AskQuestionModal"
import InboxAskQuestionModal from "../modals/InboxAskQuestionModal"
import AnswerQuestionModal from "../modals/AnswerQuestionModal"
import ResetPass from "../modals/ResetPass"
import VerifyPhoneModal from "../modals/VerifyPhoneModal"
import ModalAppleNameLastName from "../modals/ModalAppleNameLastName"
import ReplyReview from "../modals/ReplyReview"
import CancelTaskTasker from "../modals/CancelTaskTasker"
import PaymentModal from "../modals/PaymentModal"
import { createTaskOffer, editTaskOffer, createTaskQuestion } from "../../Services/TasksAPI"
import { requestResetPassword, sendVerifySms, checkVerifySms } from "../../Services/API"

// the requests are the API's (mocked); the forms, their checks and what follows a sent one are real
const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/TasksAPI", () => ({ createTaskOffer: jest.fn(), editTaskOffer: jest.fn(), createTaskQuestion: jest.fn() }))
jest.mock("../../Services/API", () => ({ requestResetPassword: jest.fn(), sendVerifySms: jest.fn(), checkVerifySms: jest.fn() }))
const mockReloadUser = jest.fn()
jest.mock("../../hooks/useReloadUser", () => () => mockReloadUser)
// the review reply and the tasker's cancel have their own hook tests: here, their wiring
const mockReply = { setMessage: jest.fn(), submit: jest.fn() }
jest.mock("../../hooks/reviews/useReviewReply", () => () => ({ message: "", ...mockReply }))
const mockCancel = { setReason: jest.fn(), submit: jest.fn() }
jest.mock("../../hooks/myTasks/useTaskerCancel", () => ({
  __esModule: true,
  default: () => ({ reason: "", ...mockCancel }),
  acceptedOfferOf: () => ({ price: "2500.00" })
}))

// the button, when the title says the same
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const type = (label, text) => act(async () => fireEvent.changeText(screen.getByLabelText(label), text))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const task = { id: 9, name: "Fix the tap", is_sos: false, posted_by_user: { name: "Ana", last_name: "Anic", full_name: "Ana Anic" } }

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 7, type: "TASKER" } }, userSelect: "TASKER" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  useUiStore.setState({ spinners: 0 })
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("proposing an offer", () => {
  const draw = (props = {}) => renderWithQuery(<ProposeOfferModal visible task={task} onClose={jest.fn()} onReopen={jest.fn()} {...props} />)

  it("names the client by first name and initial, and marks an S.O.S. task", async () => {
    await draw({ task: { ...task, is_sos: true } })
    expect(screen.getByText("Ana A.")).toBeTruthy()
    expect(screen.getByText("S.O.S. task: Fix the tap")).toBeTruthy()
  })

  it("an incomplete offer is not sent: the alert's OK brings the modal back", async () => {
    const onClose = jest.fn()
    const onReopen = jest.fn()
    await draw({ onClose, onReopen })
    await press("SEND OFFER")
    expect(onClose).toHaveBeenCalled()
    expect(createTaskOffer).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Send offer error", text: "Please enter price.\nPlease enter explanation." })
    await act(async () => alert().proceedAction())
    expect(onReopen).toHaveBeenCalled()
  })

  it("an amount of 0 is no amount: the same alert as an empty one, nothing sent", async () => {
    await draw()
    await type("ENTER AMOUNT", "0")
    await type("ADD EXPLANATION", "Two hours")
    await press("SEND OFFER")
    expect(createTaskOffer).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Send offer error", text: "Please enter price." })
  })

  it("a sent offer is confirmed, and closing that shows the offers in the inbox", async () => {
    createTaskOffer.mockResolvedValue(undefined)
    await draw()
    await type("ENTER AMOUNT", "2500")
    await type("ADD EXPLANATION", "Two hours")
    await press("SEND OFFER")
    expect(createTaskOffer).toHaveBeenCalledWith(9, { explanation: "Two hours", price: "2500" })
    expect(screen.getByText("YOUR OFFER HAS BEEN SENT")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getAllByLabelText("Close").pop()))
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { refreshOffers: true, viewOffers: true })
  })
})

describe("revising an offer", () => {
  const offer = { price: "2000.00", task }

  it("shows the previous amount; an incomplete revision stays open with an alert", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<EditOfferModal visible taskOffer={offer} onClose={onClose} />)
    expect(screen.getByLabelText("PREVIOUS AMOUNT").props.value).toMatch(/2[.,]?000/)
    await press("CONFIRM EDIT")
    expect(onClose).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Edit task offer error" })
  })

  it("a new amount of 0 is refused like an empty one", async () => {
    await renderWithQuery(<EditOfferModal visible taskOffer={offer} onClose={jest.fn()} />)
    await type("ENTER NEW AMOUNT", "0")
    await type("ADD EXPLANATION", "Less work")
    await press("CONFIRM EDIT")
    expect(editTaskOffer).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Edit task offer error", text: "Please enter price." })
  })

  it("a sent revision goes back to the inbox offers", async () => {
    editTaskOffer.mockResolvedValue(undefined)
    const onClose = jest.fn()
    await renderWithQuery(<EditOfferModal visible taskOffer={offer} onClose={onClose} />)
    await type("ENTER NEW AMOUNT", "2600")
    await type("ADD EXPLANATION", "More pipes")
    await press("CONFIRM EDIT")
    expect(onClose).toHaveBeenCalled()
    expect(editTaskOffer).toHaveBeenCalledWith(9, { explanation: "More pipes", price: "2600" })
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { refreshOffers: true })
  })
})

describe("asking about a task", () => {
  it("an empty question is not sent", async () => {
    await renderWithQuery(<AskQuestionModal visible taskDetails={task} onClose={jest.fn()} onReopen={jest.fn()} />)
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    await press("ASK A QUESTION")
    expect(createTaskQuestion).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Task question create error", text: "Please write a question." })
  })

  it("a posted question closes the modal and is confirmed", async () => {
    createTaskQuestion.mockResolvedValue(undefined)
    const onClose = jest.fn()
    await renderWithQuery(
      <AskQuestionModal visible taskDetails={{ ...task, posted_by_user: undefined, posted_by: { full_name: "Ana Anic" } }} onClose={onClose} onReopen={jest.fn()} />
    )
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    await type("YOUR QUESTION", "Which tap?")
    await press("ASK A QUESTION")
    expect(createTaskQuestion).toHaveBeenCalledWith({ question: "Which tap?" }, 9, null, undefined, null)
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByText("YOUR QUESTION HAS BEEN POSTED")).toBeTruthy()
  })

  it("adding a picture steps aside for the picker; closing it brings the modal back", async () => {
    const onClose = jest.fn()
    const onReopen = jest.fn()
    await renderWithQuery(<AskQuestionModal visible taskDetails={task} onClose={onClose} onReopen={onReopen} />)
    await act(async () => fireEvent.press(screen.getByLabelText("Add photo")))
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByText("GALLERY")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getAllByLabelText("Close").pop()))
    expect(onReopen).toHaveBeenCalled()
  })
})

describe("asking from the inbox", () => {
  const questions = [
    { id: 9, name: "Fix the tap", posted_by: { full_name: "Ana Anic" } },
    { id: 10, name: "Paint the hall", posted_by: { full_name: "Mika Mikic" } }
  ]

  it("starts on the first task; another one can be picked", async () => {
    createTaskQuestion.mockResolvedValue(undefined)
    await renderWithQuery(<InboxAskQuestionModal visible questions={questions} onClose={jest.fn()} />)
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    await press("Fix the tap")
    await press("Paint the hall")
    expect(screen.queryByText("Fix the tap")).toBeNull()
    expect(screen.getByText("Mika Mikic")).toBeTruthy()
    await type("YOUR QUESTION", "When?")
    await press("ASK A QUESTION")
    expect(createTaskQuestion).toHaveBeenCalledWith({ question: "When?" }, 10, null, undefined, null)
    expect(screen.getByText("YOUR QUESTION HAS BEEN POSTED")).toBeTruthy()
  })
})

describe("answering a question", () => {
  const asked = { id: 9, name: "Fix the tap", questions: [{ id: 40, user: { full_name: "Pera Peric" } }] }
  const draw = (props = {}) =>
    renderWithQuery(<AnswerQuestionModal visible task={asked} question="Which tap?" onClose={jest.fn()} onVisibleChange={jest.fn()} onAnswered={jest.fn()} {...props} />)

  it("shows who asked what; an empty answer is not sent", async () => {
    await draw()
    expect(screen.getByText("Pera Peric")).toBeTruthy()
    expect(screen.getByText("Which tap?")).toBeTruthy()
    await press("SEND REPLY")
    expect(createTaskQuestion).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Send question error" })
  })

  it("an answer goes to that question; the list is refreshed after it", async () => {
    createTaskQuestion.mockResolvedValue(undefined)
    const onAnswered = jest.fn()
    await draw({ onAnswered })
    await type("YOUR ANSWER", "The kitchen one")
    await press("SEND REPLY")
    expect(createTaskQuestion).toHaveBeenCalledWith({ question: "The kitchen one" }, 9, null, undefined, 40)
    expect(onAnswered).toHaveBeenCalled()
  })

  it("a failed request refreshes the list too", async () => {
    createTaskQuestion.mockRejectedValue(new Error("offline"))
    const onAnswered = jest.fn()
    await draw({ onAnswered })
    await type("YOUR ANSWER", "The kitchen one")
    await press("SEND REPLY")
    expect(onAnswered).toHaveBeenCalled()
  })

  it("the picture picker brings the modal back when it closes", async () => {
    const onVisibleChange = jest.fn()
    await draw({ onVisibleChange })
    await act(async () => fireEvent.press(screen.getByLabelText("Add photo")))
    await act(async () => fireEvent.press(screen.getAllByLabelText("Close").pop()))
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })
})

describe("resetting the password", () => {
  it("needs a valid email", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<ResetPass visible onClose={onClose} />)
    await type("EMAIL", "ana@")
    await press("REQUEST RESET")
    expect(onClose).not.toHaveBeenCalled()
    expect(requestResetPassword).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, text: "Please enter valid email." })
  })

  it("a sent request closes the modal and asks the user to check their email", async () => {
    requestResetPassword.mockResolvedValue(undefined)
    const onClose = jest.fn()
    await renderWithQuery(<ResetPass visible onClose={onClose} />)
    await type("EMAIL", "ana@example.test")
    await press("REQUEST RESET")
    expect(onClose).toHaveBeenCalled()
    expect(requestResetPassword).toHaveBeenCalledWith("ana@example.test")
    expect(screen.getByText("REQUESTED RESET PASSWORD")).toBeTruthy()
  })
})

describe("verifying the phone", () => {
  const draw = (props = {}) => renderWithQuery(<VerifyPhoneModal visible onClose={jest.fn()} onVisibleChange={jest.fn()} {...props} />)

  it("needs the number first", async () => {
    await draw()
    await press("Send verification code")
    expect(sendVerifySms).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, text: "Please enter phone number." })
  })

  it("sends the code to the number, comes back for it, and a right code reloads the user", async () => {
    sendVerifySms.mockResolvedValue(undefined)
    checkVerifySms.mockResolvedValue(undefined)
    const onVisibleChange = jest.fn()
    await draw({ onVisibleChange })
    await act(async () => fireEvent.changeText(screen.getByDisplayValue(""), "641234567"))
    await press("Send verification code")
    expect(sendVerifySms).toHaveBeenCalledWith("+381641234567")
    expect(onVisibleChange).toHaveBeenCalledWith(true)

    await type("Verification code", "123456")
    expect(checkVerifySms).toHaveBeenCalledWith("+381641234567", "123456")
    expect(onVisibleChange).toHaveBeenLastCalledWith(false)
    expect(mockReloadUser).toHaveBeenCalled()
  })
})

describe("the Apple name", () => {
  it("logs in with the typed first and last name", async () => {
    const onSubmit = jest.fn()
    await renderWithQuery(<ModalAppleNameLastName visible userSelect="CLIENT" onClose={jest.fn()} onSubmit={onSubmit} />)
    await type("First name", "Ana")
    await type("Last name", "Anic")
    await press("LOGIN WITH APPLE")
    expect(onSubmit).toHaveBeenCalledWith("Ana", "Anic")
  })
})

describe("replying to a review", () => {
  it("shows the review and sends the reply", async () => {
    await renderWithQuery(<ReplyReview visible type="CLIENT" onClose={jest.fn()} data={{ userName: "Pera Peric", taskName: "Fix the tap", rate: 4, message: "Quick and clean" }} />)
    expect(screen.getByText("TASKER:")).toBeTruthy()
    expect(screen.getByText("Quick and clean")).toBeTruthy()
    await type("YOUR REPLY TO THE REVIEW", "Thanks")
    expect(mockReply.setMessage).toHaveBeenCalledWith("Thanks")
    await press("REPLY")
    expect(mockReply.submit).toHaveBeenCalled()
  })
})

describe("a tasker canceling", () => {
  it("shows the client, the task and the agreed amount, and sends the reason", async () => {
    await renderWithQuery(<CancelTaskTasker visible onClose={jest.fn()} taskDetails={task} />)
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    expect(screen.getByLabelText("AMOUNT").props.value).toMatch(/2[.,]?500/)
    await type("ADD REASON FOR CANCELATION", "Ill")
    expect(mockCancel.setReason).toHaveBeenCalledWith("Ill")
    await press("CANCEL TASK")
    expect(mockCancel.submit).toHaveBeenCalled()
  })
})

describe("the payment", () => {
  const draw = (props = {}) => {
    const client = makeQueryClient()
    client.setQueryData(["appSettings"], { settings: { currency: "rsd" } })
    return renderWithQuery(
      <PaymentModal
        visible
        item={{ name: "Fix the tap" }}
        offer={{ price: 2500 }}
        fee={["100", "200", "300"]}
        onClose={jest.fn()}
        onRequestLink={jest.fn()}
        onOpenPayment={jest.fn()}
        onVisibleChange={jest.fn()}
        paymentLink="https://pay.example/1"
        {...props}
      />,
      client
    )
  }

  it("asks for a payment link as it opens", async () => {
    const onRequestLink = jest.fn()
    await draw({ onRequestLink })
    expect(onRequestLink).toHaveBeenCalledTimes(1)
  })

  it("without a link there is nothing to confirm", async () => {
    await draw({ paymentLink: null })
    expect(screen.queryByText("CONFIRM PAYMENT")).toBeNull()
  })

  it("the terms come first: the modal steps aside for the alert and comes back", async () => {
    const onOpenPayment = jest.fn()
    const onVisibleChange = jest.fn()
    await draw({ onOpenPayment, onVisibleChange })
    await press("CONFIRM PAYMENT")
    expect(onOpenPayment).not.toHaveBeenCalled()
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    await act(async () => alert().proceedAction())
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)
  })

  it("with the terms accepted, it opens the payment page", async () => {
    const onOpenPayment = jest.fn()
    await draw({ onOpenPayment })
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    await press("CONFIRM PAYMENT")
    expect(onOpenPayment).toHaveBeenCalled()
  })

  it("closed, it is not drawn and asks for nothing", async () => {
    const onRequestLink = jest.fn()
    await draw({ visible: false, onRequestLink })
    expect(onRequestLink).not.toHaveBeenCalled()
    expect(screen.queryByText("PAYMENT")).toBeNull()
  })
})
