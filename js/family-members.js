import { auth, db, addFamilyMember, fetchFamilyMembers } from './firebase.js';
import { doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const noFamilySection = document.getElementById('noFamilySection');
const addMemberSection = document.getElementById('addMemberSection');
const familyNameInput = document.getElementById('familyNameInput');
const createFamilyBtn = document.getElementById('createFamilyBtn');
const inviteEmail = document.getElementById('inviteEmail');
const generateInviteBtn = document.getElementById('generateInviteBtn');
const memberList = document.getElementById('memberList');

// Check if the user has a family
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.familyId) {
                // User has a family, fetch and display members
                const members = await fetchFamilyMembers(userData.familyId);
                displayFamilyMembers(members);
            } else {
                // User doesn't have a family, show the "Create Family" section
                noFamilySection.style.display = "block";
                addMemberSection.style.display = "none";
            }
        }
    }
});

// Create a family
createFamilyBtn.addEventListener('click', async () => {
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
            noFamilySection.style.display = "none";
            addMemberSection.style.display = "block";
        } catch (error) {
            console.error("Error creating family:", error);
            alert(`Error: ${error.message}`);
        }
    }
});

// Add a family member
generateInviteBtn.addEventListener('click', async () => {
    const email = inviteEmail.value.trim();
    if (!email) {
        alert("Please enter an email address.");
        return;
    }

    const user = auth.currentUser;
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.familyId) {
                await addFamilyMember(userData.familyId, email, "adult");
            } else {
                alert("You don't have a family yet. Please create one first.");
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
            <div class="member-actions">
                <button class="action-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

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

// Handle the invitation method selection
const invitationMethod = document.getElementById('invitationMethod');
const emailInviteSection = document.getElementById('emailInviteSection');
const linkInviteSection = document.getElementById('linkInviteSection');
const inviteLinkContainer = document.getElementById('inviteLinkContainer');
const copyLinkBtn = document.getElementById('copyLinkBtn');

invitationMethod.addEventListener('change', (e) => {
    if (e.target.value === "email") {
        emailInviteSection.style.display = "block";
        linkInviteSection.style.display = "none";
    } else {
        emailInviteSection.style.display = "none";
        linkInviteSection.style.display = "block";
    }
});

// Generate an invitation link
generateInviteBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.familyId) {
                const inviteLink = `${window.location.origin}/join-family.html?familyId=${userData.familyId}`;
                document.getElementById('inviteLink').textContent = inviteLink;
                inviteLinkContainer.style.display = "block";
            } else {
                alert("You don't have a family yet. Please create one first.");
            }
        }
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

// Cancel creating a family
document.getElementById('cancelCreateFamily').addEventListener('click', () => {
    addMemberModal.style.display = "none";
});

// Cancel adding a member
document.getElementById('cancelAddMember').addEventListener('click', () => {
    addMemberModal.style.display = "none";
});