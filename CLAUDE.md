# Chassidic Dynasty Lineage — Project Reference

Interactive web app mapping the lineage of major Chassidic dynasties from the Baal Shem Tov (1698) to present day.
Built as a teaching tool for Orthodox Jewish high school history classes and adult education.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4
- Single-page app, no router, no backend
- Dev server: `npx vite --port 5175` (launched via `preview_start` using missile-defense's launch.json)
- Project directory: `/Users/mhecht/Desktop/chassidic-dynasties/`

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app — SVG timeline visualization, detail panel, filtering, layout |
| `src/data/dynasties.js` | All dynasty data: figures, colors, branch groupings |
| `src/index.css` | Tailwind import + base styles (dark background) |
| `src/main.jsx` | React entry point |
| `index.html` | HTML shell, Google Fonts (Frank Ruhl Libre for Hebrew) |
| `vite.config.js` | Vite + Tailwind plugin config |

## Data Model (`src/data/dynasties.js`)

### Figure Schema
```js
{
  id: 'string',           // unique identifier
  name: 'Full Name',      // secular/full name
  hebrew: 'Hebrew name',  // Hebrew text
  title: 'Known As',      // common title (e.g., "The Alter Rebbe")
  years: [birth, death],  // death=null if still living
  court: 'City',          // city where court was based
  dynasty: 'Dynasty Name',// dynasty affiliation
  parentId: 'parent-id',  // teacher/predecessor (builds the tree)
  generation: 0-10,       // generation number from Besht
  notes: 'Bio text',      // biographical description
  relation: 'type',       // optional: 'great-grandson', 'son-in-law', 'nephew', 'student', 'descendant'
}
```

### Figures Included (~55 total)
- **Generation 0**: Baal Shem Tov
- **Generation 1**: Maggid of Mezritch
- **Generation 2**: Shneur Zalman (Chabad), Menachem Nachum (Chernobyl), Elimelech (Lizhensk), Levi Yitzchak (Berditchev), Aharon (Karlin), Zusha (Anipoli), Nachman (Breslov)
- **Generation 3+**: Full Chabad line (7 rebbes), Ger line (through current rebbe), Satmar (through both current factions), Belz (through current rebbe), Vizhnitz (through current rebbe), Bobov, Sanz-Klausenburg, Munkacs, Skver, Karlin-Stolin, Alexander, Toldos Aharon, Ruzhin branches (Sadigura, Tchortkov, Boyan), Polish line (Lublin → Peshischa → Kotzk → Ger)

### Dynasty Color Palette
| Branch | Color | Dynasties |
|--------|-------|-----------|
| Chabad-Lubavitch | Yellow (#facc15) | Chabad |
| Polish (Peshischa→Ger) | Pink (#ec4899) | Lublin, Peshischa, Kotzk, Ger, Alexander |
| Chernobyl | Emerald (#34d399) | Chernobyl, Skver, Talna, Rachmistrivka, Toldos Aharon |
| Ruzhin | Violet (#a78bfa) | Ruzhin, Sadigura, Tchortkov, Boyan |
| Galician (Sanz) | Orange (#f97316) | Sanz, Bobov, Klausenburg, Munkacs, Zhidachov, Ropshitz |
| Belz | Green (#4ade80) | Belz |
| Vizhnitz | Cyan (#22d3ee) | Vizhnitz |
| Satmar | Red (#ef4444) | Sighet-Satmar, Satmar, both current factions |
| Karlin-Stolin | Blue (#60a5fa) | Karlin-Stolin |
| Breslov | Teal (#2dd4bf) | Breslov |

## Current State (v1 — Timeline View)

### What's Built
- **Horizontal timeline SVG** spanning 1700–2026 with decade gridlines
- **Era labels**: Founding Era, Expansion, Golden Age, Holocaust & Rebuilding, Today
- **Life-span bars**: colored rectangles showing each figure's lifespan
- **Connection lines**: dashed bezier curves from parent's death to child's birth
- **Click-to-select**: clicking a figure shows a detail panel at the bottom with full bio
- **Dynasty filter**: dropdown to isolate a single branch family
- **Color-coded legend**: all branch families shown at top

### Known Issues with Current Approach
- Horizontal + vertical scrolling is hard to navigate — you can't see the big picture
- Depth-first tree ordering means branches are interleaved confusingly
- No visual separation between major branches (Chabad and Satmar look the same)
- A teacher can't point at the screen and say "here's the Polish branch"
- Too much data on one screen — overwhelming for students

## Design Discussion (Pending Decision)

Four approaches were brainstormed for a classroom-friendly redesign:

### Option A: Vertical Family Tree (org chart)
- Besht at top, branches flowing downward
- Each dynasty gets its own vertical column/lane
- Time flows top-to-bottom (generations = rows)
- **Best for**: showing branching structure clearly
- **Weakness**: gets very wide

### Option B: Geographic Map + Timeline Slider
- Map of Eastern Europe/Israel with court locations
- Timeline slider to show courts appearing/disappearing over time
- **Best for**: understanding geographic spread
- **Weakness**: more complex, less focus on lineage

### Option C: "Chapter" View — One Branch at a Time (RECOMMENDED)
- Landing page: Besht → Maggid → 6-8 major students as simple tree
- Click any branch to zoom into that dynasty's full lineage
- Breadcrumb navigation
- **Best for**: teaching one dynasty at a time without overwhelming students
- **Weakness**: harder to see cross-dynasty connections

### Option D: Era-Based Storytelling
- Swipe through 5 "chapters": Founding → Expansion → Golden Age → Holocaust → Today
- Each era shows who was active, what courts existed, key events
- **Best for**: narrative teaching, adult education
- **Weakness**: less useful as reference/lookup

**Initial recommendation**: Option C + elements of A, with optional era-based guided tour (D) as a separate mode.

**Status**: Awaiting user decision on direction before implementing.

## Target Audience
- **Primary**: Orthodox Jewish high school students studying Chassidic history
- **Secondary**: Adult education participants
- **Use case**: Classroom tool — teacher projects on screen, walks through dynasties
- Needs to be clear and understandable at a glance, not require exploration to make sense of

## User Preferences & Workflow

### Communication
- Be concise and direct — lead with what changed
- **Never ask for permission** — just do the work and show results
- User will playtest and give feedback iteratively

### Development
- Keep dev server running after changes for immediate playtesting
- Use `preview_start` with the "chassidic" config in missile-defense's launch.json
- Auto-update this CLAUDE.md every ~30 min of active work or after significant changes
- Track context window usage — warn at ~20% remaining

### Dev Server Setup
Since the Claude Code working directory is `/Users/mhecht/Desktop/missile-defense/`, the chassidic-dynasties dev server is configured as a second entry in missile-defense's `.claude/launch.json`:
```json
{
  "name": "chassidic",
  "runtimeExecutable": "bash",
  "runtimeArgs": ["-c", "cd /Users/mhecht/Desktop/chassidic-dynasties && npx vite --port 5175"],
  "port": 5175
}
```
Launch with: `preview_start("chassidic")` → serves at http://localhost:5175

### Key Gotchas
- Working directory is missile-defense, not chassidic-dynasties — all file paths must be absolute
- Dev servers die between messages — always verify via preview before sharing URLs
- Frank Ruhl Libre font loaded from Google Fonts for Hebrew text rendering
