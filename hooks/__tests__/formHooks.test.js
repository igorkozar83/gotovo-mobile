import { act, waitFor } from "@testing-library/react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import usePostTaskForm from "../postTask/usePostTaskForm"
import useTaskMedia from "../postTask/useTaskMedia"
import useLoadTask, { useLoadTaskOffer } from "../queries/useLoadTask"
import useDisputeForm from "../dispute/useDisputeForm"
import useReviewForm from "../reviews/useReviewForm"
import useReviewReply from "../reviews/useReviewReply"
import useQuestionForm from "../questions/useQuestionForm"
import usePhotoList from "../usePhotoList"
import useAuthStore, { LOGGED_OUT_USER } from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import { makeQueryClient, renderHookWithQuery } from "../../testUtils/render"
import { refused } from "../../testUtils/api"
import * as TasksAPI from "../../Services/TasksAPI"
import { hideAlert } from "../../stores/alerts"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/TasksAPI", () => ({
  createTask: jest.fn(),
  getTaskById: jest.fn(),
  getTaskOffer: jest.fn(),
  disputeTask: jest.fn(),
  createReview: jest.fn(),
  submitReviewReply: jest.fn()
}))
// the phone's files: the paths that exist
const mockFiles = new Set()
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///docs/",
  deleteAsync: jest.fn(async () => {}),
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async () => {}),
  getInfoAsync: jest.fn(async (uri) => ({ exists: mockFiles.has(uri) }))
}))

// a v2 change answers nothing (204), or what it made
const OK = undefined
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const job = { id: 11, name: "Sklapanje", options: [{ id: 1, type: 1 }] }
const settings = { services: [{ id: 3, categoryId: 3, tasks: [job, { id: 12, options: [] }] }], buttons: [], clientSlider: [], taskerSlider: [], settings: {}, translations: null }
const me = { id: 6, type: "CLIENT", mobile: 381601234567, addresses: [{ id: 5, place_name: "Kuća" }] }

// the query client with the app settings already loaded
const withSettings = () => {
  const client = makeQueryClient()
  client.setQueryData(["appSettings"], settings)
  return client
}

