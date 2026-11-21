// A list's loading on the app's spinner: two lists handing over (one stops, the other starts in the same
// render) leave it on.
import React from "react"
import { render, act } from "@testing-library/react-native"

import useListSpinner from "../useListSpinner"
import useUiStore from "../../stores/uiStore"

const List = ({ fetching }) => {
  useListSpinner(fetching)
  return null
}
// the first list before the second in the tree: its effects run first
const Two = ({ first, second }) => (
  <>
    <List fetching={first} />
    <List fetching={second} />
  </>
)

beforeEach(() => useUiStore.setState({ spinners: 0 }))

it("is on while a list loads and off when it stops", async () => {
  const screen = await render(<List fetching={true} />)
  expect(useUiStore.getState().spinners).toBeGreaterThan(0)
  await act(async () => screen.rerender(<List fetching={false} />))
  expect(useUiStore.getState().spinners).toBe(0)
})

it("stays on when one list stops as the other starts, in either order", async () => {
  const screen = await render(<Two first={false} second={true} />)
  await act(async () => screen.rerender(<Two first={true} second={false} />))
  expect(useUiStore.getState().spinners).toBeGreaterThan(0)
  await act(async () => screen.rerender(<Two first={false} second={true} />))
  expect(useUiStore.getState().spinners).toBeGreaterThan(0)
})

it("is off when a loading list goes away", async () => {
  const screen = await render(<List fetching={true} />)
  await act(async () => screen.unmount())
  expect(useUiStore.getState().spinners).toBe(0)
})
