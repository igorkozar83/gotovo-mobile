import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import * as ImagePicker from "expo-image-picker"

import { renderWithQuery } from "../../testUtils/render"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import NewPictureAndVideoModal from "../modals/NewPictureAndVideoModal"
import NewPictureModal from "../modals/NewPictureModal"
import SubmitReviewPopup from "../modals/SubmitReviewPopup"
import TaskDisputeModal from "../modals/TaskDisputeModal"
import ReviewReceived from "../modals/ReviewReceived"
import Register from "../modals/Register"
import { uploadUserImage } from "../../Services/UsersAPI"
import { getTaskById } from "../../Services/TasksAPI"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { All: "All", Images: "Images", Videos: "Videos" },
  UIImagePickerControllerQualityType: { Low: 2 },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn()
}))
jest.mock("../../Services/UsersAPI", () => ({ uploadImage: jest.fn(), uploadUserImage: jest.fn() }))
jest.mock("../../Services/TasksAPI", () => ({ getTaskById: jest.fn() }))
// the review, dispute and register forms have their own hook tests (formHooks, authForms): here, how the
// modals draw them and hand their actions on
const mockReview = { rate: 3, setRate: jest.fn(), message: "", setMessage: jest.fn(), photos: [], addPhoto: jest.fn(), removePhoto: jest.fn(), submit: jest.fn() }
jest.mock("../../hooks/reviews/useReviewForm", () => ({ __esModule: true, MAX_REVIEW_PHOTOS: 2, default: () => mockReview }))
const mockDispute = {
  reason: "",
  setReason: jest.fn(),
  detail: "",
  setDetail: jest.fn(),
  photos: [],
  addPhoto: jest.fn(),
  removePhoto: jest.fn(),
  canAddPhoto: jest.fn(),
  submit: jest.fn()
}
jest.mock("../../hooks/dispute/useDisputeForm", () => ({ __esModule: true, MAX_DISPUTE_PHOTOS: 3, default: () => mockDispute }))
const mockRegister = {
  field: (key) => ({ value: "", onChangeText: (text) => mockRegister.typed(key, text) }),
  typed: jest.fn(),
  agreement: false,
  setAgreement: jest.fn(),
  submit: jest.fn(),
  onGoogle: jest.fn(),
  onApple: jest.fn(),
  apple: { available: false, nameModal: { open: false, close: jest.fn(), submit: jest.fn() } }
}
jest.mock("../../hooks/auth/useRegisterForm", () => () => mockRegister)

const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const photo = { uri: "file://a.jpg", fileSize: 1024 * 1024 }

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT" } }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: "granted" })
  ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true })
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [photo] })
  ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [photo] })
})

describe("attaching a photo or video", () => {
  const draw = (props = {}) => renderWithQuery(<NewPictureAndVideoModal visible onClose={jest.fn()} onPick={jest.fn()} {...props} />)

  it("offers a camera video, a camera photo and the gallery", async () => {
    await draw()
    expect(screen.getByText("CAMERA VIDEO")).toBeTruthy()
    expect(screen.getByText("CAMERA IMAGE")).toBeTruthy()
    expect(screen.getByText("GALLERY")).toBeTruthy()
  })

  it("photos only: no video; videos only: no camera photo", async () => {
    await draw({ onlyImages: true })
    expect(screen.queryByText("CAMERA VIDEO")).toBeNull()
    await draw({ disableImageUpload: true })
    expect(screen.queryByText("CAMERA IMAGE")).toBeNull()
  })

  it("a picked photo closes the modal and is handed over", async () => {
    const onClose = jest.fn()
    const onPick = jest.fn()
    await draw({ onClose, onPick, onlyImages: true })
    await press("GALLERY")
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: "Images" }))
    expect(onClose).toHaveBeenCalled()
    expect(onPick).toHaveBeenCalledWith(photo)
  })

  it("a camera video over a minute is refused with an alert", async () => {
    ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file://v.mp4", duration: 61000 }] })
    const onPick = jest.fn()
    await draw({ onPick })
    await press("CAMERA VIDEO")
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: "Videos", videoMaxDuration: 60 }))
    expect(onPick).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, text: "Maximum length of video is 60 seconds." })
  })

  it("a refused permission keeps the modal open and explains why", async () => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false })
    const onClose = jest.fn()
    await draw({ onClose })
    await press("CAMERA IMAGE")
    expect(onClose).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Camera error" })
  })

  it("a canceled pick only closes it", async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true })
    const onClose = jest.fn()
    const onPick = jest.fn()
    await draw({ onClose, onPick })
    await press("GALLERY")
    expect(onClose).toHaveBeenCalled()
    expect(onPick).not.toHaveBeenCalled()
  })
})

