const checkboxes = ['hideDuration', 'replaceImages'];

// Load saved settings (both default to true on first use)
chrome.storage.local.get({ hideDuration: true, replaceImages: true }, (settings) => {
  for (const id of checkboxes) {
    document.getElementById(id).checked = settings[id];
  }
});

// Persist each checkbox change and show reload notice

for (const id of checkboxes) {
  document.getElementById(id).addEventListener('change', (e) => {
    chrome.storage.local.set({ [id]: e.target.checked });
  });
}
