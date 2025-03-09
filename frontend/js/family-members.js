import { auth, db, addFamilyMember, fetchFamilyMembers } from './firebase.js';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const cancelAddMember = document.getElementById('cancelAddMember');
const familyNameInput = document.getElementById('familyNameInput');
const createFamilyBtn = document.getElementById('createFamilyBtn');
const memberList = document.getElementById('memberList');
const inviteLinkContainer = document.getElementById('inviteLinkContainer');
const createFamilyModal = document.getElementById('createFamilyModal');
const cancelCreateFamily = document.getElementById('cancelCreateFamily');
const submitFamilyName = document.getElementById('submitFamilyName');
const generateInviteBtn = document.getElementById('generateInviteBtn');
const invitationMethod = document.getElementById('invitationMethod');
const emailInviteSection = document.getElementById('emailInviteSection');
const linkInviteSection = document.getElementById('linkInviteSection');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const noFamilyMessage = document.getElementById('noFamilyMessage');
const memberTabs = document.getElementById('memberTabs');
const spendingSectionTitle = document.getElementById('spendingSectionTitle');
const spendingCards = document.getElementById('spendingCards');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar')
const familyNameDisplay = document.getElementById('familyNameDisplay');
const familyNameSpan = document.getElementById('familyName');
const userAvatar = document.querySelector('.user-avatar');

let currentUserRole = null; // Store the current user's role
let familyAdminId = null; // Store the Family Admin's UID
let allMembers = []; // Store all family members for filtering
let currentUserId = null;// Define currentUserId globally

// Check if the user has a family
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDisplayName = document.getElementById('userDisplayName');
        const userRole = document.getElementById('userRole');
        const userDoc = await getDoc(doc(db, "users", user.uid));
        currentUserId = user.uid; // Initialize currentUserId when the user is authenticated
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(userData)
            currentUserRole = userData.role; // Store the current user's role
            // Update user info
            userDisplayName.textContent = userData.name || user.email;
            userRole.textContent = userData.role || "User"; // Default to "User" if role is not set
            userAvatar.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;
            if (userData.familyId) {
                console.log("🟢 Family Exists! Showing 'Add Member' button.");
                // User has a family, fetch and display members
                showAddMemberSection();
            // Fetch and display the family name
             const familyDoc = await getDoc(doc(db, "families", userData.familyId));
             if (familyDoc.exists()) {
                 const familyData = familyDoc.data();
                 familyNameSpan.textContent = familyData.name; // Display the family name
                 familyNameDisplay.style.display = "block"; // Show the family name display
                 familyAdminId = familyData.createdBy; // Store the Family Admin's UID
             }

                // Fetch all family members
                allMembers = await fetchFamilyMembers(userData.familyId);
                displayFamilyMembers(allMembers); // Display all members by default
                
            } else {
                console.log("🔴 No Family Found. Hiding 'Add Member' button.");
                
                // User doesn't have a family, show the "Create Family" button
                showCreateFamilySection();
            }
        }
    }
});

// Handle Family Name Submission
submitFamilyName.addEventListener('click', async () => {
    const familyName = familyNameInput.value.trim();
    if (!familyName) {
        alert("Please enter a family name.");
        return;
    }

    const user = auth.currentUser;
    if (user) {
        try {
            // Create a family in Firestore
            const familyRef = await addDoc(collection(db, "families"), {
                name: familyName,
                createdBy: user.uid,
                createdAt: new Date()
            });

            // Update the user's document with the family ID
            await setDoc(doc(db, "users", user.uid), {
                familyId: familyRef.id
            }, { merge: true });

            alert("Family created successfully!");
            createFamilyModal.style.display = "none"; // Hide the modal
            showAddMemberSection(); // Show the "Add Family Members" section
        } catch (error) {
            console.error("Error creating family:", error);
            alert(`Error: ${error.message}`);
        }
    }
});

// Handle Modal Cancellation
cancelCreateFamily.addEventListener('click', () => {
    createFamilyModal.style.display = "none";
});

