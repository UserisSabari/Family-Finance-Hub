// SignUp_LogIn_Form.js
import { signInWithGoogle, signUpWithEmailPassword, loginWithEmailPassword } from "./firebase.js";

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Google Sign-In
const googleSignInBtn = document.getElementById("google-signin-btn");
googleSignInBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        console.log("Attempting Google sign-in...");
        await signInWithGoogle();
    } catch (error) {
        console.error("Google sign-in error:", error);
        const loginError = document.getElementById("login-error");
        loginError.textContent = error.message;
        loginError.style.display = "block";
    }
});

// Email/Password Registration
const registerForm = document.getElementById("register-form");
const registerError = document.getElementById("register-error");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    registerError.style.display = "none";
    
    const name = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    // Validate password strength
    if (password.length < 6) {
        registerError.textContent = "Password must be at least 6 characters long";
        registerError.style.display = "block";
        return;
    }

    try {
        console.log("Attempting registration...");
        await signUpWithEmailPassword(email, password, name);
    } catch (error) {
        console.error("Registration error:", error);
        registerError.textContent = error.message;
        registerError.style.display = "block";
    }
});

// Email/Password Login
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.style.display = "none";
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    // Validate inputs
    if (!validateEmail(email)) {
        showError(loginError, 'Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showError(loginError, 'Password must be at least 6 characters long');
        return;
    }

    try {
        console.log("Attempting login...");
        await loginWithEmailPassword(email, password);
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = error.message;
        loginError.style.display = "block";
    }
});

// Toggle between login and register forms
const toggleForms = document.querySelectorAll('.toggle-form');
toggleForms.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.parentElement.classList.toggle('hidden');
        registerForm.parentElement.classList.toggle('hidden');
    });
});

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Show Error Message
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}