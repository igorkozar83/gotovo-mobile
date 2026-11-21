import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"

import { ToggleBox } from "../ui/ChoiceControls"
import useAuthStore from "../../stores/authStore"

describe("ToggleBox", () => {
  beforeEach(() => useAuthStore.setState({ userSelect: "CLIENT" }))

  it("asks for the opposite value when pressed", async () => {
    const onChange = jest.fn()
    await render(<ToggleBox checked={false} onChange={onChange} testID="box" />)
    await fireEvent.press(screen.getByTestId("box"))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("is filled with the client blue when checked", async () => {
    await render(<ToggleBox checked={true} onChange={() => {}} testID="box" />)
    expect(screen.getByTestId("box")).toHaveStyle({ backgroundColor: "#002FAF" })
  })

  it("is grey and empty when unchecked", async () => {
    await render(<ToggleBox checked={false} onChange={() => {}} testID="box" />)
    expect(screen.getByTestId("box")).toHaveStyle({ backgroundColor: "#F0F0F0" })
  })
})
