# What Should I Play? Bridge

This Playnite generic plugin exposes a read-only, local-only copy of the current
Playnite library to the What Should I Play? website.

## Privacy and security

- Listens only on `127.0.0.1:32145`.
- Accepts browser requests only from the published GitHub Pages site, the
  previous Netlify site, and the local development origins listed in
  `LocalBridgeServer.cs`.
- Exposes game metadata only. It does not expose launcher credentials, cookies,
  tokens, install paths, or Playnite's database IDs.
- Provides no write, launch, install, or uninstall endpoints.
- Does not persist or upload library data.
- Registers `wsip-playnite://launch` for the website's **Connect now** link.
  The protocol accepts no arguments and can only start Playnite Desktop.

## Build

```powershell
dotnet restore
dotnet build -c Release --no-restore
```

Package the files from `bin\Release` into a ZIP archive and rename it with a
`.pext` extension. The package must contain `extension.yaml` and
`WhatShouldIPlayBridge.dll` at its root.

## Development install

In Playnite Desktop:

1. Open `Settings`.
2. Open `For developers`.
3. Add the project's `bin\Release` directory under external extensions.
4. Restart Playnite.

The bridge starts and stops with Playnite.
