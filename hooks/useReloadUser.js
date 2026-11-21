// useReloadUser.js
// Reloads the logged-in user (profile, addresses, images, badges...) from the API into the auth store.
import useAuthStore from "../stores/authStore"
import { user as userApi } from "../Services/API"
import { reportError } from "../Helpers/reportError"

/** Returns reload(), which resolves to the reloaded user data (null when it could not be loaded). */
const useReloadUser = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return async () => {
    try {
      const user = await userApi()
      // an empty answer leaves the user as it is (never a profile wiped to nothing)
      if (!user) return null
      // functional update: keeps whatever else changed in the user state meanwhile
      setUser((current) => ({ ...current, userData: user }))
      return user
    } catch (e) {
      reportError(e, "useReloadUser")
      return null
    }
  }
}

export default useReloadUser
