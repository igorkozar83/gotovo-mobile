// useReviewsPage.js
// A page of reviews: loaded (again when the sort changes), the next page when the list's end comes near,
// with the global spinner while loading.
import { useState } from "react"

import useListSpinner from "../useListSpinner"
import { useReviews } from "../queries/useReviews"

const useReviewsPage = ({ userId = null, userType = null }, enabled = true) => {
  const [sort, setSort] = useState(null)
  const list = useReviews({ userId, userType, sort }, enabled)

  useListSpinner(list.isFetching)

  return { reviews: list.reviews, setSort, fetching: list.isFetching, canLoadMore: list.canLoadMore, loadMore: list.loadMore }
}

export default useReviewsPage