describe("adding a profile document", () => {
  it("uploads the picked file right away; the user is reloaded and told it will be checked", async () => {
    uploadUserImage.mockResolvedValue(undefined)
    const reloadUser = jest.fn()
    const onClose = jest.fn()
    await renderWithQuery(<NewPictureModal visible onClose={onClose} reloadUser={reloadUser} />)
    await press("CAMERA")
    expect(uploadUserImage).toHaveBeenCalledWith(photo)
    expect(onClose).toHaveBeenCalled()
    expect(reloadUser).toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "success", title: "DOCUMENT UPLOAD" })
  })

  it("a refused gallery permission uploads nothing and keeps it open", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: "denied" })
    const onClose = jest.fn()
    await renderWithQuery(<NewPictureModal visible onClose={onClose} reloadUser={jest.fn()} />)
    await press("GALLERY")
    expect(uploadUserImage).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe("submitting a review", () => {
  const data = { type: "CLIENT", userName: "Pera Peric", taskName: "Fix the tap", taskId: 9 }

  it("shows whom and what for; the stars, the message and SUBMIT go to the form", async () => {
    await renderWithQuery(<SubmitReviewPopup visible onClose={jest.fn()} data={data} type="CLIENT" />)
    expect(screen.getByText("TASKER:")).toBeTruthy()
    expect(screen.getByText("Pera Peric")).toBeTruthy()
    await pressLabel("Rate 5")
    expect(mockReview.setRate).toHaveBeenCalledWith(5)
    await act(async () => fireEvent.changeText(screen.getByLabelText("YOUR REVIEW"), "Great"))
    expect(mockReview.setMessage).toHaveBeenCalledWith("Great")
    await press("SUBMIT REVIEW")
    expect(mockReview.submit).toHaveBeenCalled()
  })

  it("rating back from a review received (data.type is the notification's): a client rates the TASKER, a tasker the CLIENT", async () => {
    const received = { type: "review-received", userName: "Jovana", taskName: "Fix the tap", taskId: 9 }
    await renderWithQuery(<SubmitReviewPopup visible onClose={jest.fn()} data={received} type="CLIENT" />)
    expect(screen.getByText("TASKER:")).toBeTruthy()
    expect(screen.getByText("Jovana")).toBeTruthy()
    await renderWithQuery(<SubmitReviewPopup visible onClose={jest.fn()} data={received} type="TASKER" />)
    expect(screen.getByText("CLIENT:")).toBeTruthy()
  })

  it("adding a photo hides the popup, then the picker opens", async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    await renderWithQuery(<SubmitReviewPopup visible onClose={onClose} data={data} type="CLIENT" />)
    await pressLabel("Add photo")
    expect(onClose).toHaveBeenCalledWith(false)
    await act(async () => jest.advanceTimersByTime(200))
    expect(screen.getByText("GALLERY")).toBeTruthy()
    jest.useRealTimers()
  })
})

describe("opening a dispute", () => {
  const draw = (props = {}) =>
    renderWithQuery(
      <TaskDisputeModal visible data={{ taskId: 9 }} onClose={jest.fn()} onShow={jest.fn()} onHide={jest.fn()} onSubmitted={jest.fn()} onVisibleChange={jest.fn()} {...props} />
    )

  it("the reason, the details and OPEN DISPUTE go to the form", async () => {
    await draw()
    await act(async () => fireEvent.changeText(screen.getByLabelText("REASON"), "Not finished"))
    expect(mockDispute.setReason).toHaveBeenCalledWith("Not finished")
    await act(async () => fireEvent.changeText(screen.getByLabelText("EXPLAIN IN MORE DETAIL"), "The tap still drips"))
    expect(mockDispute.setDetail).toHaveBeenCalledWith("The tap still drips")
    await press("OPEN DISPUTE")
    expect(mockDispute.submit).toHaveBeenCalled()
  })

  it("a photo can be added while there is room: the modal steps aside for the picker", async () => {
    mockDispute.canAddPhoto.mockReturnValue(true)
    const onVisibleChange = jest.fn()
    await draw({ onVisibleChange })
    await pressLabel("Add photo")
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(screen.getByText("GALLERY")).toBeTruthy()
  })

  it("with no room left it stays", async () => {
    mockDispute.canAddPhoto.mockReturnValue(false)
    const onVisibleChange = jest.fn()
    await draw({ onVisibleChange })
    await pressLabel("Add photo")
    expect(onVisibleChange).not.toHaveBeenCalled()
  })
})

