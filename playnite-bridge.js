(function () {
  const bridgeOrigin = "http://127.0.0.1:32145";
  const launcherNames = {
    playnite: "Playnite",
    epic: "Epic Games",
    ea: "EA app",
    gog: "GOG",
    ubisoft: "Ubisoft Connect",
    battlenet: "Battle.net"
  };

  const playniteButton = document.querySelector("[data-source=playnite]");
  const playniteStatus = document.getElementById("playniteStatus") ||
    playniteButton?.closest(".source-card")?.querySelector(".status-pill");

  if (playniteStatus) {
    playniteStatus.id = "playniteStatus";
    updateStatus(false);
  }

  function updateStatus(connected) {
    if (!playniteStatus) return;
    playniteStatus.textContent = connected ? "Connected" : "Open Playnite";
    playniteStatus.classList.toggle("connected", connected);
  }

  function bridgeGame(record) {
    const features = record.features || record.Features || [];
    const featureNames = Array.isArray(features)
      ? features.map(value => String(value).toLowerCase())
      : [];
    const hasSolo = featureNames.some(value => value.includes("single") || value.includes("solo"));
    const hasMulti = featureNames.some(value => value.includes("multi") || value.includes("co-op") || value.includes("coop"));
    const social = hasSolo && hasMulti ? "either" : hasMulti ? "multiplayer" : hasSolo ? "solo" : undefined;

    return {
      name: record.name || record.Name,
      source: record.source || record.Source || "Playnite",
      installed: record.installed ?? record.Installed,
      playtime: record.playtime || record.Playtime || 0,
      playCount: record.playCount || record.PlayCount || 0,
      favorite: record.favorite ?? record.Favorite,
      genres: record.genres || record.Genres || [],
      features,
      platforms: record.platforms || record.Platforms || [],
      tags: record.tags || record.Tags || [],
      social
    };
  }

  function instructions(source) {
    const launcher = launcherNames[source] || "Playnite";
    const launcherStep = source === "playnite"
      ? "Connect the launchers you use inside Playnite. Authentication stays in Playnite's official or community integrations."
      : `Add Playnite's ${launcher} library integration and complete its login inside Playnite.`;

    return `
      <div class="instruction-list">
        <div class="instruction"><span class="instruction-num">1</span><div><strong>Prepare Playnite</strong><span>${launcherStep}</span></div></div>
        <div class="instruction"><span class="instruction-num">2</span><div><strong>Install extension version 0.4 or newer</strong><span>Download the Playnite extension, open the .pext file with Playnite, and restart Playnite once. This version lets the website ask Windows to open Playnite.</span></div></div>
        <div class="instruction"><span class="instruction-num">3</span><div><strong>Connect this tab</strong><span>Choose Connect now. If Playnite is closed, your browser may ask permission to open it. The site waits while Playnite starts, imports the library, then closes the handoff window.</span></div></div>
      </div>
      <a class="btn secondary full" href="https://playnite.link/download/PlayniteInstaller.exe">Download Playnite launcher</a>
      <a class="btn secondary full" href="downloads/WhatShouldIPlayBridge.pext" download style="margin-top:10px">Download Playnite extension</a>
      <a class="btn full" id="connectPlayniteBridge" href="wsip-playnite://launch" style="margin-top:10px">Connect now</a>
      <div class="privacy-box" id="playniteConnectionHelp">The extension provides read-only game metadata at 127.0.0.1. It does not expose launcher passwords, cookies, tokens, install paths, or Playnite database IDs.</div>
      <div class="privacy-box">The connected library stays in this tab's memory only. Closing or clearing the session removes it. The separate CSV and JSON cards are available only for files you maintain yourself.</div>`;
  }

  function openBridge(source) {
    activeSource = source;
    const launcher = launcherNames[source] || "Playnite";
    document.getElementById("drawerTitle").textContent = source === "playnite"
      ? "Connect with Playnite"
      : `Load ${launcher} through Playnite`;
    document.getElementById("drawerIntro").textContent = source === "playnite"
      ? "Read your unified Playnite library directly through a private localhost connection."
      : `${launcher} does not expose a general public library API. Playnite can connect locally and pass its game list to this tab.`;
    document.getElementById("drawerContent").innerHTML = instructions(source);
    document.getElementById("connectPlayniteBridge")?.addEventListener("click", connect);
    sourceDrawer.classList.remove("hidden");
  }

  function connect(event) {
    const button = document.getElementById("connectPlayniteBridge");
    const help = document.getElementById("playniteConnectionHelp");
    const originalLabel = button?.textContent || "Connect now";
    if (button?.dataset.connecting === "true") {
      event?.preventDefault();
      return;
    }
    if (button) {
      button.dataset.connecting = "true";
      button.setAttribute("aria-disabled", "true");
      button.textContent = "Opening Playnite...";
    }

    const nonce = makeNonce();
    const bridgeUrl = `${bridgeOrigin}/v1/connect?nonce=${encodeURIComponent(nonce)}&origin=${encodeURIComponent(window.location.origin)}`;
    const popup = window.open(
      bridgeUrl,
      "wsipPlayniteBridge",
      "popup,width=560,height=420"
    );
    if (!popup) {
      if (help) {
        help.innerHTML = "<strong>The connection window was blocked.</strong><br>Playnite may still open. Allow popups for this site, then choose Connect now again to import the library.";
      }
      if (button) {
        delete button.dataset.connecting;
        button.removeAttribute("aria-disabled");
        button.textContent = originalLabel;
      }
      showToast("Allow the Playnite connection window");
      return;
    }

    if (help) {
      help.innerHTML = "<strong>Opening Playnite and waiting for the extension.</strong><br>Your browser may ask permission to open Playnite. The local handoff will retry automatically.";
    }

    let finished = false;
    const retry = window.setInterval(() => {
      if (!finished && !popup.closed) {
        try {
          popup.location.href = `${bridgeUrl}&retry=${Date.now()}`;
        } catch {
          // The opener is still allowed to navigate its popup across origins.
        }
      }
    }, 1800);
    const timeout = window.setTimeout(() => {
      finish(false, "Playnite did not become ready. Install extension version 0.4 or newer, allow the browser to open Playnite, and try again.");
    }, 30000);

    function finish(success, message) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      window.clearInterval(retry);
      window.removeEventListener("message", receive);
      if (!popup.closed) popup.close();
      if (button) {
        delete button.dataset.connecting;
        button.removeAttribute("aria-disabled");
        button.textContent = originalLabel;
      }
      if (!success && help) {
        help.innerHTML = `<strong>Could not complete the Playnite handoff.</strong><br>${message}`;
      }
      if (!success) showToast("Playnite connection was not completed");
    }

    function receive(event) {
      if (event.origin !== bridgeOrigin ||
          event.source !== popup ||
          event.data?.type !== "wsip-playnite-library" ||
          event.data?.nonce !== nonce) {
        return;
      }

      try {
        const payload = event.data.payload;
        const records = payload.games || payload.Games;
        if (!Array.isArray(records)) throw new Error("Bridge returned no games array");

        const games = records
          .map(record => normalizeGame(bridgeGame(record), "Playnite"))
          .filter(game => game.name);
        const count = addGames(games);
        state.playniteConnected = true;
        updateStatus(true);
        renderAll();
        sourceDrawer.classList.add("hidden");
        navigate("library");
        showToast(count
          ? `${count} Playnite game${count === 1 ? "" : "s"} connected`
          : `Playnite connected; ${records.length} games already loaded`);
        finish(true);
      } catch {
        finish(false, "Playnite answered, but its library data could not be read.");
      }
    }

    window.addEventListener("message", receive);
  }

  function makeNonce() {
    if (crypto.randomUUID) {
      return crypto.randomUUID().replaceAll("-", "");
    }

    const bytes = crypto.getRandomValues(new Uint8Array(24));
    return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  }

  document.addEventListener("click", event => {
    const sourceButton = event.target.closest("[data-source]");
    const source = sourceButton?.dataset.source;
    if (source && launcherNames[source]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openBridge(source);
      return;
    }

    if (event.target.closest("#clearSessionBtn, #mobileClearSession")) {
      setTimeout(() => updateStatus(false), 0);
    }
  }, true);
})();
