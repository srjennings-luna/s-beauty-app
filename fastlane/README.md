# Fastlane setup for Contueri iOS

This directory holds the Fastlane configuration that drives the iOS
cloud build pipeline. The CI workflow at
`.github/workflows/ios-build.yml` invokes the lanes defined here on
every push to `main` once the secrets are configured.

The build pipeline is **laptop-free**: certs live in an encrypted Git
repo (managed by Fastlane Match), GitHub Actions runs the build on a
managed macOS runner, and TestFlight upload happens via App Store
Connect API. Sheri's laptop is involved only for local development;
production builds never touch it.

---

## Activation checklist (after Apple Developer enrollment)

This list runs once, after the Apple Developer Individual enrollment
activates (DEV-01 lock, 24–48 hours from the moment Sheri submits the
$99 enrollment form). Until then the CI workflow exists but cannot
complete; that is expected.

### 1. Apple Developer portal setup (one-time)

- [ ] Visit https://developer.apple.com/account
- [ ] Confirm Individual enrollment is **Active**
- [ ] Note the 10-character **Team ID** from the Membership tab; this
      goes into the `APPLE_TEAM_ID` GitHub Actions secret
- [ ] Register App ID:
  - Bundle ID: `app.contueri.ios`
  - Description: `Contueri`
  - Capabilities: Push Notifications, Background Modes (audio playback)
- [ ] Generate App Store Connect API key:
  - https://appstoreconnect.apple.com/access/api
  - Role: Admin or App Manager
  - Download the `.p8` file (one-time download)
  - Note the **Key ID** and **Issuer ID**
  - These three values become `APP_STORE_CONNECT_API_KEY_ID`,
    `APP_STORE_CONNECT_API_KEY_ISSUER_ID`, and
    `APP_STORE_CONNECT_API_KEY_CONTENT` (the .p8 file contents
    verbatim, multi-line including BEGIN/END markers)

### 2. Cert storage repo (one-time)

Match stores encrypted certs in a separate private Git repo. Create
one now and leave it empty; the first `match_init` run will populate
it.

- [ ] Create a private repo, e.g. `srjennings-luna/contueri-certs`
- [ ] Note the clone URL (HTTPS for simplicity in CI):
      `https://github.com/srjennings-luna/contueri-certs.git`
- [ ] Generate a personal access token with repo scope for the certs
      repo. Base64-encode `username:token` (e.g.
      `srjennings-luna:ghp_xxx`) and store as the GitHub Actions
      secret `MATCH_GIT_BASIC_AUTHORIZATION`
- [ ] Pick a strong passphrase and store as `MATCH_PASSWORD` secret

### 3. GitHub Actions secrets

In the `kallos-app` repo, navigate to **Settings → Secrets and
variables → Actions**. Add the following:

| Secret name | Value |
|-------------|-------|
| `APPLE_ID` | The email used for Apple Developer enrollment |
| `APPLE_TEAM_ID` | 10-character team identifier from the portal |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from the .p8 download |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | Issuer ID from the .p8 download |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Full .p8 file contents, multi-line, including the BEGIN/END markers |
| `MATCH_GIT_URL` | HTTPS clone URL of the certs repo |
| `MATCH_GIT_BASIC_AUTHORIZATION` | Base64 of `username:token` for the certs repo |
| `MATCH_PASSWORD` | The passphrase you picked for encrypting certs |

### 4. First-time match init (run locally, NOT in CI)

This populates the certs repo with the encrypted distribution cert
and provisioning profile. After it runs once, every CI build pulls
the existing certs in read-only mode.

```bash
# In the kallos-app repo, after iOS scaffold is in place
cd ~/Documents/kallos-app

# Export the same env vars that GitHub Actions uses
export APPLE_ID="<your Apple ID>"
export APPLE_TEAM_ID="<10-char team ID>"
export MATCH_GIT_URL="<https URL of certs repo>"
export MATCH_PASSWORD="<your passphrase>"

# Install bundle deps if not done already
bundle install

# Generate the cert + profile, push encrypted to MATCH_GIT_URL
bundle exec fastlane match_init
```

After this completes, the certs repo will contain the encrypted
`.p12` cert and provisioning profile. From now on, every push to
`main` triggers the CI pipeline which uses these certs read-only.

### 5. Verify CI

Push any small commit to `main` (e.g., update README). Watch the
**Actions** tab in GitHub. The `iOS Build + TestFlight` workflow
should:

1. Check out source
2. Install Node and Ruby dependencies
3. `cap sync ios` to refresh the iOS project
4. Pull certs via Match (read-only)
5. Bump build number
6. Archive + sign the Xcode workspace
7. Upload to TestFlight

Watch for the build to appear in TestFlight on your phone within ~15
minutes of the workflow completing. Apple processes the build for a
few minutes after upload before it becomes installable.

---

## Local development (no certs needed)

For local iOS Simulator development, Xcode's "Personal Team" signing
is sufficient and free. The CI pipeline only activates for builds
destined for TestFlight or the App Store.

```bash
npx cap open ios
# Xcode opens; pick Personal Team in Signing & Capabilities to run
# on the simulator without paid Apple Developer account.
```

---

## When something goes wrong

- **Workflow fails at the Match step**: check that `MATCH_PASSWORD`,
  `MATCH_GIT_URL`, and `MATCH_GIT_BASIC_AUTHORIZATION` are set. The
  workflow output will include the specific error from Match.
- **Workflow fails at TestFlight upload**: check that the App Store
  Connect API key has not expired (max 1 year) and that
  `APP_STORE_CONNECT_API_KEY_CONTENT` includes the BEGIN/END markers
  with proper line breaks.
- **Cert expires after 1 year**: Apple distribution certs renew via
  re-running `bundle exec fastlane match_init` locally. The CI
  pipeline then picks up the new cert on the next build.

---

This file lives in version control. The actual certificates and
secrets do NOT.
