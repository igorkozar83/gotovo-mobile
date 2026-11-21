import { renderHook } from "@testing-library/react-native"

import useEvent from "../useEvent"

describe("useEvent", () => {
  it("keeps one identity across renders", async () => {
    const { result, rerender } = await renderHook(({ n }) => useEvent(() => n), { initialProps: { n: 1 } })
    const first = result.current
    await rerender({ n: 2 })
    expect(result.current).toBe(first)
  })

  it("always runs the latest function", async () => {
    const { result, rerender } = await renderHook(({ n }) => useEvent((x) => x + n), { initialProps: { n: 1 } })
    await rerender({ n: 10 })
    expect(result.current(5)).toBe(15)
  })
})
