/* ============================================
   auth.js – Firebase Authentication
   Handles: Email+Password, Google, Magic Link
   Cloud invoice save/load via Firestore
   ============================================ */

import { FIREBASE_CONFIG, MAGIC_LINK_URL } from './firebase-config.js';

// ── Firebase SDK (loaded from CDN in HTML) ──
let auth, db, googleProvider;
let currentUser = null;
let authReady = false;

/* ── INIT FIREBASE ───────────────────────── */
async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth, onAuthStateChanged, signInWithEmailAndPassword,
            createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
            sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink,
            signOut, updateProfile, sendPasswordResetEmail }
      = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore, doc, setDoc, getDoc, collection,
            getDocs, deleteDoc, serverTimestamp, orderBy, query }
      = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
    db   = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Store refs globally so other functions can use them
    window._fb = {
      auth, db, googleProvider,
      signInWithEmailAndPassword, createUserWithEmailAndPassword,
      signInWithPopup, sendSignInLinkToEmail,
      isSignInWithEmailLink, signInWithEmailLink,
      signOut, updateProfile, sendPasswordResetEmail,
      doc, setDoc, getDoc, collection,
      getDocs, deleteDoc, serverTimestamp, orderBy, query
    };

    // Auth state listener
    onAuthStateChanged(auth, user => {
      currentUser = user;
      authReady   = true;
      onAuthStateChange(user);
    });

    // Check if arriving via magic link
    checkMagicLinkSignIn();

  } catch (err) {
    console.warn('Firebase not configured yet:', err.message);
    authReady = true;
    updateHeaderForGuest();
  }
}

/* ── AUTH STATE CHANGE ───────────────────── */
function onAuthStateChange(user) {
  if (user) {
    updateHeaderForUser(user);
    loadCloudInvoices();
    showToast(`👋 Welcome back, ${user.displayName || user.email.split('@')[0]}!`);
  } else {
    updateHeaderForGuest();
    hideDashboard();
  }
}

/* ══════════════════════════════════════════
   HEADER UI
══════════════════════════════════════════ */
function updateHeaderForUser(user) {
  const actionsEl = document.getElementById('headerAuthArea');
  if (!actionsEl) return;

  const initials = getInitials(user.displayName || user.email);
  actionsEl.innerHTML = `
    <button class="user-avatar-btn" id="userAvatarBtn" onclick="toggleUserDropdown()"
            aria-label="Account menu" aria-expanded="false" aria-haspopup="true">
      ${user.photoURL
        ? `<img src="${user.photoURL}" alt="${initials}" referrerpolicy="no-referrer" />`
        : initials}
    </button>
  `;

  // Dropdown (appended to body)
  let dd = document.getElementById('userDropdown');
  if (!dd) {
    dd = document.createElement('div');
    dd.className = 'user-dropdown';
    dd.id = 'userDropdown';
    document.body.appendChild(dd);
  }
  dd.innerHTML = `
    <div class="user-dropdown-header">
      <div class="user-dropdown-avatar">
        ${user.photoURL
          ? `<img src="${user.photoURL}" alt="${initials}" referrerpolicy="no-referrer" />`
          : initials}
      </div>
      <div>
        <div class="user-dd-name">${user.displayName || 'User'}</div>
        <div class="user-dd-email">${user.email}</div>
      </div>
    </div>
    <div class="user-dropdown-menu">
      <button class="user-dd-item" onclick="saveInvoiceToCloud(); toggleUserDropdown()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Save Invoice to Cloud
      </button>
      <button class="user-dd-item" onclick="showDashboard(); toggleUserDropdown()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        My Invoices
      </button>
      <div class="user-dd-divider"></div>
      <button class="user-dd-item" onclick="openAccountSettings(); toggleUserDropdown()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Account Settings
      </button>
      <div class="user-dd-divider"></div>
      <button class="user-dd-item danger" onclick="signOutUser()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>
    </div>
  `;
}

