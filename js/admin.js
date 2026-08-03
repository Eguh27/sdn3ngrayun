(function () {
  'use strict';
  var form = document.getElementById('adminForm');
  var message = document.getElementById('adminMessage');
  var achievementFields = document.getElementById('achievementFields');
  var addAchievement = document.getElementById('addAchievement');
  var newsFields = document.getElementById('newsFields');
  var addNews = document.getElementById('addNews');
  var videoFields = document.getElementById('videoFields');
  var addVideo = document.getElementById('addVideo');
  var missionFields = document.getElementById('missionFields');
  var addMission = document.getElementById('addMission');
  var ekskulFields = document.getElementById('ekskulFields');
  var addEkskul = document.getElementById('addEkskul');
  var staffFields = document.getElementById('staffFields');
  var addStaff = document.getElementById('addStaff');
  var principalPhotoInput = document.getElementById('principalPhotoUpload');
  var logoutButton = document.getElementById('logoutButton');
  var current;

  function setMessage(text, error) { message.textContent = text; message.classList.toggle('error', Boolean(error)); }
  function fill(data) {
    current = { site: data[0], prestasi: data[1], extracurricular: data[2], news: data[3], videos: data[4] };
    Object.keys(current.site.school).forEach(function (key) {
      var field = form.elements[key];
      if (field) field.value = current.site.school[key] || '';
    });
    current.site.content = current.site.content || {};
    current.site.content.images = current.site.content.images || {};
    current.site.content.images.views = current.site.content.images.views || {};
    current.site.content.images.gallery = current.site.content.images.gallery || {};
    form.elements.extracurricularTitle.value = current.extracurricular.title || '';
    form.elements.albumTitle.value = current.site.content.albumTitle || '';
    form.elements.achievementTitle.value = current.prestasi.title || '';
    form.elements.channelUrl.value = current.videos.channelUrl || '';
    if (form.elements.principalPhoto) form.elements.principalPhoto.value = current.site.school.principalPhoto || '';
    renderMissions(current.site.school.missions || []);
    renderStaff(current.site.school.staff || []);
    renderEkskul(current.extracurricular.items || []);
    renderAchievements(current.prestasi.achievements || []);
    renderNews(current.news.items || []);
    renderVideos(current.videos.items || []);
    renderHeroSlot();
    renderGallerySlots();
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
    card.dataset.label = 'Data prestasi';
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

  function addNewsCard(item) {
    var author = (item.author && typeof item.author === 'object') ? item.author : {};
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Berita';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    var dateField = field('Tanggal', 'date', item.date);
    var titleField = field('Judul berita', 'title', item.title);
    titleField.classList.add('full');
    var subtitleField = field('Subjudul (opsional)', 'subtitle', item.subtitle);
    subtitleField.classList.add('full');
    var excerptField = field('Ringkasan singkat', 'excerpt', item.excerpt, true);
    excerptField.classList.add('full');
    var bodyField = field('Isi artikel lengkap', 'articleBody', item.body || item.articleBody);
    bodyField.classList.add('full');
    bodyField.querySelector('textarea,input').rows = 10;
    var imageLabel = document.createElement('label');
    imageLabel.className = 'full';
    imageLabel.textContent = 'URL gambar artikel';
    var imageWrap = document.createElement('div');
    imageWrap.className = 'img-field-wrap';
    var imageInputEl = document.createElement('input');
    imageInputEl.name = 'image';
    imageInputEl.value = item.image || '';
    var imgUpBtn = document.createElement('button');
    imgUpBtn.type = 'button'; imgUpBtn.className = 'admin-add img-upload-btn-inline';
    imgUpBtn.textContent = '⬆ Upload foto artikel';
    imgUpBtn.addEventListener('click', function () {
      openUploadModal('galeri', function (url) { imageInputEl.value = url; });
    });
    imageWrap.append(imageInputEl, imgUpBtn);
    imageLabel.appendChild(imageWrap);
    var imageSourceField = field('Sumber / kredit foto', 'imageSource', item.imageSource);
    imageSourceField.classList.add('full');
    var authorNameField = field('Nama penulis', 'authorName', author.name);
    var authorRoleField = field('Jabatan / peran penulis', 'authorRole', author.role);
    var urlField = field('Tautan sumber eksternal (opsional)', 'url', item.url);
    urlField.classList.add('full');
    fields.append(dateField, titleField, subtitleField, excerptField, bodyField, imageLabel, imageSourceField, authorNameField, authorRoleField, urlField);
    card.append(top, fields); newsFields.appendChild(card);
  }
  function renderNews(items) { newsFields.replaceChildren(); items.forEach(addNewsCard); }

  function addVideoCard(item) {
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Video';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    fields.append(field('Judul video', 'title', item.title), field('URL video YouTube', 'url', item.url), field('Keterangan', 'description', item.description, true)); fields.lastChild.classList.add('full');
    card.append(top, fields); videoFields.appendChild(card);
  }
  function renderVideos(items) { videoFields.replaceChildren(); items.forEach(addVideoCard); }

  function addMissionCard(text) {
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Misi';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    var mf = field('Butir misi', 'missionText', text, true); mf.classList.add('full'); mf.querySelector('textarea').rows = 3;
    fields.appendChild(mf); card.append(top, fields); missionFields.appendChild(card);
  }
  function renderMissions(items) { missionFields.replaceChildren(); items.forEach(function (t) { addMissionCard(t); }); }

  function addStaffCard(item) {
    item = item || {};
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Guru/Staf';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    var nameField = field('Nama lengkap', 'staffName', item.name);
    nameField.classList.add('full');
    var roleField = field('Jabatan / peran', 'staffRole', item.role);
    roleField.classList.add('full');
    var photoLabel = document.createElement('label');
    photoLabel.className = 'full';
    photoLabel.textContent = 'URL foto';
    var photoWrap = document.createElement('div');
    photoWrap.className = 'img-field-wrap';
    var photoInputEl = document.createElement('input');
    photoInputEl.name = 'staffPhoto';
    photoInputEl.value = item.photo || '';
    var upBtn = document.createElement('button');
    upBtn.type = 'button'; upBtn.className = 'admin-add img-upload-btn-inline';
    upBtn.textContent = '⬆ Upload foto';
    upBtn.addEventListener('click', function () {
      openUploadModal('profil', function (url) { photoInputEl.value = url; });
    });
    photoWrap.append(photoInputEl, upBtn);
    photoLabel.appendChild(photoWrap);
    fields.append(nameField, roleField, photoLabel);
    card.append(top, fields); staffFields.appendChild(card);
  }
  function renderStaff(items) { staffFields.replaceChildren(); items.forEach(addStaffCard); }

  function addEkskulCard(item) {
    item = item || {};
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Ekskul';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    var schedule = (item.details && item.details[0] && item.details[0].value) || '';
    fields.append(
      field('Ikon (emoji)', 'icon', item.icon),
      field('Nama ekskul', 'title', item.title),
      field('Jadwal', 'schedule', schedule),
      field('Ringkasan singkat (beranda)', 'summary', item.summary),
      field('Deskripsi lengkap (halaman ekskul)', 'description', item.description || item.summary, true)
    );
    fields.children[1].classList.add('full');
    fields.children[3].classList.add('full');
    fields.lastChild.classList.add('full');
    card.append(top, fields); ekskulFields.appendChild(card);
  }
  function renderEkskul(items) { ekskulFields.replaceChildren(); items.forEach(addEkskulCard); }

  Promise.all(['/api/content', '/api/prestasi', '/api/ekstrakurikuler', '/api/news', '/api/videos'].map(function (url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error();
      return response.json();
    });
  })).then(fill).catch(function () { setMessage('Dashboard harus dibuka melalui server.js dan setelah login.', true); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!current) return setMessage('Data belum berhasil dimuat.', true);
    current.site.school = Object.assign({}, current.site.school);
    var skipKeys = { missions: true };
    Object.keys(current.site.school).forEach(function (key) {
      if (skipKeys[key]) return;
      var f = form.elements[key];
      if (f) current.site.school[key] = f.value.trim();
    });
    current.site.school.missions = Array.prototype.map.call(
      missionFields.querySelectorAll('.achievement-editor'),
      function (card) { return card.elements.missionText.value.trim(); }
    ).filter(Boolean);
    current.site.school.principalPhoto = form.elements.principalPhoto ? form.elements.principalPhoto.value.trim() : '';
    current.site.school.staff = Array.prototype.map.call(staffFields.querySelectorAll('.achievement-editor'), function (card) {
      return {
        name: card.elements.staffName.value.trim(),
        role: card.elements.staffRole.value.trim(),
        photo: card.elements.staffPhoto.value.trim()
      };
    }).filter(function (item) { return item.name; });
    current.site.content = current.site.content || {};
    current.site.content.albumTitle = form.elements.albumTitle.value.trim();
    current.site.content.galleryInfo = current.site.content.galleryInfo || {};
    var galleryInfo = {};
    document.querySelectorAll('.gallery-slot-card').forEach(function (card) {
      var key = card.querySelector('.gallery-slot-meta .gallery-slot-label');
      var titleInput = card.querySelector('input[name="galleryTitle"]');
      var detailInput = card.querySelector('textarea[name="galleryDetail"]');
      var matched = null;
      gallerySlotDefs.forEach(function (slot) {
        if (!key) return;
        if (key.textContent === slot.label) matched = slot.key;
      });
      if (matched && titleInput && detailInput) {
        galleryInfo[matched] = { title: titleInput.value.trim(), detail: detailInput.value.trim() };
      }
    });
    current.site.content.galleryInfo = galleryInfo;
    current.extracurricular.title = form.elements.extracurricularTitle.value.trim();
    current.extracurricular.items = Array.prototype.map.call(
      ekskulFields.querySelectorAll('.achievement-editor'),
      function (card) {
        return {
          icon: card.elements.icon.value.trim(),
          title: card.elements.title.value.trim(),
          summary: card.elements.summary.value.trim(),
          description: card.elements.description.value.trim(),
          details: [{ label: 'Jadwal', value: card.elements.schedule.value.trim() }]
        };
      }
    ).filter(function (item) { return item.title; });
    current.prestasi.title = form.elements.achievementTitle.value.trim();
    current.news.items = Array.prototype.map.call(newsFields.querySelectorAll('.achievement-editor'), function (card) { return { date: card.elements.date.value.trim(), title: card.elements.title.value.trim(), subtitle: card.elements.subtitle.value.trim(), excerpt: card.elements.excerpt.value.trim(), body: card.elements.articleBody.value.trim(), image: card.elements.image.value.trim(), imageSource: card.elements.imageSource.value.trim(), author: { name: card.elements.authorName.value.trim(), role: card.elements.authorRole.value.trim() }, url: card.elements.url.value.trim() }; }).filter(function (item) { return item.title; });
    current.videos.channelUrl = form.elements.channelUrl.value.trim();
    current.videos.items = Array.prototype.map.call(videoFields.querySelectorAll('.achievement-editor'), function (card) { return { title: card.elements.title.value.trim(), url: card.elements.url.value.trim(), description: card.elements.description.value.trim() }; }).filter(function (item) { return item.title && item.url; });
    current.prestasi.achievements = Array.prototype.map.call(achievementFields.querySelectorAll('.achievement-editor'), function (card) {
      return {
        year: card.elements.year.value.trim(), level: card.elements.level.value.trim(), title: card.elements.title.value.trim(), category: card.elements.category.value.trim(), description: card.elements.description.value.trim()
      };
    }).filter(function (item) { return item.title; });
    Promise.all([
      ['/api/content', current.site],
      ['/api/prestasi', current.prestasi],
      ['/api/ekstrakurikuler', current.extracurricular],
      ['/api/news', current.news],
      ['/api/videos', current.videos]
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
  addNews.addEventListener('click', function () { addNewsCard({}); });
  addVideo.addEventListener('click', function () { addVideoCard({}); });
  addMission.addEventListener('click', function () { addMissionCard(''); });
  addEkskul.addEventListener('click', function () { addEkskulCard({}); });
  if (addStaff) addStaff.addEventListener('click', function () { addStaffCard({}); });
  if (principalPhotoInput) principalPhotoInput.addEventListener('click', function () {
    openUploadModal('profil', function (url) { if (form.elements.principalPhoto) form.elements.principalPhoto.value = url; });
  });
  logoutButton.addEventListener('click', function () {
    fetch('/api/admin/logout', { method: 'POST' }).finally(function () { window.location.assign('/admin'); });
  });

  // ==========================================
  // 7. Upload & Crop — dipakai oleh semua bagian
  // ==========================================
  var imageInput = document.getElementById('imageInput');
  var cropDialog = document.getElementById('cropDialog');
  var cropFrame = document.getElementById('cropFrame');
  var cropImage = document.getElementById('cropImage');
  var cropPreview = document.getElementById('cropPreview');
  var cropWidthInput = document.getElementById('cropWidth');
  var cropRatioSelect = document.getElementById('cropRatio');
  var cropQuality = document.getElementById('cropQuality');
  var cropQualityLabel = document.getElementById('cropQualityLabel');
  var cropApply = document.getElementById('cropApply');
  var cropClose = document.getElementById('cropClose');
  var cropBox = null;
  var selectedFile = null;
  var uploadCallback = null;
  var uploadFolder = 'galeri';

  function openUploadModal(folder, callback) {
    uploadFolder = folder || 'galeri';
    uploadCallback = callback || null;
    imageInput.value = '';
    imageInput.click();
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function getImageRect() {
    var rect = cropImage.getBoundingClientRect();
    var frameRect = cropFrame.getBoundingClientRect();
    return { left: rect.left - frameRect.left, top: rect.top - frameRect.top, width: rect.width, height: rect.height };
  }

  function createCropBox() {
    if (cropBox) cropBox.remove();
    cropBox = document.createElement('div');
    cropBox.className = 'crop-box';
    cropFrame.appendChild(cropBox);
    cropBox.appendChild(document.createElement('div'));
  }

  function fitBoxToRatio(ratio) {
    var imgRect = getImageRect();
    var w = imgRect.width * 0.8;
    var h = ratio > 0 ? w / ratio : imgRect.height * 0.8;
    if (h > imgRect.height * 0.8) { h = imgRect.height * 0.8; w = ratio > 0 ? h * ratio : w; }
    var x = imgRect.left + (imgRect.width - w) / 2;
    var y = imgRect.top + (imgRect.height - h) / 2;
    cropBox.style.left = x + 'px'; cropBox.style.top = y + 'px';
    cropBox.style.width = w + 'px'; cropBox.style.height = h + 'px';
  }

  function setupCropDrag() {
    if (!cropBox) return;
    var startX = 0, startY = 0, startLeft = 0, startTop = 0, startW = 0, startH = 0, mode = null;
    var imgRect, ratio;
    function onDown(event) {
      var t = event.target;
      ratio = parseFloat(cropRatioSelect.value) || 0;
      imgRect = getImageRect();
      if (t === cropBox.lastElementChild) {
        mode = 'resize'; startX = event.clientX; startY = event.clientY;
        startW = cropBox.offsetWidth; startH = cropBox.offsetHeight;
        startLeft = cropBox.offsetLeft; startTop = cropBox.offsetTop;
      } else if (t === cropBox || cropBox.contains(t)) {
        mode = 'move'; startX = event.clientX; startY = event.clientY;
        startLeft = cropBox.offsetLeft; startTop = cropBox.offsetTop;
        startW = cropBox.offsetWidth; startH = cropBox.offsetHeight;
      }
      if (mode) { event.preventDefault(); document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); }
    }
    function onMove(event) {
      if (!mode) return;
      var dx = event.clientX - startX; var dy = event.clientY - startY;
      var boxLeft = clamp(startLeft + dx, imgRect.left, imgRect.right - 20);
      var boxTop = clamp(startTop + dy, imgRect.top, imgRect.bottom - 20);
      var boxW = clamp(startW + dx, 20, imgRect.width);
      var boxH = clamp(startH + dy, 20, imgRect.height);
      if (mode === 'move') {
        if (ratio > 0) { boxLeft = clamp(boxLeft, imgRect.left, imgRect.right - startW); boxTop = clamp(boxTop, imgRect.top, imgRect.bottom - startH); }
        cropBox.style.left = boxLeft + 'px'; cropBox.style.top = boxTop + 'px';
      } else {
        var w2 = boxW; var h2 = boxH;
        if (ratio > 0) {
          if (Math.abs(dx) >= Math.abs(dy)) { w2 = boxW; h2 = w2 / ratio; } else { h2 = boxH; w2 = h2 * ratio; }
          if (w2 > imgRect.right - startLeft) { w2 = imgRect.right - startLeft; h2 = w2 / ratio; }
          if (h2 > imgRect.bottom - startTop) { h2 = imgRect.bottom - startTop; w2 = h2 * ratio; }
        }
        cropBox.style.left = startLeft + 'px'; cropBox.style.top = startTop + 'px';
        cropBox.style.width = w2 + 'px'; cropBox.style.height = h2 + 'px';
      }
      updatePreview();
    }
    function onUp() { mode = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    cropFrame.addEventListener('mousedown', onDown);
  }

  var cropState = null;

  function updatePreview() {
    if (!cropBox || !cropImage.src) return;
    var ratio = parseFloat(cropRatioSelect.value) || 0;
    var outWidth = Math.max(16, Math.min(parseInt(cropWidthInput.value, 10) || 800, 4096));
    var b = cropBox.getBoundingClientRect();
    var imgRectAbs = cropImage.getBoundingClientRect();
    var sx = (b.left - imgRectAbs.left) / imgRectAbs.width * cropImage.naturalWidth;
    var sy = (b.top - imgRectAbs.top) / imgRectAbs.height * cropImage.naturalHeight;
    var sw = b.width / imgRectAbs.width * cropImage.naturalWidth;
    var sh = b.height / imgRectAbs.height * cropImage.naturalHeight;
    var outHeight = ratio > 0 ? Math.round(outWidth / ratio) : Math.round(outWidth * sh / sw);
    var preview = cropPreview.getContext('2d');
    var pW = Math.max(16, Math.min(outWidth, 1280)); var pH = Math.max(16, Math.min(outHeight, 1280));
    cropPreview.width = pW; cropPreview.height = pH;
    preview.imageSmoothingQuality = 'high';
    preview.drawImage(cropImage, sx, sy, sw, sh, 0, 0, pW, pH);
    cropState = { sx: sx, sy: sy, sw: sw, sh: sh };
  }

  function setupCrop(img) {
    cropImage.src = img.src;
    cropImage.dataset.nw = img.naturalWidth; cropImage.dataset.nh = img.naturalHeight;
    var scale = Math.min(1, 900 / img.naturalWidth);
    cropImage.style.width = Math.round(img.naturalWidth * scale) + 'px'; cropImage.style.height = 'auto';
    createCropBox(); fitBoxToRatio(parseFloat(cropRatioSelect.value) || 0); setupCropDrag(); updatePreview();
  }

  function resetCropState() {
    if (cropBox) { cropBox.remove(); cropBox = null; }
    cropState = null;
    cropImage.removeAttribute('src'); cropImage.removeAttribute('data-nw'); cropImage.removeAttribute('data-nh');
    cropPreview.getContext('2d').clearRect(0, 0, cropPreview.width, cropPreview.height);
  }

  imageInput.addEventListener('change', function () {
    var file = imageInput.files && imageInput.files[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setMessage('Format tidak didukung. Gunakan PNG, JPG, atau WEBP.', true); imageInput.value = ''; return; }
    if (file.size > 25 * 1024 * 1024) { setMessage('Ukuran gambar maksimal 25 MB.', true); imageInput.value = ''; return; }
    selectedFile = file;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () { setupCrop(img); cropDialog.showModal(); };
      img.onerror = function () { setMessage('Gambar tidak dapat dibaca.', true); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  cropWidthInput.addEventListener('input', updatePreview);
  cropRatioSelect.addEventListener('change', function () { fitBoxToRatio(parseFloat(cropRatioSelect.value) || 0); setupCropDrag(); updatePreview(); });
  cropQuality.addEventListener('input', function () { cropQualityLabel.textContent = Math.round(parseFloat(cropQuality.value) * 100) + '%'; });

  cropApply.addEventListener('click', function () {
    if (!cropState || !cropState.sw) { setMessage('Silakan atur area potong terlebih dahulu.', true); return; }
    var ratio = parseFloat(cropRatioSelect.value) || 0;
    var outWidth = Math.max(16, Math.min(parseInt(cropWidthInput.value, 10) || 800, 4096));
    var outHeight = ratio > 0 ? Math.round(outWidth / ratio) : Math.round(outWidth * cropState.sh / cropState.sw);
    var canvas = document.createElement('canvas'); canvas.width = outWidth; canvas.height = outHeight;
    var ctx = canvas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cropImage, cropState.sx, cropState.sy, cropState.sw, cropState.sh, 0, 0, outWidth, outHeight);
    var quality = parseFloat(cropQuality.value) || 0.82;
    var dataUrl = canvas.toDataURL('image/webp', quality);
    var fileName = (selectedFile && selectedFile.name) || 'gambar';
    cropApply.disabled = true; cropApply.textContent = 'Mengunggah…';
    fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: uploadFolder, name: fileName, dataUrl: dataUrl }) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error);
        cropDialog.close(); resetCropState(); imageInput.value = ''; selectedFile = null;
        setMessage('Gambar berhasil diunggah.');
        if (uploadCallback) { var cb = uploadCallback; uploadCallback = null; cb(data.url); }
      })
      .catch(function (err) { setMessage(err.message || 'Gagal mengunggah gambar.', true); })
      .finally(function () { cropApply.disabled = false; cropApply.textContent = 'Simpan WebP'; });
  });

  cropClose.addEventListener('click', function () { cropDialog.close(); resetCropState(); imageInput.value = ''; selectedFile = null; uploadCallback = null; });
  cropDialog.addEventListener('click', function (event) { if (event.target === cropDialog) { cropDialog.close(); resetCropState(); imageInput.value = ''; selectedFile = null; uploadCallback = null; } });

  // ==========================================
  // 8. Hero & Galeri — slot management
  // ==========================================
  var gallerySlotDefs = [
    { key: 'learning', label: 'Kegiatan Belajar Mengajar' },
    { key: 'ceremony', label: 'Upacara Bendera' },
    { key: 'scouts', label: 'Ekstrakurikuler Pramuka' },
    { key: 'achievements', label: 'Lomba & Prestasi' },
    { key: 'environment', label: 'Lingkungan Sekolah' },
    { key: 'specialDay', label: 'Hari Istimewa' }
  ];

  function saveImagePath(pathKey, url, onDone) {
    var parts = pathKey.split('.');
    var target = current.site.content.images;
    parts.slice(0, -1).forEach(function (p) { target = target[p] = target[p] || {}; });
    target[parts[parts.length - 1]] = url;
    fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current.site) })
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.ok) { if (onDone) onDone(); } else { setMessage(data.error || 'Gagal menyimpan foto.', true); } })
      .catch(function () { setMessage('Gagal menyimpan foto.', true); });
  }

  function buildSlotCard(key, label, imgUrl, folder, pathKey, info) {
    var card = document.createElement('div');
    card.className = 'gallery-slot-card' + (imgUrl ? ' has-img' : '');
    var preview = document.createElement('div');
    preview.className = 'gallery-slot-preview';
    if (imgUrl) preview.style.backgroundImage = 'url("' + String(imgUrl).replace(/"/g, '%22') + '")';
    var meta = document.createElement('div'); meta.className = 'gallery-slot-meta';
    var lbl = document.createElement('span'); lbl.className = 'gallery-slot-label'; lbl.textContent = label;
    var actions = document.createElement('div'); actions.className = 'gallery-slot-actions';
    var upBtn = document.createElement('button'); upBtn.type = 'button'; upBtn.className = 'admin-add';
    upBtn.textContent = imgUrl ? 'Ganti foto' : '+ Upload foto';
    upBtn.addEventListener('click', function () {
      openUploadModal(folder, function (url) {
        saveImagePath(pathKey, url, function () { if (pathKey === 'hero') renderHeroSlot(); else renderGallerySlots(); });
      });
    });
    actions.appendChild(upBtn);
    if (imgUrl) {
      var delBtn = document.createElement('button'); delBtn.type = 'button'; delBtn.className = 'admin-remove'; delBtn.textContent = 'Hapus foto';
      delBtn.addEventListener('click', function () {
        if (!confirm('Hapus foto dari slot "' + label + '"?')) return;
        saveImagePath(pathKey, '', function () { if (pathKey === 'hero') renderHeroSlot(); else renderGallerySlots(); });
      });
      actions.appendChild(delBtn);
    }
    meta.append(lbl, actions);
    card.append(preview, meta);
    if (pathKey !== 'hero') {
      var infoFields = document.createElement('div');
      infoFields.className = 'gallery-slot-info';
      var titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.name = 'galleryTitle';
      titleInput.placeholder = 'Judul tampilan';
      titleInput.value = (info && info.title) || '';
      var detailInput = document.createElement('textarea');
      detailInput.name = 'galleryDetail';
      detailInput.placeholder = 'Keterangan tampilan';
      detailInput.rows = 2;
      detailInput.value = (info && info.detail) || '';
      var infoLabel = document.createElement('div');
      infoLabel.className = 'gallery-info-label';
      infoLabel.textContent = 'Judul & keterangan (tampil di website)';
      infoFields.append(infoLabel, titleInput, detailInput);
      card.appendChild(infoFields);
    }
    return card;
  }

  function renderHeroSlot() {
    var container = document.getElementById('heroSlotContainer');
    if (!container || !current) return;
    container.replaceChildren();
    var heroUrl = (current.site.content.images && current.site.content.images.hero) || '';
    container.appendChild(buildSlotCard('hero', 'Foto Hero Beranda (rasio 16:9, min. 1600×900 px)', heroUrl, 'profil', 'hero'));
  }

  function renderGallerySlots() {
    var grid = document.getElementById('gallerySlotGrid');
    if (!grid || !current) return;
    grid.replaceChildren();
    var gallery = (current.site.content.images && current.site.content.images.gallery) || {};
    var galleryInfo = (current.site.content && current.site.content.galleryInfo) || {};
    gallerySlotDefs.forEach(function (slot) {
      grid.appendChild(buildSlotCard(slot.key, slot.label, gallery[slot.key] || '', 'galeri', 'gallery.' + slot.key, galleryInfo[slot.key]));
    });
  }
})();
