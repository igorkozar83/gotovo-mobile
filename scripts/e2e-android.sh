#!/usr/bin/env bash
# e2e-android.sh
# Runs the Maestro flows in .maestro/ on the running Android emulator (or a USB phone) against the admin
# repo's e2e backend: its own database (hotovo_e2e, made again from E2eSeeder here), never the local copy
# of production. Needs, already running:
#   - the e2e backend:  cd "../Hotovo Admin/app" && node e2e/server.js serve   (port 8095)
#   - Metro:            npx expo start --port 8081
#   - the debug build installed (npx expo run:android) and Maestro (https://maestro.mobile.dev)
# The app keeps its API_URL (localhost:8084): adb reverse sends 8084 to the e2e backend for the run and
# back to the docker backend afterwards.
set -euo pipefail

cd "$(dirname "$0")/.."
ADMIN_APP="${HOTOVO_ADMIN_APP:-../Hotovo Admin/app}"
ADB="${ADB:-adb}"
MAESTRO="${MAESTRO:-maestro}"

curl -fs -o /dev/null http://127.0.0.1:8095/api/settings || { echo "The e2e backend is not running on :8095 (see the top of this script)." >&2; exit 1; }
curl -fs -o /dev/null http://127.0.0.1:8081/status || { echo "Metro is not running on :8081 (see the top of this script)." >&2; exit 1; }

(cd "$ADMIN_APP" && node e2e/server.js db)

"$ADB" reverse tcp:8084 tcp:8095
"$ADB" reverse tcp:8081 tcp:8081
trap '"$ADB" reverse tcp:8084 tcp:8084' EXIT

export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true
"$MAESTRO" test "${@:-.maestro}"
