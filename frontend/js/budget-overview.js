// Import Firebase modules
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from "./firebase.js"; // Import Firebase auth and db instances

// DOM elements
const tabItems = document.querySelectorAll('.tab-item'); // Corrected selector
const addBudgetBtn = document.querySelector('#addBudgetBtn'); // Corrected selector
const adjustBudgetBtn = document.querySelector('#adjustBudgetBtn'); // Corrected selector

// Current view state
let currentView = 'monthly';
let currentData = {};
let currentUserRole = null; // Store the current user's role
let currentUserId = null; // Store the current user's ID
let currentFamilyId = null; // Store the current family's ID

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Show loading spinner immediately
    showLoading();

    // Wait for user authentication
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is authenticated, fetch initial data
            loadUserInfo();
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
                currentFamilyId = userData.familyId; // Store the current family's ID

                // Fetch budget data after loading user info
                fetchBudgetData(currentView);
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
        if (!user || !currentFamilyId) {
            throw new Error("User not authenticated or family ID not found");
        }

        // Fetch family data (total income, total expenses, remaining budget)
        const familyDoc = await getDoc(doc(db, "families", currentFamilyId));
        if (!familyDoc.exists()) {
            throw new Error("Family data not found");
        }

        const familyData = familyDoc.data();
        const totalIncome = familyData.totalIncome || 0;
        const totalExpenses = familyData.totalExpenses || 0;
        const remainingBudget = familyData.remainingBudget || 0;

        // Update summary cards
        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        document.getElementById('remainingBudget').textContent = formatCurrency(remainingBudget);

        // Fetch budget data for the current family and period
        const budgetQuery = query(collection(db, "families", currentFamilyId, "budgets"), where("period", "==", view));
        const budgetSnapshot = await getDocs(budgetQuery);

        // Fetch transactions for the current family and period
        const transactionsQuery = query(collection(db, "families", currentFamilyId, "transactions"), where("period", "==", view));
        const transactionsSnapshot = await getDocs(transactionsQuery);

        // Process budget data
        const categories = budgetSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                name: data.category || "Uncategorized",
                amount: data.amount || 0,
                percentage: data.percentage || 0
            };
        });

        // Process transactions data
        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                description: data.description || "No description",
                category: data.category || "Uncategorized",
                amount: data.amount || 0,
                date: data.date || "No date"
            };
        });

        // Update the dashboard with the fetched data
        currentData = { summary: { totalIncome, totalExpenses, remainingBudget }, categories, transactions };
        updateDashboard(currentData);
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

    if (totalIncome && totalExpenses && remainingBudget) {
        totalIncome.textContent = formatCurrency(summary.totalIncome || 0);
        totalExpenses.textContent = formatCurrency(summary.totalExpenses || 0);
        remainingBudget.textContent = formatCurrency(summary.remainingBudget || 0);
    } else {
        console.error("One or more summary card elements not found in the DOM.");
    }
}

// Update expense categories with data
function updateExpenseCategories(categories) {
    const expenseCategoriesContainer = document.querySelector('.expense-categories');
    if (!expenseCategoriesContainer) {
        console.error("Expense categories container not found in the DOM.");
        return;
    }

    // Clear the container
    expenseCategoriesContainer.innerHTML = '';

    // Check if categories is an array and not empty
    if (!Array.isArray(categories)) {
        console.error("Categories data is not an array.");
        return;
    }

    // Loop through categories and create cards
    categories.forEach(category => {
        // Ensure the category object and its properties are defined
        if (!category || typeof category !== 'object' || !category.name) {
            console.error("Invalid category data:", category);
            return;
        }

        // Create the category card
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-percentage">${category.percentage || 0}% of expenses</div>
            <div class="category-name">${category.name}</div>
            <div class="category-amount">${formatCurrency(category.amount || 0)}</div>
            <button class="view-details-btn" data-category="${category.name.toLowerCase()}">View Details</button>
        `;
        expenseCategoriesContainer.appendChild(categoryCard);
    });
}

// Update transactions table with data
function updateTransactions(transactions) {
    const tableBody = document.querySelector('.transactions-table tbody');
    if (!tableBody) {
        console.error("Transactions table body not found in the DOM.");
        return;
    }

    // Clear the table body
    tableBody.innerHTML = '';

    // Check if transactions is an array and not empty
    if (!Array.isArray(transactions)) {
        console.error("Transactions data is not an array.");
        return;
    }

    // Loop through transactions and create rows
    transactions.forEach(transaction => {
        // Ensure the transaction object and its properties are defined
        if (!transaction || typeof transaction !== 'object') {
            console.error("Invalid transaction data:", transaction);
            return;
        }

        // Create the table row
        const row = document.createElement('tr');
        row.setAttribute('data-id', transaction.id);
        row.innerHTML = `
            <td class="transaction-description">${transaction.description}</td>
            <td class="transaction-category">${transaction.category}</td>
            <td class="transaction-amount">${formatCurrency(transaction.amount)}</td>
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

// Navigate to category details (within the same page)
function navigateToCategoryDetails(category) {
    console.log(`Fetching details for category: ${category}`);

    // Fetch category details from Firestore (or any other data source)
    fetchCategoryDetails(category)
        .then(details => {
            // Update the modal content with the fetched details
            const modalContent = document.getElementById('categoryDetailsContent');
            if (modalContent) {
                modalContent.innerHTML = `
                    <p><strong>Category:</strong> ${details.name}</p>
                    <p><strong>Total Spent:</strong> ${formatCurrency(details.amount)}</p>
                    <p><strong>Percentage of Expenses:</strong> ${details.percentage}%</p>
                    <p><strong>Recent Transactions:</strong></p>
                    <ul>
                        ${details.transactions.map(transaction => `
                            <li>${transaction.description} - ${formatCurrency(transaction.amount)}</li>
                        `).join('')}
                    </ul>
                `;
            }

            // Show the modal
            const modal = document.getElementById('categoryDetailsModal');
            if (modal) {
                modal.style.display = 'block';
            }
        })
        .catch(error => {
            console.error("Error fetching category details:", error);
            alert("Failed to fetch category details. Please try again.");
        });
}

// Fetch category details from Firestore
async function fetchCategoryDetails(category) {
    try {
        const user = auth.currentUser;
        if (!user || !currentFamilyId) {
            throw new Error("User not authenticated or family ID not found");
        }

        // Fetch budget data for the selected category
        const budgetQuery = query(collection(db, "families", currentFamilyId, "budgets"), where("category", "==", category));
        const budgetSnapshot = await getDocs(budgetQuery);

        if (budgetSnapshot.empty) {
            throw new Error("No budget data found for this category");
        }

        const budgetData = budgetSnapshot.docs[0].data();

        // Fetch recent transactions for the selected category
        const transactionsQuery = query(collection(db, "families", currentFamilyId, "transactions"), where("category", "==", category));
        const transactionsSnapshot = await getDocs(transactionsQuery);

        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                description: data.description || "No description",
                amount: data.amount || 0
            };
        });

        return {
            name: budgetData.category || "Uncategorized",
            amount: budgetData.amount || 0,
            percentage: budgetData.percentage || 0,
            transactions
        };
    } catch (error) {
        console.error("Error fetching category details:", error);
        throw error;
    }
}

