// Orion (iOS) uses browser.* — fall back to it if chrome.* is unavailable
const ext = typeof chrome !== 'undefined' ? chrome : browser;

const THUMB_URL =
  'https://wwwimage-intl.pplusstatic.com/thumbnails/photos/w370-q80/channel/UFC-FightNight-Generic-2026-THMB-Main-Eng_sw49n.jpg?format=webp';

let currentSettings = { hideDuration: true, replaceImages: true };

function modifyPage() {
  // --- Duration labels ---
  document.querySelectorAll('[itemprop="duration"], span.duration[data-ci="duration"]').forEach((el) => {
    el.style.display = currentSettings.hideDuration ? 'none' : '';
  });

  // --- Thumbnails ---
  document.querySelectorAll('.thumb-wrapper img.thumb').forEach((img) => {
    if (currentSettings.replaceImages) {
      // Save original src before first replacement so we can restore later
      if (!img.dataset.origSrc) img.dataset.origSrc = img.src;
      if (img.dataset.src && !img.dataset.origDataSrc) img.dataset.origDataSrc = img.dataset.src;

      if (img.src !== THUMB_URL) img.src = THUMB_URL;
      if (img.dataset.src && img.dataset.src !== THUMB_URL) img.dataset.src = THUMB_URL;
    } else {
      // Restore originals if available
      if (img.dataset.origSrc) {
        img.src = img.dataset.origSrc;
        delete img.dataset.origSrc;
      }
      if (img.dataset.origDataSrc) {
        img.dataset.src = img.dataset.origDataSrc;
        delete img.dataset.origDataSrc;
      }
    }
  });
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
