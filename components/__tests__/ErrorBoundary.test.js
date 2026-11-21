import React from "react"
import { Text } from "react-native"
import { fireEvent, render, screen } from "@testing-library/react-native"

import ErrorBoundary, { withScreenBoundary } from "../ErrorBoundary"

let broken = true
const Fragile = () => {
  if (broken) throw new Error("render failed")
  return <Text>All good</Text>
}

beforeEach(() => {
  broken = true
  // React logs the caught error; the boundary itself reports it only in development
  jest.spyOn(console, "error").mockImplementation(() => {})
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("ErrorBoundary", () => {
  it("shows a message instead of the broken part, and retrying renders it again", async () => {
    const onReset = jest.fn()
    await render(
      <ErrorBoundary onReset={onReset}>
        <Fragile />
      </ErrorBoundary>
    )
    expect(screen.getByText("Something went wrong")).toBeTruthy()

    broken = false
    await fireEvent.press(screen.getByText("TRY AGAIN"))
    expect(onReset).toHaveBeenCalled()
    expect(screen.getByText("All good")).toBeTruthy()
  })

  it("a broken screen offers the way back Home", async () => {
    const navigation = { navigate: jest.fn() }
    const Screen = withScreenBoundary(Fragile)
    await render(<Screen navigation={navigation} />)
    await fireEvent.press(screen.getByText("BACK TO HOME"))
    expect(navigation.navigate).toHaveBeenCalledWith("Home")
  })

  it("renders its children when nothing breaks", async () => {
    broken = false
    await render(
      <ErrorBoundary>
        <Fragile />
      </ErrorBoundary>
    )
    expect(screen.getByText("All good")).toBeTruthy()
  })
})
