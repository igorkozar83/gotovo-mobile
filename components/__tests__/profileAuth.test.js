import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import * as ImagePicker from "expo-image-picker"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client, tasker } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import AddressBookSection from "../profile/AddressBookSection"
import ContactSection from "../profile/ContactSection"
import DocumentsSection from "../profile/DocumentsSection"
import GeneralDataSection from "../profile/GeneralDataSection"
import IncomeAccountsModal from "../profile/IncomeAccountsModal"
import IncomeAccountsSection from "../profile/IncomeAccountsSection"
import PasswordModal from "../profile/PasswordModal"
import ProfileLinks from "../profile/ProfileLinks"
import ProfilePictureModal from "../profile/ProfilePictureModal"
import UserInfo from "../profile/UserInfo"
import UserBadges from "../profile/UserBadges"
import { LevelRibbon, MiniBadges } from "../profile/UserLevelBadges"
import AddressModal from "../address/AddressModal"
import MapModal from "../address/MapModal"
import BuildingType from "../address/BuildingType"
import Sidebar from "../sidebar/Sidebar"
import UserRoleSelector from "../sidebar/UserRoleSelector"
import Auth from "../Auth"
import { PasswordField } from "../auth/AuthField"
import SocialIcons from "../auth/SocialIcons"
import { storeBankAccount } from "../../Services/PaymentsAPI"
import { getAddress, uploadImage } from "../../Services/UsersAPI"
import { logout } from "../../Services/API"
import { showTaskerIntroOnce } from "../../hooks/main/taskerIntro"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { All: "All", Images: "Images", Videos: "Videos" },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn()
}))
jest.mock("../../Services/PaymentsAPI", () => ({ storeBankAccount: jest.fn() }))
jest.mock("../../Services/UsersAPI", () => ({ getAddress: jest.fn(), uploadImage: jest.fn(), uploadUserImage: jest.fn() }))
jest.mock("../../Services/API", () => ({ logout: jest.fn(), user: jest.fn() }))
jest.mock("../../Services/NotificationsAPI", () => ({ countNotifications: jest.fn(() => new Promise(() => {})) }))
jest.mock("../../hooks/main/taskerIntro", () => ({ showTaskerIntroOnce: jest.fn() }))
jest.mock("../../hooks/main/useLanguageSetup", () => ({ chooseLanguage: jest.fn() }))
// Google's suggestions: the field, and a suggestion to pick
jest.mock("react-native-google-places-autocomplete", () => {
  const { Pressable, TextInput } = require("react-native")
  return {
    GooglePlacesAutocomplete: ({ value, onChangeText, onPress }) => (
      <>
        <TextInput accessibilityLabel="Address search" value={value} onChangeText={onChangeText} />
        <Pressable accessibilityRole="button" accessibilityLabel="Suggestion" onPress={() => onPress({}, { formatted_address: "Main 1" })} />
      </>
    )
  }
})
// the forms with their own hook tests (profileHooks, authForms, formHooks): here, the wiring
const mockProfile = {
  fields: { name: "Ana", lastName: "Anic", about: "", languages: { sr: true, en: false, other: "" }, sex: 1, age: 1990 },
  setText: jest.fn(),
  endEditing: jest.fn(),
  chooseSex: jest.fn(),
  chooseYear: jest.fn(),
  toggleLanguage: jest.fn(),
  chooseOtherLanguage: jest.fn()
}
jest.mock("../../hooks/profile/useProfileForm", () => () => mockProfile)
const mockPassword = { current: "", setCurrent: jest.fn(), next: "", setNext: jest.fn(), repeated: "", setRepeated: jest.fn(), submit: jest.fn() }
jest.mock("../../hooks/profile/usePasswordForm", () => () => mockPassword)
const mockAddress = {
  form: { name: "", address: "", city: "", zip: "", isHouse: true },
  set: jest.fn(() => jest.fn()),
  fromMap: jest.fn(),
  fromGoogle: jest.fn(),
  cancel: jest.fn(),
  submit: jest.fn()
}
jest.mock("../../hooks/address/useAddressForm", () => () => mockAddress)
const mockLogin = {
  email: "",
  setEmail: jest.fn(),
  password: "",
  setPassword: jest.fn(),
  submit: jest.fn(),
  loginWithGoogle: jest.fn(),
  apple: { available: false, start: jest.fn(), nameModal: { open: false, close: jest.fn(), submit: jest.fn() } },
  verifyPhoneOpen: false,
  setVerifyPhoneOpen: jest.fn()
}
jest.mock("../../hooks/auth/useLoginForm", () => () => mockLogin)