describe("a received review", () => {
  const data = { userName: "Pera Peric", taskName: "Fix the tap", rate: 4, message: "Pleasure", reviews: [] }

  it("shows it; OK goes to the finished tasks", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<ReviewReceived visible type="CLIENT" onClose={onClose} data={data} />)
    expect(screen.getByText("Pleasure")).toBeTruthy()
    await press("OK")
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { type: "finished" })
    expect(onClose).toHaveBeenCalled()
  })

  it("not rated back yet: RATE opens the review form", async () => {
    await renderWithQuery(<ReviewReceived visible type="CLIENT" onClose={jest.fn()} data={data} />)
    await press("RATE TASKER")
    expect(screen.getAllByText("SUBMIT REVIEW").length).toBeGreaterThan(0)
  })

  it("already rated back: no RATE button", async () => {
    await renderWithQuery(<ReviewReceived visible type="TASKER" onClose={jest.fn()} data={{ ...data, reviews: [{ user_id: 6 }] }} />)
    expect(screen.queryByText("RATE CLIENT")).toBeNull()
  })

  it("rated back since the notification came: the task says so, no RATE button", async () => {
    getTaskById.mockResolvedValueOnce({ id: 9, reviews: [{ user_id: 7 }, { user_id: 6 }] })
    await renderWithQuery(<ReviewReceived visible type="TASKER" onClose={jest.fn()} data={{ ...data, taskId: 9 }} />)
    expect(getTaskById).toHaveBeenCalledWith(9)
    // (once the task is in, not only while it loads)
    await act(async () => {})
    await act(async () => {})
    expect(screen.queryByText("RATE CLIENT")).toBeNull()
  })

  it("not rated back by the task either: RATE once the task is loaded", async () => {
    getTaskById.mockResolvedValueOnce({ id: 9, reviews: [{ user_id: 7 }] })
    await renderWithQuery(<ReviewReceived visible type="TASKER" onClose={jest.fn()} data={{ ...data, taskId: 9 }} />)
    expect(await screen.findByText("RATE CLIENT")).toBeTruthy()
  })

  it("a task that could not be loaded offers neither RATE nor REPLY", async () => {
    getTaskById.mockRejectedValueOnce(new Error("offline"))
    await renderWithQuery(<ReviewReceived visible type="TASKER" onClose={jest.fn()} data={{ ...data, taskId: 9 }} />)
    await act(async () => {})
    await act(async () => {})
    expect(screen.getByText("Pleasure")).toBeTruthy()
    expect(screen.queryByText("RATE CLIENT")).toBeNull()
    expect(screen.queryByText("REPLY TO REVIEW")).toBeNull()
  })

  it("replied to already: no REPLY button", async () => {
    getTaskById.mockResolvedValueOnce({ id: 9, reviews: [{ user_id: 7, receiver_user_id: 6, reply: { reply: "Thanks" } }] })
    await renderWithQuery(<ReviewReceived visible type="TASKER" onClose={jest.fn()} data={{ ...data, taskId: 9 }} />)
    // (RATE shows once the task is in: by then REPLY would too)
    expect(await screen.findByText("RATE CLIENT")).toBeTruthy()
    expect(screen.queryByText("REPLY TO REVIEW")).toBeNull()
  })

  it("REPLY opens the reply form", async () => {
    await renderWithQuery(<ReviewReceived visible type="CLIENT" onClose={jest.fn()} data={data} />)
    await press("REPLY TO REVIEW")
    expect(screen.getByLabelText("YOUR REPLY TO THE REVIEW")).toBeTruthy()
  })
})

describe("registering", () => {
  beforeEach(() => useUiStore.setState({ registerOpen: true, language: "EN" }))

  it("shows only while open; the X closes it", async () => {
    await renderWithQuery(<Register />)
    expect(screen.getByLabelText("Email")).toBeTruthy()
    await pressLabel("Close")
    expect(useUiStore.getState().registerOpen).toBe(false)
  })

  it("the fields, the terms, REGISTER and Google go to the form", async () => {
    await renderWithQuery(<Register />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("Email"), "ana@example.test"))
    expect(mockRegister.typed).toHaveBeenCalledWith("email", "ana@example.test")
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    expect(mockRegister.setAgreement).toHaveBeenCalledWith(true)
    await press("REGISTER")
    expect(mockRegister.submit).toHaveBeenCalled()
    await press("GOOGLE")
    expect(mockRegister.onGoogle).toHaveBeenCalled()
  })

  it("Enter in a field goes to the next one, and in the last one registers", async () => {
    await renderWithQuery(<Register />)
    await act(async () => fireEvent(screen.getByLabelText("Confirm Password"), "submitEditing"))
    expect(mockRegister.submit).toHaveBeenCalled()
  })
})
