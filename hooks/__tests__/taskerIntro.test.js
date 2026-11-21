import AsyncStorage from "@react-native-async-storage/async-storage"

import { showTaskerIntroOnce } from "../main/taskerIntro"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"

const initialModals = useModalStore.getState()
const as = (userData, loggedIn = true) => useAuthStore.setState({ user: { loggedIn, userData } })
const shown = () => Boolean(useModalStore.getState().modals.taskerIntro?.open)

beforeEach(async () => {
  await AsyncStorage.clear()
  useModalStore.setState({ ...initialModals, modals: {}, modalQueue: [], framesOnScreen: 0 })
})

describe("what it takes to be a tasker", () => {
  it("is told once, the first time the side is chosen", async () => {
    as({ id: 1, verifications: {}, tasks_count_tasker: 0 })
    await showTaskerIntroOnce()
    expect(shown()).toBe(true)
    useModalStore.setState({ modals: {} })
    await showTaskerIntroOnce()
    expect(shown()).toBe(false)
  })

  it("is not told to a tasker already, even on a new installation", async () => {
    as({ id: 1, verifications: { verified_tasker: 1 }, tasks_count_tasker: 0 })
    await showTaskerIntroOnce()
    expect(shown()).toBe(false)
    await AsyncStorage.clear()
    as({ id: 2, verifications: {}, tasks_count_tasker: 3 })
    await showTaskerIntroOnce()
    expect(shown()).toBe(false)
  })

  it("a guest is told", async () => {
    as({ reviews: [] }, false)
    await showTaskerIntroOnce()
    expect(shown()).toBe(true)
  })
})