const as = (type, userData = {}, loggedIn = true) =>
  useAuthStore.setState({ user: { loggedIn, userData: { ...(type === "CLIENT" ? client : tasker), type, ...userData } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()

beforeEach(() => {
  jest.clearAllMocks()
  as("CLIENT")
  useUiStore.setState({ language: "EN", authOpen: false, registerOpen: false, openMenuContext: false })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: "granted" })
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file://me.jpg" }] })
})

describe("the profile sections", () => {
  it("the address book: edit or remove each, add while under six", async () => {
    const onEdit = jest.fn()
    const onRemove = jest.fn()
    const onAdd = jest.fn()
    const home = { id: 3, place_name: "Home" }
    as("CLIENT", { addresses: [home] })
    await renderWithQuery(<AddressBookSection onAdd={onAdd} onEdit={onEdit} onRemove={onRemove} />)
    expect(screen.getByText("Home")).toBeTruthy()
    await pressLabel("Edit")
    expect(onEdit).toHaveBeenCalledWith(home)
    await pressLabel("Remove")
    expect(onRemove).toHaveBeenCalledWith(3)
    await press("NEW ADDRESS")
    expect(onAdd).toHaveBeenCalled()
  })

  it("six addresses: no new one", async () => {
    as("CLIENT", { addresses: [1, 2, 3, 4, 5, 6].map((id) => ({ id, place_name: "Place " + id })) })
    await renderWithQuery(<AddressBookSection onAdd={jest.fn()} onEdit={jest.fn()} onRemove={jest.fn()} />)
    expect(screen.queryByText("NEW ADDRESS")).toBeNull()
  })

  it("an unverified phone opens its verification", async () => {
    const onVerifyPhone = jest.fn()
    as("CLIENT", { email: "ana@example.test", mobile: null, phone_verified: 0 })
    await renderWithQuery(<ContactSection onVerifyPhone={onVerifyPhone} onRemovePhone={jest.fn()} onEditPhone={jest.fn()} />)
    expect(screen.getByLabelText("EMAIL").props.value).toBe("ana@example.test")
    await pressLabel("Verify phone number")
    expect(onVerifyPhone).toHaveBeenCalled()
  })

  it("a verified phone can be removed or replaced, not verified again", async () => {
    const handlers = { onVerifyPhone: jest.fn(), onRemovePhone: jest.fn(), onEditPhone: jest.fn() }
    as("CLIENT", { mobile: 381641234567, phone_verified: 1 })
    await renderWithQuery(<ContactSection {...handlers} />)
    expect(screen.getByText("(Phone verified)")).toBeTruthy()
    await pressLabel("Verify phone number")
    expect(handlers.onVerifyPhone).not.toHaveBeenCalled()
    await pressLabel("Remove")
    await pressLabel("Edit")
    expect(handlers.onRemovePhone).toHaveBeenCalled()
    expect(handlers.onEditPhone).toHaveBeenCalled()
  })

  it("the documents: preview, remove, add", async () => {
    const doc = { id: 1, image: "https://x/id.jpg" }
    const handlers = { onLayoutY: jest.fn(), onAdd: jest.fn(), onPreview: jest.fn(), onRemove: jest.fn() }
    as("TASKER", { user_images: [doc] })
    await renderWithQuery(<DocumentsSection {...handlers} />)
    await pressLabel("Open photo")
    expect(handlers.onPreview).toHaveBeenCalledWith(doc)
    await pressLabel("Remove photo")
    expect(handlers.onRemove).toHaveBeenCalledWith(doc)
    await pressLabel("Add photo")
    expect(handlers.onAdd).toHaveBeenCalled()
  })

  it("the general data go to the form as edited", async () => {
    await renderWithQuery(<GeneralDataSection />)
    expect(screen.getByLabelText("First name").props.value).toBe("Ana")
    await act(async () => fireEvent.changeText(screen.getByLabelText("ABOUT MYSELF"), "Painter"))
    expect(mockProfile.setText).toHaveBeenCalledWith("about", "Painter")
    await act(async () => fireEvent(screen.getByLabelText("ABOUT MYSELF"), "endEditing"))
    expect(mockProfile.endEditing).toHaveBeenCalledWith("about")
    await act(async () => fireEvent.press(screen.getByRole("checkbox", { name: "ENGLISH" })))
    expect(mockProfile.toggleLanguage).toHaveBeenCalledWith("en")
    await act(async () => fireEvent.press(screen.getByRole("radio", { name: "Male" })))
    expect(mockProfile.chooseSex).toHaveBeenCalledWith(0)
  })

  it("the links: password, task history, reviews", async () => {
    const onChangePassword = jest.fn()
    await renderWithQuery(<ProfileLinks onChangePassword={onChangePassword} />)
    await press("CHANGE PASSWORD")
    expect(onChangePassword).toHaveBeenCalled()
    await press("TASK HISTORY")
    expect(navigation.navigate).toHaveBeenCalledWith("MyTasks", { type: "finished" })
    await press("REVIEWS")
    expect(navigation.navigate).toHaveBeenCalledWith("MyReviews")
  })
})

describe("the bank account", () => {
  const fill = async () => {
    for (const [label, value] of [
      ["OWNER NAME", "Pera Peric"],
      ["ADDRESS", "Main 1"],
      ["BANK", "Banka"],
      ["IBAN/ACCOUNT NUMBER", "RS35"],
      ["SWIFT", "BANKRSBG"],
      ["COUNTRY CODE", "RS"]
    ])
      await act(async () => fireEvent.changeText(screen.getByLabelText(label), value))
  }

  it("lists what is missing and stays open", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<IncomeAccountsModal visible onClose={onClose} reloadUser={jest.fn()} />)
    await press("CONFIRM ACCOUNT")
    expect(onClose).not.toHaveBeenCalled()
    expect(alert().text.split("\n")[0]).toBe("Please enter address")
  })

  it("a complete account is saved and the user reloaded", async () => {
    storeBankAccount.mockResolvedValue(undefined)
    const onClose = jest.fn()
    const reloadUser = jest.fn()
    await renderWithQuery(<IncomeAccountsModal visible onClose={onClose} reloadUser={reloadUser} />)
    await fill()
    await press("CONFIRM ACCOUNT")
    expect(onClose).toHaveBeenCalled()
    expect(storeBankAccount).toHaveBeenCalledWith({ owner_name: "Pera Peric", address: "Main 1", bank: "Banka", iban: "RS35", swift: "BANKRSBG", country_code: "RS" })
    expect(reloadUser).toHaveBeenCalled()
  })

  it("editing starts from the saved account", async () => {
    await renderWithQuery(<IncomeAccountsModal visible onClose={jest.fn()} reloadUser={jest.fn()} editBankAccount data={{ owner_name: "Pera", bank: "Banka" }} />)
    expect(screen.getByLabelText("OWNER NAME").props.value).toBe("Pera")
  })

  it("the saved accounts: a card and a bank account, or a way to add one", async () => {
    const handlers = { onRemoveCard: jest.fn(), onRemoveBank: jest.fn(), onEditBank: jest.fn(), onAddBank: jest.fn() }
    const bank = { id: 2, bank: "Banka", iban: "RS35" }
    as("TASKER", { user_payment_infos: [{ id: 1, type: "visa", last_4: "4242" }], user_bank_account_infos: [bank] })
    await renderWithQuery(<IncomeAccountsSection {...handlers} />)
    expect(screen.getByText(/Visa \*\*\*\* \*\*\*\* \*\*\*\* 4242/)).toBeTruthy()
    await pressLabel("Edit")
    expect(handlers.onEditBank).toHaveBeenCalledWith(bank)
    await press("GOTOVO TERMS & CONDITIONS.")
    expect(navigation.navigate).toHaveBeenCalledWith("TermsAndConditions")
    as("TASKER", {})
    await renderWithQuery(<IncomeAccountsSection {...handlers} />)
    await press("ADD BANK ACCOUNT")
    expect(handlers.onAddBank).toHaveBeenCalled()
  })
})

