/* BYTE PHANTOM — local-only cyber simulation interface */
(function () {
  "use strict";

  const operations = [
    { id:"system-scan", name:"SYSTEM SCAN", icon:"▦", tone:"cyan-card", category:"recon", description:"Inspect a fictional workstation profile, mock services, and sample system telemetry.", target:"LOCAL_SANDBOX_01", stages:["Loading fictional system profile","Checking mock service table","Reviewing sample resource metrics","Preparing local scan report"], result:["CPU PROFILE: PHANTOM-8 CORE","MEMORY PROFILE: 32 GB (SIMULATED)","MOCK SERVICES: 07 / 07 AVAILABLE","SCAN REPORT: GENERATED LOCALLY"] },
    { id:"network-radar", name:"NETWORK RADAR", icon:"◎", tone:"cyan-card", category:"recon", description:"Visualize a small collection of imaginary network nodes and their sample status.", target:"DEMO_GRID_192.0.2.0", stages:["Initializing sample topology","Plotting fictional nodes","Calculating mock signal paths","Rendering local radar summary"], result:["NODES DISPLAYED: 08 FICTIONAL","ACTIVE LINKS: 05 / 08","SIGNAL QUALITY: DEMO OPTIMAL","TOPOLOGY: LOCAL SAMPLE DATA"] },
    { id:"ip-trace", name:"IP TRACE", icon:"⌖", tone:"red-card", category:"recon", description:"Run a theatrical trace animation against a reserved documentation IP address. No lookup is performed.", target:"192.0.2.44 (DOCUMENTATION RANGE)", stages:["Reading sample address","Simulating route hops","Painting fictional map markers","Compiling demo trace"], result:["DESTINATION: 192.0.2.44 (RESERVED EXAMPLE)","ROUTE HOPS: 06 SIMULATED","GEOLOCATION: NOT REQUESTED","TRACE: FICTIONAL RESULT"] },
    { id:"device-infiltration", name:"DEVICE INFILTRATION", icon:"▣", tone:"", category:"access", description:"Play a fictional device-access scenario using a generated device record. No real device is contacted.", target:"MOCK_DEVICE_DELTA", stages:["Loading fictional device record","Animating access-control sequence","Reviewing imaginary permissions","Closing sandbox session"], result:["DEVICE: MOCK-DELTA / OFFLINE SAMPLE","ACCESS LAYERS: 04 SIMULATED","PERMISSIONS: FICTIONAL ONLY","SCENARIO: COMPLETED LOCALLY"] },
    { id:"firewall-breach", name:"FIREWALL BREACH", icon:"⬡", tone:"red-card", category:"access", description:"Watch a simulated firewall puzzle resolve against a built-in mock rule set.", target:"DEMO_FIREWALL_A7", stages:["Loading sample rule set","Analyzing fictional packet patterns","Resolving demo challenge","Generating firewall report"], result:["RULES REVIEWED: 24 MOCK ENTRIES","CHALLENGE: SIMULATION PASSED","EXTERNAL FIREWALL: NOT CONNECTED","REPORT: LOCAL DEMO"] },
    { id:"password-cracker", name:"PASSWORD CRACKER", icon:"✳", tone:"", category:"access", description:"Animate a fictional password-strength puzzle with a generated sample hash. No passwords are tested.", target:"SAMPLE_HASH_7F3A", stages:["Creating temporary sample hash","Running visual character animation","Checking fictional strength score","Discarding temporary sample"], result:["SAMPLE HASH: DEMO-7F3A-91C2","STRENGTH: STRONG (MOCK RESULT)","REAL CREDENTIALS: NOT ACCEPTED","TEMPORARY DATA: DISCARDED"] },
    { id:"camera-access", name:"CAMERA ACCESS", icon:"◉", tone:"cyan-card", category:"access", description:"Open a fictional CCTV scene with generated test frames. The application never requests camera permission.", target:"VIRTUAL_CAM_03", stages:["Opening virtual camera channel","Loading generated preview frame","Rendering mock telemetry","Closing virtual feed"], result:["CAMERA: VIRTUAL-CAM-03","PREVIEW: GENERATED TEST GRAPHIC","PHYSICAL CAMERA: NOT ACCESSED","FEED: CLOSED SAFELY"] },
    { id:"satellite-link", name:"SATELLITE LINK", icon:"✧", tone:"cyan-card", category:"access", description:"Animate a fictional satellite handshake and orbital telemetry sequence.", target:"ORBITAL_SIM_NODE_09", stages:["Searching local satellite catalog","Simulating orbital handshake","Rendering mock telemetry","Terminating demo link"], result:["SATELLITE: ORBITAL-SIM-09","ALTITUDE: 540 KM (FICTIONAL)","LINK QUALITY: 98% DEMO","RADIO TRANSMISSION: NONE"] },
    { id:"mainframe-override", name:"MAINFRAME OVERRIDE", icon:"▤", tone:"", category:"access", description:"Run a fictional access-control puzzle inside an imaginary mainframe environment.", target:"PHANTOM_MAINFRAME_X", stages:["Loading virtual mainframe","Checking mock access layers","Resolving local control puzzle","Restoring default sandbox state"], result:["MAINFRAME: VIRTUAL-X","CONTROL LAYERS: 05 DEMO LAYERS","OVERRIDE: SIMULATION COMPLETE","SYSTEM STATE: RESTORED"] },
    { id:"data-extraction", name:"DATA EXTRACTION", icon:"▧", tone:"amber-card", category:"data", description:"Generate a local preview of fictional files and package sample metadata.", target:"DEMO_ARCHIVE_001", stages:["Creating temporary sample archive","Enumerating fictional file names","Building mock metadata index","Removing temporary archive"], result:["FILES INDEXED: 18 FICTIONAL ITEMS","ARCHIVE: DEMO-PACKAGE-001","SOURCE: BUILT-IN SAMPLE DATA","TEMPORARY FILES: REMOVED"] },
    { id:"digital-forensics", name:"DIGITAL FORENSICS", icon:"⌕", tone:"amber-card", category:"data", description:"Analyze a built-in fictional evidence set and generate a local forensic summary.", target:"CASE_FILE_PH-014", stages:["Opening fictional evidence case","Reviewing mock file metadata","Comparing sample timestamps","Preparing forensic summary"], result:["CASE: PH-014 / TRAINING SAMPLE","ARTIFACTS: 09 MOCK ITEMS","TIMELINE: GENERATED LOCALLY","CONCLUSION: DEMO REPORT READY"] },
    { id:"encryption-breaker", name:"ENCRYPTION BREAKER", icon:"⟡", tone:"amber-card", category:"data", description:"Solve a toy cipher embedded in the simulator. No external files or real encrypted data are used.", target:"TOY_CIPHER_C-12", stages:["Loading built-in toy cipher","Mapping sample substitution table","Resolving training puzzle","Verifying local demonstration"], result:["CIPHER: C-12 / TOY EXERCISE","PUZZLE: SOLVED LOCALLY","REAL ENCRYPTION: UNTOUCHED","OUTPUT: FICTIONAL TRAINING TEXT"] }
  ];

  const pageTitles = {
    dashboard:"DASHBOARD", operations:"HACKING OPERATIONS", terminal:"DARK TERMINAL",
    profiles:"PROFILE GENERATOR", logs:"ACTIVITY LOGS", settings:"SETTINGS"
  };
  const pageIds = Object.keys(pageTitles);
  let selectedOperation = null;
  let operationTimer = null;
  let operationCount = 0;
  let activity = [];
  let soundEnabled = false;
  let terminalHistory = [];
  let terminalHistoryIndex = 0;

  const $ = function (id) { return document.getElementById(id); };
  const nowTime = function () {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (v) { return String(v).padStart(2, "0"); }).join(":");
  };
  const escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[ch];
    });
  };
  function tone() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 620;
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.08);
      oscillator.onended = function () { ctx.close(); };
    } catch (e) { /* Audio is optional. */ }
  }

  function showPage(page) {
    if (!pageTitles[page]) return;
    pageIds.forEach(function (name) {
      const el = $("page-" + name);
      if (el) el.classList.toggle("active", name === page);
    });
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("active", link.dataset.page === page);
    });
    $("currentSection").textContent = pageTitles[page];
    document.title = "BYTE PHANTOM — " + pageTitles[page];
    closeSidebar();
    window.scrollTo({ top:0, behavior:"smooth" });
    tone();
  }

  function openSidebar() {
    $("sidebar").classList.add("open");
    $("mobileBackdrop").classList.add("open");
  }
  function closeSidebar() {
    $("sidebar").classList.remove("open");
    $("mobileBackdrop").classList.remove("open");
  }

  document.querySelectorAll("[data-page]").forEach(function (button) {
    button.addEventListener("click", function () { showPage(button.dataset.page); });
  });
  $("openSidebar").addEventListener("click", openSidebar);
  $("closeSidebar").addEventListener("click", closeSidebar);
  $("mobileBackdrop").addEventListener("click", closeSidebar);

  function addActivity(title, description, warning) {
    activity.unshift({ time:nowTime(), title:title, description:description, warning:!!warning });
    activity = activity.slice(0, 60);
    renderActivity();
  }
  function renderActivity() {
    const list = $("activityList");
    list.textContent = "";
    if (!activity.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<span>≋</span><b>NO EVENTS YET</b><small>Run a simulation module to populate your local activity feed.</small>";
      list.appendChild(empty);
      return;
    }
    activity.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "activity-item";
      const time = document.createElement("div");
      time.className = "activity-time";
      time.textContent = item.time;
      const mark = document.createElement("div");
      mark.className = "activity-mark" + (item.warning ? " warning" : "");
      mark.textContent = item.warning ? "!" : "✓";
      const copy = document.createElement("div");
      copy.className = "activity-copy";
      const title = document.createElement("b");
      title.textContent = item.title;
      const desc = document.createElement("small");
      desc.textContent = item.description;
      copy.append(title, desc);
      const state = document.createElement("div");
      state.className = "activity-state";
      state.textContent = item.warning ? "NOTICE" : "LOCAL / OK";
      row.append(time, mark, copy, state);
      list.appendChild(row);
    });
  }

  function createOperationCard(operation) {
    const button = document.createElement("button");
    button.className = "operation-card " + operation.tone;
    button.type = "button";
    button.dataset.operation = operation.id;
    const icon = document.createElement("span");
    icon.className = "operation-icon";
    icon.textContent = operation.icon;
    const info = document.createElement("span");
    info.className = "operation-info";
    const title = document.createElement("strong");
    title.textContent = operation.name;
    const description = document.createElement("small");
    description.textContent = operation.description;
    info.append(title, description);
    const arrow = document.createElement("i");
    arrow.className = "operation-arrow";
    arrow.textContent = "↗";
    button.append(icon, info, arrow);
    button.addEventListener("click", function () { openOperation(operation.id); });
    return button;
  }
  operations.forEach(function (operation) {
    const grid = $(operation.category === "recon" ? "reconGrid" : operation.category === "access" ? "accessGrid" : "dataGrid");
    grid.appendChild(createOperationCard(operation));
  });

  function openOperation(id) {
    const operation = operations.find(function (item) { return item.id === id; });
    if (!operation) return;
    clearInterval(operationTimer);
    selectedOperation = operation;
    $("modalIcon").textContent = operation.icon;
    $("modalTitle").textContent = operation.name;
    $("modalDescription").textContent = operation.description;
    $("modalTarget").textContent = operation.target;
    $("progressArea").hidden = true;
    $("modalResult").hidden = true;
    $("modalResult").textContent = "";
    $("progressBar").style.width = "0%";
    $("progressPercent").textContent = "0%";
    $("progressOutput").textContent = "";
    $("progressLabel").textContent = "INITIALIZING";
    $("runOperation").disabled = false;
    $("runOperation").innerHTML = "INITIALIZE SIMULATION <span>▶</span>";
    $("operationModal").classList.add("open");
    $("operationModal").setAttribute("aria-hidden", "false");
    tone();
  }
  function closeOperation() {
    clearInterval(operationTimer);
    operationTimer = null;
    $("operationModal").classList.remove("open");
    $("operationModal").setAttribute("aria-hidden", "true");
  }
  $("closeModal").addEventListener("click", closeOperation);
  $("cancelOperation").addEventListener("click", closeOperation);
  $("operationModal").addEventListener("click", function (event) {
    if (event.target === $("operationModal")) closeOperation();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeOperation();
      closeSidebar();
    }
  });

  function runOperation() {
    if (!selectedOperation || operationTimer) return;
    const operation = selectedOperation;
    $("progressArea").hidden = false;
    $("modalResult").hidden = true;
    $("runOperation").disabled = true;
    $("runOperation").textContent = "SIMULATION RUNNING...";
    $("progressLabel").textContent = "INITIALIZING";
    const stages = operation.stages;
    let tick = 0;
    const total = 24;
    $("progressOutput").textContent = "[CORE] Starting local simulation...\n";
    operationTimer = setInterval(function () {
      tick += 1;
      const percent = Math.min(100, Math.round(tick / total * 100));
      $("progressBar").style.width = percent + "%";
      $("progressPercent").textContent = percent + "%";
      const stageIndex = Math.min(stages.length - 1, Math.floor((tick - 1) / (total / stages.length)));
      $("progressLabel").textContent = percent >= 100 ? "FINALIZING" : "PHASE " + String(stageIndex + 1).padStart(2, "0");
      if (tick === 1 || tick % 5 === 0) {
        $("progressOutput").textContent += "[SIM] " + stages[Math.min(stages.length - 1, Math.floor((tick - 1) / 5))] + "...\n";
      }
      if (tick >= total) {
        clearInterval(operationTimer);
        operationTimer = null;
        finishOperation(operation);
      }
    }, 105);
  }
  function finishOperation(operation) {
    operationCount += 1;
    $("runCount").textContent = String(operationCount).padStart(2, "0");
    $("runStatus").textContent = "COMPLETE";
    $("progressLabel").textContent = "SIMULATION COMPLETE";
    $("progressOutput").textContent += "[CORE] Local scenario completed.\n[SAFE] No external connection was made.";
    $("modalResult").hidden = false;
    $("modalResult").textContent = "✓ SIMULATION COMPLETE\n" + operation.result.join("\n") + "\n\nSAFE MODE: ENABLED";
    $("runOperation").disabled = false;
    $("runOperation").textContent = "RUN AGAIN";
    addActivity(operation.name, "Fictional scenario completed in the local simulator.");
    appendDashboardLog(operation.name + " simulation completed.", "term-green");
    tone();
  }
  $("runOperation").addEventListener("click", runOperation);
  document.querySelectorAll("[data-operation]").forEach(function (button) {
    button.addEventListener("click", function () { openOperation(button.dataset.operation); });
  });

  function appendDashboardLog(message, type) {
    const host = $("dashboardTerminal");
    const line = document.createElement("div");
    line.className = "terminal-line";
    const time = document.createElement("span");
    time.className = "term-time";
    time.textContent = nowTime();
    const status = document.createElement("span");
    status.className = type || "term-cyan";
    status.textContent = "[DEMO]";
    line.append(time, status, document.createTextNode(" " + message));
    host.appendChild(line);
    while (host.children.length > 8) host.removeChild(host.firstChild);
  }

  function terminalLine(text, type) {
    const row = document.createElement("div");
    row.className = "terminal-output " + (type || "");
    row.textContent = text;
    $("terminalScreen").appendChild(row);
    $("terminalScreen").scrollTop = $("terminalScreen").scrollHeight;
  }
  function terminalPrompt(command) {
    const row = document.createElement("div");
    row.className = "terminal-entry";
    const user = document.createElement("span"); user.className = "prompt-user"; user.textContent = "ghost@byte-phantom";
    const sep = document.createElement("span"); sep.className = "prompt-separator"; sep.textContent = ":";
    const path = document.createElement("span"); path.className = "prompt-path"; path.textContent = "~";
    const symbol = document.createElement("span"); symbol.className = "prompt-symbol"; symbol.textContent = "$";
    const cmd = document.createElement("span"); cmd.textContent = " " + command;
    row.append(user, sep, path, symbol, cmd);
    $("terminalScreen").appendChild(row);
  }
  function clearTerminal() {
    $("terminalScreen").textContent = "";
    terminalLine("BYTE PHANTOM console cleared. Type help to see simulator commands.", "info");
  }
  function executeCommand(raw) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    terminalPrompt(raw);
    terminalHistory.push(raw);
    terminalHistoryIndex = terminalHistory.length;
    const bits = command.split(/\s+/);
    const cmd = bits[0];
    switch (cmd) {
      case "help":
        terminalLine("AVAILABLE LOCAL COMMANDS", "success");
        terminalLine("help       - list simulator commands");
        terminalLine("status     - show local simulator status");
        terminalLine("modules    - list available operation modules");
        terminalLine("scan       - run a short fictional system scan");
        terminalLine("whoami     - show the current fictional operator");
        terminalLine("date       - show this device's local date and time");
        terminalLine("profile    - open the fictional profile generator");
        terminalLine("clear      - clear terminal output");
        terminalLine("No shell, network, file-system, or external target commands are supported.", "warning");
        break;
      case "status":
        terminalLine("CORE: ONLINE | MODE: LOCAL SIMULATION | NETWORK: DISABLED", "success");
        terminalLine("MODULES: 14 LOADED | OPERATIONS THIS SESSION: " + operationCount, "info");
        break;
      case "modules":
        terminalLine("12 OPERATION MODULES + DARK TERMINAL + PROFILE GENERATOR", "success");
        operations.forEach(function (op) { terminalLine("  - " + op.name); });
        break;
      case "scan":
        terminalLine("Starting safe demo scan...", "info");
        terminalLine("CPU: PHANTOM-8 (MOCK) | MEMORY: 32 GB (MOCK)", "success");
        terminalLine("MOCK SERVICES: 07 | ALERTS: 00 | EXTERNAL REQUESTS: 00", "success");
        terminalLine("Report generated in memory. No real system scan was performed.", "warning");
        addActivity("TERMINAL / DEMO SCAN", "Local mock system report generated.");
        operationCount += 1;
        $("runCount").textContent = String(operationCount).padStart(2, "0");
        break;
      case "whoami":
        terminalLine("OPERATOR: GHOST USER", "success");
        terminalLine("IDENTITY: LOCAL DEMO SESSION | CLEARANCE: SIMULATED");
        break;
      case "date":
        terminalLine("LOCAL DEVICE TIME: " + new Date().toString(), "info");
        break;
      case "profile":
        showPage("profiles");
        terminalLine("Opening local fictional identity generator...", "info");
        break;
      case "clear":
        clearTerminal();
        return;
      default:
        terminalLine("Command not found: " + raw, "error");
        terminalLine("This is a simulator console, not an operating-system shell. Type help.", "warning");
    }
    tone();
  }
  $("terminalForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = $("terminalInput");
    const value = input.value;
    input.value = "";
    executeCommand(value);
  });
  $("clearTerminal").addEventListener("click", clearTerminal);
  document.querySelectorAll("[data-command]").forEach(function (button) {
    button.addEventListener("click", function () {
      executeCommand(button.dataset.command);
      $("terminalInput").focus();
    });
  });
  $("terminalInput").addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
      $("terminalInput").value = terminalHistory[terminalHistoryIndex] || "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
      $("terminalInput").value = terminalHistory[terminalHistoryIndex] || "";
    }
  });

  const aliases = ["NIGHT VECTOR","GHOST CIRCUIT","ZERO SIGNAL","DARK MATTER","STATIC WRAITH","NULL SPECTRE","VIOLET ECHO","PHANTOM BYTE","SILENT NODE","NEON SHADE"];
  const firstNames = ["Alex","Morgan","Riley","Jordan","Taylor","Casey","Avery","Rowan","Quinn","Skyler"];
  const surnames = ["Voss","Kade","Reed","Vale","Cross","Nyx","Arden","Blake","Sloane","Mercer"];
  const pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
  function generateProfile() {
    const custom = $("profileAlias").value.trim();
    const name = custom ? custom.toUpperCase() : pick(aliases);
    const archetype = $("profileClass").value;
    const toneName = $("profileTone").value;
    const id = "BP-" + Math.random().toString(16).slice(2, 6).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    const handle = "@" + name.toLowerCase().replace(/\s+/g, "_") + Math.floor(10 + Math.random() * 89);
    const email = name.toLowerCase().replace(/\s+/g, ".") + "@example.invalid";
    const created = new Date().toISOString().slice(0, 10);
    const fields = [
      ["PHANTOM ID", id], ["HANDLE", handle], ["ARCHETYPE", archetype.toUpperCase()], ["REGION", "SIMULATED / UNASSIGNED"],
      ["SIGNATURE", toneName.toUpperCase()], ["EMAIL", email], ["CREATED", created], ["STATUS", "FICTIONAL PROFILE"]
    ];
    $("profileResult").innerHTML = "";
    const card = document.createElement("div");
    card.className = "generated-profile";
    const head = document.createElement("div");
    head.className = "generated-profile-head";
    const avatar = document.createElement("div");
    avatar.className = "generated-avatar";
    avatar.textContent = name.split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2);
    const headCopy = document.createElement("div");
    const label = document.createElement("small"); label.textContent = "GENERATED PHANTOM IDENTITY";
    const title = document.createElement("h3"); title.textContent = name;
    const subtitle = document.createElement("p"); subtitle.textContent = archetype + " / " + id;
    headCopy.append(label, title, subtitle);
    head.append(avatar, headCopy);
    const grid = document.createElement("div");
    grid.className = "profile-fields";
    fields.forEach(function (field) {
      const item = document.createElement("div");
      item.className = "profile-field";
      const key = document.createElement("small"); key.textContent = field[0];
      const value = document.createElement("b"); value.textContent = field[1];
      item.append(key, value);
      grid.appendChild(item);
    });
    const disclaimer = document.createElement("div");
    disclaimer.className = "profile-fiction";
    disclaimer.textContent = "GENERATED LOCALLY · FICTIONAL IDENTITY · NOT A REAL PERSON";
    card.append(head, grid, disclaimer);
    $("profileResult").appendChild(card);
    addActivity("PROFILE GENERATED", name + " · fictional identity created locally.");
    appendDashboardLog("Fictional profile generated: " + name + ".", "term-violet");
    tone();
  }
  $("generateProfile").addEventListener("click", generateProfile);

  $("clearLogs").addEventListener("click", function () {
    activity = [];
    renderActivity();
    addActivity("HISTORY CLEARED", "Local activity history was reset.", true);
  });
  $("effectsToggle").addEventListener("change", function (event) {
    document.body.classList.toggle("no-effects", !event.target.checked);
  });
  $("soundToggle").addEventListener("change", function (event) {
    soundEnabled = event.target.checked;
    tone();
  });
  $("compactToggle").addEventListener("change", function (event) {
    document.body.classList.toggle("compact", event.target.checked);
  });

  addActivity("CORE INITIALIZED", "BYTE PHANTOM local simulator is ready.");
  addActivity("SAFE MODE ENABLED", "No external connections or real targets are used.");
  renderActivity();
  window.BYTE_PHANTOM = { showPage:showPage, operations:operations.map(function (op) { return op.id; }) };
})();
