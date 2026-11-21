// IncomeAccounts.js
// A tasker's income accounts: the saved card and bank account their income is paid to, and the modal
// that adds or edits the bank account. Opened from the side menu (while payments are on); the header's
// arrow goes back.
import React, { useState } from "react"
import { ScrollView, View, StyleSheet } from "react-native"

import Header from "../components/Header"
import ActivityInd from "../components/ui/ActivityInd"
import ProfileHero from "../components/profile/ProfileHero"
import UserInfo from "../components/profile/UserInfo"
import IncomeAccountsSection from "../components/profile/IncomeAccountsSection"
import IncomeAccountsModal from "../components/profile/IncomeAccountsModal"
import ProfilePictureModal from "../components/profile/ProfilePictureModal"
import useProfileActions from "../hooks/profile/useProfileActions"
import useAuthStore from "../stores/authStore"
import { calcStars } from "../Helpers/index"
import { palette } from "../styles/palette"
import { atoms } from "../styles/atoms"

const IncomeAccounts = () => {
  const userData = useAuthStore((state) => state.user.userData)
  // the one modal open at a time: the bank account ({ edit }) or the profile picture
  const [modal, setModal] = useState({ name: null, data: null })
  const close = () => setModal((current) => ({ ...current, name: null }))

  const { getUser, doDeleteAvatar, doRemoveCardInfo, doRemoveBankInfo } = useProfileActions({ onAvatarDeleted: close })

  return (
    <>
      <ActivityInd />
      <View style={styles.container}>
        <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerStyle} keyboardShouldPersistTaps={"handled"} bounces={false}>
          <Header back transparent />
          <ProfileHero bold={"incomeAccounts.income"} light={"incomeAccounts.accounts"} />
          <UserInfo
            stars={calcStars(userData, 1)}
            user={userData}
            countTasks={userData.type === "CLIENT" ? userData.tasks_count_client : userData.tasks_count_tasker}
            type={userData.type === "CLIENT" ? "TASKER" : "CLIENT"}
            isOwnProfile={true}
            onEditPicture={(visible) => (visible ? setModal({ name: "picture", data: null }) : close())}
          />
          <View style={atoms.paddingHorizontal20}>
            <IncomeAccountsSection
              onRemoveCard={doRemoveCardInfo}
              onRemoveBank={doRemoveBankInfo}
              onEditBank={(bank) => setModal({ name: "account", data: { edit: true, bank } })}
              onAddBank={() => setModal({ name: "account", data: { edit: false } })}
            />
            <ProfilePictureModal visible={modal.name === "picture"} onClose={close} reloadUser={getUser} deleteAvatar={doDeleteAvatar} />
            <IncomeAccountsModal
              visible={modal.name === "account"}
              onClose={close}
              reloadUser={getUser}
              editBankAccount={Boolean(modal.data?.edit)}
              data={userData.user_bank_account_infos?.[0] || null}
            />
          </View>
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  containerStyle: { flexGrow: 1 },
  container: { flex: 1, zIndex: 2, backgroundColor: palette.white }
})

export default IncomeAccounts
