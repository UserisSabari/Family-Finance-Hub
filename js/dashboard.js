import { auth, db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
            document.getElementById('remainingBudget').textContent = `₹${(userData.totalIncome - userData.totalExpenses - userData.savings)?.toFixed(2) || "0.00"}`;
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

// Open modals
document.getElementById('addIncomeBtn')?.addEventListener('click', () => {
    openModal('addIncomeModal');
});

document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
    openModal('addExpenseModal');
});

document.getElementById('setSavingsBtn')?.addEventListener('click', () => {
    openModal('setSavingsModal');
});

// Close modals when clicking the close button
document.querySelectorAll('.modal .close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        closeModal(closeButton.closest('.modal').id);
    });
});

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Helper function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Helper function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Function to add income
async function addIncome(amount, category) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Add income to the user's document
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        const newIncome = userData.totalIncome + amount;

        // Update the user's total income
        await updateDoc(userRef, {
            totalIncome: newIncome
        });

        // Add income transaction
        await addDoc(collection(db, "users", user.uid, "transactions"), {
            amount: amount,
            category: category,
            type: "income",
            date: new Date().toLocaleDateString()
        });

        // Update the family's total income
        const familyRef = doc(db, "families", userData.familyId);
        const familyDoc = await getDoc(familyRef);
        const familyData = familyDoc.data();

        const newFamilyIncome = familyData.totalIncome + amount;

        await updateDoc(familyRef, {
            totalIncome: newFamilyIncome
        });

        alert("Income added successfully!");
        await updateUI(); // Update the UI after adding income
    } catch (error) {
        console.error("Error adding income:", error);
        alert("Failed to add income. Please try again.");
    }
}

// Function to add expense
async function addExpense(amount, category) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Add expense to the user's document
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        const newExpenses = userData.totalExpenses + amount;

        // Update the user's total expenses
        await updateDoc(userRef, {
            totalExpenses: newExpenses
        });

        // Add expense transaction
        await addDoc(collection(db, "users", user.uid, "transactions"), {
            amount: amount,
            category: category,
            type: "expense",
            date: new Date().toLocaleDateString()
        });

        // Update the family's total expenses
        const familyRef = doc(db, "families", userData.familyId);
        const familyDoc = await getDoc(familyRef);
        const familyData = familyDoc.data();

        const newFamilyExpenses = familyData.totalExpenses + amount;

        await updateDoc(familyRef, {
            totalExpenses: newFamilyExpenses
        });

        alert("Expense added successfully!");
        await updateUI(); // Update the UI after adding expense
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("Failed to add expense. Please try again.");
    }
}

// Function to set savings
async function setSavings(amount) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        const newSavings = amount;
        const newRemainingBudget = userData.totalIncome - userData.totalExpenses - newSavings;

        // Update the user's savings and remaining budget
        await updateDoc(userRef, {
            savings: newSavings,
            remainingBudget: newRemainingBudget
        });

        alert("Savings updated successfully!");
        await updateUI(); // Update the UI after setting savings
    } catch (error) {
        console.error("Error setting savings:", error);
        alert("Failed to set savings. Please try again.");
    }
}

// Event listeners for adding income and expense
document.getElementById('addIncomeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const category = document.getElementById('incomeCategory').value;

    if (isNaN(amount)) {
        alert("Please enter a valid amount.");
        return;
    }

    await addIncome(amount, category);
    document.getElementById('addIncomeForm').reset(); // Clear the form
    closeModal('addIncomeModal'); // Close the modal
});

document.getElementById('addExpenseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;

    if (isNaN(amount)) {
        alert("Please enter a valid amount.");
        return;
    }

    await addExpense(amount, category);
    document.getElementById('addExpenseForm').reset(); // Clear the form
    closeModal('addExpenseModal'); // Close the modal
});

// Event listener for setting savings
document.getElementById('setSavingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const savingsAmount = parseFloat(document.getElementById('savingsAmount').value);
    if (isNaN(savingsAmount)) {
        alert("Please enter a valid amount.");
        return;
    }

    await setSavings(savingsAmount);
    document.getElementById('setSavingsForm').reset(); // Clear the form
    closeModal('setSavingsModal'); // Close the modal
});

// Function to update the UI with the latest data
async function updateUI() {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();

        // Update financial summary
        document.getElementById('totalIncome').textContent = `₹${userData.totalIncome?.toFixed(2) || "0.00"}`;
        document.getElementById('totalExpenses').textContent = `₹${userData.totalExpenses?.toFixed(2) || "0.00"}`;
        document.getElementById('savings').textContent = `₹${userData.savings?.toFixed(2) || "0.00"}`;
        document.getElementById('remainingBudget').textContent = `₹${(userData.totalIncome - userData.totalExpenses - userData.savings)?.toFixed(2) || "0.00"}`;
    }

    // Fetch and update recent transactions
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
}