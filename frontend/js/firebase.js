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
        .then(async (result) => {
            console.log("User signed in:", result.user);
            const user = result.user;

            // Check if the user already exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                // User is new, create a new document in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: user.displayName || "", // Use Google display name
                    email: user.email || "", // Use Google email
                    role: "Family Admin", // Default role for the first user
                    totalIncome: 0,
                    totalExpenses: 0,
                    savings: 0,
                    remainingBudget: 0,
                    createdAt: new Date()
                }); 
                // Create a family for the first user
                const familyRef = await addDoc(collection(db, "families"), {
                    name: `${name}'s Family`, // Default family name
                    createdBy: user.uid,
                    createdAt: new Date()
                });

                console.log("New user created in Firestore:", user.uid);
            }

            // Redirect to dashboard
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Error during Google sign-in:", error);
            alert(`Error: ${error.message}`);
        });
};

// Email/Password Sign-Up
export const signUpWithEmailPassword = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a family for the first user
        const familyRef = await addDoc(collection(db, "families"), {
            name: `${name}'s Family`, // Default family name
            createdBy: user.uid,
            createdAt: new Date()
        });

        // Save user details in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name || "", 
            email: email,
            role: "Family Admin", // Default role for the first user
            familyId: familyRef.id,
            totalIncome: 0,
            totalExpenses: 0,
            savings: 0,
            remainingBudget: 0
        });

        console.log("User signed up:", user);
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } catch (error) {
        console.error("Error during sign-up:", error);
        if (error.code === "auth/email-already-in-use") {
            alert("This email is already registered. Please use a different email.");
        } else {
            alert(`Error: ${error.message}`);
        }
    }
};

// Email/Password Login
export const loginWithEmailPassword = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User logged in:", userCredential.user);
            window.location.href = "dashboard.html"; // Redirect to dashboard
        })
        .catch((error) => {
            console.error("Error during login:", error);
            alert(`Error: ${error.message}`);
        });
};

// Add a family member
export const addFamilyMember = async (familyId, email, memberType) => {
    try {
        // Save the invitation in Firestore
        console.log("Attempting to add family member...");
        console.log("Family ID:", familyId);
        console.log("Email:", email);
        console.log("Member Type:", memberType);
        await addDoc(collection(db, "families", familyId, "members"), {
            email: email,
            role: memberType,
            status: "pending", // Pending until the member accepts the invitation
            createdAt: new Date()
        });

        console.log("Invitation sent to:", email);
        alert("Invitation sent successfully!");
    } catch (error) {
        console.error("Error sending invitation:", error);
        alert(`Error: ${error.message}`);
    }
};

// Fetch family members
export const fetchFamilyMembers = async (familyId) => {
    try {
        const membersQuery = query(collection(db, "families", familyId, "members"));
        const membersSnapshot = await getDocs(membersQuery);
        const members = [];
        membersSnapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() });
        });
        return members;
    } catch (error) {
        console.error("Error fetching family members:", error);
        return [];
    }
};

export { auth, db }; // Export Firestore instance