// Close the modal when clicking outside of it
createFamilyModal.addEventListener('click', (e) => {
    if (e.target === createFamilyModal) {
        createFamilyModal.style.display = "none";
    }
});

// Create a family
createFamilyBtn.addEventListener('click', () => {
    createFamilyModal.style.display = "flex";
});

// Show the "Create Family" section
function showCreateFamilySection() {
    console.log("🔴 No family exists → Hiding 'Add Member' button.");
    noFamilyMessage.hidden = false; // Show the "Create Family" message
    createFamilyBtn.hidden = false; // Show the "Create Family" button
    addMemberBtn.hidden = true; // Hide the "Add Member" button
    memberTabs.hidden = true; // Hide the member tabs
    memberList.hidden = true; // Hide the member list
    spendingSectionTitle.hidden = true; // Hide the spending section
    spendingCards.hidden = true; // Hide the spending cards
    familyNameDisplay.style.display = "none"; // Hide the family name display
}

// Show the "Add Family Members" section
function showAddMemberSection() {
    console.log("🟢 Family exists → Showing 'Add Member' button.");
    noFamilyMessage.hidden = true; // Hide the "Create Family" message
    createFamilyBtn.hidden = true; // Hide the "Create Family" button
    addMemberBtn.hidden = false; // Show the "Add Member" button
    memberTabs.hidden = false; // Show the member tabs
    memberList.hidden = false; // Show the member list
    spendingSectionTitle.hidden = false; // Show the spending section
    spendingCards.hidden = false; // Show the spending cards
}

// Handle "Send Invitation" button
generateInviteBtn.addEventListener('click', async () => {
    console.log("Generate Invite Button clicked!");

    const invitationMethodValue = invitationMethod.value;
    console.log("Selected invitation method:", invitationMethodValue);

    if (invitationMethodValue === "email") {
        const emailInput = document.getElementById('inviteEmail'); // Ensure input exists
        const memberTypeInput = document.getElementById('memberType'); // Get memberType dropdown

        if (!emailInput || !memberTypeInput) {
            console.error("Invite email input or member type selection not found in the DOM.");
            return;
        }

        const email = emailInput.value.trim();
        const memberType = memberTypeInput.value; // Get the selected member type

        if (!email) {
            alert("Please enter an email address.");
            return;
        }

        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User data:", userData);

                if (userData.familyId) {
                    try {
                        await addFamilyMember(userData.familyId, email, memberType);
                        alert("Invitation sent successfully!");
                        addMemberModal.style.display = "none";
                    } catch (error) {
                        console.error("Error sending invitation:", error);
                        alert(`Error: ${error.message}`);
                    }
                } else {
                    alert("You don't have a family yet. Please create one first.");
                }
            } else {
                alert("User data not found.");
            }
        } else {
            alert("No authenticated user found.");
        }
    } else if (invitationMethodValue === "link") {
        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User data:", userData);

                if (userData.familyId) {
                    const inviteLink = `${window.location.origin}/join-family.html?familyId=${userData.familyId}`;
                    document.getElementById('inviteLink').textContent = inviteLink;
                    inviteLinkContainer.style.display = "block";
                } else {
                    alert("You don't have a family yet. Please create one first.");
                }
            }
        }
    }
});

// Display family members
function displayFamilyMembers(members) {
    memberList.innerHTML = members.map(member => `
        <div class="member-card">
            <div class="member-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-info">
                <div class="member-name">${member.email}</div>
                <div class="member-role">${member.role}</div>
            </div>
            ${currentUserId === familyAdminId ? `
                <div class="member-actions">
                    <button class="action-btn edit-btn" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${member.id}"><i class="fas fa-trash"></i></button>
                </div>
            ` : ''}
        </div>
    `).join('');
    // Add event listeners for edit and delete buttons (only for Family Admin)
    if (currentUserId === familyAdminId) {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const memberId = e.target.closest('.edit-btn').dataset.id;
                editMember(memberId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const memberId = e.target.closest('.delete-btn').dataset.id;
                deleteMember(memberId);
            });
        });
    }
}

