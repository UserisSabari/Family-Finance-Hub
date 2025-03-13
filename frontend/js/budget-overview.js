// Import Firebase modules
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from "./firebase.js"; // Import Firebase auth and db instances

// DOM elements
const tabItems = document.querySelectorAll('.time-period-tabs .tab');
const addBudgetBtn = document.querySelector('.add-budget-btn');
const adjustBudgetBtn = document.querySelector('.adjust-budget-btn');
const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
const editButtons = document.querySelectorAll('.edit-transaction-btn');
const deleteButtons = document.querySelectorAll('.delete-transaction-btn');
const viewAllTransactionsBtn = document.querySelector('.view-all-transactions-btn');

// Current view state
let currentView = 'monthly';
let currentData = {};
let currentUserRole = null; // Store the current user's role
let currentUserId = null; // Store the current user's ID

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data based on default view (monthly)
    fetchBudgetData('monthly');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user info
    loadUserInfo();
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
        }
    } catch (error) {
        console.error("Error fetching budget data:", error);
        showErrorMessage("Failed to load budget data. Please try again later.");
    } finally {
        hideLoading();
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
    document.querySelector('.income-amount').textContent = formatCurrency(summary.totalIncome || 0);
    document.querySelector('.expenses-amount').textContent = formatCurrency(summary.totalExpenses || 0);
    document.querySelector('.budget-amount').textContent = formatCurrency(summary.remainingBudget || 0);
    document.querySelector('.savings-amount').textContent = formatCurrency(summary.savings || 0);
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

        showSuccessMessage("Budget item added successfully!");
        fetchBudgetData(currentView); // Refresh data
    } catch (error) {
        console.error("Error adding budget item:", error);
        showErrorMessage("Failed to add budget item. Please try again.");
    }
}

// Delete a transaction from Firestore
async function deleteTransaction(transactionId) {
    try {
        await deleteDoc(doc(db, "transactions", transactionId));
        showSuccessMessage("Transaction deleted successfully!");
        fetchBudgetData(currentView); // Refresh data
    } catch (error) {
        console.error("Error deleting transaction:", error);
        showErrorMessage("Failed to delete transaction. Please try again.");
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

// Show success message
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showNotification(message, 'error');
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
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
    addBudgetBtn.addEventListener('click', () => {
        openAddBudgetModal();
    });
    
    // Adjust budget button
    adjustBudgetBtn.addEventListener('click', () => {
        openAdjustBudgetModal();
    });
    
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
    viewAllTransactionsBtn.addEventListener('click', () => {
        window.location.href = 'transactions.html';
    });
}

// Open modal for adding a new budget item
function openAddBudgetModal() {
    // This is a placeholder - you would implement a modal in your UI
    console.log('Opening add budget modal');
    
    // Example: show modal
    // const modal = document.getElementById('addBudgetModal');
    // modal.style.display = 'block';
}

// Open modal for adjusting budget
function openAdjustBudgetModal() {
    // This is a placeholder - you would implement a modal in your UI
    console.log('Opening adjust budget modal');
    
    // Example: show modal
    // const modal = document.getElementById('adjustBudgetModal');
    // modal.style.display = 'block';
}

// Navigate to detailed view for a category
function navigateToCategoryDetails(category) {
    // Convert category to URL-friendly format
    const categorySlug = category.toLowerCase().replace(' ', '-');
    
    // Navigate to category details page
    window.location.href = `category-details.html?category=${categorySlug}`;
}

// Open modal for editing a transaction
function openEditTransactionModal(transactionId) {
    // This is a placeholder - you would implement a modal in your UI
    console.log(`Opening edit modal for transaction ${transactionId}`);
    
    // Find transaction in current data
    const transaction = currentData.transactions.find(t => t.id == transactionId);
    
    if (transaction) {
        // Example: show modal and populate with data
        // const modal = document.getElementById('editTransactionModal');
        // document.getElementById('editTransactionId').value = transaction.id;
        // document.getElementById('editTransactionDescription').value = transaction.description;
        // document.getElementById('editTransactionCategory').value = transaction.category;
        // document.getElementById('editTransactionAmount').value = transaction.amount;
        // document.getElementById('editTransactionMember').value = transaction.member;
        // document.getElementById('editTransactionDate').value = formatDateForInput(transaction.date);
        // modal.style.display = 'block';
    }
}

// Confirm and delete a transaction
function confirmDeleteTransaction(transactionId) {
    // This is where you'd normally show a confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this transaction?');
    
    if (confirmed) {
        deleteTransaction(transactionId);
    }
}