function updateHeaderForGuest() {
  const actionsEl = document.getElementById('headerAuthArea');
  if (!actionsEl) return;
  actionsEl.innerHTML = `
    <button class="signin-chip" onclick="openAuthModal('signin')" aria-label="Sign in to save invoices">
      <div class="signin-chip-avatar" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </div>
      Sign In
    </button>
  `;
}

function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  const btn = document.getElementById('userAvatarBtn');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', isOpen);
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  const dd  = document.getElementById('userDropdown');
  const btn = document.getElementById('userAvatarBtn');
  if (dd && dd.classList.contains('open') && !dd.contains(e.target) && e.target !== btn) {
    dd.classList.remove('open');
  }
  const ld  = document.getElementById('langDropdown');
  const lb  = document.getElementById('langBtn');
  if (ld && ld.classList.contains('open') && !ld.contains(e.target) && e.target !== lb && !lb?.contains(e.target)) {
    ld.classList.remove('open');
  }
});

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(/[\s@]/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

/* ══════════════════════════════════════════
   AUTH MODAL
══════════════════════════════════════════ */
let activeTab    = 'signin';   // 'signin' | 'signup'
let activeMethod = 'email';    // 'email' | 'google' | 'magic'

function openAuthModal(tab = 'signin') {
  activeTab = tab;
  const overlay = document.getElementById('authOverlay');
  if (!overlay) { buildAuthModal(); }
  document.getElementById('authOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
  setTimeout(() => {
    const firstInput = document.querySelector('.auth-field input');
    if (firstInput) firstInput.focus();
  }, 300);
}

function closeAuthModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  clearAuthMessages();
}

function buildAuthModal() {
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.id = 'authOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Sign in or create account');

  overlay.innerHTML = `
    <div class="auth-modal" id="authModal">

      <!-- Header -->
      <div class="auth-modal-header">
        <div class="auth-logo">
          <span class="auth-logo-mark">⬡</span>
          <span class="auth-logo-text">Make Free <strong>Invoice</strong></span>
        </div>
        <div class="auth-modal-title" id="authModalTitle">Welcome back</div>
        <div class="auth-modal-sub" id="authModalSub">Sign in to save invoices across devices</div>
        <button class="auth-close-btn" onclick="closeAuthModal()" aria-label="Close">✕</button>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" id="tabSignin" role="tab" aria-selected="true"
                onclick="switchTab('signin')">Sign In</button>
        <button class="auth-tab" id="tabSignup" role="tab" aria-selected="false"
                onclick="switchTab('signup')">Create Account</button>
      </div>

      <!-- Body -->
      <div class="auth-modal-body">

        <!-- Benefits strip -->
        <div class="auth-benefits">
          <div class="auth-benefits-title">✦ Free account benefits</div>
          <div class="auth-benefits-list">
            <div class="auth-benefit-item">Save invoices to cloud — access anywhere</div>
            <div class="auth-benefit-item">Invoice history &amp; dashboard</div>
            <div class="auth-benefit-item">Auto-sync across all your devices</div>
            <div class="auth-benefit-item">All features free, forever</div>
          </div>
        </div>

        <!-- Auth method selector -->
        <div class="auth-methods" role="group" aria-label="Sign in method">
          <button class="auth-method-btn active" id="methodEmail" onclick="switchMethod('email')" aria-pressed="true">
            <span class="auth-method-icon">✉️</span>
            <span>Email</span>
          </button>
          <button class="auth-method-btn" id="methodGoogle" onclick="switchMethod('google')" aria-pressed="false">
            <span class="auth-method-icon">🔵</span>
            <span>Google</span>
          </button>
          <button class="auth-method-btn" id="methodMagic" onclick="switchMethod('magic')" aria-pressed="false">
            <span class="auth-method-icon">✨</span>
            <span>Magic Link</span>
          </button>
        </div>

        <!-- Message area -->
        <div class="auth-message" id="authMessage" role="alert" aria-live="assertive"></div>

        <!-- PANEL: Email/Password -->
        <div id="panelEmail">
          <div class="auth-form" id="emailForm">
            <div class="auth-field" id="nameFieldWrap" style="display:none">
              <label for="authName">Full Name</label>
              <input type="text" id="authName" placeholder="Jane Smith" autocomplete="name" />
            </div>
            <div class="auth-field">
              <label for="authEmail">Email Address</label>
              <input type="email" id="authEmail" placeholder="you@example.com"
                     autocomplete="email" onkeydown="handleEnter(event,'authPassword')" />
            </div>
            <div class="auth-field">
              <label for="authPassword">Password</label>
              <div class="auth-pw-wrap">
                <input type="password" id="authPassword" placeholder="••••••••"
                       autocomplete="current-password" onkeydown="handleEnterSubmit(event)" />
                <button type="button" class="auth-pw-toggle" onclick="togglePwVisibility()"
                        aria-label="Toggle password visibility">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="eyeIcon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <div class="auth-footer-links" id="forgotPwRow">
              <span></span>
              <a href="#" onclick="handleForgotPassword(event)">Forgot password?</a>
            </div>
            <button class="auth-submit-btn" id="emailSubmitBtn" onclick="handleEmailAuth()">
              <div class="btn-spinner"></div>
              <span class="btn-label">Sign In</span>
            </button>
          </div>
        </div>

        <!-- PANEL: Google -->
        <div id="panelGoogle" style="display:none">
          <button class="auth-google-btn" onclick="handleGoogleAuth()">
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:14px">
            One click — no passwords to remember
          </p>
        </div>

        <!-- PANEL: Magic Link -->
        <div id="panelMagic" style="display:none">
          <div id="magicFormState">
            <div class="auth-form">
              <div class="auth-field">
                <label for="magicEmail">Email Address</label>
                <input type="email" id="magicEmail" placeholder="you@example.com"
                       autocomplete="email" onkeydown="handleEnterSubmit(event,'sendMagicLink')" />
              </div>
              <button class="auth-submit-btn" id="magicSubmitBtn" onclick="sendMagicLink()">
                <div class="btn-spinner"></div>
                <span class="btn-label">✨ Send Magic Link</span>
              </button>
            </div>
            <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:12px;line-height:1.6">
              We'll email you a secure sign-in link.<br>No password needed.
            </p>
          </div>
          <div id="magicSentState" class="magic-sent-state" style="text-align:center;padding:10px 0">
            <div style="font-size:2.5rem;margin-bottom:12px">📬</div>
            <h4 style="font-size:16px;font-weight:700;margin-bottom:8px">Check your inbox!</h4>
            <p style="font-size:13px;color:#6b7280;line-height:1.65">
              We sent a magic sign-in link to<br>
              <strong id="magicSentEmail" style="color:#1a3c5e"></strong>
            </p>
            <p style="font-size:12px;color:#9ca3af;margin-top:10px">
              Link expires in 30 minutes. Check spam if not received.
            </p>
            <button onclick="resetMagicForm()" style="margin-top:14px;background:none;border:none;color:#1a3c5e;font-size:13px;font-weight:600;cursor:pointer;">
              ← Try a different email
            </button>
          </div>
        </div>

      </div><!-- /.auth-modal-body -->
    </div><!-- /.auth-modal -->
  `;

  // Close on backdrop click
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });
  document.body.appendChild(overlay);
}