// Edit Member Functionality (Family Admin Only)
async function editMember(memberId) {
    const memberDoc = await getDoc(doc(db, "familyMembers", memberId));
    if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        // Open a modal or inline form to edit member details
        alert(`Edit member: ${memberData.email}`);
    }
}

// Delete Member Functionality (Family Admin Only)
async function deleteMember(memberId) {
    if (confirm("Are you sure you want to delete this member?")) {
        try {
            await deleteDoc(doc(db, "familyMembers", memberId)); // Use deleteDoc to delete the member
            alert("Member deleted successfully!");
            // Refresh the member list
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const members = await fetchFamilyMembers(userData.familyId);
                    displayFamilyMembers(members);
                }
            }
        } catch (error) {
            console.error("Error deleting member:", error);
            alert(`Error: ${error.message}`);
        }
    }
}


// Filter Members by Type (Adults/Children)
memberTabs.addEventListener('click', async (e) => {
    if (e.target.classList.contains('tab')) {
        const filter = e.target.dataset.filter;

        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        // Add active class to the clicked tab
        e.target.classList.add('active');

        // Filter members based on the selected tab
        let filteredMembers = [];
        if (filter === "all") {
            filteredMembers = allMembers; // Show all members
        } else {
            filteredMembers = allMembers.filter(member => member.role === filter); // Filter by role
        }

        // Display the filtered members
        displayFamilyMembers(filteredMembers);
    }
});


// Update Profile Icon
// auth.onAuthStateChanged((user) => {
//     if (user) {
//         userAvatar.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Profile" class="profile-icon">`;
//     }
// });
// Open the "Add Member" modal
addMemberBtn.addEventListener('click', () => {
    addMemberModal.style.display = "flex";
});

// Close the modal when clicking outside of it
addMemberModal.addEventListener('click', (e) => {
    if (e.target === addMemberModal) {
        addMemberModal.style.display = "none";
    }
});
cancelAddMember.addEventListener('click', () => {
    addMemberModal.style.display = "none";
});

// Handle the invitation method selection
invitationMethod.addEventListener('change', (e) => {
    if (e.target.value === "email") {
        emailInviteSection.style.display = "block";
        linkInviteSection.style.display = "none";
    } else {
        emailInviteSection.style.display = "none";
        linkInviteSection.style.display = "block";
    }
});

// Copy the invitation link to the clipboard
copyLinkBtn.addEventListener('click', () => {
    const inviteLink = document.getElementById('inviteLink').textContent;
    navigator.clipboard.writeText(inviteLink).then(() => {
        alert("Invitation link copied to clipboard!");
    }).catch(() => {
        alert("Failed to copy the link. Please try again.");
    });
});
// Toggle Sidebar Visibility
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close Sidebar When Clicking Outside (Optional)
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});
// Fetch and display family spending overview
async function displayFamilySpendingOverview() {
    const user = auth.currentUser;
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.familyId) {
                // Fetch family members
                const members = await fetchFamilyMembers(userData.familyId);

                // Fetch monthly spending for each member
                const spendingData = await Promise.all(members.map(async (member) => {
                    const spending = await fetchMonthlySpending(member.id); // Fetch spending for each member
                    return {
                        name: member.email,
                        amount: spending.amount || 0 // Default to 0 if no spending data is found
                    };
                }));

                // Display the spending data
                displaySpendingCards(spendingData);
            }
        }
    }
}

// Display spending cards
function displaySpendingCards(spendingData) {
    spendingCards.innerHTML = spendingData.map(member => `
        <div class="spending-card">
            <div class="spending-user-icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="spending-details">
                <div class="spending-label">Monthly Spending</div>
                <div class="spending-name">${member.name}</div>
                <div class="spending-amount">$${member.amount.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

// Fetch monthly spending for a member
async function fetchMonthlySpending(memberId) {
    const spendingDoc = await getDoc(doc(db, "monthlySpending", memberId));
    if (spendingDoc.exists()) {
        return spendingDoc.data();
    } else {
        return { amount: 0 }; // Default to 0 if no spending data is found
    }
}

// Call the function to display family spending overview
displayFamilySpendingOverview();