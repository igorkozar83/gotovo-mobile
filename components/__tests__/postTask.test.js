import React, { useEffect } from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { useForm } from "react-hook-form"

import { renderWithQuery } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { emptyValues } from "../../Helpers/postTaskData"
import AgreementSection from "../postTask/AgreementSection"
import CategorySlider from "../postTask/CategorySlider"
import ContactFields from "../postTask/ContactFields"
import DatesSection from "../postTask/DatesSection"
import DescribeSection from "../postTask/DescribeSection"
import { LoginInvite, AccountDetails } from "../postTask/GuestSignUp"
import JobPicker from "../postTask/JobPicker"
import MediaSection from "../postTask/MediaSection"
import { SavedPlace, GuestPlace } from "../postTask/PlaceSection"
import DateTimePicker from "../dateTime/DateTimePicker"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../hooks/useReloadUser", () => () => jest.fn())

const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const type = (label, text) => act(async () => fireEvent.changeText(screen.getByLabelText(label), text))

// a section inside the post-task form (react-hook-form), as the screen gives it: the form is handed out
// so a test can read what the section wrote
let form
const InForm = ({ values, children }) => {
  const methods = useForm({ defaultValues: { ...emptyValues(), ...values } })
  useEffect(() => {
    form = methods
  })
  return children(methods)
}
const drawInForm = (section, values = {}) => renderWithQuery(<InForm values={values}>{section}</InForm>)

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { ...client, type: "CLIENT", mobile: "381641234567", addresses: [] } }, userSelect: "CLIENT" })
  useUiStore.setState({ language: "EN", authOpen: false })
})

describe("describing the task", () => {
  const subTask = {
    options: [
      { id: 1, type: 1, description: "Rooms", unit_name: "m", unit_sup: "2" },
      { id: 2, type: 2, description: "Urgent" },
      { id: 3, type: 9, description: "Unknown" }
    ]
  }

  it("the name and description go into the form; each option of the job is asked", async () => {
    const setOption = jest.fn()
    const toggleOption = jest.fn()
    await drawInForm((methods) => <DescribeSection control={methods.control} subTask={subTask} setOption={setOption} toggleOption={toggleOption} />, {
      options: [{ value: 3 }, { value: 0 }, { value: 0 }]
    })
    await type("TASK NAME", "Fix the tap")
    await type("DESCRIPTION", "It drips")
    expect(form.getValues("taskName")).toBe("Fix the tap")
    expect(form.getValues("taskDesc")).toBe("It drips")
    await type("Rooms", "4")
    expect(setOption).toHaveBeenCalledWith(1, "4")
    await act(async () => fireEvent.press(screen.getByRole("checkbox", { name: "Urgent" })))
    expect(toggleOption).toHaveBeenCalledWith(2)
    expect(screen.queryByText("Unknown")).toBeNull()
  })

  it("an option's field shows once the form has its answer", async () => {
    await drawInForm((methods) => <DescribeSection control={methods.control} subTask={subTask} setOption={jest.fn()} toggleOption={jest.fn()} />)
    expect(screen.queryByLabelText("Rooms")).toBeNull()
  })

  it("the categories and jobs are chosen with a tap", async () => {
    const onSelect = jest.fn()
    const onChoose = jest.fn()
    const jobs = [
      { id: 1, description: "Fix a leak" },
      { id: 2, description: "New tap" }
    ]
    await renderWithQuery(
      <>
        <CategorySlider buttons={[{ id: 4, text: "Garden" }]} selected={3} onSelect={onSelect} />
        <JobPicker jobs={jobs} selected={jobs[0]} onChoose={onChoose} />
      </>
    )
    await press("Garden")
    expect(onSelect).toHaveBeenCalledWith(4)
    await press("Fix a leak")
    await press("New tap")
    expect(onChoose).toHaveBeenCalledWith(jobs[1])
  })
})

