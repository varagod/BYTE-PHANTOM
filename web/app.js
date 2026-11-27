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
  let networkRadarLastSnapshot = null;
  let networkRadarSelectedNodeKey = null;
  let networkRadarAndroidPlugin = null;
  let networkRadarAndroidPluginError = null;
  const NETWORK_RADAR_STORAGE_KEY = "bytePhantomNetworkRadarJournal.v1";
  const NETWORK_RADAR_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
  const NETWORK_RADAR_MAX_DEVICES = 120;
  const NETWORK_RADAR_MAX_EVENTS = 160;
  const DNS_RESOLVER_HISTORY_KEY = "bytePhantomDnsResolverHistory.v1";
  const DNS_RESOLVER_HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
  const DNS_RESOLVER_HISTORY_MAX = 20;
  const OUTAGE_WATCH_STORAGE_KEY = "bytePhantomOutageWatch.v1";
  const OUTAGE_WATCH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
  const OUTAGE_WATCH_MAX_SAMPLES = 240;
  const OUTAGE_WATCH_MAX_EVENTS = 80;
  let outageWatchTimer = null;
  let outageWatchActive = false;
  let outageWatchSamples = [];
  let outageWatchEvents = [];
  let networkConnectivityProbeBusy = false;
  let dnsFailoverCandidates = [];
  let dnsFailoverState = null;
  let dnsFailoverActionBusy = false;
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
    stopOutageWatch();
    stopNetworkRadarMonitor();
    selectedOperation = operation;
    const liveOperation = operation.live === true;
    const networkOperation = operation.liveType === "network";
    ++liveScanSequence;
    networkRadarSessionToken = liveScanSequence;
    networkRadarKnownDevices = new Map();
    networkRadarEvents = [];
    networkRadarLastSnapshot = null;
    networkRadarSelectedNodeKey = null;
    if(networkOperation) restoreNetworkRadarJournal();
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
    stopOutageWatch();
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

  function networkRadarDeviceKey(item) {
    const mac=String(item.macAddress||"").toUpperCase();
    return mac&&mac!=="UNAVAILABLE"&&mac!=="UNKNOWN"&&mac!=="UNRESOLVED"&&mac!=="INCOMPLETE"?"MAC:"+mac:"IP:"+String(item.ipAddress||"");
  }

  function addNetworkRadarEvent(title,detail,warning=false) {
    const timestamp=new Date().toISOString();
    networkRadarEvents.unshift({timestamp,time:new Date(timestamp).toLocaleTimeString(),title,detail,warning:warning===true});
    networkRadarEvents=networkRadarEvents.slice(0,NETWORK_RADAR_MAX_EVENTS);
  }

  function saveNetworkRadarJournal() {
    try {
      const now=Date.now();
      const devices=Array.from(networkRadarKnownDevices.values())
        .filter(item=>Number.isFinite(Number(item.lastSeen))&&now-Number(item.lastSeen)<=NETWORK_RADAR_RETENTION_MS)
        .sort((a,b)=>Number(a.lastSeen)-Number(b.lastSeen))
        .slice(-NETWORK_RADAR_MAX_DEVICES)
        .map(item=>({
          key:String(item.key||networkRadarDeviceKey(item)),
          ipAddress:String(item.ipAddress||""),
          macAddress:String(item.macAddress||"UNAVAILABLE"),
          interfaceName:String(item.interfaceName||"UNKNOWN INTERFACE"),
          state:String(item.state||"UNKNOWN"),
          responding:item.responding===true,
          firstSeen:Number(item.firstSeen)||now,
          lastSeen:Number(item.lastSeen)||now,
          visibility:item.visibility==="NOT SEEN"?"NOT SEEN":"PRESENT"
        }));
      const events=networkRadarEvents
        .filter(item=>!item.timestamp||now-Date.parse(item.timestamp)<=NETWORK_RADAR_RETENTION_MS)
        .slice(0,NETWORK_RADAR_MAX_EVENTS);
      localStorage.setItem(NETWORK_RADAR_STORAGE_KEY,JSON.stringify({
        schemaVersion:1,
        savedAt:new Date(now).toISOString(),
        devices,
        events
      }));
      return true;
    } catch(error) {
      console.warn("BYTE PHANTOM: could not persist the local Network Radar journal.",error);
      return false;
    }
  }

  function restoreNetworkRadarJournal() {
    try {
      const raw=localStorage.getItem(NETWORK_RADAR_STORAGE_KEY);
      if(!raw) return;
      const saved=JSON.parse(raw);
      if(!saved||saved.schemaVersion!==1) return;
      const now=Date.now();
      const events=Array.isArray(saved.events)?saved.events:[];
      networkRadarEvents=events
        .filter(item=>item&&typeof item.title==="string"&&typeof item.detail==="string")
        .filter(item=>!item.timestamp||now-Date.parse(item.timestamp)<=NETWORK_RADAR_RETENTION_MS)
        .slice(0,NETWORK_RADAR_MAX_EVENTS)
        .map(item=>{
          const parsed=item.timestamp?new Date(item.timestamp):new Date();
          return {
            timestamp:!Number.isNaN(parsed.getTime())?parsed.toISOString():new Date().toISOString(),
            time:!Number.isNaN(parsed.getTime())?parsed.toLocaleTimeString():String(item.time||"—"),
            title:item.title,
            detail:item.detail,
            warning:item.warning===true
          };
        });
      const devices=Array.isArray(saved.devices)?saved.devices:[];
      devices.forEach(item=>{
        if(!item||typeof item.ipAddress!=="string"||!Number.isFinite(Number(item.lastSeen))) return;
        const lastSeen=Number(item.lastSeen);
        const firstSeen=Number(item.firstSeen)||lastSeen;
        if(now-lastSeen>NETWORK_RADAR_RETENTION_MS) return;
        const key=String(item.key||networkRadarDeviceKey(item));
        const wasPresent=item.visibility!=="NOT SEEN";
        const isStale=now-lastSeen>=12000;
        const restored={
          ...item,
          key,
          firstSeen,
          lastSeen,
          responding:isStale?false:item.responding===true,
          visibility:isStale?"NOT SEEN":(item.visibility==="NOT SEEN"?"NOT SEEN":"PRESENT")
        };
        networkRadarKnownDevices.set(key,restored);
        if(isStale&&wasPresent) {
          addNetworkRadarEvent(
            "NODE NOT VISIBLE AFTER REOPEN",
            item.ipAddress+" · last seen "+new Date(lastSeen).toLocaleString()+" · may be asleep, offline, or absent from the neighbor cache",
            true
          );
        }
      });
      const ordered=Array.from(networkRadarKnownDevices.entries()).sort((a,b)=>Number(a[1].lastSeen)-Number(b[1].lastSeen));
      while(ordered.length>NETWORK_RADAR_MAX_DEVICES) {
        const oldest=ordered.shift();
        networkRadarKnownDevices.delete(oldest[0]);
      }
      networkRadarEvents=networkRadarEvents.slice(0,NETWORK_RADAR_MAX_EVENTS);
      saveNetworkRadarJournal();
    } catch(error) {
      console.warn("BYTE PHANTOM: local Network Radar journal could not be restored.",error);
      networkRadarKnownDevices=new Map();
      networkRadarEvents=[];
    }
  }

  function updateNetworkRadarHistory(data) {
    const now=Date.now(),seen=new Set(),newEvents=[];
    data.devices.forEach(item=>{
      const key=networkRadarDeviceKey(item);
      seen.add(key);
      const previous=networkRadarKnownDevices.get(key);
      if(!previous) {
        networkRadarKnownDevices.set(key,{...item,key,firstSeen:now,lastSeen:now,visibility:"PRESENT"});
        const event={title:"DEVICE DETECTED",detail:item.ipAddress+" · "+String(item.macAddress||"UNAVAILABLE")+" · "+item.interfaceName,warning:false};
        addNetworkRadarEvent(event.title,event.detail,false);newEvents.push(event);
      } else {
        if(previous.ipAddress!==item.ipAddress) {
          const event={title:"IP ADDRESS CHANGED",detail:String(item.macAddress||previous.macAddress)+" · "+previous.ipAddress+" → "+item.ipAddress,warning:true};
          addNetworkRadarEvent(event.title,event.detail,true);newEvents.push(event);
        }
        if(previous.visibility==="NOT SEEN") {
          const event={title:"DEVICE REAPPEARED",detail:item.ipAddress+" · "+String(item.macAddress||"UNAVAILABLE")+" is visible again",warning:false};
          addNetworkRadarEvent(event.title,event.detail,false);newEvents.push(event);
        }
        networkRadarKnownDevices.set(key,{...previous,...item,key,firstSeen:previous.firstSeen,lastSeen:now,visibility:"PRESENT"});
      }
    });
    for(const [key,entry] of networkRadarKnownDevices.entries()) {
      if(!seen.has(key)&&entry.visibility!=="NOT SEEN"&&now-entry.lastSeen>=12000) {
        entry.visibility="NOT SEEN";
        entry.responding=false;
        const event={title:"NODE NO LONGER VISIBLE",detail:entry.ipAddress+" · "+entry.macAddress+" · absent from recent neighbor snapshots; may be asleep or cache-expired",warning:true};
        addNetworkRadarEvent(event.title,event.detail,true);newEvents.push(event);
      }
      if(now-Number(entry.lastSeen)>NETWORK_RADAR_RETENTION_MS) networkRadarKnownDevices.delete(key);
    }
    const ordered=Array.from(networkRadarKnownDevices.entries()).sort((a,b)=>Number(a[1].lastSeen)-Number(b[1].lastSeen));
    while(ordered.length>NETWORK_RADAR_MAX_DEVICES) {
      const oldest=ordered.shift();
      networkRadarKnownDevices.delete(oldest[0]);
    }
    networkRadarEvents=networkRadarEvents.slice(0,NETWORK_RADAR_MAX_EVENTS);
    saveNetworkRadarJournal();
    return newEvents;
  }

  function networkRadarReportDevices() {
    return Array.from(networkRadarKnownDevices.values()).sort((a,b)=>String(a.ipAddress).localeCompare(String(b.ipAddress),undefined,{numeric:true}));
  }

  function buildNetworkRadarJsonReport() {
    return {
      application:"BYTE PHANTOM",
      version:"1.13.0",
      generatedAt:new Date().toISOString(),
      privacy:"Generated locally. This report is copied only after the user requests it; BYTE PHANTOM does not upload this journal.",
      retentionDays:30,
      deviceCount:networkRadarKnownDevices.size,
      eventCount:networkRadarEvents.length,
      devices:networkRadarReportDevices(),
      events:networkRadarEvents
    };
  }

  function buildNetworkRadarCsvReport() {
    const headers=["ip_address","mac_address","interface_name","neighbor_state","visibility","responding","first_seen","last_seen"];
    const quote=value=>'"'+String(value===undefined||value===null?"":value).replace(/"/g,'""')+'"';
    const rows=[headers.map(quote).join(",")];
    networkRadarReportDevices().forEach(item=>{
      rows.push([
        item.ipAddress,item.macAddress,item.interfaceName,item.state,item.visibility,
        item.responding===true,new Date(Number(item.firstSeen)||0).toISOString(),
        new Date(Number(item.lastSeen)||0).toISOString()
      ].map(quote).join(","));
    });
    return "\uFEFF"+rows.join("\r\n");
  }

  async function copyNetworkRadarText(value) {
    if(navigator.clipboard&&typeof navigator.clipboard.writeText==="function") {
      try { await navigator.clipboard.writeText(value); return true; } catch(error) { /* Use the local textarea fallback below. */ }
    }
    const field=document.createElement("textarea");
    field.value=value;
    field.setAttribute("readonly","");
    field.style.position="fixed";
    field.style.left="-9999px";
    field.style.top="0";
    document.body.appendChild(field);
    field.select();
    let copied=false;
    try { copied=document.execCommand("copy"); } catch(error) { copied=false; }
    field.remove();
    return copied;
  }

  function updateNetworkRadarJournalStatus() {
    const status=$("networkRadarJournalStatus");
    if(status) status.textContent=networkRadarKnownDevices.size+" DEVICES / "+networkRadarEvents.length+" EVENTS SAVED LOCALLY";
  }

  function renderNetworkRadarTopology(data) {
    const svg=$("networkTopologySvg");
    if(!svg) return;
    const ns="http://www.w3.org/2000/svg";
    const make=(tag,attrs={},label)=>{
      const el=document.createElementNS(ns,tag);
      Object.keys(attrs).forEach(key=>el.setAttribute(key,String(attrs[key])));
      if(label!==undefined&&label!==null) el.textContent=String(label);
      return el;
    };
    const cx=380,cy=190,width=760,height=380;
    const known=Array.from(networkRadarKnownDevices.values());
    const present=known.filter(item=>item.visibility!=="NOT SEEN");
    const responding=present.filter(item=>item.responding===true);
    const notSeen=known.filter(item=>item.visibility==="NOT SEEN");
    $("networkTopologyTotal").textContent=String(known.length).padStart(2,"0");
    $("networkTopologyPresent").textContent=String(present.length).padStart(2,"0");
    $("networkTopologyResponding").textContent=String(responding.length).padStart(2,"0");
    $("networkTopologyHistory").textContent=String(notSeen.length).padStart(2,"0");
    const scopeHost=$("networkTopologyScopes");
    scopeHost.replaceChildren();
    const scopes=Array.isArray(data.scopes)?data.scopes:[];
    (scopes.length?scopes:[{cidr:"NO ELIGIBLE PRIVATE IPV4 SUBNET",interfaceName:""}]).forEach(scope=>{
      const chip=document.createElement("span");
      chip.className="network-topology-scope"+(scopes.length?"":" is-muted");
      chip.textContent=String(scope.cidr)+" · "+String(scope.interfaceName||"");
      scopeHost.appendChild(chip);
    });
    svg.replaceChildren();
    const grid=make("g",{"class":"topology-grid"});
    for(let x=20;x<width;x+=38) grid.appendChild(make("line",{x1:x,y1:16,x2:x,y2:height-16}));
    for(let y=20;y<height;y+=38) grid.appendChild(make("line",{x1:16,y1:y,x2:width-16,y2:y}));
    svg.appendChild(grid);
    svg.appendChild(make("circle",{cx,cy,r:154,"class":"topology-orbit"}));
    svg.appendChild(make("circle",{cx,cy,r:112,"class":"topology-orbit topology-orbit-inner"}));
    const ordered=known.slice().sort((a,b)=>{
      const rank=item=>item.visibility==="NOT SEEN"?0:item.responding?2:1;
      return rank(b)-rank(a)||Number(b.lastSeen||0)-Number(a.lastSeen||0);
    });
    const visible=ordered.slice(0,18);
    const point=(index,total)=>({x:cx+Math.cos(-Math.PI/2+Math.PI*2*index/Math.max(total,1))*272,y:cy+Math.sin(-Math.PI/2+Math.PI*2*index/Math.max(total,1))*145});
    const edgeLayer=make("g",{"class":"topology-edges"});
    visible.forEach((item,index)=>{
      const p=point(index,visible.length);
      const kind=item.visibility==="NOT SEEN"?"not-seen":item.responding?"responding":"neighbor";
      edgeLayer.appendChild(make("line",{x1:cx,y1:cy,x2:p.x,y2:p.y,"class":"topology-edge "+kind}));
    });
    svg.appendChild(edgeLayer);
    const center=make("g",{"class":"topology-center"});
    center.appendChild(make("circle",{cx,cy,r:47,"class":"topology-center-halo"}));
    center.appendChild(make("rect",{x:cx-82,y:cy-31,width:164,height:62,rx:9,"class":"topology-center-card"}));
    center.appendChild(make("text",{x:cx,y:cy-5,"text-anchor":"middle","class":"topology-center-title"},"LOCAL SCANNER"));
    const localAddress=(Array.isArray(data.interfaces)?data.interfaces:[]).slice(0,2).map(item=>item.address).filter(Boolean).join(" / ");
    center.appendChild(make("text",{x:cx,y:cy+14,"text-anchor":"middle","class":"topology-center-subtitle"},localAddress||"THIS DEVICE"));
    svg.appendChild(center);
    visible.forEach((item,index)=>{
      const p=point(index,visible.length);
      const kind=item.visibility==="NOT SEEN"?"not-seen":item.responding?"responding":"neighbor";
      const key=String(item.key||networkRadarDeviceKey(item));
      const selected=key===networkRadarSelectedNodeKey;
      const node=make("g",{
        "class":"topology-node "+kind+(selected?" is-selected":""),
        tabindex:"0",role:"button","aria-pressed":selected?"true":"false",
        "aria-label":"Select observed device "+item.ipAddress+" / "+String(item.macAddress||"MAC unavailable")
      });
      node.appendChild(make("circle",{cx:p.x,cy:p.y,r:25,"class":"topology-node-halo"}));
      node.appendChild(make("circle",{cx:p.x,cy:p.y,r:17,"class":"topology-node-core"}));
      node.appendChild(make("text",{x:p.x,y:p.y+4,"text-anchor":"middle","class":"topology-node-mark"},"·"+String(item.ipAddress||"").split(".").pop()));
      node.appendChild(make("text",{x:p.x,y:p.y+35,"text-anchor":"middle","class":"topology-node-label"},kind==="responding"?"REPLY":kind==="neighbor"?"NEIGHBOR":"HISTORY"));
      node.appendChild(make("title",{},item.ipAddress+" · "+String(item.macAddress||"MAC unavailable")+" · "+String(item.interfaceName||"interface unknown")));
      const select=()=>{
        networkRadarSelectedNodeKey=key;
        renderNetworkRadarTopology(data);
      };
      node.addEventListener("click",select);
      node.addEventListener("keydown",event=>{
        if(event.key==="Enter"||event.key===" "){event.preventDefault();select();}
      });
      svg.appendChild(node);
    });
    $("networkTopologyOverflow").textContent=known.length>visible.length?"+"+(known.length-visible.length)+" MORE DEVICE(S) IN THE DISCOVERED DEVICE LIST":"";
    const detail=$("networkTopologySelected");
    const selectedItem=known.find(item=>String(item.key||networkRadarDeviceKey(item))===networkRadarSelectedNodeKey)||visible[0]||null;
    if(selectedItem){
      networkRadarSelectedNodeKey=String(selectedItem.key||networkRadarDeviceKey(selectedItem));
      const title=document.createElement("b");title.textContent=selectedItem.ipAddress;
      const status=document.createElement("span");
      const stateKind=selectedItem.visibility==="NOT SEEN"?"not-seen":selectedItem.responding?"responding":"neighbor";
      status.className="network-topology-selected-state "+stateKind;
      status.textContent=stateKind==="not-seen"?"NOT SEEN RECENTLY":stateKind==="responding"?"ICMP RESPONSE":"NEIGHBOR RECORD";
      const details=document.createElement("small");
      details.textContent="MAC "+String(selectedItem.macAddress||"UNAVAILABLE")+" · INTERFACE "+String(selectedItem.interfaceName||"UNKNOWN")+" · STATE "+String(selectedItem.state||"UNKNOWN");
      const times=document.createElement("small");
      times.textContent="FIRST SEEN "+new Date(Number(selectedItem.firstSeen)||Date.now()).toLocaleString()+" · LAST SEEN "+new Date(Number(selectedItem.lastSeen)||Date.now()).toLocaleString();
      detail.replaceChildren(title,status,details,times);
    }else{
      const empty=document.createElement("span");
      empty.textContent="No peers are in the local journal yet. Start an active scan to populate this observed network map.";
      detail.replaceChildren(empty);
    }
    $("networkTopologyLegend").hidden=known.length===0;
    $("networkTopologyEmpty").hidden=known.length!==0;
  }

  function renderNetworkPathDetails(path) {
    const host=$("networkPathGrid"); if(!host) return; host.replaceChildren();
    const rows=[["DEFAULT GATEWAY",path&&path.gateway||"NOT REPORTED"],["DNS RESOLVERS",path&&Array.isArray(path.dnsServers)&&path.dnsServers.length?path.dnsServers.join(" · "):"NOT REPORTED"],["ACTIVE LINK",path&&path.transport||"UNKNOWN"],["NETWORK INTERFACE",path&&path.interfaceName||"UNKNOWN"],["LOCAL ADDRESSES",path&&Array.isArray(path.addresses)&&path.addresses.length?path.addresses.join(" · "):"NOT REPORTED"],["DEFAULT ROUTE",path&&path.defaultRoute===true?"PRESENT":path&&path.defaultRoute===false?"NOT FOUND":"UNKNOWN"]];
    rows.forEach(([label,value])=>{const card=document.createElement("div");card.className="network-path-card";const title=document.createElement("small");title.textContent=label;const content=document.createElement("b");content.textContent=value;card.append(title,content);host.appendChild(card);});
    const note=document.createElement("p");note.className="network-path-note";note.textContent=path&&path.source?path.source+" · READ-ONLY CONFIGURATION SNAPSHOT":"Routing and DNS details are unavailable on this platform.";host.appendChild(note);
  }

  function renderNetworkRadarResults(data) {
    $("networkDeviceCount").textContent=String(data.deviceCount).padStart(2,"0");
    $("networkInterfaceCount").textContent=String(data.interfaces.length).padStart(2,"0");
    $("networkRadarMode").textContent=data.activeSweep?"ACTIVE":"LIVE WATCH";
    $("networkRadarDuration").textContent=data.durationMs+" ms";
    $("networkRadarHostsProbed").textContent=String(data.hostsProbed||0);
    $("networkRadarLastUpdate").textContent="LAST UPDATE "+new Date(data.collectedAt||Date.now()).toLocaleTimeString();
    $("networkRadarCoverage").textContent=(data.targetCount||0)+" LOCAL HOST TARGETS";
    renderNetworkRadarTopology(data);
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
    renderNetworkPathDetails(data.networkPath||null);
    const nodeHost=$("networkNodeList");nodeHost.replaceChildren();
    updateNetworkRadarJournalStatus();
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
        const seen=document.createElement("small");seen.className="network-node-seen";seen.textContent="FIRST "+new Date(Number(item.firstSeen)||Date.now()).toLocaleString()+" / LAST "+new Date(Number(item.lastSeen)||Date.now()).toLocaleString();
        copy.append(ip,details,seen);
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

  function restoreOutageWatchHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(OUTAGE_WATCH_STORAGE_KEY) || "{}");
      const cutoff = Date.now() - OUTAGE_WATCH_RETENTION_MS;
      outageWatchSamples = (Array.isArray(parsed.samples) ? parsed.samples : [])
        .filter(item => item && Number.isFinite(Date.parse(item.at)) && Date.parse(item.at) >= cutoff)
        .slice(0, OUTAGE_WATCH_MAX_SAMPLES);
      outageWatchEvents = (Array.isArray(parsed.events) ? parsed.events : [])
        .filter(item => item && Number.isFinite(Date.parse(item.startedAt)) && Date.parse(item.startedAt) >= cutoff)
        .slice(0, OUTAGE_WATCH_MAX_EVENTS);
    } catch (error) {
      outageWatchSamples = [];
      outageWatchEvents = [];
    }
  }

  function saveOutageWatchHistory() {
    const cutoff = Date.now() - OUTAGE_WATCH_RETENTION_MS;
    outageWatchSamples = outageWatchSamples
      .filter(item => Number.isFinite(Date.parse(item.at)) && Date.parse(item.at) >= cutoff)
      .slice(0, OUTAGE_WATCH_MAX_SAMPLES);
    outageWatchEvents = outageWatchEvents
      .filter(item => Number.isFinite(Date.parse(item.startedAt)) && Date.parse(item.startedAt) >= cutoff)
      .slice(0, OUTAGE_WATCH_MAX_EVENTS);
    try {
      localStorage.setItem(OUTAGE_WATCH_STORAGE_KEY, JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        samples: outageWatchSamples,
        events: outageWatchEvents
      }));
    } catch (error) {
      const feedback = $("outageWatchFeedback");
      if (feedback) feedback.textContent = "LOCAL HISTORY COULD NOT BE SAVED: " + String(error && error.message ? error.message : error);
    }
  }

  function outageWatchIsIssue(state) {
    return state === "NO DEFAULT ROUTE" || state === "DNS FAILURE" || state === "HTTPS UNREACHABLE";
  }

  function classifyOutageWatchResult(result) {
    const path = result && result.networkPath ? result.networkPath : {};
    const gateway = result && result.gatewayProbe ? result.gatewayProbe : {};
    const dns = result && result.dns ? result.dns : {};
    const httpsRows = Array.isArray(result && result.https) ? result.https : [];
    const dnsOk = dns.ok === true;
    const httpsOk = httpsRows.some(item => item && item.ok === true);
    const validLatency = value => {
      const number = Number(value);
      return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
    };
    const httpsSuccessfulLatencies = httpsRows
      .filter(item => item && item.ok === true)
      .map(item => validLatency(item.latencyMs))
      .filter(value => value !== null)
      .sort((a, b) => a - b);
    const httpsLatencyMs = httpsSuccessfulLatencies.length
      ? httpsSuccessfulLatencies.length % 2
        ? httpsSuccessfulLatencies[(httpsSuccessfulLatencies.length - 1) / 2]
        : Math.round((httpsSuccessfulLatencies[httpsSuccessfulLatencies.length / 2 - 1] + httpsSuccessfulLatencies[httpsSuccessfulLatencies.length / 2]) / 2)
      : null;
    let state = "INDETERMINATE";
    let diagnosis = "The available probes did not establish a clear connectivity state.";

    if (httpsOk) {
      state = "ONLINE";
      diagnosis = "At least one fixed HTTPS endpoint responded. This confirms reachability to that service only.";
    } else if (path.defaultRoute === false) {
      state = "NO DEFAULT ROUTE";
      diagnosis = "The operating system did not report an active IPv4 default route.";
    } else if (!dnsOk && gateway.replied === true) {
      state = "DNS FAILURE";
      diagnosis = "The gateway answered ICMP, but the system resolver could not resolve the test hostname.";
    } else if (dnsOk && httpsRows.length > 0) {
      state = "HTTPS UNREACHABLE";
      diagnosis = "System DNS succeeded, but neither fixed HTTPS test endpoint responded.";
    } else {
      diagnosis = "The path is unconfirmed. A gateway that ignores ICMP may still forward traffic.";
    }

    return {
      state,
      diagnosis,
      dnsOk,
      httpsOk,
      gatewayStatus: String(gateway.status || "UNKNOWN"),
      defaultRoute: path.defaultRoute === true ? true : path.defaultRoute === false ? false : null,
      durationMs: validLatency(result && result.durationMs),
      gatewayLatencyMs: gateway.replied === true ? validLatency(gateway.latencyMs) : null,
      dnsLatencyMs: dnsOk ? validLatency(dns.latencyMs) : null,
      httpsLatencyMs
    };
  }

  function outageWatchIsIssue(state) {
    return state === "NO DEFAULT ROUTE" || state === "DNS FAILURE" || state === "HTTPS UNREACHABLE";
  }

  function recordOutageWatchResult(result) {
    const classification = classifyOutageWatchResult(result);
    const at = new Date().toISOString();
    const previous = outageWatchSamples[0] || null;
    const sample = {
      at,
      state: classification.state,
      diagnosis: classification.diagnosis,
      gatewayStatus: classification.gatewayStatus,
      defaultRoute: classification.defaultRoute,
      dnsOk: classification.dnsOk,
      httpsOk: classification.httpsOk,
      durationMs: classification.durationMs,
      gatewayLatencyMs: classification.gatewayLatencyMs,
      dnsLatencyMs: classification.dnsLatencyMs,
      httpsLatencyMs: classification.httpsLatencyMs,
      incidentStatus: "NO ACTIVE INCIDENT"
    };

    const openIncident = outageWatchEvents.find(item => !item.resolvedAt);
    let transition = null;
    if (openIncident) {
      if (outageWatchIsIssue(classification.state)) {
        openIncident.lastState = classification.state;
        openIncident.recoveryPendingAt = null;
        sample.incidentStatus = "INCIDENT ACTIVE";
      } else if (classification.state === "ONLINE") {
        if (openIncident.recoveryPendingAt && previous && previous.state === "ONLINE") {
          openIncident.recoveryObservedAt = openIncident.recoveryPendingAt;
          openIncident.resolvedAt = at;
          openIncident.recoveryConfirmedAt = at;
          openIncident.durationMs = Math.max(0, Date.parse(openIncident.recoveryObservedAt) - Date.parse(openIncident.startedAt));
          openIncident.recoveryPendingAt = null;
          transition = "CONNECTIVITY RESTORED AFTER " + formatOutageWatchDuration(openIncident.durationMs) + " (TWO CHECKS CONFIRMED)";
          sample.incidentStatus = "RECOVERY CONFIRMED";
        } else {
          openIncident.recoveryPendingAt = at;
          sample.incidentStatus = "RECOVERY PENDING · NEEDS ONE MORE SUCCESSFUL CHECK";
        }
      } else {
        openIncident.recoveryPendingAt = null;
        sample.incidentStatus = "INCIDENT OPEN · PROBE INCONCLUSIVE";
      }
    } else if (outageWatchIsIssue(classification.state)) {
      if (previous && outageWatchIsIssue(previous.state)) {
        const incident = {
          startedAt: previous.at,
          confirmedAt: at,
          state: previous.state,
          lastState: classification.state,
          recoveryPendingAt: null,
          recoveryObservedAt: null,
          recoveryConfirmedAt: null,
          resolvedAt: null,
          durationMs: null
        };
        outageWatchEvents.unshift(incident);
        transition = "CONNECTIVITY ISSUE CONFIRMED: " + classification.state + " (TWO CONSECUTIVE CHECKS)";
        sample.incidentStatus = "ISSUE CONFIRMED";
      } else {
        sample.incidentStatus = "PENDING ISSUE CONFIRMATION";
      }
    }

    outageWatchSamples.unshift(sample);
    saveOutageWatchHistory();
    renderOutageWatchHistory();
    return { sample, transition };
  }

  function medianOutageWatchMetric(field) {
    const values = outageWatchSamples
      .filter(item => item && Number.isFinite(Number(item[field])) && item[field] !== null)
      .slice(0, 12)
      .map(item => Number(item[field]))
      .sort((a, b) => a - b);
    if (!values.length) return null;
    const middle = Math.floor(values.length / 2);
    return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  }

  function renderOutageWatchQualityTrend() {
    const host = $("outageWatchQualityTrend");
    if (!host) return;
    host.replaceChildren();
    const samples = outageWatchSamples.slice(0, 12).reverse();
    const points = samples.filter(item => item.dnsLatencyMs !== null || item.httpsLatencyMs !== null);
    if (!points.length) {
      const empty = document.createElement("div");
      empty.className = "outage-watch-empty";
      empty.textContent = "NO SUCCESSFUL DNS / HTTPS LATENCY SAMPLES YET";
      host.appendChild(empty);
      return;
    }
    const values = points.flatMap(item => [item.dnsLatencyMs, item.httpsLatencyMs])
      .filter(value => value !== null && Number.isFinite(Number(value)))
      .map(Number);
    const ceiling = Math.max(1, ...values);
    points.forEach(item => {
      const group = document.createElement("div");
      group.className = "outage-watch-quality-bar-group";
      group.setAttribute("aria-label", formatOutageWatchTime(item.at));
      [["dns", item.dnsLatencyMs], ["https", item.httpsLatencyMs]].forEach(([kind, value]) => {
        const bar = document.createElement("i");
        bar.className = "outage-watch-quality-bar outage-watch-quality-bar-" + kind;
        const valid = value !== null && Number.isFinite(Number(value));
        bar.style.height = valid ? Math.max(3, Number(value) / ceiling * 58) + "px" : "2px";
        bar.dataset.empty = valid ? "false" : "true";
        bar.title = kind.toUpperCase() + ": " + (valid ? Math.round(Number(value)) + " ms" : "no successful sample") + " · " + formatOutageWatchTime(item.at);
        group.appendChild(bar);
      });
      const time = document.createElement("small");
      time.textContent = new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      group.appendChild(time);
      host.appendChild(group);
    });
  }

  function formatOutageWatchDuration(value) {
    const ms = Math.max(0, Number(value) || 0);
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + " SEC";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " MIN " + (seconds % 60) + " SEC";
    const hours = Math.floor(minutes / 60);
    return hours + " HR " + (minutes % 60) + " MIN";
  }

  function formatOutageWatchTime(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString() : "UNKNOWN TIME";
  }

  function getOutageWatchIntervalMs() {
    const selector = $("outageWatchInterval");
    const value = selector ? Number(selector.value) : 60000;
    return [30000, 60000, 300000].includes(value) ? value : 60000;
  }

  function updateOutageWatchControls() {
    const button = $("toggleOutageWatch");
    const status = $("outageWatchStatus");
    if (button) button.textContent = outageWatchActive ? "STOP OUTAGE WATCH" : "START OUTAGE WATCH";
    if (status) {
      status.textContent = outageWatchActive
        ? "WATCH ACTIVE · CHECK EVERY " + (getOutageWatchIntervalMs() / 1000) + " SEC"
        : "WATCH STOPPED · HISTORY REMAINS ON THIS DEVICE";
    }
  }

  function renderOutageWatchHistory() {
    const latest = outageWatchSamples[0] || null;
    const state = $("outageWatchCurrentState");
    const sampleCount = $("outageWatchSampleCount");
    const incidentCount = $("outageWatchIncidentCount");
    const history = $("outageWatchHistory");
    const events = $("outageWatchEvents");
    const feedback = $("outageWatchFeedback");

    if (state) {
      state.textContent = latest
        ? latest.incidentStatus === "PENDING ISSUE CONFIRMATION" ? "VERIFYING · " + latest.state
          : latest.incidentStatus && latest.incidentStatus.startsWith("RECOVERY PENDING") ? "VERIFYING RECOVERY"
          : latest.state
        : "NOT MONITORED";
      state.dataset.state = latest ? latest.state.toLowerCase().replace(/[^a-z]+/g, "-") : "idle";
    }
    if (sampleCount) sampleCount.textContent = String(outageWatchSamples.length);
    if (incidentCount) incidentCount.textContent = String(outageWatchEvents.length);
    if (history) {
      history.replaceChildren();
      if (!outageWatchSamples.length) {
        const empty = document.createElement("div");
        empty.className = "outage-watch-empty";
        empty.textContent = "NO CONNECTIVITY SAMPLES RECORDED";
        history.appendChild(empty);
      } else {
        outageWatchSamples.slice(0, 8).forEach(item => {
          const row = document.createElement("div");
          row.className = "outage-watch-record";
          const heading = document.createElement("b");
          heading.textContent = item.state;
          heading.dataset.state = String(item.state || "").toLowerCase().replace(/[^a-z]+/g, "-");
          const time = document.createElement("small");
          time.textContent = formatOutageWatchTime(item.at);
          const detail = document.createElement("span");
          detail.textContent = "DNS " + (item.dnsOk === true ? "OK" : item.dnsOk === false ? "FAILED" : "N/A") +
            " · HTTPS " + (item.httpsOk === true ? "REACHABLE" : item.httpsOk === false ? "NOT CONFIRMED" : "N/A") +
            " · GATEWAY " + String(item.gatewayStatus || "UNKNOWN") +
            (item.durationMs != null && Number.isFinite(Number(item.durationMs)) ? " · " + Number(item.durationMs) + " MS TOTAL" : "") +
            " · DNS " + (item.dnsLatencyMs != null ? Math.round(Number(item.dnsLatencyMs)) + " MS" : "N/A") +
            " · HTTPS " + (item.httpsLatencyMs != null ? Math.round(Number(item.httpsLatencyMs)) + " MS" : "N/A") +
            " · " + String(item.incidentStatus || "NO INCIDENT");
          row.append(heading, time, detail);
          history.appendChild(row);
        });
      }
    }
    if (events) {
      events.replaceChildren();
      if (!outageWatchEvents.length) {
        const empty = document.createElement("div");
        empty.className = "outage-watch-empty";
        empty.textContent = "NO ISSUE / RECOVERY EVENTS RECORDED";
        events.appendChild(empty);
      } else {
        outageWatchEvents.slice(0, 5).forEach(item => {
          const row = document.createElement("div");
          row.className = "outage-watch-event";
          const title = document.createElement("b");
          title.textContent = item.resolvedAt ? "RESTORED · " + item.state : "OPEN · " + item.lastState;
          title.dataset.state = item.resolvedAt ? "online" : "issue";
          const time = document.createElement("small");
          time.textContent = formatOutageWatchTime(item.startedAt) +
            (item.resolvedAt ? " · DURATION " + formatOutageWatchDuration(item.durationMs) :
              item.recoveryPendingAt ? " · RECOVERY CHECK IN PROGRESS" : " · STILL OPEN") +
            (item.confirmedAt ? " · CONFIRMED " + formatOutageWatchTime(item.confirmedAt) : "");
          row.append(title, time);
          events.appendChild(row);
        });
      }
    }
    if (feedback && latest && !outageWatchActive) {
      feedback.textContent = "LAST CHECK: " + formatOutageWatchTime(latest.at) + " · WATCH IS STOPPED.";
    }
    const dnsMedian = $("outageWatchDnsMedian");
    const httpsMedian = $("outageWatchHttpsMedian");
    const gatewayMedian = $("outageWatchGatewayMedian");
    if (dnsMedian) dnsMedian.textContent = medianOutageWatchMetric("dnsLatencyMs") == null ? "—" : Math.round(medianOutageWatchMetric("dnsLatencyMs")) + " MS";
    if (httpsMedian) httpsMedian.textContent = medianOutageWatchMetric("httpsLatencyMs") == null ? "—" : Math.round(medianOutageWatchMetric("httpsLatencyMs")) + " MS";
    if (gatewayMedian) gatewayMedian.textContent = medianOutageWatchMetric("gatewayLatencyMs") == null ? "—" : Math.round(medianOutageWatchMetric("gatewayLatencyMs")) + " MS";
    renderOutageWatchQualityTrend();
    updateOutageWatchControls();
  }

  async function copyOutageWatchReport(format) {
    const payload = {
      app: "BYTE PHANTOM",
      report: "LOCAL OUTAGE WATCH HISTORY",
      exportedAt: new Date().toISOString(),
      samples: outageWatchSamples,
      incidents: outageWatchEvents
    };
    let value;
    if (format === "csv") {
      const cell = item => '"' + String(item == null ? "" : item).replace(/"/g, '""') + '"';
      const lines = [["timestamp", "state", "incident_status", "gateway", "default_route", "dns_ok", "https_ok", "gateway_latency_ms", "dns_latency_ms", "https_latency_ms", "duration_ms", "diagnosis"]];
      outageWatchSamples.forEach(item => lines.push([
        item.at, item.state, item.incidentStatus, item.gatewayStatus, item.defaultRoute, item.dnsOk, item.httpsOk,
        item.gatewayLatencyMs, item.dnsLatencyMs, item.httpsLatencyMs, item.durationMs, item.diagnosis
      ]));
      value = lines.map(line => line.map(cell).join(",")).join("\r\n");
    } else {
      value = JSON.stringify(payload, null, 2);
    }
    const copied = await copyNetworkRadarText(value);
    const feedback = $("outageWatchFeedback");
    if (feedback) feedback.textContent = copied
      ? "OUTAGE WATCH " + format.toUpperCase() + " REPORT COPIED TO CLIPBOARD. DATA REMAINS LOCAL UNTIL YOU EXPORT IT."
      : "COULD NOT COPY THE REPORT. SELECT AND COPY THE REPORT FROM THE LOCAL HISTORY VIEW.";
  }

  function clearOutageWatchHistory() {
    if (!window.confirm("Clear all locally stored OUTAGE WATCH samples and incident events?")) return;
    outageWatchSamples = [];
    outageWatchEvents = [];
    saveOutageWatchHistory();
    renderOutageWatchHistory();
    const feedback = $("outageWatchFeedback");
    if (feedback) feedback.textContent = "LOCAL OUTAGE WATCH HISTORY CLEARED.";
  }

  function stopOutageWatch() {
    outageWatchActive = false;
    if (outageWatchTimer) window.clearTimeout(outageWatchTimer);
    outageWatchTimer = null;
    updateOutageWatchControls();
  }

  async function runOutageWatchProbe() {
    if (!outageWatchActive) return;
    const bridge = getNetworkRadarBridge();
    if (!bridge || typeof bridge.diagnose !== "function") {
      const feedback = $("outageWatchFeedback");
      if (feedback) feedback.textContent = "NATIVE CONNECTIVITY DIAGNOSTICS UNAVAILABLE: " +
        (networkRadarAndroidPluginError || "Native platform bridge not detected.");
      stopOutageWatch();
      return;
    }
    if (networkConnectivityProbeBusy) {
      outageWatchTimer = window.setTimeout(runOutageWatchProbe, 5000);
      return;
    }

    networkConnectivityProbeBusy = true;
    const feedback = $("outageWatchFeedback");
    if (feedback) feedback.textContent = "PROBING ACTIVE ROUTE, GATEWAY, SYSTEM DNS AND TWO HTTPS ENDPOINTS…";
    try {
      const result = await bridge.diagnose();
      const recorded = recordOutageWatchResult(result);
      if (recorded.transition) {
        appendDashboardLog(recorded.transition, recorded.sample.state === "ONLINE" ? "term-green" : "term-amber");
      }
      if (feedback) feedback.textContent = "LAST CHECK: " + formatOutageWatchTime(recorded.sample.at) +
        " · " + recorded.sample.state + " · " + recorded.sample.diagnosis;
    } catch (error) {
      const sample = {
        at: new Date().toISOString(),
        state: "PROBE ERROR",
        diagnosis: String(error && error.message ? error.message : error).slice(0, 240),
        gatewayStatus: "NOT AVAILABLE",
        defaultRoute: null,
        dnsOk: null,
        httpsOk: null,
        durationMs: null
      };
      const openIncident = outageWatchEvents.find(item => !item.resolvedAt);
      if (openIncident) openIncident.recoveryPendingAt = null;
      sample.incidentStatus = openIncident ? "INCIDENT OPEN · PROBE ERROR" : "PROBE ERROR · NO INCIDENT";
      outageWatchSamples.unshift(sample);
      saveOutageWatchHistory();
      renderOutageWatchHistory();
      if (feedback) feedback.textContent = "PROBE ERROR: " + sample.diagnosis;
    } finally {
      networkConnectivityProbeBusy = false;
      if (outageWatchActive) {
        outageWatchTimer = window.setTimeout(runOutageWatchProbe, getOutageWatchIntervalMs());
      }
    }
  }

  function startOutageWatch() {
    if (outageWatchActive) {
      stopOutageWatch();
      return;
    }
    if (selectedOperation && selectedOperation.id !== "network-radar") {
      const feedback = $("outageWatchFeedback");
      if (feedback) feedback.textContent = "OPEN NETWORK RADAR BEFORE STARTING THE WATCH.";
      return;
    }
    const bridge = getNetworkRadarBridge();
    if (!bridge || typeof bridge.diagnose !== "function") {
      const feedback = $("outageWatchFeedback");
      if (feedback) feedback.textContent = "OUTAGE WATCH REQUIRES THE WINDOWS EXE OR ANDROID APK NATIVE BRIDGE.";
      return;
    }
    outageWatchActive = true;
    updateOutageWatchControls();
    runOutageWatchProbe();
  }

  async function runNetworkConnectivityDiagnostics() {
    const button = $("runNetworkDiagnostics");
    const host = $("networkDiagnosticsResults");
    const bridge = getNetworkRadarBridge();

    if (!bridge || typeof bridge.diagnose !== "function") {
      host.textContent = "NATIVE CONNECTIVITY DIAGNOSTICS UNAVAILABLE: " +
        (networkRadarAndroidPluginError || "Native plugin bridge not detected.");
      return;
    }

    if (networkConnectivityProbeBusy) {
      host.textContent = "A CONNECTIVITY PROBE IS ALREADY RUNNING. WAIT FOR IT TO FINISH.";
      return;
    }
    networkConnectivityProbeBusy = true;
    button.disabled = true;
    button.textContent = "CHECKING PATH / DNS / HTTPS...";
    host.textContent = "Reading the active route, probing its local gateway once, resolving DNS, and checking two HTTPS/TLS endpoints. No LAN host scan is performed.";

    try {
      const result = await bridge.diagnose();
      host.replaceChildren();

      const path = result && result.networkPath ? result.networkPath : {};
      const gateway = result && result.gatewayProbe ? result.gatewayProbe : {};
      const dns = result && result.dns ? result.dns : {};
      const httpsRows = Array.isArray(result && result.https) ? result.https : [];
      const dnsOk = dns.ok === true;
      const httpsOk = httpsRows.some(item => item && item.ok === true);
      const gatewayReplied = gateway.replied === true;
      let diagnosis = "RESULT INDETERMINATE";
      let explanation = "The available checks do not identify one clear failure point.";

      if (httpsOk) {
        diagnosis = "OUTBOUND HTTPS REACHABILITY CONFIRMED";
        explanation = "At least one fixed HTTPS test endpoint responded. This proves reachability to that service only, not to every website.";
      } else if (path.defaultRoute === false) {
        diagnosis = "NO DEFAULT ROUTE REPORTED";
        explanation = "The operating system did not report an active IPv4 default route. Check the active adapter, Wi-Fi/Ethernet connection, VPN, or router.";
      } else if (!dnsOk && gatewayReplied) {
        diagnosis = "DNS RESOLUTION FAILURE IS LIKELY";
        explanation = "The local gateway answered ICMP, but the system resolver could not resolve example.com. Review the configured DNS resolvers.";
      } else if (!dnsOk && gateway.status === "NO_REPLY") {
        diagnosis = "DNS FAILURE / LOCAL PATH NEEDS REVIEW";
        explanation = "DNS resolution failed and the gateway did not answer ICMP. The gateway may filter ping, so this is not proof that the router is offline.";
      } else if (dnsOk && !httpsOk) {
        diagnosis = "DNS WORKS · HTTPS/TLS NOT CONFIRMED";
        explanation = "Name resolution succeeded, but neither fixed HTTPS endpoint responded. Possible causes include TLS inspection, HTTPS filtering, captive portals, endpoint outages, or upstream routing.";
      } else if (gatewayReplied) {
        diagnosis = "LOCAL GATEWAY REACHABLE";
        explanation = "The gateway answered ICMP. DNS or HTTPS results are incomplete; run the check again if the network is changing.";
      }

      const summary = document.createElement("b");
      summary.className = "network-diagnostics-summary";
      summary.textContent = diagnosis;
      host.appendChild(summary);

      const rows = [];
      const addresses = Array.isArray(path.addresses) ? path.addresses : [];
      const dnsServers = Array.isArray(path.dnsServers) ? path.dnsServers : [];
      rows.push([
        "ACTIVE NETWORK PATH",
        path.interfaceName && path.interfaceName !== "UNKNOWN" ? "FOUND" : "UNKNOWN",
        [path.transport || "Transport unknown", path.interfaceName || "Interface unknown", addresses.join(", ") || "No local IPv4 address reported"].join(" · ")
      ]);
      rows.push([
        "DEFAULT ROUTE",
        path.defaultRoute === true ? "PRESENT" : path.defaultRoute === false ? "MISSING" : "UNKNOWN",
        "Gateway: " + String(path.gateway || "Not reported") + " · Resolver(s): " + (dnsServers.join(", ") || "Not reported")
      ]);
      rows.push([
        "GATEWAY ICMP",
        gateway.status || "UNKNOWN",
        (gateway.gateway || path.gateway || "No IPv4 gateway") + " · " +
          (Number.isFinite(gateway.latencyMs) ? gateway.latencyMs + " ms" : "latency unavailable") +
          (gateway.error ? " · " + gateway.error : "") +
          (gateway.reason ? " · " + gateway.reason : "")
      ]);
      rows.push([
        "SYSTEM DNS LOOKUP",
        dnsOk ? "SUCCESS" : "FAILED",
        (dns.host || "example.com") + " · " +
          (Number.isFinite(dns.latencyMs) ? dns.latencyMs + " ms" : "latency unavailable") + " · " +
          ((Array.isArray(dns.addresses) ? dns.addresses : []).join(", ") || dns.error || "No address returned")
      ]);

      httpsRows.forEach((item, index) => {
        rows.push([
          "HTTPS / TLS " + (index + 1),
          item && item.ok ? "SUCCESS" : "FAILED",
          (item && item.statusCode ? "HTTP " + item.statusCode + " · " : "") +
            (item && Number.isFinite(item.latencyMs) ? item.latencyMs + " ms" : "latency unavailable") +
            (item && item.error ? " · " + item.error : "") +
            (item && item.url ? " · " + item.url : "")
        ]);
      });

      rows.forEach(([label, state, detail]) => {
        const row = document.createElement("div");
        row.className = "network-diagnostic-row";
        const name = document.createElement("b");
        name.textContent = label;
        const status = document.createElement("strong");
        status.textContent = state;
        status.dataset.state = ["SUCCESS", "PRESENT", "FOUND", "REPLIED"].includes(state) ? "ok" : "warning";
        const info = document.createElement("small");
        info.textContent = detail;
        row.append(name, status, info);
        host.appendChild(row);
      });

      const note = document.createElement("small");
      note.className = "network-diagnostics-note";
      note.textContent = explanation + " Gateway test uses one ICMP echo; routers may block ping even while forwarding traffic. HTTPS results apply only to the two named test services. No network settings were changed.";
      host.appendChild(note);

      appendDashboardLog(
        "Connectivity diagnosis: " + diagnosis + " / DNS " + (dnsOk ? "OK" : "FAILED") + " / HTTPS " + (httpsOk ? "REACHABLE" : "NOT CONFIRMED"),
        httpsOk ? "term-green" : "term-amber"
      );
    } catch (error) {
      host.textContent = "DIAGNOSTICS FAILED: " + (error && error.message ? error.message : String(error));
    } finally {
      networkConnectivityProbeBusy = false;
      button.disabled = false;
      button.textContent = "RUN FULL CONNECTIVITY DIAGNOSTICS";
    }
  }

  function readDnsResolverHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DNS_RESOLVER_HISTORY_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      const cutoff = Date.now() - DNS_RESOLVER_HISTORY_RETENTION_MS;
      return parsed.filter(item => item && Date.parse(item.collectedAt) >= cutoff)
        .slice(0, DNS_RESOLVER_HISTORY_MAX);
    } catch (error) {
      return [];
    }
  }

  function saveDnsResolverHistory(result) {
    const snapshot = {
      collectedAt: result.collectedAt || new Date().toISOString(),
      platform: result.platform || "UNKNOWN",
      testedCount: Number(result.testedCount) || 0,
      respondingCount: Number(result.respondingCount) || 0,
      completeRespondingCount: Number(result.completeRespondingCount) || 0,
      integritySummary: result.integritySummary || "NOT ANALYZED",
      bestResolver: result.bestResolver || null,
      reviewCount: (Array.isArray(result.servers) ? result.servers : [])
        .filter(item => item.integrityStatus === "REVIEW").length,
      nonPublicCount: (Array.isArray(result.servers) ? result.servers : [])
        .reduce((count, item) => count + (Array.isArray(item.nonPublicAddresses) ? item.nonPublicAddresses.length : 0), 0),
      sampleSuccessPercent: Number(result.sampleSuccessPercent) || 0,
      stableResolverCount: Number(result.stableResolverCount) || 0,
      unstableResolverCount: Number(result.unstableResolverCount) || 0,
      bestMedianLatencyMs: result.bestResolver ? Number(result.bestResolver.latencyMs) || 0 : 0,
      bestJitterMs: result.bestResolver ? Number(result.bestResolver.jitterMs) || 0 : 0,
      bestAnswerStabilityPercent: result.bestResolver ? Number(result.bestResolver.answerStabilityPercent) || 0 : 0
    };
    const history = readDnsResolverHistory();
    history.unshift(snapshot);
    const trimmed = history
      .filter(item => Date.parse(item.collectedAt) >= Date.now() - DNS_RESOLVER_HISTORY_RETENTION_MS)
      .slice(0, DNS_RESOLVER_HISTORY_MAX);
    try {
      localStorage.setItem(DNS_RESOLVER_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      // The current report remains usable even when local storage is full or blocked.
    }
    renderDnsResolverHistory();
  }

  function renderDnsResolverHistory() {
    const host = $("dnsResolverHistory");
    if (!host) return;
    host.replaceChildren();
    const history = readDnsResolverHistory();
    if (!history.length) {
      const empty = document.createElement("small");
      empty.className = "network-diagnostics-note";
      empty.textContent = "NO DNS TEST HISTORY SAVED ON THIS DEVICE";
      host.appendChild(empty);
      return;
    }

    const trend = document.createElement("div");
    trend.className = "network-dns-history-trend";
    const trendTitle = document.createElement("small");
    trendTitle.textContent = "QUERY RESPONSE RATE · LAST " + Math.min(8, history.length) + " TESTS";
    const bars = document.createElement("div");
    bars.className = "network-dns-history-bars";
    history.slice(0, 8).reverse().forEach(item => {
      const barWrap = document.createElement("div");
      barWrap.className = "network-dns-history-bar-wrap";
      const bar = document.createElement("span");
      const rate = Math.max(0, Math.min(100, Number(item.sampleSuccessPercent) || 0));
      bar.style.height = Math.max(3, rate * 0.34) + "px";
      bar.dataset.rate = rate >= 80 ? "high" : rate >= 45 ? "mid" : "low";
      bar.title = rate + "% query response rate";
      const label = document.createElement("small");
      const timeValue = Date.parse(item.collectedAt);
      label.textContent = Number.isFinite(timeValue)
        ? new Date(timeValue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";
      barWrap.append(bar, label);
      bars.appendChild(barWrap);
    });
    trend.append(trendTitle, bars);
    host.appendChild(trend);

    history.slice(0, 8).forEach(item => {
      const row = document.createElement("article");
      row.className = "network-dns-history-row";
      const date = document.createElement("time");
      const timeValue = Date.parse(item.collectedAt);
      date.textContent = Number.isFinite(timeValue) ? new Date(timeValue).toLocaleString() : "UNKNOWN DATE";
      const detail = document.createElement("div");
      detail.className = "network-dns-history-detail";
      const title = document.createElement("b");
      title.textContent = String(item.integritySummary || "DNS TEST");
      const meta = document.createElement("small");
      const best = item.bestResolver
        ? " · FASTEST " + item.bestResolver.server + " / " + item.bestResolver.latencyMs + " ms"
        : " · NO REPEAT-STABLE RECOMMENDATION";
      meta.textContent = (Number(item.respondingCount) || 0) + " / " + (Number(item.testedCount) || 0) +
        " RESPONDED · " + (Number(item.stableResolverCount) || Number(item.completeRespondingCount) || 0) +
        " STABLE · " + (Number(item.sampleSuccessPercent) || 0) + "% QUERY SUCCESS · " +
        (item.platform || "UNKNOWN") + best +
        (item.bestJitterMs !== undefined ? " · JITTER " + (Number(item.bestJitterMs) || 0) + " ms" : "");
      detail.append(title, meta);
      row.append(date, detail);
      host.appendChild(row);
    });
  }


  async function runDnsResolverDiscovery() {
    const button = $("runDnsDiscovery");
    const host = $("dnsResolverResults");
    const bridge = getNetworkRadarBridge();

    if (!bridge || typeof bridge.discoverDns !== "function") {
      host.textContent = "DNS RESOLVER INTELLIGENCE IS NOT AVAILABLE IN THIS NATIVE BUILD.";
      return;
    }

    button.disabled = true;
    button.textContent = "RUNNING REPEAT-STABILITY TEST...";
    host.textContent = "Each resolver receives 3 direct DNS A-query samples for example.com and 3 for iana.org. Median latency, answer consistency, jitter and peer comparison are being measured.";
    try {
      const result = await bridge.discoverDns();
      if (!result || result.supported !== true) throw new Error("DNS resolver intelligence is not supported by this build.");

      try {
        localStorage.setItem("byte-phantom-dns-resolver-last", JSON.stringify(result));
      } catch (storageError) {
        // The on-screen report remains available when local storage is unavailable.
      }
      saveDnsResolverHistory(result);
      populateDnsFailoverCandidates(result);
      refreshDnsFailoverState();

      host.replaceChildren();
      const summary = document.createElement("b");
      summary.className = "network-diagnostics-summary";
      summary.dataset.state = String(result.integritySummary || "").includes("REVIEW") ? "warning" : "ok";
      const responding = Number(result.respondingCount) || 0;
      const tested = Number(result.testedCount) || 0;
      const complete = Number(result.stableResolverCount || result.completeRespondingCount) || 0;
      const successRate = Number(result.sampleSuccessPercent) || 0;
      const best = result.bestResolver;
      summary.textContent = (result.integritySummary || "DNS STABILITY TEST COMPLETE") + " · " +
        responding + " / " + tested + " RESPONDED · " + complete + " REPEAT-STABLE · " +
        successRate + "% QUERY SUCCESS";
      host.appendChild(summary);

      const globalMetrics = document.createElement("div");
      globalMetrics.className = "network-dns-global-metrics";
      [
        ["REPEAT SAMPLES", String(Number(result.samplingRounds) || 3) + " × 2 NAMES"],
        ["TOTAL DNS QUERIES", String(Number(result.totalDnsQueries) || tested * 6)],
        ["UNSTABLE RESOLVERS", String(Number(result.unstableResolverCount) || 0)]
      ].forEach(([label, value]) => {
        const metric = document.createElement("div");
        const valueNode = document.createElement("b");
        valueNode.textContent = value;
        const labelNode = document.createElement("small");
        labelNode.textContent = label;
        metric.append(valueNode, labelNode);
        globalMetrics.appendChild(metric);
      });
      host.appendChild(globalMetrics);

      if (best) {
        const recommendation = document.createElement("div");
        recommendation.className = "network-dns-recommendation";
        const text = document.createElement("span");
        text.textContent = "FASTEST REPEAT-STABLE RESOLVER: " + best.label + " · " + best.server +
          " · " + best.latencyMs + " ms median · " + (Number(best.jitterMs) || 0) +
          " ms jitter · " + (Number(best.answerStabilityPercent) || 0) +
          "% answer consistency. Manual recommendation only; system DNS has not been changed.";
        const copy = document.createElement("button");
        copy.type = "button";
        copy.className = "network-dns-copy-button";
        copy.textContent = "COPY RECOMMENDED IP";
        copy.addEventListener("click", async () => {
          const success = await copyNetworkRadarText(best.server);
          copy.textContent = success ? "IP COPIED" : "COPY BLOCKED";
          if (success) playSfx("success");
        });
        recommendation.append(text, copy);
        host.appendChild(recommendation);
      }

      const rows = Array.isArray(result.servers) ? result.servers : [];
      rows.forEach(item => {
        const card = document.createElement("article");
        card.className = "network-dns-resolver-card";
        card.dataset.state = item.ok === true ? "online" : "offline";
        card.dataset.integrity = item.integrityStatus === "REVIEW" ? "review" :
          item.integrityStatus === "INCONCLUSIVE" ? "inconclusive" : "normal";

        const top = document.createElement("div");
        top.className = "network-dns-resolver-top";
        const identity = document.createElement("div");
        identity.className = "network-dns-resolver-identity";
        const label = document.createElement("b");
        label.textContent = item.label || "DNS RESOLVER";
        const address = document.createElement("span");
        address.textContent = item.server || "Unknown address";
        identity.append(label, address);

        const status = document.createElement("strong");
        status.textContent = item.status === "PARTIAL" ? "PARTIALLY STABLE" :
          item.status === "UNSTABLE" ? "REPEAT VARIATION" :
          item.ok === true ? "REPEAT-STABLE" : String(item.status || "NO RESPONSE").replace(/_/g, " ");
        status.dataset.state = item.ok === true ? "ok" : "warning";
        top.append(identity, status);

        const meta = document.createElement("div");
        meta.className = "network-dns-resolver-meta";
        const sourceList = Array.isArray(item.sources) ? item.sources.join(" + ") : "Unknown source";
        const latency = Number.isFinite(Number(item.medianLatencyMs || item.latencyMs))
          ? Number(item.medianLatencyMs || item.latencyMs) + " ms median" : "Latency unavailable";
        meta.textContent = sourceList + " · " + latency + " · " +
          (Number(item.stableChecks) || 0) + " / " + (Number(item.totalChecks) || 2) +
          " names repeat-stable · " + (Number(item.successfulSamples) || 0) +
          " / " + (Number(item.totalSamples) || 6) + " samples answered";

        const checksHost = document.createElement("div");
        checksHost.className = "network-dns-check-list";
        (Array.isArray(item.checks) ? item.checks : []).forEach(check => {
          const checkRow = document.createElement("div");
          checkRow.className = "network-dns-check-row";
          const checkName = document.createElement("b");
          checkName.textContent = check.host || "DNS QUERY";
          const checkStatus = document.createElement("strong");
          checkStatus.textContent = check.comparisonStatus === "DIFFERS_FROM_PEER_MAJORITY" ? "DIVERGENT" :
            check.comparisonStatus === "INCONCLUSIVE_DIVERGENCE" ? "MIXED" :
            check.comparisonStatus === "REPEAT_ANSWER_UNSTABLE" ? "REPEAT VARIATION" :
            check.stable ? "STABLE" : check.ok ? "UNSTABLE" : String(check.status || "FAILED");
          checkStatus.dataset.state = check.comparisonStatus === "DIFFERS_FROM_PEER_MAJORITY" ||
            (Array.isArray(check.nonPublicAddresses) && check.nonPublicAddresses.length) ||
            (check.ok && !check.stable) ? "warning" : check.ok ? "ok" : "warning";
          const answer = document.createElement("small");
          answer.textContent = (Array.isArray(check.addresses) ? check.addresses.join(", ") : "") ||
            "No repeat-stable A-record set";
          const sampleMeta = document.createElement("small");
          const samples = Array.isArray(check.samples) ? check.samples : [];
          const latencySamples = samples.filter(sample => sample && sample.ok).map(sample => Number(sample.latencyMs) || 0);
          sampleMeta.className = "network-dns-sample-meta";
          sampleMeta.textContent = (Number(check.successfulSamples) || 0) + " / " +
            (Number(check.totalSamples) || 3) + " answered · " +
            (Number(check.stabilityPercent) || 0) + "% answer consistency · median " +
            (Number(check.medianLatencyMs || check.latencyMs) || 0) + " ms · jitter " +
            (Number(check.jitterMs) || 0) + " ms · samples " + latencySamples.join(" / ") + " ms";
          checkRow.append(checkName, checkStatus, answer, sampleMeta);
          checksHost.appendChild(checkRow);
        });

        const cardFooter = document.createElement("div");
        cardFooter.className = "network-dns-card-footer";
        const flag = document.createElement("small");
        const flagItems = Array.isArray(item.flags) ? item.flags : [];
        flag.textContent = flagItems.length ? flagItems.join(" · ").replace(/_/g, " ") :
          item.integrityStatus === "NO_DIVERGENCE_OBSERVED" ? "NO DIVERGENCE OBSERVED IN THIS SNAPSHOT" : String(item.integrityStatus || "NOT ANALYZED");
        const jitter = document.createElement("small");
        jitter.textContent = "TOTAL JITTER " + (Number(item.jitterMs) || 0) + " ms · RANGE " +
          (Number(item.latencyRangeMs) || 0) + " ms";
        const copy = document.createElement("button");
        copy.type = "button";
        copy.className = "network-dns-copy-button";
        copy.textContent = "COPY IP";
        copy.addEventListener("click", async () => {
          const success = await copyNetworkRadarText(String(item.server || ""));
          copy.textContent = success ? "COPIED" : "BLOCKED";
          if (success) playSfx("success");
        });
        cardFooter.append(flag, jitter, copy);
        card.append(top, meta, checksHost, cardFooter);
        host.appendChild(card);
      });

      const comparisons = Array.isArray(result.domainComparisons) ? result.domainComparisons : [];
      comparisons.forEach(comparison => {
        const note = document.createElement("small");
        note.className = "network-diagnostics-note";
        note.textContent = (comparison.host || "DOMAIN") + " · " + (comparison.status || "NOT ANALYZED") +
          " · " + (Number(comparison.responderCount) || 0) + " repeat-stable responders · " + (comparison.note || "");
        host.appendChild(note);
      });

      const skipped = Array.isArray(result.skipped) ? result.skipped : [];
      skipped.forEach(item => {
        const note = document.createElement("small");
        note.className = "network-diagnostics-note";
        note.textContent = "SKIPPED " + String(item.server || "DNS entry") + " · " + String(item.reason || "Not supported");
        host.appendChild(note);
      });

      const note = document.createElement("small");
      note.className = "network-diagnostics-note";
      note.textContent = (result.integrityNote || "Different DNS answers may have benign causes.") +
        " A resolver is recommended only when both names have repeat-stable answers. Copying an IP does not apply it to system settings.";
      host.appendChild(note);

      appendDashboardLog("DNS stability: " + responding + " / " + tested + " resolvers responded · " +
        complete + " stable · " + successRate + "% query success", responding ? "term-green" : "term-amber");
    } catch (error) {
      host.textContent = "DNS STABILITY TEST FAILED: " + (error && error.message ? error.message : String(error));
    } finally {
      button.disabled = false;
      button.textContent = "RUN DNS STABILITY TEST";
    }
  }


  function populateDnsFailoverCandidates(result) {
    const select = $("dnsFailoverResolver");
    if (!select) return;
    dnsFailoverCandidates = (Array.isArray(result && result.servers) ? result.servers : [])
      .filter(item => item && item.ok === true &&
        Number(item.stableChecks) === Number(item.totalChecks || 2) &&
        Array.isArray(item.checks) && item.checks.length >= 2 &&
        item.checks.every(check => check && check.stable === true) &&
        /^\\d{1,3}(?:\\.\\d{1,3}){3}$/.test(String(item.server || "")));

    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = dnsFailoverCandidates.length
      ? "SELECT A REPEAT-STABLE DNS RESOLVER"
      : "NO REPEAT-STABLE DNS CANDIDATE — RUN THE TEST FIRST";
    select.appendChild(placeholder);
    dnsFailoverCandidates.forEach(item => {
      const option = document.createElement("option");
      option.value = item.server;
      option.textContent = (item.label || "DNS RESOLVER") + " · " + item.server +
        " · " + (Number(item.averageLatencyMs || item.latencyMs) || 0) + " ms median · " +
        (Number(item.jitterMs) || 0) + " ms jitter";
      select.appendChild(option);
    });
    select.disabled = dnsFailoverCandidates.length === 0;
    updateDnsFailoverControls();
  }

  function updateDnsFailoverControls() {
    const select = $("dnsFailoverResolver");
    const applyConfirm = $("dnsFailoverApplyConfirm");
    const restoreConfirm = $("dnsFailoverRestoreConfirm");
    const applyButton = $("applyDnsFailover");
    const restoreButton = $("restoreDnsFailover");
    const copyButton = $("copyDnsFailoverResolver");
    const androidButton = $("openAndroidDnsSettings");
    const bridge = getNetworkRadarBridge();
    const isWindows = !!bridge && bridge.platform === "WINDOWS";
    const isAndroid = !!bridge && bridge.platform === "ANDROID";
    const hasCandidate = !!(select && select.value && dnsFailoverCandidates.some(item => item.server === select.value));
    if (applyButton) {
      applyButton.hidden = !isWindows;
      applyButton.disabled = dnsFailoverActionBusy || !hasCandidate || !dnsFailoverState ||
        dnsFailoverState.supported !== true || !dnsFailoverState.interfaceName ||
        !(applyConfirm && applyConfirm.checked);
    }
    if (restoreButton) {
      restoreButton.hidden = !isWindows || !(dnsFailoverState && dnsFailoverState.managed === true);
      restoreButton.disabled = dnsFailoverActionBusy || !(restoreConfirm && restoreConfirm.checked);
    }
    if (copyButton) copyButton.disabled = !hasCandidate || dnsFailoverActionBusy;
    if (androidButton) {
      androidButton.hidden = !isAndroid;
      androidButton.disabled = dnsFailoverActionBusy;
    }
  }

  function renderDnsFailoverState(state) {
    const host = $("dnsFailoverCurrent");
    const instruction = $("dnsFailoverInstruction");
    if (!host) return;
    host.replaceChildren();

    const platform = state && state.platform ? state.platform : "UNKNOWN";
    const interfaceName = state && state.interfaceName ? state.interfaceName : "ACTIVE INTERFACE UNAVAILABLE";
    const servers = state && Array.isArray(state.dnsServers) ? state.dnsServers : [];
    const current = document.createElement("div");
    current.className = "network-dns-failover-current";
    const interfaceLine = document.createElement("b");
    interfaceLine.textContent = platform + " · " + interfaceName;
    const dnsLine = document.createElement("span");
    dnsLine.textContent = "CURRENT DNS: " + (servers.length ? servers.join(" · ") : "NOT REPORTED");
    current.append(interfaceLine, dnsLine);
    host.appendChild(current);

    if (state && state.managed && state.savedState) {
      const saved = document.createElement("div");
      saved.className = "network-dns-failover-backup";
      const title = document.createElement("b");
      title.textContent = "BYTE PHANTOM DNS OVERRIDE IS ACTIVE";
      const details = document.createElement("small");
      const originalMode = state.savedState.originalAutomaticDns ? "DHCP / AUTOMATIC DNS" :
        "STATIC DNS: " + (state.savedState.originalDnsServers || []).join(", ");
      details.textContent = "ADAPTER: " + (state.savedState.interfaceName || interfaceName) +
        " · ORIGINAL: " + originalMode +
        " · APPLIED: " + (state.savedState.appliedDnsServers || []).join(", ");
      saved.append(title, details);
      host.appendChild(saved);
    } else {
      const baseline = document.createElement("small");
      baseline.className = "network-diagnostics-note";
      baseline.textContent = "NO BYTE PHANTOM DNS OVERRIDE IS CURRENTLY RECORDED.";
      host.appendChild(baseline);
    }

    if (instruction) {
      instruction.textContent = state && state.instructions
        ? state.instructions
        : platform === "ANDROID"
          ? "Android requires a manual change in system network settings. BYTE PHANTOM will not attempt privileged or VPN-based changes."
          : "Windows applies DNS to the active default-route adapter after a UAC Administrator prompt. The previous DHCP/static DNS state is backed up before applying.";
    }

    const androidHelp = $("dnsFailoverAndroidHelp");
    if (androidHelp) androidHelp.hidden = platform !== "ANDROID";
    const windowsHelp = $("dnsFailoverWindowsHelp");
    if (windowsHelp) windowsHelp.hidden = platform !== "WINDOWS";
    const managedHint = $("dnsFailoverManagedHint");
    if (managedHint) managedHint.hidden = !(state && state.managed);
    updateDnsFailoverControls();
  }

  async function refreshDnsFailoverState() {
    const bridge = getNetworkRadarBridge();
    const host = $("dnsFailoverCurrent");
    if (!bridge || typeof bridge.getDnsFailoverState !== "function") {
      if (host) host.textContent = "DNS FAILOVER STATE IS NOT AVAILABLE IN THIS BUILD.";
      return null;
    }
    try {
      dnsFailoverState = await bridge.getDnsFailoverState();
      renderDnsFailoverState(dnsFailoverState);
      return dnsFailoverState;
    } catch (error) {
      if (host) host.textContent = "COULD NOT READ DNS FAILOVER STATE: " +
        (error && error.message ? error.message : String(error));
      return null;
    }
  }

  async function copyDnsFailoverSelection() {
    const selected = $("dnsFailoverResolver") && $("dnsFailoverResolver").value;
    if (!selected || !dnsFailoverCandidates.some(item => item.server === selected)) return;
    const copied = await copyNetworkRadarText(selected);
    const feedback = $("dnsFailoverFeedback");
    if (feedback) feedback.textContent = copied
      ? "DNS IP " + selected + " COPIED. NO SYSTEM SETTINGS WERE CHANGED."
      : "THE DNS IP COULD NOT BE COPIED.";
    if (copied) playSfx("success");
  }

  async function applySelectedDnsFailover() {
    const bridge = getNetworkRadarBridge();
    const selected = $("dnsFailoverResolver") && $("dnsFailoverResolver").value;
    const feedback = $("dnsFailoverFeedback");
    const candidate = dnsFailoverCandidates.find(item => item.server === selected);
    if (!bridge || bridge.platform !== "WINDOWS" || !candidate || !dnsFailoverState ||
        dnsFailoverState.supported !== true || !$("dnsFailoverApplyConfirm").checked) return;

    const warning = "This will change IPv4 DNS on the active Windows adapter: " +
      dnsFailoverState.interfaceName + String.fromCharCode(10) + "New DNS: " + selected +
      String.fromCharCode(10) + "Windows may display a UAC Administrator prompt. The original DNS mode and server list will be backed up locally. Continue?";
    if (!window.confirm(warning)) return;

    dnsFailoverActionBusy = true;
    updateDnsFailoverControls();
    if (feedback) feedback.textContent = "REQUESTING WINDOWS ADMINISTRATOR APPROVAL AND APPLYING DNS...";
    try {
      const result = await bridge.applyDnsResolver({
        server: selected,
        interfaceName: dnsFailoverState.interfaceName
      });
      if (!result || result.ok !== true) {
        const message = result && result.error ? result.error :
          result && result.cancelled ? "Administrator approval was cancelled. No DNS change was confirmed." :
          "DNS configuration was not applied.";
        if (feedback) feedback.textContent = message;
        appendDashboardLog("DNS failover was not applied: " + message, "term-amber");
      } else {
        if (feedback) feedback.textContent = "DNS APPLIED AND VERIFIED ON " + result.interfaceName +
          " · " + (result.dnsServers || []).join(", ") +
          ". ORIGINAL " + (result.originalAutomaticDns ? "DHCP" : "STATIC DNS") + " CONFIGURATION BACKED UP.";
        appendDashboardLog("DNS failover applied and verified on " + result.interfaceName + ".", "term-green");
        playSfx("success");
      }
      $("dnsFailoverApplyConfirm").checked = false;
      await refreshDnsFailoverState();
    } catch (error) {
      if (feedback) feedback.textContent = "DNS APPLY FAILED: " + (error && error.message ? error.message : String(error));
    } finally {
      dnsFailoverActionBusy = false;
      updateDnsFailoverControls();
    }
  }

  async function restoreOriginalDnsFailover() {
    const bridge = getNetworkRadarBridge();
    const feedback = $("dnsFailoverFeedback");
    if (!bridge || bridge.platform !== "WINDOWS" || !dnsFailoverState ||
        dnsFailoverState.managed !== true || !$("dnsFailoverRestoreConfirm").checked) return;

    const warning = "Restore the original DNS configuration saved by BYTE PHANTOM on adapter " +
      (dnsFailoverState.savedState.interfaceName || dnsFailoverState.interfaceName) +
      "? If current DNS differs from the last BYTE PHANTOM setting, a second explicit confirmation may be required.";
    if (!window.confirm(warning)) return;

    dnsFailoverActionBusy = true;
    updateDnsFailoverControls();
    if (feedback) feedback.textContent = "REQUESTING WINDOWS ADMINISTRATOR APPROVAL TO RESTORE DNS...";
    try {
      let result = await bridge.restoreDnsResolver({ forceRestore: false });
      if (result && result.requiresForce === true) {
        const force = window.confirm(
          "WARNING: DNS on this adapter was changed after BYTE PHANTOM applied its resolver. " +
          "Restore the saved original configuration anyway and overwrite the current DNS values?"
        );
        if (force) result = await bridge.restoreDnsResolver({ forceRestore: true });
      }
      if (!result || result.ok !== true) {
        const message = result && (result.error || result.message)
          ? (result.error || result.message)
          : "The original DNS settings were not restored.";
        if (feedback) feedback.textContent = message;
        appendDashboardLog("DNS restore not completed: " + message, "term-amber");
      } else {
        if (feedback) feedback.textContent = "ORIGINAL DNS CONFIGURATION RESTORED AND VERIFIED ON " +
          result.interfaceName + " · " +
          (result.restoredAutomaticDns ? "DHCP / AUTOMATIC DNS" : (result.dnsServers || []).join(", "));
        appendDashboardLog("Original DNS configuration restored on " + result.interfaceName + ".", "term-green");
        playSfx("success");
      }
      $("dnsFailoverRestoreConfirm").checked = false;
      await refreshDnsFailoverState();
    } catch (error) {
      if (feedback) feedback.textContent = "DNS RESTORE FAILED: " + (error && error.message ? error.message : String(error));
    } finally {
      dnsFailoverActionBusy = false;
      updateDnsFailoverControls();
    }
  }

  async function openAndroidDnsFailoverSettings() {
    const bridge = getNetworkRadarBridge();
    const feedback = $("dnsFailoverFeedback");
    if (!bridge || bridge.platform !== "ANDROID" || typeof bridge.openDnsSettings !== "function") return;
    dnsFailoverActionBusy = true;
    updateDnsFailoverControls();
    try {
      const selected = $("dnsFailoverResolver") && $("dnsFailoverResolver").value;
      let copied = false;
      if (selected && dnsFailoverCandidates.some(item => item.server === selected)) {
        copied = await copyNetworkRadarText(selected);
      }
      const result = await bridge.openDnsSettings();
      if (feedback) feedback.textContent = (result && result.message ? result.message : "Android network settings opened.") +
        (copied ? " Selected resolver IP copied: " + selected + "." : " Copy a stable DNS IP before editing the network.");
      appendDashboardLog("Opened Android network settings for manual DNS configuration. No system change was made by BYTE PHANTOM.", "term-green");
    } catch (error) {
      if (feedback) feedback.textContent = "COULD NOT OPEN ANDROID SETTINGS: " +
        (error && error.message ? error.message : String(error));
    } finally {
      dnsFailoverActionBusy = false;
      updateDnsFailoverControls();
    }
  }

  function getNetworkRadarBridge() {
    const desktop = window.bytePhantomDesktop;
    if (desktop && typeof desktop.getNetworkRadar === "function") {
      return {
        platform: "WINDOWS",
        scan: options => desktop.getNetworkRadar(options),
        diagnose: () => desktop.runConnectivityDiagnostics(),
        discoverDns: () => desktop.discoverDnsResolvers(),
        getDnsFailoverState: () => desktop.getDnsFailoverState(),
        applyDnsResolver: settings => desktop.applyDnsResolver(settings || {}),
        restoreDnsResolver: options => desktop.restoreDnsResolver(options || {})
      };
    }

    const capacitor = window.Capacitor;
    if (!capacitor || typeof capacitor.getPlatform !== "function" || capacitor.getPlatform() !== "android") {
      return null;
    }

    if (!networkRadarAndroidPlugin) {
      try {
        // Capacitor 6 requires its JavaScript runtime before a native custom plugin is registered.
        if (typeof capacitor.registerPlugin === "function") {
          networkRadarAndroidPlugin = capacitor.registerPlugin("NetworkRadar");
        } else if (capacitor.Plugins && capacitor.Plugins.NetworkRadar) {
          // Compatibility fallback for the legacy native plugin shim.
          networkRadarAndroidPlugin = capacitor.Plugins.NetworkRadar;
        } else {
          throw new Error("Capacitor runtime/plugin bridge is missing. Rebuild the APK with capacitor.js included.");
        }
        networkRadarAndroidPluginError = null;
      } catch (error) {
        networkRadarAndroidPlugin = null;
        networkRadarAndroidPluginError = String(error && error.message ? error.message : error);
      }
    }

    if (networkRadarAndroidPlugin && typeof networkRadarAndroidPlugin.scan === "function") {
      return {
        platform: "ANDROID",
        scan: options => networkRadarAndroidPlugin.scan(options || {}),
        diagnose: () => networkRadarAndroidPlugin.diagnoseConnectivity(),
        discoverDns: () => networkRadarAndroidPlugin.discoverDnsResolvers(),
        getDnsFailoverState: () => networkRadarAndroidPlugin.getDnsFailoverState(),
        openDnsSettings: () => networkRadarAndroidPlugin.openDnsSettings()
      };
    }
    return null;
  }

  async function refreshNetworkRadarSnapshot(operation,token,activeSweep) {
    const bridge=getNetworkRadarBridge();
    if(networkRadarRefreshBusy||!bridge) return false;
    networkRadarRefreshBusy=true;
    try{
      const data=await bridge.scan({activeSweep:activeSweep===true});
      if(token!==networkRadarSessionToken||selectedOperation!==operation||!$("operationModal").classList.contains("open")) return false;
      if(!data||data.supported!==true) throw new Error(data&&data.reason?data.reason:"Active LAN discovery is unavailable on this platform.");
      const changes=updateNetworkRadarHistory(data);
      networkRadarLastSnapshot=data;
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
      $("modalResult").textContent="NETWORK RADAR / CONTINUOUS LOCAL MONITOR\n\nPLATFORM: "+bridge.platform+"\n"+data.deviceCount+" device record(s) currently appear in the local neighbor table. "+data.respondingCount+" replied to ICMP. "+(data.hostsProbed||0)+" local host address(es) were probed in this cycle.\n\nThe radar refreshes neighbor data every 4 seconds and repeats the active sweep every 30 seconds. A missing node means it was not present in the latest snapshots; it is not proof that the device disconnected.\n\nScope: directly connected private IPv4 networks only. No port scan, credential test, exploit, or internet-wide scan.";
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
        saveNetworkRadarJournal();
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
    const bridge=getNetworkRadarBridge();
    if(!bridge){
      $("progressArea").hidden=false;$("progressLabel").textContent="NATIVE APP REQUIRED";$("progressPercent").textContent="—";
      $("progressOutput").textContent="[BLOCKED] Active local IPv4 discovery requires the BYTE PHANTOM Windows or Android native application.\n[INFO] Browser/PWA mode cannot access the operating-system network scanner.";
      $("modalResult").hidden=false;$("modalResult").textContent="NETWORK RADAR UNAVAILABLE\n\nInstall the Windows desktop EXE or Android APK to use the native network scanner. "+(networkRadarAndroidPluginError?"Bridge detail: "+networkRadarAndroidPluginError:"No native bridge was detected.")+" No simulated nodes have been substituted.";
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
  $("runNetworkDiagnostics").addEventListener("click", runNetworkConnectivityDiagnostics);
  $("toggleOutageWatch").addEventListener("click", startOutageWatch);
  $("outageWatchInterval").addEventListener("change", updateOutageWatchControls);
  $("copyOutageWatchJson").addEventListener("click", function () { copyOutageWatchReport("json"); });
  $("copyOutageWatchCsv").addEventListener("click", function () { copyOutageWatchReport("csv"); });
  $("clearOutageWatchHistory").addEventListener("click", clearOutageWatchHistory);
  restoreOutageWatchHistory();
  renderOutageWatchHistory();
  $("runDnsDiscovery").addEventListener("click", runDnsResolverDiscovery);
  $("dnsFailoverResolver").addEventListener("change", updateDnsFailoverControls);
  $("dnsFailoverApplyConfirm").addEventListener("change", updateDnsFailoverControls);
  $("dnsFailoverRestoreConfirm").addEventListener("change", updateDnsFailoverControls);
  $("applyDnsFailover").addEventListener("click", applySelectedDnsFailover);
  $("restoreDnsFailover").addEventListener("click", restoreOriginalDnsFailover);
  $("copyDnsFailoverResolver").addEventListener("click", copyDnsFailoverSelection);
  $("openAndroidDnsSettings").addEventListener("click", openAndroidDnsFailoverSettings);
  $("clearDnsResolverHistory").addEventListener("click", function () {
    try { localStorage.removeItem(DNS_RESOLVER_HISTORY_KEY); } catch (error) { /* Ignore blocked storage. */ }
    renderDnsResolverHistory();
    appendDashboardLog("DNS resolver history cleared from this device.", "term-amber");
  });
  renderDnsResolverHistory();
  refreshDnsFailoverState();
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
  async function copyNetworkRadarReport(format) {
    const report=format==="csv"?buildNetworkRadarCsvReport():JSON.stringify(buildNetworkRadarJsonReport(),null,2);
    const copied=await copyNetworkRadarText(report);
    const feedback=$("networkRadarJournalFeedback");
    if(copied) {
      if(feedback) feedback.textContent=(format==="csv"?"CSV":"JSON")+" REPORT COPIED TO CLIPBOARD · PASTE INTO A FILE OR SPREADSHEET";
      playSfx("success");
    } else {
      if(feedback) feedback.textContent="CLIPBOARD ACCESS WAS BLOCKED · CHECK THE APP'S CLIPBOARD PERMISSION";
    }
  }

  $("copyNetworkRadarJson").addEventListener("click",function(){copyNetworkRadarReport("json");});
  $("copyNetworkRadarCsv").addEventListener("click",function(){copyNetworkRadarReport("csv");});
  $("clearNetworkRadarJournal").addEventListener("click",function(){
    networkRadarKnownDevices.clear();
    networkRadarEvents=[];
    try { localStorage.removeItem(NETWORK_RADAR_STORAGE_KEY); } catch(error) { /* In-memory journal is still cleared. */ }
    renderNetworkRadarResults(networkRadarLastSnapshot||{
      deviceCount:0,interfaces:[],devices:[],durationMs:0,activeSweep:false,
      collectedAt:new Date().toISOString(),targetCount:0,hostsProbed:0,
      limitations:"The local journal was cleared. The live monitor can record currently visible devices again on its next refresh."
    });
    const feedback=$("networkRadarJournalFeedback");
    if(feedback) feedback.textContent="LOCAL JOURNAL CLEARED · CURRENTLY VISIBLE DEVICES MAY BE RECORDED AGAIN ON THE NEXT REFRESH";
    playSfx("click");
  });

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
