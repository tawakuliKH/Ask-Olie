<div align="center">

# 🦉✨ AIKidLy ✨🦉

**Meet Kai — a friendly owl chatbot that answers kids' curious questions in simple, safe, age-appropriate language.**

🌈 🧠 💬 🎈 🌟

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://aikidly.vercel.app)
[![Made with React](https://img.shields.io/badge/frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)

[**🔗 Live Demo**](https://aikidly.vercel.app) · [🐛 Report a Bug](https://github.com/tawakuliKH/AIKidLy/issues) · [💡 Request a Feature](https://github.com/tawakuliKH/AIKidLy/issues)

</div>

<br />

<div align="center">
  <img src="./docs/screenshot.png" alt="AIKidLy chat interface showing a conversation between a child and Kai the owl" width="760" />
</div>

<br />

<div align="center">

🌤️ ☁️ ✨ 🦋 ☁️ 🌤️

</div>

---

## 📚 Table of Contents

- [🦉 About](#-about)
- [💡 Why AIKidLy](#-why-aikidly)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [☁️ Deployment](#️-deployment)
- [♿ Accessibility](#-accessibility)
- [🔒 Privacy & Child Safety](#-privacy--child-safety)
- [🔍 SEO](#-seo)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🦉 About

**AIKidLy** is a single-page web application starring **Kai**, a friendly animated owl who gives children roughly ages 6–12 a safe, encouraging way to ask "why" and "how" questions about the world — and get short, warm, age-appropriate answers back.

The project was built with one core design principle above all others: **child safety comes first, at every layer** — from the AI provider chosen, to the system prompt constraining every response, to how (and whether) any data is stored at all.

There's no complicated setup for the end user. No API key to manage, no technical configuration exposed anywhere in the interface — just open the page, sign in (or skip that entirely with Guest Mode), and start asking questions. 🎈

## 💡 Why AIKidLy

Most general-purpose AI chatbots aren't built with children in mind — their tone, content boundaries, and interface assume an adult user. AIKidLy exists to close that gap:

- 🧠 **Purpose-built system prompt** constrains every response to short, simple, age-appropriate language, and gently redirects away from mature or unsafe topics
- 🚫 **No dark patterns** — no accounts required to try it, no data harvesting beyond what's needed to function, no ads
- 👨‍👩‍👧 **Designed to be used *with* a grown-up nearby**, not as an unsupervised babysitter — the interface and copy reflect that throughout

## ✨ Features

### 💬 Conversational Chat Interface
A clean, single-page chat experience. Kids can type a question and press Enter or tap send, and Kai responds in a friendly chat bubble. Before the first message, tappable suggestion chips (e.g. *"Why is the sky blue?"*) help kids get started without needing to know what to ask.

### 🦉 Kai, the Animated Owl Mascot
Kai is a hand-built SVG character with two animation states:
- **Idle** 😌 — a slow, natural blink loop and gentle wing sway
- **Thinking** 🤔 — faster wing-flapping paired with animated "..." dots while waiting for a response

All animations respect the `prefers-reduced-motion` browser/OS setting, freezing entirely for users who've requested reduced motion.

### 🎤 Voice Input
Kids can ask questions out loud instead of typing, using the browser's native Web Speech API. Tap the microphone button, speak, and watch the words appear live in the input box — reviewed before sending, so nothing gets sent by accident from a mis-transcription.

### 🔊 Voice Output
Kai can read his answers aloud too! Tap the speaker icon on any reply to hear it spoken, or flip on auto-read in the top bar so every new answer is read aloud automatically. 🗣️

### 🔐 Flexible Sign-In
Two ways to start chatting:
- **Sign in with Google** 🔑 — a quick, familiar one-tap flow using Google Identity Services
- **Guest Mode** 🎭 — skip sign-in entirely and start chatting immediately, no account, no identity linked

### 🗂️ Multi-Session Chat History
A ChatGPT-style sidebar keeps track of past conversations:
- ➕ **New Chat** button starts a fresh conversation while keeping previous ones intact
- 🏷️ Each past conversation gets an auto-generated title and a relative timestamp ("3m ago", "2d ago")
- 🔄 Click any past conversation to reload it instantly
- 🗑️ Delete individual conversations, or **clear all history** in one confirmed tap
- 💾 Stored entirely in the browser's `localStorage` — never sent to or stored on a server

### 👤 Profile Menu
A profile avatar in the top corner opens a dropdown with the signed-in user's name, email, and a sign-out button. Guest users see a clear "Guest / Not signed in" indicator instead.

### 🌍 Bilingual Landing Page
A dedicated landing page welcomes visitors in **English by default**, with a language dropdown to switch to **فارسی (Persian)** — full right-to-left layout, native Vazirmatn typography, and translated content, not just translated labels.

### 🎨 Distinct, Purposeful Design
- The **sign-in screen** uses a playful, storybook-style design — a bold amber-bordered card, bigger mascot, bouncy typography 🎪
- The **main chat interface** uses a cleaner, more app-like layout (sidebar + topbar + chat panel) suited to daily returning use
- Animated background decorations — drifting clouds ☁️, twinkling sparkles ✨, and a fluttering butterfly 🦋 — bring the sky-themed palette to life without ever interfering with usability

### 📱 Fully Responsive
Works cleanly from phone-width screens up through desktop.

### ♿ Accessible by Default
Full keyboard operability, `aria-label`s on every icon-only control, visible focus states, and screen-reader-friendly structure throughout.

### 🛡️ Safety-First Backend
- The AI provider's API key **never reaches the browser**
- Every request is prepended server-side with a fixed, non-editable system prompt
- Response length is capped server-side to keep behavior predictable
- **Guest requests are rate-limited** to prevent casual abuse of the free-tier API quota
- All failure paths return a friendly, non-technical message — a child never sees a raw error 🌈

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Build tool | Vite |
| Styling | Plain CSS with a custom design-token system |
| Fonts | Google Fonts — Fredoka, Nunito, Vazirmatn (Persian) |
| Backend | Vercel Serverless Function (Node.js) at `/api/chat` |
| AI Provider | [Google Gemini API](https://ai.google.dev) — `gemini-3.1-flash-lite` |
| Authentication | Google Identity Services, verified server-side via `google-auth-library` |
| Voice | Browser-native Web Speech API (input + output) |
| Data storage | Browser `localStorage` only — **no backend database** |
| Hosting / CI | GitHub → Vercel, auto-deploy on every push to `main` |

## 🏗️ Architecture