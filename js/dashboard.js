import { auth, db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Fetch user data and update the dashboard
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        const userDisplayName = document.getElementById('userDisplayName');
        const userRole = document.getElementById('userRole');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const userAvatar = document.querySelector('.user-avatar');

        // Fetch user details from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Update user info
            userDisplayName.textContent = userData.name || user.email;
            userRole.textContent = userData.role || "User"; // Default to "User" if role is not set
            welcomeMessage.textContent = `Welcome back, ${userData.name || user.email}!`;
            userAvatar.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;

            // Update financial summary
            document.getElementById('totalIncome').textContent = `₹${userData.totalIncome?.toFixed(2) || "0.00"}`;
            document.getElementById('totalExpenses').textContent = `₹${userData.totalExpenses?.toFixed(2) || "0.00"}`;
            document.getElementById('savings').textContent = `₹${userData.savings?.toFixed(2) || "0.00"}`;
            document.getElementById('remainingBudget').textContent = `₹${userData.remainingBudget?.toFixed(2) || "0.00"}`;
        }

        // Fetch recent transactions
        const transactionsQuery = query(collection(db, "users", user.uid, "transactions"));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
        transactionsList.innerHTML = transactionsSnapshot.docs.map(doc => {
            const transaction = doc.data();
            return `
                <tr>
                    <td class="transaction-category">
                        <i class="fas fa-shopping-cart"></i> ${transaction.category}
                    </td>
                    <td class="transaction-amount">₹${transaction.amount?.toFixed(2) || "0.00"}</td>
                    <td class="transaction-user">${transaction.user || "N/A"}</td>
                    <td class="transaction-date">${transaction.date || "N/A"}</td>
                </tr>
            `;
        }).join('');
    } else {
        // No user is signed in, redirect to login
        window.location.href = './index.html';
    }
});