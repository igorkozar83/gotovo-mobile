import Constants from "expo-constants"
import { Platform } from "react-native"

import { isOlder, storeUrl } from "../appVersion"

describe("isOlder", () => {
  it("compares the versions part by part, as numbers", () => {
    expect(isOlder("0.1.7", "0.2.0")).toBe(true)
    expect(isOlder("0.1.10", "0.1.9")).toBe(false)
    expect(isOlder("1.0", "1.0.1")).toBe(true)
    expect(isOlder("1.0.0", "1.0")).toBe(false)
  })

  it("the same version or no minimum is not older", () => {
    expect(isOlder("0.2.0", "0.2.0")).toBe(false)
    expect(isOlder("0.2.0", null)).toBe(false)
    expect(isOlder("0.2.0", "")).toBe(false)
    // a build without a version is not blocked
    expect(isOlder(undefined, "0.2.0")).toBe(false)
  })
})

describe("storeUrl", () => {
  const os = Platform.OS
  afterEach(() => {
    Platform.OS = os
    delete Constants.expoConfig.ios
    delete Constants.expoConfig.android
  })

  it("the Play Store page of the package, or the App Store link the config gives on iOS", () => {
    Constants.expoConfig.android = { package: "com.gotovosrb.app" }
    expect(storeUrl()).toBe("https://play.google.com/store/apps/details?id=com.gotovosrb.app")

    Platform.OS = "ios"
    Constants.expoConfig.ios = { appStoreUrl: "https://apps.apple.com/app/id1" }
    expect(storeUrl()).toBe("https://apps.apple.com/app/id1")
  })
})