beforeEach(() => {
  jest.clearAllMocks()
  // (the phone's storage, e.g. a kept task draft, starts empty)
  AsyncStorage.clear()
  useAuthStore.setState({ user: { loggedIn: true, userData: me }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
  useUiStore.setState({ spinners: 0, selectedCat: 3, selectedJobId: null, currentServiceId: 3 })
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("the post-a-task form", () => {
  const setup = (params) => renderHookWithQuery(() => usePostTaskForm({ params }), { client: withSettings() })

  it("starts with the category's first job, the saved address and the SOS flag", async () => {
    const { result } = await setup({ isSos: true })
    await waitFor(() => expect(result.current.subTask.id).toBe(11))
    expect(result.current.jobs.map((j) => j.id)).toEqual([11, 12])
    expect(result.current.form.getValues("options")).toEqual([{ id: 1, value: 10 }])
    expect(result.current.form.getValues("address")).toEqual(me.addresses[0])
    expect(result.current.form.getValues("isSos")).toBe(true)
  })

  it("options are set and toggled", async () => {
    const { result } = await setup()
    await waitFor(() => expect(result.current.subTask.id).toBe(11))
    await act(async () => result.current.setOption(1, 3))
    expect(result.current.form.getValues("options")).toEqual([{ id: 1, value: 3 }])
    await act(async () => result.current.toggleOption(1))
    expect(result.current.form.getValues("options")).toEqual([{ id: 1, value: 0 }])
  })

  it("the saved phone fills the contact", async () => {
    const { result } = await setup()
    await act(async () => result.current.form.setValue("useSavedPhone", true))
    await waitFor(() => expect(result.current.form.getValues("phone")).toBe("381601234567"))
  })

  it("an incomplete form lists what is missing; a complete one is posted", async () => {
    TasksAPI.createTask.mockResolvedValue(OK)
    const { result } = await setup()
    await waitFor(() => expect(result.current.subTask.id).toBe(11))
    await act(async () => result.current.submit())
    expect(alert()).toMatchObject({ title: "Task create error" })
    expect(alert().text).toContain("Please enter task name.")

    await act(async () => {
      const { setValue } = result.current.form
      setValue("taskName", "Ormar")
      setValue("taskDesc", "Sklapanje ormara")
      setValue("dates", [["2026-10-08 10:00", "2026-10-08 12:00"]])
      setValue("agreement", true)
      setValue("phone", "0601234567")
    })
    await act(async () => result.current.submit())
    await waitFor(() => expect(TasksAPI.createTask).toHaveBeenCalled())
    expect(TasksAPI.createTask.mock.calls[0][0]).toMatchObject({ sub_category_task_id: 11, name: "Ormar", place: 5, contact: "0601234567" })
    // the posted form is cleared for the next task
    await waitFor(() => expect(result.current.form.getValues("taskName")).toBe(""))
  })

  it("a task kept while registering fills the form (its category, job and texts)", async () => {
    await AsyncStorage.setItem(
      "taskDraft",
      JSON.stringify({ category: 3, values: { subTask: { id: 12 }, options: [], taskName: "Ormar", taskDesc: "Sklopiti", dates: [["2026-10-10 10:00", "2026-10-10 12:00"]] } })
    )
    const { result } = await setup({ draft: true })
    await waitFor(() => expect(result.current.form.getValues("taskName")).toBe("Ormar"))
    expect(result.current.subTask.id).toBe(12)
    expect(result.current.form.getValues("dates")).toEqual([["2026-10-10 10:00", "2026-10-10 12:00"]])
  })

  it("and its photos come back, to upload as picked", async () => {
    const kept = { uri: "file:///docs/taskDraft/0-a.jpg", type: "image" }
    mockFiles.add(kept.uri)
    await AsyncStorage.setItem("taskDraft", JSON.stringify({ category: 3, values: { subTask: { id: 12 }, taskName: "Ormar" }, media: [kept] }))
    const { result } = await setup({ draft: true })
    await waitFor(() => expect(result.current.media.media).toHaveLength(1))
    expect(result.current.media.uploads()).toEqual([{ ...kept, fromTask: false }])
  })

  it("a task to post again fills the form from the old one", async () => {
    TasksAPI.getTaskById.mockResolvedValue({
      id: 40,
      name: "Staro",
      description: "Opis",
      sub_category_task_id: 12,
      category_id: 3,
      images: [],
      options: [],
      times: [],
      contact: "060"
    })
    const { result } = await setup({ repost: 40 })
    await waitFor(() => expect(result.current.form.getValues("taskName")).toBe("Staro"))
    expect(TasksAPI.getTaskById).toHaveBeenCalledWith(40)
  })
})

describe("a task's photos and video", () => {
  it("takes up to 6 photos and 1 video, uploading only the new ones", async () => {
    const { result } = await renderHookWithQuery(() => useTaskMedia())
    await act(async () => result.current.setFromTask(["http://old/1.jpg"]))
    await act(async () => {
      for (let i = 0; i < 5; i++) result.current.add({ uri: `file:///${i}.jpg` })
      result.current.add({ uri: "file:///v.mp4" })
    })
    expect(result.current.imagesFull).toBe(true)
    expect(result.current.videoFull).toBe(true)
    expect(result.current.canAdd()).toBe(false)
    expect(alert()).toMatchObject({ title: "Image/Video limit" })
    expect(result.current.uploads()).toHaveLength(6)
    expect(result.current.keptFromTask()).toEqual([{ uri: "http://old/1.jpg" }])
    await act(async () => result.current.remove(0))
    expect(result.current.keptFromTask()).toEqual([])
    await act(async () => result.current.clear())
    expect(result.current.media).toEqual([])
  })
})

describe("loading a task on demand", () => {
  it("resolves to the task; a refusal or failure shows an error and gives null", async () => {
    TasksAPI.getTaskById.mockResolvedValueOnce({ id: 9 }).mockRejectedValueOnce(refused(404, "not_found", "Gone"))
    const { result, client } = await renderHookWithQuery(() => useLoadTask())
    await expect(result.current(9)).resolves.toEqual({ id: 9 })
    client.clear()
    await expect(result.current(9)).resolves.toBe(null)
    expect(alert()).toMatchObject({ title: "Task info retrieve error", text: "Gone" })
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("a task offer too", async () => {
    TasksAPI.getTaskOffer.mockRejectedValue(new Error("offline"))
    const { result } = await renderHookWithQuery(() => useLoadTaskOffer())
    await expect(result.current(30)).resolves.toBe(null)
    expect(alert()).toMatchObject({ text: "We couldnt get task offer info" })
  })
})

describe("opening a dispute", () => {
  const setup = () => {
    const hooks = { hide: jest.fn(), show: jest.fn(), onSubmitted: jest.fn(), onDisputed: jest.fn() }
    return renderHookWithQuery(() => useDisputeForm({ data: { taskId: 9 }, ...hooks })).then((r) => ({ ...r, hooks }))
  }

  it("needs a reason and the details, then sends them with the photos", async () => {
    TasksAPI.disputeTask.mockResolvedValue(OK)
    const { result, hooks } = await setup()
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Please enter reason.")
    // the user closes it
    await act(async () => hideAlert())
    await act(async () => {
      result.current.setReason("Nije došao")
      result.current.setDetail("Čekao sam ceo dan")
      result.current.addPhoto({ uri: "file:///p.jpg" })
    })
    await act(async () => result.current.submit())
    expect(hooks.hide).toHaveBeenCalled()
    expect(TasksAPI.disputeTask).toHaveBeenCalledWith({ taskId: 9, reason: "Nije došao", detail: "Čekao sam ceo dan" }, [{ uri: "file:///p.jpg" }])
    expect(hooks.onSubmitted).toHaveBeenCalled()
    await act(async () => alert().proceedAction())
    expect(hooks.onDisputed).toHaveBeenCalled()
    expect(result.current.reason).toBe("")
  })

  it("a failed dispute brings the modal back", async () => {
    TasksAPI.disputeTask.mockRejectedValue(new Error("offline"))
    const { result, hooks } = await setup()
    await act(async () => {
      result.current.setReason("r")
      result.current.setDetail("d")
    })
    await act(async () => result.current.submit())
    expect(hooks.show).toHaveBeenCalled()
  })
})

describe("reviewing the other party", () => {
  const data = { taskId: 9, userIdClient: 7 }

  it("a message is needed; a saved review thanks the user and shows the finished tasks", async () => {
    TasksAPI.createReview.mockResolvedValue(OK)
    const hide = jest.fn()
    const show = jest.fn()
    const { result } = await renderHookWithQuery(() => useReviewForm({ data, hide, show }))
    expect(result.current.rate).toBe(1)
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Please enter message.")
    await act(async () => alert().proceedAction())
    expect(show).toHaveBeenCalled()

    await act(async () => {
      result.current.setMessage("Odlično")
      result.current.setRate(5)
    })
    await act(async () => result.current.submit())
    expect(TasksAPI.createReview).toHaveBeenCalledWith({ task_id: 9, receiver_user_id: 7, rate: 5, message: "Odlično" }, [], undefined)
    expect(alert()).toMatchObject({ title: "THANK YOU! YOUR REVIEW HAS BEEN SUBMITTED" })
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { type: "finished" })
    expect(result.current.message).toBe("")
  })

  it("a reply needs a message, then is sent and announced", async () => {
    TasksAPI.submitReviewReply.mockResolvedValue(OK)
    const close = jest.fn()
    const { result } = await renderHookWithQuery(() => useReviewReply({ taskId: 9 }, close))
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Please enter message.")
    // the user closes it
    await act(async () => hideAlert())
    await act(async () => result.current.setMessage("Hvala"))
    await act(async () => result.current.submit())
    expect(TasksAPI.submitReviewReply).toHaveBeenCalledWith({ task_id: 9, message: "Hvala" })
    expect(alert()).toMatchObject({ title: "THANK YOU! YOUR REPLY HAS BEEN SUBMITTED." })
    await act(async () => alert().proceedAction())
    expect(alert().open).toBe(false)
  })

  it("a refused reply shows the server's error", async () => {
    TasksAPI.submitReviewReply.mockRejectedValue(refused(422, "refused", "Already replied"))
    const { result } = await renderHookWithQuery(() => useReviewReply({ taskId: 9 }, jest.fn()))
    await act(async () => result.current.setMessage("Hvala"))
    await act(async () => result.current.submit())
    expect(alert()).toMatchObject({ text: "Already replied" })
  })
})

describe("small forms", () => {
  it("a question needs its text; its picture can be removed", async () => {
    const { result } = await renderHookWithQuery(() => useQuestionForm())
    expect(result.current.validated("Question error")).toBe(false)
    expect(alert()).toMatchObject({ title: "Question error", text: "Please write a question." })
    await act(async () => {
      result.current.setText("Kada?")
      result.current.setImage({ uri: "file:///q.jpg" })
    })
    expect(result.current.validated("Question error")).toBe(true)
    await act(async () => result.current.removeImage())
    expect(result.current.image).toBe(null)
    await act(async () => result.current.clear())
    expect(result.current.text).toBe("")
  })

  it("a photo list is full at its maximum", async () => {
    const { result } = await renderHookWithQuery(() => usePhotoList(1, { title: "Full", text: "Remove one" }))
    await act(async () => result.current.add({ uri: "a" }))
    expect(result.current.canAdd()).toBe(false)
    expect(alert()).toMatchObject({ title: "Full" })
    await act(async () => result.current.remove(0))
    expect(result.current.canAdd()).toBe(true)
  })
})

describe("a guest posting", () => {
  it("uses the guest checks", async () => {
    useAuthStore.setState({ user: LOGGED_OUT_USER })
    const { result } = await renderHookWithQuery(() => usePostTaskForm({ params: undefined }), { client: withSettings() })
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Please enter valid email.")
  })
})
