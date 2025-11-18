// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCn3cAWXNm5x58sed8JCcxRqMSyv5LfRBk",
  authDomain: "starbuzz-confessions.firebaseapp.com",
  projectId: "starbuzz-confessions",
  storageBucket: "starbuzz-confessions.firebasestorage.app",
  messagingSenderId: "240429778398",
  appId: "1:240429778398:web:98665d24334b44353f894f"
};

// Init
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ELEMENTS
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const shareLinkInput = document.getElementById('share-link');
const copyBtn = document.getElementById('copy-link-btn');
const sendConfBtn = document.getElementById('send-confession-btn');
const targetLinkInput = document.getElementById('target-link');
const confessionMsgInput = document.getElementById('confession-msg');
const confessionList = document.getElementById('confession-list');

// SIGN UP
signupBtn.addEventListener('click', () => {
  auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
    .then(() => {
      alert("Signup successful!");
    })
    .catch(err => alert(err.message));
});

// LOGIN
loginBtn.addEventListener('click', () => {
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
});

// LOGOUT
logoutBtn.addEventListener('click', () => auth.signOut());

// AUTH STATE LISTENER
auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.style.display = "none";
    dashboard.style.display = "block";

    shareLinkInput.value = `${window.location.origin}?user=${user.uid}`;
    loadConfessions(user.uid);
  } else {
    authContainer.style.display = "block";
    dashboard.style.display = "none";
  }
});

// COPY LINK
copyBtn.addEventListener("click", () => {
  shareLinkInput.select();
  document.execCommand("copy");
  alert("Copied!");
});

// SEND CONFESSION
sendConfBtn.addEventListener("click", () => {
  const url = new URL(targetLinkInput.value);
  const receiverId = url.searchParams.get("user");
  const msg = confessionMsgInput.value;

  if (!receiverId || !msg) return alert("Invalid link or empty message.");

  db.collection("confessions").add({
    receiverId,
    message: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  confessionMsgInput.value = "";
  alert("Sent!");
});

// LOAD CONFESSIONS
function loadConfessions(uid) {
  db.collection("confessions")
    .where("receiverId", "==", uid)
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      confessionList.innerHTML = "";
      snapshot.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = doc.data().message;
        confessionList.appendChild(li);
      });
    });
}