// timezone.js
// Jest globalSetup: the tests run in the users' time zone (Serbia, UTC+1 / +2), whatever the machine's
// is, so a date that depends on it (a day picked just after midnight) is the same everywhere. The
// workers start after this and take the zone with them.
module.exports = () => {
  process.env.TZ = "Europe/Belgrade"
}
