document.addEventListener('DOMContentLoaded', () => {
  const ext = typeof browser !== 'undefined' ? browser : chrome;

  const checkboxes = ['hideDuration', 'replaceImages', 'hideControls', 'keyboardControls'];
  const defaults = { hideDuration: true, replaceImages: true, hideControls: false, keyboardControls: false };

  ext.storage.local.get(defaults).then
    ? ext.storage.local.get(defaults).then((settings) => {
        for (const id of checkboxes) {
          document.getElementById(id).checked = settings[id];
        }
      })
    : ext.storage.local.get(defaults, (settings) => {
        for (const id of checkboxes) {
          document.getElementById(id).checked = settings[id];
        }
      });

  const reloadNotice = document.getElementById('reloadNotice');

  for (const id of checkboxes) {
    document.getElementById(id).addEventListener('change', (e) => {
      ext.storage.local.set({ [id]: e.target.checked });
      reloadNotice.classList.add('visible');
    });
  }
});