// Main JavaScript file for Budget Overview Page

// DOM elements
const tabItems = document.querySelectorAll('.tab-nav .tab-item');
const addBudgetBtn = document.querySelector('.btn-primary');
const adjustBudgetBtn = document.querySelector('.btn-secondary');
const viewDetailsButtons = document.querySelectorAll('.btn-view');
const editButtons = document.querySelectorAll('.btn-edit');
const deleteButtons = document.querySelectorAll('.btn-delete');
const viewAllTransactionsBtn = document.querySelector('.btn-view-all');

// Current view state
let currentView = 'monthly';
let currentData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data based on default view (monthly)
    fetchBudgetData('monthly');
    
    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get selected view
            const view = tab.textContent.toLowerCase();
            
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
    
    // View details buttons
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Get the expense category from parent element
            const expenseCard = event.target.closest('.expense-card');
            const category = expenseCard.querySelector('.expense-category').textContent;
            
            // Navigate to detailed view for this category
            navigateToCategoryDetails(category);
        });
    });
    
    // Edit transaction buttons
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const transactionId = row.dataset.id; // Assuming you add data-id attribute to rows
            
            openEditTransactionModal(transactionId);
        });
    });
    
    // Delete transaction buttons
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const transactionId = row.dataset.id; // Assuming you add data-id attribute to rows
            
            confirmDeleteTransaction(transactionId);
        });
    });
    
    // View all transactions button
    viewAllTransactionsBtn.addEventListener('click', () => {
        window.location.href = '/transactions';
    });
}

// Fetch budget data from backend
function fetchBudgetData(view) {
    // Show loading state
    showLoading();
    
    // Endpoint URL based on view (monthly, quarterly, yearly)
    const endpoint = `/api/budget/${view}`;
    
    // Fetch data from backend
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store data for later use
            currentData = data;
            
            // Update UI with fetched data
            updateDashboard(data);
            
            // Hide loading state
            hideLoading();
        })
        .catch(error => {
            console.error('Error fetching budget data:', error);
            
            // Show error message to user
            showErrorMessage('Failed to load budget data. Please try again later.');
            
            // Hide loading state
            hideLoading();
        });
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
    const totalIncomeElement = document.querySelector('.summary-cards .summary-card:nth-child(1) .card-amount');
    totalIncomeElement.textContent = formatCurrency(summary.totalIncome);
    
    // Total Expenses
    const totalExpensesElement = document.querySelector('.summary-cards .summary-card:nth-child(2) .card-amount');
    totalExpensesElement.textContent = formatCurrency(summary.totalExpenses);
    
    // Remaining Budget
    const remainingBudgetElement = document.querySelector('.summary-cards .summary-card:nth-child(3) .card-amount');
    remainingBudgetElement.textContent = formatCurrency(summary.remainingBudget);
    
    // Monthly Savings
    const monthlySavingsElement = document.querySelector('.summary-cards .summary-card:nth-child(4) .card-amount');
    monthlySavingsElement.textContent = formatCurrency(summary.savings);
}

// Update expense categories with data
function updateExpenseCategories(categories) {
    const categoryCards = document.querySelectorAll('.expense-categories .expense-card');
    
    // Loop through each category and update the corresponding card
    categories.forEach((category, index) => {
        if (index < categoryCards.length) {
            const card = categoryCards[index];
            
            // Update category name
            const categoryNameElement = card.querySelector('.expense-category');
            categoryNameElement.textContent = category.name;
            
            // Update percentage
            const percentageElement = card.querySelector('.expense-percentage');
            percentageElement.textContent = `${category.percentage}% of expenses`;
            
            // Update amount
            const amountElement = card.querySelector('.expense-amount');
            amountElement.textContent = formatCurrency(category.amount);
            
            // Add data-id attribute for the view details button
            const viewDetailsBtn = card.querySelector('.btn-view');
            viewDetailsBtn.dataset.id = category.id;
        }
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
        row.dataset.id = transaction.id;
        
        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.member}</td>
            <td>${formatDate(transaction.date)}</td>
            <td>
                <button class="btn-edit">edit</button>
                <button class="btn-delete">delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Reattach event listeners to new buttons
    const newEditButtons = tableBody.querySelectorAll('.btn-edit');
    newEditButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const transactionId = row.dataset.id;
            
            openEditTransactionModal(transactionId);
        });
    });
    
    const newDeleteButtons = tableBody.querySelectorAll('.btn-delete');
    newDeleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const transactionId = row.dataset.id;
            
            confirmDeleteTransaction(transactionId);
        });
    });
}

