import { db, auth } from './firebase-init.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// DOM elements
const elements = {
    totalSavings: document.getElementById('totalSavings'),
    monthlyContributions: document.getElementById('monthlyContributions'),
    activeGoalsCount: document.getElementById('activeGoalsCount'),
    achievedGoalsCount: document.getElementById('achievedGoalsCount'),
    goalsList: document.getElementById('goalsList'),
    contributionsTable: document.getElementById('contributionsTable').querySelector('tbody'),
    progressChart: document.getElementById('progressChart'),
    newGoalModal: document.getElementById('newGoalModal'),
    newGoalForm: document.getElementById('newGoalForm'),
    createGoalBtn: document.getElementById('createGoalBtn'),
    viewArchivedBtn: document.getElementById('viewArchivedBtn'),
    cancelGoalBtn: document.getElementById('cancelGoalBtn'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    userDisplayName: document.getElementById('userDisplayName'),
    userRole: document.getElementById('userRole'),
    userAvatar: document.querySelector('.user-avatar')
};

let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Main initialization function
async function initApp() {
    try {
        // Check if user is authenticated
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;

                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log(userData);

                    // Update user info in the UI
                    elements.userDisplayName.textContent = userData.name || user.email;
                    elements.userRole.textContent = userData.role || "User";
                    elements.userAvatar.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;
                }

                // Fetch initial data
                setupEventListeners();
                await fetchSummaryData();
                await fetchGoals();
                await fetchContributions();
                await fetchProgressData();
            } else {
                // Redirect to login page if user is not authenticated
                window.location.href = 'login-form.html';
            }
        });
    } catch (error) {
        showError('Failed to initialize the application', error);
    }
}

// Fetch summary data from Firestore
async function fetchSummaryData() {
    try {
        const goalsRef = collection(db, 'goals');
        const q = query(goalsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        let totalSavings = 0;
        let monthlyContributions = 0;
        let activeGoalsCount = 0;
        let achievedGoalsCount = 0;

        querySnapshot.forEach((doc) => {
            const goal = doc.data();
            totalSavings += goal.currentAmount || 0;
            monthlyContributions += goal.monthlyContribution || 0;
            if (goal.status === 'active') activeGoalsCount++;
            if (goal.status === 'achieved') achievedGoalsCount++;
        });

        // Update the UI with the fetched data
        elements.totalSavings.textContent = formatCurrency(totalSavings);
        elements.monthlyContributions.textContent = formatCurrency(monthlyContributions);
        elements.activeGoalsCount.textContent = activeGoalsCount;
        elements.achievedGoalsCount.textContent = achievedGoalsCount;
    } catch (error) {
        showError('Failed to load summary data', error);
    }
}

// Fetch goals from Firestore
async function fetchGoals(filterType = 'all') {
    try {
        const goalsRef = collection(db, 'goals');
        const q = query(goalsRef, where('userId', '==', currentUser.uid), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);

        const goals = [];
        querySnapshot.forEach((doc) => {
            const goal = doc.data();
            goals.push({
                id: doc.id,
                ...goal
            });
        });

        renderGoals(goals);
    } catch (error) {
        showError('Failed to load goals', error);
    }
}

// Fetch contributions from Firestore
async function fetchContributions() {
    try {
        const contributionsRef = collection(db, 'contributions');
        const q = query(contributionsRef, where('userId', '==', currentUser.uid), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);

        const contributions = [];
        querySnapshot.forEach((doc) => {
            const contribution = doc.data();
            contributions.push({
                id: doc.id,
                ...contribution
            });
        });

        renderContributions(contributions);
    } catch (error) {
        showError('Failed to load contributions', error);
    }
}

// Create new goal in Firestore
async function createNewGoal() {
    const formData = new FormData(elements.newGoalForm);
    const goalData = {
        userId: currentUser.uid,
        name: formData.get('goalName'),
        targetAmount: parseFloat(formData.get('goalAmount')),
        currentAmount: 0,
        category: formData.get('goalCategory'),
        timeframe: formData.get('goalTimeframe'),
        monthlyContribution: parseFloat(formData.get('goalContribution')),
        status: 'active',
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, 'goals'), goalData);
        closeModal(elements.newGoalModal);
        await fetchGoals();
    } catch (error) {
        showError('Failed to create new goal', error);
    }
}

// Render goals list
function renderGoals(goals) {
    elements.goalsList.innerHTML = '';
    goals.forEach(goal => {
        const goalItem = document.createElement('div');
        goalItem.classList.add('goal-item');
        goalItem.innerHTML = `
            <div class="goal-icon" style="background-color: ${goal.iconColor || '#3498db'};">
                <i class="fas fa-${goal.icon || 'bullseye'}"></i>
            </div>
            <div class="goal-details">
                <div class="goal-title">
                    <h3>${goal.name}</h3>
                    <span class="goal-amount">$${goal.currentAmount} of $${goal.targetAmount}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(goal.currentAmount / goal.targetAmount) * 100}%;"></div>
                </div>
            </div>
            <div class="goal-actions">
                <button><i class="fas fa-edit"></i></button>
                <button><i class="fas fa-trash"></i></button>
            </div>
        `;
        elements.goalsList.appendChild(goalItem);
    });
}

// Render contributions table
function renderContributions(contributions) {
    elements.contributionsTable.innerHTML = '';
    contributions.forEach(contrib => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contrib.goalName}</td>
            <td>$${contrib.amount}</td>
            <td>${contrib.contributor}</td>
            <td>${new Date(contrib.date).toLocaleDateString()}</td>
            <td>
                <button><i class="fas fa-edit"></i></button>
                <button><i class="fas fa-trash"></i></button>
            </td>
        `;
        elements.contributionsTable.appendChild(row);
    });
}

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toLocaleString()}`;
}

// Show error message
function showError(message, error) {
    console.error(message, error);
    alert(message);
}

// Open modal
function openModal(modal) {
    modal.style.display = 'flex';
}

// Close modal
function closeModal(modal) {
    modal.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Tab buttons
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabType = btn.dataset.tab;
            switchTab(tabType);
        });
    });

    // Create goal button
    elements.createGoalBtn.addEventListener('click', () => {
        openModal(elements.newGoalModal);
    });

    // View archived goals button
    elements.viewArchivedBtn.addEventListener('click', () => {
        window.location.href = 'archived-goals.html';
    });

    // New goal form submission
    elements.newGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createNewGoal();
    });

    // Cancel button in new goal modal
    elements.cancelGoalBtn.addEventListener('click', () => {
        closeModal(elements.newGoalModal);
    });

    // Close button in modal header
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Switch tabs
function switchTab(tabType) {
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabType}"]`).classList.add('active');
    fetchGoals(tabType);
}