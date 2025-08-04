// Utility Functions

/**
 * Shows the loading spinner.
 */
function showSpinner() {
    document.getElementById('loading-spinner').classList.add('show');
}

/**
 * Hides the loading spinner.
 */
function hideSpinner() {
    document.getElementById('loading-spinner').classList.remove('show');
}

/**
 * Displays a simple alert/toast message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showAlert(message, type = 'error') {
    // In a real app, you'd use a more robust toast notification library
    alert(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Formats a Firestore Timestamp into a readable string.
 * @param {firebase.firestore.Timestamp} timestamp - The timestamp to format.
 * @returns {string} Formatted time string (e.g., "10:35 AM").
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}