function switchTab(tab) {
  activeTab = tab;
  const isSignup = tab === 'signup';

  document.getElementById('tabSignin')?.classList.toggle('active', !isSignup);
  document.getElementById('tabSignup')?.classList.toggle('active', isSignup);
  document.getElementById('tabSignin')?.setAttribute('aria-selected', !isSignup);
  document.getElementById('tabSignup')?.setAttribute('aria-selected', isSignup);

  // Update header copy
  document.getElementById('authModalTitle').textContent = isSignup ? 'Create your account' : 'Welcome back';
  document.getElementById('authModalSub').textContent   = isSignup
    ? 'Free forever — your invoices, synced everywhere'
    : 'Sign in to access your saved invoices';

  // Show/hide name field
  const nameWrap = document.getElementById('nameFieldWrap');
  if (nameWrap) nameWrap.style.display = isSignup ? '' : 'none';

  // Update password autocomplete
  const pwInput = document.getElementById('authPassword');
  if (pwInput) pwInput.setAttribute('autocomplete', isSignup ? 'new-password' : 'current-password');

  // Update submit label
  const label = document.querySelector('#emailSubmitBtn .btn-label');
  if (label) label.textContent = isSignup ? 'Create Account' : 'Sign In';

  // Forgot password visibility
  const fpRow = document.getElementById('forgotPwRow');
  if (fpRow) fpRow.style.display = isSignup ? 'none' : '';

  clearAuthMessages();
}

