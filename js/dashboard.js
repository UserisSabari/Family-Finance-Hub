import { auth, db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const userDisplayName = document.getElementById('userDisplayName');
const userRole = document.getElementById('userRole');
const welcomeMessage = document.getElementById('welcomeMessage');
const userAvatar = document.querySelector('.user-avatar');
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const savings = document.getElementById('savings');
const remainingBudget = document.getElementById('remainingBudget');
const transactionsTable = document.getElementById('transactionsTable');

// Fetch user data and update the dashboard
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // Fetch user details from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Update user info
                userDisplayName.textContent = userData.name || user.email;
                userRole.textContent = userData.role || "User";
                welcomeMessage.textContent = `Welcome back, ${userData.name || user.email}!`;
                userAvatar.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;

                // Update financial summary
                totalIncome.textContent = `₹${userData.totalIncome?.toFixed(2) || "0.00"}`;
                totalExpenses.textContent = `₹${userData.totalExpenses?.toFixed(2) || "0.00"}`;
                savings.textContent = `₹${userData.savings?.toFixed(2) || "0.00"}`;
                remainingBudget.textContent = `₹${(userData.totalIncome - userData.totalExpenses - userData.savings)?.toFixed(2) || "0.00"}`;

                // Fetch and display recent transactions
                await fetchRecentTransactions(user.uid);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            showError("Failed to load user data. Please try refreshing the page.");
        }
    } else {
        window.location.href = "login_form.html";
    }
});

// Fetch recent transactions
async function fetchRecentTransactions(userId) {
    try {
        const transactionsQuery = query(collection(db, "users", userId, "transactions"));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList = transactionsTable.getElementsByTagName('tbody')[0];
        
        if (transactionsSnapshot.empty) {
            transactionsList.innerHTML = '<tr><td colspan="4" class="text-center">No transactions found</td></tr>';
            return;
        }

        transactionsList.innerHTML = transactionsSnapshot.docs.map(doc => {
            const transaction = doc.data();
            return `
                <tr>
                    <td class="transaction-category">
                        <i class="fas fa-${getTransactionIcon(transaction.type)}"></i> ${transaction.category}
                    </td>
                    <td class="transaction-amount ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}">
                        ₹${transaction.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td class="transaction-date">${formatDate(transaction.date)}</td>
                    <td class="transaction-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="editTransaction('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error fetching transactions:", error);
        showError("Failed to load transactions. Please try refreshing the page.");
    }
}

// Helper functions
function getTransactionIcon(type) {
    switch (type) {
        case 'income':
            return 'arrow-up';
        case 'expense':
            return 'arrow-down';
        case 'savings':
            return 'piggy-bank';
        default:
            return 'exchange-alt';
    }
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Export functions for use in HTML
window.editTransaction = async (transactionId) => {
    // Implement edit transaction functionality
    console.log("Edit transaction:", transactionId);
};

window.deleteTransaction = async (transactionId) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
        try {
            await deleteDoc(doc(db, "users", auth.currentUser.uid, "transactions", transactionId));
            await fetchRecentTransactions(auth.currentUser.uid);
            showError("Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            showError("Failed to delete transaction");
        }
    }
};

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
                    <i class="fas fa-${getTransactionIcon(transaction.type)}"></i> ${transaction.category}
                </td>
                <td class="transaction-amount ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}">
                    ₹${transaction.amount?.toFixed(2) || "0.00"}
                </td>
                <td class="transaction-date">${formatDate(transaction.date)}</td>
                <td class="transaction-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="editTransaction('${doc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (event) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Apply the saved theme
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Toggle theme function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Update theme icon based on current theme
function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Add click event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});