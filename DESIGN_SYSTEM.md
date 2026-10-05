# Intuition First — Design System Specification

A minimal, modern, precision scientific and mathematical design system extracted from [`posts/01-motion-and-time.html`](file:///Users/aayushagarwal/projects/intuition-first/posts/01-motion-and-time.html) and [`js/post-01.js`](file:///Users/aayushagarwal/projects/intuition-first/js/post-01.js).

---

## 1. Design Philosophy & Aesthetic: "Monograph"

The publication uses the **Monograph Theme** — a scholarly archival aesthetic that pairs warm editorial typography with crisp, high-contrast, mathematically exact geometric visualizations.

### Core Architectural Invariants
1. **100% Static & Zero Build Step**: Runs directly via `file://` and GitHub Pages. No bundlers or build steps.
2. **Semantic Physics Palette**: Colors represent immutable physical concepts across all visual elements (vectors, text badges, sliders, canvas paths).
3. **Single Locus of Truth**: Dynamic values, coordinates, and angles live directly on canvas vectors, label pills, or slider header badges. Redundant external telemetry tables are eliminated unless tracking non-spatial invariants.
4. **Dual-Container Discipline**:
   - Longform reading flow stays inside `.editorial-prose` (`max-width: ~680px–740px`).
   - Interactive widgets and comparative matrices expand into `.wide-reading-container` (`max-width: ~1100px–1200px`).
5. **Retina-Crisp & Deterministic Rendering**: Canvas rendering is calibrated for high-DPI displays with bidirectional scrubbing and zero drift.

---

## 2. Color Tokens & Semantic Physics Palette

All colors map to CSS Custom Properties in `css/style.css` and runtime canvas color objects returned by `UniverseSimulations.getThemeColors()`. Never hardcode static hex values into canvas renderers.

### Surfaces & Chrome
| CSS Variable | Light Mode (Warm Parchment) | Dark Mode (Scholarly Umber) | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-space` | `#faf8f5` | `#141311` | Document & base viewport background |
| `--bg-card` | `#ffffff` | `#1c1a17` | Artifact container surface, modal cards |
| `--bg-card-subtle` | `#f4f1ea` | `#181613` | Secondary panels, docked twin-clock trays |
| `--bg-surface-elevated`| `#ede8de` | `#24221e` | Interactive chips, buttons, elevated pills |
| `--border-subtle` | `#e5e0d5` | `rgba(232, 228, 218, 0.10)` | Inner hairline dividers |
| `--border-medium` | `#d1cac0` | `rgba(232, 228, 218, 0.20)` | Outer card boundaries |

### Typography Tokens
| CSS Variable | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#18191b` (Carbon Ink) | `#f4f1ea` (Aged Bone) | Titles, section headers, strong labels |
| `--text-prose` | `#24272c` | `#e8e4da` | Longform editorial reading text |
| `--text-secondary` | `#4a4e57` | `#d4cebf` | Subtitles, figure captions, secondary meta |
| `--text-muted` | `#646872` | `#9e998e` | Inactive states, ticks, subtle annotations |

### Semantic Physics Palette
| Concept | CSS Variable | Canvas Property | Light Mode | Dark Mode | Physical Representation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Time / Rest Frame** | `--color-time` | `timeColor` | `#1d4ed8` | `#60a5fa` | Motion through time, Blue Car, Earth/Alice rest frame, $ct$-axis |
| **Space / Motion** | `--color-space` | `spaceColor` | `#c2410c` | `#fb923c` | Spatial motion, Orange Car, Bob's frame, $v_x$, displacement |
| **Cosmic Invariant ($c$)**| `--color-invariant`| `invariantColor`| `#6d28d9` | `#c084fc` | Cosmic speed limit $c$, speed circle radius, 45° light cone |
| **Light / Wavefronts** | `--color-photon` | `photonColor` | `#b45309` | `#fbbf24` | Timeless photon ($v = c$), light wavefronts, flashes |
| **Agreement / Invariant**| `--color-emerald` | `emeraldColor` | `#0f766e` | `#34d399` | Invariant interval, simultaneity, entropy agreement |
| **Forbidden / Decay** | `--color-danger` | `dangerColor` | `#b91c1c` | `#f87171` | Speeds $> c$, Newtonian decay barrier, causality disconnect |

---

## 3. Typography Hierarchy

| Style | Font Family | Weight | Size / Leading | Target Elements |
| :--- | :--- | :--- | :--- | :--- |
| **Article Title** | `Plus Jakarta Sans` | 800 | `2.4rem` / `1.15` | `.article-title` |
| **Section Header (H2)**| `Plus Jakarta Sans` | 700 | `1.75rem` / `1.25`| `h2` |
| **Subheader (H3)** | `Plus Jakarta Sans` | 600 | `1.25rem` / `1.35`| `h3` |
| **Longform Prose** | `Newsreader` (Serif) | 400, 500, Italic | `18px` / `1.72` | `.editorial-prose p` |
| **Interface / UI** | `Plus Jakarta Sans` | 500, 600 | `0.85rem–1rem` | `.btn-*`, `.control-item span` |
| **Code & Tabular Math**| `JetBrains Mono` | 500, 600 | `10px–13px` | `.math-badge`, `.control-val`, Canvas ticks |

### Typography Components
- **Math Badges (`.math-badge`)**: Monospaced inline badges (`background: var(--math-badge-bg); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em;`) for mathematical variables ($x_1, x_2, v, c$).
- **Taxonomy Badge (`.category-tag`, `.artifact-badge`)**: Uppercase monospaced metadata (`letter-spacing: 0.08em; font-size: 0.72rem; font-weight: 700;`).

---

## 4. Layout & Responsive Architecture

### Viewport Breakpoints & Rules
- **Desktop (`> 768px`)**:
  - Prose: `max-width: 680px; margin: 0 auto;`
  - Widgets: `.wide-reading-container` (`max-width: 1140px`)
  - Multi-canvas displays: `.comparison-grid` (`grid-template-columns: 1fr 1fr; gap: 1rem;`)
  - Canvas height: `380px` (or `420px` for 3D projections)
- **Tablet (`<= 768px`)**:
  - Canvas height: `300px`
- **Mobile (`<= 640px`)**:
  - Canvas height: `240px` (preserves coordinate landscape aspect ratio)
  - Comparative matrices collapse to a single column (`grid-template-columns: 1fr;`)
  - `.controls-strip` automatically stacks controls vertically (`flex-direction: column; align-items: stretch;`)
  - **Twin Clocks Mobile Guard**: Clocks must **never** collapse vertically; keep side-by-side using `grid-template-columns: 1fr 1fr; gap: 0.5rem;` to preserve comparative clarity.

---

## 5. UI Components & Control Patterns

### A. The Interactive Simulation Container (`.interactive-artifact`)
```html
<div id="widget-sample" class="interactive-artifact artifact-wide">
  <!-- Lean Module Header -->
  <div class="artifact-header">
    <div class="artifact-badge">SIMULATION 0X · [MODULE NAME]</div>
  </div>

  <!-- Dual-Canvas Comparison Grid -->
  <div class="comparison-grid">
    <div class="canvas-col">
      <div class="canvas-col-header">
        <span>LEFT TITLE</span>
        <span class="canvas-col-tag">Metric Description</span>
      </div>
      <canvas class="canvas-map"></canvas>
    </div>
    <div class="canvas-col">
      <div class="canvas-col-header">
        <span>RIGHT TITLE</span>
        <span class="canvas-col-tag">Metric Description</span>
      </div>
      <canvas class="canvas-vel"></canvas>
    </div>
  </div>

  <!-- Single-Row Compact Controls Strip -->
  <div class="artifact-controls controls-strip">
    <div class="clock-card cyan" style="margin: 0; padding: 0.4rem 0.75rem; display: flex; align-items: center; gap: 0.65rem; white-space: nowrap; flex-shrink: 0;">
      <span class="clock-label" style="font-size: 0.68rem;">Personal Wristwatch</span>
      <span class="clock-time clock-val" style="font-size: 1.1rem; line-height: 1;">3.50 <span>s</span></span>
      <span class="clock-badge">100% Rate</span>
    </div>
    <div class="control-item" style="flex: 1; min-width: 160px;">
      <div class="control-header">
        <span>Control Label</span>
        <span class="control-val cyan val-label">Value</span>
      </div>
      <input type="range" class="range-slider slider-sample" min="0" max="1000" value="500">
    </div>
    <button class="btn-primary btn-play" style="flex-shrink: 0;">
      <span>▶</span><span>Auto Play</span>
    </button>
  </div>
</div>
```

### B. Controls & Inputs
- **Interactive Sliders (`.range-slider`)**:
  - Discrete, low-friction slider with customizable accent hues (`.amber` for Space, `.cyan` for Time).
  - Paired with `.control-header` featuring title and live formatted monospace readout (`.control-val`).
- **Preset Chips (`.preset-chips > .chip-btn`)**:
  - Pill buttons (`border-radius: 999px; font-family: var(--font-mono); font-size: 0.74rem;`).
  - Active chip (`.chip-btn.active`): Elevates with high-contrast card background and primary outline.
- **Twin Digital Clocks (`.clock-card`)**:
  - Border-accented telemetry card (`.cyan` for stationary, `.amber` for moving, `.danger` for classical limits).
  - Contains `.clock-meta` (label + status badge), `.clock-time` (large tabular numerals), and `.clock-subtext` (contextual explanation).
- **Formula Cards (`.formula-card`)**:
  - Archival formula presentation block with `.formula-tag`, `.formula-body` (large italicized expression), and `.formula-note` (intuitive meaning).

---

## 6. Canvas Simulation Engineering Patterns (`js/post-01.js` & `js/core.js`)

### 1. Retina Canvas Setup
Always wrap canvas drawing contexts in `setupRetinaCanvas`:
```javascript
var ret = setupRetinaCanvas(canvas);
var ctx = ret.ctx, width = ret.width, height = ret.height;
ctx.clearRect(0, 0, width, height);
```
Multiplies drawing resolution by `devicePixelRatio` and normalizes the 2D transformation matrix.

### 2. Deterministic State & Animation Loop
```javascript
var progress = 0.60;
var isPlaying = true;
var isVisible = true;
var lastTimestamp = null;
var animFrame = null;

function loop(now) {
  if (!isPlaying || !isVisible) {
    animFrame = null;
    return;
  }
  if (!lastTimestamp) lastTimestamp = now;
  var dt = Math.min((now - lastTimestamp) / 1000, 0.2);
  lastTimestamp = now;

  progress = (progress + dt * speedFactor) % 1.0;
  updateReadouts();
  draw();
  animFrame = requestAnimationFrame(loop);
}

// Pause when off-screen to save CPU/battery:
observeSimulationVisibility(container, function () {
  isVisible = true;
  startLoop();
}, function () {
  isVisible = false;
  stopLoop();
});
```

### 3. Canvas Graphic Conventions
1. **Vector Terminators**:
   - **Velocity Space (`.canvas-vel`)**: Must terminate with filled triangular **arrowheads** (`drawVector(..., { mode: 'velocity' })`). Glowing dots must **never** be placed at velocity vector tips.
   - **Position Map (`.canvas-map`)**: Must terminate with a glowing position beacon (`drawGlowingDot(ctx, x, y, color, radius)`). Traces are paths, not free vectors.
2. **In-Canvas Label Pills (`drawLabelPill`)**:
   - Dynamic annotations must use floating pills with automatic viewport edge clamping (`clampPad = 6`) to prevent text from clipping off-screen.
3. **Constraint Circles & Arcs (`drawConstraintArc`)**:
   - Rendered as dashed arcs indicating invariant cosmic speed limits ($c$ or $60\text{ mph}$).
4. **Coordinate Drop Lines (`drawDropLines`)**:
   - Dashed lines dropping perpendicular to the axes, complete with right-angle indicators and live component labels.
