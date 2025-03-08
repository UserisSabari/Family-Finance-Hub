import { auth, db, addFamilyMember, fetchFamilyMembers } from './firebase.js';
import { doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const cancelAddMember = document.getElementById('cancelAddMember');
const addMemberSection = document.getElementById('addMemberSection');
const familyNameInput = document.getElementById('familyNameInput');
const createFamilyBtn = document.getElementById('createFamilyBtn');
const memberList = document.getElementById('memberList');
const inviteLinkContainer = document.getElementById('inviteLinkContainer');

// Check if the user has a family
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
       
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(userData)
            if (userData.familyId) {
                // User has a family, fetch and display members
                showAddMemberSection();
                const members = await fetchFamilyMembers(userData.familyId);
                displayFamilyMembers(members);
                // noFamilySection.style.display = "none"; // Hide "Create Family" section
                // addMemberSection.style.display = "block"; // Show "Add Member" section
            } else {
                // User doesn't have a family, show the "Create Family" section
                // noFamilySection.style.display = "block";
                // addMemberSection.style.display = "none";
                // User doesn't have a family, show the "Create Family" button
                showCreateFamilySection();
            }
        }
    }
});

// Handle Family Name Submission
document.getElementById('submitFamilyName').addEventListener('click', async () => {
    const familyName = document.getElementById('familyNameInput').value.trim();
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
            document.getElementById('familyNameModal').style.display = "none"; // Hide the modal
            showAddMemberSection(); // Show the "Add Family Members" section
        } catch (error) {
            console.error("Error creating family:", error);
            alert(`Error: ${error.message}`);
        }
    }
});

// Handle Modal Cancellation
document.getElementById('cancelFamilyName').addEventListener('click', () => {
    document.getElementById('familyNameModal').style.display = "none";
});

// Close the modal when clicking outside of it
document.getElementById('familyNameModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('familyNameModal')) {
        document.getElementById('familyNameModal').style.display = "none";
    }
});
// Create a family
document.getElementById('createFamilyBtn').addEventListener('click', async () => {
    document.getElementById('familyNameModal').style.display = "flex";
});

// createFamilyBtn.addEventListener('click', async () => {
//     const familyName = familyNameInput.value.trim();
//     if (!familyName) {
//         alert("Please enter a family name.");
//         return;
//     }

//     const user = auth.currentUser;
//     if (user) {
//         try {
//             // Create a family in Firestore
//             const familyRef = await addDoc(collection(db, "families"), {
//                 name: familyName,
//                 createdBy: user.uid,
//                 createdAt: new Date()
//             });

//             // Update the user's document with the family ID
//             await setDoc(doc(db, "users", user.uid), {
//                 familyId: familyRef.id
//             }, { merge: true });

//             alert("Family created successfully!");
//             noFamilySection.style.display = "none";
//             addMemberSection.style.display = "block";
//         } catch (error) {
//             console.error("Error creating family:", error);
//             alert(`Error: ${error.message}`);
//         }
//     }
// });

// Show the "Create Family" section
function showCreateFamilySection() {
    document.getElementById('noFamilyMessage').hidden = false; // Show the "Create Family" message
    document.getElementById('createFamilyBtn').hidden = false; // Show the "Create Family" button
    document.getElementById('addMemberBtn').hidden = true; // Hide the "Add Member" button
    document.getElementById('memberTabs').hidden = true; // Hide the member tabs
    document.getElementById('memberList').hidden = true; // Hide the member list
    document.getElementById('spendingSectionTitle').hidden = true; // Hide the spending section
    document.getElementById('spendingCards').hidden = true; // Hide the spending cards
}

// Show the "Add Family Members" section
function showAddMemberSection() {
    document.getElementById('noFamilyMessage').hidden = true; // Hide the "Create Family" message
    document.getElementById('createFamilyBtn').hidden = true; // Hide the "Create Family" button
    document.getElementById('addMemberBtn').hidden = false; // Show the "Add Member" button
    document.getElementById('memberTabs').hidden = false; // Show the member tabs
    document.getElementById('memberList').hidden = false; // Show the member list
    document.getElementById('spendingSectionTitle').hidden = false; // Show the spending section
    document.getElementById('spendingCards').hidden = false; // Show the spending cards
}
// document.getElementById('createFamilyBtn').addEventListener('click', async () => {
//     const familyName = prompt("Enter your family name:"); // Prompt for family name
//     if (!familyName) {
//         alert("Please enter a family name.");
//         return;
//     }

//     const user = auth.currentUser;
//     if (user) {
//         try {
//             // Create a family in Firestore
//             const familyRef = await addDoc(collection(db, "families"), {
//                 name: familyName,
//                 createdBy: user.uid,
//                 createdAt: new Date()
//             });

//             // Update the user's document with the family ID
//             await setDoc(doc(db, "users", user.uid), {
//                 familyId: familyRef.id
//             }, { merge: true });

//             alert("Family created successfully!");
//             showAddMemberSection(); // Show the "Add Family Members" section
//         } catch (error) {
//             console.error("Error creating family:", error);
//             alert(`Error: ${error.message}`);
//         }
//     }
// });

// Handle "Send Invitation" button
document.addEventListener('DOMContentLoaded', () => {
    const generateInviteBtn = document.getElementById('generateInviteBtn');
    if (generateInviteBtn) {
        generateInviteBtn.addEventListener('click', async () => {
            console.log("Generate Invite Button clicked!");

            const invitationMethod = document.getElementById('invitationMethod').value;
            console.log("Selected invitation method:", invitationMethod);

            if (invitationMethod === "email") {
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
            } else if (invitationMethod === "link") {
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
    } else {
        console.error("Generate Invite Button not found in the DOM.");
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
cancelAddMember.addEventListener('click', () => {
    addMemberModal.style.display = "none";
});

// Handle the invitation method selection
const invitationMethod = document.getElementById('invitationMethod');
const emailInviteSection = document.getElementById('emailInviteSection');
const linkInviteSection = document.getElementById('linkInviteSection');
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