function switchMethod(method) {
  activeMethod = method;
  ['email','google','magic'].forEach(m => {
    const btn = document.getElementById(`method${m.charAt(0).toUpperCase()+m.slice(1)}`);
    const panel = document.getElementById(`panel${m.charAt(0).toUpperCase()+m.slice(1)}`);
    const isActive = m === method;
    btn?.classList.toggle('active', isActive);
    btn?.setAttribute('aria-pressed', isActive);
    if (panel) panel.style.display = isActive ? '' : 'none';
  });
  clearAuthMessages();
}

/* ══════════════════════════════════════════
   AUTH HANDLERS
══════════════════════════════════════════ */
async function handleEmailAuth() {
  if (!window._fb) { showAuthMessage('Firebase is not configured yet.', 'error'); return; }
  const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = window._fb;

  const email    = document.getElementById('authEmail')?.value.trim();
  const password = document.getElementById('authPassword')?.value;
  const name     = document.getElementById('authName')?.value.trim();

  if (!email || !password) { showAuthMessage('Please enter email and password.', 'error'); return; }
  if (activeTab === 'signup' && password.length < 6) {
    showAuthMessage('Password must be at least 6 characters.', 'error'); return;
  }

  setButtonLoading('emailSubmitBtn', true);
  clearAuthMessages();

  try {
    if (activeTab === 'signup') {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await initUserDocument(cred.user);
      closeAuthModal();
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    }
  } catch (err) {
    showAuthMessage(friendlyError(err.code), 'error');
  } finally {
    setButtonLoading('emailSubmitBtn', false);
  }
}

async function handleGoogleAuth() {
  if (!window._fb) { showAuthMessage('Firebase is not configured yet.', 'error'); return; }
  const { auth, signInWithPopup, googleProvider } = window._fb;
  clearAuthMessages();
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    // Init user doc if new user
    await initUserDocument(cred.user);
    closeAuthModal();
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthMessage(friendlyError(err.code), 'error');
    }
  }
}

async function sendMagicLink() {
  if (!window._fb) { showAuthMessage('Firebase is not configured yet.', 'error'); return; }
  const { auth, sendSignInLinkToEmail } = window._fb;
  const email = document.getElementById('magicEmail')?.value.trim();
  if (!email) { showAuthMessage('Please enter your email address.', 'error'); return; }

  setButtonLoading('magicSubmitBtn', true);
  try {
    const actionCodeSettings = {
      url: MAGIC_LINK_URL,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    document.getElementById('magicSentEmail').textContent = email;
    document.getElementById('magicFormState').style.display = 'none';
    document.getElementById('magicSentState').style.display = 'block';
  } catch (err) {
    showAuthMessage(friendlyError(err.code), 'error');
  } finally {
    setButtonLoading('magicSubmitBtn', false);
  }
}

async function checkMagicLinkSignIn() {
  if (!window._fb) return;
  const { auth, isSignInWithEmailLink, signInWithEmailLink } = window._fb;
  if (!isSignInWithEmailLink(auth, window.location.href)) return;

  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Please confirm your email address to complete sign-in:');
  }
  if (!email) return;

  try {
    const cred = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    await initUserDocument(cred.user);
    // Clean up URL
    window.history.replaceState(null, '', window.location.pathname);
    showToast('✓ Signed in successfully!');
  } catch (err) {
    showToast('Sign-in link expired or already used. Please request a new one.');
  }
}

