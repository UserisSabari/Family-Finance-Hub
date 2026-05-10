import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, addDoc, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1XETHfZbrpDOdvF3UnJ3ca7DarAKxjms",
    authDomain: "family-finance-hub-sabari.firebaseapp.com",
    projectId: "family-finance-hub-sabari",
    storageBucket: "family-finance-hub-sabari.appspot.com",
    messagingSenderId: "932092202880",
    appId: "1:932092202880:web:e7486e92b75831102a3b65",
    measurementId: "G-05SCM8DEZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Configure Google provider
provider.setCustomParameters({
    prompt: 'select_account'
});

// Set persistence to LOCAL
auth.setPersistence('local');

// Sign in with Google
export const signInWithGoogle = () => {
    return signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            console.log("Google sign-in successful:", user);

            try {
                // Check if user exists in Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) {
                    // Create new user document
                    await setDoc(doc(db, "users", user.uid), {
                        name: user.displayName || "",
                        email: user.email || "",
                        role: "Family Admin",
                        totalIncome: 0,
                        totalExpenses: 0,
                        savings: 0,
                        remainingBudget: 0,
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        isActive: true
                    });
                    console.log("New user created in Firestore");
                } else {
                    // Update last login time
                    await updateDoc(doc(db, "users", user.uid), {
                        lastLogin: new Date()
                    });
                }

                // Redirect to dashboard
                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Error during Google sign-in:", error);
                throw new Error("Failed to complete sign-in. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Google sign-in error:", error);
            throw new Error(getErrorMessage(error.code));
        });
};

// Email/Password Sign-Up
export const signUpWithEmailPassword = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Email sign-up successful:", user);

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name || "",
            email: email,
            role: "Family Admin",
            totalIncome: 0,
            totalExpenses: 0,
            savings: 0,
            remainingBudget: 0,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
        });

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Email sign-up error:", error);
        throw new Error(getErrorMessage(error.code));
    }
};

// Email/Password Login
export const loginWithEmailPassword = async (email, password) => {
    try {
        console.log("Attempting login with email:", email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Email login successful:", user);

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            console.error("User document not found in Firestore");
            throw new Error("User account not found. Please register first.");
        }

        // Update last login time
        await updateDoc(doc(db, "users", user.uid), {
            lastLogin: new Date()
        });

        console.log("User document found, redirecting to dashboard...");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Email login error:", error);
        throw new Error(getErrorMessage(error.code));
    }
};

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Check authentication state and handle redirects
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user ? "User signed in" : "No user");
    if (user) {
        // If user is on login page and authenticated, redirect to dashboard
        if (window.location.pathname.includes('login_form.html')) {
            console.log("User authenticated, redirecting to dashboard...");
            window.location.href = "dashboard.html";
        }
    } else {
        // If user is not authenticated and on dashboard, redirect to login
        if (window.location.pathname.includes('dashboard.html')) {
            console.log("User not authenticated, redirecting to login...");
            window.location.href = "login_form.html";
        }
    }
});

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
        // alert("Invitation sent successfully!");
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