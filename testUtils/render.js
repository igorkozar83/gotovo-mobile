// render.js
// Rendering for component and hook tests: a fresh query client per test (no retries, nothing cached
// between tests) around the tested tree, inside the outside-press provider App.js puts around the app.
// Both are async (React 19): await them.
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, renderHook } from "@testing-library/react-native"
import { EventProvider } from "react-native-outside-press"

export const makeQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } })

const wrapperFor = (client) => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={client}>
      <EventProvider>{children}</EventProvider>
    </QueryClientProvider>
  )
  return Wrapper
}

export const renderWithQuery = async (ui, client = makeQueryClient()) => ({ client, ...(await render(ui, { wrapper: wrapperFor(client) })) })

export const renderHookWithQuery = async (hook, { client = makeQueryClient(), ...options } = {}) => ({
  client,
  ...(await renderHook(hook, { wrapper: wrapperFor(client), ...options }))
})
