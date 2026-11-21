import { act, waitFor } from "@testing-library/react-native"

import useProfileForm from "../profile/useProfileForm"
import useProfileActions from "../profile/useProfileActions"
import usePasswordForm from "../profile/usePasswordForm"
import useReloadUser from "../useReloadUser"
import useTaskDetails from "../taskDetails/useTaskDetails"
import useAddressForm from "../address/useAddressForm"
import useAuthStore, { LOGGED_OUT_USER } from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import { renderHookWithQuery } from "../../testUtils/render"
import * as UsersAPI from "../../Services/UsersAPI"
import * as PaymentsAPI from "../../Services/PaymentsAPI"
import { user as userApi, updatePassword } from "../../Services/API"
import { refused } from "../../testUtils/api"
import { hideAlert } from "../../stores/alerts"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/UsersAPI", () => ({
  updateProfile: jest.fn(),
  deleteUserImage: jest.fn(),
  removeUserAddress: jest.fn(),
  deleteAvatar: jest.fn(),
  removePhone: jest.fn(),
  addUserAddress: jest.fn(),
  editUserAddress: jest.fn()
}))
jest.mock("../../Services/PaymentsAPI", () => ({ removeCardInfo: jest.fn(), removeBankInfo: jest.fn() }))
jest.mock("../../Services/API", () => ({ user: jest.fn(), updatePassword: jest.fn() }))

// a v2 change answers nothing (204)
const OK = undefined
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const me = {
  id: 6,
  type: "CLIENT",
  name: "Ana",
  last_name: "Anić",
  about: "",
  gender: 1,
  age: 1990,
  languages: [{ language: "Srpski" }, { language: "Deutsch" }],
  verifications: { verified_tasker: false }
}

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: me }, userSelect: "CLIENT" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false }, modals: {} })
  useUiStore.setState({ spinners: 0 })
  userApi.mockResolvedValue(me)
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("the profile form", () => {
  it("starts from the user, with their languages ticked", async () => {
    const { result } = await renderHookWithQuery(() => useProfileForm())
    expect(result.current.fields).toEqual({ name: "Ana", lastName: "Anić", about: "", sex: 1, age: "1990", languages: { sr: true, en: false, cz: false, other: "Deutsch" } })
  })

  it("a changed text field is saved when editing ends; an empty name is refused", async () => {
    UsersAPI.updateProfile.mockResolvedValue(OK)
    const { result } = await renderHookWithQuery(() => useProfileForm())
    await act(async () => result.current.endEditing("about"))
    expect(UsersAPI.updateProfile).not.toHaveBeenCalled()

    await act(async () => result.current.setText("about", "Majstor"))
    await act(async () => result.current.endEditing("about"))
    expect(UsersAPI.updateProfile).toHaveBeenCalledWith({ about: "Majstor" })
    await waitFor(() => expect(userApi).toHaveBeenCalled())

    await act(async () => result.current.setText("name", ""))
    await act(async () => result.current.endEditing("name"))
    expect(alert()).toMatchObject({ text: "Please enter valid name." })
  })

  it("choices are saved right away; a year before 1900 is refused", async () => {
    UsersAPI.updateProfile.mockResolvedValue(OK)
    const { result } = await renderHookWithQuery(() => useProfileForm())
    await act(async () => result.current.chooseSex(0))
    await act(async () => result.current.toggleLanguage("en"))
    await act(async () => result.current.chooseOtherLanguage("Italiano"))
    expect(UsersAPI.updateProfile.mock.calls).toEqual([[{ gender: 0 }], [{ languages: ["Deutsch", "English", "Srpski"] }], [{ languages: ["Italiano", "English", "Srpski"] }]])
    await act(async () => result.current.chooseYear(1850))
    expect(alert()).toMatchObject({ text: "Age must be a number bigger than 1900." })
  })
})

