import { act } from "@testing-library/react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import usePostTaskSubmit from "../postTask/usePostTaskSubmit"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { refused } from "../../testUtils/api"
import { createTask } from "../../Services/TasksAPI"
import { register } from "../../Services/API"
import { loadTaskDraft } from "../../Services/taskDraft"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/TasksAPI", () => ({ createTask: jest.fn() }))
jest.mock("../../Services/API", () => ({ register: jest.fn() }))
// the phone's files: the paths that exist
const mockFiles = new Set()
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///docs/",
  deleteAsync: jest.fn(async (path) => [...mockFiles].filter((file) => file.startsWith(path)).forEach((file) => mockFiles.delete(file))),
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async ({ from, to }) => {
    if (!mockFiles.has(from)) throw new Error("no such file " + from)
    mockFiles.add(to)
  }),
  getInfoAsync: jest.fn(async (uri) => ({ exists: mockFiles.has(uri) }))
}))

const payload = { name: "Ormar", description: "Sklapanje ormara", job_id: 3 }
const uploads = { images: [], video: null }
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()

beforeEach(async () => {
  jest.clearAllMocks()
  await AsyncStorage.clear()
  useUiStore.setState({ spinners: 0 })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("posting a task", () => {
  it("posts it, clears the form, reloads My Tasks and opens it from the alert", async () => {
    createTask.mockResolvedValue({ id: 40 })
    const onPosted = jest.fn()
    const { result, client } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted }))
    const invalidate = jest.spyOn(client, "invalidateQueries")
    await act(async () => result.current.post(payload, uploads))

    expect(createTask).toHaveBeenCalledWith(payload, uploads)
    expect(onPosted).toHaveBeenCalled()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["myTasks"] })
    expect(alert()).toMatchObject({ open: true, type: "success", title: "YOU HAVE POSTED A TASK" })
    expect(mockNavigate).not.toHaveBeenCalled()
    await act(async () => alert().proceedAction())
    expect(alert().open).toBe(false)
    expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { refresh: true })
  })

  it("a refused task lists the server's errors and keeps the form", async () => {
    createTask.mockRejectedValue(refused(422, "invalid", "The given data was invalid.", { form: ["Name is required", "Pick a date"] }))
    const onPosted = jest.fn()
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted }))
    await act(async () => result.current.post(payload, uploads))

    expect(onPosted).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "error", title: "Task create error", text: "Name is required\nPick a date" })
  })

  it("an invalid form is listed, not shown as the request's own error (an axios error has a code too)", async () => {
    const invalid = {
      ...refused(422, "invalid", "The given data was invalid.", { sub_category_task_id: ["validation.required"] }),
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 422"
    }
    createTask.mockRejectedValue(invalid)
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.post(payload, uploads))
    expect(alert()).toMatchObject({ open: true, title: "Task create error", text: "Please enter sub_category_task_id." })
  })

  it("a refusal without a list shows its error", async () => {
    createTask.mockRejectedValue(refused(422, "refused", "Too many open tasks"))
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.post(payload, uploads))
    expect(alert()).toMatchObject({ text: "Too many open tasks" })
  })

  it("a disabled account gets no second alert (the session's handler signed it out with its notice)", async () => {
    createTask.mockRejectedValue(refused(401, "account_disabled", "Your account is disabled"))
    const onPosted = jest.fn()
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted }))
    await act(async () => result.current.post(payload, uploads))
    expect(alert().open).toBe(false)
    expect(onPosted).not.toHaveBeenCalled()
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("a failed request says to try again and keeps the form", async () => {
    createTask.mockRejectedValue(new Error("Network Error"))
    const onPosted = jest.fn()
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted }))
    await act(async () => result.current.post(payload, uploads))
    expect(onPosted).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "error", title: "Task create error", text: "There was an error while creating task. Please try again later." })
    expect(useUiStore.getState().spinners).toBe(0)
  })
})

