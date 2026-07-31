(function () {
  'use strict';
  var form = document.getElementById('adminLoginForm');
  var password = document.getElementById('adminPassword');
  var message = document.getElementById('adminLoginMessage');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    message.textContent = 'Memverifikasi password…';
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    }).then(function (response) {
      return response.json().then(function (data) { return { ok: response.ok, data: data }; });
    }).then(function (result) {
      if (!result.ok) throw new Error(result.data.error);
      window.location.assign('/admin/dashboard');
    }).catch(function (error) {
      password.value = '';
      password.focus();
      message.textContent = error.message || 'Login gagal. Coba lagi.';
      message.classList.add('error');
    });
  });
})();
