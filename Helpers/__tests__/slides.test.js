import { slideIn } from "../slides"

const slide = {
  id: 1,
  text: "Zdravo",
  black_text: "GOTOVO",
  image: "sr.jpg",
  button_text: "Kupon",
  translations: { EN: { text: "Hello", image: "en.jpg", button_text: "" }, CZ: { text: "Ahoj" } }
}

describe("slideIn", () => {
  it("in a language the slide has: its texts and picture there, the slide's own where it has none", () => {
    expect(slideIn(slide, "EN")).toMatchObject({ id: 1, text: "Hello", black_text: "GOTOVO", image: "en.jpg", button_text: "Kupon" })
    expect(slideIn(slide, "CZ")).toMatchObject({ text: "Ahoj", image: "sr.jpg" })
  })

  it("in Serbian, or a language it has nothing in: the slide as it is", () => {
    expect(slideIn(slide, "SR")).toBe(slide)
    expect(slideIn(slide, "DE")).toBe(slide)
    expect(slideIn({ text: "x", translations: {} }, "EN").text).toBe("x")
  })
})
