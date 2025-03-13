// Import Firebase modules
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from "./firebase.js"; // Import Firebase auth and db instances

// DOM elements
const tabItems = document.querySelectorAll('.tab-item'); // Corrected selector
const addBudgetBtn = document.querySelector('#addBudgetBtn'); // Corrected selector
const adjustBudgetBtn = document.querySelector('#adjustBudgetBtn'); // Corrected selector
const viewAllTransactionsBtn = document.querySelector('#viewAllTransactions'); // Corrected selector

// Current view state
let currentView = 'monthly';
let currentData = {};
let currentUserRole = null; // Store the current user's role
let currentUserId = null; // Store the current user's ID

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Show loading spinner immediately
    showLoading();

    // Wait for user authentication
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is authenticated, fetch initial data
            loadUserInfo();
            fetchBudgetData('monthly');
        } else {
            // User is not authenticated, redirect to login
            window.location.href = 'login.html';
        }
    });

    // Set up event listeners
    setupEventListeners();
});

// Load user info from Firestore
async function loadUserInfo() {
    try {
        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('userDisplayName').textContent = userData.name || "User";
                document.getElementById('userRole').textContent = userData.role || "Member";
                currentUserRole = userData.role; // Store the current user's role
                currentUserId = user.uid; // Store the current user's ID
            }
        }
    } catch (error) {
        console.error("Error loading user info:", error);
    } finally {
        hideLoading(); // Hide loading screen after fetching user info
    }
}

// Fetch budget data from Firestore
async function fetchBudgetData(view) {
    showLoading();

    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Fetch budget data for the current user
        const budgetQuery = query(collection(db, "budgets"), where("userId", "==", user.uid), where("period", "==", view));
        const budgetSnapshot = await getDocs(budgetQuery);

        if (!budgetSnapshot.empty) {
            const budgetData = budgetSnapshot.docs[0].data();
            currentData = budgetData;
            updateDashboard(budgetData);
        } else {
            console.log("No budget data found for the selected period.");
            currentData = {};
            updateDashboard({ summary: {}, categories: [], transactions: [] });

            // Display a message to the user
            alert("No budget data found. Start by adding a budget item!");
        }
    } catch (error) {
        console.error("Error fetching budget data:", error);
        alert("Failed to load budget data. Please try again later.");
    } finally {
        hideLoading(); // Hide loading screen after fetching budget data
    }
}

// Update dashboard UI with data
function updateDashboard(data) {
    // Update summary cards
    updateSummaryCards(data.summary || {});

    // Update expense categories
    updateExpenseCategories(data.categories || []);

    // Update recent transactions
    updateTransactions(data.transactions || []);
}

// Update summary cards with data
function updateSummaryCards(summary) {
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const remainingBudget = document.getElementById('remainingBudget');
    const monthlySavings = document.getElementById('monthlySavings');

    if (totalIncome && totalExpenses && remainingBudget && monthlySavings) {
        totalIncome.textContent = formatCurrency(summary.totalIncome || 0);
        totalExpenses.textContent = formatCurrency(summary.totalExpenses || 0);
        remainingBudget.textContent = formatCurrency(summary.remainingBudget || 0);
        monthlySavings.textContent = formatCurrency(summary.savings || 0);
    } else {
        console.error("One or more summary card elements not found in the DOM.");
    }
}

