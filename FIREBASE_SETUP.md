# 🔥 Firebase Setup Guide — InvoiceForge Auth

This guide takes ~10 minutes to complete. After this, your site will have:
- ✅ Email + Password sign in / sign up
- ✅ Google One-Click sign in
- ✅ Magic Link (passwordless email)
- ✅ Cloud invoice saving (Firestore)
- ✅ Invoice dashboard (load, delete saved invoices)
- ✅ Language switcher in header (for all users)

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `InvoiceForge` → Continue
4. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Register Your Web App

1. In your project dashboard, click **`</>`** (Web) icon
2. App nickname: `InvoiceForge Web` → **Register app**
3. Copy the `firebaseConfig` object shown — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "invoiceforge-xxxxx.firebaseapp.com",
  projectId: "invoiceforge-xxxxx",
  storageBucket: "invoiceforge-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. Open `js/firebase-config.js` and paste your values into `FIREBASE_CONFIG`
5. Also update `MAGIC_LINK_URL` to your live domain (or keep `window.location.origin` for auto-detect)

---

## Step 3 — Enable Authentication Methods

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:

| Provider | Instructions |
|---|---|
| **Email/Password** | Click → Enable top toggle → Save |
| **Google** | Click → Enable → Set support email → Save |
| **Email link (passwordless)** | Click Email/Password → Enable second toggle "Email link" → Save |

---

## Step 4 — Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Start in production mode"** → Next
3. Choose a location (pick closest to your main users) → **Enable**
4. Go to **Rules** tab and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /invoices/{invoiceId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

5. Click **Publish**

---

## Step 5 — Add Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Your Firebase domain is already there. Add:
   - `localhost` (for local testing)
   - Your production domain e.g. `www.invoiceforge.com`

---

## Step 6 — Configure Magic Link Email Template (Optional)

1. Authentication → **Templates** → **Email link sign-in**
2. Customize the subject and body to match your brand
3. You can add a custom "From" name and email in **SMTP settings** (requires upgrade)

---

## Step 7 — Test Locally

Run with Live Server in VS Code. Test:
- ✅ Sign up with email + password
- ✅ Sign in with Google (popup)
- ✅ Send magic link → check inbox → click link → signed in
- ✅ Create invoice → Save → appears in dashboard
- ✅ Language switcher in header changes invoice labels

---

## Free Tier Limits (Firebase Spark Plan)

| Feature | Free Limit |
|---|---|
| Authentication | 10,000 sign-ins/month |
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Firestore storage | 1 GB |

This is more than enough for thousands of users. Upgrade to Blaze (pay-as-you-go) when you scale.

---

## Troubleshooting

**"Firebase is not configured yet"** — You haven't filled in `js/firebase-config.js` yet.

**Google sign-in popup blocked** — User must allow popups for your domain. Message shown in the modal.

**Magic link not received** — Check spam. Firebase sends from `noreply@your-project.firebaseapp.com`.

**"auth/unauthorized-domain"** — Add your domain to Firebase → Authentication → Authorized domains.

**Firestore permission denied** — Make sure you published the security rules in Step 4.