describe("the password change", () => {
  it("asks for the current password, except after a social login", async () => {
    await renderWithQuery(<PasswordModal visible onClose={jest.fn()} />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("NEW PASSWORD"), "secret12"))
    expect(mockPassword.setNext).toHaveBeenCalledWith("secret12")
    expect(screen.getByLabelText("CURRENT PASSWORD")).toBeTruthy()
    await press("CONFIRM CHANGE")
    expect(mockPassword.submit).toHaveBeenCalled()
    as("CLIENT", { google_id: "g-1" })
    await renderWithQuery(<PasswordModal visible onClose={jest.fn()} />)
    expect(screen.queryByLabelText("CURRENT PASSWORD")).toBeNull()
  })
})

describe("the profile picture", () => {
  it("a gallery photo is uploaded and the user reloaded", async () => {
    uploadImage.mockResolvedValue(undefined)
    const reloadUser = jest.fn()
    const onClose = jest.fn()
    await renderWithQuery(<ProfilePictureModal visible onClose={onClose} reloadUser={reloadUser} deleteAvatar={jest.fn()} />)
    expect(screen.queryByText("REMOVE")).toBeNull()
    await press("GALLERY")
    expect(uploadImage).toHaveBeenCalledWith({ uri: "file://me.jpg" })
    expect(onClose).toHaveBeenCalled()
    expect(reloadUser).toHaveBeenCalled()
  })

  it("a photo can be removed", async () => {
    const deleteAvatar = jest.fn()
    as("CLIENT", { avatar: "https://x/me.jpg" })
    await renderWithQuery(<ProfilePictureModal visible onClose={jest.fn()} reloadUser={jest.fn()} deleteAvatar={deleteAvatar} />)
    await press("REMOVE")
    expect(deleteAvatar).toHaveBeenCalled()
  })
})