describe("the times", () => {
  it("up to three are added with the picker, each edited or removed; flexible by default", async () => {
    await drawInForm((methods) => <DatesSection control={methods.control} setValue={methods.setValue} />)
    expect(screen.getByRole("checkbox", { name: "My dates are flexible" }).props.accessibilityState).toMatchObject({ checked: true })
    for (let i = 0; i < 3; i++) {
      await press("CHOOSE DATES")
      await press("OK")
    }
    expect(form.getValues("dates")).toHaveLength(3)
    expect(screen.queryByText("CHOOSE DATES")).toBeNull()

    await pressLabel("Remove")
    expect(form.getValues("dates")).toHaveLength(2)
    await act(async () => fireEvent.press(screen.getAllByLabelText("Edit")[0]))
    await pressLabel("Later")
    await press("OK")
    expect(form.getValues("dates")).toHaveLength(2)
  })
})

describe("the date picker", () => {
  const pad = (n) => String(n).padStart(2, "0")
  const localDay = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  it("starts on the device's day, also just after midnight", async () => {
    // 00:30 on the device: in UTC+1 / +2 (the tests run in Europe/Belgrade, testUtils/timezone.js) the
    // UTC day is still yesterday
    expect(new Date(2026, 9, 2, 0, 30).toISOString().slice(0, 10)).toBe("2026-10-01")
    jest.useFakeTimers({ now: new Date(2026, 9, 2, 0, 30), doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] })
    try {
      const onPick = jest.fn()
      await renderWithQuery(<DateTimePicker visible onClose={jest.fn()} onPick={onPick} />)
      await press("OK")
      expect(onPick.mock.calls[0][0][0].startsWith(localDay(new Date(2026, 9, 2)))).toBe(true)
    } finally {
      jest.useRealTimers()
    }
  })

  it("in the evening today starts at the next hour and ends an hour later (it was 22:00-22:00, refused)", async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 2, 21, 15), doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] })
    try {
      const onPick = jest.fn()
      await renderWithQuery(<DateTimePicker visible onClose={jest.fn()} onPick={onPick} />)
      await press("OK")
      const [from, to] = onPick.mock.calls[0][0]
      expect([from.slice(-5), to.slice(-5)]).toEqual(["22:00", "23:00"])
    } finally {
      jest.useRealTimers()
    }
  })

  it("a later day and the hours: 'to' stays at least an hour after 'from'", async () => {
    // the hours it starts with follow the clock: a morning (the test failed from 18:00 on)
    jest.useFakeTimers({ now: new Date(2026, 9, 2, 10, 0), doNotFake: ["nextTick", "setImmediate", "queueMicrotask"] })
    try {
      const onPick = jest.fn()
      const onClose = jest.fn()
      await renderWithQuery(<DateTimePicker visible onClose={onClose} onPick={onPick} />)
      // From 18 -> 19, To 20 -> 20 -> 20 (it stops an hour after From: the server takes no empty period)
      await act(async () => fireEvent.press(screen.getAllByLabelText("Later")[0]))
      await act(async () => fireEvent.press(screen.getAllByLabelText("Earlier")[1]))
      await act(async () => fireEvent.press(screen.getAllByLabelText("Earlier")[1]))
      await press("OK")
      const [from, to] = onPick.mock.calls[0][0]
      expect(from.endsWith(" 19:00")).toBe(true)
      expect(to.endsWith(" 20:00")).toBe(true)
      expect(onClose).toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })
})

describe("the contact and the terms", () => {
  it("the saved phone locks the typed one", async () => {
    await drawInForm((methods) => <ContactFields control={methods.control} loggedIn />)
    await type("PHONE NUMBER", "0641234567")
    expect(form.getValues("phone")).toBe("0641234567")
    await act(async () => fireEvent.press(screen.getByRole("checkbox", { name: "Use my saved phone number" })))
    expect(form.getValues("useSavedPhone")).toBe(true)
    expect(screen.getByLabelText("PHONE NUMBER").props.editable).toBe(false)
  })

  it("a guest has no saved phone to use", async () => {
    await drawInForm((methods) => <ContactFields control={methods.control} loggedIn={false} />)
    expect(screen.queryByRole("checkbox")).toBeNull()
  })

  it("the terms go into the form; their name opens them", async () => {
    await drawInForm((methods) => <AgreementSection control={methods.control} />)
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    expect(form.getValues("agreement")).toBe(true)
    await press("GOTOVO Terms & Conditions.")
    expect(screen.getByText("OPŠTI USLOVI I PRAVILA KORIŠĆENJA ZA KORISNIKE")).toBeTruthy()
  })
})

