RBIC LIVE BUILD — Firebase + Roles + Excel + FCM Receiving

School: RAMBHAROSE INTER COLLEGE, SAMADKHEDA MEETON
Roles: Admin, Teacher, Student (no Parent role)

IMPORTANT LIVE BUILD CHANGE
- Firebase configuration is embedded directly in index.html, so the live app does NOT depend on firebase-config.js loading before startup.
- firebase-config.js is also included as a matching backup/reference file.
- Firebase SDKs are loaded before app code and the default Firebase app is initialized before authentication code runs.
- FCM service worker registration is explicit and scoped to /.

Included features preserved:
- Admin / Teacher / Student role UI
- Teacher cannot manage Teacher accounts
- Student sees only own operational data in the cloud restore flow
- Firestore cloud sync
- Excel/CSV import with validation preview and Excel exports
- FCM receiving/token registration setup

DEPLOY
1. Extract this ZIP.
2. Copy ALL files into C:\Users\Dell\OneDrive\Desktop\RBICAPP and replace the old same-name files.
3. Keep your existing firebase.json and .firebaserc, but ensure firebase.json contains the Firestore rules entry:
   "firestore": { "rules": "firestore.rules" }
4. Open CMD in RBICAPP and run:
   firebase deploy
5. Open https://rambharose-inter-college.web.app and hard-refresh with Ctrl+Shift+R.

AUTH TEST
- Login ID: ADMIN001
- Use the existing school-issued Admin password.

If auth/api-key-not-valid still appears after this exact build is deployed, check Firebase Authentication > Settings > Authorized domains and Google Cloud Credentials > Browser key. Do not change API restrictions blindly; Identity Toolkit API must remain allowed.

FCM
- Public VAPID key is configured.
- Browser notification permission should be requested from the app's Push/Notifications action after login.
- Server-side sending is NOT included in this receiving build; Step 3B should use trusted server-side Firebase Admin SDK/Cloud Functions.
