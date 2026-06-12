    const knownGameMetadata = [
      { name: "Hades", installed: true, genres: ["action", "roguelike"], moods: ["intense", "focused"], time: ["quick", "medium"], energy: ["medium", "high"], social: "solo", challenge: "medium", story: "some", pace: "fast", commitment: "low" },
      { name: "Stardew Valley", installed: true, genres: ["simulation", "cozy"], moods: ["relaxed", "creative"], time: ["quick", "medium", "long"], energy: ["low", "medium"], social: "either", challenge: "easy", story: "some", pace: "slow", commitment: "medium" },
      { name: "Baldur's Gate 3", installed: false, genres: ["rpg", "strategy"], moods: ["immersive", "social"], time: ["long"], energy: ["medium", "high"], social: "either", challenge: "medium", story: "heavy", pace: "slow", commitment: "high" },
      { name: "Deep Rock Galactic", installed: true, genres: ["shooter", "action"], moods: ["social", "intense"], time: ["medium"], energy: ["medium", "high"], social: "multiplayer", challenge: "medium", story: "light", pace: "fast", commitment: "low" },
      { name: "Slay the Spire", installed: true, genres: ["strategy", "card"], moods: ["focused", "relaxed"], time: ["quick", "medium"], energy: ["low", "medium"], social: "solo", challenge: "hard", story: "light", pace: "medium", commitment: "low" },
      { name: "Control", installed: true, genres: ["action", "adventure"], moods: ["immersive", "intense"], time: ["medium", "long"], energy: ["medium", "high"], social: "solo", challenge: "medium", story: "heavy", pace: "fast", commitment: "medium" },
      { name: "Dorfromantik", installed: true, genres: ["puzzle", "cozy"], moods: ["relaxed", "creative"], time: ["quick", "medium"], energy: ["low"], social: "solo", challenge: "easy", story: "none", pace: "slow", commitment: "low" },
      { name: "Portal 2", installed: false, genres: ["puzzle", "adventure"], moods: ["focused", "social"], time: ["medium"], energy: ["medium"], social: "either", challenge: "medium", story: "some", pace: "medium", commitment: "medium" },
      { name: "Mass Effect Legendary Edition", installed: false, genres: ["rpg", "adventure"], moods: ["immersive", "nostalgic"], time: ["long"], energy: ["medium"], social: "solo", challenge: "easy", story: "heavy", pace: "medium", commitment: "high" },
      { name: "Vampire Survivors", installed: true, genres: ["action", "arcade"], moods: ["relaxed", "intense"], time: ["quick"], energy: ["low", "medium"], social: "solo", challenge: "easy", story: "none", pace: "fast", commitment: "low" },
      { name: "Civilization VI", installed: true, genres: ["strategy", "simulation"], moods: ["focused", "creative"], time: ["long"], energy: ["medium", "high"], social: "either", challenge: "hard", story: "none", pace: "slow", commitment: "high" },
      { name: "Dave the Diver", installed: true, genres: ["adventure", "simulation"], moods: ["relaxed", "creative"], time: ["quick", "medium"], energy: ["low", "medium"], social: "solo", challenge: "easy", story: "some", pace: "medium", commitment: "medium" }
    ];

    const catalog = Object.fromEntries(knownGameMetadata.map(game => [game.name.toLowerCase(), game]));
    const playniteBridgeOrigin = "http://127.0.0.1:32145";
    const localLaunchers = {
      epic: "Epic Games",
      ea: "EA app",
      gog: "GOG",
      ubisoft: "Ubisoft Connect",
      battlenet: "Battle.net"
    };

    const questions = [
      { key: "time", title: "How much time do you have?", help: "We will avoid recommending a 90-hour epic when you have one coffee break.", options: [
        ["quick", "Under 45 minutes", "A clean, satisfying session"],
        ["medium", "45 minutes to 2 hours", "Enough time to settle in"],
        ["long", "A long evening", "I can properly disappear"],
        ["any", "Time is flexible", "Do not filter by session length"]
      ]},
      { key: "mood", title: "What mood are you chasing?", help: "Pick the feeling you want the game to create, not necessarily the mood you are in.", options: [
        ["relaxed", "Calm and comfortable", "Low pressure, pleasant rhythm"],
        ["intense", "Adrenaline", "Fast decisions and momentum"],
        ["immersive", "Lose me in a world", "Atmosphere, characters, and discovery"],
        ["focused", "Engage my brain", "Systems, puzzles, or strategy"]
      ]},
      { key: "energy", title: "What is your energy level?", help: "Be honest. Tired-you and ambitious-you usually want different games.", options: [
        ["low", "Running on fumes", "Easy to start and easy to follow"],
        ["medium", "Comfortably awake", "I can pay attention"],
        ["high", "Fully switched on", "Give me something demanding"],
        ["any", "It does not matter", "Keep all energy levels in play"]
      ]},
      { key: "social", title: "Who are you playing with?", help: "We will prioritize games that support the kind of session you actually have.", options: [
        ["solo", "Just me", "A private little universe"],
        ["multiplayer", "Friends or strangers", "Co-op or competitive play"],
        ["either", "Either works", "I am open to both"],
        ["any", "Not important", "Do not filter by player count"]
      ]},
      { key: "challenge", title: "How hard should it push back?", help: "Difficulty is about the experience you want tonight, not your skill level.", options: [
        ["easy", "Be kind to me", "Minimal friction"],
        ["medium", "A fair challenge", "Engaging, not exhausting"],
        ["hard", "Make me earn it", "Failure is part of the fun"],
        ["any", "Any difficulty", "I can adapt"]
      ]},
      { key: "story", title: "How much story do you want?", help: "This helps balance cutscenes, dialogue, and immediate play.", options: [
        ["none", "Gameplay first", "Let me get moving"],
        ["some", "A little context", "Story without long interruptions"],
        ["heavy", "I want a narrative", "Characters and choices matter"],
        ["any", "No preference", "Any story weight works"]
      ]},
      { key: "pace", title: "What pace feels right?", help: "Think about how quickly you want the game to ask things of you.", options: [
        ["slow", "Unhurried", "Room to think and wander"],
        ["medium", "Steady", "A balanced rhythm"],
        ["fast", "Immediate", "Keep things moving"],
        ["any", "Surprise me", "Any pace is fine"]
      ]},
      { key: "genre", title: "Which direction sounds best?", help: "This is a nudge, not a hard lock. Strong matches can still come from elsewhere.", options: [
        ["action", "Action", "Combat, movement, reflexes"],
        ["rpg", "RPG or adventure", "Exploration and progression"],
        ["strategy", "Strategy or puzzle", "Plans, systems, and clever choices"],
        ["cozy", "Cozy or simulation", "Build, tend, and unwind"]
      ]},
      { key: "commitment", title: "How much commitment can you tolerate?", help: "Some nights are for learning a whole new world. Some are not.", options: [
        ["low", "Almost none", "Drop in and feel productive"],
        ["medium", "A continuing game", "I can remember where I was"],
        ["high", "Start a big journey", "I am ready to invest"],
        ["any", "Any commitment", "Do not use this as a filter"]
      ]},
      { key: "installed", title: "Does it need to be installed?", help: "Downloading a game can be the difference between playing and going back to scrolling.", options: [
        ["yes", "Installed only", "I want to play soon"],
        ["prefer", "Prefer installed", "A download is okay for a great match"],
        ["no", "Installation does not matter", "Consider everything I own"],
        ["any", "No preference", "Treat both equally"]
      ]},
      { key: "familiarity", title: "Familiar or fresh?", help: "This preference will become more useful when play history is connected.", options: [
        ["fresh", "Something new", "Help me start a backlog game"],
        ["familiar", "A known favorite", "Comfort beats novelty"],
        ["either", "Either one", "Choose on the other answers"],
        ["any", "No preference", "Do not weigh familiarity"]
      ]},
      { key: "decision", title: "What matters most tonight?", help: "Your final answer gets extra weight in the ranking.", options: [
        ["time", "Fit my time", "Do not leave me mid-session"],
        ["mood", "Match my mood", "The feeling matters most"],
        ["energy", "Respect my energy", "Meet me where I am"],
        ["genre", "Give me my genre", "I know what kind of game I want"]
      ]}
    ];

    let state = { games: [], recommendationCount: 0, playniteConnected: false };
    let currentQuestion = 0;
    let answers = {};
    let activeSource = null;

    const landingView = document.getElementById("landingView");
    const appView = document.getElementById("appView");
    const sourceDrawer = document.getElementById("sourceDrawer");

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function iconText(name) {
      return name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    }

    function enterApp() {
      landingView.classList.add("hidden");
      appView.classList.remove("hidden");
      renderAll();
      navigate("home");
    }

    function clearSession() {
      state = { games: [], recommendationCount: 0, playniteConnected: false };
      answers = {};
      appView.classList.add("hidden");
      landingView.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Session cleared");
    }

    function navigate(page) {
      document.querySelectorAll(".page").forEach(node => node.classList.add("hidden"));
      const target = document.getElementById(`${page}Page`);
      if (target) target.classList.remove("hidden");
      document.querySelectorAll("[data-page]").forEach(node => node.classList.toggle("active", node.dataset.page === page));
      if (page === "library") renderLibrary();
      if (page === "quiz") startQuiz();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderAll() {
      const sources = new Set(state.games.map(game => game.source).filter(Boolean));
      document.getElementById("gameCount").textContent = state.games.length;
      document.getElementById("sourceCount").textContent = sources.size;
      document.getElementById("recommendationCount").textContent = state.recommendationCount || 0;
      document.getElementById("homeEmpty").classList.toggle("hidden", state.games.length > 0);
      document.getElementById("homeReady").classList.toggle("hidden", state.games.length === 0);
      document.getElementById("homeReadyCopy").textContent = `${state.games.length} games are ready to rank. Answer 12 quick questions and we will find the best fit.`;
      const playniteStatus = document.getElementById("playniteStatus");
      playniteStatus.textContent = state.playniteConnected ? "Connected" : "Open Playnite";
      playniteStatus.classList.toggle("connected", state.playniteConnected);
      ["csvStatus", "jsonStatus"].forEach(id => {
        const source = id.startsWith("csv") ? "CSV" : "JSON";
        const connected = state.games.some(game => game.source === source);
        const pill = document.getElementById(id);
        pill.textContent = connected ? "Imported" : "Ready";
        pill.classList.toggle("connected", connected);
      });
      renderLibrary();
    }

    function renderLibrary(filter = "") {
      const list = document.getElementById("gameList");
      const lower = filter.trim().toLowerCase();
      const games = state.games.filter(game => game.name.toLowerCase().includes(lower));
      list.innerHTML = games.map((game) => {
        const actualIndex = state.games.indexOf(game);
        const genre = Array.isArray(game.genres) && game.genres.length ? game.genres.slice(0, 2).join(", ") : "Metadata pending";
        return `
          <article class="game-row">
            <span class="game-art">${escapeHtml(iconText(game.name))}</span>
            <div><strong>${escapeHtml(game.name)}</strong><small>${escapeHtml(genre)}</small></div>
            <span class="source-label">${escapeHtml(game.source || "Imported")}</span>
            <span class="install-label">${game.installed ? "Installed" : "Not installed"}</span>
            <button class="remove-game" data-remove="${actualIndex}" aria-label="Remove ${escapeHtml(game.name)}">&times;</button>
          </article>`;
      }).join("");
      document.getElementById("libraryEmpty").classList.toggle("hidden", state.games.length > 0);
      list.classList.toggle("hidden", state.games.length === 0);
      document.querySelectorAll("[data-remove]").forEach(button => {
        button.addEventListener("click", () => {
          state.games.splice(Number(button.dataset.remove), 1);
          renderAll();
          showToast("Game removed from this profile");
        });
      });
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function addGames(games) {
      const existing = new Set(state.games.map(game => game.name.toLowerCase()));
      const additions = games.filter(game => game.name && !existing.has(game.name.toLowerCase()));
      state.games.push(...additions);
      renderAll();
      return additions.length;
    }

    function normalizeGame(raw, source) {
      const name = String(raw.name || raw.Name || raw.title || raw.Title || raw.game || "").trim();
      const known = catalog[name.toLowerCase()];
      const list = value => Array.isArray(value)
        ? value.map(v => String(v).trim().toLowerCase()).filter(Boolean)
        : String(value || "").split(/[|;]/).map(v => v.trim().toLowerCase()).filter(Boolean);
      const bool = value => value === true || ["true", "yes", "1", "installed"].includes(String(value).toLowerCase());
      const features = list(raw.features || raw.Features);
      const inferredSocial = inferSocial(features);
      return {
        ...(known || {}),
        name,
        source: raw.source || raw.Source || source,
        installed: raw.installed === undefined && raw.Installed === undefined && raw.isinstalled === undefined
          ? (known?.installed || false)
          : bool(raw.installed ?? raw.Installed ?? raw.isinstalled),
        playtime: Number(raw.playtime || raw.Playtime || 0),
        playCount: Number(raw.playCount || raw.PlayCount || 0),
        favorite: bool(raw.favorite ?? raw.Favorite),
        genres: list(raw.genres || raw.Genres || raw.genre || known?.genres),
        features,
        platforms: list(raw.platforms || raw.Platforms),
        tags: list(raw.tags || raw.Tags),
        moods: list(raw.moods || raw.mood || known?.moods),
        time: list(raw.time || raw.session || known?.time),
        energy: list(raw.energy || known?.energy),
        social: String(raw.social || raw.players || inferredSocial || known?.social || "either").toLowerCase(),
        challenge: String(raw.challenge || raw.difficulty || known?.challenge || "medium").toLowerCase(),
        story: String(raw.story || known?.story || "some").toLowerCase(),
        pace: String(raw.pace || known?.pace || "medium").toLowerCase(),
        commitment: String(raw.commitment || known?.commitment || "medium").toLowerCase()
      };
    }

    function inferSocial(features) {
      const values = features.map(value => value.toLowerCase());
      const hasSolo = values.some(value => value.includes("single") || value.includes("solo"));
      const hasMulti = values.some(value => value.includes("multi") || value.includes("co-op") || value.includes("coop"));
      if (hasSolo && hasMulti) return "either";
      if (hasMulti) return "multiplayer";
      if (hasSolo) return "solo";
      return "";
    }

    function parseCsv(text) {
      const rows = [];
      let row = [];
      let value = "";
      let quoted = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];
        if (char === '"' && quoted && next === '"') {
          value += '"';
          i++;
        } else if (char === '"') {
          quoted = !quoted;
        } else if (char === "," && !quoted) {
          row.push(value);
          value = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
          if (char === "\r" && next === "\n") i++;
          row.push(value);
          if (row.some(cell => cell.trim())) rows.push(row);
          row = [];
          value = "";
        } else {
          value += char;
        }
      }
      row.push(value);
      if (row.some(cell => cell.trim())) rows.push(row);
      if (rows.length < 2) return [];
      const headerIndex = rows.findIndex(cells => cells.some(cell =>
        ["name", "title", "game"].includes(cell.replace(/^\uFEFF/, "").trim().toLowerCase())
      ));
      if (headerIndex < 0) return [];
      const headers = rows[headerIndex].map(header => header.replace(/^\uFEFF/, "").trim().toLowerCase());
      return rows.slice(headerIndex + 1).map(cells =>
        Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()]))
      );
    }

    function openSource(type) {
      activeSource = type;
      const title = document.getElementById("drawerTitle");
      const intro = document.getElementById("drawerIntro");
      const content = document.getElementById("drawerContent");
      if (type === "playnite") {
        title.textContent = "Connect with Playnite";
        intro.textContent = "The companion extension reads your unified Playnite library over a private localhost connection. No export is needed after it is installed.";
        content.innerHTML = `
          <div class="instruction-list">
            <div class="instruction"><span class="instruction-num">1</span><div><strong>Install Playnite and its library integrations</strong><span>In Playnite, connect the launchers you use. Authentication happens in Playnite's official or community integrations, not on this website.</span></div></div>
            <div class="instruction"><span class="instruction-num">2</span><div><strong>Install extension version 0.4 or newer</strong><span>Download the Playnite extension, open the .pext file with Playnite, and restart Playnite once. This version lets the website ask Windows to open Playnite.</span></div></div>
            <div class="instruction"><span class="instruction-num">3</span><div><strong>Connect this tab</strong><span>Choose Connect now. If Playnite is closed, your browser may ask permission to open it. The site waits while Playnite starts, imports the library, then closes the handoff window.</span></div></div>
          </div>
          <a class="btn secondary full" href="https://playnite.link/download/PlayniteInstaller.exe">Download Playnite launcher</a>
          <a class="btn secondary full" href="downloads/WhatShouldIPlayBridge.pext" download style="margin-top:10px">Download Playnite extension</a>
          <a class="btn full" id="connectPlayniteBridge" href="wsip-playnite://launch" style="margin-top:10px">Connect now</a>
          <div class="privacy-box" id="playniteConnectionHelp">The extension exposes a read-only endpoint at 127.0.0.1. It sends game names and useful metadata only, never launcher passwords, cookies, tokens, install paths, or Playnite database IDs.</div>
          <div class="privacy-box">The connected library stays in this tab's memory only. Closing or clearing the session removes it. The separate CSV and JSON cards are available only for files you maintain yourself.</div>`;
        document.getElementById("connectPlayniteBridge")?.addEventListener("click", connectPlayniteBridge);
      } else if (localLaunchers[type]) {
        const launcher = localLaunchers[type];
        title.textContent = `Load ${launcher}`;
        intro.textContent = `${launcher} does not expose a general public library API. Playnite can connect to it locally and pass the game list to this tab through the companion bridge.`;
        content.innerHTML = `
          <div class="instruction-list">
            <div class="instruction"><span class="instruction-num">1</span><div><strong>Import ${launcher} into Playnite</strong><span>Install Playnite, add its ${launcher} library integration, and let it read the games available on your computer and account.</span></div></div>
            <div class="instruction"><span class="instruction-num">2</span><div><strong>Install the What Should I Play? companion</strong><span>The extension provides read-only access to Playnite's combined game list on your own PC.</span></div></div>
            <div class="instruction"><span class="instruction-num">3</span><div><strong>Connect while Playnite is open</strong><span>The browser receives the current library for this session without receiving your ${launcher} credentials.</span></div></div>
          </div>
          <button class="btn full" id="connectLocalBridge">Connect through Playnite</button>
          <div class="privacy-box">The bridge is local and read-only. The separate CSV and JSON cards are available for files you maintain yourself.</div>`;
        document.getElementById("connectLocalBridge")?.addEventListener("click", connectPlayniteBridge);
      } else {
        const csv = type === "csv";
        title.textContent = csv ? "Import a CSV library" : "Import a JSON library";
        intro.textContent = csv
          ? "Use a spreadsheet you maintain yourself. Only the name column is required; extra fields make recommendations more precise."
          : "Use an array of games or an object with a games array. Rich metadata produces the best matches.";
        const format = csv
          ? "name,source,installed,genres,moods,time\nHades,Steam,true,action|roguelike,intense|focused,quick|medium"
          : `{\n  "games": [\n    {\n      "name": "Hades",\n      "source": "Epic",\n      "installed": true,\n      "genres": ["action", "roguelike"],\n      "moods": ["intense", "focused"],\n      "time": ["quick", "medium"]\n    }\n  ]\n}`;
        content.innerHTML = `
          <div class="instruction-list">
            <div class="instruction"><span class="instruction-num">1</span><div><strong>Prepare the file</strong><span>Include one game per row or object. Supported optional fields include source, installed, genres, moods, time, energy, social, challenge, story, pace, and commitment.</span></div></div>
            <div class="instruction"><span class="instruction-num">2</span><div><strong>Check sensitive data</strong><span>Do not include launcher passwords, API secrets, payment details, or account tokens. This importer only needs game information.</span></div></div>
            <div class="instruction"><span class="instruction-num">3</span><div><strong>Choose your file</strong><span>The file is read locally into this tab's memory. It is not uploaded or retained.</span></div></div>
          </div>
          <label class="upload-zone">
            <input type="file" id="libraryFile" accept="${csv ? ".csv,text/csv" : ".json,application/json"}">
            <span class="empty-icon icon"><svg viewBox="0 0 24 24"><path d="M12 16V4M8 8l4-4 4 4M5 13v6h14v-6"/></svg></span>
            <strong>Choose ${csv ? "CSV" : "JSON"} file</strong>
            <span>Your file is processed locally in this prototype</span>
          </label>
          <div class="format-box">${escapeHtml(format)}</div>
          <div class="privacy-box">The file contents, quiz answers, and recommendation remain in memory only. Closing or clearing the page removes them.</div>`;
        document.getElementById("libraryFile")?.addEventListener("change", handleFileUpload);
      }
      sourceDrawer.classList.remove("hidden");
    }

    function connectPlayniteBridge(event) {
      const button = document.getElementById("connectPlayniteBridge") || document.getElementById("connectLocalBridge");
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

      const nonce = createBridgeNonce();
      const bridgeUrl = `${playniteBridgeOrigin}/v1/connect?nonce=${encodeURIComponent(nonce)}&origin=${encodeURIComponent(window.location.origin)}`;
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
        if (event.origin !== playniteBridgeOrigin ||
            event.source !== popup ||
            event.data?.type !== "wsip-playnite-library" ||
            event.data?.nonce !== nonce) {
          return;
        }

        try {
          const payload = event.data.payload;
          const records = payload.games || payload.Games;
          if (!Array.isArray(records)) throw new Error("Bridge returned no games array");
          const games = records.map(record => normalizeGame(record, "Playnite")).filter(game => game.name);
          const count = addGames(games);
          state.playniteConnected = true;
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

    function createBridgeNonce() {
      if (crypto.randomUUID) {
        return crypto.randomUUID().replaceAll("-", "");
      }

      const bytes = crypto.getRandomValues(new Uint8Array(24));
      return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
    }

    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        let records;
        const isCsv = activeSource === "csv" || file.name.toLowerCase().endsWith(".csv");
        if (isCsv) {
          records = parseCsv(text);
        } else {
          const parsed = JSON.parse(text);
          records = Array.isArray(parsed) ? parsed : parsed.games;
        }
        if (!Array.isArray(records)) throw new Error("No games array found");
        const sourceName = activeSource === "playnite"
          ? "Playnite"
          : (localLaunchers[activeSource] || activeSource.toUpperCase());
        const games = records.map(record => normalizeGame(record, sourceName)).filter(game => game.name);
        const count = addGames(games);
        sourceDrawer.classList.add("hidden");
        navigate("library");
        showToast(count ? `${count} game${count === 1 ? "" : "s"} imported` : "No new games found");
      } catch {
        showToast(`That ${activeSource.toUpperCase()} file could not be read`);
      }
    }

    function startQuiz() {
      const hasGames = state.games.length > 0;
      document.getElementById("quizContent").classList.toggle("hidden", !hasGames);
      document.getElementById("quizNoGames").classList.toggle("hidden", hasGames);
      if (!hasGames) return;
      currentQuestion = 0;
      answers = {};
      renderQuestion();
    }

    function renderQuestion() {
      const question = questions[currentQuestion];
      const percent = Math.round(((currentQuestion + 1) / questions.length) * 100);
      document.getElementById("questionNumber").textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
      document.getElementById("progressPercent").textContent = `${percent}%`;
      document.getElementById("progressFill").style.width = `${percent}%`;
      document.getElementById("questionTitle").textContent = question.title;
      document.getElementById("questionHelp").textContent = question.help;
      document.getElementById("questionOptions").innerHTML = question.options.map(option => `
        <button class="option ${answers[question.key] === option[0] ? "selected" : ""}" data-answer="${option[0]}">
          <strong>${option[1]}</strong><span>${option[2]}</span>
        </button>`).join("");
      document.getElementById("quizBack").disabled = currentQuestion === 0;
      document.getElementById("quizNext").disabled = !answers[question.key];
      document.getElementById("quizNext").textContent = currentQuestion === questions.length - 1 ? "Show my game" : "Next question";
      document.querySelectorAll("[data-answer]").forEach(button => {
        button.addEventListener("click", () => {
          answers[question.key] = button.dataset.answer;
          renderQuestion();
        });
      });
    }

    function scoreGame(game) {
      let score = 0;
      const reasons = [];
      const priority = answers.decision;
      const weight = key => priority === key ? 5 : 3;
      const listMatch = (field, answer, key, label) => {
        if (!answer || answer === "any") return;
        const values = Array.isArray(field) ? field : [field];
        if (values.includes(answer)) {
          score += weight(key);
          reasons.push(label);
        } else {
          score -= 1;
        }
      };
      listMatch(game.time, answers.time, "time", `Fits a ${answers.time} session`);
      listMatch(game.moods, answers.mood, "mood", `Matches your ${answers.mood} mood`);
      listMatch(game.energy, answers.energy, "energy", `Works with ${answers.energy} energy`);
      listMatch(game.genres, answers.genre, "genre", `Leans into ${answers.genre}`);
      listMatch(game.challenge, answers.challenge, "challenge", `${capitalize(game.challenge)} challenge`);
      listMatch(game.story, answers.story, "story", `${capitalize(game.story)} story focus`);
      listMatch(game.pace, answers.pace, "pace", `${capitalize(game.pace)} pace`);
      listMatch(game.commitment, answers.commitment, "commitment", `${capitalize(game.commitment)} commitment`);
      if (answers.social !== "any") {
        if (game.social === answers.social || game.social === "either" || answers.social === "either") {
          score += 3;
          reasons.push(answers.social === "solo" ? "Made for solo play" : "Supports your social setup");
        } else {
          score -= 3;
        }
      }
      if (answers.installed === "yes") {
        score += game.installed ? 5 : -8;
        if (game.installed) reasons.push("Already installed");
      } else if (answers.installed === "prefer" && game.installed) {
        score += 2;
        reasons.push("Already installed");
      }
      return { game, score, reasons: [...new Set(reasons)].slice(0, 5) };
    }

    function showResult() {
      const ranked = state.games.map(scoreGame).sort((a, b) => b.score - a.score);
      const best = ranked[0];
      const maxReasonable = 30;
      const match = Math.max(62, Math.min(98, Math.round(68 + (best.score / maxReasonable) * 30)));
      const palette = coverPalette(best.game.name);
      document.getElementById("resultCover").style.background = palette;
      document.getElementById("resultScore").textContent = `${match}% match`;
      document.getElementById("resultGame").textContent = best.game.name;
      document.getElementById("resultGameInline").textContent = best.game.name;
      document.getElementById("resultReason").textContent = buildReason(best);
      document.getElementById("whyList").innerHTML = (best.reasons.length ? best.reasons : ["Best overall fit from your current library"])
        .map(reason => `<li>${escapeHtml(reason)}</li>`).join("");
      const tags = [
        ...(best.game.genres || []).slice(0, 2),
        best.game.social,
        best.game.installed ? "installed" : "download needed"
      ].filter(Boolean);
      document.getElementById("resultTags").innerHTML = tags.map(tag => `<span class="tag">${escapeHtml(capitalize(tag))}</span>`).join("");
      document.getElementById("alternatives").innerHTML = ranked.slice(1, 3).map(item => `
        <div class="alt-card"><strong>${escapeHtml(item.game.name)}</strong><span>${escapeHtml(item.reasons[0] || "A solid alternate match")}</span></div>`).join("");
      state.recommendationCount = (state.recommendationCount || 0) + 1;
      renderAll();
      navigate("result");
    }

    function buildReason(best) {
      const reason = best.reasons.slice(0, 3);
      if (!reason.length) return "It is the strongest overall match among the games currently attached to your profile.";
      return `${best.game.name} rises to the top because it ${reason.map(item => item.toLowerCase()).join(", ")}. It gives you a strong fit without asking you to negotiate with your whole backlog.`;
    }

    function capitalize(value) {
      return String(value || "").replace(/\b\w/g, char => char.toUpperCase());
    }

    function coverPalette(name) {
      const palettes = [
        "linear-gradient(145deg, #56364c, #eb7658 52%, #f3b36d)",
        "linear-gradient(145deg, #163846, #2b7b78 52%, #9bd78a)",
        "linear-gradient(145deg, #2e294e, #694ea1 52%, #c3a6ff)",
        "linear-gradient(145deg, #4d321f, #a96336 52%, #ffc06b)"
      ];
      const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return palettes[total % palettes.length];
    }

    document.querySelectorAll("[data-enter]").forEach(button => button.addEventListener("click", enterApp));
    document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
    document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
    document.querySelectorAll("[data-source]").forEach(button => button.addEventListener("click", () => openSource(button.dataset.source)));
    document.getElementById("closeDrawer").addEventListener("click", () => sourceDrawer.classList.add("hidden"));
    sourceDrawer.addEventListener("click", event => { if (event.target === sourceDrawer) sourceDrawer.classList.add("hidden"); });
    document.getElementById("clearSessionBtn").addEventListener("click", clearSession);
    document.getElementById("mobileClearSession").addEventListener("click", clearSession);
    document.getElementById("librarySearch").addEventListener("input", event => renderLibrary(event.target.value));

    document.getElementById("quizBack").addEventListener("click", () => {
      if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
      }
    });
    document.getElementById("quizNext").addEventListener("click", () => {
      if (!answers[questions[currentQuestion].key]) return;
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
      } else {
        showResult();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        sourceDrawer.classList.add("hidden");
      }
    });
