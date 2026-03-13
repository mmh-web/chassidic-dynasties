# Chassidic Dynasty Lineage — Project Reference

Interactive web app mapping the lineage of major Chassidic dynasties from the Baal Shem Tov (1698) to present day.
Built as a teaching tool for Orthodox Jewish high school history classes and adult education.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4 (no component library)
- Single-page app, no router, no backend
- GitHub Pages deployment at `https://mmh-web.github.io/chassidic-dynasties/`
- Base path: `/chassidic-dynasties/` (conditional in vite.config.js — `/` for dev, `/chassidic-dynasties/` for build)
- Dev server port: 5175

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app — overview grid + detail tree views, figure cards, detail panel (~412 lines) |
| `src/data/dynasties.js` | All 65 figures, dynasty color palette, branch groupings |
| `src/data/branches.js` | 10 branch definitions (name, color, rootIds, gateway figure) |
| `src/index.css` | Tailwind import + base dark theme |
| `src/main.jsx` | React entry point |
| `index.html` | HTML shell, Google Fonts (Frank Ruhl Libre for Hebrew) |
| `vite.config.js` | Vite + React + Tailwind plugins, conditional base path |

## Data Model

### Figure Schema (`src/data/dynasties.js`)
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

### 65 Figures Across 10+ Generations
- **Gen 0**: Baal Shem Tov (founder)
- **Gen 1**: Maggid of Mezritch (primary successor)
- **Gen 2**: 7 major students (Shneur Zalman, Menachem Nachum, Elimelech, Levi Yitzchak, Aharon of Karlin, Zusha, Nachman)
- **Gen 3-10**: Full lineage through current/recent rebbes

### Dynasty Color Palette (11 groups)
| Branch | Color | Hex |
|--------|-------|-----|
| Chabad-Lubavitch | Yellow | #facc15 |
| Polish (Peshischa→Ger) | Pink | #ec4899 |
| Chernobyl | Emerald | #34d399 |
| Ruzhin | Violet | #a78bfa |
| Galician (Sanz) | Orange | #f97316 |
| Belz | Green | #4ade80 |
| Vizhnitz | Cyan | #22d3ee |
| Satmar | Red | #ef4444 |
| Karlin-Stolin | Blue | #60a5fa |
| Breslov | Teal | #2dd4bf |
| Other | Gray | #9ca3af |

### Branch Definitions (`src/data/branches.js`)
10 branches: Chabad, Polish, Chernobyl, Ruzhin, Galician, Belz, Satmar, Vizhnitz, Karlin-Stolin, Breslov.
Each has `id`, `name`, `subtitle`, `color`, `gatewayId` (entry figure on overview), `rootIds` (tree roots for detail view), `description`.

## App Architecture

### Navigation (A+C Design)
Two views, controlled by `view` state:
1. **Overview** (`view === 'overview'`): Besht → Maggid → 10 branch cards in responsive grid
2. **Detail** (`view === branchId`): Full recursive tree for one dynasty + bio detail panel

### Component Structure (all in App.jsx)
- `FigureCard` — Dynasty-colored card with name, Hebrew, years, court. 3 sizes: small/normal/large
- `VerticalConnector` / `HorizontalBranch` — SVG tree connectors
- `TreeNode` — Recursive component rendering full subtree in detail view
- `DetailPanel` — Bottom popup with full bio, metadata, backdrop blur
- `OverviewView` — Landing page with Besht → Maggid → branch cards
- `DetailView` — Full lineage tree with back button, horizontal scroll, auto-center

### State
- `view`: 'overview' | branch ID string
- `selectedFigure`: figure object or null (for detail panel)
- `buildLookup()`: memoized tree builder from flat figures array

### Interactions
- Click branch card → navigate to detail view
- Click figure → show bio in detail panel (toggle on re-click)
- Back button → return to overview, clear selection

## Visual Design
- **Dark theme**: background `#0a0a0f`, text `#e5e5e5`
- **Dynasty accent colors**: colored top borders on cards, colored connectors
- **Hover effects**: `scale-[1.02]` + `brightness-125`
- **Selected state**: `ring-2 ring-offset-2`
- **Detail panel**: `backdrop-blur-md` + semi-transparent dark
- **Hebrew font**: Frank Ruhl Libre (Google Fonts)
- **Responsive grid**: `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## Deployment

### Git Remote
- **origin** → `mmh-web/chassidic-dynasties`

### Live URL
- https://mmh-web.github.io/chassidic-dynasties/

### Steps
1. Build: `npx vite build` (from project directory)
2. Commit source + dist to `main`, push
3. Deploy to gh-pages:
   - `git stash && git checkout gh-pages && git pull origin gh-pages`
   - `git show main:dist/index.html > index.html`
   - `rm -rf assets && mkdir assets` then copy from `dist/assets/`
   - `git add index.html assets/ && git commit && git push origin gh-pages`
   - `git checkout main && git stash pop`

**gh-pages structure is FLAT**: `index.html` + `assets/` at repo root.

## Dev Server Setup
Launch config in `.claude/launch.json`:
```json
{
  "name": "chassidic",
  "runtimeExecutable": "bash",
  "runtimeArgs": ["-c", "cd /Users/mhecht/Desktop/chassidic-dynasties && npx vite --port 5175"],
  "port": 5175
}
```

## User Preferences & Workflow
- **Never ask for permission** — just do the work and show results
- User playtests and gives feedback iteratively
- Keep dev server running after changes
- Auto-update this CLAUDE.md every ~30 min or after significant changes
- Track context window — warn at ~20% remaining
- Commit with clear messages, deploy fully when asked
- Stage specific files (avoid `git add -A`)

## Design Decisions
- **A+C approach chosen**: Vertical org-chart tree (A) + chapter/zoom drill-down (C)
- Original timeline SVG view was abandoned — too complex, scrolling issues, overwhelming
- Dark theme with dynasty-specific accent colors for visual differentiation
- Each dynasty gets its own "chapter" with full lineage tree
- Overview serves as table of contents for classroom navigation

## Target Audience
- **Primary**: Orthodox Jewish high school students studying Chassidic history
- **Secondary**: Adult education participants
- **Use case**: Classroom projection — teacher walks through dynasties one at a time
- Must be clear at a glance, not require exploration to understand

## Completed Work
- ✅ Full data set: 65 figures across all major dynasties
- ✅ Overview landing page with Besht → Maggid → 10 branch cards
- ✅ Detail view with recursive family tree rendering
- ✅ Figure cards with dynasty colors, Hebrew names, years
- ✅ Detail panel with biographical information
- ✅ Tree auto-centering on branch view load
- ✅ Responsive layout (grid adjusts by breakpoint)
- ✅ GitHub Pages deployment pipeline
- ✅ Live at https://mmh-web.github.io/chassidic-dynasties/

## Pending / Future Ideas
- Interactive features: search, filter, timeline slider
- Era-based storytelling mode (Option D from design brainstorm)
- Geographic map view (Option B)
- Educational annotations / "teaching mode" overlays
- Mobile optimization pass
- Cross-dynasty connection visualization
