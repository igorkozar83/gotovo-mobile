import { translate, translatedOrNull, pluralForm, i18n } from "../language.utils"

describe("translate", () => {
  afterEach(() => i18n.store({ EN: {} }))

  it("falls back to the text itself", () => {
    expect(translate("Nothing for this.")).toBe("Nothing for this.")
    expect(translate("")).toBe("")
  })

  it("looks the text up without its dots", () => {
    i18n.store({ EN: { "Please try again later": "Try later" } })
    expect(translate("Please try again later.")).toBe("Try later")
  })

  it("puts a name into a whole sentence, translated or not", () => {
    expect(translate("Task %{name} is scheduled for today.", { name: "Fix the tap" })).toBe("Task Fix the tap is scheduled for today.")
    i18n.store({ SR: { "Task %{name} is scheduled for today": "Zadatak %{name} je zakazan za danas." } })
    i18n.locale = "SR"
    try {
      expect(translate("Task %{name} is scheduled for today.", { name: "Fix the tap" })).toBe("Zadatak Fix the tap je zakazan za danas.")
    } finally {
      i18n.locale = "EN"
    }
  })

  it("a catalog id is looked up by its English, and shows it when nothing translates it", () => {
    expect(translate("common.ok")).toBe("OK")
    i18n.store({ SR: { OK: "U redu" } })
    i18n.locale = "SR"
    try {
      expect(translate("common.ok")).toBe("U redu")
      // a text that is no id is its own key
      expect(translate("OK")).toBe("U redu")
    } finally {
      i18n.locale = "EN"
    }
  })

  it('turns "|br|" into line breaks', () => {
    i18n.store({ EN: { Two: "First|br|Second" } })
    expect(translate("Two")).toBe("First\nSecond")
  })
})

describe("pluralForm", () => {
  it("Serbian: 1 zadatak, 2-4 zadatka, the rest zadataka (11-14 too)", () => {
    const forms = [0, 1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 55, 101, 112].map((n) => [n, pluralForm(n, "SR")])
    expect(forms).toEqual([
      [0, "many"],
      [1, "one"],
      [2, "few"],
      [4, "few"],
      [5, "many"],
      [11, "many"],
      [12, "many"],
      [14, "many"],
      [21, "one"],
      [22, "few"],
      [25, "many"],
      [55, "many"],
      [101, "one"],
      [112, "many"]
    ])
  })

  it("English: one for 1, the other for the rest", () => {
    expect([0, 1, 2, 21].map((n) => pluralForm(n, "EN"))).toEqual(["many", "one", "many", "many"])
  })
})

describe("translatedOrNull", () => {
  afterEach(() => i18n.store({ EN: {} }))

  it("a placeholder key with no words yet gives nothing, never the key", () => {
    expect(translatedOrNull("Placeholder nobody wrote")).toBeNull()
  })

  it("gives the words once there are some, in the language or the fallback", () => {
    i18n.store({ EN: { "Intro words": "Hello|br|there" } })
    expect(translatedOrNull("Intro words.")).toBe("Hello\nthere")
    i18n.locale = "SR"
    try {
      expect(translatedOrNull("Intro words")).toBe("Hello\nthere")
    } finally {
      i18n.locale = "EN"
    }
  })
})
