/* ============================================
   firebase-config.js
   ─────────────────────────────────────────────
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it "Make Free Invoice"
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
const firebaseConfig = {
  apiKey: "AIzaSyBhfBmaIJkd56RSmBwOpRL4dm39DGZ1paw",
  authDomain: "make-free-invoice-3f9f8.firebaseapp.com",
  projectId: "make-free-invoice-3f9f8",
  storageBucket: "make-free-invoice-3f9f8.firebasestorage.app",
  messagingSenderId: "618961078630",
  appId: "1:618961078630:web:80a2ef2749350af63760a7",
  measurementId: "G-6CJ1DXN6N8"
};

// The URL users are redirected to after clicking magic link email
// Change this to your actual domain when you go live
const MAGIC_LINK_URL = window.location.origin + "/index.html";

export { FIREBASE_CONFIG, MAGIC_LINK_URL };
