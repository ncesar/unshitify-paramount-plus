# Paramount UI Cleaner

A browser extension (Manifest V3) that cleans up the Paramount+ interface:

- Hides all episode/video **duration labels** (`[itemprop="duration"]` and `span.duration[data-ci="duration"]`)
- Replaces all **thumbnail images** inside `.thumb-wrapper img.thumb` with a fixed UFC image

Works on **Chrome**, **Edge**, **Brave**, **Kiwi Browser (Android)**, and **Orion Browser (iOS)**.

---

## Installation

### Chrome / Edge / Brave (desktop)

1. Download or clone this repository.
2. Open your browser and navigate to `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the root folder of this repository (the folder containing `manifest.json`).
6. The extension is now active. Navigate to `paramountplus.com` to see it in action.

---

### Orion Browser (iOS / iPadOS)

Orion supports WebExtensions natively on iOS/iPadOS.

1. **Build the zip** (see [Build section](#build--zip) below) or download the pre-built `paramount-ui-cleaner.zip`.
2. Transfer the `.zip` file to your iPhone/iPad (AirDrop, Files app, or iCloud Drive).
3. Open **Orion** browser.
4. Tap the **menu** (three-dot or share icon) → **Settings** → **Extensions**.
5. Tap **Add Extension** and choose the `.zip` file from Files.
6. Confirm installation. The extension will be listed under installed extensions.

> Orion uses the same WebExtension APIs as Chrome, so no code changes are needed.

---

### Kiwi Browser (Android)

Kiwi Browser supports loading unpacked Chrome extensions directly from a `.zip`.

1. **Build the zip** (see [Build section](#build--zip) below) or download the pre-built `paramount-ui-cleaner.zip`.
2. Transfer the `.zip` to your Android device.
3. Open **Kiwi Browser**.
4. Tap the **menu** (three-dot icon, top-right) → **Extensions**.
5. Enable **Developer mode**.
6. Tap **Load** (or **+** icon) and navigate to the `.zip` file.
7. The extension will be installed and active on `paramountplus.com`.

---

## Build / Zip

Requires Node.js and a Unix shell (macOS/Linux) or WSL on Windows.

```bash
# Generate icon files (only needed once, or after deleting the icons/ folder)
npm run generate-icons

# Package the extension into a distributable zip
npm run build
# → produces paramount-ui-cleaner.zip
```

The zip file contains everything needed for sideloading: `manifest.json`, `content.js`, `styles.css`, and `icons/`.

---

## File Structure

```
├── manifest.json          # Extension manifest (Manifest V3)
├── content.js             # Content script — DOM modifications + MutationObserver
├── styles.css             # CSS to hide duration elements immediately on load
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── generate-icons.js  # Node script to regenerate PNG icons
├── package.json
├── .gitignore
└── README.md
```

---

## How it works

The content script runs at `document_idle` on every `*.paramountplus.com` page.

1. `modifyPage()` is called immediately on load to hide duration labels and swap thumbnails.
2. A `MutationObserver` watches `document.body` for dynamic DOM changes (infinite scroll, SPA navigation) and calls `modifyPage()` again with a 10 ms debounce to avoid performance issues.
3. `styles.css` provides a CSS-level hide of duration elements as an instant first pass before the JS runs.
