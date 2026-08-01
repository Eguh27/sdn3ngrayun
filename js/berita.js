(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var articleId = params.has('id') ? parseInt(params.get('id'), 10) : -1;

  function authorInitials(name) {
    return String(name || 'P').split(' ').slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase() || 'P';
  }

  function renderBodyText(text) {
    var wrap = document.createDocumentFragment();
    String(text || '').split(/\n{2,}/).forEach(function (para) {
      para = para.trim();
      if (!para) return;
      var p = document.createElement('p');
      p.textContent = para;
      wrap.appendChild(p);
    });
    return wrap;
  }

  function renderDetail(item) {
    document.title = (item.title || 'Berita') + ' — SDN 3 Ngrayun';

    var eyebrow = document.getElementById('heroEyebrow');
    var heroMeta = document.getElementById('heroMeta');
    var heroTitle = document.getElementById('heroTitle');
    var heroDesc = document.getElementById('heroDesc');
    if (eyebrow) eyebrow.textContent = 'Artikel berita';
    if (heroMeta) { heroMeta.textContent = item.date || ''; heroMeta.hidden = !item.date; }
    if (heroTitle) heroTitle.textContent = item.title || 'Berita Sekolah';
    if (heroDesc) { heroDesc.textContent = item.subtitle || ''; heroDesc.hidden = !item.subtitle; }

    var main = document.getElementById('beritaContent');
    main.innerHTML = '';

    // Back link
    var back = document.createElement('a');
    back.href = '/berita';
    back.className = 'berita-back';
    back.textContent = '← Semua berita';
    main.appendChild(back);

    var article = document.createElement('article');
    article.className = 'berita-article';

    // Hero image
    if (item.image) {
      var imgWrap = document.createElement('div');
      imgWrap.className = 'berita-img';
      imgWrap.style.backgroundImage = 'url("' + String(item.image).replace(/"/g, '%22') + '")';
      if (item.imageSource) {
        var srcLabel = document.createElement('span');
        srcLabel.className = 'berita-img-source';
        srcLabel.textContent = 'Sumber foto: ' + item.imageSource;
        imgWrap.appendChild(srcLabel);
      }
      article.appendChild(imgWrap);
    }

    var body = document.createElement('div');
    body.className = 'berita-content';

    // Author
    if (item.author && item.author.name) {
      var authorEl = document.createElement('div');
      authorEl.className = 'berita-author';
      var avatar = document.createElement('div');
      avatar.className = 'berita-author-avatar';
      avatar.textContent = authorInitials(item.author.name);
      var info = document.createElement('div');
      info.className = 'berita-author-info';
      var nameEl = document.createElement('strong');
      nameEl.textContent = item.author.name;
      var roleEl = document.createElement('span');
      roleEl.textContent = item.author.role || 'Kontributor';
      if (item.date) {
        var dateEl = document.createElement('time');
        dateEl.textContent = item.date;
        info.append(nameEl, roleEl, dateEl);
      } else {
        info.append(nameEl, roleEl);
      }
      authorEl.append(avatar, info);
      body.appendChild(authorEl);
    }

    // Body text
    if (item.body && item.body.trim()) {
      var bodyWrap = document.createElement('div');
      bodyWrap.className = 'berita-body';
      bodyWrap.appendChild(renderBodyText(item.body));
      body.appendChild(bodyWrap);
    }

    // External link if present
    if (item.url) {
      var extLink = document.createElement('a');
      extLink.href = item.url;
      extLink.target = '_blank';
      extLink.rel = 'noopener';
      extLink.className = 'berita-ext-link';
      extLink.textContent = 'Buka sumber asli ↗';
      body.appendChild(extLink);
    }

    article.appendChild(body);
    main.appendChild(article);
  }

  function renderList(items) {
    var heroTitle = document.getElementById('heroTitle');
    var heroDesc = document.getElementById('heroDesc');
    var heroMeta = document.getElementById('heroMeta');
    if (heroTitle) heroTitle.textContent = 'Berita SDN 3 Ngrayun';
    if (heroDesc) { heroDesc.textContent = 'Pengumuman, kegiatan, dan cerita terbaru dari SDN 3 Ngrayun.'; heroDesc.hidden = false; }
    if (heroMeta) heroMeta.hidden = true;

    var main = document.getElementById('beritaContent');
    main.innerHTML = '';

    if (!items || !items.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-content';
      empty.textContent = 'Belum ada berita yang dipublikasikan.';
      main.appendChild(empty);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'news-list-grid';

    items.forEach(function (item, index) {
      var card = document.createElement('article');
      card.className = 'news-list-card';

      var hasDetail = item.body && item.body.trim();
      var linkTarget = hasDetail ? ('/berita?id=' + index) : (item.url || '');
      var isExternal = !hasDetail && Boolean(item.url);

      if (item.image) {
        var imgEl = document.createElement('div');
        imgEl.className = 'news-list-img';
        imgEl.style.backgroundImage = 'url("' + String(item.image).replace(/"/g, '%22') + '")';
        if (linkTarget) {
          var imgLink = document.createElement('a');
          imgLink.href = linkTarget;
          if (isExternal) { imgLink.target = '_blank'; imgLink.rel = 'noopener'; }
          imgLink.appendChild(imgEl);
          card.appendChild(imgLink);
        } else {
          card.appendChild(imgEl);
        }
      }

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'news-list-body';

      var dateMeta = document.createElement('span');
      dateMeta.className = 'news-date';
      dateMeta.textContent = item.date || '';

      var title = document.createElement('h2');
      title.className = 'news-list-title';
      if (linkTarget) {
        var titleLink = document.createElement('a');
        titleLink.href = linkTarget;
        if (isExternal) { titleLink.target = '_blank'; titleLink.rel = 'noopener'; }
        titleLink.textContent = item.title || 'Berita sekolah';
        title.appendChild(titleLink);
      } else {
        title.textContent = item.title || 'Berita sekolah';
      }

      if (item.subtitle) {
        var sub = document.createElement('p');
        sub.className = 'news-list-subtitle';
        sub.textContent = item.subtitle;
        bodyDiv.append(dateMeta, title, sub);
      } else {
        bodyDiv.append(dateMeta, title);
      }

      if (item.excerpt) {
        var excerpt = document.createElement('p');
        excerpt.className = 'news-list-excerpt';
        excerpt.textContent = item.excerpt;
        bodyDiv.appendChild(excerpt);
      }

      if (item.author && item.author.name) {
        var authorRow = document.createElement('div');
        authorRow.className = 'news-list-author';
        var av = document.createElement('div');
        av.className = 'news-list-avatar';
        av.textContent = authorInitials(item.author.name);
        var authorName = document.createElement('span');
        authorName.textContent = item.author.name + (item.author.role ? ' · ' + item.author.role : '');
        authorRow.append(av, authorName);
        bodyDiv.appendChild(authorRow);
      }

      if (linkTarget) {
        var readLink = document.createElement('a');
        readLink.className = 'news-read-link';
        readLink.href = linkTarget;
        if (isExternal) { readLink.target = '_blank'; readLink.rel = 'noopener'; readLink.textContent = 'Baca di sumber asli ↗'; }
        else { readLink.textContent = 'Baca selengkapnya →'; }
        bodyDiv.appendChild(readLink);
      }

      card.appendChild(bodyDiv);
      grid.appendChild(card);
    });

    main.appendChild(grid);
  }

  fetch('/api/news')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      var items = data.items || [];
      if (articleId >= 0 && articleId < items.length) {
        renderDetail(items[articleId]);
      } else {
        if (articleId >= 0) history.replaceState(null, '', '/berita');
        renderList(items);
      }
    })
    .catch(function () {
      var main = document.getElementById('beritaContent');
      if (main) main.innerHTML = '<p class="empty-content">Berita tidak dapat dimuat. Pastikan server berjalan.</p>';
    });
})();