describe("profile changes", () => {
  it("each removal reloads the user", async () => {
    UsersAPI.deleteUserImage.mockResolvedValue(OK)
    UsersAPI.removeUserAddress.mockResolvedValue(OK)
    UsersAPI.removePhone.mockResolvedValue(OK)
    PaymentsAPI.removeCardInfo.mockResolvedValue(OK)
    PaymentsAPI.removeBankInfo.mockResolvedValue(OK)
    const { result } = await renderHookWithQuery(() => useProfileActions())
    await act(async () => {
      await result.current.doDeleteUserImage(3)
      await result.current.removeAddress(2)
      await result.current.doRemovePhone()
      await result.current.doRemoveCardInfo(1)
      await result.current.doRemoveBankInfo(1)
    })
    expect(UsersAPI.deleteUserImage).toHaveBeenCalledWith(3)
    expect(UsersAPI.removeUserAddress).toHaveBeenCalledWith(2)
    expect(PaymentsAPI.removeBankInfo).toHaveBeenCalledWith(1)
    await waitFor(() => expect(userApi).toHaveBeenCalledTimes(5))
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("deleting the avatar tells the caller", async () => {
    UsersAPI.deleteAvatar.mockResolvedValue(OK)
    const onAvatarDeleted = jest.fn()
    const { result } = await renderHookWithQuery(() => useProfileActions({ onAvatarDeleted }))
    await act(async () => result.current.doDeleteAvatar())
    expect(onAvatarDeleted).toHaveBeenCalled()
  })

  it("editing the phone asks first, removes it and starts a new verification", async () => {
    UsersAPI.removePhone.mockResolvedValue(OK)
    const onPhoneRemovedForEdit = jest.fn()
    const { result } = await renderHookWithQuery(() => useProfileActions({ onPhoneRemovedForEdit }))
    await act(async () => result.current.checkDoEditPhone())
    expect(alert()).toMatchObject({ title: "Phone number edit confirm" })
    await act(async () => alert().proceedAction())
    expect(UsersAPI.removePhone).toHaveBeenCalled()
    expect(onPhoneRemovedForEdit).toHaveBeenCalled()
  })

  it("a failed field update says so; a refused one still reloads the user", async () => {
    UsersAPI.updateProfile
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(refused(422, "invalid", "The given data was invalid.", { about: ["validation.filled"] }))
    const { result } = await renderHookWithQuery(() => useProfileActions())
    await act(async () => result.current.updateProfile({ about: "x" }))
    expect(alert()).toMatchObject({ title: "Update profile info error" })
    await act(async () => result.current.updateProfile({ about: "x" }))
    await waitFor(() => expect(userApi).toHaveBeenCalled())
  })
})

describe("reloading the user", () => {
  it("keeps the rest of the user state and resolves to the user; a failure gives null", async () => {
    const { result } = await renderHookWithQuery(() => useReloadUser())
    await expect(result.current()).resolves.toBe(me)
    expect(useAuthStore.getState().user.loggedIn).toBe(true)
    userApi.mockRejectedValueOnce(new Error("offline"))
    await expect(result.current()).resolves.toBe(null)
    userApi.mockRejectedValueOnce(refused(401, "unauthenticated", "Unauthorized."))
    await expect(result.current()).resolves.toBe(null)
  })
})

describe("changing the password", () => {
  it("checks the new password, sends it and clears the form", async () => {
    updatePassword.mockResolvedValue(OK)
    const close = jest.fn()
    const { result } = await renderHookWithQuery(() => usePasswordForm(close))
    await act(async () => {
      result.current.setCurrent("oldpass12")
      result.current.setNext("short")
      result.current.setRepeated("other")
    })
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Minimum password length is 8.")
    // the user closes it
    await act(async () => hideAlert())
    expect(updatePassword).not.toHaveBeenCalled()

    await act(async () => {
      result.current.setNext("newpass12")
      result.current.setRepeated("newpass12")
    })
    await act(async () => result.current.submit())
    expect(updatePassword).toHaveBeenCalledWith("newpass12", "newpass12", "oldpass12")
    expect(result.current.next).toBe("")
    expect(alert()).toMatchObject({ type: "success", title: "Password change success" })
  })
})

describe("a task's details for a tasker", () => {
  const openTask = { id: 9, name: "Ormar", status: 0, posted_by: 1, posted_by_user: { id: 1, full_name: "Klijent" }, offers: [] }

  beforeEach(() => useAuthStore.setState({ user: { loggedIn: true, userData: { ...me, type: "TASKER", verifications: { verified_tasker: true } } }, userSelect: "TASKER" }))

  it("an open task of someone else can be asked about and offered on", async () => {
    const { result } = await renderHookWithQuery(() => useTaskDetails(openTask))
    expect(result.current).toMatchObject({ canAsk: true, canOffer: true, offerOpen: true, takesPart: false, poster: { id: 1 } })
    expect(result.current.mayAsk()).toBe(true)
    expect(result.current.mayOffer(false)).toBe(false)
    expect(alert()).toMatchObject({ title: "Agrement issue" })
    expect(result.current.mayOffer(true)).toBe(true)
  })

  it("a tasker taking part sees the full task", async () => {
    const { result } = await renderHookWithQuery(() => useTaskDetails({ ...openTask, status: 1, offers: [{ user_id: 6, status: 1 }] }))
    expect(result.current.takesPart).toBe(true)
    expect(result.current.canOffer).toBe(false)
  })

  it("an unverified tasker is sent to add their documents", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { ...me, type: "TASKER" } } })
    const { result } = await renderHookWithQuery(() => useTaskDetails(openTask))
    expect(alert()).toMatchObject({ title: "YOUR TASKER ACCOUNT IS NOT VERIFIED" })
    await act(async () => alert().proceedAction())
    expect(mockNavigate).toHaveBeenCalledWith("Profile", { navigationLicences: true })
    expect(result.current.mayAsk()).toBe(false)
  })

  it("a time the other side proposed opens its answer", async () => {
    await renderHookWithQuery(() =>
      useTaskDetails({ ...openTask, accepted_by_user: { id: 6, full_name: "Ja" }, proposed_time: [{ id: 5, user_id: 1, date: "2026-10-08", start: "10:00", end: "12:00" }] })
    )
    expect(useModalStore.getState().modals.newTime.data).toMatchObject({ taskId: 9, date: ["2026-10-08 10:00", "2026-10-08 12:00"] })
  })
})

