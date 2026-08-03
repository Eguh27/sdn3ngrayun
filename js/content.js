(function () {
  'use strict';
  function get(object, key) {
    return key.split('.').reduce(function (value, part) { return value && value[part]; }, object);
  }
  function achievementCard(item, featured) {
    var article = document.createElement('article');
    article.className = 'achievement-card' + (featured ? ' feature' : '');
    var meta = document.createElement('div');
    meta.className = 'achievement-meta';
    var year = document.createElement('span'); year.textContent = item.year || '-';
    var level = document.createElement('span'); level.textContent = item.level || '-';
    meta.append(year, level);
    var title = document.createElement('h2'); title.textContent = item.title || 'Prestasi sekolah';
    var description = document.createElement('p'); description.textContent = item.description || '';
    var category = document.createElement('strong'); category.textContent = item.category || 'Prestasi';
    article.append(meta, title, description, category);
    return article;
  }
  function achievementPreview(item) {
    var row = document.createElement('div');
    row.className = 'prestasi-item';
    var meta = document.createElement('div');
    meta.className = 'prestasi-year';
    meta.append(document.createTextNode(item.year || '-'));
    var level = document.createElement('span');
    level.className = 'badge';
    level.textContent = item.level || 'Prestasi';
    meta.appendChild(level);
    var copy = document.createElement('p');
    copy.textContent = item.title || item.description || 'Prestasi sekolah';
    row.append(meta, copy);
    return row;
  }
  function yearValue(item) {
    var match = String(item.year || '').match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }
  function levelValue(item) {
    var level = String(item.level || '').toLowerCase();
    if (level.includes('internasional')) return 5;
    if (level.includes('nasional')) return 4;
    if (level.includes('provinsi')) return 3;
    if (level.includes('kabupaten') || level.includes('kota')) return 2;
    if (level.includes('kecamatan')) return 1;
    return 0;
  }
  function featuredAchievements(items) {
    return items.slice().sort(function (a, b) {
      var yearDifference = yearValue(b) - yearValue(a);
      if (yearDifference) return yearDifference;
      return levelValue(b) - levelValue(a);
    }).slice(0, 3);
  }
  function extracurricularCard(item, index, detail) {
    var card = document.createElement(detail ? 'article' : 'div');
    card.className = detail ? 'detail-card' : 'ekskul-card';
    if (detail) {
      var number = document.createElement('span');
      number.className = 'detail-index';
      number.textContent = String(index + 1).padStart(2, '0');
      var icon = document.createElement('div');
      icon.className = 'detail-icon';
      icon.textContent = item.icon || '•';
      card.append(number, icon);
    } else {
      var summaryIcon = document.createElement('div');
      summaryIcon.className = 'ekskul-ic';
      summaryIcon.textContent = item.icon || '•';
      card.appendChild(summaryIcon);
    }
    var title = document.createElement(detail ? 'h2' : 'h4');
    title.textContent = item.title || 'Ekstrakurikuler';
    var description = document.createElement('p');
    description.textContent = detail ? (item.description || item.summary || '') : (item.summary || item.description || '');
    card.append(title, description);
    if (detail && Array.isArray(item.details) && item.details.length) {
      var list = document.createElement('dl');
      item.details.forEach(function (itemDetail) {
        var row = document.createElement('div');
        var label = document.createElement('dt'); label.textContent = itemDetail.label || '';
        var value = document.createElement('dd'); value.textContent = itemDetail.value || '';
        row.append(label, value);
        list.appendChild(row);
      });
      card.appendChild(list);
    }
    return card;
  }
  function newsCard(item, index) {
    var article = document.createElement('article'); article.className = 'news-card';
    var date = document.createElement('span'); date.className = 'news-date'; date.textContent = item.date || 'Berita sekolah';
    var title = document.createElement('h3'); title.textContent = item.title || 'Berita sekolah';
    var excerpt = document.createElement('p'); excerpt.textContent = item.excerpt || '';
    article.append(date, title, excerpt);
    var hasDetail = item.body && item.body.trim();
    if (hasDetail) { var link = document.createElement('a'); link.href = '/berita?id=' + index; link.textContent = 'Baca selengkapnya →'; article.appendChild(link); }
    else if (item.url) { var link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Baca selengkapnya →'; article.appendChild(link); }
    return article;
  }
  function youtubeEmbed(url) {
    try {
      var parsed = new URL(url);
      var id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : (parsed.searchParams.get('v') || (parsed.pathname.match(/\/embed\/([^/?]+)/) || [])[1]);
      return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/' + id : '';
    } catch (error) { return ''; }
  }
  function videoCard(item) {
    var article = document.createElement('article'); article.className = 'video-card';
    var embed = youtubeEmbed(item.url || '');
    if (embed) { var frame = document.createElement('iframe'); frame.src = embed; frame.title = item.title || 'Video SDN 3 Ngrayun'; frame.loading = 'lazy'; frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin'; article.appendChild(frame); }
    var copy = document.createElement('div'); var title = document.createElement('h3'); title.textContent = item.title || 'Video sekolah'; var description = document.createElement('p'); description.textContent = item.description || ''; copy.append(title, description); article.appendChild(copy);
    return article;
  }
  function staffCard(item) {
    var card = document.createElement('div');
    card.className = 'staff-card';
    var photo = document.createElement('div');
    photo.className = 'staff-photo';
    if (item.photo) {
      photo.style.backgroundImage = 'url("' + String(item.photo).replace(/"/g, '%22') + '")';
      photo.classList.add('has-photo');
    } else {
      photo.textContent = '—';
    }
    var name = document.createElement('b');
    name.textContent = item.name || 'Nama Guru';
    var role = document.createElement('span');
    role.textContent = item.role || 'Tenaga Kependidikan';
    card.append(photo, name, role);
    return card;
  }
  function applyGalleryInfo(info, content) {
    var gallery = content && content.content && content.content.galleryInfo;
    if (!gallery) return;
    document.querySelectorAll('[data-gallery-key]').forEach(function (element) {
      var key = element.getAttribute('data-gallery-key');
      var meta = gallery[key] || {};
      if (meta.title) element.setAttribute('data-card-title', meta.title);
      if (meta.detail) element.setAttribute('data-card-detail', meta.detail);
      var span = element.querySelector('span');
      if (span && meta.title) span.textContent = meta.title;
      if (meta.title) element.setAttribute('aria-label', 'Buka detail ' + meta.title);
    });
  }
  Promise.all(['/api/content', '/api/prestasi', '/api/ekstrakurikuler', '/api/news', '/api/videos'].map(function (url) {
    return fetch(url).then(function (response) { return response.ok ? response.json() : Promise.reject(); });
  }))
    .then(function (data) {
      var content = { school: data[0].school, content: data[0].content, prestasi: data[1], extracurricular: data[2], news: data[3], videos: data[4] };
      document.querySelectorAll('[data-content]').forEach(function (element) {
        var value = get(content, element.getAttribute('data-content'));
        if (value !== undefined && value !== '') element.textContent = value;
      });
      document.querySelectorAll('[data-image]').forEach(function (element) {
        var imageUrl = get(content, element.getAttribute('data-image'));
        if (!imageUrl) return;
        element.style.backgroundImage = 'url("' + String(imageUrl).replace(/"/g, '%22') + '")';
        element.classList.add('has-image');
      });
      document.querySelectorAll('[data-principal-photo]').forEach(function (element) {
        var photo = get(content, 'school.principalPhoto');
        if (!photo) return;
        element.style.backgroundImage = 'url("' + String(photo).replace(/"/g, '%22') + '")';
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.classList.add('has-photo');
        element.textContent = '';
      });
      document.querySelectorAll('[data-staff]').forEach(function (element) {
        var items = get(content, 'school.staff');
        if (!Array.isArray(items) || !items.length) return;
        element.replaceChildren();
        items.forEach(function (item) { element.appendChild(staffCard(item)); });
      });
      applyGalleryInfo(null, content);
      document.querySelectorAll('[data-achievements]').forEach(function (element) {
        var items = get(content, element.getAttribute('data-achievements'));
        if (!Array.isArray(items) || !items.length) return;
        element.replaceChildren();
        items.forEach(function (item, index) { element.appendChild(achievementCard(item, index === 0)); });
      });
      document.querySelectorAll('[data-achievement-preview]').forEach(function (element) {
        var items = get(content, element.getAttribute('data-achievement-preview'));
        if (!Array.isArray(items) || !items.length) return;
        element.replaceChildren();
        featuredAchievements(items).forEach(function (item) { element.appendChild(achievementPreview(item)); });
      });
      document.querySelectorAll('[data-extracurricular-grid]').forEach(function (element) {
        var items = content.extracurricular && content.extracurricular.items;
        if (!Array.isArray(items) || !items.length) return;
        var detail = element.getAttribute('data-extracurricular-grid') === 'detail';
        element.replaceChildren();
        items.forEach(function (item, index) { element.appendChild(extracurricularCard(item, index, detail)); });
      });
      document.querySelectorAll('[data-missions]').forEach(function (element) {
        var missions = content.school && content.school.missions;
        if (!Array.isArray(missions) || !missions.length) return;
        element.replaceChildren();
        missions.forEach(function (text, index) {
          var li = document.createElement('li');
          var num = document.createElement('span'); num.className = 'misi-num'; num.textContent = String(index + 1).padStart(2, '0');
          var p = document.createElement('p'); p.textContent = text;
          li.append(num, p); element.appendChild(li);
        });
      });
      document.querySelectorAll('[data-news]').forEach(function (element) { var items = content.news && content.news.items; if (Array.isArray(items) && items.length) { element.replaceChildren(); items.forEach(function (item, index) { element.appendChild(newsCard(item, index)); }); } });
      document.querySelectorAll('[data-videos]').forEach(function (element) { var items = content.videos && content.videos.items; if (Array.isArray(items) && items.length) { element.replaceChildren(); items.forEach(function (item) { element.appendChild(videoCard(item)); }); } });
      document.querySelectorAll('[data-channel-link]').forEach(function (element) { if (content.videos && content.videos.channelUrl) { element.href = content.videos.channelUrl; element.hidden = false; } });
      if (content.school && content.school.name) document.title = document.title.replace('SDN 3 Ngrayun', content.school.name);
    })
    .catch(function () { /* Website masih menampilkan konten bawaan jika server/API tidak aktif. */ });
})();