describe("a guest", () => {
  it("is invited to log in, or fills in the new account", async () => {
    await drawInForm((methods) => (
      <>
        <LoginInvite />
        <AccountDetails control={methods.control} />
      </>
    ))
    await press("LOGIN:")
    expect(useUiStore.getState().authOpen).toBe(true)
    await type("EMAIL", "ana@example.test")
    await type("PASSWORD", "secret12")
    expect(form.getValues("guest")).toMatchObject({ email: "ana@example.test", password: "secret12" })
    expect(screen.getByLabelText("PASSWORD").props.secureTextEntry).toBe(true)
  })

  it("enters the address of the new account and sees it in full, as a logged-in user does", async () => {
    const newAddress = { place_name: "Home", address: "Beogradska 50", zip: "23251", city: "Ečka" }
    await drawInForm((methods) => <GuestPlace control={methods.control} setValue={methods.setValue} />, { newAddress })
    expect(screen.getByText("Home")).toBeTruthy()
    expect(screen.getByText("SAVED ADDRESS:")).toBeTruthy()
    expect(screen.getByText("Beogradska 50")).toBeTruthy()
    expect(screen.getByText("23251 Ečka")).toBeTruthy()
    // no link to a profile there is not yet
    expect(screen.getByText("NOTE: You can manage your address book later on your profile page after creating an account.")).toBeTruthy()
    await press("CHANGE ADDRESS")
    expect(screen.getByText("ENTER ADDRESS")).toBeTruthy()
  })
})

describe("the place", () => {
  const home = { id: 3, place_name: "Home", address: "Main 1", zip: "11000", city: "Belgrade" }
  const office = { id: 4, place_name: "Office", address: "Side 2", city: "Novi Sad" }

  it("one of the saved addresses is picked and shown", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { ...client, type: "CLIENT", addresses: [home, office] } } })
    await drawInForm((methods) => <SavedPlace control={methods.control} setValue={methods.setValue} />)
    await press("Select task address")
    await press("Office")
    expect(form.getValues("address")).toEqual(office)
    expect(screen.getByText("Side 2")).toBeTruthy()
  })

  it("a new one opens the address form; the address book link opens the profile", async () => {
    useAuthStore.setState({ user: { loggedIn: true, userData: { ...client, type: "CLIENT", addresses: [home] } } })
    await drawInForm((methods) => <SavedPlace control={methods.control} setValue={methods.setValue} />, { address: home })
    expect(screen.getByText("11000 Belgrade")).toBeTruthy()
    await press("your profile")
    expect(navigation.navigate).toHaveBeenCalledWith("Profile")
    await press("NEW ADDRESS")
    expect(screen.getByText("ENTER ADDRESS")).toBeTruthy()
  })
})

describe("the photos and videos", () => {
  const media = (fields = {}) => ({
    media: [{ uri: "file://a.jpg" }, { uri: "file://b.mp4" }],
    canAdd: jest.fn(() => true),
    add: jest.fn(),
    remove: jest.fn(),
    videoFull: false,
    imagesFull: false,
    ...fields
  })

  it("a tile opens full screen, its x asks to remove it", async () => {
    const m = media()
    await renderWithQuery(<MediaSection media={m} />)
    await act(async () => fireEvent.press(screen.getAllByLabelText("Open photo")[0]))
    await pressLabel("Close")
    await act(async () => fireEvent.press(screen.getAllByLabelText("Remove photo")[1]))
    // the second one is a video
    await press("REMOVE VIDEO")
    expect(m.remove).toHaveBeenCalledWith(1)
  })

  it("adding asks the media list first", async () => {
    const m = media({ canAdd: jest.fn(() => false) })
    await renderWithQuery(<MediaSection media={m} />)
    await pressLabel("Add photo")
    expect(m.canAdd).toHaveBeenCalled()
    expect(screen.queryByText("GALLERY")).toBeNull()
  })
})
