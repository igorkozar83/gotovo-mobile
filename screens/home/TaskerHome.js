import React, { useLayoutEffect, useState } from "react"
import { useIsFocused, useNavigation } from "@react-navigation/native"

import HomeTaskerJobsList from "../../components/home/HomeTaskerJobsList"
import { useTaskerJobs } from "../../hooks/queries/useTaskerJobs"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useEvent from "../../hooks/useEvent"
import useListSpinner from "../../hooks/useListSpinner"
import { explainUnverifiedTasker } from "../../stores/alerts"

// Tasker Home: open tasks to offer on, sorted, filtered by type, category and search
const TaskerHome = () => {
  const isFocused = useIsFocused()
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const selectedCat = useUiStore((state) => state.selectedCat)

  const [selectedSort, setSelectedSort] = useState("newest")
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [valueSearchJob, setValueSearchJob] = useState("")
  // the search the list is filtered by, set when the input is submitted
  const [searchJob, setSearchJob] = useState("")

  // (re)loaded on focus and whenever the sort, type, category or search changes
  const jobs = useTaskerJobs({ sort_date: selectedSort, sort_type: selectedFilter, category_id: selectedCat, filter_job: searchJob }, isFocused)

  // the list's loading on the global spinner
  useListSpinner(jobs.isFetching)

  // remind an unverified tasker that offers need a verified account
  // (shown again whenever the list's sort, type or category changes)
  const warnUnverified = useEvent(() => {
    if (!isFocused) return

    if (user.loggedIn && !user.userData?.verifications?.verified_tasker) {
      explainUnverifiedTasker(() => navigation.navigate("Profile", { navigationLicences: true }))
    }
  })
  useLayoutEffect(() => {
    warnUnverified()
  }, [selectedSort, selectedFilter, user.loggedIn, selectedCat, isFocused, warnUnverified])

  const startSearchJobs = () => {
    // a new search reloads by itself; the same search again reloads explicitly, as before
    if (valueSearchJob === searchJob) jobs.refresh()
    else setSearchJob(valueSearchJob)
  }

  return (
    <HomeTaskerJobsList
      filters={{
        search: valueSearchJob,
        onSearchChange: setValueSearchJob,
        onSearchSubmit: startSearchJobs,
        sort: selectedSort,
        onSort: setSelectedSort,
        type: selectedFilter,
        onType: setSelectedFilter
      }}
      tasks={jobs.tasks}
      fetching={jobs.isFetching}
      canLoadMore={jobs.canLoadMore}
      onRefresh={jobs.refresh}
      onLoadMore={jobs.loadMore}
    />
  )
}

export default TaskerHome
