// Authentication Logic for Email/Password

document.addEventListener('DOMContentLoaded', () => {
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in.
            console.log('User is logged in:', user);
            // If on the landing page, redirect to dashboard
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                window.location.href = 'dashboard.html';
            }
        } else {
            // User is signed out.
            console.log('User is logged out.');
            // If on the dashboard, redirect to landing page
            if (window.location.pathname.endsWith('dashboard.html')) {
                window.location.href = 'index.html';
            }
        }
        hideSpinner();
    });

    // Event Listeners for auth forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if(forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handlePasswordReset);
    }
});

/**
 * Handles user login.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault();
    showSpinner();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Redirect is handled by onAuthStateChanged
    } catch (error) {
        console.error('Login Error:', error);
        showAlert(error.message);
        hideSpinner();
    }
}

/**
 * Handles new user registration.
 * @param {Event} e - The form submission event.
 */
async function handleSignup(e) {
    e.preventDefault();
    showSpinner();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Set user's display name and create a user profile in Firestore
        await user.updateProfile({ displayName: name });
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            displayName: name,
            email: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await user.sendEmailVerification();
        showAlert('Verification email sent! Please check your inbox.', 'success');
        
        // Log out the user until they verify their email
        auth.signOut();
        hideSpinner();
        
        // Close modal or give feedback
        document.getElementById('signup-modal').style.display = 'none';

    } catch (error) {
        console.error('Signup Error:', error);
        showAlert(error.message);
        hideSpinner();
    }
}

/**
 * Handles user logout.
 */
async function handleLogout() {
    showSpinner();
    try {
        await auth.signOut();
        // Redirect is handled by onAuthStateChanged
    } catch (error) {
        console.error('Logout Error:', error);
        showAlert(error.message);
        hideSpinner();
    }
}

/**
 * Handles password reset request.
 */
async function handlePasswordReset(e) {
    e.preventDefault();
    const email = prompt("Please enter your email address to reset your password:");
    if (email) {
        showSpinner();
        try {
            await auth.sendPasswordResetEmail(email);
            showAlert('Password reset email sent. Please check your inbox.', 'success');
        } catch (error) {
            console.error('Password Reset Error:', error);
            showAlert(error.message);
        } finally {
            hideSpinner();
        }
    }
}
