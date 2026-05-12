// Orion (iOS) uses browser.* — fall back to it if chrome.* is unavailable
const ext = typeof chrome !== 'undefined' ? chrome : browser;

const THUMB_URL =
  'https://wwwimage-intl.pplusstatic.com/thumbnails/photos/w370-q80/channel/UFC-FightNight-Generic-2026-THMB-Main-Eng_sw49n.jpg?format=webp';

let currentSettings = { hideDuration: true, replaceImages: true, hideControls: false, keyboardControls: false };
let keyboardListenersActive = false;
let cachedPlayer = null;

const controlsStyle = document.createElement('style');
controlsStyle.textContent =
  'html.hide-player-controls .controls-manager { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }';
document.head.appendChild(controlsStyle);

function isHomePage() {
  const p = window.location.pathname.replace(/\/$/, '') || '/';
  return p === '/home' || p === '';
}

function pageHasUFC() {
  return document.body.textContent.includes('UFC');
}

function shouldReplaceImages() {
  return currentSettings.replaceImages && !isHomePage() && pageHasUFC();
}

function getPlayer() {
  const v = document.querySelector('video');
  if (v) cachedPlayer = v;
  return cachedPlayer;
}

function shouldIgnoreKeyboard() {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function killEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function onKeyDown(e) {
  if (shouldIgnoreKeyboard()) return;
  const video = getPlayer();
  if (!video) return;

  if (e.code === 'Space') {
    killEvent(e);
    if (e.repeat) return;
    if (video.paused) video.play(); else video.pause();
  }

  if (e.key === 'ArrowRight') {
    killEvent(e);
    video.currentTime += 10;
  }

  if (e.key === 'ArrowLeft') {
    killEvent(e);
    video.currentTime -= 10;
  }
}

function onKeyUp(e) {
  if (e.code === 'Space' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    killEvent(e);
  }
}

function addKeyboardListeners() {
  if (keyboardListenersActive) return;
  keyboardListenersActive = true;
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
}

function removeKeyboardListeners() {
  if (!keyboardListenersActive) return;
  keyboardListenersActive = false;
  window.removeEventListener('keydown', onKeyDown, true);
  window.removeEventListener('keyup', onKeyUp, true);
}

function modifyPage() {
  // --- Duration labels ---
  document.querySelectorAll('[itemprop="duration"], span.duration[data-ci="duration"]').forEach((el) => {
    el.style.display = currentSettings.hideDuration ? 'none' : '';
  });

  // --- Thumbnails ---
  if (shouldReplaceImages()) {
    document.querySelectorAll('.thumb-wrapper img.thumb').forEach((img) => {
      if (img.src !== THUMB_URL) img.src = THUMB_URL;
      if (img.dataset.src && img.dataset.src !== THUMB_URL) img.dataset.src = THUMB_URL;
    });
  }

  // --- Player controls visibility ---
  document.documentElement.classList.toggle('hide-player-controls', currentSettings.hideControls);

  // --- Keyboard shortcuts ---
  if (currentSettings.keyboardControls) {
    addKeyboardListeners();
  } else {
    removeKeyboardListeners();
  }
}

ext.storage.local.get({ hideDuration: true, replaceImages: true, hideControls: false, keyboardControls: false }, (settings) => {
  currentSettings = settings;
  modifyPage();
});

ext.storage.onChanged.addListener((changes) => {
  if (changes.hideDuration) currentSettings.hideDuration = changes.hideDuration.newValue;
  if (changes.replaceImages) currentSettings.replaceImages = changes.replaceImages.newValue;
  if (changes.hideControls) currentSettings.hideControls = changes.hideControls.newValue;
  if (changes.keyboardControls) currentSettings.keyboardControls = changes.keyboardControls.newValue;
  modifyPage();
});

let debounceTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(modifyPage, 10);
});

observer.observe(document.body, { childList: true, subtree: true });
