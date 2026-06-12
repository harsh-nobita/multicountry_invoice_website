/* ============================================
   firebase-config.js
   ─────────────────────────────────────────────
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it "InvoiceForge"
   3. Go to Project Settings → Your Apps → Add Web App
   4. Copy the firebaseConfig object and paste below
   5. In Firebase Console → Authentication → Sign-in method:
      ✅ Enable "Email/Password"
      ✅ Enable "Google"
      ✅ Enable "Email link (passwordless sign-in)"
   6. In Firebase Console → Firestore Database:
      ✅ Create database (Start in production mode)
      ✅ Add these security rules (see below)
   ============================================

   FIRESTORE SECURITY RULES (paste in Firebase console):
   ────────────────────────────────────────────
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
   ────────────────────────────────────────────
*/

// ⬇️ REPLACE THIS WITH YOUR FIREBASE CONFIG
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// The URL users are redirected to after clicking magic link email
// Change this to your actual domain when you go live
const MAGIC_LINK_URL = window.location.origin + "/index.html";

export { FIREBASE_CONFIG, MAGIC_LINK_URL };
