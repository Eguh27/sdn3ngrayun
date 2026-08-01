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
  var logoutButton = document.getElementById('logoutButton');
  var imageGuide = document.getElementById('imageGuide');
  var current;

  var imageSlots = [
    { key: 'hero', label: 'Beranda — foto utama / hero' },
    { key: 'views.front', label: 'Profil — tampak depan sekolah' },
    { key: 'views.left', label: 'Profil — sisi kiri / halaman' },
    { key: 'views.right', label: 'Profil — sisi kanan / lingkungan' },
    { key: 'gallery.learning', label: 'Album — kegiatan belajar' },
    { key: 'gallery.ceremony', label: 'Album — upacara bendera' },
    { key: 'gallery.scouts', label: 'Album — pramuka' },
    { key: 'gallery.achievements', label: 'Album — lomba & prestasi' },
    { key: 'gallery.environment', label: 'Album — lingkungan sekolah' },
    { key: 'gallery.specialDay', label: 'Album — hari istimewa' }
  ];
  var folderGuide = {
    profil: 'Untuk foto bangunan: pilih slot Beranda atau salah satu tampak sekolah di Profil.',
    galeri: 'Untuk dokumentasi kegiatan: pilih kategori album yang sesuai setelah mengunggah.',
    ekskul: 'Arsip ekstrakurikuler. Foto masih dapat dipasang ke slot album jika relevan.',
    prestasi: 'Arsip lomba dan prestasi. Gunakan slot Album — lomba & prestasi untuk menampilkannya.'
  };

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
    renderAchievements(current.prestasi.achievements || []);
    renderNews(current.news.items || []);
    renderVideos(current.videos.items || []);
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
    var card = document.createElement('fieldset'); card.className = 'achievement-editor'; card.dataset.label = 'Berita';
    var top = document.createElement('div'); top.className = 'achievement-editor-top';
    var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'admin-remove'; remove.textContent = 'Hapus'; remove.addEventListener('click', function () { card.remove(); }); top.appendChild(remove);
    var fields = document.createElement('div'); fields.className = 'admin-fields';
    fields.append(field('Tanggal', 'date', item.date), field('Judul berita', 'title', item.title), field('Ringkasan', 'excerpt', item.excerpt, true), field('Tautan berita lengkap (opsional)', 'url', item.url)); fields.children[2].classList.add('full'); fields.children[3].classList.add('full');
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
    Object.keys(current.site.school).forEach(function (key) {
      var field = form.elements[key];
      if (field) current.site.school[key] = field.value.trim();
    });
    current.site.content = current.site.content || {};
    current.site.content.albumTitle = form.elements.albumTitle.value.trim();
    current.extracurricular.title = form.elements.extracurricularTitle.value.trim();
    current.prestasi.title = form.elements.achievementTitle.value.trim();
    current.news.items = Array.prototype.map.call(newsFields.querySelectorAll('.achievement-editor'), function (card) { return { date: card.elements.date.value.trim(), title: card.elements.title.value.trim(), excerpt: card.elements.excerpt.value.trim(), url: card.elements.url.value.trim() }; }).filter(function (item) { return item.title; });
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
  logoutButton.addEventListener('click', function () {
    fetch('/api/admin/logout', { method: 'POST' }).finally(function () { window.location.assign('/admin'); });
  });

  // ==========================================
  // 7. Kelola Gambar — Crop & Auto-Convert WebP
  // ==========================================
  var imageFolder = document.getElementById('imageFolder');
  var imageInput = document.getElementById('imageInput');
  var imageGrid = document.getElementById('imageGrid');
  var imageEmpty = document.getElementById('imageEmpty');
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

  function setImageMessage(text, error) {
    imageEmpty.textContent = text;
    imageEmpty.classList.toggle('error', Boolean(error));
  }

  function imageValue(key) {
    if (!current || !current.site || !current.site.content || !current.site.content.images) return '';
    return key.split('.').reduce(function (value, part) { return value && value[part]; }, current.site.content.images);
  }

  function setImageValue(key, value) {
    var parts = key.split('.');
    var target = current.site.content.images;
    parts.slice(0, -1).forEach(function (part) { target[part] = target[part] || {}; target = target[part]; });
    target[parts[parts.length - 1]] = value;
  }

  function imageSlotSelect(url) {
    var select = document.createElement('select');
    select.className = 'img-slot-select';
    var empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Pasang sebagai…';
    select.appendChild(empty);
    imageSlots.forEach(function (slot) {
      var option = document.createElement('option');
      option.value = slot.key; option.textContent = slot.label;
      if (imageValue(slot.key) === url) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  function saveImagePlacement(slot, url, button) {
    setImageValue(slot, url);
    if (button) { button.disabled = true; button.textContent = 'Memasang…'; }
    fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current.site) })
      .then(function (response) { return response.json().then(function (data) { if (!response.ok) throw new Error(data.error); }); })
      .then(function () { setImageMessage('Foto sudah dipasang: ' + imageSlots.find(function (item) { return item.key === slot; }).label + '.'); loadImages(); })
      .catch(function (error) { setImageMessage(error.message || 'Gagal memasang foto.', true); })
      .finally(function () { if (button) { button.disabled = false; button.textContent = 'Pasang'; } });
  }

  function imageCard(item) {
    var card = document.createElement('div');
    card.className = 'img-card';
    var img = document.createElement('img');
    img.src = item.url;
    img.loading = 'lazy';
    img.alt = item.name;
    card.appendChild(img);
    var meta = document.createElement('div');
    meta.className = 'img-meta';
    var name = document.createElement('span'); name.textContent = item.name; name.title = item.name;
    meta.appendChild(name);
    var actions = document.createElement('div');
    actions.className = 'img-actions';
    var placement = document.createElement('div');
    placement.className = 'img-placement';
    var slotSelect = imageSlotSelect(item.url);
    var assign = document.createElement('button'); assign.type = 'button'; assign.textContent = 'Pasang';
    assign.addEventListener('click', function (event) {
      event.stopPropagation();
      if (!slotSelect.value) return setImageMessage('Pilih dulu lokasi tampil foto ini.', true);
      saveImagePlacement(slotSelect.value, item.url, assign);
    });
    placement.append(slotSelect, assign);
    var copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Salin URL';
    copy.addEventListener('click', function (event) {
      event.stopPropagation();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.url).then(function () {
          copy.textContent = 'Tersalin!';
          setTimeout(function () { copy.textContent = 'Salin URL'; }, 1500);
        });
      } else {
        copy.textContent = item.url;
      }
    });
    var del = document.createElement('button'); del.type = 'button'; del.className = 'admin-remove'; del.textContent = 'Hapus';
    del.addEventListener('click', function (event) {
      event.stopPropagation();
      if (!window.confirm('Hapus gambar ' + item.name + '?')) return;
      fetch('/api/image/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: imageFolder.value, name: item.name }) })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error);
          loadImages();
        })
        .catch(function (error) { setImageMessage(error.message || 'Gagal menghapus gambar.', true); });
    });
    actions.append(copy, del);
    meta.append(placement, actions);
    card.appendChild(meta);
    return card;
  }

  function loadImages() {
    var folder = imageFolder.value;
    imageGuide.textContent = folderGuide[folder] || '';
    fetch('/api/images?folder=' + encodeURIComponent(folder))
      .then(function (response) { return response.json(); })
      .then(function (data) {
        imageGrid.replaceChildren();
        if (!data.files || !data.files.length) {
          imageEmpty.style.display = 'block';
          setImageMessage('Belum ada gambar di folder ini. Klik "+ Pilih Gambar" untuk mengunggah.');
          return;
        }
        imageEmpty.style.display = 'none';
        data.files.forEach(function (item) { imageGrid.appendChild(imageCard(item)); });
      })
      .catch(function () { setImageMessage('Gagal memuat daftar gambar.', true); });
  }

  imageFolder.addEventListener('change', loadImages);

  // ---------- Crop box overlay ----------
  function createCropBox() {
    if (cropBox) cropBox.remove();
    cropBox = document.createElement('div');
    cropBox.className = 'crop-box';
    cropFrame.appendChild(cropBox);
    cropBox.appendChild(document.createElement('div')); // handle SE
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function getImageRect() {
    var rect = cropImage.getBoundingClientRect();
    var frameRect = cropFrame.getBoundingClientRect();
    return {
      left: rect.left - frameRect.left,
      top: rect.top - frameRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function fitBoxToRatio(ratio) {
    var imgRect = getImageRect();
    var w = imgRect.width * 0.8;
    var h = ratio > 0 ? w / ratio : imgRect.height * 0.8;
    if (h > imgRect.height * 0.8) { h = imgRect.height * 0.8; w = ratio > 0 ? h * ratio : w; }
    var x = imgRect.left + (imgRect.width - w) / 2;
    var y = imgRect.top + (imgRect.height - h) / 2;
    cropBox.style.left = x + 'px';
    cropBox.style.top = y + 'px';
    cropBox.style.width = w + 'px';
    cropBox.style.height = h + 'px';
  }

  function applyCropBox() {
    var ratio = parseFloat(cropRatioSelect.value) || 0;
    var imgRect = getImageRect();
    if (!cropBox) return;
    var b = cropBox.getBoundingClientRect();
    var frameRect = cropFrame.getBoundingClientRect();
    var left = clamp(b.left - frameRect.left, imgRect.left, imgRect.left + imgRect.width - 20);
    var top = clamp(b.top - frameRect.top, imgRect.top, imgRect.top + imgRect.height - 20);
    var width = clamp(b.width, 20, imgRect.right - (frameRect.left + left));
    var height = clamp(b.height, 20, imgRect.bottom - (frameRect.top + top));
    if (ratio > 0) {
      var maxW = imgRect.width;
      var maxH = imgRect.height;
      var w2 = width, h2 = w2 / ratio;
      if (h2 > maxH) { h2 = maxH; w2 = h2 * ratio; }
      if (w2 > maxW) { w2 = maxW; h2 = w2 / ratio; }
      width = w2; height = h2;
      left = clamp(left, imgRect.left, imgRect.right - width);
      top = clamp(top, imgRect.top, imgRect.bottom - height);
    }
    cropBox.style.left = left + 'px';
    cropBox.style.top = top + 'px';
    cropBox.style.width = width + 'px';
    cropBox.style.height = height + 'px';
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
        mode = 'resize';
        startX = event.clientX; startY = event.clientY;
        startW = cropBox.offsetWidth; startH = cropBox.offsetHeight;
        startLeft = cropBox.offsetLeft; startTop = cropBox.offsetTop;
      } else if (t === cropBox || cropBox.contains(t)) {
        mode = 'move';
        startX = event.clientX; startY = event.clientY;
        startLeft = cropBox.offsetLeft; startTop = cropBox.offsetTop;
        startW = cropBox.offsetWidth; startH = cropBox.offsetHeight;
      }
      if (mode) {
        event.preventDefault();
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      }
    }

    function onMove(event) {
      if (!mode) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      var boxLeft = clamp(startLeft + dx, imgRect.left, imgRect.right - 20);
      var boxTop = clamp(startTop + dy, imgRect.top, imgRect.bottom - 20);
      var boxW = clamp(startW + dx, 20, imgRect.width);
      var boxH = clamp(startH + dy, 20, imgRect.height);
      if (mode === 'move') {
        if (ratio > 0) {
          boxLeft = clamp(boxLeft, imgRect.left, imgRect.right - startW);
          boxTop = clamp(boxTop, imgRect.top, imgRect.bottom - startH);
        }
        cropBox.style.left = boxLeft + 'px';
        cropBox.style.top = boxTop + 'px';
      } else {
        var w2 = boxW;
        var h2 = boxH;
        if (ratio > 0) {
          if (Math.abs(dx) >= Math.abs(dy)) { w2 = boxW; h2 = w2 / ratio; } else { h2 = boxH; w2 = h2 * ratio; }
          if (w2 > imgRect.right - startLeft) { w2 = imgRect.right - startLeft; h2 = w2 / ratio; }
          if (h2 > imgRect.bottom - startTop) { h2 = imgRect.bottom - startTop; w2 = h2 * ratio; }
        }
        cropBox.style.left = startLeft + 'px';
        cropBox.style.top = startTop + 'px';
        cropBox.style.width = w2 + 'px';
        cropBox.style.height = h2 + 'px';
      }
      updatePreview();
    }

    function onUp() {
      mode = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    cropFrame.addEventListener('mousedown', onDown);
  }

  function updatePreview() {
    if (!cropBox || !cropImage.src) return;
    var ratio = parseFloat(cropRatioSelect.value) || 0;
    var outWidth = Math.max(16, Math.min(parseInt(cropWidthInput.value, 10) || 800, 4096));
    var b = cropBox.getBoundingClientRect();
    var imgRect = getImageRect();
    var imgRectAbs = cropImage.getBoundingClientRect();
    var sx = (b.left - imgRectAbs.left) / imgRectAbs.width * cropImage.naturalWidth;
    var sy = (b.top - imgRectAbs.top) / imgRectAbs.height * cropImage.naturalHeight;
    var sw = b.width / imgRectAbs.width * cropImage.naturalWidth;
    var sh = b.height / imgRectAbs.height * cropImage.naturalHeight;
    var outHeight = ratio > 0 ? Math.round(outWidth / ratio) : Math.round(outWidth * sh / sw);
    var preview = cropPreview.getContext('2d');
    var pW = Math.max(16, Math.min(outWidth, 1280));
    var pH = Math.max(16, Math.min(outHeight, 1280));
    cropPreview.width = pW; cropPreview.height = pH;
    preview.imageSmoothingQuality = 'high';
    preview.drawImage(cropImage, sx, sy, sw, sh, 0, 0, pW, pH);
    // Simpan koordinat crop untuk dipakai saat apply
    cropState = { sx: sx, sy: sy, sw: sw, sh: sh };
  }

  var cropState = null;

  function setupCrop(img) {
    cropImage.src = img.src;
    cropImage.dataset.nw = img.naturalWidth;
    cropImage.dataset.nh = img.naturalHeight;
    var maxW = 900;
    var scale = Math.min(1, maxW / img.naturalWidth);
    cropImage.style.width = Math.round(img.naturalWidth * scale) + 'px';
    cropImage.style.height = 'auto';
    createCropBox();
    fitBoxToRatio(parseFloat(cropRatioSelect.value) || 0);
    setupCropDrag();
    updatePreview();
  }

  function resetCropState() {
    if (cropBox) { cropBox.remove(); cropBox = null; }
    cropState = null;
    cropImage.removeAttribute('src');
    cropImage.removeAttribute('data-nw');
    cropImage.removeAttribute('data-nh');
    cropPreview.getContext('2d').clearRect(0, 0, cropPreview.width, cropPreview.height);
  }

  imageInput.addEventListener('change', function () {
    var file = imageInput.files && imageInput.files[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setImageMessage('Format tidak didukung. Gunakan PNG, JPG, atau WEBP.', true);
      imageInput.value = '';
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setImageMessage('Ukuran gambar maksimal 25 MB.', true);
      imageInput.value = '';
      return;
    }
    selectedFile = file;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        setupCrop(img);
        cropDialog.showModal();
      };
      img.onerror = function () { setImageMessage('Gambar tidak dapat dibaca.', true); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  cropWidthInput.addEventListener('input', updatePreview);
  cropRatioSelect.addEventListener('change', function () {
    fitBoxToRatio(parseFloat(cropRatioSelect.value) || 0);
    setupCropDrag();
    updatePreview();
  });
  cropQuality.addEventListener('input', function () {
    cropQualityLabel.textContent = Math.round(parseFloat(cropQuality.value) * 100) + '%';
  });

  cropApply.addEventListener('click', function () {
    if (!cropState || !cropState.sw) {
      setImageMessage('Silakan atur area potong terlebih dahulu.', true);
      return;
    }
    var ratio = parseFloat(cropRatioSelect.value) || 0;
    var outWidth = Math.max(16, Math.min(parseInt(cropWidthInput.value, 10) || 800, 4096));
    var outHeight = ratio > 0 ? Math.round(outWidth / ratio) : Math.round(outWidth * cropState.sh / cropState.sw);
    var canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cropImage, cropState.sx, cropState.sy, cropState.sw, cropState.sh, 0, 0, outWidth, outHeight);
    var quality = parseFloat(cropQuality.value) || 0.82;
    var fileName = (selectedFile && selectedFile.name) || 'gambar';
    var dataUrl = canvas.toDataURL('image/webp', quality);
    cropApply.disabled = true;
    cropApply.textContent = 'Mengunggah…';
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: imageFolder.value, name: fileName, dataUrl: dataUrl })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error);
        cropDialog.close();
        resetCropState();
        imageInput.value = '';
        selectedFile = null;
        loadImages();
        setImageMessage('Gambar berhasil diunggah sebagai WebP.');
      })
      .catch(function (error) {
        setImageMessage(error.message || 'Gagal mengunggah gambar.', true);
      })
      .finally(function () {
        cropApply.disabled = false;
        cropApply.textContent = 'Simpan WebP';
      });
  });

  cropClose.addEventListener('click', function () {
    cropDialog.close();
    resetCropState();
    imageInput.value = '';
    selectedFile = null;
  });
  cropDialog.addEventListener('click', function (event) {
    if (event.target === cropDialog) {
      cropDialog.close();
      resetCropState();
      imageInput.value = '';
      selectedFile = null;
    }
  });

  loadImages();
})();
