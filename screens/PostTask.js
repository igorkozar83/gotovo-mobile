// PostTask.js
// Posting a task (or an SOS task, or a task again): the form's sections in components/postTask, its state
// and submitting in hooks/postTask/usePostTaskForm. A guest also enters their new account's details.
import React from "react"
import { ScrollView, View, Text, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { Controller } from "react-hook-form"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import FastImageComponent from "../components/media/FastImageComponent"
import CustomTextInput from "../components/ui/CustomTextInput"
import ButtonWithIcon from "../components/ui/ButtonWithIcon"
import CategorySlider from "../components/postTask/CategorySlider"
import JobPicker from "../components/postTask/JobPicker"
import DescribeSection from "../components/postTask/DescribeSection"
import MediaSection from "../components/postTask/MediaSection"
import DatesSection from "../components/postTask/DatesSection"
import { SavedPlace, GuestPlace } from "../components/postTask/PlaceSection"
import ContactFields from "../components/postTask/ContactFields"
import { LoginInvite, AccountDetails } from "../components/postTask/GuestSignUp"
import AgreementSection from "../components/postTask/AgreementSection"
import usePostTaskForm from "../hooks/postTask/usePostTaskForm"
import useAppSettings from "../hooks/queries/useAppSettings"
import useCachedImage from "../hooks/useCachedImage"
import useAuthStore from "../stores/authStore"
import useUiStore from "../stores/uiStore"
import { translate } from "../Helpers/language.utils"
import styles from "../styles/PostTask.style"
import { spokenLabel } from "../Helpers/accessibility"
import { atoms } from "../styles/atoms"

const PostTask = ({ route }) => {
  const params = route?.params || null
  const appSettings = useAppSettings()
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const selectedCat = useUiStore((state) => state.selectedCat)
  const setSelectedCat = useUiStore((state) => state.setSelectedCat)

  const { form, media, jobs, subTask, chooseSubTask, setOption, toggleOption, submit } = usePostTaskForm({ params })
  const { control, setValue } = form
  // (watch, not useWatch: a useWatch next to useForm misses the value set while the screen first mounts,
  // and an S.O.S. task opened from Home was titled "Post a Task")
  const isSos = form.watch("isSos")
  const headerImage = useCachedImage(subTask?.image, "post-task-images-1")

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} enabled style={local.keyboard}>
        <ActivityInd />
        <View style={styles.container}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[{ ...styles.containerStyle, paddingBottom: 100 }]}
            keyboardShouldPersistTaps={"handled"}
            bounces={false}
          >
            <Header back transparent />
            <View>
              <FastImageComponent source={headerImage} style={[{ ...styles.postTaskMainImage }]} />
              <View style={local.titles}>
                <Text style={{ marginBottom: -10, ...styles.topTaskTextBold }}>{!isSos ? translate("postTask.post") : translate("postTask.sOS")}</Text>
                <Text style={styles.topTaskTextRegular}>{!isSos ? translate("postTask.aTask") : translate("postTask.task")}</Text>
              </View>
            </View>
            <View style={styles.container}>
              <CategorySlider buttons={appSettings.buttons} selected={selectedCat} onSelect={setSelectedCat} />
            </View>
            <Text style={styles.topText}>{!isSos ? translate("postTask.postingATaskIsFreeInclude") : translate("postTask.postingATaskIsFreeSos")}</Text>
            <JobPicker jobs={jobs} selected={subTask} onChoose={chooseSubTask} />
            <DescribeSection control={control} subTask={subTask} setOption={setOption} toggleOption={toggleOption} />
            <MediaSection media={media} />
            <DatesSection control={control} setValue={setValue} />
            {loggedIn ? <SavedPlace control={control} setValue={setValue} /> : <LoginInvite />}
            <ContactFields control={control} loggedIn={loggedIn} />
            {!loggedIn && (
              <>
                <GuestPlace control={control} setValue={setValue} />
                <AccountDetails control={control} />
              </>
            )}
            {loggedIn && (
              <>
                <Text style={styles.label}>{translate("postTask.additionalInstructions")}</Text>
                <Controller
                  control={control}
                  name="additionalInstruction"
                  render={({ field: { value, onChange } }) => (
                    <CustomTextInput
                      accessibilityLabel={spokenLabel("postTask.additionalInstructions")}
                      multiline={true}
                      scrollEnabled={false}
                      numberOfLines={4}
                      value={value}
                      onChangeText={onChange}
                      style={styles.descInput}
                    />
                  )}
                />
              </>
            )}
            <AgreementSection control={control} />
            <ButtonWithIcon
              text={loggedIn ? translate("postTask.getOffers") : translate("postTask.registerConfirm")}
              buttonStyle={[styles.button, styles.buttonNext, styles.buttonAltDates, styles.buttonConfTask, atoms.borderRadius5]}
              onPress={submit}
              iconSource={require("../assets/iconconfbutton.png")}
              iconStyle={local.buttonIcon}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  keyboard: { paddingBottom: 0, flex: 1 },
  buttonIcon: { width: 18, height: 12 },
  titles: { position: "absolute", bottom: 5, left: 22 }
})

export default PostTask
