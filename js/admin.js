(function () {
  'use strict';
  var form = document.getElementById('adminForm');
  var message = document.getElementById('adminMessage');
  var achievementFields = document.getElementById('achievementFields');
  var addAchievement = document.getElementById('addAchievement');
  var logoutButton = document.getElementById('logoutButton');
  var current;

  function setMessage(text, error) { message.textContent = text; message.classList.toggle('error', Boolean(error)); }
  function fill(data) {
    current = { site: data[0], prestasi: data[1], extracurricular: data[2] };
    Object.keys(current.site.school).forEach(function (key) {
      var field = form.elements[key];
      if (field) field.value = current.site.school[key] || '';
    });
    current.site.content = current.site.content || {};
    form.elements.extracurricularTitle.value = current.extracurricular.title || '';
    form.elements.albumTitle.value = current.site.content.albumTitle || '';
    form.elements.achievementTitle.value = current.prestasi.title || '';
    renderAchievements(current.prestasi.achievements || []);
  }

  function field(labelText, key, value, multiline) {
    var label = document.createElement('label');
    label.textContent = labelText;
    var input = document.createElement(multiline ? 'textarea' : 'input');
    input.name = key;
    input.value = value || '';
    if (multiline) input.rows = 3;
    label.appendChild(input);
    return label;
  }

  function addAchievementCard(item) {
    var card = document.createElement('fieldset');
    card.className = 'achievement-editor';
    var legend = document.createElement('legend'); legend.textContent = 'Prestasi';
    var remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus';
    remove.addEventListener('click', function () { card.remove(); });
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    top.append(legend, remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    fields.append(field('Tahun', 'year', item.year), field('Tingkat', 'level', item.level), field('Nama prestasi', 'title', item.title), field('Bidang', 'category', item.category), field('Keterangan', 'description', item.description, true));
    fields.lastChild.classList.add('full');
    card.append(top, fields);
    achievementFields.appendChild(card);
  }

  function renderAchievements(items) {
    achievementFields.replaceChildren();
    items.forEach(addAchievementCard);
  }

  Promise.all(['/api/content', '/api/prestasi', '/api/ekstrakurikuler'].map(function (url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error();
      return response.json();
    });
  })).then(fill).catch(function () { setMessage('Dashboard harus dibuka melalui server.js dan setelah login.', true); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!current) return setMessage('Data belum berhasil dimuat.', true);
    current.site.school = Object.assign({}, current.site.school);
    Object.keys(current.site.school).forEach(function (key) {
      var field = form.elements[key];
      if (field) current.site.school[key] = field.value.trim();
    });
    current.site.content = current.site.content || {};
    current.site.content.albumTitle = form.elements.albumTitle.value.trim();
    current.extracurricular.title = form.elements.extracurricularTitle.value.trim();
    current.prestasi.title = form.elements.achievementTitle.value.trim();
    current.prestasi.achievements = Array.prototype.map.call(achievementFields.querySelectorAll('.achievement-editor'), function (card) {
      return {
        year: card.elements.year.value.trim(), level: card.elements.level.value.trim(), title: card.elements.title.value.trim(), category: card.elements.category.value.trim(), description: card.elements.description.value.trim()
      };
    }).filter(function (item) { return item.title; });
    Promise.all([
      ['/api/content', current.site],
      ['/api/prestasi', current.prestasi],
      ['/api/ekstrakurikuler', current.extracurricular]
    ].map(function (request) {
      return fetch(request[0], { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request[1]) })
        .then(function (response) { return response.json().then(function (data) { return { ok: response.ok, data: data }; }); });
    })).then(function (results) {
        var failed = results.find(function (result) { return !result.ok; });
        if (failed) throw new Error(failed.data.error);
        setMessage('Perubahan tersimpan.');
      }).catch(function (error) { setMessage(error.message || 'Gagal menyimpan perubahan.', true); });
  });
  addAchievement.addEventListener('click', function () { addAchievementCard({}); });
  logoutButton.addEventListener('click', function () {
    fetch('/api/admin/logout', { method: 'POST' }).finally(function () { window.location.assign('/admin'); });
  });
})();
