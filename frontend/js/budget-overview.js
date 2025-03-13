// Main JavaScript file for Budget Overview Page

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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set up Firebase
    initializeFirebase();
    
    // Fetch initial data based on default view (monthly)
    fetchBudgetData('monthly');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user info
    loadUserInfo();
});

// Initialize Firebase
function initializeFirebase() {
    // This is a placeholder for Firebase initialization
    // You would add your Firebase configuration here
    console.log('Firebase initialized');
}

// Load user info from Firestore
function loadUserInfo() {
    // This is a placeholder - you would fetch user info from Firestore
    const userDisplayName = document.getElementById('userDisplayName');
    const userRole = document.getElementById('userRole');
    
    // Simulating fetch from Firestore
    setTimeout(() => {
        userDisplayName.textContent = 'Smith Family';
        userRole.textContent = 'Admin';
    }, 500);
}

// Set up all event listeners
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

// Fetch budget data from Firestore
function fetchBudgetData(view) {
    // Show loading state
    showLoading();
    
    // In a real implementation, you would fetch from Firestore here
    // For now, we'll simulate a fetch with a timeout
    
    setTimeout(() => {
        // This is where you would normally query Firestore
        const db = firebase.firestore();
        db.collection('budgets').doc(view).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateDashboard(data);
            }
        }).catch((error) => {
            console.error('Error fetching budget data:', error);
            showErrorMessage('Failed to load budget data. Please try again later.');
        }).finally(() => {
            hideLoading();
        });
        
        // Simulate data for demonstration
        const mockData = getMockData(view);
        currentData = mockData;
        updateDashboard(mockData);
        hideLoading();
    }, 500);
}

// Get mock data for demonstration
function getMockData(view) {
    // Base data
    const baseData = {
        summary: {
            totalIncome: 5250.00,
            totalExpenses: 3450.75,
            remainingBudget: 1799.25,
            savings: 850.00
        },
        categories: [
            { id: 1, name: 'Housing', percentage: 35, amount: 1200.00 },
            { id: 2, name: 'Food', percentage: 25, amount: 850.50 },
            { id: 3, name: 'Transportation', percentage: 13, amount: 450.25 },
            { id: 4, name: 'Utilities', percentage: 10, amount: 350.00 }
        ],
        transactions: [
            { id: 1, description: 'Grocery Shopping', category: 'Food', amount: 125.50, member: 'John Smith', date: '2023-07-15' },
            { id: 2, description: 'Electricity Bill', category: 'Utilities', amount: 85.25, member: 'Sarah Smith', date: '2023-07-14' },
            { id: 3, description: 'School Supplies', category: 'Education', amount: 65.00, member: 'Emma Smith', date: '2023-07-12' },
            { id: 4, description: 'Gas', category: 'Transportation', amount: 45.75, member: 'John Smith', date: '2023-07-10' },
            { id: 5, description: 'Internet Bill', category: 'Utilities', amount: 75.00, member: 'Sarah Smith', date: '2023-07-8' }
        ]
    };
    
    // Adjust values based on view
    if (view === 'quarterly') {
        baseData.summary.totalIncome *= 3;
        baseData.summary.totalExpenses *= 3;
        baseData.summary.remainingBudget *= 3;
        baseData.summary.savings *= 3;
        baseData.categories.forEach(category => {
            category.amount *= 3;
        });
    } else if (view === 'yearly') {
        baseData.summary.totalIncome *= 12;
        baseData.summary.totalExpenses *= 12;
        baseData.summary.remainingBudget *= 12;
        baseData.summary.savings *= 12;
        baseData.categories.forEach(category => {
            category.amount *= 12;
        });
    }
    
    return baseData;
}

// Update dashboard UI with data
function updateDashboard(data) {
    // Update summary cards
    updateSummaryCards(data.summary);
    
    // Update expense categories
    updateExpenseCategories(data.categories);
    
    // Update recent transactions
    updateTransactions(data.transactions);
}

// Update summary cards with data
function updateSummaryCards(summary) {
    // Total Income
    document.querySelector('.income-amount').textContent = formatCurrency(summary.totalIncome);
    
    // Total Expenses
    document.querySelector('.expenses-amount').textContent = formatCurrency(summary.totalExpenses);
    
    // Remaining Budget
    document.querySelector('.budget-amount').textContent = formatCurrency(summary.remainingBudget);
    
    // Monthly Savings
    document.querySelector('.savings-amount').textContent = formatCurrency(summary.savings);
}

// Update expense categories with data
function updateExpenseCategories(categories) {
    const expenseCategoriesContainer = document.querySelector('.expense-categories');
    
    // Clear existing cards
    expenseCategoriesContainer.innerHTML = '';
    
    // Add category cards
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
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
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
                <button class="edit-transaction-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-transaction-btn"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
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

// Delete transaction from Firestore
function deleteTransaction(transactionId) {
    // Show loading state
    showLoading();
    
    // In a real implementation, you would delete from Firestore
    // const db = firebase.firestore();
    // db.collection('transactions').doc(transactionId).delete()
    //   .then(() => {
    //     showSuccessMessage('Transaction deleted successfully');
    //     fetchBudgetData(currentView);
    //   })
    //   .catch((error) => {
    //     console.error('Error deleting transaction:', error);
    //     showErrorMessage('Failed to delete transaction. Please try again.');
    //   })
    //   .finally(() => {
    //     hideLoading();
    //   });
    
    // Simulate delete for demonstration
    setTimeout(() => {
        // Remove transaction from current data
        currentData.transactions = currentData.transactions.filter(t => t.id != transactionId);
        
        // Update UI
        updateTransactions(currentData.transactions);
        
        // Show success message
        showSuccessMessage('Transaction deleted successfully');
        
        // Hide loading state
        hideLoading();
    }, 500);
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

// Helper function to format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Show loading state
function showLoading() {
    // Check if loading overlay already exists
    if (document.querySelector('.loading-overlay')) return;
    
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}