describe("a guest posting a task", () => {
  const guest = { email: "g@b.rs", password: "12345678", confirmPassword: "12345678", name: "Gost", lastName: "Gostić" }
  const values = { subTask: { id: 3 }, options: [], taskName: "Ormar", taskDesc: "Sklopiti", dates: [["2026-10-10 10:00", "2026-10-10 12:00"]], phone: "060", guest }

  it("registers them and keeps the task (never the password) for after their first sign-in", async () => {
    useUiStore.setState({ selectedCat: 2, language: "SR" })
    register.mockResolvedValue({ message: "Check your e-mail" })
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.registerThenPost(values))

    expect(register).toHaveBeenCalledWith({ email: "g@b.rs", password: "12345678", confirm_password: "12345678", full_name: "Gost", last_name: "Gostić", lang: "SR" })
    const draft = await loadTaskDraft()
    expect(draft).toMatchObject({ category: 2, values: { subTask: { id: 3 }, taskName: "Ormar", dates: values.dates } })
    expect(JSON.stringify(draft)).not.toContain("12345678")
    expect(createTask).not.toHaveBeenCalled()
    // registered: the login opens with the e-mail (after the server's message)
    await act(async () => useModalStore.getState().mainAlert.proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("Home", { registerSuccess: "g@b.rs" })
    // the route never carries the password
    expect(JSON.stringify(mockNavigate.mock.calls)).not.toContain("12345678")
  })

  it("the address they entered goes with the account (none entered: none sent)", async () => {
    register.mockResolvedValue({ message: "Check your e-mail" })
    const newAddress = { place_name: "Kuća", address: "Knez Mihailova 1", city: "Beograd", zip: "11000", info: "", is_house: true, latitude: "44.8", longitude: "20.4" }
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.registerThenPost({ ...values, newAddress }))
    expect(register).toHaveBeenLastCalledWith(expect.objectContaining({ email: "g@b.rs", address: newAddress }))

    await act(async () => result.current.registerThenPost(values))
    expect(register.mock.lastCall[0]).not.toHaveProperty("address")
  })

  it("keeps the picked photos and video with the draft, copied out of the picker's cache", async () => {
    mockFiles.add("file:///cache/ImagePicker/a.jpg")
    mockFiles.add("file:///cache/ImagePicker/b.mp4")
    register.mockResolvedValue({ message: "Check your e-mail" })
    const picked = [
      { uri: "file:///cache/ImagePicker/a.jpg", type: "image", fromTask: false },
      { uri: "file:///cache/ImagePicker/b.mp4", type: "video", fromTask: false }
    ]
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.registerThenPost(values, picked))

    // the picker's files may be gone by the first sign-in: the draft has its own copies
    mockFiles.delete("file:///cache/ImagePicker/a.jpg")
    mockFiles.delete("file:///cache/ImagePicker/b.mp4")
    expect((await loadTaskDraft()).media).toEqual([
      { uri: "file:///docs/taskDraft/0-a.jpg", type: "image", fromTask: false },
      { uri: "file:///docs/taskDraft/1-b.mp4", type: "video", fromTask: false }
    ])
  })

  it("a kept file that is gone is left out; one that could not be kept leaves the draft", async () => {
    register.mockResolvedValue({ message: "Check your e-mail" })
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.registerThenPost(values, [{ uri: "file:///cache/missing.jpg", type: "image" }]))
    expect(await loadTaskDraft()).toMatchObject({ values: { taskName: "Ormar" }, media: [] })

    await AsyncStorage.setItem("taskDraft", JSON.stringify({ category: 2, values, media: [{ uri: "file:///docs/taskDraft/0-gone.jpg", type: "image" }] }))
    expect((await loadTaskDraft()).media).toEqual([])
  })

  it("posting the task clears the draft and its files", async () => {
    mockFiles.add("file:///docs/taskDraft/0-a.jpg")
    await AsyncStorage.setItem("taskDraft", JSON.stringify({ category: 2, values, media: [{ uri: "file:///docs/taskDraft/0-a.jpg", type: "image" }] }))
    createTask.mockResolvedValue({ id: 40 })
    const { result } = await renderHookWithQuery(() => usePostTaskSubmit({ onPosted: jest.fn() }))
    await act(async () => result.current.post(payload, []))
    expect(await loadTaskDraft()).toBeNull()
    expect(mockFiles.has("file:///docs/taskDraft/0-a.jpg")).toBe(false)
  })
})
