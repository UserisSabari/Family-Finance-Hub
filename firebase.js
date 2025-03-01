// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
// Email/Password Sign-Up
export const signUpWithEmailPassword = (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed up:", userCredential.user);
      alert("Registration successful!");
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Error during sign-up:", error);
      alert(`Error: ${error.message}`);
    });
};

// Email/Password Login
export const loginWithEmailPassword = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
      alert("Login successful!");
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Error during login:", error);
      alert(`Error: ${error.message}`);
    });
};