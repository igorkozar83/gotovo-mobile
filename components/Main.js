// Main.js
// The app shell under the navigator: the intro video, the side menu and the app-wide modals, plus what
// runs for the whole app (its data, the connection alert, push registration, live updates, notifications).
import React, { useEffect, useState } from "react"
import * as ScreenOrientation from "expo-screen-orientation"
import { Dimensions, StyleSheet } from "react-native"
import * as Notifications from "expo-notifications"
import { useQueryClient } from "@tanstack/react-query"
import { VideoView, useVideoPlayer } from "expo-video"

import FastImageComponent from "./media/FastImageComponent"
import Sidebar from "./sidebar/Sidebar"
import AppSession from "./AppSession"
import ModalManager from "./ModalManager"
import UpdateRequired from "./UpdateRequired"
import useAuthStore from "../stores/authStore"
import useLiveChannels from "../hooks/main/useLiveChannels"
import useNotificationRouter from "../hooks/main/useNotificationRouter"
import usePushRegistration from "../hooks/main/usePushRegistration"
import useAppData from "../hooks/main/useAppData"
import useConnectionAlert from "../hooks/main/useConnectionAlert"
import { useRefreshInboxCount } from "../hooks/queries/useInboxCount"
import { useInvalidateOffers } from "../hooks/queries/useInbox"
import useEvent from "../hooks/useEvent"
import { onReconnect } from "../Services/live"
import useUiStore from "../stores/uiStore"
import useAppSettings from "../hooks/queries/useAppSettings"
import { isOlder, appVersion } from "../Helpers/appVersion"

Notifications.setNotificationHandler({
  // a push that arrives while the app is open is shown as a banner and kept in the tray
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true
  })
})

const styles = StyleSheet.create({
  splash: { width: "100%", height: "102%" }
})

export default function Main() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const refreshInboxCount = useRefreshInboxCount()
  const invalidateOffers = useInvalidateOffers()
  const { routeNotification, routeLiveModal } = useNotificationRouter()
  const pushRegistration = usePushRegistration()
  const registerPush = useEvent(() => pushRegistration.register())
  const openNotification = useEvent((data) => routeNotification(data))

  useAppData()
  useConnectionAlert()
  // an app older than the API still serves can only be updated
  const updateRequired = isOlder(appVersion(), useAppSettings().minAppVersion)

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }, [])

  // the intro video; the notification permission is asked once it has played
  const [hideSplash, setHideSplash] = useState(false)
  const [statusPlaying, setStatusPlaying] = useState(true)
  const videoPlayer = useVideoPlayer(require("../assets/introgotovo.mp4"), (player) => {
    player.loop = false
    player.play()
  })

  useEffect(() => {
    const playing = videoPlayer.addListener("playingChange", ({ isPlaying }) => {
      if (isPlaying) setHideSplash(true)
    })
    const ended = videoPlayer.addListener("playToEnd", () => {
      setStatusPlaying(false)
      registerPush()
    })
    // in case playToEnd doesn't fire
    const fallback = setTimeout(() => {
      setStatusPlaying(false)
      registerPush()
    }, 5000)

    return () => {
      playing.remove()
      ended.remove()
      clearTimeout(fallback)
    }
  }, [videoPlayer, registerPush])

  // server data is per user: reload the inbox count on login, drop every cached query on logout
  useEffect(() => {
    if (user.loggedIn) refreshInboxCount()
    else queryClient.clear()
  }, [user.loggedIn, refreshInboxCount, queryClient])

  // the socket back after a drop: what it missed meanwhile is reloaded (the queries on screen)
  useEffect(() => onReconnect(() => queryClient.invalidateQueries()), [queryClient])

  // live updates while logged in
  useLiveChannels(user.loggedIn === true ? user.userData.channel : null, {
    onCountInbox: () => refreshInboxCount(),
    onOpenModal: routeLiveModal,
    onRefreshOffers: () => invalidateOffers()
  })

  // a tapped push notification, handled once (cleared, or the next start would open it again). At a cold
  // start the tap arrives before the navigator is up and before the session is restored: a navigation
  // then is lost, and the user (their role) unknown: it waits for both.
  const lastNotificationResponse = Notifications.useLastNotificationResponse()
  const navigationReady = useUiStore((state) => state.navigationReady)
  const restoring = useAuthStore((state) => state.restoring)
  useEffect(() => {
    if (!lastNotificationResponse || !navigationReady || restoring) return
    openNotification(lastNotificationResponse.notification.request.content?.data?.data)
    Notifications.clearLastNotificationResponse()
  }, [lastNotificationResponse, navigationReady, restoring, openNotification])

  // nothing else of the app (its session, menu and modals: a native modal would cover the screen)
  if (updateRequired) return <UpdateRequired />

  return (
    <>
      {!hideSplash || (!statusPlaying && restoring) ? <FastImageComponent source={require("../assets/splash-image.png")} style={styles.splash} /> : null}
      {statusPlaying ? (
        <VideoView
          style={{
            zIndex: 99999,
            position: "absolute",
            top: 0,
            left: 0,
            width: Dimensions.get("screen").width,
            height: Dimensions.get("screen").height
          }}
          player={videoPlayer}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}
      <AppSession hideSplash={hideSplash} statusPlaying={statusPlaying} />
      <Sidebar />
      <ModalManager />
    </>
  )
}
