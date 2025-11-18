// 🔑 FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔹 GET HTML ELEMENTS
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

// 🔹 SIGN UP
signupBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if(email && password){
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        alert('Sign up successful!');
        emailInput.value = '';
        passwordInput.value = '';
      })
      .catch(e => alert(e.message));
  } else {
    alert('Please enter email and password.');
  }
});

// 🔹 LOGIN
loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if(email && password){
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        emailInput.value = '';
        passwordInput.value = '';
      })
      .catch(e => alert(e.message));
  } else {
    alert('Please enter email and password.');
  }
});

// 🔹 LOGOUT
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// 🔹 AUTH STATE CHANGE
auth.onAuthStateChanged(user => {
  if(user){
    authContainer.style.display = 'none';
    dashboard.style.display = 'block';
    shareLinkInput.value = `${window.location.origin}?user=${user.uid}`;
    loadConfessions(user.uid);
  } else {
    authContainer.style.display = 'block';
    dashboard.style.display = 'none';
  }
});

// 🔹 COPY SHARE LINK
copyBtn.addEventListener('click', () => {
  shareLinkInput.select();
  shareLinkInput.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('Link copied!');
});

// 🔹 SEND ANONYMOUS CONFESSION
sendConfBtn.addEventListener('click', () => {
  const targetUrl = targetLinkInput.value.trim();
  const message = confessionMsgInput.value.trim();

  if(!targetUrl || !message){
    alert('Please enter a valid link and message.');
    return;
  }

  try {
    const url = new URL(targetUrl);
    const receiverId = url.searchParams.get('user');
    if(!receiverId){
      alert('Invalid user link.');
      return;
    }

    db.collection('confessions').add({
      receiverId: receiverId,
      message: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    confessionMsgInput.value = '';
    alert('Anonymous confession sent!');
  } catch(e){
    alert('Invalid link format.');
  }
});

// 🔹 LOAD RECEIVED CONFESSIONS
function loadConfessions(userId){
  db.collection('confessions')
    .where('receiverId', '==', userId)
    .orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      confessionList.innerHTML = '';
      snapshot.forEach(doc => {
        const li = document.createElement('li');
        li.textContent = doc.data().message;
        confessionList.appendChild(li);
      });
    });
}