// fields.js
// Builds a Zustand store's state from { field: initialValue }: each field gets a React-style setter,
// set<Field> (e.g. user -> setUser), that takes a value or an updater function (current => next).
export const withSetters = (set, initial) => {
  const state = { ...initial }
  Object.keys(initial).forEach((key) => {
    state["set" + key.charAt(0).toUpperCase() + key.slice(1)] = (value) => set((current) => ({ [key]: typeof value === "function" ? value(current[key]) : value }))
  })
  return state
}
