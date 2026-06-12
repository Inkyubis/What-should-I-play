# What Should I Play?

A privacy-first game recommendation site. Load your game library for the current
browser session, answer a short mood and time quiz, and receive one explainable
recommendation.

## Live site

https://inkyubis.github.io/What-should-I-play/

## Playnite companion

The recommended connection method is the included Playnite generic plugin:

1. Install Playnite from https://playnite.link/download/PlayniteInstaller.exe.
2. Download extension version 0.4 or newer from
   `downloads/WhatShouldIPlayBridge.pext` on the site or repository.
3. Open the extension file with Playnite and restart Playnite.
4. Choose **Connect now** on the website. If Playnite is closed, the browser asks
   Windows to open it through the extension's narrow `wsip-playnite://` protocol.
5. Approve the browser's **Open Playnite** prompt if it appears. The site retries
   while Playnite starts, then the local handoff window closes automatically.

The plugin exposes a read-only endpoint at `127.0.0.1:32145`. It returns game
names, launcher sources, installed state, play history, genres, features,
platforms, categories, tags, favorites, and release years. It does not expose
launcher credentials, cookies, tokens, installation paths, or Playnite database
IDs.

The source is in `playnite-extension/`. CSV and JSON import remain available for
files users maintain themselves; Playnite does not need to export a file.

## Privacy

- No user accounts
- No cloud database
- No browser local storage
- Library data and answers remain in the current tab's memory
- The companion listens only on the local loopback interface
- The companion accepts requests only from the published site and listed local
  development origins
- Closing or clearing the browser session removes the loaded library and answers

## Development

Serve the repository root with any static web server. The Playnite plugin targets
.NET Framework 4.6.2 and references the official Playnite SDK NuGet package.

```powershell
cd playnite-extension
dotnet restore
dotnet build -c Release --no-restore
```

The static site is deployed from this repository by the GitHub Pages workflow in
`.github/workflows/pages.yml`.
