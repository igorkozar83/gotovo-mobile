// useCursorList.js
// A list loaded page by page with a cursor (TanStack Query); further pages are appended.
import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

// a v2 list page: { data: [...], meta: { next_cursor } }
export const v2Page = (resp) => ({ items: (resp && resp.data) || [], nextCursor: resp && resp.meta ? resp.meta.next_cursor : null })

// page(resp) → { items, nextCursor } for one API response (a v2 page when omitted).
// keepPrevious(previousKey): true when the list shown before (under previousKey) stays up while this key
// loads (e.g. the same list in a new sort), instead of an empty list
const useCursorList = ({ queryKey, fetchPage, page = v2Page, enabled, keepPrevious = null }) => {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => page(lastPage).nextCursor || undefined,
    enabled,
    placeholderData: keepPrevious ? (previousData, previousQuery) => (previousQuery && keepPrevious(previousQuery.queryKey) ? previousData : undefined) : undefined
  })

  // a new array only when the data changes (lists and effects compare it by reference);
  // page is a plain mapper of the caller, so the data alone decides
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => (query.data ? query.data.pages : []).flatMap((resp) => page(resp).items), [query.data])

  return {
    items,
    // the API's responses as they came (for what else they carry)
    pages: query.data ? query.data.pages : [],
    canLoadMore: !!query.hasNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
    },
    refresh: () => query.refetch(),
    isFetching: query.isFetching,
    // the first load, nothing shown yet
    isLoading: query.isLoading,
    // changes with every failed load (0 while none failed)
    errorUpdatedAt: query.errorUpdatedAt,
    error: query.error
  }
}

export default useCursorList
