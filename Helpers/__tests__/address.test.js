import { Platform } from "react-native"

import { approximateAddress, mapsUrl, parseCoords, isLatitude, isLongitude, placeFromGoogle } from "../address"

describe("approximateAddress", () => {
  it("drops the house number", () => {
    expect(approximateAddress("Main Street 12, Area")).toBe("Main Street, Area")
    expect(approximateAddress("Bulevar 3, Novi Beograd, 11070")).toBe("Bulevar, Novi Beograd, 11070")
  })

  it("keeps a street without a number", () => {
    expect(approximateAddress("Vojvode Stepe")).toBe("Vojvode Stepe")
  })

  it("has no trailing comma when there is nothing after the street", () => {
    expect(approximateAddress("Vejvodova 5")).toBe("Vejvodova")
    // the number at the start, with a letter, or in the street's name
    expect(approximateAddress("12 Main Street, Springfield")).toBe("Main Street, Springfield")
    expect(approximateAddress("Kneza Miloša 12 b, Vračar")).toBe("Kneza Miloša, Vračar")
    expect(approximateAddress("Bulevar 27. marta 5")).toBe("Bulevar 27. marta")
    expect(approximateAddress("12 b Main Street")).toBe("Main Street")
  })
})

describe("mapsUrl", () => {
  const on = (os) => jest.spyOn(Platform, "select").mockImplementation((options) => options[os])
  afterEach(() => jest.restoreAllMocks())

  it("opens a geo: link on Android", () => {
    on("android")
    expect(mapsUrl(44.8, 20.4, "Home")).toBe("geo:0,0?q=44.8,20.4(Home)")
  })

  it("opens a maps:// link on iOS", () => {
    on("ios")
    expect(mapsUrl(44.8, 20.4, "Home")).toBe("maps://0,0?q=Home@44.8,20.4")
  })
})

describe("parseCoords", () => {
  it("splits a typed pair", () => {
    expect(parseCoords("44.81, 20.46")).toEqual({ latitude: "44.81", longitude: "20.46" })
  })

  it("treats missing and 'null' parts as null", () => {
    expect(parseCoords("null, null")).toEqual({ latitude: null, longitude: null })
    expect(parseCoords("")).toEqual({ latitude: null, longitude: null })
    expect(parseCoords("44.81")).toEqual({ latitude: "44.81", longitude: null })
  })
})

describe("isLatitude / isLongitude", () => {
  it("checks the ranges", () => {
    expect(isLatitude("44.8")).toBe(true)
    expect(isLatitude("91")).toBe(false)
    expect(isLongitude("120")).toBe(true)
    expect(isLongitude("181")).toBe(false)
    expect(isLongitude("abc")).toBe(false)
  })
})

describe("placeFromGoogle", () => {
  it("reads the street, zip, city and coordinates", () => {
    const details = {
      adr_address:
        '<span class="street-address">Knez Mihailova 5</span>, <span class="postal-code">11000</span> <span class="locality">Beograd</span>, <span class="country-name">Serbia</span>',
      geometry: { location: { lat: 44.81, lng: 20.46 } }
    }
    expect(placeFromGoogle(details)).toEqual({ street: "Knez Mihailova 5", zip: "11000", city: "Beograd", latitude: 44.81, longitude: 20.46 })
  })

  it("copes with a place without details", () => {
    expect(placeFromGoogle(null)).toEqual({ latitude: undefined, longitude: undefined })
  })
})
