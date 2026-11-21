# Sentry: turning on crash reporting

The app already contains Sentry (`@sentry/react-native`). It stays off, and sends nothing, until a DSN
is set. Once it is on, it collects:

- crashes (native and JavaScript);
- unhandled JavaScript errors;
- render errors caught by the error boundaries;
- every error the code reports through `Helpers/reportError`: failed API calls, response checks,
  socket errors and the like.

## What is sent (and what isn't)

- The user is known by **id only**: no name, e-mail or phone.
- Request bodies, headers, cookies and URL queries are dropped. Breadcrumbs keep only the URL, method
  and status, and e-mail addresses in messages are replaced with `[email]` (`Services/crashReporting.js`,
  `scrub`).
- The device and app details the SDK adds itself stay: model, OS version, app version.
- No performance tracing (`tracesSampleRate: 0`). Turn it on later if needed.
- Nothing is sent from development builds unless `SENTRY_IN_DEV` is `1` or `true`.

## Turning it on

1. **Make the project.** In Sentry (sentry.io), create an organization and a project of type
   *React Native*.
2. **Collect four values:**
   - **DSN:** Project Settings → Client Keys.
   - **Organization slug.**
   - **Project slug.**
   - **Auth token:** Settings → Auth Tokens, with the `project:releases` and `org:read` scopes.
3. **Set them as EAS environment variables** (expo.dev → the project → Environment variables), for the
   *production* and *preview* environments:

   | Variable | Value | Visibility |
   |---|---|---|
   | `SENTRY_DSN` | the DSN | plain text |
   | `SENTRY_ORG` | the organization slug | plain text |
   | `SENTRY_PROJECT` | the project slug | plain text |
   | `SENTRY_AUTH_TOKEN` | the auth token | **secret** |
   | `SENTRY_ENVIRONMENT` | `production` (or `preview`) | plain text, optional |

4. **Build the app once** (`eas build`).
   - `SENTRY_ORG` switches on Sentry's native setup: the Expo plugin in `app.config.js` and the bundle
     marking in `metro.config.js`.
   - With `SENTRY_AUTH_TOKEN` in the build's environment, it also uploads the source maps, so the
     reports show the original code. Without the token, reports still arrive, but with minified code.
   - `SENTRY_DSN` starts the reporter in the app.
5. **Check it.** Throw a test error from a development build with `SENTRY_IN_DEV`, or wait for the first
   real report. It appears under Issues.

For local Gradle builds, set the same variables in the shell before `npx expo prebuild` /
`./gradlew assembleRelease`.

## Turning it off

Remove `SENTRY_DSN` and build again. The app then sends nothing.
