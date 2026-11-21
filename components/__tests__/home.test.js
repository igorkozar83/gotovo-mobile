import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client, tasker, taskOf } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import HomeClientCategoriesList from "../home/HomeClientCategoriesList"
import HomeTaskerJobsList from "../home/HomeTaskerJobsList"
import HomeTaskerItem from "../home/HomeTaskerItem"
import JobsFilterBar from "../home/JobsFilterBar"
import HomeSlider from "../home/HomeSlider"
import SideScroller from "../lists/SideScroller"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/NotificationsAPI", () => ({ countNotifications: jest.fn(() => new Promise(() => {})) }))

const as = (type, loggedIn = true) => useAuthStore.setState({ user: { loggedIn, userData: { ...(type === "CLIENT" ? client : tasker), type } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const slide = (fields) => ({ image: "s.jpg", text: "Need help", black_text: "at home?", ...fields })
const SETTINGS = {
  buttons: [
    { id: 1, text: "Popular", icon: "p.png", icon_tasker: "pt.png" },
    { id: 2, text: "Garden", icon: "g.png", icon_tasker: "gt.png" }
  ],
  services: [],
  clientSlider: [slide({ text: "Client slide" }), slide({ text: "Second slide" })],
  taskerSlider: [slide({ text: "Tasker slide" })],
  settings: {},
  translations: null
}
// a query client that already has the app settings (as Main loads them at start)
const withSettings = () => {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(["appSettings"], SETTINGS)
  return queryClient
}
const services = [
  { id: 1, image: "a.jpg", blackText: "Fix a leak", additionalText: "plumbing", categoryId: 3, tasks: [{ id: 30 }] },
  { id: 2, image: "b.jpg", blackText: "Mow the lawn", additionalText: "garden", categoryId: 4, tasks: [] }
]

beforeEach(() => {
  jest.clearAllMocks()
  as("CLIENT")
  useUiStore.setState({ language: "EN", selectedCat: 1, selectedJobId: null })
})

describe("the client's Home", () => {
  const draw = (props = {}) =>
    renderWithQuery(<HomeClientCategoriesList services={services} search="" onSearch={jest.fn()} found={0} fetching={false} extraData={["EN"]} {...props} />, withSettings())

  it("the slides, the S.O.S. offer, the categories and the services", async () => {
    await draw()
    expect(screen.getByText("Client slide")).toBeTruthy()
    expect(screen.getByText("SOS TASKS")).toBeTruthy()
    expect(screen.getByText("Garden")).toBeTruthy()
    expect(screen.getByText("Fix a leak")).toBeTruthy()
  })

  it("a service starts posting a task of its category and first job", async () => {
    await draw()
    await press("Fix a leak")
    expect(useUiStore.getState().selectedCat).toBe(3)
    expect(useUiStore.getState().selectedJobId).toBe(30)
    expect(navigation.navigate).toHaveBeenCalledWith("PostTask")
  })

  it("a service without jobs starts with none chosen", async () => {
    await draw()
    await press("Mow the lawn")
    expect(useUiStore.getState().selectedJobId).toBe(null)
  })

  it("S.O.S. starts an S.O.S. task", async () => {
    useUiStore.setState({ selectedJobId: 30 })
    await draw()
    await press("SOS TASKS")
    expect(useUiStore.getState().selectedJobId).toBe(null)
    expect(navigation.navigate).toHaveBeenCalledWith("PostTask", { isSos: true })
  })

  it("a category is chosen with a tap", async () => {
    await draw()
    await press("Garden")
    expect(useUiStore.getState().selectedCat).toBe(2)
  })

  it("the search: the typed text goes up, and the matches are counted", async () => {
    const onSearch = jest.fn()
    await draw({ onSearch, search: "leak", found: 1 })
    await act(async () => fireEvent.changeText(screen.getByLabelText("find a project"), "leaks"))
    expect(onSearch).toHaveBeenCalledWith("leaks")
    expect(screen.getByText(/matching results/)).toBeTruthy()
  })

  it("a slide opens its page", async () => {
    await renderWithQuery(<HomeSlider />, withSettings())
    await press("Second slide")
    expect(navigation.navigate).toHaveBeenCalledWith("Slider", { slide: expect.objectContaining({ text: "Second slide" }) })
  })

  it("the slides move on by themselves", async () => {
    jest.useFakeTimers()
    try {
      await renderWithQuery(<HomeSlider />, withSettings())
      await act(async () => jest.advanceTimersByTime(5000))
      expect(screen.getByText("Second slide")).toBeTruthy()
    } finally {
      jest.useRealTimers()
    }
  })
})

describe("the tasker's Home", () => {
  const filters = (fields = {}) => ({
    search: "",
    onSearchChange: jest.fn(),
    onSearchSubmit: jest.fn(),
    sort: "newest",
    onSort: jest.fn(),
    type: null,
    onType: jest.fn(),
    ...fields
  })
  const draw = (props = {}) =>
    renderWithQuery(
      <HomeTaskerJobsList filters={filters()} tasks={[taskOf()]} fetching={false} canLoadMore={false} onRefresh={jest.fn()} onLoadMore={jest.fn()} {...props} />,
      withSettings()
    )

  beforeEach(() => as("TASKER"))

  it("the tasker's slides, no S.O.S. offer; a task opens its details", async () => {
    const task = taskOf()
    const { client } = await draw({ tasks: [task] })
    expect(screen.getByText("Tasker slide")).toBeTruthy()
    expect(screen.queryByText("SOS TASKS")).toBeNull()
    await pressLabel("Fix the tap")
    expect(client.getQueryData(["task", task.id])).toEqual(task)
    expect(navigation.navigate).toHaveBeenCalledWith("TaskDetails", { taskId: task.id })
  })

  it("an open task: the client, their stars and count; the photo opens their profile", async () => {
    await renderWithQuery(<HomeTaskerItem task={taskOf({ is_sos: true })} />)
    expect(screen.getByText("S.O.S. task: Fix the tap")).toBeTruthy()
    expect(screen.getByText("Ana A.")).toBeTruthy()
    await pressLabel("Client profile")
    expect(navigation.navigate).toHaveBeenCalledWith("TaskerProfile", { profile: client })
  })

  it("the filters: a submitted search, the order and the task type", async () => {
    const f = filters()
    await renderWithQuery(<JobsFilterBar {...f} />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("find a project"), "paint"))
    expect(f.onSearchChange).toHaveBeenCalledWith("paint")
    await act(async () => fireEvent(screen.getByLabelText("find a project"), "endEditing"))
    expect(f.onSearchSubmit).toHaveBeenCalled()
    await press("Newest")
    await press("Oldest")
    expect(f.onSort).toHaveBeenCalledWith("oldest")
    await press("All ")
    await press("S.O.S")
    expect(f.onType).toHaveBeenCalledWith("sos")
  })

  it("an S.O.S. filter is named so", async () => {
    await renderWithQuery(<JobsFilterBar {...filters({ type: "sos", sort: "oldest" })} />)
    expect(screen.getByText("S.O.S. ")).toBeTruthy()
    expect(screen.getByText("Oldest")).toBeTruthy()
  })
})

describe("the sideways list", () => {
  it("the arrow scrolls on, and goes at the end", async () => {
    const r = await renderWithQuery(
      <SideScroller shadeColors={["#0000", "#000"]} shadeWidth={40} arrowColor="#fff">
        {null}
      </SideScroller>
    )
    await pressLabel("Scroll right")
    const [scroller] = r.root.queryAll((node) => node.props.horizontal === true)
    await act(async () => fireEvent.scroll(scroller, { nativeEvent: { layoutMeasurement: { width: 300 }, contentOffset: { x: 700 }, contentSize: { width: 1000 } } }))
    expect(screen.queryByLabelText("Scroll right")).toBeNull()
  })
})
