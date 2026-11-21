// Profile.js
// The logged-in user's own profile: general data, contact details, address book, a tasker's documents and
// links (the income accounts are a screen of their own: IncomeAccounts). The sections live in
// components/profile; this screen lays them out and owns which modal is open.
import { useState, useRef, useLayoutEffect } from "react"
import { ScrollView, View, StyleSheet, KeyboardAvoidingView } from "react-native"
import { useRoute } from "@react-navigation/native"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import ProfileHero from "../components/profile/ProfileHero"
import UserInfo from "../components/profile/UserInfo"
import GeneralDataSection from "../components/profile/GeneralDataSection"
import ContactSection from "../components/profile/ContactSection"
import AddressBookSection from "../components/profile/AddressBookSection"
import DocumentsSection from "../components/profile/DocumentsSection"
import ProfileLinks from "../components/profile/ProfileLinks"
import PasswordModal from "../components/profile/PasswordModal"
import VerifyPhoneModal from "../components/modals/VerifyPhoneModal"
import ProfilePictureModal from "../components/profile/ProfilePictureModal"
import NewPictureModal from "../components/modals/NewPictureModal"
import AddressModal from "../components/address/AddressModal"
import ImageFullScreen from "../components/media/ImageFullScreen"
import RemoveImage from "../components/media/RemoveImage"
import useProfileActions from "../hooks/profile/useProfileActions"
import useAuthStore from "../stores/authStore"
import { calcStars } from "../Helpers/index"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

const Profile = () => {
  const scrollRef = useRef()
  const route = useRoute()
  const params = route.params || null
  const userData = useAuthStore((state) => state.user.userData)
  const userSelect = useAuthStore((state) => state.userSelect)

  const [documentsY, setDocumentsY] = useState(0)
  // the one modal open at a time, with what it shows (an address to edit, an image)
  const [modal, setModal] = useState({ name: null, data: null })
  const open = (name, data = null) => setModal({ name, data })
  const close = () => setModal((current) => ({ ...current, name: null }))
  const isOpen = (name) => modal.name === name

  const { getUser, doDeleteUserImage, removeAddress, doDeleteAvatar, doRemovePhone, checkDoEditPhone } = useProfileActions({
    onAvatarDeleted: close,
    onPhoneRemovedForEdit: () => open("verifyPhone")
  })

  // opened to show the documents (e.g. an unverified tasker)
  useLayoutEffect(() => {
    if (params?.navigationLicences && documentsY) scrollRef.current?.scrollTo({ y: documentsY + 20, animated: true })
  }, [params, documentsY])

  const image = modal.data && modal.data.image ? modal.data.image : ""

  return (
    <>
      <ActivityInd />
      <View style={styles.container}>
        <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerStyle} keyboardShouldPersistTaps={"handled"} ref={scrollRef} bounces={false}>
          <Header taskerLogo />
          <KeyboardAvoidingView enabled>
            <ProfileHero bold={"profile.my"} light={"common.profile"} />
            <UserInfo
              stars={calcStars(userData, 1)}
              user={userData}
              countTasks={userData.type === "CLIENT" ? userData.tasks_count_client : userData.tasks_count_tasker}
              type={userData.type === "CLIENT" ? "TASKER" : "CLIENT"}
              isOwnProfile={true}
              onEditPicture={(visible) => (visible ? open("picture") : close())}
            />
            <View style={atoms.paddingHorizontal20}>
              <GeneralDataSection />
              <ContactSection onVerifyPhone={() => open("verifyPhone")} onRemovePhone={doRemovePhone} onEditPhone={checkDoEditPhone} />
              <AddressBookSection onAdd={() => open("address")} onEdit={(address) => open("address", address)} onRemove={removeAddress} />
              {userSelect !== "CLIENT" ? (
                <DocumentsSection
                  onLayoutY={setDocumentsY}
                  onAdd={() => open("newPicture")}
                  onPreview={(picked) => open("preview", picked)}
                  onRemove={(picked) => open("removeImage", picked)}
                />
              ) : null}
              <ProfileLinks onChangePassword={() => open("password")} />
              <PasswordModal visible={isOpen("password")} onClose={close} />
              <ProfilePictureModal visible={isOpen("picture")} onClose={close} reloadUser={getUser} deleteAvatar={doDeleteAvatar} />
              <AddressModal
                onVisibleChange={(visible) => (visible ? open("address", modal.data) : close())}
                visible={isOpen("address")}
                onClose={() => setModal({ name: null, data: null })}
                reloadUser={getUser}
                address={isOpen("address") ? modal.data : null}
              />
              <NewPictureModal visible={isOpen("newPicture")} onClose={close} reloadUser={getUser} />
            </View>
          </KeyboardAvoidingView>
          <VerifyPhoneModal visible={isOpen("verifyPhone")} onVisibleChange={(visible) => (visible ? open("verifyPhone") : close())} onClose={close} />
        </ScrollView>
        <ImageFullScreen visible={isOpen("preview")} onClose={close} image={image} />
        <RemoveImage
          visible={isOpen("removeImage")}
          onClose={close}
          image={image}
          onRemove={() => {
            close()
            doDeleteUserImage(modal.data.id)
          }}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  containerStyle: { flexGrow: 1 },
  container: { flex: 1, zIndex: 2, backgroundColor: palette.white }
})

export default Profile
