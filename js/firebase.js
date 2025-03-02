// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const db = getFirestore(app); // Initialize Firestore
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User signed in:", result.user);
            localStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = "frontend/dashboard.htmll";
        })
        .catch((error) => {
            console.error("Error during login:", error);
        });
};

// Email/Password Sign-Up
export const signUpWithEmailPassword = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name || "", 
            email: email,
            role: "Family Member", // Default role
            totalIncome: 0,
            totalExpenses: 0,
            savings: 0,
            remainingBudget: 0
        });

        console.log("User signed up:", user);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "frontend/dashboard.html";
    } catch (error) {
        console.error("Error during sign-up:", error);
        alert(`Error: ${error.message}`);
    }
};

// Email/Password Login
export const loginWithEmailPassword = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User logged in:", userCredential.user);
            localStorage.setItem("user", JSON.stringify(userCredential.user));
            window.location.href = "frontend/dashboard.html";
        })
        .catch((error) => {
            console.error("Error during login:", error);
            alert(`Error: ${error.message}`);
        });
};

export { auth, db }; // Export Firestore instance