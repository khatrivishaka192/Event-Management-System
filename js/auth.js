/* ===================================================
   AUTH.JS — Simple admin auth gate (client-side demo)
   =================================================== */

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const SESSION_KEY = 'ems_admin_session';

/* ---------- GUARD: runs on every protected admin page ---------- */
(function guardAdminPage() {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  if (isLoginPage) return;

  const session = sessionStorage.getItem(SESSION_KEY);
  if (session !== 'true') {
    window.location.replace('login.html');
  }
})();

/* ---------- LOGIN PAGE LOGIC ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  // If already logged in, go straight to dashboard
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    window.location.replace('dashboard.html');
    return;
  }

  // Password show/hide toggle
  const togglePass = document.querySelector('.toggle-pass');
  const passInput = document.getElementById('adminPass');
  togglePass?.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    togglePass.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('adminUser');
    const password = document.getElementById('adminPass');
    const loginError = document.getElementById('loginError');
    let isValid = true;

    [username, password].forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) {
        group.classList.add('invalid');
        isValid = false;
      } else {
        group.classList.remove('invalid');
      }
    });

    if (!isValid) return;

    if (username.value.trim() === ADMIN_CREDENTIALS.username &&
        password.value === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      loginError.classList.remove('show');
      showToast('Login successful! Redirecting...');
      setTimeout(() => window.location.href = 'dashboard.html', 700);
    } else {
      loginError.textContent = 'Invalid username or password. Try again.';
      loginError.classList.add('show');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  });
});

/* ---------- LOGOUT ---------- */
function adminLogout() {
  if (!confirm('Are you sure you want to log out?')) return;
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}