describe("a profile's top", () => {
  it("one's own: the full name and the photo opens its editor", async () => {
    const onEditPicture = jest.fn()
    await renderWithQuery(<UserInfo stars={4} user={client} countTasks={4} type="CLIENT" isOwnProfile onEditPicture={onEditPicture} />)
    expect(screen.getByText("Anic")).toBeTruthy()
    await pressLabel("Profile picture")
    expect(onEditPicture).toHaveBeenCalledWith(true)
  })

  it("someone else's: the last initial, and the photo does nothing", async () => {
    const onEditPicture = jest.fn()
    await renderWithQuery(<UserInfo stars={4} user={tasker} countTasks={12} type="TASKER" onEditPicture={onEditPicture} />)
    expect(screen.getByText("P.")).toBeTruthy()
    await pressLabel("Profile picture")
    expect(onEditPicture).not.toHaveBeenCalled()
  })

  it("someone else's, where their profile can be opened: the photo and the name open it", async () => {
    const onOpenProfile = jest.fn()
    await renderWithQuery(<UserInfo stars={4} user={tasker} countTasks={12} type="CLIENT" onOpenProfile={onOpenProfile} />)
    await pressLabel("Profile")
    await act(async () => fireEvent.press(screen.getByText("P.")))
    expect(onOpenProfile).toHaveBeenCalledTimes(2)
  })

  it("the badges: the level shows the task count; licences under their title, which shows only over some", async () => {
    const user = { ...tasker, tasks_count_tasker: 12, verifications: { verified_tasker: 1 } }
    await renderWithQuery(<UserBadges user={user} role="TASKER" count={12} variant="profile" />)
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.queryByText("LICENCES & QUALIFICATIONS")).toBeNull()
    await renderWithQuery(<UserBadges user={{ ...user, verifications: { plumber_verified: 1 } }} role="TASKER" count={12} variant="profile" />)
    expect(screen.getByText("LICENCES & QUALIFICATIONS")).toBeTruthy()
    await renderWithQuery(<UserBadges user={user} role="TASKER" count={12} variant="compact" />)
    expect(screen.queryByText("LICENCES & QUALIFICATIONS")).toBeNull()
  })

  it("the ribbon and the small badges draw for a ranked user", async () => {
    const user = { ...tasker, tasks_count_tasker: 12 }
    const r = await renderWithQuery(
      <>
        <LevelRibbon user={user} set="TASKER" />
        <MiniBadges user={user} set="TASKER" />
      </>
    )
    expect(r.toJSON()).toBeTruthy()
  })
})

