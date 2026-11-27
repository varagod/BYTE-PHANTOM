/* BYTE PHANTOM — local-only cyber simulation interface */
(function () {
  "use strict";

  const operations = [
    { id:"system-scan", name:"SYSTEM INTELLIGENCE", icon:"▦", tone:"cyan-card", category:"recon", description:"Read live Windows host details: OS, CPU, memory, disk capacity, and active IPv4 adapters. Read-only; no network probing or system changes.", target:"THIS WINDOWS HOST", live:true },
    { id:"network-radar", name:"NETWORK RADAR", icon:"◎", tone:"cyan-card", category:"recon", description:"Actively discover private IPv4 hosts on directly connected local subnets, enrich them with ARP/MAC data, and monitor changes live. No port scans or external targets.", target:"DIRECTLY CONNECTED PRIVATE IPV4 SUBNETS", live:true, liveType:"network" },
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


  const operationStreams = {
    "system-scan": {phases:["PROFILE READ","RESOURCE AUDIT","SERVICE REVIEW","REPORT COMPILE"],visual:"┌── PHANTOM-8 WORKSTATION ───────────────┐\n│ CPU [████████░░] 68%   MEM [██████░░] │\n│ DISK [███████░░] 71%   TEMP 42°C      │\n│ SERVICES 07/07       ALERTS 00        │\n└───────────────────────────────────────┘",lines:["Reading synthetic host signature BP-WS-008","Mapping 8 virtual CPU threads and scheduler state","Sampling fictional memory map: 32 GB / 11.4 GB used","Indexing 7 mock services and 18 loaded components","Checking local resource thresholds: 3 metrics nominal","Comparing generated process table against baseline","No host APIs queried; telemetry is embedded sample data","Compiling workstation health card and checksum BP-8A21"],report:["HOST PHANTOM-8 / 8 VIRTUAL THREADS","MEMORY 32 GB MOCK / 35.6% OCCUPIED","SERVICES 07 ACTIVE / 00 FAULTS","HEALTH NOMINAL / BP-SCAN-8A21"],activity:"A workstation health card was assembled from embedded sample telemetry."},
    "network-radar": {phases:["GRID WAKE","NODE PLOT","LINK ANALYSIS","RADAR RENDER"],visual:" [N-01]────[N-02]\n    \\       /  \\\n   [N-03]──[N-04]──[N-05]\n       \\       /\n       [N-06]──[N-07]──[N-08]",lines:["Waking the offline radar canvas and sample coordinate grid","Allocating eight fictional nodes across the demo topology","Assigning generated signal strengths and node health values","Drawing edge paths between five imaginary relay links","Resolving two isolated nodes and one high-latency branch","Coloring node clusters by synthetic signal quality","Coordinates belong to bundled DEMO_GRID sample data","Rendering radial topology map with local-only metadata"],report:["NODES 08 FICTIONAL / LINKS 05 ACTIVE","STRONGEST SIGNAL NODE N-04 / 96%","ISOLATED NODES 02","RADAR FRAME GRID-08 / RENDERED LOCALLY"],activity:"Eight generated nodes and their mock links were plotted on the local radar."},
    "ip-trace": {phases:["ADDRESS PARSE","HOP SIMULATION","ROUTE PAINT","TRACE REPORT"],visual:"TRACE 192.0.2.44 [RESERVED EXAMPLE]\nSTART ─ H01 ─ H02 ─ H03\n                 └── H04 ─ H05 ─ END\nROUTE DEPTH: 06 MOCK HOPS",lines:["Parsing reserved documentation address 192.0.2.44","Creating a six-hop sample route from the local scenario seed","Assigning fictional latency values: 04 / 12 / 19 / 31 / 27 / 42 ms","Placing non-geographic route markers on a demo path","Adding one simulated branch to illustrate route divergence","Checking trace consistency against the embedded route template","No DNS lookup, geolocation request, socket, or packet was used","Painting the final trace card from generated sample values"],report:["DESTINATION 192.0.2.44 / DOCUMENTATION RANGE","ROUTE 06 SIMULATED HOPS / 04 → 42 MS","GEOGRAPHY NOT RESOLVED","TRACE CARD BP-TRACE-044"],activity:"A fictional six-hop route card was rendered for a reserved example address."},
    "device-infiltration": {phases:["DEVICE PROFILE","HANDSHAKE THEATRE","PERMISSION MAP","SESSION CLOSE"],visual:"MOCK_DEVICE_DELTA\n[BOOT] → [PAIR] → [AUTH] → [PROFILE]\n  │        │       │        │\nLOCAL   DEMO KEY  PASS     CLOSED",lines:["Loading generated device dossier MOCK_DEVICE_DELTA","Reading fictional model string: DLT-09 / firmware 4.2-demo","Animating a local handshake between two mock records","Comparing four imaginary permission layers","Displaying a sample device state: powered / disconnected","Generating a permission matrix with zero device calls","Bluetooth, USB, ADB, and discovery APIs remain unused","Sealing the mock session and clearing temporary state"],report:["DEVICE MOCK-DELTA / DLT-09","HANDSHAKE THEATRICAL SEQUENCE COMPLETE","PERMISSION LAYERS 04 SAMPLE RECORDS","PHYSICAL DEVICE NOT CONTACTED / SESSION CLOSED"],activity:"A fictional device profile and permission matrix were displayed."},
    "firewall-breach": {phases:["RULESET LOAD","PATTERN MATCH","PUZZLE RESOLVE","AUDIT CLOSE"],visual:"DEMO FIREWALL / RULE MATRIX\n01 ALLOW     ░░░░░░\n02 DENY      ██████\n03 DENY      ██████\n04 ALLOW     ░░░░░░\n05 CHALLENGE ▒▒▒▒▒▒\n06 ALLOW     ░░░░░░",lines:["Mounting the built-in firewall puzzle with 24 sample rules","Grouping mock entries into allow, deny, and challenge lanes","Comparing generated packet labels against the puzzle rule table","Highlighting three deliberate rule conflicts in the demo matrix","Applying the scenario's harmless resolution sequence","Rechecking the six visible rules for a consistent final state","The puzzle engine uses static local data and no network traffic","Exporting a color-coded firewall audit summary"],report:["RULES 24 MOCK ENTRIES / 03 CONFLICTS RESOLVED","DEMO POLICY CONSISTENT","EXTERNAL FIREWALL NOT CONNECTED","AUDIT BP-FW-024"],activity:"A six-row mock firewall matrix was reviewed and resolved."},
    "password-cracker": {phases:["SAMPLE HASH","TOY SEARCH","STRENGTH SCORE","DATA PURGE"],visual:"TOY HASH LAB\nHASH 7F3A-91C2\nMASK ****-****\nSPACE 16 SYMBOLS × 4 SLOTS\nMATCH TRAINING TOKEN ONLY",lines:["Creating an ephemeral training hash from the built-in toy phrase","Displaying a fictional four-slot character mask","Enumerating a deliberately tiny 16-symbol demonstration space","Scoring entropy against the simulator teaching rubric","Revealing the pre-seeded training token: GHOST-42","This toy result is not a real password recovery","No entered credentials, hashes, files, or accounts are accepted","Discarding the temporary token and synthetic hash"],report:["EXERCISE TOY HASH / 7F3A-91C2","TRAINING TOKEN GHOST-42","REAL CREDENTIALS NOT ACCEPTED","TEMPORARY VALUES DISCARDED"],activity:"A tiny built-in password-strength teaching puzzle was completed."},
    "camera-access": {phases:["VIRTUAL CHANNEL","FRAME SYNTHESIS","TELEMETRY DRAW","FEED SHUTDOWN"],visual:"VIRTUAL CAM 03 / GENERATED FRAME\n┌──────────────────────────┐\n│ . . . FRAME 003 . . .    │\n│     [ TEST PATTERN ]      │\n│ 00:00:03 / DEMO SIGNAL   │\n└──────────────────────────┘",lines:["Opening the internal VIRTUAL_CAM_03 scene renderer","Generating a synthetic test frame from geometric primitives","Drawing a timestamp, scan bars, and sample frame counter","Adding mock exposure and frame-rate telemetry","Simulating a three-frame buffer with no live video source","Confirming that browser camera permissions were never requested","No webcam, phone camera, stream, or media device is opened","Closing the virtual preview and releasing generated frames"],report:["CHANNEL VIRTUAL-CAM-03 / FRAME 003","PREVIEW GENERATED TEST GRAPHIC","TELEMETRY 30 FPS MOCK / EXPOSURE 0.7","PHYSICAL CAMERA NOT ACCESSED / FEED CLOSED"],activity:"A generated CCTV-style preview frame was rendered without camera access."},
    "satellite-link": {phases:["ORBIT CATALOG","BEACON ALIGN","TELEMETRY DRAW","LINK RELEASE"],visual:"       ✦ ORBIT-SIM-09\n   . . . . . . . . . . . .\n .      [ PLANET / DEMO ]    .\n   . . . . . . . . . . . .\n          GROUND NODE",lines:["Loading the bundled ORBITAL_SIM_NODE_09 profile","Drawing a fictional orbital path at 540 km altitude","Assigning synthetic beacon ID and carrier frequency","Animating antenna alignment against the demo orbit","Calculating sample link quality and signal-to-noise values","Rendering telemetry strip with generated orbital parameters","No radio, GPS, satellite modem, or external service is contacted","Releasing the visual link and closing the scene"],report:["SATELLITE ORBITAL-SIM-09 / ALTITUDE 540 KM","LINK QUALITY 98% DEMO","RADIO TRANSMISSION NONE","TELEMETRY GENERATED LOCALLY"],activity:"A fictional orbital link and synthetic satellite telemetry were visualized."},
    "mainframe-override": {phases:["CORE WAKE","LAYER INSPECT","CONTROL PUZZLE","STATE RESTORE"],visual:"PHANTOM MAINFRAME X\n┌ ROOT CONTROL ────────────┐\n├ LAYER 04 [ LOCKED ]      │\n├ LAYER 03 [ LOCKED ]      │\n├ LAYER 02 [ CHECK  ]      │\n└ LAYER 01 [ SANDBOX ] ────┘",lines:["Booting imaginary PHANTOM_MAINFRAME_X environment","Drawing five mock control layers and their access states","Comparing generated access tokens against puzzle rules","Resolving local sequence in the correct training order","Displaying state change in the fictional control stack","Verifying that only the simulator in-memory model changed","No operating-system privileges or remote mainframe are involved","Restoring every layer to its original demo state"],report:["MAINFRAME VIRTUAL-X / 05 DEMO LAYERS","PUZZLE RESOLVED LOCALLY","REAL SYSTEM STATE UNCHANGED","SANDBOX RESTORED"],activity:"The five-layer imaginary mainframe puzzle was resolved and reset."},
    "data-extraction": {phases:["ARCHIVE MOUNT","FILE INDEX","METADATA PASS","PACKAGE BUILD"],visual:"DEMO_ARCHIVE_001/\n├── logs/  kernel.log  session.log\n├── media/ frame_003.mock\n├── records/ index.json manifest.dat\n└── checksum.bp",lines:["Creating an in-memory sample archive DEMO_ARCHIVE_001","Enumerating 18 fictional entries across four demo folders","Reading mock file sizes, types, and timestamps from seed data","Building compact metadata index with synthetic checksums","Flagging two duplicate sample names for visual review","Packing display manifest and summary into a local report","No user files, folders, or storage locations are read","Removing temporary archive objects after report generation"],report:["FILES 18 FICTIONAL ITEMS / 04 FOLDERS","DUPLICATE LABELS 02","PACKAGE DEMO-PACKAGE-001","SOURCE BUILT-IN DATA / TEMP OBJECTS REMOVED"],activity:"A fictional archive tree and metadata index were generated in memory."},
    "digital-forensics": {phases:["CASE OPEN","ARTIFACT REVIEW","TIMELINE BUILD","EVIDENCE REPORT"],visual:"CASE PH-014 / EVENT TIMELINE\n09:14 ─ BOOT SAMPLE\n09:16 ─ MOCK LOGIN\n09:19 ─ FILE LABEL CHANGE\n09:23 ─ SESSION CLOSE\nALL TIMES FICTIONAL",lines:["Opening training evidence case PH-014 / sample bundle A","Indexing nine fictional artifacts and generated metadata","Sorting four sample events by embedded timestamps","Comparing a mock file label against the case baseline","Marking one anomaly and two routine events in the timeline","Calculating teaching checksum for the evidence summary","No real disks, browser history, devices, or system logs are read","Packaging forensic timeline and chain-of-custody example"],report:["CASE PH-014 / TRAINING SAMPLE","ARTIFACTS 09 MOCK ITEMS / 04 FICTIONAL EVENTS","ANOMALIES 01 TEACHING EXAMPLE","CONCLUSION DEMO REPORT READY"],activity:"A fictional evidence set was arranged into a four-event forensic timeline."},
    "encryption-breaker": {phases:["CIPHER LOAD","SUBSTITUTION MAP","TOY DECODE","VERIFY OUTPUT"],visual:"TOY CIPHER C-12\nINPUT  : KJHWY VQJPC\nKEY    : DEMO-5\nOUTPUT : GHOST SIGNAL\nMODE   : TRAINING PUZZLE",lines:["Loading the built-in toy cipher C-12 exercise","Creating a small substitution table from demo key DEMO-5","Mapping sample ciphertext KJHWY VQJPC character by character","Resolving training phrase GHOST SIGNAL from static puzzle data","Comparing decoded phrase against expected sample output","This exercise is not a real encryption attack","No external ciphertext, files, keys, or protected data are accepted","Verifying toy result and clearing the temporary mapping table"],report:["CIPHER C-12 / TOY EXERCISE","TRAINING OUTPUT GHOST SIGNAL","PUZZLE SOLVED LOCALLY","REAL ENCRYPTION UNTOUCHED / TABLE CLEARED"],activity:"The built-in C-12 toy cipher puzzle decoded to its training phrase."}
  };

  const pageTitles = {
    dashboard:"DASHBOARD", operations:"HACKING OPERATIONS", terminal:"DARK TERMINAL",
    profiles:"PROFILE GENERATOR", logs:"ACTIVITY LOGS", settings:"SETTINGS"
  };
  const pageIds = Object.keys(pageTitles);
  let selectedOperation = null;
  let operationTimer = null;
  let liveScanSequence = 0;
  let networkRadarMonitorTimer = null;
  let networkRadarRefreshBusy = false;
  let networkRadarForceActive = false;
  let networkRadarLastActiveSweepAt = 0;
  let networkRadarSessionToken = 0;
  let networkRadarKnownDevices = new Map();
  let networkRadarEvents = [];
  let operationCount = 0;
  let activity = [];
  const audioState = {
    context: null, masterGain: null, musicGain: null, sfxGain: null,
    masterEnabled: true, musicEnabled: true, sfxEnabled: true,
    musicVolume: 0.32, sfxVolume: 0.48, musicStarted: false,
    arpeggioTimer: null, noteIndex: 0
  };
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
  function loadAudioPreferences() {
    try {
      audioState.masterEnabled = localStorage.getItem("bpAudioMaster") !== "false";
      audioState.musicEnabled = localStorage.getItem("bpMusicEnabled") !== "false";
      audioState.sfxEnabled = localStorage.getItem("bpSfxEnabled") !== "false";
      const music = Number(localStorage.getItem("bpMusicVolume"));
      const sfx = Number(localStorage.getItem("bpSfxVolume"));
      if (Number.isFinite(music) && localStorage.getItem("bpMusicVolume") !== null) audioState.musicVolume = Math.max(0, Math.min(1, music));
      if (Number.isFinite(sfx) && localStorage.getItem("bpSfxVolume") !== null) audioState.sfxVolume = Math.max(0, Math.min(1, sfx));
    } catch (e) { /* Preferences are optional. */ }
  }
  function saveAudioPreferences() {
    try {
      localStorage.setItem("bpAudioMaster", String(audioState.masterEnabled));
      localStorage.setItem("bpMusicEnabled", String(audioState.musicEnabled));
      localStorage.setItem("bpSfxEnabled", String(audioState.sfxEnabled));
      localStorage.setItem("bpMusicVolume", String(audioState.musicVolume));
      localStorage.setItem("bpSfxVolume", String(audioState.sfxVolume));
    } catch (e) { /* Private browsing may disable storage. */ }
  }
  function updateAudioLevels() {
    if (!audioState.context) return;
    const ctx = audioState.context;
    if (audioState.musicGain) audioState.musicGain.gain.setTargetAtTime(
      audioState.masterEnabled && audioState.musicEnabled ? audioState.musicVolume : 0,
      ctx.currentTime, 0.28
    );
    if (audioState.sfxGain) audioState.sfxGain.gain.setTargetAtTime(
      audioState.masterEnabled && audioState.sfxEnabled ? audioState.sfxVolume : 0,
      ctx.currentTime, 0.035
    );
  }
  function syncAudioUi() {
    const button = $("audioToggle");
    if (button) {
      button.classList.toggle("is-active", audioState.masterEnabled);
      button.classList.toggle("is-muted", !audioState.masterEnabled);
      button.setAttribute("aria-pressed", String(audioState.masterEnabled));
      $("audioToggleLabel").textContent = audioState.masterEnabled ? "AUDIO ON" : "AUDIO MUTED";
      button.title = audioState.masterEnabled ? "Mute all audio" : "Enable music and sound";
    }
    if ($("musicToggle")) $("musicToggle").checked = audioState.musicEnabled;
    if ($("soundToggle")) $("soundToggle").checked = audioState.sfxEnabled;
    if ($("musicVolume")) $("musicVolume").value = String(Math.round(audioState.musicVolume * 100));
    if ($("sfxVolume")) $("sfxVolume").value = String(Math.round(audioState.sfxVolume * 100));
    if ($("musicVolumeValue")) $("musicVolumeValue").textContent = Math.round(audioState.musicVolume * 100) + "%";
    if ($("sfxVolumeValue")) $("sfxVolumeValue").textContent = Math.round(audioState.sfxVolume * 100) + "%";
    document.body.classList.toggle("audio-muted", !audioState.masterEnabled);
  }
  function startAmbientMusic() {
    if (!audioState.context || audioState.musicStarted) return;
    const ctx = audioState.context;
    const bus = audioState.musicGain;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 420;
    padFilter.Q.value = 0.7;
    padFilter.connect(bus);
    [
      { f:55, type:"sine", gain:0.23 },
      { f:82.41, type:"sine", gain:0.13 },
      { f:110, type:"triangle", gain:0.055 },
      { f:164.81, type:"sine", gain:0.035 }
    ].forEach(function (voice) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = voice.type;
      osc.frequency.value = voice.f;
      gain.gain.value = voice.gain;
      osc.connect(gain);
      gain.connect(padFilter);
      osc.start();
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.055;
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();

    const notes = [220, 164.81, 246.94, 196, 293.66, 220, 164.81, 146.83];
    audioState.arpeggioTimer = window.setInterval(function () {
      if (!audioState.musicEnabled || !audioState.masterEnabled || !audioState.context) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 780;
      osc.type = "sine";
      osc.frequency.value = notes[audioState.noteIndex % notes.length];
      audioState.noteIndex += 1;
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.035, t + 0.24);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      osc.connect(filter);
      filter.connect(env);
      env.connect(bus);
      osc.start(t);
      osc.stop(t + 2.85);
    }, 3100);
    audioState.musicStarted = true;
  }
  async function ensureAudio() {
    try {
      if (!audioState.context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;
        const ctx = new AudioContextClass();
        const master = ctx.createGain();
        const music = ctx.createGain();
        const sfx = ctx.createGain();
        master.gain.value = 0.72;
        music.gain.value = 0;
        sfx.gain.value = 0;
        music.connect(master);
        sfx.connect(master);
        master.connect(ctx.destination);
        audioState.context = ctx;
        audioState.masterGain = master;
        audioState.musicGain = music;
        audioState.sfxGain = sfx;
      }
      if (audioState.context.state === "suspended") await audioState.context.resume();
      startAmbientMusic();
      updateAudioLevels();
      return true;
    } catch (e) {
      return false;
    }
  }
  function playSfx(kind) {
    if (!audioState.masterEnabled || !audioState.sfxEnabled || !audioState.context) return;
    const patterns = {
      click: [{ f:620, d:0.055, a:0.025 }],
      nav: [{ f:520, d:0.06, a:0.025 }, { f:780, d:0.07, a:0.016, delay:0.035 }],
      start: [{ f:220, d:0.14, a:0.045 }, { f:440, d:0.19, a:0.025, delay:0.09 }],
      success: [{ f:523.25, d:0.13, a:0.035 }, { f:659.25, d:0.17, a:0.03, delay:0.1 }, { f:783.99, d:0.26, a:0.026, delay:0.2 }]
    };
    (patterns[kind] || patterns.click).forEach(function (note) {
      const ctx = audioState.context;
      const t = ctx.currentTime + (note.delay || 0);
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.f, t);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(note.a, t + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, t + note.d);
      osc.connect(env);
      env.connect(audioState.sfxGain);
      osc.start(t);
      osc.stop(t + note.d + 0.02);
    });
  }
  function tone() { playSfx("click"); }
  loadAudioPreferences();
  syncAudioUi();
  document.addEventListener("pointerdown", function () { ensureAudio(); }, { once:true, passive:true });
  document.addEventListener("keydown", function () { ensureAudio(); }, { once:true });

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
    button.dataset.state = operation.live ? "live" : "simulation";
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
    const state = document.createElement("em");
    state.className = "module-state " + (operation.live ? "module-state-live" : "module-state-sim");
    state.textContent = operation.live ? (operation.liveType === "network" ? "LIVE / ACTIVE LAN" : "LIVE / READ-ONLY") : "SIMULATION";
    info.appendChild(state);
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
    stopNetworkRadarMonitor();
    selectedOperation = operation;
    const liveOperation = operation.live === true;
    const networkOperation = operation.liveType === "network";
    ++liveScanSequence;
    networkRadarSessionToken = liveScanSequence;
    networkRadarKnownDevices = new Map();
    networkRadarEvents = [];
    networkRadarRefreshBusy = false;
    networkRadarForceActive = false;
    operationTimer = null;
    $("modalIcon").textContent = operation.icon;
    $("modalTitle").textContent = operation.name;
    $("modalDescription").textContent = operation.description;
    $("modalModeLabel").textContent = liveOperation ? (networkOperation ? "LIVE LAN RADAR / ACTIVE DISCOVERY" : "LIVE WINDOWS INTELLIGENCE") : "SIMULATION MODULE";
    $("modalTargetLabel").textContent = liveOperation ? (networkOperation ? "LOCAL NETWORK SCOPE" : "HOST SCOPE") : "SIMULATED TARGET";
    $("modalTarget").textContent = operation.target;
    $("modalTargetTag").textContent = liveOperation ? (networkOperation ? "PRIVATE IPV4 / ACTIVE" : "LOCAL / READ-ONLY") : "DEMO / FICTIONAL";
    $("modalSafety").textContent = liveOperation ? (networkOperation ? "PRIVATE LAN ONLY · ICMP + ARP DISCOVERY · NO PORT SCANNING" : "READ-ONLY INVENTORY · NO NETWORK PROBES · NO SYSTEM CHANGES") : "SIMULATED OUTPUT · NO REAL TARGET OR DEVICE ACCESS";
    $("operationModal").dataset.state = liveOperation ? "live" : "simulation";
    $("operationModal").dataset.operation = operation.id;
    $("networkRadarResults").hidden = true;
    $("networkInterfaceList").replaceChildren();
    $("networkNodeList").replaceChildren();
    $("networkRadarEventList").replaceChildren();
    $("progressArea").hidden = true;
    $("modalResult").hidden = true;
    $("modalResult").textContent = "";
    $("progressBar").style.width = "0%";
    $("progressPercent").textContent = "0%";
    $("progressOutput").textContent = "";
    $("progressLabel").textContent = "INITIALIZING";
    $("runOperation").disabled = false;
    $("runOperation").innerHTML = liveOperation ? (networkOperation ? "START ACTIVE NETWORK RADAR <span>↗</span>" : "RUN LIVE SYSTEM SCAN <span>↗</span>") : "INITIALIZE SIMULATION <span>▶</span>";
    $("operationModal").classList.add("open");
    $("operationModal").setAttribute("aria-hidden", "false");
    tone();
  }
  function closeOperation() {
    clearInterval(operationTimer);
    stopNetworkRadarMonitor();
    ++liveScanSequence;
    networkRadarSessionToken = liveScanSequence;
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
    if (operation.live === true) {
      if (operation.liveType === "network") runLiveNetworkRadar(operation);
      else runLiveSystemScan(operation);
      return;
    }
    const feed = operationStreams[operation.id];
    if (!feed) return;
    $("progressArea").hidden = false;
    $("modalResult").hidden = true;
    $("runOperation").disabled = true;
    $("runOperation").textContent = "RUNNING " + operation.name + "...";
    $("operationModal").dataset.operation = operation.id;
    $("progressArea").dataset.scene = operation.id;
    ensureAudio();
    playSfx("start");
    let tick = 0;
    const total = feed.lines.length;
    const phaseSize = Math.ceil(total / feed.phases.length);
    $("progressLabel").textContent = feed.phases[0];
    $("progressBar").style.width = "0%";
    $("progressPercent").textContent = "0%";
    $("progressOutput").textContent = feed.visual + "\n\n";
    operationTimer = setInterval(function () {
      $("progressOutput").textContent += "[" + String(tick + 1).padStart(2, "0") + "] " + feed.lines[tick] + "\n";
      tick += 1;
      const percent = Math.min(100, Math.round(tick / total * 100));
      $("progressBar").style.width = percent + "%";
      $("progressPercent").textContent = percent + "%";
      const phaseIndex = Math.min(feed.phases.length - 1, Math.floor((tick - 1) / phaseSize));
      $("progressLabel").textContent = tick >= total ? "GENERATING REPORT" : feed.phases[phaseIndex];
      const output = $("progressOutput"); output.scrollTop = output.scrollHeight;
      if (tick >= total) {
        clearInterval(operationTimer); operationTimer = null;
        finishOperation(operation, feed);
      }
    }, operation.id === "network-radar" || operation.id === "satellite-link" ? 245 : 215);
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) return "N/A";
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB", "PB"];
    let amount = bytes / 1024;
    let unit = 0;
    while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
    return amount.toFixed(2) + " " + units[unit];
  }
  function formatUptime(seconds) {
    let value = Math.max(0, Math.floor(Number(seconds) || 0));
    const days = Math.floor(value / 86400); value %= 86400;
    const hours = Math.floor(value / 3600); value %= 3600;
    const minutes = Math.floor(value / 60);
    return days + "d " + hours + "h " + minutes + "m";
  }

  function stopNetworkRadarMonitor() {
    if(networkRadarMonitorTimer) clearInterval(networkRadarMonitorTimer);
    networkRadarMonitorTimer=null;
    networkRadarRefreshBusy=false;
    networkRadarForceActive=false;
    const status=$("networkRadarMonitorState");
    if(status) status.textContent="MONITOR STOPPED";
  }

  function addNetworkRadarEvent(title,detail,warning=false) {
    networkRadarEvents.unshift({time:nowTime(),title,detail,warning});
    networkRadarEvents=networkRadarEvents.slice(0,24);
  }

  function updateNetworkRadarHistory(data) {
    const now=Date.now(),seen=new Set(),newEvents=[];
    data.devices.forEach(item=>{
      const mac=String(item.macAddress||"").toUpperCase();
      const key=mac&&mac!=="UNAVAILABLE"&&mac!=="UNKNOWN"?"MAC:"+mac:"IP:"+item.ipAddress;
      seen.add(key);
      const previous=networkRadarKnownDevices.get(key);
      if(!previous) {
        networkRadarKnownDevices.set(key,{...item,key,firstSeen:now,lastSeen:now,visibility:"PRESENT"});
        const event={title:"DEVICE DETECTED",detail:item.ipAddress+" · "+mac+" · "+item.interfaceName,warning:false};
        addNetworkRadarEvent(event.title,event.detail,false);newEvents.push(event);
      } else {
        if(previous.ipAddress!==item.ipAddress) {
          const event={title:"IP ADDRESS CHANGED",detail:mac+" · "+previous.ipAddress+" → "+item.ipAddress,warning:true};
          addNetworkRadarEvent(event.title,event.detail,true);newEvents.push(event);
        }
        if(previous.visibility==="NOT SEEN") {
          const event={title:"DEVICE REAPPEARED",detail:item.ipAddress+" · "+mac+" is visible again",warning:false};
          addNetworkRadarEvent(event.title,event.detail,false);newEvents.push(event);
        }
        networkRadarKnownDevices.set(key,{...previous,...item,key,firstSeen:previous.firstSeen,lastSeen:now,visibility:"PRESENT"});
      }
    });
    for(const [key,entry] of networkRadarKnownDevices.entries()) {
      if(!seen.has(key)&&entry.visibility!=="NOT SEEN"&&now-entry.lastSeen>=12000) {
        entry.visibility="NOT SEEN";
        const event={title:"NODE NO LONGER VISIBLE",detail:entry.ipAddress+" · "+entry.macAddress+" · absent from recent neighbor snapshots; may be asleep or cache-expired",warning:true};
        addNetworkRadarEvent(event.title,event.detail,true);newEvents.push(event);
      }
      if(now-entry.lastSeen>5*60*1000) networkRadarKnownDevices.delete(key);
    }
    return newEvents;
  }

  function renderNetworkRadarResults(data) {
    $("networkDeviceCount").textContent=String(data.deviceCount).padStart(2,"0");
    $("networkInterfaceCount").textContent=String(data.interfaces.length).padStart(2,"0");
    $("networkRadarMode").textContent=data.activeSweep?"ACTIVE":"LIVE WATCH";
    $("networkRadarDuration").textContent=data.durationMs+" ms";
    $("networkRadarHostsProbed").textContent=String(data.hostsProbed||0);
    $("networkRadarLastUpdate").textContent="LAST UPDATE "+new Date(data.collectedAt||Date.now()).toLocaleTimeString();
    $("networkRadarCoverage").textContent=(data.targetCount||0)+" LOCAL HOST TARGETS";
    const interfaceHost=$("networkInterfaceList");
    interfaceHost.replaceChildren();
    if(data.interfaces.length){
      data.interfaces.forEach(item=>{
        const card=document.createElement("div");card.className="network-interface-card";
        const name=document.createElement("b");name.textContent=item.name;
        const address=document.createElement("span");address.textContent=item.cidr;
        const mask=document.createElement("small");mask.textContent="IPv4 "+item.netmask+" · PREFIX /"+(item.prefix||"—");
        card.append(name,address,mask);interfaceHost.appendChild(card);
      });
    }else{
      const empty=document.createElement("div");empty.className="network-empty";empty.textContent="NO PRIVATE IPV4 INTERFACE FOUND";interfaceHost.appendChild(empty);
    }
    const nodeHost=$("networkNodeList");nodeHost.replaceChildren();
    const nodes=Array.from(networkRadarKnownDevices.values()).sort((a,b)=>{
      if(a.visibility!==b.visibility) return a.visibility==="PRESENT"?-1:1;
      return a.ipAddress.localeCompare(b.ipAddress,undefined,{numeric:true});
    });
    if(nodes.length){
      nodes.forEach(item=>{
        const card=document.createElement("article");card.className="network-node-card";card.dataset.visibility=item.visibility.toLowerCase().replace(/[^a-z0-9_-]/g,"");
        const marker=document.createElement("span");marker.className="network-node-marker";marker.textContent=item.visibility==="NOT SEEN"?"◌":"◉";
        const copy=document.createElement("div");copy.className="network-node-copy";
        const ip=document.createElement("b");ip.textContent=item.ipAddress;
        const details=document.createElement("small");details.textContent=item.macAddress+" / "+item.interfaceName+" / "+(item.responding?"ICMP REPLY":"ARP NEIGHBOR");
        copy.append(ip,details);
        const state=document.createElement("span");state.className="network-node-state";
        state.dataset.state=(item.visibility==="NOT SEEN"?"not-seen":item.responding?"reachable":item.state.toLowerCase()).replace(/[^a-z0-9_-]/g,"");
        state.textContent=item.visibility==="NOT SEEN"?"NOT SEEN":item.responding?"RESPONDS":item.state;
        card.append(marker,copy,state);nodeHost.appendChild(card);
      });
    }else{
      const empty=document.createElement("div");empty.className="network-empty";empty.textContent="NO DEVICES DISCOVERED YET · WAIT FOR THE FIRST ACTIVE SWEEP";nodeHost.appendChild(empty);
    }
    const eventHost=$("networkRadarEventList");eventHost.replaceChildren();
    if(networkRadarEvents.length){
      networkRadarEvents.slice(0,12).forEach(item=>{
        const row=document.createElement("div");row.className="network-event-card"+(item.warning?" is-warning":"");
        const time=document.createElement("time");time.textContent=item.time;
        const body=document.createElement("div");body.className="network-event-copy";
        const title=document.createElement("b");title.textContent=item.title;
        const detail=document.createElement("small");detail.textContent=item.detail;
        body.append(title,detail);row.append(time,body);eventHost.appendChild(row);
      });
    }else{
      const empty=document.createElement("div");empty.className="network-empty";empty.textContent="NO NETWORK CHANGES RECORDED";eventHost.appendChild(empty);
    }
    let note=data.limitations||"Discovery is limited to this host's directly connected local IPv4 subnets.";
    if(data.skippedScopes&&data.skippedScopes.length) note+=" Skipped: "+data.skippedScopes.map(x=>x.cidr+" ("+x.reason+")").join(" · ");
    $("networkRadarNote").textContent=note;
    const monitor=$("networkRadarMonitorState");
    if(monitor) monitor.textContent="LIVE MONITOR · 4 SEC REFRESH / ACTIVE SWEEP EACH 30 SEC";
    $("networkRadarResults").hidden=false;
  }

  async function refreshNetworkRadarSnapshot(operation,token,activeSweep) {
    const desktop=window.bytePhantomDesktop;
    if(networkRadarRefreshBusy||!desktop||typeof desktop.getNetworkRadar!=="function") return false;
    networkRadarRefreshBusy=true;
    try{
      const data=await desktop.getNetworkRadar({activeSweep:activeSweep===true});
      if(token!==networkRadarSessionToken||selectedOperation!==operation||!$("operationModal").classList.contains("open")) return false;
      if(!data||data.supported!==true) throw new Error(data&&data.reason?data.reason:"Active LAN discovery is unavailable on this platform.");
      const changes=updateNetworkRadarHistory(data);
      renderNetworkRadarResults(data);
      $("progressArea").hidden=false;
      $("progressBar").style.width="100%";$("progressPercent").textContent="100%";
      $("progressLabel").textContent=activeSweep?"ACTIVE IPV4 SWEEP COMPLETE":"LIVE NEIGHBOR WATCH UPDATED";
      $("progressOutput").textContent=[
        "╔══ BYTE PHANTOM / NETWORK RADAR ══════════════╗",
        "[SCOPE] "+data.scopes.length+" directly connected private IPv4 subnet(s)",
        "[ACTIVE] "+(activeSweep?data.hostsProbed+" one-shot ICMP host probes":"No active probes in this watch cycle"),
        "[ARP] "+data.deviceCount+" device record(s) with resolved link-layer addresses",
        "[ICMP] "+data.respondingCount+" host(s) replied to echo",
        "[EVENTS] "+changes.length+" new change event(s)",
        "[LIMIT] "+(data.skippedScopes||[]).length+" subnet(s) skipped by safety limits",
        "[SYSTEM] No configuration changes / no port scans / no external targets"
      ].join("\n");
      $("modalResult").hidden=false;
      $("modalResult").textContent="NETWORK RADAR / CONTINUOUS LOCAL MONITOR\n\n"+data.deviceCount+" device record(s) currently appear in the Windows neighbor table. "+data.respondingCount+" replied to ICMP. "+(data.hostsProbed||0)+" local host address(es) were probed in this cycle.\n\nThe radar refreshes neighbor data every 4 seconds and repeats the active sweep every 30 seconds. A missing node means it was not present in the latest snapshots; it is not proof that the device disconnected.\n\nScope: directly connected private IPv4 networks only. No port scan, credential test, exploit, or internet-wide scan.";
      $("runOperation").disabled=false;$("runOperation").textContent="ACTIVE RESCAN NOW";$("runStatus").textContent="LIVE RADAR";
      if(changes.length){
        changes.forEach(item=>addActivity("RADAR / "+item.title,item.detail,item.warning));
        appendDashboardLog("NETWORK RADAR: "+changes.length+" network change event(s).","term-green");
        playSfx("success");
      } else if(activeSweep) {
        appendDashboardLog("NETWORK RADAR: active sweep complete; "+data.deviceCount+" device record(s).","term-green");
      }
      return true;
    }catch(error){
      if(token===networkRadarSessionToken&&selectedOperation===operation&&$("operationModal").classList.contains("open")){
        const message=error&&error.message?error.message:"Unknown network radar error";
        $("progressLabel").textContent="RADAR UPDATE FAILED";$("progressOutput").textContent+="\n[ERROR] "+message;
        $("modalResult").hidden=false;$("modalResult").textContent="NETWORK RADAR UPDATE FAILED\n\n"+message+"\n\nThe next monitoring cycle will retry.";
        $("runOperation").disabled=false;$("runOperation").textContent="RETRY ACTIVE RADAR";$("runStatus").textContent="RADAR WARNING";
        addNetworkRadarEvent("RADAR UPDATE FAILED",message,true);
        renderNetworkRadarResults({deviceCount:0,interfaces:[],devices:[],durationMs:0,activeSweep:false,collectedAt:new Date().toISOString(),targetCount:0,hostsProbed:0,limitations:message});
      }
      return false;
    }finally{
      networkRadarRefreshBusy=false;
    }
  }

  function startNetworkRadarMonitor(operation,token) {
    if(networkRadarMonitorTimer) clearInterval(networkRadarMonitorTimer);
    networkRadarMonitorTimer=window.setInterval(async()=>{
      if(token!==networkRadarSessionToken||selectedOperation!==operation||!$("operationModal").classList.contains("open")) {
        stopNetworkRadarMonitor();return;
      }
      if(networkRadarRefreshBusy) return;
      const activeSweep=networkRadarForceActive||Date.now()-networkRadarLastActiveSweepAt>=30000;
      networkRadarForceActive=false;
      if(activeSweep) networkRadarLastActiveSweepAt=Date.now();
      await refreshNetworkRadarSnapshot(operation,token,activeSweep);
    },4000);
  }

  async function runLiveNetworkRadar(operation) {
    const desktop=window.bytePhantomDesktop;
    if(!desktop||typeof desktop.getNetworkRadar!=="function"){
      $("progressArea").hidden=false;$("progressLabel").textContent="WINDOWS DESKTOP REQUIRED";$("progressPercent").textContent="—";
      $("progressOutput").textContent="[BLOCKED] Active local IPv4 discovery requires the Windows desktop build.\n[INFO] No fabricated network devices are shown on browser or Android.";
      $("modalResult").hidden=false;$("modalResult").textContent="NETWORK RADAR UNAVAILABLE\n\nThis platform does not expose the Windows network-discovery bridge. No simulated nodes have been substituted.";
      $("runOperation").disabled=false;$("runOperation").textContent="TRY AGAIN";return;
    }
    if(networkRadarRefreshBusy){networkRadarForceActive=true;$("runOperation").textContent="ACTIVE RESCAN QUEUED";return;}
    const token=networkRadarSessionToken,runToken=-token;
    operationTimer=runToken;
    $("progressArea").hidden=false;$("networkRadarResults").hidden=true;$("modalResult").hidden=true;
    $("runOperation").disabled=true;$("runOperation").textContent="SCANNING LOCAL IPV4 SUBNETS...";
    $("progressLabel").textContent="ACTIVE IPV4 DISCOVERY";$("progressPercent").textContent="0%";$("progressBar").style.width="0%";
    $("progressOutput").textContent=[
      "╔══ BYTE PHANTOM / NETWORK RADAR ══════════════╗",
      "[INIT] Building host ranges from private IPv4 interfaces",
      "[SCOPE] Directly connected private LAN subnets only",
      "[ACTIVE] One ICMP echo request per target host; ARP cache enrichment",
      "[SAFE] No port scanning, credential tests, exploits, or external targets"
    ].join("\n");
    networkRadarLastActiveSweepAt=Date.now();
    try{
      const ok=await refreshNetworkRadarSnapshot(operation,token,true);
      if(ok&&token===networkRadarSessionToken&&selectedOperation===operation) startNetworkRadarMonitor(operation,token);
    }finally{
      if(operationTimer===runToken) operationTimer=null;
    }
  }

  async function runLiveSystemScan(operation) {
    const desktop = window.bytePhantomDesktop;
    if (!desktop || typeof desktop.getSystemSnapshot !== "function") {
      $("progressArea").hidden = false;
      $("progressLabel").textContent = "WINDOWS DESKTOP REQUIRED";
      $("progressPercent").textContent = "—";
      $("progressOutput").textContent = "[BLOCKED] Live host inventory is available in the Windows desktop build only.\n[INFO] Browser and Android builds do not fall back to fabricated system data.";
      $("modalResult").hidden = false;
      $("modalResult").textContent = "LIVE INVENTORY UNAVAILABLE\n\nThis platform does not expose the Windows desktop inventory bridge. No simulated values have been substituted.";
      $("runOperation").disabled = false;
      $("runOperation").textContent = "TRY AGAIN";
      return;
    }

    const runToken = -(++liveScanSequence);
    operationTimer = runToken;
    $("progressArea").hidden = false;
    $("modalResult").hidden = true;
    $("runOperation").disabled = true;
    $("runOperation").textContent = "READING LOCAL HOST...";
    $("progressLabel").textContent = "READ-ONLY HOST INVENTORY";
    $("progressPercent").textContent = "12%";
    $("progressBar").style.width = "12%";
    $("progressOutput").textContent = [
      "╔══ BYTE PHANTOM / SYSTEM INTELLIGENCE ══╗",
      "[INIT] Opening the local Windows inventory bridge",
      "[SAFE] Read-only system APIs only",
      "[SAFE] No sockets, probes, elevation, or configuration writes",
      "[READ] Waiting for host telemetry..."
    ].join("\n");

    try {
      const snapshot = await desktop.getSystemSnapshot();
      if (selectedOperation !== operation || !$("operationModal").classList.contains("open")) return;
      if (!snapshot || snapshot.supported !== true) {
        throw new Error(snapshot && snapshot.reason ? snapshot.reason : "Live inventory is not supported on this platform.");
      }

      const memoryUsed = snapshot.memory ? formatBytes(snapshot.memory.usedBytes) : "N/A";
      const memoryTotal = snapshot.memory ? formatBytes(snapshot.memory.totalBytes) : "N/A";
      const diskLine = snapshot.disk
        ? snapshot.disk.volume + " " + formatBytes(snapshot.disk.freeBytes) + " FREE / " + formatBytes(snapshot.disk.totalBytes)
        : "Disk capacity unavailable";
      const adapters = Array.isArray(snapshot.networkAdapters) && snapshot.networkAdapters.length
        ? snapshot.networkAdapters.map((item) => item.name + "  " + item.address + " / " + item.netmask)
        : ["No active non-loopback IPv4 adapters reported"];
      const lines = [
        "┏━━ BYTE PHANTOM / LIVE HOST PROFILE ━━━━━━━━━━━━━━━",
        "┃ HOST      " + snapshot.host.hostname,
        "┃ PLATFORM  " + snapshot.host.platform + " / " + snapshot.host.architecture,
        "┃ WINDOWS   " + snapshot.host.version + " / " + snapshot.host.release,
        "┣━━ PROCESSOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "┃ MODEL     " + snapshot.cpu.model,
        "┃ CORES     " + snapshot.cpu.logicalCores + " LOGICAL / " + snapshot.cpu.nominalSpeedMHz + " MHz",
        "┣━━ MEMORY & STORAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "┃ RAM       " + memoryUsed + " USED / " + memoryTotal + " TOTAL",
        "┃ DISK      " + diskLine,
        "┣━━ NETWORK INTERFACES (NO PROBES) ━━━━━━━━━━━━━━",
        ...adapters.map((line) => "┃ " + line),
        "┣━━ RUNTIME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "┃ UPTIME    " + formatUptime(snapshot.host.uptimeSeconds),
        "┃ ENGINE    Electron " + snapshot.runtime.electron + " / Node " + snapshot.runtime.node,
        "┃ VERSION   " + snapshot.appVersion,
        "┗━━ READ-ONLY SNAPSHOT / " + new Date(snapshot.collectedAt).toLocaleString() + " ━━"
      ];
      const report = [
        "HOST " + snapshot.host.hostname + " / WINDOWS " + snapshot.host.release,
        "CPU " + snapshot.cpu.model + " / " + snapshot.cpu.logicalCores + " LOGICAL CORES",
        "RAM " + memoryUsed + " USED / " + memoryTotal + " TOTAL",
        "DISK " + diskLine,
        "IPv4 ADAPTERS " + (snapshot.networkAdapters ? snapshot.networkAdapters.length : 0),
        "SCOPE READ-ONLY / NETWORK PROBES 0 / SYSTEM CHANGES 0"
      ];
      const activityText = "Read real Windows host inventory locally (OS, CPU, RAM, disk capacity, and IPv4 adapter metadata). No network probes or system changes were performed.";
      $("progressBar").style.width = "100%";
      $("progressPercent").textContent = "100%";
      $("progressLabel").textContent = "HOST INVENTORY COMPLETE";
      $("progressOutput").textContent = "[OK] Local host snapshot received.\n[OK] " + report[0] + "\n[OK] " + report[2] + "\n[SAFE] " + report[5];
      $("modalResult").hidden = false;
      $("modalResult").textContent = "✓ LIVE SYSTEM INTELLIGENCE / REPORT READY\n\n" + lines.join("\n") + "\n\n" + report.join("\n");
      $("runOperation").disabled = false;
      $("runOperation").textContent = "RUN AGAIN";
      operationCount += 1;
      $("runCount").textContent = String(operationCount).padStart(2, "0");
      $("runStatus").textContent = "LIVE OK";
      addActivity("LIVE SYSTEM INTELLIGENCE", activityText);
      appendDashboardLog("Live Windows host inventory completed. Read-only; no probes or changes.", "term-green");
      playSfx("success");
    } catch (error) {
      if (selectedOperation === operation && $("operationModal").classList.contains("open")) {
        const message = error && error.message ? error.message : "Unknown inventory error";
        $("progressLabel").textContent = "INVENTORY FAILED";
        $("progressOutput").textContent += "\n[ERROR] " + message;
        $("modalResult").hidden = false;
        $("modalResult").textContent = "LIVE INVENTORY FAILED\n\n" + message + "\n\nNo substitute or simulated host values were displayed.";
        $("runOperation").disabled = false;
        $("runOperation").textContent = "RETRY LIVE SCAN";
        $("runStatus").textContent = "LIVE ERROR";
        addActivity("LIVE SYSTEM SCAN ERROR", message, true);
      }
    } finally {
      if (operationTimer === runToken) operationTimer = null;
    }
  }

  function finishOperation(operation, feed) {
    operationCount += 1;
    $("runCount").textContent = String(operationCount).padStart(2, "0");
    $("runStatus").textContent = "COMPLETE";
    $("progressLabel").textContent = feed.phases[feed.phases.length - 1] + " / DONE";
    $("progressOutput").textContent += "\n[REPORT] " + feed.report[0] + "\n[LOCAL] Scenario data generated on this device.";
    $("modalResult").hidden = false;
    $("modalResult").textContent = "✓ " + operation.name + " / REPORT READY\n\n" + feed.visual + "\n\n" + feed.report.join("\n") + "\n\n" + feed.activity + "\n\nLOCAL SANDBOX: NO EXTERNAL CONNECTIONS";
    $("runOperation").disabled = false;
    $("runOperation").textContent = "RUN AGAIN";
    addActivity(operation.name, feed.activity);
    appendDashboardLog(operation.name + " report generated locally.", "term-green");
    playSfx("success");
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
        terminalLine("scan       - open the live Windows host inventory module");
        terminalLine("radar      - start active local IPv4 discovery and live network monitoring");
        terminalLine("whoami     - show the current fictional operator");
        terminalLine("date       - show this device's local date and time");
        terminalLine("profile    - open the fictional profile generator");
        terminalLine("clear      - clear terminal output");
        terminalLine("No shell, network, file-system, or external target commands are supported.", "warning");
        break;
      case "status":
        terminalLine("CORE: ONLINE | MODE: LOCAL / READ-ONLY + SIM MODULES", "success");
        terminalLine("LIVE MODULES: 01 / 12 | ALL OTHER MODULES: SIMULATED", "info");
        terminalLine("OPERATIONS THIS SESSION: " + operationCount, "info");
        break;
      case "modules":
        terminalLine("12 OPERATION MODULES + DARK TERMINAL + PROFILE GENERATOR", "success");
        operations.forEach(function (op) { terminalLine("  - " + op.name); });
        break;
      case "scan":
        terminalLine("Opening live, read-only Windows host inventory...", "info");
        openOperation("system-scan");
        break;
      case "radar":
        terminalLine("Opening active local IPv4 Network Radar and live change monitor...", "info");
        openOperation("network-radar");
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
    playSfx("success");
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
  $("audioToggle").addEventListener("click", async function () {
    audioState.masterEnabled = !audioState.masterEnabled;
    if (audioState.masterEnabled) await ensureAudio();
    updateAudioLevels();
    saveAudioPreferences();
    syncAudioUi();
    playSfx("nav");
  });
  $("musicToggle").addEventListener("change", async function (event) {
    audioState.musicEnabled = event.target.checked;
    if (audioState.musicEnabled) await ensureAudio();
    updateAudioLevels();
    saveAudioPreferences();
    syncAudioUi();
    playSfx("click");
  });
  $("soundToggle").addEventListener("change", async function (event) {
    audioState.sfxEnabled = event.target.checked;
    if (audioState.sfxEnabled) await ensureAudio();
    updateAudioLevels();
    saveAudioPreferences();
    syncAudioUi();
    playSfx("click");
  });
  $("musicVolume").addEventListener("input", function (event) {
    audioState.musicVolume = Number(event.target.value) / 100;
    updateAudioLevels();
    saveAudioPreferences();
    syncAudioUi();
  });
  $("sfxVolume").addEventListener("input", function (event) {
    audioState.sfxVolume = Number(event.target.value) / 100;
    updateAudioLevels();
    saveAudioPreferences();
    syncAudioUi();
  });
  $("compactToggle").addEventListener("change", function (event) {
    document.body.classList.toggle("compact", event.target.checked);
  });

  async function syncFullscreenUi() {
    let isFullscreen = !!document.fullscreenElement;
    if (window.bytePhantomDesktop && typeof window.bytePhantomDesktop.getWindowState === "function") {
      try {
        const state = await window.bytePhantomDesktop.getWindowState();
        isFullscreen = !!state.fullscreen;
      } catch (e) { /* Window state is optional in browser mode. */ }
    }
    const button = $("fullscreenToggle");
    button.classList.toggle("is-active", isFullscreen);
    button.setAttribute("aria-pressed", String(isFullscreen));
    $("fullscreenLabel").textContent = isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN";
    button.title = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
  }
  async function toggleFullscreen() {
    try {
      if (window.bytePhantomDesktop && typeof window.bytePhantomDesktop.toggleFullscreen === "function") {
        await window.bytePhantomDesktop.toggleFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI:"hide" });
      } else {
        addActivity("FULLSCREEN UNAVAILABLE", "This browser does not support the Fullscreen API.", true);
      }
      await syncFullscreenUi();
      playSfx("nav");
    } catch (e) {
      addActivity("FULLSCREEN BLOCKED", "The host window did not allow fullscreen mode.", true);
    }
  }
  $("fullscreenToggle").addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", syncFullscreenUi);
  window.addEventListener("resize", syncFullscreenUi);
  if (window.bytePhantomDesktop && typeof window.bytePhantomDesktop.onFullscreenChanged === "function") {
    window.bytePhantomDesktop.onFullscreenChanged(syncFullscreenUi);
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "F11") {
      event.preventDefault();
      toggleFullscreen();
    }
  });
  syncFullscreenUi();

  addActivity("CORE INITIALIZED", "BYTE PHANTOM local simulator is ready.");
  addActivity("SAFE MODE ENABLED", "No external connections or real targets are used.");
  renderActivity();
  window.BYTE_PHANTOM = { showPage:showPage, operations:operations.map(function (op) { return op.id; }) };
})();
