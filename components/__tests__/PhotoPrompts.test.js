import React from "react"
import { act, render, renderHook } from "@testing-library/react-native"

import PhotoPrompts, { usePhotoPrompts } from "../media/PhotoPrompts"

// the three prompts, replaced by stand-ins that keep their last props
const mockProps = {}
jest.mock("../modals/NewPictureAndVideoModal", () => (props) => {
  mockProps.picker = props
  return null
})
jest.mock("../media/ImageFullScreen", () => (props) => {
  mockProps.preview = props
  return null
})
jest.mock("../media/RemoveImage", () => (props) => {
  mockProps.remove = props
  return null
})

const photos = [{ uri: "file://a.jpg" }, { uri: "file://b.mp4" }]

const setup = async (props = {}) => {
  const hook = await renderHook(() => usePhotoPrompts())
  const draw = () => render(<PhotoPrompts prompts={hook.result.current} photos={photos} onPick={jest.fn()} onRemove={jest.fn()} {...props} />)
  await draw()
  return { hook, draw }
}

describe("PhotoPrompts", () => {
  it("shows nothing until a prompt is opened", async () => {
    await setup()
    expect(mockProps.picker.visible).toBe(false)
    expect(mockProps.preview.visible).toBe(false)
    expect(mockProps.remove.visible).toBe(false)
  })

  it("the picker hands its pick over and closes, telling which prompt it was", async () => {
    const onPick = jest.fn()
    const onClosed = jest.fn()
    const { hook, draw } = await setup({ onPick, onClosed, pickerProps: { onlyImages: true } })
    await act(async () => hook.result.current.pick())
    await draw()
    expect(mockProps.picker).toMatchObject({ visible: true, onlyImages: true, onPick })

    await act(async () => mockProps.picker.onClose())
    expect(onClosed).toHaveBeenCalledWith("pick")
    expect(hook.result.current.prompt).toBe(null)
  })

  it("a photo opens full screen", async () => {
    const { hook, draw } = await setup()
    await act(async () => hook.result.current.preview("file://a.jpg"))
    await draw()
    expect(mockProps.preview).toMatchObject({ visible: true, image: "file://a.jpg" })
  })

  it("removing asks first, then removes that photo and closes", async () => {
    const onRemove = jest.fn()
    const onClosed = jest.fn()
    const { hook, draw } = await setup({ onRemove, onClosed })
    await act(async () => hook.result.current.remove(1))
    await draw()
    expect(mockProps.remove).toMatchObject({ visible: true, image: "file://b.mp4", notImage: true })

    await act(async () => mockProps.remove.onRemove())
    expect(onRemove).toHaveBeenCalledWith(1)
    expect(onClosed).toHaveBeenCalledWith("remove")
    expect(hook.result.current.prompt).toBe(null)
  })
})
