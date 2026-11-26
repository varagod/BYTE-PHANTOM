# BYTE PHANTOM

**DIGITAL GHOST · CYBER OPERATIONS SIMULATOR**

BYTE PHANTOM is a cinematic, cyberpunk-inspired **fictional hacking simulator**. It provides an interactive dashboard, animated ASCII-style terminal, operation scenarios, activity log, and fictional profile generator.

> **Safety:** Every operation is local and simulated. The app does not scan networks, trace real IP addresses, access cameras/devices/satellites, crack passwords, extract real data, or contact external targets.

## Features

- Watch Dogs-inspired dark interface with violet, cyan, red, and green accents
- Responsive dashboard for desktop and Android
- 12 simulated operation modules:
  - SYSTEM SCAN
  - NETWORK RADAR
  - IP TRACE
  - DEVICE INFILTRATION
  - FIREWALL BREACH
  - PASSWORD CRACKER
  - DATA EXTRACTION
  - CAMERA ACCESS
  - SATELLITE LINK
  - MAINFRAME OVERRIDE
  - DIGITAL FORENSICS
  - ENCRYPTION BREAKER
- DARK TERMINAL with simulator-only commands
- PROFILE GENERATOR for fictional identities
- Local activity history and progress animations
- Android packaging through Capacitor and GitHub Actions

## Run the web version locally

Requirements: Node.js 20 or newer.

~~~bash
npm install
npm start
~~~

Open the local address printed by the server.

## Build the Android APK locally

Requirements: Node.js 20+, JDK 17, Android SDK, and Android platform tools.

~~~bash
npm install
npx cap add android
npx cap sync android
~~~

On Windows PowerShell:

~~~powershell
cd android
.\gradlew.bat assembleDebug
~~~

The debug APK is created at:

**android/app/build/outputs/apk/debug/app-debug.apk**

## Build the APK with GitHub Actions

1. Open the repository's **Actions** tab.
2. Select **Build Android APK** and choose **Run workflow**, or push a commit to main.
3. Open the completed workflow run.
4. Download the **BYTE-PHANTOM-debug-apk** artifact.

The workflow builds a debug APK. It is suitable for testing and direct installation; a production release should later use a securely managed signing key.

## Project structure

~~~text
BYTE-PHANTOM/
├── .github/workflows/android-apk.yml
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── capacitor.config.json
├── package.json
└── README.md
~~~