function resetMagicForm() {
  document.getElementById('magicFormState').style.display = '';
  document.getElementById('magicSentState').style.display = 'none';
  document.getElementById('magicEmail').value = '';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  if (!window._fb) return;
  const { auth, sendPasswordResetEmail } = window._fb;
  const email = document.getElementById('authEmail')?.value.trim();
  if (!email) { showAuthMessage('Enter your email above first.', 'info'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    showAuthMessage(`Password reset email sent to ${email}`, 'success');
  } catch (err) {
    showAuthMessage(friendlyError(err.code), 'error');
  }
}

async function signOutUser() {
  if (!window._fb) return;
  const { auth, signOut } = window._fb;
  try {
    await signOut(auth);
    hideDashboard();
    showToast('Signed out successfully.');
  } catch (err) {
    showToast('Error signing out.');
  }
}

/* ══════════════════════════════════════════
   FIRESTORE — User doc & invoice CRUD
══════════════════════════════════════════ */
async function initUserDocument(user) {
  if (!window._fb || !user) return;
  const { db, doc, setDoc, getDoc, serverTimestamp } = window._fb;
  const userRef = doc(db, 'users', user.uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email:       user.email,
      displayName: user.displayName || '',
      photoURL:    user.photoURL || '',
      createdAt:   serverTimestamp(),
      country:     '',
      currency:    'USD',
      language:    'en',
    });
  }
}

async function saveInvoiceToCloud() {
  if (!currentUser) { openAuthModal('signup'); return; }
  if (!window._fb)  { showToast('Firebase not configured.'); return; }

  const { db, doc, setDoc, serverTimestamp } = window._fb;
  const data = collectInvoiceData();
  const invoiceId = data.invoiceNumber?.replace(/[^a-zA-Z0-9-_]/g,'_') || `inv_${Date.now()}`;

  updateCloudBadge('saving');
  try {
    await setDoc(
      doc(db, 'users', currentUser.uid, 'invoices', invoiceId),
      { ...data, savedAt: serverTimestamp(), uid: currentUser.uid }
    );
    updateCloudBadge('synced');
    showToast('✓ Saved to cloud!');
    loadCloudInvoices();
  } catch (err) {
    updateCloudBadge('offline');
    showToast('Error saving. Check your connection.');
  }
}

async function loadCloudInvoices() {
  if (!currentUser || !window._fb) return;
  const { db, collection, getDocs, query, orderBy } = window._fb;

  try {
    const q    = query(collection(db, 'users', currentUser.uid, 'invoices'), orderBy('savedAt','desc'));
    const snap = await getDocs(q);
    const invoices = [];
    snap.forEach(d => invoices.push({ id: d.id, ...d.data() }));
    renderDashboard(invoices);
  } catch (err) {
    console.warn('Could not load cloud invoices:', err);
  }
}

async function deleteCloudInvoice(invoiceId) {
  if (!currentUser || !window._fb) return;
  if (!confirm('Delete this invoice from the cloud?')) return;
  const { db, doc, deleteDoc } = window._fb;
  try {
    await deleteDoc(doc(db, 'users', currentUser.uid, 'invoices', invoiceId));
    showToast('Invoice deleted.');
    loadCloudInvoices();
  } catch (err) {
    showToast('Error deleting invoice.');
  }
}

