// Chat System Logic

document.addEventListener('DOMContentLoaded', () => {
    // Only run chat logic if on the dashboard page
    if (window.location.pathname.endsWith('dashboard.html')) {
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is logged in, safe to initialize chat
                initializeChat(user);
            }
        });
    }
});

/**
 * Initializes chat functionality.
 * @param {firebase.User} user - The currently authenticated user.
 */
function initializeChat(user) {
    const messageList = document.getElementById('message-list');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');

    // Load user info into UI
    document.getElementById('user-display-name').textContent = user.displayName || 'User';
    // Add logic to load and set avatar URL if available
    
    // Reference to the 'general-chat' collection
    const chatRef = db.collection('chats').doc('general-chat').collection('messages');

    // Send message on button click
    sendMessageBtn.addEventListener('click', () => sendMessage(user, chatRef, messageInput));
    
    // Send message on Enter key press
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(user, chatRef, messageInput);
        }
    });

    // Listen for new messages in real-time
    chatRef.orderBy('createdAt', 'asc').limitToLast(50)
        .onSnapshot(snapshot => {
            // Clear skeleton loaders on first load
            if (!snapshot.empty) {
                messageList.innerHTML = '';
            }
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const messageData = change.doc.data();
                    displayMessage(user.uid, messageData, messageList);
                }
            });
            // Auto-scroll to the latest message
            messageList.scrollTop = messageList.scrollHeight;
        }, error => {
            console.error("Error listening to chat messages:", error);
            showAlert("Could not load chat messages.");
        });
}

/**
 * Sends a new message to Firestore.
 * @param {firebase.User} user
 * @param {firebase.firestore.CollectionReference} chatRef
 * @param {HTMLInputElement} messageInput
 */
function sendMessage(user, chatRef, messageInput) {
    const text = messageInput.value.trim();
    if (text) {
        chatRef.add({
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null
        }).then(() => {
            messageInput.value = ''; // Clear input field
        }).catch(error => {
            console.error("Error sending message:", error);
            showAlert("Message could not be sent.");
        });
    }
}

/**
 * Renders a single message in the chat window.
 * @param {string} currentUserId
 * @param {object} messageData
 * @param {HTMLElement} messageList
 */
function displayMessage(currentUserId, messageData, messageList) {
    const { uid, displayName, text, createdAt, photoURL } = messageData;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Check if the message is from the current user
    if (uid === currentUserId) {
        messageDiv.classList.add('my-message');
    }

    const avatarSrc = photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

    messageDiv.innerHTML = `
        <img src="${avatarSrc}" alt="${displayName}" class="avatar">
        <div class="message-content">
            <div class="author">${displayName}</div>
            <div class="text">${text}</div>
            <div class="timestamp">${formatTimestamp(createdAt)}</div>
        </div>
    `;
    
    messageList.appendChild(messageDiv);
}