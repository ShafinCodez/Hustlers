// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Show spinner on initial load
    showSpinner();
    
    // Modal handling for the landing page
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeBtns = document.querySelectorAll('.close-btn');

    if (loginBtn) {
        loginBtn.onclick = () => loginModal.style.display = 'block';
    }

    if (signupBtn) {
        signupBtn.onclick = () => signupModal.style.display = 'block';
    }

    closeBtns.forEach(btn => {
        btn.onclick = () => {
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'none';
        };
    });

    window.onclick = (event) => {
        if (event.target == loginModal) loginModal.style.display = 'none';
        if (event.target == signupModal) signupModal.style.display = 'none';
    };

});