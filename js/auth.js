// Authentication Logic for Phone Sign-In

// This will hold the confirmation result object after sending the code
let confirmationResult;

document.addEventListener('DOMContentLoaded', () => {
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in.
            console.log('User is logged in:', user);
            // Check if the user is new (has no display name) and prompt them to set one
            handleNewUserProfile(user); 
        } else {
            // User is signed out.
            console.log('User is logged out.');
            if (window.location.pathname.endsWith('dashboard.html')) {
                window.location.href = 'index.html';
            }
        }
        hideSpinner();
    });
    
    // --- Setup reCAPTCHA Verifier ---
    // This is invisible and verifies the user is not a bot.
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("reCAPTCHA solved");
        }
    });

    // --- Form Event Listeners ---
    const phoneForm = document.getElementById('phone-form');
    if (phoneForm) {
        phoneForm.addEventListener('submit', sendVerificationCode);
    }

    const codeForm = document.getElementById('code-form');
    if (codeForm) {
        codeForm.addEventListener('submit', verifyCode);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Step 1: Sends the verification code to the user's phone.
 */
async function sendVerificationCode(e) {
    e.preventDefault();
    showSpinner();

    const phoneInput = document.getElementById('phone-number').value;
    // Format the number correctly for Bangladesh
    const phoneNumber = `+880${phoneInput}`;
    const appVerifier = window.recaptchaVerifier;

    try {
        confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
        
        // Switch to the code entry view
        document.getElementById('phone-entry-step').style.display = 'none';
        document.getElementById('code-entry-step').style.display = 'block';
        showAlert('Verification code sent!', 'success');
        
    } catch (error) {
        console.error('SMS not sent error:', error);
        showAlert(error.message);
        // Reset reCAPTCHA to allow retries
        recaptchaVerifier.render().then(widgetId => {
            grecaptcha.reset(widgetId);
        });
    } finally {
        hideSpinner();
    }
}

/**
 * Step 2: Verifies the code entered by the user.
 */
async function verifyCode(e) {
    e.preventDefault();
    showSpinner();
    
    const code = document.getElementById('verification-code').value;

    try {
        await confirmationResult.confirm(code);
        // Login successful. The onAuthStateChanged listener will handle the redirect.
        // The modal will be closed by the main app.js logic on successful login redirect
    } catch (error) {
        console.error('Code verification error:', error);
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
 * After first login, prompts a new user to set their display name.
 */
async function handleNewUserProfile(user) {
    // A user is "new" if they have a phone number but no display name yet.
    const isNewUser = user.phoneNumber && !user.displayName;

    if (isNewUser) {
        const displayName = prompt("Welcome! Please enter your name to complete your profile.");
        if (displayName) {
            try {
                await user.updateProfile({ displayName: displayName });
                // Also save to Firestore
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    displayName: displayName,
                    phoneNumber: user.phoneNumber
                }, { merge: true }); // Use merge to not overwrite existing data

                // Now we can redirect
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error("Error updating profile:", error);
                showAlert("Could not save your name. Please try again.");
                // Redirect anyway, they can set it later
                window.location.href = 'dashboard.html';
            }
        } else {
             // If they cancel the prompt, just redirect them
            window.location.href = 'dashboard.html';
        }
    } else {
        // For existing users, just redirect
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    }
}