describe("the address form", () => {
  const setup = (over = {}) => {
    const props = { dataAddress: null, open: true, close: jest.fn(), reloadUser: jest.fn(), onGuestAddress: jest.fn(), ...over }
    return renderHookWithQuery(() => useAddressForm(props)).then((rendered) => ({ ...rendered, props }))
  }

  it("needs a name, a city and valid coordinates", async () => {
    const { result } = await setup()
    await act(async () => result.current.set("coords")("95, 10"))
    await act(async () => result.current.submit())
    expect(alert().text).toContain("Please enter valid name.")
    expect(alert().text).toContain("Please enter valid city.")
    expect(alert().text).toContain("Please enter valid latitude")
  })

  it("a new address of a logged-in user is saved and the user reloads", async () => {
    UsersAPI.addUserAddress.mockResolvedValue(OK)
    const { result, props } = await setup()
    await act(async () => {
      result.current.set("name")("Kuća")
      result.current.fromMap({ street: "Maleška 14", city: "Beograd", zip: "11000", coords: { latitude: 44.8, longitude: 20.4 } })
    })
    await act(async () => result.current.submit())
    expect(UsersAPI.addUserAddress).toHaveBeenCalledWith(
      expect.objectContaining({ place_name: "Kuća", address: "Maleška 14", city: "Beograd", latitude: "44.8", longitude: "20.4" })
    )
    expect(props.reloadUser).toHaveBeenCalled()
    expect(props.close).toHaveBeenCalled()
    expect(result.current.form.name).toBe("")
  })

  it("a saved address is edited; a Google suggestion fills only what it has", async () => {
    UsersAPI.editUserAddress.mockResolvedValue(OK)
    const saved = { id: 2, place_name: "Posao", address: "Stara 1", city: "Novi Sad", zip: "21000", latitude: 45.2, longitude: 19.8, info: "", is_house: 0 }
    const { result } = await setup({ dataAddress: saved })
    expect(result.current.form).toMatchObject({ id: 2, name: "Posao", coords: "45.2, 19.8" })
    await act(async () => result.current.fromGoogle({ adr_address: '<span class="street-address">Nova 5</span>, <span class="locality">Novi Sad</span>' }))
    expect(result.current.form).toMatchObject({ address: "Nova 5", city: "Novi Sad", zip: "21000" })
    await act(async () => result.current.submit())
    expect(UsersAPI.editUserAddress).toHaveBeenCalledWith(expect.objectContaining({ id: 2, address: "Nova 5" }))
  })

  it("a guest's address goes back to the caller", async () => {
    useAuthStore.setState({ user: LOGGED_OUT_USER })
    const { result, props } = await setup()
    await act(async () => {
      result.current.set("name")("Kuća")
      result.current.set("city")("Beograd")
    })
    await act(async () => result.current.submit())
    expect(props.onGuestAddress).toHaveBeenCalledWith(expect.objectContaining({ place_name: "Kuća", city: "Beograd" }))
    expect(UsersAPI.addUserAddress).not.toHaveBeenCalled()
  })
})
