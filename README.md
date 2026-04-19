# Connect 4 — Multiplayer

A peer-to-peer, browser-based Connect 4 you can host from a single tab and share with a friend via link. No accounts. No servers. No build step.

> Click **Host a Game** → copy the link → your friend joins → you approve them at the door → play.

---

## Highlights

- **Zero backend.** Two browsers connect directly over WebRTC using [PeerJS](https://peerjs.com/) — the only runtime dependency, loaded from a CDN.
- **Host approval ("Gatekeeper").** Only people the host explicitly admits get into the game. Denied guests get told politely.
- **Static-site friendly.** Pure HTML, CSS, and vanilla JS — drops straight onto GitHub Pages.
- **Cinematic board.** CSS-only Connect 4 grid with falling-coin physics, dimmed tokens on game end, and a pulsing glow on the winning four.

---

## Quick Start

### Play it

1. Open [index.html](index.html) in a browser (or deploy the folder to GitHub Pages / any static host).
2. Click **Host a Game** — you get an invite URL like `.../index.html?invite=ab12cd34`.
3. Send the link to a friend.
4. When they "knock," click **Let them in**.
5. 🔴 Host plays Red. 🟡 Guest plays Yellow. First to four in a row wins.

### Run it locally

Any static server works. The simplest options:

```bash
# VS Code: install the "Live Server" extension, then right-click index.html → Open with Live Server
# Or using Python:
python3 -m http.server 5500
# Then visit http://localhost:5500
```

To test multiplayer locally, open the invite link in a second browser window (a different browser or an incognito tab works best, so the two peers don't share state).

---

## How It Works

The app is a single page with three "screens" that JavaScript swaps in and out — no reloads, no routing library.

```
                  ┌──────────────────┐
  URL has no      │  Landing Screen  │
  ?invite=  ────▶ │  [Host a Game]   │
                  └────────┬─────────┘
                           │ host clicks
                           ▼
                  ┌──────────────────┐        ┌──────────────────┐
                  │   Lobby (Host)   │        │  Lobby (Guest)   │
                  │  invite link +   │◀──────▶│  "Knocking…"     │
                  │  approval popup  │  peer  └──────────────────┘
                  └────────┬─────────┘  conn           ▲
                           │                           │
                           │  host accepts             │ URL has ?invite=xxxx
                           ▼                           │
                  ┌──────────────────────────────────┐ │
                  │           Game Arena             │◀┘
                  │  7×6 grid · turn indicator ·     │
                  │  coin-drop animation · win glow  │
                  └──────────────────────────────────┘
```

### The connection

- **Host** calls `new Peer(gameId)` with a random 8-character ID derived from the shareable URL ([js/network.js:6-23](js/network.js#L6-L23)).
- **Guest** lands on `?invite=<gameId>` and calls `peer.connect(hostId)` ([js/network.js:26-41](js/network.js#L26-L41)).
- Every move is a tiny JSON message: `{ type: 'move', column: 3 }`. Both clients run the same gravity and win-check logic against their local board, so the two views stay in sync without a server arbiter.

### The board

- A 7×6 CSS grid. The blue plastic face is a single layer of radial-gradient "holes" sitting on top of a tokens layer — so dropped coins slide *behind* the board as they fall ([css/game.css:6-51](css/game.css#L6-L51)).
- Win detection scans horizontal, vertical, and both diagonals from the cell that was just played, returning the exact coordinates of the four-in-a-row so the UI can spotlight them ([js/gameLogic.js:72-98](js/gameLogic.js#L72-L98)).

---

## Project Layout

```
connect4-personal/
├── index.html        # All three screens (Landing, Lobby, Arena) in one file
├── css/
│   ├── style.css     # Layout, typography, buttons, screen transitions
│   └── game.css      # Board grid, tokens, drop animation, winner glow
├── js/
│   ├── app.js        # Entry point: URL routing + screen switching
│   ├── gameLogic.js  # 2D board state, gravity, turn management, win check
│   ├── network.js    # PeerJS host/join/send/receive + approval flow
│   └── ui.js         # DOM rendering: board, tokens, animations
└── docs/
    └── plan.md       # Original design blueprint
```

---

## Design Notes

A few decisions worth calling out:

| Decision | Why |
|---|---|
| **PeerJS over a custom WebSocket server** | No infra to run, no cost, no cold starts. The tradeoff is that PeerJS's public broker handles signaling — fine for a toy, swap in your own if you scale. |
| **Gameplay state lives on both peers** | Each client runs the same `processMove()` logic. The network only transmits the *column clicked*, not the resulting board state — smaller messages, and divergence would be a loud bug. |
| **Deriving the Peer ID from the URL** | Lets the host share a single link that embeds the room identity. No "enter this code" step. |
| **Host approval before `initGame()`** | Anyone with the link can *knock*, but a game only starts when the host clicks **Let them in** — sent as `{ type: 'start_game' }` to sync both sides into the Arena screen. |

---

## Roadmap

Ideas that would be fun to add:

- **Rematch button** on the game-over screen (currently you refresh to restart).
- **Sound effects** for drops and wins (the `assets/sound/` folder is ready for them).
- **Draw detection** when the board fills with no winner.
- **Spectator mode** — additional peers that can watch but not play.
- **Mobile polish** — the 60px cells are a little tight on narrow screens.

---

## Credits

Built as a personal project. Powered by [PeerJS](https://peerjs.com/) for the WebRTC plumbing. The full build blueprint lives in [docs/plan.md](docs/plan.md).
