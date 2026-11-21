import { waitFor } from "@testing-library/react-native"

import useAppData from "../main/useAppData"
import useUiStore from "../../stores/uiStore"
import { renderHookWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { getSettings } from "../../Services/settingsAPI"
import { translate } from "../../Helpers/language.utils"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/settingsAPI", () => ({ getSettings: jest.fn() }))

const CATEGORY = { id: 3, title: "Handyman", is_featured: 0, sub_categories: [] }
const SETTINGS = { categories: [], client_sliders: [], tasker_sliders: [], settings: { fee: "100,200,300" }, translations: { EN: { Hello: "Hello" } } }

beforeEach(() => {
  jest.clearAllMocks()
  useUiStore.setState({ spinners: 0, textsVersion: 0, selectedCat: null })
})

describe("the app's data at start", () => {
  it("uses the server's translations without moving the user off the screen they are on; the same ones again change nothing", async () => {
    // a cold start from a tapped push has already opened that push's screen
    getSettings.mockResolvedValue(SETTINGS)
    await renderHookWithQuery(() => useAppData(), { client: makeQueryClient() })
    await waitFor(() => expect(useUiStore.getState().textsVersion).toBe(1))
    expect(translate("Hello")).toBe("Hello")
    expect(navigation.navigate).not.toHaveBeenCalled()

    await renderHookWithQuery(() => useAppData(), { client: makeQueryClient() })
    await waitFor(() => expect(getSettings).toHaveBeenCalledTimes(2))
    expect(useUiStore.getState().textsVersion).toBe(1)
  })

  it("chooses the first category once the categories are there, and keeps a chosen one", async () => {
    // (Home is not drawn again when the settings arrive, so it could not do this)
    getSettings.mockResolvedValue({ ...SETTINGS, categories: [CATEGORY] })
    await renderHookWithQuery(() => useAppData(), { client: makeQueryClient() })
    await waitFor(() => expect(useUiStore.getState().selectedCat).toBe(3))

    useUiStore.setState({ selectedCat: 7 })
    await renderHookWithQuery(() => useAppData(), { client: makeQueryClient() })
    await waitFor(() => expect(getSettings).toHaveBeenCalledTimes(2))
    expect(useUiStore.getState().selectedCat).toBe(7)
  })
})