/* ══════════════════════════════════════════
   DASHBOARD UI
══════════════════════════════════════════ */
function renderDashboard(invoices) {
  let panel = document.getElementById('dashboardPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'dashboard-panel';
    panel.id = 'dashboardPanel';
    const editorPanel = document.querySelector('.editor-panel');
    if (editorPanel) editorPanel.insertBefore(panel, editorPanel.firstChild);
  }

  const empty = invoices.length === 0;
  panel.innerHTML = `
    <div class="dashboard-header">
      <h3>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        My Cloud Invoices
      </h3>
      <div class="cloud-badge synced" id="cloudSyncBadge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Synced
      </div>
    </div>
    <div class="dashboard-list">
      ${empty ? '<div class="dashboard-empty">No saved invoices yet.<br>Click "Save Invoice to Cloud" to save your first one.</div>' :
        invoices.map(inv => `
          <div class="dashboard-item" onclick="loadCloudInvoice('${inv.id}')">
            <div class="dash-inv-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="dash-inv-info">
              <div class="dash-inv-num">${escHtml(inv.invoiceNumber || 'Invoice')}</div>
              <div class="dash-inv-client">${escHtml(inv.clientName || '—')}</div>
            </div>
            <div style="text-align:right">
              <div class="dash-inv-amount">${escHtml(inv.grandTotal || '—')}</div>
              <div class="dash-inv-date">${formatDate(inv.savedAt)}</div>
            </div>
            <div class="dash-inv-actions" onclick="event.stopPropagation()">
              <button class="dash-inv-btn del" onclick="deleteCloudInvoice('${inv.id}')" title="Delete" aria-label="Delete invoice ${escHtml(inv.invoiceNumber || '')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
  panel.style.display = '';
}

function loadCloudInvoice(id) {
  // Find and restore from in-memory list
  if (!window._fb || !currentUser) return;
  const { db, doc, getDoc } = window._fb;
  getDoc(doc(db, 'users', currentUser.uid, 'invoices', id)).then(snap => {
    if (snap.exists()) {
      restoreInvoiceData(snap.data());
      showToast(`✓ Loaded invoice ${snap.data().invoiceNumber || id}`);
    }
  });
}

function showDashboard() {
  const panel = document.getElementById('dashboardPanel');
  if (panel) panel.style.display = '';
  else loadCloudInvoices();
}

function hideDashboard() {
  const panel = document.getElementById('dashboardPanel');
  if (panel) panel.remove();
}

function updateCloudBadge(state) {
  const badge = document.getElementById('cloudSyncBadge');
  if (!badge) return;
  badge.className = `cloud-badge ${state}`;
  const labels = { synced:'✓ Synced', saving:'⟳ Saving…', offline:'⚠ Offline' };
  badge.innerHTML = labels[state] || '';
}

/* ══════════════════════════════════════════
   LANGUAGE SWITCHER (header, all users)
══════════════════════════════════════════ */
const LANGUAGES = [
  { code:'en', name:'English',    flag:'🇺🇸' },
  { code:'hi', name:'हिन्दी',       flag:'🇮🇳' },
  { code:'es', name:'Español',    flag:'🇪🇸' },
  { code:'fr', name:'Français',   flag:'🇫🇷' },
  { code:'de', name:'Deutsch',    flag:'🇩🇪' },
  { code:'pt', name:'Português',  flag:'🇧🇷' },
  { code:'ar', name:'العربية',    flag:'🇸🇦' },
  { code:'zh', name:'中文',        flag:'🇨🇳' },
  { code:'ja', name:'日本語',      flag:'🇯🇵' },
];

function buildLangSwitcher() {
  const container = document.getElementById('langSwitcherArea');
  if (!container) return;

  const currentLang = localStorage.getItem('invoiceforge_lang') || 'en';
  const lang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  container.innerHTML = `
    <button class="lang-switcher" id="langBtn" onclick="toggleLangDropdown()"
            aria-label="Change language" aria-haspopup="true" aria-expanded="false">
      <span class="lang-flag">${lang.flag}</span>
      <span>${lang.name}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  `;

  // Build dropdown
  let dd = document.getElementById('langDropdown');
  if (!dd) {
    dd = document.createElement('div');
    dd.className = 'lang-dropdown';
    dd.id = 'langDropdown';
    dd.setAttribute('role', 'menu');
    document.body.appendChild(dd);
  }
  dd.innerHTML = LANGUAGES.map(l => `
    <button class="lang-option ${l.code === currentLang ? 'active' : ''}"
            onclick="selectLanguage('${l.code}')"
            role="menuitem" aria-label="Switch to ${l.name}">
      <span class="lang-option-flag">${l.flag}</span>
      <span class="lang-option-name">${l.name}</span>
      ${l.code === currentLang ? '<span class="lang-option-check">✓</span>' : ''}
    </button>
  `).join('');
}