describe("the address form", () => {
  it("the fields, the building type and OK go to the form", async () => {
    await renderWithQuery(<AddressModal visible reloadUser={jest.fn()} onVisibleChange={jest.fn()} onClose={jest.fn()} />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("CITY"), "Belgrade"))
    expect(mockAddress.set).toHaveBeenCalledWith("city")
    await pressLabel("Suggestion")
    expect(mockAddress.fromGoogle).toHaveBeenCalledWith({ formatted_address: "Main 1" })
    await press("OK")
    expect(mockAddress.submit).toHaveBeenCalled()
    await pressLabel("Close")
    expect(mockAddress.cancel).toHaveBeenCalled()
  })

  it("the system back button closes it as the X does (the form cleared, not kept for next time)", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<AddressModal visible reloadUser={jest.fn()} onVisibleChange={jest.fn()} onClose={onClose} />)
    // (the event goes up from the title to the modal, as Android's back does)
    await act(async () => fireEvent(screen.getByText("ENTER ADDRESS"), "requestClose"))
    expect(mockAddress.cancel).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("the map steps in for the form, which comes back when it closes", async () => {
    const onClose = jest.fn()
    const onVisibleChange = jest.fn()
    await renderWithQuery(<AddressModal visible reloadUser={jest.fn()} onVisibleChange={onVisibleChange} onClose={onClose} />)
    await press("PLACE PIN ON MAP")
    expect(onClose).toHaveBeenCalled()
    // the map's X (the form stays drawn here: its visibility is the caller's)
    await pressLabel("Close")
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it("house or building", async () => {
    const onChange = jest.fn()
    await renderWithQuery(<BuildingType isHouse onChange={onChange} />)
    expect(screen.getByRole("radio", { name: "House" }).props.accessibilityState).toMatchObject({ checked: true })
    await act(async () => fireEvent.press(screen.getByRole("radio", { name: "Building" })))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it("the map looks up the address at the pin and closes", async () => {
    getAddress.mockResolvedValue({ street: "Main 1", city: "Belgrade", zip: "11000" })
    const onAddress = jest.fn()
    const onClose = jest.fn()
    await renderWithQuery(<MapModal visible onAddress={onAddress} onClose={onClose} />)
    await press("OK")
    expect(getAddress).toHaveBeenCalled()
    expect(onAddress).toHaveBeenCalledWith(expect.objectContaining({ street: "Main 1", city: "Belgrade" }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe("the side menu", () => {
  const open = () => useUiStore.setState({ openMenuContext: true })

  it("closed, nothing is drawn", async () => {
    await renderWithQuery(<Sidebar />)
    expect(screen.queryByText("LOGOUT")).toBeNull()
  })

  it("logged out: login or register, and LOGIN at the bottom opens the login", async () => {
    as("CLIENT", {}, false)
    open()
    await renderWithQuery(<Sidebar />)
    await press(/CREATE AN/)
    expect(useUiStore.getState().registerOpen).toBe(true)
    open()
    await renderWithQuery(<Sidebar />)
    await press("LOGIN")
    expect(useUiStore.getState().authOpen).toBe(true)
  })

  it("a client goes to post a task, the profile, the more links and back", async () => {
    open()
    await renderWithQuery(<Sidebar />)
    await press("Post a Task")
    expect(navigation.navigate).toHaveBeenCalledWith("PostTask", undefined)
    open()
    await renderWithQuery(<Sidebar />)
    await press("Ana Anic")
    expect(navigation.navigate).toHaveBeenCalledWith("Profile", undefined)
    open()
    await renderWithQuery(<Sidebar />)
    await press("More")
    await press("Terms & Conditions")
    expect(navigation.navigate).toHaveBeenCalledWith("TermsAndConditions", undefined)
    open()
    await renderWithQuery(<Sidebar />)
    await press("More")
    await pressLabel("Back")
    expect(screen.getByText("Contact & Support")).toBeTruthy()
  })

  it("a signed-in user switching role starts over on Home in it", async () => {
    open()
    await renderWithQuery(<Sidebar />)
    await press("TASKER")
    expect(useAuthStore.getState().userSelect).toBe("TASKER")
    expect(navigation.navigate).toHaveBeenCalledWith("Home")
  })

  it("an unverified tasker's inbox is locked and explains why", async () => {
    as("TASKER", { verifications: { verified_tasker: 0 } })
    open()
    await renderWithQuery(<Sidebar />)
    expect(screen.queryByText("Post a Task")).toBeNull()
    const inbox = screen.getByText("Inbox")
    await act(async () => fireEvent.press(inbox))
    expect(navigation.navigate).not.toHaveBeenCalledWith("Notifications", undefined)
  })

  it("LOGOUT logs out on the server and on the device", async () => {
    logout.mockResolvedValue(undefined)
    open()
    const client = makeQueryClient()
    await renderWithQuery(<Sidebar />, client)
    await press("LOGOUT")
    expect(logout).toHaveBeenCalled()
    expect(useAuthStore.getState().user.loggedIn).toBe(false)
  })

  it("the role: a tasker is introduced once, and a logged-out one asked to log in", async () => {
    as("CLIENT", {}, false)
    await renderWithQuery(<UserRoleSelector />)
    await press("TASKER")
    expect(showTaskerIntroOnce).toHaveBeenCalled()
    expect(useAuthStore.getState().userSelect).toBe("TASKER")
    expect(useUiStore.getState().authOpen).toBe(true)
    await press("CLIENT")
    expect(useAuthStore.getState().userSelect).toBe("CLIENT")
  })
})

describe("logging in", () => {
  beforeEach(() => useUiStore.setState({ authOpen: true }))

  it("the fields, LOGIN and Google go to the form", async () => {
    await renderWithQuery(<Auth openForgotPass={jest.fn()} />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("USERNAME"), "ana@example.test"))
    expect(mockLogin.setEmail).toHaveBeenCalledWith("ana@example.test")
    await act(async () => fireEvent.changeText(screen.getByLabelText("PASSWORD"), "12345678"))
    expect(mockLogin.setPassword).toHaveBeenCalledWith("12345678")
    await press("LOGIN")
    expect(mockLogin.submit).toHaveBeenCalled()
    await pressLabel("GOOGLE")
    expect(mockLogin.loginWithGoogle).toHaveBeenCalled()
  })

  it("forgot password and register close it and open theirs", async () => {
    const openForgotPass = jest.fn()
    await renderWithQuery(<Auth openForgotPass={openForgotPass} />)
    await press("Forgot your password?")
    expect(openForgotPass).toHaveBeenCalled()
    expect(useUiStore.getState().authOpen).toBe(false)
    useUiStore.setState({ authOpen: true })
    await renderWithQuery(<Auth openForgotPass={openForgotPass} />)
    await press("Don't have a Gotovo account?")
    expect(useUiStore.getState().registerOpen).toBe(true)
  })

  it("closing it logged out goes back to the client role", async () => {
    as("TASKER", {}, false)
    await renderWithQuery(<Auth openForgotPass={jest.fn()} />)
    await pressLabel("Close")
    expect(useUiStore.getState().authOpen).toBe(false)
    expect(useAuthStore.getState().userSelect).toBe("CLIENT")
  })

  it("the eye shows and hides the password", async () => {
    const ref = React.createRef()
    await renderWithQuery(<PasswordField ref={ref} label="PASSWORD:" tapFocuses value="" onChangeText={jest.fn()} />)
    expect(screen.getByLabelText("PASSWORD").props.secureTextEntry).toBe(true)
    await pressLabel("Show password")
    expect(screen.getByLabelText("PASSWORD").props.secureTextEntry).toBe(false)
    expect(screen.getByLabelText("Hide password")).toBeTruthy()
  })

  it("Apple shows only where the device offers it", async () => {
    const r = await renderWithQuery(<SocialIcons client onGoogle={jest.fn()} apple={{ available: true, start: jest.fn() }} />)
    expect(screen.getByText("APPLE")).toBeTruthy()
    expect(r.toJSON()).toBeTruthy()
  })
})
