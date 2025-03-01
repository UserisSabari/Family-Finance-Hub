// SignUp_LogIn_Form.js
import { signInWithGoogle } from "../firebase.js";

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

const googleSignInBtn = document.getElementById("google-signin-btn");
googleSignInBtn.addEventListener("click", (event) => {
  event.preventDefault();
  signInWithGoogle();
});