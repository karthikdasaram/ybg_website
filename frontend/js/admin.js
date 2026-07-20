// Guards admin pages - redirects to login if not an authenticated admin
function requireAdmin() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '../login.html';
    return;
  }
  if (!Auth.isAdmin()) {
    window.location.href = '../member/dashboard.html';
    return;
  }
}

// Guards member pages
function requireMember() {
  if (!Auth.isLoggedIn()) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `../login.html?returnUrl=${returnUrl}`;
    return;
  }
  const role = Auth.getUser().role;
  if (role === 'admin') {
    window.location.href = '../admin/dashboard.html';
    return;
  }
  if (role === 'trainer') {
    window.location.href = '../trainer/dashboard.html';
    return;
  }
}

// Guards trainer pages
function requireTrainer() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '../login.html';
    return;
  }
  if (Auth.getUser().role !== 'trainer') {
    window.location.href = Auth.isAdmin() ? '../admin/dashboard.html' : '../member/dashboard.html';
    return;
  }
}

function homeForRole(user) {
  if (!user) return 'login.html';
  if (user.role === 'admin') return 'admin/dashboard.html';
  if (user.role === 'trainer') return 'trainer/dashboard.html';
  return 'member/dashboard.html';
}
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}