function toggleLangDropdown() {
  const dd  = document.getElementById('langDropdown');
  const btn = document.getElementById('langBtn');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  btn?.setAttribute('aria-expanded', isOpen);

  if (isOpen) {
    // Position below the button
    const rect = btn.getBoundingClientRect();
    dd.style.top   = (rect.bottom + 6) + 'px';
    dd.style.right = (window.innerWidth - rect.right) + 'px';
    dd.style.left  = 'auto';
  }
}

function selectLanguage(code) {
  localStorage.setItem('invoiceforge_lang', code);
  document.getElementById('invoiceLang').value = code;
  applyLanguage();
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.remove('open');
  buildLangSwitcher();
  showToast(`Language changed`);
}

/* ══════════════════════════════════════════
   ACCOUNT SETTINGS
══════════════════════════════════════════ */
function openAccountSettings() {
  if (!currentUser) return;
  const name = prompt('Update display name:', currentUser.displayName || '');
  if (name !== null && window._fb) {
    window._fb.updateProfile(currentUser, { displayName: name })
      .then(() => { updateHeaderForUser(currentUser); showToast('✓ Name updated'); })
      .catch(() => showToast('Error updating name.'));
  }
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function showAuthMessage(msg, type='error') {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.textContent = msg;
  el.className = `auth-message ${type} visible`;
}
function clearAuthMessages() {
  const el = document.getElementById('authMessage');
  if (el) el.className = 'auth-message';
}
function setButtonLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}
function togglePwVisibility() {
  const input = document.getElementById('authPassword');
  const icon  = document.getElementById('eyeIcon');
  if (!input) return;
  const hidden = input.type === 'password';
  input.type = hidden ? 'text' : 'password';
  if (icon) icon.innerHTML = hidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}
function handleEnter(e, nextId) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById(nextId)?.focus(); }
}
function handleEnterSubmit(e, fn) {
  if (e.key === 'Enter') { e.preventDefault(); fn ? window[fn]?.() : handleEmailAuth(); }
}
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'This email is already registered. Try signing in.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Try again or reset it.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/too-many-requests':      'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-action-code':    'This link has expired. Please request a new one.',
    'auth/popup-blocked':          'Popup blocked by browser. Please allow popups for this site.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'2-digit' });
}

/* ── EXPOSE GLOBALS ──────────────────────── */
window.openAuthModal       = openAuthModal;
window.closeAuthModal      = closeAuthModal;
window.switchTab           = switchTab;
window.switchMethod        = switchMethod;
window.handleEmailAuth     = handleEmailAuth;
window.handleGoogleAuth    = handleGoogleAuth;
window.sendMagicLink       = sendMagicLink;
window.resetMagicForm      = resetMagicForm;
window.handleForgotPassword= handleForgotPassword;
window.signOutUser         = signOutUser;
window.toggleUserDropdown  = toggleUserDropdown;
window.saveInvoiceToCloud  = saveInvoiceToCloud;
window.loadCloudInvoice    = loadCloudInvoice;
window.deleteCloudInvoice  = deleteCloudInvoice;
window.showDashboard       = showDashboard;
window.toggleLangDropdown  = toggleLangDropdown;
window.selectLanguage      = selectLanguage;
window.openAccountSettings = openAccountSettings;
window.togglePwVisibility  = togglePwVisibility;
window.handleEnter         = handleEnter;
window.handleEnterSubmit   = handleEnterSubmit;

/* ── INIT ON LOAD ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildAuthModal();
  buildLangSwitcher();
  initFirebase();

  // Apply saved language preference on load
  const savedLang = localStorage.getItem('invoiceforge_lang');
  if (savedLang) {
    const sel = document.getElementById('invoiceLang');
    if (sel) { sel.value = savedLang; applyLanguage(); }
  }
});
