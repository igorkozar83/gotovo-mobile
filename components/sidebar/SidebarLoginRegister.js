// SidebarLoginRegister.js
// Logged out, the side menu offers logging in or creating an account.
import React from "react"
import { Pressable, Text, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Sidebar.style"

const SidebarLoginRegister = ({ onClose }) => {
  const open = (setter) => {
    onClose()
    setter(true)
  }
  return (
    <>
      <Pressable style={local.loginRow} onPress={() => open(useUiStore.getState().setAuthOpen)}>
        <FastImageComponent source={require("../../assets/manulogin.png")} style={{ aspectRatio: 35 / 40, height: 18, width: 16, marginLeft: 40, top: 3 }} />
        <Text style={[styles.topText, local.loginText]}>{translate("common.login")}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => open(useUiStore.getState().setRegisterOpen)}>
        <FastImageComponent source={require("../../assets/menuregister.png")} style={{ aspectRatio: 43 / 40, height: 18, width: 19, marginLeft: 40, top: -12 }} />
        <Text style={{ ...styles.topText, paddingLeft: 10 }}>
          {translate("sidebarLoginRegister.createAn")} {"\n"}
          {translate("sidebarLoginRegister.account")}
        </Text>
      </Pressable>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  loginRow: { marginTop: 10, flexDirection: "row" },
  loginText: { marginBottom: 10, paddingLeft: 10 }
})

export default SidebarLoginRegister
