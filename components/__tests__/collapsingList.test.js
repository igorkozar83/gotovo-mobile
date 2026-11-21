import React from "react"
import { Text } from "react-native"
import { act, fireEvent, render, screen } from "@testing-library/react-native"

import CollapsingList from "../lists/CollapsingList"

// the list drawn plainly, so the test can say when its end comes near (FlashList measures it on a device)
jest.mock("@shopify/flash-list", () => {
  const { View } = require("react-native")
  const AnimatedFlashList = ({ data, renderItem, keyExtractor, ...props }) => (
    <View {...props}>
      {data.map((item, index) => (
        <View key={keyExtractor(item, index)}>{renderItem({ item, index })}</View>
      ))}
    </View>
  )
  return { AnimatedFlashList }
})

const renderList = (fields = {}) => {
  const onLoadMore = jest.fn()
  return render(
    <CollapsingList
      header={<Text>TOP</Text>}
      headerHeight={100}
      canLoadMore
      fetching={false}
      onLoadMore={onLoadMore}
      testID="rows"
      data={[{ id: 1, name: "First" }]}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      {...fields}
    />
  ).then(() => onLoadMore)
}
// the list's end coming near
const reachEnd = () => act(async () => fireEvent(screen.getByTestId("rows"), "endReached"))

describe("a list under a sliding top", () => {
  it("shows the top and the rows, and loads the next page near its end", async () => {
    const onLoadMore = await renderList()
    expect(screen.getByText("TOP")).toBeTruthy()
    expect(screen.getByText("First")).toBeTruthy()
    await reachEnd()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it("asks for nothing while it loads or when there is no next page", async () => {
    let onLoadMore = await renderList({ fetching: true })
    await reachEnd()
    expect(onLoadMore).not.toHaveBeenCalled()
    onLoadMore = await renderList({ canLoadMore: false })
    await reachEnd()
    expect(onLoadMore).not.toHaveBeenCalled()
  })
})
