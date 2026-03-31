// Orion (iOS) uses browser.* — fall back to it if chrome.* is unavailable
const ext = typeof chrome !== 'undefined' ? chrome : browser;

const THUMB_URL =
  'https://wwwimage-intl.pplusstatic.com/thumbnails/photos/w370-q80/channel/UFC-FightNight-Generic-2026-THMB-Main-Eng_sw49n.jpg?format=webp';

let currentSettings = { hideDuration: true, replaceImages: true };

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

function modifyPage() {
  // --- Duration labels (no UFC/page restrictions) ---
  document.querySelectorAll('[itemprop="duration"], span.duration[data-ci="duration"]').forEach((el) => {
    el.style.display = currentSettings.hideDuration ? 'none' : '';
  });

  // --- Thumbnails (only on UFC pages, never on homepage) ---
  if (shouldReplaceImages()) {
    document.querySelectorAll('.thumb-wrapper img.thumb').forEach((img) => {
      if (img.src !== THUMB_URL) img.src = THUMB_URL;
      if (img.dataset.src && img.dataset.src !== THUMB_URL) img.dataset.src = THUMB_URL;
    });
  }
}

// Load settings then run; fall back to defaults (both true) if not yet saved
ext.storage.local.get({ hideDuration: true, replaceImages: true }, (settings) => {
  currentSettings = settings;
  modifyPage();
});

// React to settings changes made in the popup without needing a page reload
ext.storage.onChanged.addListener((changes) => {
  if (changes.hideDuration) currentSettings.hideDuration = changes.hideDuration.newValue;
  if (changes.replaceImages) currentSettings.replaceImages = changes.replaceImages.newValue;
  modifyPage();
});

// Re-run on dynamic DOM changes with debounce to avoid performance issues
let debounceTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(modifyPage, 10);
});

observer.observe(document.body, { childList: true, subtree: true });
