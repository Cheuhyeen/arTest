let isPlaying = false;
let markerFound = false;

const video       = document.getElementById('ar-video');
const btnPlay     = document.getElementById('btn-play');
const panel       = document.getElementById('control-panel');
const scanWrap    = document.getElementById('scan-wrap');
const statusText  = document.getElementById('status-text');
const toast       = document.getElementById('toast');
const badge       = document.getElementById('video-end-badge');
const orderModal  = document.getElementById('order-modal');
const infoModal   = document.getElementById('info-modal');

// ── Toast ──────────────────────────────────────────
function showToast(msg, ms = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), ms);
}

// ── Size selector ──────────────────────────────────
function selectSize(el) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ── Video ended → reveal Order button ─────────────
video.addEventListener('ended', () => {
  document.getElementById('btn-order').classList.add('revealed');
  badge.style.display = 'block';
  setTimeout(() => { badge.style.display = 'none'; }, 4000);
  showToast('🎬 วิดีโอจบแล้ว!');
  isPlaying = false;
  btnPlay.textContent = '▶';
});

// ── Splash → Launch AR ─────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('splash').classList.add('hidden');
  const scene = document.getElementById('ar-scene');
  scene.style.display = 'block';

  const tryStart = () => {
    const mindar = scene.systems['mindar-image-system'];
    if (mindar) { mindar.start(); }
    else { setTimeout(tryStart, 200); }
  };

  scene.hasLoaded ? tryStart() : scene.addEventListener('loaded', tryStart, { once: true });
  showToast('📷 กล้องเปิดแล้ว — ชี้ที่รูป "ถูกปาก คนไทย"');
});

// ── Marker found / lost ────────────────────────────
document.querySelector('[mindar-image-target]').addEventListener('targetFound', () => {
  if (markerFound) return;
  markerFound = true;
  statusText.textContent = 'พบ marker ✓';
  scanWrap.classList.add('hidden');
  panel.classList.add('visible');
  showToast('✦ Collection โหลดแล้ว!');
  video.play().then(() => { isPlaying = true; btnPlay.textContent = '⏸'; }).catch(() => {});
});

document.querySelector('[mindar-image-target]').addEventListener('targetLost', () => {
  markerFound = false;
  statusText.textContent = 'Scanning…';
  scanWrap.classList.remove('hidden');
  panel.classList.remove('visible');
  video.pause(); isPlaying = false; btnPlay.textContent = '▶';
});

// ── Play / Pause ───────────────────────────────────
btnPlay.addEventListener('click', () => {
  if (isPlaying) {
    video.pause(); isPlaying = false; btnPlay.textContent = '▶'; showToast('⏸ หยุดชั่วคราว');
  } else {
    video.play().then(() => { isPlaying = true; btnPlay.textContent = '⏸'; showToast('▶ กำลังเล่น'); }).catch(() => {});
  }
});

// ── Order modal ────────────────────────────────────
document.getElementById('btn-order').addEventListener('click', () => orderModal.classList.add('open'));
document.getElementById('order-close-btn').addEventListener('click', () => orderModal.classList.remove('open'));
orderModal.addEventListener('click', e => { if (e.target === orderModal) orderModal.classList.remove('open'); });

// ── Info modal ─────────────────────────────────────
document.getElementById('btn-info').addEventListener('click', () => infoModal.classList.add('open'));
document.getElementById('info-close-btn').addEventListener('click', () => infoModal.classList.remove('open'));
infoModal.addEventListener('click', e => { if (e.target === infoModal) infoModal.classList.remove('open'); });

// ── Submit order ───────────────────────────────────
function submitOrder() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();
  if (!name || !phone || !address) { showToast('⚠ กรุณากรอกข้อมูลให้ครบ'); return; }
  orderModal.classList.remove('open');
  setTimeout(() => document.getElementById('success-overlay').classList.add('show'), 300);
}

// ── Prevent scroll on AR ───────────────────────────
document.body.addEventListener('touchmove', e => {
  if (!e.target.closest('.modal-sheet')) e.preventDefault();
}, { passive: false });