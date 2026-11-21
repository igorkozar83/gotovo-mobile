import { act } from "@testing-library/react-native"

import useApiAction from "../useApiAction"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery } from "../../testUtils/render"

const alert = () => useModalStore.getState().mainAlert
const run = async (result, ...args) => {
  let resp
  await act(async () => {
    resp = await result.current.run(...args)
  })
  return resp
}

describe("useApiAction", () => {
  beforeEach(() => {
    useUiStore.setState({ spinners: 0 })
    useModalStore.setState({ mainAlert: { open: false } })
    jest.spyOn(console, "log").mockImplementation(() => {})
  })
  afterEach(() => jest.restoreAllMocks())

  it("passes the arguments, shows the success alert and calls onSuccess with the answer's data", async () => {
    const action = jest.fn().mockResolvedValue({ id: 5 })
    const onSuccess = jest.fn()
    const { result } = await renderHookWithQuery(() => useApiAction(action, { success: { title: "Done", text: "Saved" }, onSuccess }))

    const resp = await run(result, 7, "x")

    expect(action).toHaveBeenCalledWith(7, "x")
    expect(resp).toEqual({ id: 5 })
    expect(onSuccess).toHaveBeenCalledWith(resp, 7, "x")
    expect(alert()).toMatchObject({ open: true, type: "success", title: "Done", text: "Saved" })
  })

  it("shows the spinner while running and hides it after", async () => {
    let finish
    const action = jest.fn(() => new Promise((resolve) => (finish = resolve)))
    const { result } = await renderHookWithQuery(() => useApiAction(action))

    let pending
    await act(async () => {
      pending = result.current.run()
    })
    expect(useUiStore.getState().spinners).toBeGreaterThan(0)
    await act(async () => {
      finish(undefined)
      await pending
    })
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("leaves the spinner alone with spinner: false", async () => {
    const action = jest.fn().mockResolvedValue(undefined)
    const showSpinner = jest.spyOn(useUiStore.getState(), "showSpinner")
    const { result } = await renderHookWithQuery(() => useApiAction(action, { spinner: false }))
    await run(result)
    expect(showSpinner).not.toHaveBeenCalled()
  })

  it("shows `failed` when the request itself fails and resolves to null", async () => {
    const action = jest.fn().mockRejectedValue(new Error("Network Error"))
    const { result } = await renderHookWithQuery(() => useApiAction(action, { error: "Save error", failed: "Try later" }))

    const resp = await run(result)

    expect(resp).toBeNull()
    expect(alert()).toMatchObject({ title: "Save error", text: "Try later" })
  })

  it("refreshes the listed queries after a success", async () => {
    const action = jest.fn().mockResolvedValue(undefined)
    const { result, client } = await renderHookWithQuery(() => useApiAction(action, { invalidate: [["myTasks"], ["inboxCount"]] }))
    const invalidate = jest.spyOn(client, "invalidateQueries")

    await run(result)

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["myTasks"] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["inboxCount"] })
  })

  it("keeps run's identity across renders and runs with the latest options", async () => {
    const action = jest.fn().mockResolvedValue(undefined)
    const first = jest.fn()
    const second = jest.fn()
    const { result, rerender } = await renderHookWithQuery(({ onSuccess }) => useApiAction(action, { onSuccess }), { initialProps: { onSuccess: first } })
    const runBefore = result.current.run

    await rerender({ onSuccess: second })
    await run(result)

    expect(result.current.run).toBe(runBefore)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
  })

  describe("the API's answers", () => {
    // an axios error with the v2 answer
    const refused = (status, code, message, fields) => ({ response: { status, data: { error: { code, message, ...(fields ? { fields } : {}) } } } })

    it("succeeds when it resolves, with the caller's success text (204: no answer)", async () => {
      const action = jest.fn().mockResolvedValue(undefined)
      const onSuccess = jest.fn()
      const { result } = await renderHookWithQuery(() => useApiAction(action, { success: { title: "Done", text: "Task canceled successfully." }, onSuccess }))

      const resp = await run(result, 3)

      expect(resp).toBeUndefined()
      expect(onSuccess).toHaveBeenCalledWith(undefined, 3)
      expect(alert()).toMatchObject({ type: "success", title: "Done", text: "Task canceled successfully." })
    })

    it("passes the answer's data on", async () => {
      const action = jest.fn().mockResolvedValue({ id: 5 })
      const onSuccess = jest.fn()
      const { result } = await renderHookWithQuery(() => useApiAction(action, { onSuccess }))

      expect(await run(result)).toEqual({ id: 5 })
      expect(onSuccess).toHaveBeenCalledWith({ id: 5 })
    })

    it("shows a refusal's message and gives onError what the call threw (read with apiError)", async () => {
      const failure = refused(404, "not_found", "Task not found.")
      const action = jest.fn().mockRejectedValue(failure)
      const onError = jest.fn()
      const { result } = await renderHookWithQuery(() => useApiAction(action, { error: "Cancel error", onError }))

      expect(await run(result, 9)).toBeNull()
      expect(alert()).toMatchObject({ type: "error", title: "Cancel error", text: "Task not found." })
      expect(onError).toHaveBeenCalledWith(failure, 9)
    })

    it("a disabled account: no alert and no onError (the session ended with its own notice)", async () => {
      const action = jest.fn().mockRejectedValue(refused(401, "account_disabled", "Disabled"))
      const onError = jest.fn()
      const { result } = await renderHookWithQuery(() => useApiAction(action, { error: "Save error", failed: "Try later", onError }))

      expect(await run(result)).toBeNull()
      expect(alert().open).toBe(false)
      expect(onError).not.toHaveBeenCalled()
    })

    it("lists an invalid form's fields", async () => {
      const action = jest.fn().mockRejectedValue(refused(422, "invalid", "The given data was invalid.", { price: ["validation.required"] }))
      const { result } = await renderHookWithQuery(() => useApiAction(action, { error: "Offer error", invalid: {} }))

      await run(result)

      expect(alert()).toMatchObject({ title: "Offer error", text: "Please enter price." })
    })
  })
})
