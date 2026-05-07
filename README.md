# LiveCat 🐱 - TikTok LIVE Chat Reader

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
[![Download LiveCat](https://img.shields.io/badge/Download-LiveCat-brightgreen?style=for-the-badge&logo=windows)](https://github.com/JJacKTH/LiveCat/releases/latest)

![LiveCat Banner](src/renderer/public/branding/banner.png)

**LiveCat** is a professional, cute, and high-performance Windows application designed for TikTok streamers. It allows you to read your LIVE chat, gifts, joins, and likes in real-time with built-in Text-to-Speech (TTS) and a customizable overlay for OBS/TikTok Live Studio.

## ✨ Features

- 🚀 **Real-time Connectivity**: Just enter your @username and connect instantly.
- 🔄 **Auto-Reconnect**: Automatically reconnects if your internet drops or TikTok disconnects (v1.0.2).
- 💬 **Smart Chat Feed**: Beautifully categorized events (Chat, Gifts, Likes, Joins, Follows).
- 🔊 **Thai TTS**: Automated queue-based voice assistant for reading comments and gift thanks.
- 🎯 **Gift Filter**: Set a minimum coin threshold for TTS to skip reading small gifts (v1.0.2).
- 🎵 **Sound Alerts (SFX)**: Distinct notification sounds for Follows and Shares (v1.0.2).
- 🖼️ **Stream Overlay**: Separate transparent window with Green Screen support for easy capture.
- 📦 **Portable & Installer**: Choose between a standard installation or a single portable .exe.
- 🎨 **Premium UI**: Modern dark theme with smooth animations and glassmorphism.
- ☁️ **Auto-Update Checker**: Never miss a new feature with built-in version checking (v1.0.2).

## 🚀 Quick Start

### Installation
1. Download the latest version from the [Releases](https://github.com/JJacKTH/LiveCat/releases) page.
   - `LiveCat Setup 1.0.2.exe` (Installer)
   - `LiveCat 1.0.2.exe` (Portable)
2. Run the application.
3. Enter your TikTok username (e.g., `@mychannel`).
4. Click **Connect**.

### Using with TikTok Live Studio / OBS
1. Open the **Overlay Window** using the monitor icon in LiveCat.
2. In your streaming software (OBS or TikTok Live Studio), add a new **Window Capture** source.
3. Select the `LiveCat - Overlay` window.
4. If using the Green Screen, add a **Chroma Key** filter to remove the green background (#00FF00).

## 📦 What's New in v1.0.2

- **Sound Alerts (SFX)**: New audio cues for Follow and Share events with dedicated volume control.
- **Gift Min Coins Filter**: Added a filter to skip reading gifts below a specific coin value (e.g., skip 1-coin roses).
- **Auto-Reconnect System**: Robust reconnection logic that waits 60s before retrying to prevent spamming.
- **Persistent Settings**: Your volume, filters, and auto-reconnect preferences are now saved and restored on startup.
- **UI Improvements**: Redesigned TTS control panel for better organization and premium look.
- **Update Checker**: Automatic notification when a new version is released on GitHub.

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/JJacKTH/LiveCat.git
cd LiveCat

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build Installer
npm run dist:win

# Build Portable Version
npm run portable
```

## ⚠️ Limitations & Security

- **Unofficial API**: This project uses the [tiktok-live-connector](https://github.com/zerodytrash/TikTok-Live-Connector) library. It is not an official TikTok product.
- **Protocol Changes**: If TikTok updates their system, this app may require an update to continue working.
- **Privacy**: LiveCat does **not** require your password. It only uses your public username to join the live stream as a viewer.

## 🛠️ Troubleshooting

- **Connection Failed**: Ensure your stream is actually LIVE before connecting.
- **TTS Not Working**: Check if your system has Thai voices installed (Settings > Time & Language > Speech).
- **Overlay Transparent Issue**: In OBS, ensure "Capture Method" is set to "Windows 10" or "BitBlt" if transparency isn't working correctly.

---

### 🐱 Join the Community
Follow for updates and report bugs on the [GitHub Issues](https://github.com/JJacKTH/LiveCat/issues) page.

---

Created with ❤️ by [Adam Nightingale](https://www.facebook.com/adam.nightingale.2024/)