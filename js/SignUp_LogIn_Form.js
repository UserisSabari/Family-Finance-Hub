// SignUp_LogIn_Form.js
import { signInWithGoogle,signUpWithEmailPassword,
  loginWithEmailPassword } from "./firebase.js";

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
googleSignInBtn.addEventListener("click", (event) => {
  event.preventDefault();
  signInWithGoogle();
});

// Email/Password Registration
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = registerForm.querySelector('input[type="email"]').value;
  const password = registerForm.querySelector('input[type="password"]').value;
  signUpWithEmailPassword(email, password);
});

// Email/Password Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;
  loginWithEmailPassword(email, password);
});