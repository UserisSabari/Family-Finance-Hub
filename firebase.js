// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1XETHfZbrpDOdvF3UnJ3ca7DarAKxjms",
  authDomain: "family-finance-hub-sabari.firebaseapp.com",
  projectId: "family-finance-hub-sabari",
  storageBucket: "family-finance-hub-sabari.appspot.com",
  messagingSenderId: "932092202880",
  appId: "1:932092202880:web:e7486e92b75831102a3b65",
  measurementId: "G-05SCM8DEZZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("User signed in:", result.user);
      alert(`Welcome, ${result.user.displayName}!`);
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Error during login:", error);
    });
};