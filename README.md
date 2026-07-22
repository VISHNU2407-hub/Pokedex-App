# Pokédex — Premium Pokémon Browser

A modern, production-quality **Pokédex web application** built with **vanilla HTML5, CSS3, and JavaScript (ES6+)**. No frameworks, no libraries — just the native web platform and the free [PokéAPI](https://pokeapi.co/).

![Pokédex Screenshot](placeholder-screenshot.png)

> ⚠️ **Screenshot placeholder** — replace with an actual screenshot of the running app.

---

## Features

### 🔍 Search
- Search Pokémon by **name** (e.g. `charizard`) or **ID** (e.g. `6`)
- Quick‑search hint buttons for Pikachu, Charizard, and Mewtwo
- Enter key and button click both trigger a search
- Input trimming and empty‑search prevention

### 📋 Rich Display
- **Official artwork** sprite with a floating animation
- Pokédex ID, name, height, weight, base experience
- **Type badges** with distinct colours per type
- **Abilities** listed in a clean, readable format
- Six **base stats** shown as animated gradient progress bars

### 🧭 Navigation
- **Previous / Next** buttons to browse sequentially
- **Random** button to discover a surprise Pokémon
- ID wraps at 1 … 1010 with helpful boundary messages

### 💾 Persistence
- **Local Storage** remembers the last searched Pokémon across sessions
- Automatically restores the previous Pokémon on page load (or defaults to #1 Bulbasaur)

### 🎨 Premium UI
- Full‑screen animated gradient background with subtle star‑field overlay
- **Glassmorphism** card with backdrop‑filter blur and soft shadows
- Floating Pokémon sprite with glow pulse
- Smooth entrance / exit card transitions
- Hover effects on badges, buttons, stat rows, and the card itself
- Fully **responsive**: adapts seamlessly from mobile → tablet → desktop
- `prefers-reduced-motion` respected

### ⚡ Performance & UX
- Pokéball‑themed loading spinner while fetching
- Search button disabled during API calls to prevent duplicate requests
- Error banner auto‑dismisses after 6 seconds
- All stat bars animate with a shiny sweep effect

---

## Folder Structure

```
Pokedex-App/
├── index.html      # Semantic HTML5 entry point
├── style.css       # All styles (reset, layout, card, badges, stats, animations, responsive)
├── script.js       # Vanilla ES6+ JavaScript (async/await, fetch, DOM manipulation)
└── README.md       # This file
```

---

## How to Run

The app requires **no build step** and **no server**. Simply open the file in any modern browser:

1. **Clone or download** this repository.
2. **Open** `Pokedex-App/index.html` in your browser (double‑click or drag into a window).

> If you prefer a local server (useful for testing), you can run:
> ```bash
> cd Pokedex-App
> npx serve .
> ```
> Then navigate to `http://localhost:3000`.

### Browser Compatibility

Tested and working in:
- Google Chrome & Chromium (v100+)
- Mozilla Firefox (v100+)
- Apple Safari (v15+)
- Microsoft Edge (v100+)

---

## API Information

This project consumes the **free, open‑source [PokéAPI](https://pokeapi.co/)**.

| Detail | Value |
|---|---|
| Base URL | `https://pokeapi.co/api/v2` |
| Pokémon endpoint | `https://pokeapi.co/api/v2/pokemon/{id or name}` |
| Auth required | ❌ No |
| Rate limits | 100 requests per minute per IP (generous for personal use) |

Pokémon sprites are sourced from the [Pokémon Showdown](https://play.pokemonshowdown.com/) sprite repository and the official game artwork hosted by PokéAPI.

---

## Future Improvements

- [ ] **Shiny toggle** — switch between regular and shiny sprites
- [ ] **Evolution chain** — show evolution family tree
- [ ] **Type matchup chart** — display strengths & weaknesses
- [ ] **Pokédex entry text** — flavour text from the games
- [ ] **Dark / light theme toggle**
- [ ] **Grid view** — browse multiple Pokémon at once
- [ ] **Voice search** — Web Speech API integration
- [ ] **PWA manifest** — installable as a standalone app
- [ ] **Offline caching** — Service Worker for previously viewed Pokémon

---

## 📄 License

This project is open source and available for personal and educational use.

---

<p align="center">Made with 💜 by VKS (Visionary Kraft Studio) </p>

