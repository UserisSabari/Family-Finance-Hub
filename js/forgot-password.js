import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { auth } from ".firebase.js";

// Get the form element
const forgotPasswordForm = document.getElementById("forgot-password-form");

// Add a submit event listener to the form
forgotPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

  // Get the email input value
  const email = document.getElementById("reset-email").value;

  // Send a password reset email
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Success: Notify the user
      alert("Password reset email sent. Please check your inbox.");
    })
    .catch((error) => {
      // Handle errors
      console.error("Error sending password reset email:", error);
      alert(`Error: ${error.message}`);
    });
});