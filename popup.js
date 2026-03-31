document.addEventListener('DOMContentLoaded', () => {
  const ext = typeof browser !== 'undefined' ? browser : chrome;

  const checkboxes = ['hideDuration', 'replaceImages'];

  ext.storage.local.get({ hideDuration: true, replaceImages: true }).then
    ? ext.storage.local.get({ hideDuration: true, replaceImages: true }).then((settings) => {
        for (const id of checkboxes) {
          document.getElementById(id).checked = settings[id];
        }
      })
    : ext.storage.local.get({ hideDuration: true, replaceImages: true }, (settings) => {
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