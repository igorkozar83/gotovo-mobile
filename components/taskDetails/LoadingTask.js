// LoadingTask.js
// A task's screen while the task loads by its id (the screens that show one task get only its id): the
// header and the spinner, or why it could not be loaded (the server's reason, e.g. the task is gone).
import React from "react"
import { ScrollView, Text, StyleSheet } from "react-native"

import Header from "../Header"
import ActivityInd from "../ui/ActivityInd"
import useListSpinner from "../../hooks/useListSpinner"
import { apiError } from "../../Helpers/apiErrors"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

// query: the task's (useTaskDetail)
const LoadingTask = ({ query }) => {
  useListSpinner(query.isFetching)
  return (
    <>
      <ActivityInd />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Header back />
        {query.isError ? <Text style={styles.failed}>{apiError(query.error)?.message || translate("loadingTask.thereWasAnErrorWhileReceiving")}</Text> : null}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: palette.white },
  failed: { marginTop: 140, paddingHorizontal: 20, fontSize: 16, fontFamily: "Montserrat_400Regular", textAlign: "center" }
})

export default LoadingTask
