// Home.js
// The Home route: the Home of the current role, Android back asking before leaving the app, and the login
// opened (with the new email) after registering. (The first category is chosen in hooks/main/useAppData.)
import React, { useEffect, useCallback } from "react"
import { BackHandler, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"

import ClientHome from "./home/ClientHome"
import TaskerHome from "./home/TaskerHome"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import { askToExitApp } from "../stores/alerts"

import styles from "../styles/Home.style.js"

export default function HomeScreen({ route }) {
  const params = route.params
  const userSelect = useAuthStore((state) => state.userSelect)

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (route.name === "Home") askToExitApp(() => BackHandler.exitApp())
        return true
      })
      return () => backHandler.remove()
    }, [route.name])
  )

  useEffect(() => {
    if (params && params.registerSuccess) {
      useUiStore.getState().setAuthOpen(true)
      useAuthStore.getState().setPreEmail(params.registerSuccess)
    }
  }, [params])

  return <View style={{ ...styles.container }}>{userSelect === "CLIENT" ? <ClientHome /> : <TaskerHome />}</View>
}
