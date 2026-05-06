async function logout() {
    try {
        await fetch('/api/auth?action=logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Logout failed:', err);
        window.location.href = 'login.html';
    }
}

