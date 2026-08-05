(function () {
  'use strict';
  if (!('HTMLDialogElement' in window)) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'detail-modal';
  dialog.setAttribute('aria-labelledby', 'detailModalTitle');
  dialog.innerHTML = '<div class="detail-modal-visual" aria-hidden="true"></div><div class="detail-modal-copy"><button class="detail-modal-close" type="button" aria-label="Tutup detail">×</button><span class="detail-modal-label">Dokumentasi sekolah</span><h2 id="detailModalTitle"></h2><p></p><span class="detail-modal-hint">Ketuk di luar kartu untuk menutup</span></div>';
  document.body.appendChild(dialog);

  var visual = dialog.querySelector('.detail-modal-visual');
  var title = dialog.querySelector('h2');
  var description = dialog.querySelector('p');
  var closeButton = dialog.querySelector('.detail-modal-close');
  var openedBy;

  function open(card) {
    openedBy = card;
    var style = window.getComputedStyle(card);
    visual.style.background = style.background;
    visual.style.backgroundImage = style.backgroundImage;
    visual.style.backgroundSize = style.backgroundSize;
    visual.style.backgroundPosition = style.backgroundPosition;
    title.textContent = card.getAttribute('data-card-title') || 'Dokumentasi sekolah';
    description.textContent = card.getAttribute('data-card-detail') || '';
    dialog.showModal();
    closeButton.focus();
  }

  // Event delegation: works for static AND dynamically-added cards.
  document.addEventListener('click', function (event) {
    var card = event.target.closest('[data-detail-card]');
    if (card) open(card);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var target = event.target;
    if (!target || target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    if (target.closest('[data-detail-card]')) {
      event.preventDefault();
      open(target.closest('[data-detail-card]'));
    }
  });
  closeButton.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { if (openedBy) openedBy.focus(); });
})();
