import { act, waitFor } from "@testing-library/react-native"

import { useMyTasksList, useInvalidateMyTasks } from "../queries/useMyTasks"
import { useInboxCount, useRefreshInboxCount } from "../queries/useInboxCount"
import { useNotificationsList, useMarkNotificationRead, useOffersList } from "../queries/useInbox"
import useAuthStore, { LOGGED_OUT_USER } from "../../stores/authStore"
import { renderHookWithQuery } from "../../testUtils/render"
import { pageOf, refused } from "../../testUtils/api"
import { getTasks, getTasksTasker, getTaskOffers } from "../../Services/TasksAPI"
import { countNotifications, getNotifications } from "../../Services/NotificationsAPI"

jest.mock("../../Services/TasksAPI", () => ({ getTasks: jest.fn(), getTasksTasker: jest.fn(), getTaskOffers: jest.fn(), getAllTaskQuestions: jest.fn() }))
jest.mock("../../Services/NotificationsAPI", () => ({ countNotifications: jest.fn(), getNotifications: jest.fn(), getConversations: jest.fn(), getCalendar: jest.fn() }))

const tasksPage = pageOf

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: LOGGED_OUT_USER, userSelect: "CLIENT" })
})

describe("My Tasks", () => {
  it("a client's current tasks load page by page", async () => {
    getTasks.mockResolvedValueOnce(tasksPage([{ id: 1 }, { id: 2 }], "c2")).mockResolvedValueOnce(tasksPage([{ id: 3 }]))
    const { result } = await renderHookWithQuery(() => useMyTasksList("CLIENT", false, true))
    await waitFor(() => expect(result.current.tasks).toHaveLength(2))
    expect(getTasks).toHaveBeenCalledWith(null, false)
    expect(result.current.canLoadMore).toBe(true)

    await act(async () => result.current.loadMore())
    await waitFor(() => expect(result.current.tasks.map((t) => t.id)).toEqual([1, 2, 3]))
    expect(getTasks).toHaveBeenLastCalledWith("c2", false)
    expect(result.current.canLoadMore).toBe(false)
    expect(result.current.noTasks).toBe(false)
  })

  it("a tasker's finished tasks come from the tasker list", async () => {
    getTasksTasker.mockResolvedValue(tasksPage([{ id: 5 }]))
    const { result } = await renderHookWithQuery(() => useMyTasksList("TASKER", true, true))
    await waitFor(() => expect(result.current.tasks).toEqual([{ id: 5 }]))
    expect(getTasksTasker).toHaveBeenCalledWith(null, true, true)
    expect(getTasks).not.toHaveBeenCalled()
  })

  it("an empty first page says there are no tasks yet; a failed one does not", async () => {
    getTasks.mockResolvedValueOnce(tasksPage([])).mockRejectedValueOnce(refused(500, "server_error", "Server Error"))
    const empty = await renderHookWithQuery(() => useMyTasksList("CLIENT", false, true))
    await waitFor(() => expect(empty.result.current.noTasks).toBe(true))
    const failed = await renderHookWithQuery(() => useMyTasksList("CLIENT", true, true))
    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(2))
    expect(failed.result.current.noTasks).toBe(false)
    expect(failed.result.current.tasks).toEqual([])
  })

  it("nothing loads while the tab is not shown", async () => {
    await renderHookWithQuery(() => useMyTasksList("CLIENT", false, false))
    expect(getTasks).not.toHaveBeenCalled()
  })

  it("after a change the shown list reloads", async () => {
    getTasks.mockResolvedValue(tasksPage([{ id: 1 }]))
    const { result } = await renderHookWithQuery(() => ({ list: useMyTasksList("CLIENT", false, true), invalidate: useInvalidateMyTasks() }))
    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(1))
    await act(async () => result.current.invalidate())
    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(2))
  })
})

describe("inbox count", () => {
  const counts = { count_questions: 1, count_offers: 2, count_messages: 3, count_notifications: 4 }

  it("is zero and not asked for while logged out", async () => {
    const { result } = await renderHookWithQuery(() => useInboxCount())
    expect(result.current.total).toBe(0)
    expect(countNotifications).not.toHaveBeenCalled()
  })

  it("adds up the tabs of the user's role and reloads when asked", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "TASKER" } } })
    countNotifications.mockResolvedValue(counts)
    const { result } = await renderHookWithQuery(() => ({ count: useInboxCount(), refresh: useRefreshInboxCount() }))
    await waitFor(() => expect(result.current.count).toEqual({ total: 10, questions: 1, offers: 2, chat: 3, notifications: 4 }))
    expect(countNotifications).toHaveBeenCalled()

    countNotifications.mockResolvedValue({ ...counts, count_messages: 0 })
    await act(async () => result.current.refresh())
    await waitFor(() => expect(result.current.count.total).toBe(7))
  })
})

describe("inbox lists", () => {
  it("a notification marked read is read in the loaded list", async () => {
    getNotifications.mockResolvedValue(
      pageOf([
        { id: 1, status: 0 },
        { id: 2, status: 0 }
      ])
    )
    const { result } = await renderHookWithQuery(() => ({ list: useNotificationsList(true), markRead: useMarkNotificationRead() }))
    await waitFor(() => expect(result.current.list.notifications).toHaveLength(2))
    expect(getNotifications).toHaveBeenCalledWith(null, 20)

    await act(async () => result.current.markRead(2))
    await waitFor(() => expect(result.current.list.notifications[1].status).toBe(1))
    expect(result.current.list.notifications).toEqual([
      { id: 1, status: 0 },
      { id: 2, status: 1 }
    ])
  })

  it("a refused notifications page is an error the tab can show", async () => {
    getNotifications.mockRejectedValue(refused(401, "unauthenticated", "Unauthorized."))
    const { result } = await renderHookWithQuery(() => useNotificationsList(true))
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.error.response.data.error.message).toBe("Unauthorized.")
    expect(result.current.notifications).toEqual([])
  })

  it("offers load with the chosen filter and sort", async () => {
    getTaskOffers.mockResolvedValue(pageOf([{ id: 30 }]))
    const { result } = await renderHookWithQuery(() => useOffersList({ filter: { task_id: 9 }, sort: "newest", sortPrice: null }, true))
    await waitFor(() => expect(result.current.offers).toEqual([{ id: 30 }]))
    expect(getTaskOffers).toHaveBeenCalledWith(null, { task_id: 9 }, { sort: "newest", sort_price: null })
  })
})
