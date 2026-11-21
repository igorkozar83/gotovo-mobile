// useDetails.js
// One task or task offer by id, for the screens that show one (TaskDetails, MyTaskDetails, MyTaskFinished,
// TaskOffer): the screen gets
// the id in its route and reads the item here, so each screen shows its own item (two tabs can show two
// tasks) and fresh data. Opening a screen with an item already at hand (from a list) seeds the cache
// with it: the screen shows it at once and refreshes it from the server.
import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigation } from "@react-navigation/native"

import { getTaskById, getTaskOffer } from "../../Services/TasksAPI"

export const taskKeys = { detail: (taskId) => ["task", taskId] }
export const offerKeys = { detail: (offerId) => ["taskOffer", offerId] }

export const useTaskDetail = (taskId) => useQuery({ queryKey: taskKeys.detail(taskId), queryFn: () => getTaskById(taskId), enabled: !!taskId })

export const useOfferDetail = (offerId) => useQuery({ queryKey: offerKeys.detail(offerId), queryFn: () => getTaskOffer(offerId), enabled: !!offerId })

// opens a task's details: task (at hand) seeds the cache; params: the screen's other params
export const useOpenTaskDetails = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  return useCallback(
    (task, params) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task)
      navigation.navigate("TaskDetails", { ...params, taskId: task.id })
    },
    [navigation, queryClient]
  )
}

// a task's statuses that are over (done, canceled, ...): it opens in My Tasks' finished details
const FINISHED = [2, 4, 5]
export const isFinishedTask = (task) => FINISHED.includes(task.status)

// opens a task of the user's own (My Tasks): an active one in its details, a finished one in the finished
// details; task (at hand) seeds the cache
export const useOpenMyTask = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  return useCallback(
    (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task)
      navigation.navigate(isFinishedTask(task) ? "MyTaskFinished" : "MyTaskDetails", { taskId: task.id })
    },
    [navigation, queryClient]
  )
}

// the task `taskId` in the cache, set after an action changed it (a value, or a function of the current one)
export const useSetTaskCache = (taskId) => {
  const queryClient = useQueryClient()
  return useCallback((next) => queryClient.setQueryData(taskKeys.detail(taskId), (current) => (typeof next === "function" ? next(current) : next)), [queryClient, taskId])
}

// opens an offer's screen: offer (at hand) seeds the cache
export const useOpenTaskOffer = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  return useCallback(
    (offer) => {
      queryClient.setQueryData(offerKeys.detail(offer.id), offer)
      navigation.navigate("TaskOffer", { offerId: offer.id })
    },
    [navigation, queryClient]
  )
}

// the offer `offerId` in the cache: get() as it is now (read when an action runs), update(fn) after one
export const useOfferCache = (offerId) => {
  const queryClient = useQueryClient()
  return {
    get: () => queryClient.getQueryData(offerKeys.detail(offerId)),
    update: (fn) => queryClient.setQueryData(offerKeys.detail(offerId), (current) => (current ? fn(current) : current))
  }
}

// every offer shown anywhere reloads (a change to a task touches its offers)
export const useInvalidateOfferDetails = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ["taskOffer"] }), [queryClient])
}