// Open modal for adding a new budget item
function openAddBudgetModal() {
    // This is a placeholder - you would implement a modal in your UI
    console.log('Opening add budget modal');
    
    // Example: redirect to add budget page
    // window.location.href = '/budget/add';
}

// Open modal for adjusting budget
function openAdjustBudgetModal() {
    // This is a placeholder - you would implement a modal in your UI
    console.log('Opening adjust budget modal');
    
    // Example: redirect to adjust budget page
    // window.location.href = '/budget/adjust';
}

// Navigate to detailed view for a category
function navigateToCategoryDetails(category) {
    // Convert category to URL-friendly format
    const categorySlug = category.toLowerCase().replace(' ', '-');
    
    // Navigate to category details page
    window.location.href = `/budget/category/${categorySlug}`;
}

// Open modal for editing a transaction
function openEditTransactionModal(transactionId) {
    // This is a placeholder - you would implement a modal in your UI
    console.log(`Opening edit modal for transaction ${transactionId}`);
    
    // Example: redirect to edit transaction page
    // window.location.href = `/transactions/edit/${transactionId}`;
}

// Confirm and delete a transaction
function confirmDeleteTransaction(transactionId) {
    const confirmed = confirm('Are you sure you want to delete this transaction?');
    
    if (confirmed) {
        deleteTransaction(transactionId);
    }
}

// Delete transaction from backend
function deleteTransaction(transactionId) {
    // Show loading state
    showLoading();
    
    // Delete request to backend
    fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showSuccessMessage('Transaction deleted successfully');
            
            // Refresh data
            fetchBudgetData(currentView);
        })
        .catch(error => {
            console.error('Error deleting transaction:', error);
            
            // Show error message
            showErrorMessage('Failed to delete transaction. Please try again.');
            
            // Hide loading state
            hideLoading();
        });
}

// Helper function to format currency
function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show loading state
function showLoading() {
    // This is a placeholder - you would implement loading state in your UI
    console.log('Loading...');
    
    // Example: add loading overlay
    // const overlay = document.createElement('div');
    // overlay.className = 'loading-overlay';
    // overlay.innerHTML = '<div class="spinner"></div>';
    // document.body.appendChild(overlay);
}

// Hide loading state
function hideLoading() {
    // This is a placeholder - you would implement loading state in your UI
    console.log('Loading complete');
    
    // Example: remove loading overlay
    // const overlay = document.querySelector('.loading-overlay');
    // if (overlay) {
    //     overlay.remove();
    // }
}

// Show success message
function showSuccessMessage(message) {
    // This is a placeholder - you would implement notification in your UI
    console.log('Success:', message);
    
    // Example: show toast notification
    // const toast = document.createElement('div');
    // toast.className = 'toast toast-success';
    // toast.textContent = message;
    // document.body.appendChild(toast);
    // setTimeout(() => toast.remove(), 3000);
}

// Show error message
function showErrorMessage(message) {
    // This is a placeholder - you would implement notification in your UI
    console.error('Error:', message);
    
    // Example: show toast notification
    // const toast = document.createElement('div');
    // toast.className = 'toast toast-error';
    // toast.textContent = message;
    // document.body.appendChild(toast);
    // setTimeout(() => toast.remove(), 3000);
}