import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"

import ButtonWithPicture from "../ui/ButtonWithPicture"

describe("a button with a picture", () => {
  it("shows its text, presses, and fits its picture whole (the check is not square)", async () => {
    const onPress = jest.fn()
    await render(<ButtonWithPicture text="TASK STARTED" icon={{ uri: "file://check.png" }} onPress={onPress} />)

    await act(async () => fireEvent.press(screen.getByText("TASK STARTED")))
    expect(onPress).toHaveBeenCalled()
    expect(JSON.stringify(screen.toJSON())).toContain('"contentFit":"contain"')
  })
})
