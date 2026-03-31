// Orion (iOS) uses browser.* — fall back to it if chrome.* is unavailable
const ext = typeof chrome !== 'undefined' ? chrome : browser;

const checkboxes = ['hideDuration', 'replaceImages'];

// Load saved settings (both default to true on first use)
ext.storage.local.get({ hideDuration: true, replaceImages: true }, (settings) => {
  for (const id of checkboxes) {
    document.getElementById(id).checked = settings[id];
  }
});

// Persist each checkbox change and show reload notice
const reloadNotice = document.getElementById('reloadNotice');

for (const id of checkboxes) {
  document.getElementById(id).addEventListener('change', (e) => {
    ext.storage.local.set({ [id]: e.target.checked });
    reloadNotice.classList.add('visible');
  });
}
