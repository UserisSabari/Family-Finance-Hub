import { auth, db } from './firebase.js';

// Current user object
let currentUser = null;
let userData = null;

// Load user data from Firestore
async function loadUserData() {
    try {
        // Set elements to loading state
        document.getElementById('userDisplayName').textContent = 'Loading...';
        document.getElementById('userRole').textContent = 'Loading...';
        document.getElementById('profileName').textContent = 'Loading...';
        document.getElementById('profileRole').textContent = 'Loading...';
        document.getElementById('contactInfo').textContent = 'Loading...';

        // Wait for auth state to be ready
        currentUser = await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            });
        });

        if (!currentUser) {
            console.error('No user is signed in');
            window.location.href = 'login.html';
            return;
        }

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (!userDoc.exists) {
            console.error('User document does not exist');
            return;
        }

        userData = userDoc.data();

        // Update user display
        const userDisplayName = document.getElementById('userDisplayName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');

        userDisplayName.textContent = userData.name || currentUser.email;
        userRole.textContent = userData.role || "User";
        userAvatar.innerHTML = `<img src="${currentUser.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;

        // Update profile section
        document.getElementById('profileName').textContent = userData.displayName;
        document.getElementById('profileRole').textContent = 
            `${userData.role} • Member since ${new Date(userData.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        document.getElementById('contactInfo').textContent = 
            `${userData.email} • ${userData.phone || 'No phone number'}`;

        // Update settings
        document.getElementById('twoFactorToggle').checked = userData.twoFactorEnabled || false;
        document.getElementById('emailToggle').checked = userData.emailNotifications || false;

        // Update currency and date format
        document.getElementById('currencyDescription').textContent = 
            `${userData.currency || 'USD'} - ${getCurrencyFullName(userData.currency || 'USD')}`;
        document.getElementById('currencySelect').value = userData.currency || 'USD';

        document.getElementById('dateFormatDescription').textContent = userData.dateFormat || 'MM/DD/YYYY';
        document.getElementById('dateFormatSelect').value = userData.dateFormat || 'MM/DD/YYYY';

        // Update last backup date
        document.getElementById('lastBackupDate').textContent = 
            `Last backup: ${userData.lastBackup ? new Date(userData.lastBackup).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Never'}`;

    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Failed to load user data. Please refresh the page or contact support.');
    }
}

// Helper function to get currency full name
function getCurrencyFullName(code) {
    const currencies = {
        'USD': 'United States Dollar',
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CAD': 'Canadian Dollar'
    };
    return currencies[code] || code;
}

// Save user settings to Firestore
async function saveSettings() {
    if (!currentUser) return;

    try {
        const saveBtn = document.getElementById('saveChanges');
        saveBtn.classList.add('loading');
        saveBtn.innerHTML = 'Saving <span class="spinner"></span>';

        // Get current values
        const twoFactorEnabled = document.getElementById('twoFactorToggle').checked;
        const emailNotifications = document.getElementById('emailToggle').checked;
        const currency = document.getElementById('currencySelect').value;
        const dateFormat = document.getElementById('dateFormatSelect').value;

        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            twoFactorEnabled,
            emailNotifications,
            currency,
            dateFormat,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update display values
        document.getElementById('currencyDescription').textContent = 
            `${currency} - ${getCurrencyFullName(currency)}`;
        document.getElementById('dateFormatDescription').textContent = dateFormat;

        // Remove loading state
        saveBtn.classList.remove('loading');
        saveBtn.innerHTML = 'Save Changes';

        // Show success message
        alert('Settings saved successfully!');

    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again or contact support.');
        document.getElementById('saveChanges').classList.remove('loading');
        document.getElementById('saveChanges').innerHTML = 'Save Changes';
    }
}

// Reset settings to defaults
async function resetSettings() {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to reset all settings to default values?')) return;

    try {
        const resetBtn = document.getElementById('resetDefaults');
        resetBtn.classList.add('loading');
        resetBtn.innerHTML = 'Resetting <span class="spinner"></span>';

        // Default values
        const defaults = {
            twoFactorEnabled: false,
            emailNotifications: false,
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update(defaults);

        // Update UI
        document.getElementById('twoFactorToggle').checked = false;
        document.getElementById('emailToggle').checked = false;
        document.getElementById('currencySelect').value = 'USD';
        document.getElementById('dateFormatSelect').value = 'MM/DD/YYYY';
        document.getElementById('currencyDescription').textContent = 'USD - United States Dollar';
        document.getElementById('dateFormatDescription').textContent = 'MM/DD/YYYY';

        // Remove loading state
        resetBtn.classList.remove('loading');
        resetBtn.innerHTML = 'Reset to Defaults';

        // Show success message
        alert('Settings reset to defaults!');

    } catch (error) {
        console.error('Error resetting settings:', error);
        alert('Failed to reset settings. Please try again or contact support.');
        document.getElementById('resetDefaults').classList.remove('loading');
        document.getElementById('resetDefaults').innerHTML = 'Reset to Defaults';
    }
}

// Submit feedback
async function submitFeedback() {
    if (!currentUser) return;

    const feedbackText = document.querySelector('.feedback-textarea').value.trim();

    if (!feedbackText) {
        alert('Please enter your feedback before submitting.');
        return;
    }

    try {
        const submitBtn = document.getElementById('submitFeedback');
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = 'Submitting <span class="spinner"></span>';

        // Add feedback to Firestore
        await db.collection('feedback').add({
            userId: currentUser.uid,
            userName: userData.displayName,
            userEmail: userData.email,
            feedback: feedbackText,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear textarea and remove loading state
        document.querySelector('.feedback-textarea').value = '';
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = 'Submit Feedback';

        // Show success message
        alert('Feedback submitted successfully! Thank you for your input.');

    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again or contact support.');
        document.getElementById('submitFeedback').classList.remove('loading');
        document.getElementById('submitFeedback').innerHTML = 'Submit Feedback';
    }
}

// Trigger backup
async function startBackup() {
    if (!currentUser) return;

    try {
        const backupBtn = document.getElementById('backupBtn');
        backupBtn.classList.add('fa-spin');

        // Update last backup time in Firestore
        const now = new Date();
        await db.collection('users').doc(currentUser.uid).update({
            lastBackup: firebase.firestore.Timestamp.fromDate(now)
        });

        // Update display
        document.getElementById('lastBackupDate').textContent = 
            `Last backup: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        // Stop spinner
        setTimeout(() => {
            backupBtn.classList.remove('fa-spin');
            alert('Data backup completed successfully!');
        }, 1500);

    } catch (error) {
        console.error('Error during backup:', error);
        document.getElementById('backupBtn').classList.remove('fa-spin');
        alert('Failed to backup data. Please try again or contact support.');
    }
}

// Tab switching functionality
function setupTabNavigation() {
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            tabItems.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            // Here you would typically show/hide content based on the selected tab
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load user data from Firestore
    loadUserData();

    // Setup tab navigation
    setupTabNavigation();

    // Event listeners
    document.getElementById('saveChanges').addEventListener('click', saveSettings);
    document.getElementById('resetDefaults').addEventListener('click', resetSettings);
    document.getElementById('submitFeedback').addEventListener('click', submitFeedback);
    document.getElementById('backupBtn').addEventListener('click', startBackup);
});