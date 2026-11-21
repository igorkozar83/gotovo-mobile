// useRoleColors.js
// The colors for the role the app is used in (see Helpers/roleColors).
import useAuthStore from "../stores/authStore"
import { roleColors } from "../Helpers/roleColors"

const useRoleColors = () => roleColors(useAuthStore((state) => state.userSelect))

export default useRoleColors
