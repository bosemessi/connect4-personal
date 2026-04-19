# Multiplayer Connect 4 — Build Blueprint

A comprehensive plan for the multiplayer Connect 4 repository: a static, peer-to-peer web game hosted on GitHub Pages.

---

## 1. Tools & Dependencies

Because this is a static site hosted on GitHub Pages, we get to skip the headache of massive `node_modules` folders and complex backend environments.

| Category | Requirement |
|---|---|
| **Local Dev** | VS Code + the **Live Server** extension (to run the game locally and test URLs) |
| **Runtime Deps** | No `npm` required — **PeerJS** is pulled in via CDN directly in the HTML |
| **UI Extras** | A lightweight icon library (FontAwesome or Google Material Icons), also via CDN |
| **Version Control** | Git, linked directly to the GitHub repository |

---

## 2. Folder Structure

The code is broken into specific files based on responsibility so it doesn't turn into a giant, unreadable mess.

```text
connect4-multiplayer/
├── index.html          # Single HTML file containing all UI screens
├── css/
│   ├── style.css       # Main layout, typography, utility classes
│   └── game.css        # Grid, tokens, and animations
├── js/
│   ├── app.js          # Entry point: URL checking + screen switching
│   ├── gameLogic.js    # The "brain": 2D array, win checking, turn management
│   ├── network.js      # PeerJS: connections, sending/receiving data
│   └── ui.js           # DOM: drawing the board, animating coin drops
├── assets/
│   ├── sound/          # (Optional) drop, win, and lose sounds
│   └── images/         # Favicon, background patterns, custom token art
└── README.md           # How to play and how the code works
```

---

## 3. Assets — Tokens & The Board

Instead of using heavy image files, the most performant and visually pleasing way to build a Connect 4 board is with **pure CSS and SVG**.

- **The Board** — A 7×6 CSS Grid. To mimic a real physical board, the blue plastic grid sits on a higher `z-index`, and CSS radial gradients create "transparent holes" in the blue squares.
- **The Tokens (Coins)** — Simple `<div>` elements styled as 3D coins via `border-radius: 50%` and inner `box-shadow` for depth.

| Player | Token Color |
|---|---|
| Player 1 | 🔴 Red |
| Player 2 | 🟡 Yellow |

---

## 4. Mechanics — Dropping a Coin

The "drop" effect is crucial for the game to feel right. Here's the interaction flow between the user, the logic, and the UI:

1. **Interaction** — A player clicks anywhere on a specific column.
2. **Logic** ([js/gameLogic.js](js/gameLogic.js)) — The code scans the column's 2D array from the bottom row (5) up to the top (0), finding the first empty slot (`0`).
3. **Animation** ([js/ui.js](js/ui.js)) — If row 2 is empty, the UI creates a colored token `<div>` positioned above the board, then applies a `transform: translateY()` transition so the coin visually "falls" into row 2. It slides *behind* the blue board thanks to the `z-index` setup.
4. **State Update** — The 2D array is updated with the player's ID (`1` or `2`).
5. **Win Check** — The system checks horizontal, vertical, and diagonal lines for 4 matching IDs.
6. **Network Broadcast** ([js/network.js](js/network.js)) — The clicked column is sent over PeerJS so the opponent's browser runs the exact same animation and state update.

---

## 5. UI States — The App Flow

This is a single-page application (SPA) without reloads. [index.html](index.html) contains three "screens" (HTML sections) that JavaScript shows or hides based on state.

### Screen 1 — Landing Page
> *No invite link in URL*

- Game title
- **Host a Game** button

### Screen 2 — Lobby (Waiting Room)

**For the Host**
- Generated invite link
- **Copy Link** button
- Status: *"Waiting for opponent…"*
- Popup: *"Player wants to join. Accept?"*

**For the Guest** *(arrives via invite link)*
- Status: *"Knocking on host's door… waiting for approval."*

### Screen 3 — Arena (Game Board)

- Turn indicator: *"Your Turn"* vs *"Opponent's Turn"*
- The Connect 4 grid
- A **Play Again / Rematch** button that appears when the game ends

---

## 6. Development Phasing

To avoid getting overwhelmed, we tackle this in four distinct phases.

### 🧱 Phase 1 — UI Shell
Build the HTML/CSS for the landing page, lobby, and an empty game board. Get URL-parameter checking working so it switches between Landing and Lobby correctly.

### 🎮 Phase 2 — Local Game Engine
Build board clicking, gravity (finding the lowest empty row), the CSS dropping animation, and the win-checking algorithm. Play it locally against yourself.

### 🌐 Phase 3 — Network Bridge
Integrate PeerJS. Connect two browser windows locally. Pass the "column clicked" data between them.

### 🔐 Phase 4 — The Gatekeeper
Add the Host Approval popup logic to finalize the security requirement.