// Add or update a budget item in Firestore
async function addOrUpdateBudgetItem(item) {
    try {
        const user = auth.currentUser;
        if (!user || !currentFamilyId) {
            throw new Error("User not authenticated or family ID not found");
        }

        // Check if a budget item for the same category and period already exists
        const budgetQuery = query(collection(db, "families", currentFamilyId, "budgets"), where("category", "==", item.category), where("period", "==", currentView));
        const budgetSnapshot = await getDocs(budgetQuery);

        if (!budgetSnapshot.empty) {
            // Update existing budget item
            const budgetDoc = budgetSnapshot.docs[0];
            await updateDoc(doc(db, "families", currentFamilyId, "budgets", budgetDoc.id), {
                amount: item.amount,
                updatedAt: new Date()
            });
            alert("Budget item updated successfully!");
        } else {
            // Add new budget item
            await addDoc(collection(db, "families", currentFamilyId, "budgets"), {
                ...item,
                period: currentView,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            alert("Budget item added successfully!");
        }

        // Refresh data after adding/updating
        fetchBudgetData(currentView);
    } catch (error) {
        console.error("Error adding/updating budget item:", error);
        alert("Failed to add/update budget item. Please try again.");
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
async function openAdjustBudgetModal() {
    const modal = document.getElementById('adjustBudgetModal');
    if (modal) {
        modal.style.display = 'block';
        focusFirstInput('adjustBudgetModal'); // Focus on the first input

        // Fetch existing budget data for the selected category
        const categorySelect = document.getElementById('adjustCategory');
        categorySelect.addEventListener('change', async () => {
            const selectedCategory = categorySelect.value;
            if (selectedCategory) {
                try {
                    const budgetQuery = query(collection(db, "families", currentFamilyId, "budgets"), where("category", "==", selectedCategory), where("period", "==", currentView));
                    const budgetSnapshot = await getDocs(budgetQuery);

                    if (!budgetSnapshot.empty) {
                        const budgetData = budgetSnapshot.docs[0].data();
                        document.getElementById('adjustAmount').value = budgetData.amount || 0;
                    } else {
                        document.getElementById('adjustAmount').value = 0;
                    }
                } catch (error) {
                    console.error("Error fetching budget data:", error);
                    alert("Failed to fetch budget data. Please try again.");
                }
            }
        });
    } else {
        console.error("Adjust budget modal not found in the DOM.");
    }
}

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
    const addBudgetModal = document.getElementById('addBudgetModal');
    const adjustBudgetModal = document.getElementById('adjustBudgetModal');
    const categoryDetailsModal = document.getElementById('categoryDetailsModal');

    if (event.target === addBudgetModal) {
        addBudgetModal.style.display = 'none';
    }
    if (event.target === adjustBudgetModal) {
        adjustBudgetModal.style.display = 'none';
    }
    if (event.target === categoryDetailsModal) {
        categoryDetailsModal.style.display = 'none';
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
        await addOrUpdateBudgetItem({ category, amount });
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
        await addOrUpdateBudgetItem({ category, amount });
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