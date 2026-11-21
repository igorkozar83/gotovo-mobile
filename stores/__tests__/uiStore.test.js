// The spinner counts its holders: one loader ending never hides another's, and each hide counts once.
import useUiStore, { isSpinning } from "../uiStore"

beforeEach(() => useUiStore.setState({ spinners: 0 }))

it("shows while anything holds it", () => {
  const { showSpinner } = useUiStore.getState()
  const hideFirst = showSpinner()
  const hideSecond = showSpinner()
  expect(isSpinning(useUiStore.getState())).toBe(true)
  hideFirst()
  expect(isSpinning(useUiStore.getState())).toBe(true)
  hideSecond()
  expect(isSpinning(useUiStore.getState())).toBe(false)
})

it("a hide counts once", () => {
  const { showSpinner } = useUiStore.getState()
  const hide = showSpinner()
  showSpinner()
  hide()
  hide()
  expect(useUiStore.getState().spinners).toBe(1)
})