// Update expense categories with data
function updateExpenseCategories(categories) {
    const expenseCategoriesContainer = document.querySelector('.expense-categories');
    expenseCategoriesContainer.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-percentage">${category.percentage}% of expenses</div>
            <div class="category-name">${category.name}</div>
            <div class="category-amount">${formatCurrency(category.amount)}</div>
            <button class="view-details-btn" data-category="${category.name.toLowerCase()}">View Details</button>
        `;
        expenseCategoriesContainer.appendChild(categoryCard);
    });
}

// Update transactions table with data
function updateTransactions(transactions) {
    const tableBody = document.querySelector('.transactions-table tbody');
    tableBody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', transaction.id);
        row.innerHTML = `
            <td class="transaction-icon-cell"><i class="fas fa-receipt"></i></td>
            <td class="transaction-description">${transaction.description}</td>
            <td class="transaction-category">${transaction.category}</td>
            <td class="transaction-amount">${formatCurrency(transaction.amount)}</td>
            <td class="transaction-member">${transaction.member}</td>
            <td class="transaction-date">${formatDate(transaction.date)}</td>
            <td class="transaction-actions">
                ${currentUserRole === "Family Admin" ? `
                    <button class="edit-transaction-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-transaction-btn"><i class="fas fa-trash"></i></button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add a new budget item to Firestore
async function addBudgetItem(item) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        await addDoc(collection(db, "budgets"), {
            userId: user.uid,
            period: currentView,
            ...item,
            createdAt: new Date()
        });

        alert("Budget item added successfully!"); // Use alert
        document.getElementById('addBudgetModal').style.display = 'none';
        fetchBudgetData(currentView); // Refresh data
    } catch (error) {
        console.error("Error adding budget item:", error);
        alert("Failed to add budget item. Please try again."); // Use alert
    }
}

// Adjust an existing budget item in Firestore
async function adjustBudgetItem(item) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }

        const budgetQuery = query(collection(db, "budgets"), where("userId", "==", user.uid), where("period", "==", currentView), where("category", "==", item.category));
        const budgetSnapshot = await getDocs(budgetQuery);

        if (!budgetSnapshot.empty) {
            const budgetDoc = budgetSnapshot.docs[0];
            await updateDoc(doc(db, "budgets", budgetDoc.id), {
                amount: item.amount
            });
            alert("Budget item adjusted successfully!"); // Use alert
            document.getElementById('adjustBudgetModal').style.display = 'none';
            fetchBudgetData(currentView); // Refresh data
        } else {
            throw new Error("No budget item found for the selected category.");
        }
    } catch (error) {
        console.error("Error adjusting budget item:", error);
        alert("Failed to adjust budget item. Please try again."); // Use alert
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show loading state
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    overlay.appendChild(spinner);
    document.getElementById('mainContent').appendChild(overlay);
}

// Hide loading state
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Set up event listeners
function setupEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    } else {
        console.error("Menu toggle or sidebar not found in the DOM.");
    }

    // Tab navigation
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get selected view
            const view = tab.getAttribute('data-period');
            
            // Update active tab
            tabItems.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            
            // Fetch data for selected view
            fetchBudgetData(view);
            currentView = view;
        });
    });
    
    // Add budget item button
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener('click', () => {
            openAddBudgetModal();
        });
    } else {
        console.error('Add Budget button not found!');
    }
    
    // Adjust budget button
    if (adjustBudgetBtn) {
        adjustBudgetBtn.addEventListener('click', () => {
            openAdjustBudgetModal();
        });
    } else {
        console.error('Adjust Budget button not found!');
    }
    
    // Set up event delegation for dynamically added elements
    document.addEventListener('click', (event) => {
        // View details buttons
        if (event.target.closest('.view-details-btn')) {
            const button = event.target.closest('.view-details-btn');
            const category = button.getAttribute('data-category');
            navigateToCategoryDetails(category);
        }
        
        // Edit transaction buttons
        if (event.target.closest('.edit-transaction-btn')) {
            const button = event.target.closest('.edit-transaction-btn');
            const row = button.closest('tr');
            const transactionId = row.getAttribute('data-id');
            openEditTransactionModal(transactionId);
        }
        
        // Delete transaction buttons
        if (event.target.closest('.delete-transaction-btn')) {
            const button = event.target.closest('.delete-transaction-btn');
            const row = button.closest('tr');
            const transactionId = row.getAttribute('data-id');
            confirmDeleteTransaction(transactionId);
        }
    });
    
    // View all transactions button
    if (viewAllTransactionsBtn) {
        viewAllTransactionsBtn.addEventListener('click', () => {
            window.location.href = 'transactions.html';
        });
    } else {
        console.error('View All Transactions button not found!');
    }
}

// Open modal for adding a new budget item
function openAddBudgetModal() {
    const modal = document.getElementById('addBudgetModal');
    if (modal) {
        modal.style.display = 'block';
        focusFirstInput('addBudgetModal'); // Focus on the first input
    } else {
        console.error("Add budget modal not found in the DOM.");
    }
}

// Open modal for adjusting budget
function openAdjustBudgetModal() {
    const modal = document.getElementById('adjustBudgetModal');
    if (modal) {
        modal.style.display = 'block';
        focusFirstInput('adjustBudgetModal'); // Focus on the first input
    } else {
        console.error("Adjust budget modal not found in the DOM.");
    }
}

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
    const addBudgetModal = document.getElementById('addBudgetModal');
    const adjustBudgetModal = document.getElementById('adjustBudgetModal');

    if (event.target === addBudgetModal) {
        addBudgetModal.style.display = 'none';
    }
    if (event.target === adjustBudgetModal) {
        adjustBudgetModal.style.display = 'none';
    }
});

// Close modals when clicking the close button
document.querySelectorAll('.modal .close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        const modal = closeButton.closest('.modal');
        modal.style.display = 'none';
    });
});

// Handle form submission for adding a budget item
document.getElementById('addBudgetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);

    if (!category || isNaN(amount)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    try {
        await addBudgetItem({ category, amount });
        clearForm('addBudgetForm'); // Clear the form
    } catch (error) {
        console.error("Error adding budget item:", error);
        alert("Failed to add budget item. Please try again.");
    }
});

// Handle form submission for adjusting budget
document.getElementById('adjustBudgetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('adjustCategory').value;
    const amount = parseFloat(document.getElementById('adjustAmount').value);

    if (!category || isNaN(amount)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    try {
        await adjustBudgetItem({ category, amount });
        clearForm('adjustBudgetForm'); // Clear the form
    } catch (error) {
        console.error("Error adjusting budget item:", error);
        alert("Failed to adjust budget item. Please try again.");
    }
});

// Clear form fields after submission
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Focus on the first input field when the modal opens
function focusFirstInput(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const firstInput = modal.querySelector('input, select');
        if (firstInput) {
            firstInput.focus();
        }
    }
}