# Intuition First — Agent Guide & Publishing Architecture

## 1. Project Overview & Architecture

*Intuition First* is an interactive, explorable scientific and mathematical publishing series explaining complex physics, mathematics, and information theory from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.

### Core Architectural Invariants
- **100% Static & Zero Build Step**: No npm, webpack, vite, or bundlers. Every page runs directly via `file://` or GitHub Pages.
- **Single Source of Truth**:
  - Design system specification: `DESIGN_SYSTEM.md` (authoritative specification for colors, typography, UI components, and canvas rendering patterns)
  - Global styles: `css/style.css`
  - Universal runtime utilities & theme engine: `js/core.js`
  - Modular essay simulation engines: `js/post-01.js`, `js/post-02.js`, `js/post-03.js`, `js/post-04.js`, etc.
  - Landing hub: `index.html`
  - Longform essays: `posts/01-motion-and-time.html`, `posts/02-light-cone.html`, `posts/03-spacetime-loaf.html`, `posts/04-understanding-entropy.html`

---

## 2. Editorial Philosophy & Preferred Writing Style

This series teaches physics and mathematics **bottom-up**, not top-down. Every article must feel like an unfolding voyage of discovery where mathematical formulas arrive as natural descriptions of geometric relationships that the reader has already experienced visually.

### The Monograph Voice & Narrative Tone
- **Inviting & Intellectually Elevated**: The prose reads like an elegant scholarly monograph (inspired by Feynman, Penrose, and Abbott's *Flatland*), yet remains completely free of academic pretension, gatekeeping, or jargon walls.
- **Perspective**: We use the shared first-person plural (*"we"*, *"let us"*, *"our"*) when exploring geometry together, paired with direct second-person experiential setups (*"sitting in your chair right now"*, *"your personal wristwatch"*).
- **Pure Constructive Elevation (Zero Complaining)**: Never disparage standard textbooks, university courses, or other educators. The beauty and geometric inevitability of the universe stands on its own merits without needing a foil.
- **Cadence Over Fragmentation (The 2–3 Sentence Rule)**: Never write choppy, one-sentence paragraphs (*"Nothing."* / *"Why?"* / *"Because..."*). Group connected thoughts into cohesive, rhythmic paragraphs of 2 to 4 sentences. This sustains dramatic momentum, preserves suspense, and respects reading velocity.
- **Concrete Physical Instruments Over Abstract Labels**: Always anchor physical frames to tangible everyday instruments:
  - Use *"Alice's ground stopwatch"* instead of *"the stationary observer's coordinate time"*.
  - Use *"the traveler's personal wristwatch"* instead of *"proper time $\tau$"*.
  - Use real physical milestones (e.g., *1 AU = 500 light-seconds to the Sun*, *Vega at 25 ly*, *atmospheric muons created 10 km up*).
- **Self-Contained Revelation**: The reader needs zero prerequisites beyond basic curiosity and middle-school arithmetic. Never invoke what "physicists know" or appeal to external authority. Derive everything from first principles.

### The 4-Stage Pedagogical Arc ("Pacing of Wonder")
Every essay and major section follows this rigorous four-step sequence:
1. **The Familiar Anchor**: Ground the discussion in an everyday, intuitive physical experience (two cars driving on a flat field with locked cruise control, turning on a flashlight in the dark, watching a stopwatch tick).
2. **The Natural Question**: Push that everyday anchor toward a physical extreme or paradox (*"What happens when you sit completely still?"*, *"What if the Sun vanished this instant?"*, *"Can you travel faster than light?"*). Never spoil the answer or reveal the extreme case before the reader explores it.
3. **The Geometric Bridge**: Translate the physical scenario into visual coordinate space (Velocity Space circle, Coordinate Spacetime $(x, ct)$, 3D light cone volume, expanding 2D ripple snapshots).
4. **The Inevitable Insight**: The mathematical formula arrives last, purely as a concise summary of the geometry already drawn and understood.

### Formula & Callout Cards
- **Formula Cards (`.formula-card`)**: Every core equation is enclosed in a structured card with three parts:
  ```html
  <div class="formula-card">
    <div class="formula-card-header">
      <span class="formula-tag">The Geometric Bridge</span>
    </div>
    <div class="formula-body">
      tan <em>φ</em> = Δ<em>x</em> / (<em>c</em> · Δ<em>t</em>) = <em>v</em>_x / <em>c</em> = sin <em>θ</em>
    </div>
    <div class="formula-note">
      Spatial speed on the speedometer governs the slope of the worldline: tan <em>φ</em> = sin <em>θ</em>.
    </div>
  </div>
  ```
- **Inline Math**: Use `<span class="math-badge">v_space = c · sin θ</span>` or clean italicized symbols ($\theta$, $\phi$, $\tau$, $\gamma$, $c$).
- **Insight Callouts (`.insight-callout`)**: Used for pivotal takeaways and myth-busting explanations (e.g., *"Why 45° Is the Cosmic Speed Boundary"*).
- **The "Food for Thought" 3-Puzzle Invariant**: Every article MUST conclude with a dedicated callout containing **exactly three named cosmic puzzles**:
  ```html
  <div class="insight-callout">
    <h4>Food for Thought: Three Cosmic Puzzles [of the Topic]</h4>
    <p>Before we move forward, consider three subtle puzzles that emerge when we push this geometry to its natural extremes:</p>
    <p><strong>1. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
    <p><strong>2. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
    <p><strong>3. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
  </div>
  ```
  These puzzles bridge the current essay to the next frontier, leaving the reader with a powerful sense of mystery and curiosity.

---

## 3. Headings Taxonomy & Best Practices

Headings guide the reader through an unfolding journey of discovery. They should never read like catalog entries or academic textbook chapters.

### Hierarchy & Style Rules

| Level | Role & Formatting | Preferred Pattern | Forbidden Patterns |
| :--- | :--- | :--- | :--- |
| **`<h1>`** | **Article Title**<br>Title Case, bold, profound insight or question hook. | *"Why Motion Through Space Affects Time"*<br>*"The Cosmic Light Cone: Mapping Space & Time"* | *"Special Relativity: Part 1"*<br>*"Lorentz Transformations & Time Dilation"* |
| **`<h2>`** | **Major Discovery Steps**<br>Numbered sequentially (`1. `, `2. `). Title Case. Physical metaphors and action-oriented discoveries. | `1. The Two-Car Trade-Off`<br>`2. Moving While Sitting Still`<br>`3. Borrowing from Time`<br>`4. Nature's Invariant Speed`<br>`5. The 45° Boundary` | `1. Introduction`<br>`2. Time Dilation Theory`<br>`3. Mathematical Derivations`<br>`4. Light Cone Definition` |
| **Final `<h2>`** | **The Forward Bridge**<br>Explicit launchpad into the next essay in the series. | `8. The Road to the Light Cone`<br>`4. The Angle of "Now"` | `Summary`<br>`Conclusion`<br>`Final Remarks` |
| **`<h3>`** | **Subsections & Thought Experiments**<br>Evocative setups, open questions, and structured breakdowns. | **Open questions**: *"Why is the Speed of Light an Unbreakable Limit?"*, *"Why Don’t We Notice This in Daily Life?"*<br>**Anchored setups**: *"The 8-Minute Sun"*, *"Peering Down the Past Light Cone"*, *"The Lifespan Horizon"*, *"Atmospheric Muons"*<br>**Structured milestones**: *"The Four Milestones"*, *"The Three Realms"* | Taxonomic headings: *"Section 2.1"*, *"Velocity Space Characteristics"*, *"Properties of Light"* |
| **`<h4>`** | **Internal Callout & Card Headers**<br>Used inside `.insight-callout` and `.article-author`. | `<h4>Why 45° Is the Cosmic Speed Boundary</h4>`<br>`<h4>Food for Thought: Three Cosmic Puzzles</h4>` | Never use `<h4>` as standalone prose section dividers. |

---

## 4. Semantic Physics & Editorial Color Palette (Monograph Theme)

Colors across the publication represent immutable physical concepts and editorial surfaces under the Monograph theme (Warm Archival Parchment / Scholarly Dark Archive). Always pull colors dynamically from `UniverseSimulations.getThemeColors()` rather than hardcoding static hex codes into canvas scripts.

| Semantic Concept | Light Mode (Warm Parchment) | Dark Mode (Scholarly Umber) | Usage / Physical Meaning |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#faf8f5` (`--bg-space`) | `#141311` (`--bg-space`) | Main interactive canvas background |
| **Card Surface** | `#ffffff` (`--bg-card`) | `#1c1a17` (`--bg-card`) | Simulation card wrapper & controls |
| **Card Subtle** | `#f4f1ea` (`--bg-card-subtle`) | `#181613` (`--bg-card-subtle`) | Readout dashboard cards, chip background |
| **Time / Rest Frame** | `#1d4ed8` | `#60a5fa` | Motion through time, Alice's rest frame, $ct$-axis |
| **Space / Motion** | `#c2410c` | `#fb923c` | Spatial displacement, Bob's motion, $v_x$, coordinate distance |
| **Cosmic Invariant ($c$)** | `#6d28d9` | `#c084fc` | Invariant speed hypotenuse $c$, 45° light cone boundary |
| **Light / Wavefronts** | `#b45309` | `#fbbf24` | Outgoing photon wavefronts, beacon flashes, light signals |
| **Sync / Agreement / Entropy** | `#0f766e` | `#34d399` | Simultaneous events, invariant intervals, information entropy |
| **Forbidden / Causality Lag** | `#b91c1c` | `#f87171` | Speeds exceeding $c$, causality disconnect, time lag |

---

## 5. Interactive Widget Design & Engineering Specification

Every interactive simulation follows a standardized visual hierarchy, tactile control interface, and deterministic rendering lifecycle.

### 1. Lean Widget Framing (Zero Boilerplate Headers)
Do not clutter widget containers with repetitive titles or explanatory subtitles when the preceding prose already establishes context. The simulation badge identifies the module cleanly:
- ✅ `<div class="artifact-badge">SIMULATION 01 · 2D POSITION MAP &amp; VELOCITY SPACE</div>`
- ❌ Redundant title + 2-sentence subtitle repeating the preceding paragraph.

### 2. The Three Canonical Layout Archetypes

#### Archetype A: Dual-View Comparison Grid (`.comparison-grid`)
Used when bridging physical intuition with geometric spacetime (e.g., Position Map vs Velocity Space, or Physical Space Track vs Coordinate Spacetime Map).
```html
<div id="widget-[id]" class="interactive-artifact artifact-wide">
  <div class="artifact-header">
    <div><div class="artifact-badge">SIMULATION 0X · [MODULE TITLE]</div></div>
  </div>
  <div class="comparison-grid">
    <!-- Left Column: Physical / Spatial View -->
    <div class="canvas-col">
      <div class="canvas-col-header">
        <span>PHYSICAL SPACE TRACK</span>
        <span class="canvas-col-tag">Distance (0 to 1 AU)</span>
      </div>
      <canvas class="canvas-space"></canvas>
    </div>
    <!-- Right Column: Coordinate Spacetime / Velocity View -->
    <div class="canvas-col">
      <div class="canvas-col-header">
        <span>COORDINATE SPACETIME</span>
        <span class="canvas-col-tag">Space x vs Time ct</span>
      </div>
      <canvas class="canvas-spacetime"></canvas>
    </div>
  </div>
  <!-- Controls Deck -->
  <div class="artifact-controls artifact-controls-deck">
    ...
  </div>
</div>
```

#### Archetype B: Split Layout (`.artifact-split`)
Used for 3D orbital views or focused single-canvas simulations requiring a dedicated side controls-and-telemetry column.
```html
<div id="widget-[id]" class="interactive-artifact [artifact-wide]">
  <div class="artifact-header">
    <div><div class="artifact-badge">SIMULATION 0X · [MODULE TITLE]</div></div>
  </div>
  <div class="artifact-split">
    <div class="split-canvas-col">
      <canvas></canvas>
    </div>
    <div class="split-controls-col">
      <!-- Status Cards, Sliders, Preset Chips, Play Button -->
      ...
    </div>
  </div>
</div>
```

#### Archetype C: Multi-Panel Synthesis / Snapshot Grid (`.expanding-circles-grid`, `.synthesis-grid`)
Used for showing side-by-side progression across discrete moments in time ($t = 0, 1, 2, 3$) or across canonical archetype presets (At Rest, Sub-Light, Relativistic, Photon).
```html
<div id="widget-[id]" class="interactive-artifact">
  <div class="artifact-header">
    <div><div class="artifact-badge">ILLUSTRATION 0X · [MODULE TITLE]</div></div>
  </div>
  <div class="canvas-viewport" style="padding: 1rem;">
    <div class="synthesis-grid">
      <div class="synthesis-panel-card">
        <div class="synthesis-panel-header">...</div>
        <div class="synthesis-canvas-wrap"><canvas data-preset="..."></canvas></div>
        <div class="synthesis-panel-footer">...</div>
      </div>
      ...
    </div>
  </div>
</div>
```

### 3. Controls Strip Architecture (Single-Row / Dual-Tier Deck)
The primary controls panel must collapse all interactive elements into **one horizontal line** on desktop to avoid vertical sprawl.

- **Baseline Single-Row (`.controls-strip`)**:
  - `[ Clock Card (flex-shrink: 0) ]`  `[ Slider (flex: 1) ]`  `[ ▶ Auto Play (flex-shrink: 0) ]`
  - Encapsulated in `<div class="artifact-controls controls-strip">`.
- **Dual-Tier Controls Deck (`.artifact-controls-deck` + `.controls-preset-row`)**:
  - When presets are present:
    - **Row 1**: `<div class="controls-strip">` — Live clock/status card + primary continuous scrubber + Auto Play button.
    - **Row 2**: `<div class="controls-preset-row">` — Preset chip buttons (`.preset-chips`) aligned left, invariant tag (`.preset-tag`) aligned right, separated by a subtle top border (`border-top: 1px solid var(--border-subtle)`).
  - Total vertical footprint is under ~85px on desktop, preventing layout inflation.
- **Mobile Responsive Behavior (≤ 640px)**:
  - `.controls-strip` switches cleanly to column direction with 100% width and 40px touch targets.
  - `.controls-preset-row` wraps chips naturally without horizontal clipping.
  - Side-by-side clocks (`.twin-clocks-panel`) NEVER collapse into a vertical stack; they remain side-by-side (`1fr 1fr`) to preserve direct visual comparison.

### 4. Canvas Rendering Standards (JavaScript)
1. **Retina DPI Setup**: Always initialize canvases with `setupRetinaCanvas(canvas)` to ensure crisp line drawing on high-DPI displays.
2. **Deterministic & Bidirectional**: Scrubbing forward and backward must never accumulate state drift. Speed or parameter adjustments must instantly and synchronously update readouts, sliders, and canvas graphics.
3. **Auto-Play + Manual Scrubbing**: Pair continuous animations with interactive range sliders (`.slider-speed`, `.slider-time`, `.slider-theta`). Auto-play demonstrates dynamics; scrubbing allows stop-and-inspect contemplation.
4. **Theme & Resize Awareness**: Register draw callbacks via `registerDraw(draw)` and `window.addEventListener('resize', draw)`. Never set inline canvas width/height attributes; dimensions are managed responsively via CSS.
5. **Edge Clamping for Label Pills**: Always clamp pill coordinates (`Math.min(width - padRight, Math.max(padLeft, x))`) so floating annotations never clip outside viewport boundaries on narrow screens.
6. **Tabular Numerals**: Numeric metrics and readouts must use monospace fonts with tabular numbers (`JetBrains Mono` / `tnum`) to eliminate layout jitter during live updates.
7. **Single Locus of Truth**: Keep live annotations directly on the canvas elements and slider headers. Eliminate auxiliary telemetry grids unless tracking non-spatial derived invariants.
8. **Vector Tip Convention**:
   - **Velocity Space canvases** (`.canvas-vel`, `.canvas-speed`): Terminate every vector with a filled triangular **arrowhead**. Do NOT draw a glowing dot at the vector tip.
   - **Position Map canvases** (`.canvas-map`, `.canvas-space`): Use `drawGlowingDot` at the tip to mark the current position of a physical object. Do NOT add arrowheads.
9. **Coordinate Scale Invariant**: In coordinate spacetime ($x$ vs $ct$), always calibrate scales so $scaleX = scaleY$ when units match ($1\text{ ls space} \leftrightarrow 1\text{ s time}$). Light rays *must* travel along exact 45° diagonals ($\Delta x = \Delta(ct)$). Distorting the aspect ratio destroys geometric intuition.
10. **In-Canvas Causality Lag Indicators**: When an observer is in the *Elsewhere*, draw a direct dimension line or connector between the photon wavefront and the observer's worldline annotated with the remaining causal buffer ($\Delta x = d - ct$).

---

## 6. Complete HTML Document Blueprint

For any new essay, use this exact production skeleton. It ensures full compatibility with the design system, reading progress tracker, dark/light theme engine, and site navigation.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Article Title] · Intuition First</title>
    <link rel="stylesheet" href="../css/style.css" />
    <meta
      name="description"
      content="[Compelling 1-2 sentence description summarizing the core physical intuition and question of the essay.]"
    />
    <script>
      (function () {
        var isDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute(
          "data-theme",
          isDark ? "dark" : "light",
        );
      })();
    </script>
  </head>

  <body>
    <div class="reading-progress-bar" id="reading-progress"></div>

    <!-- Top Navigation -->
    <nav class="site-nav">
      <div class="site-nav-inner">
        <a href="../index.html" class="brand-link">
          <div class="brand-badge">IF</div>
          <div>
            <span class="brand-title">INTUITION FIRST</span>
            <span class="brand-tag">ESSAYS</span>
          </div>
        </a>
        <div class="nav-links">
          <a href="../index.html">← All Series</a>
        </div>
      </div>
    </nav>

    <!-- Main Article Body -->
    <main class="wide-reading-container">
      <!-- Article Header -->
      <header class="article-header">
        <div class="category-tag">Part 0X · [Series Name]</div>
        <h1 class="article-title">[Article Title]</h1>
        <p class="article-subtitle">
          [Engaging subtitle stating the core paradox or physical insight.]
        </p>
        <div class="article-meta">
          <span>By Aayush Agarwal</span>
          <span>•</span>
          <span>Interactive Explorable</span>
          <span>•</span>
          <span>10 min read</span>
        </div>
      </header>

      <!-- Editorial Prose Flow -->
      <article class="editorial-prose">
        <!-- Opening Hook Paragraphs: Connecting to intuition, raising core question -->
        <p>...</p>

        <!-- SECTION 1 -->
        <h2>1. [Familiar Anchor & First Question]</h2>
        <p>...</p>

        <!-- WIDGET 1 -->
        <div id="widget-[name]" class="interactive-artifact artifact-wide">
          ...
        </div>

        <p>...</p>
        <div class="formula-card">...</div>

        <!-- SUBSEQUENT SECTIONS (2, 3, 4...) -->
        <h2>2. [The Geometric Bridge]</h2>
        ...

        <!-- FINAL SECTION: FORWARD BRIDGE -->
        <h2>[N]. [The Road to the Next Discovery]</h2>
        <p>...</p>

        <!-- FOOD FOR THOUGHT CALLOUT (MANDATORY 3 PUZZLES) -->
        <div class="insight-callout">
          <h4>Food for Thought: Three Cosmic Puzzles</h4>
          <p>Before we move forward, consider three subtle puzzles that emerge when we push this geometry to its natural extremes:</p>
          <p>
            <strong>1. [Puzzle One Title] ([Subtitle]):</strong><br />
            [Deep conceptual tension statement]
          </p>
          <p>
            <strong>2. [Puzzle Two Title] ([Subtitle]):</strong><br />
            [Deep conceptual tension statement]
          </p>
          <p>
            <strong>3. [Puzzle Three Title] ([Subtitle]):</strong><br />
            [Deep conceptual tension statement]
          </p>
        </div>

        <!-- SERIES PAGER -->
        <div class="series-pager">
          <a href="[prev-post].html" class="btn-secondary">← Part [X-1]: [Prev Title]</a>
          <a href="[next-post].html" class="btn-primary">Explore Part [X+1]: [Next Title] →</a>
        </div>

        <!-- AUTHOR BIO -->
        <div class="article-author">
          <div class="brand-badge">IF</div>
          <div>
            <h4>Aayush Agarwal</h4>
            <p>
              Exploring physics, mathematics, and machine learning through
              intuitive visual geometry and explorable interactive simulations.
            </p>
          </div>
        </div>
      </article>
    </main>

    <!-- Site Footer -->
    <footer class="site-footer">
      <div class="wide-container">
        <p>
          <strong>Intuition First</strong> · An Explorable Science &amp; Mathematics Series by Aayush Agarwal
        </p>
        <p style="margin-top: 0.5rem">
          <a href="../index.html">Series Home</a> ·
          <a href="01-motion-and-time.html">Part 1: Motion &amp; Time</a> ·
          <a href="02-light-cone.html">Part 2: The Cosmic Light Cone</a> ·
          <a href="03-spacetime-loaf.html">Part 3: The Loaf &amp; Length</a> ·
          <a href="04-understanding-entropy.html">Part 4: Understanding Entropy</a> ·
          <a href="https://github.com/ayush2991/intuition-first" target="_blank" rel="noopener">GitHub</a>
        </p>
      </div>
    </footer>

    <!-- Universal Scripts (100% Static) -->
    <script src="../js/core.js"></script>
    <script src="../js/post-0X.js"></script>
  </body>
</html>
```

---

## 7. Modular Simulation Script Architecture (`js/post-XX.js`)

Every interactive essay is paired with a standalone script named `js/post-XX.js`. All scripts follow this exact module blueprint:

```javascript
/**
 * post-XX.js - Part XX Interactive Simulations: [Title]
 */

(function (window) {
  'use strict';

  var sim = window.UniverseSimulations || (window.UniverseSimulations = {});
  var getThemeColors = function () { return sim.getThemeColors(); };
  var setupRetinaCanvas = function (c) { return sim.setupRetinaCanvas(c); };
  var registerDraw = function (fn) { sim.registerDraw(fn); };
  var drawAxes = function (ctx, ox, oy, w, h, xl, yl) { sim.drawAxes(ctx, ox, oy, w, h, xl, yl); };
  var drawGrid = function (ctx, ox, oy, w, h, s) { sim.drawGrid(ctx, ox, oy, w, h, s); };
  var drawLabelPill = function (ctx, txt, x, y, opts) { sim.drawLabelPill(ctx, txt, x, y, opts); };
  var drawGlowingDot = function (ctx, x, y, c, r) { sim.drawGlowingDot(ctx, x, y, c, r); };
  var drawConstraintArc = function (ctx, ox, oy, r, c) { sim.drawConstraintArc(ctx, ox, oy, r, c); };
  var drawVector = function (ctx, ox, oy, tx, ty, o) { return sim.drawVector(ctx, ox, oy, tx, ty, o); };
  var drawDropLines = function (ctx, ox, oy, tx, ty, o) { return sim.drawDropLines(ctx, ox, oy, tx, ty, o); };
  var drawDimensionLine = function (ctx, x1, y1, x2, y2, l, o) { return sim.drawDimensionLine(ctx, x1, y1, x2, y2, l, o); };
  var project3D = function (x, y, z, cx, cy, s, az, el) { return sim.project3D(x, y, z, cx, cy, s, az, el); };
  var attachOrbitControls = function (c, o) { return sim.attachOrbitControls(c, o); };
  var bindChipGroup = function (c, s, o) { return sim.bindChipGroup(c, s, o); };
  var observeSimulationVisibility = function (c, onIn, onOut) {
    return sim.observeSimulationVisibility ? sim.observeSimulationVisibility(c, onIn, onOut) : null;
  };

  // -------------------------------------------------------------------------
  // Widget Implementation Pattern
  // -------------------------------------------------------------------------
  function initWidgetExample(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var slider = container.querySelector('.range-slider');
    var btnPlay = container.querySelector('.btn-play');
    var readoutVal = container.querySelector('.control-val');
    var clockCard = container.querySelector('.clock-card');
    var presetChips = container.querySelectorAll('.chip-btn');

    var state = {
      val: parseFloat(slider ? slider.value : 0) || 0,
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      if (readoutVal) readoutVal.textContent = state.val.toFixed(2);
      if (slider) slider.value = state.val;
      // Update preset chip active states
      for (var i = 0; i < presetChips.length; i++) {
        var chipVal = parseFloat(presetChips[i].getAttribute('data-val'));
        if (Math.abs(chipVal - state.val) < 0.01) {
          presetChips[i].classList.add('active');
        } else {
          presetChips[i].classList.remove('active');
        }
      }
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);
      // Deterministic geometry rendering using theme colors
      drawGrid(ctx, 40, height - 40, width, height, 32);
      drawAxes(ctx, 40, height - 40, width, height, 'Space x', 'Time ct');
      // In-canvas direct annotations with clamped label pills
      drawLabelPill(ctx, 'State: ' + state.val.toFixed(1), width / 2, 24, {
        textColor: c.timeColor
      });
    }

    // Input event binding
    if (slider) {
      slider.addEventListener('input', function () {
        state.val = parseFloat(slider.value);
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    // Chip group binding
    for (var j = 0; j < presetChips.length; j++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          state.val = parseFloat(chip.getAttribute('data-val'));
          state.isPlaying = false;
          if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
          updateReadouts();
          draw();
        });
      })(presetChips[j]);
    }

    // Auto-play animation loop
    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying
          ? '<span>❚❚</span><span>Pause</span>'
          : '<span>▶</span><span>Auto Play</span>';
        if (state.isPlaying) requestAnimationFrame(loop);
      });
    }

    function loop() {
      if (!state.isPlaying || !state.isVisible) return;
      // Increment state deterministically
      state.val = (state.val + 0.01) % 1.0;
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    // Visibility and resize awareness
    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(loop);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);

    // Initial render
    updateReadouts();
    draw();
  }

  // -------------------------------------------------------------------------
  // DOMContentLoaded Registration
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    initWidgetExample('widget-example');
    // Initialize all widgets for this post...
  });

})(window);
```

---

## 8. Autonomous Article Generation Protocol (From Topic to Published Article)

When the user requests a brand-new article simply by mentioning a topic of interest (e.g., *"Write an article on Gravitational Time Dilation"* or *"Explain the Twin Paradox & Simultaneity"*), follow this rigorous 6-step protocol to generate a publication-ready piece that is 100% consistent with Post 01 and Post 02:

### Step 1: Physical Anchor & Character Selection
- Identify the tangible everyday anchor (e.g., an accelerating elevator, climbing a tower, synchronized ticking clocks on different floors).
- Define the two concrete observers and their physical instruments (e.g., Alice on the ground with her ground stopwatch, Bob on the mountain peak with his summit wristwatch).
- Formulate the central open question without pre-announcing the paradoxical answer.

### Step 2: Headings & Narrative Outline Blueprint
- **Title (`<h1>`)**: Craft an evocative question or insight title (Title Case).
- **Subtitle**: Write a compelling 1-to-2 sentence hook.
- **Section Sequence (`<h2>`)**:
  - `1. [Familiar Anchor / Everyday Setup]` (Introduce characters, instruments, zero-speed baseline).
  - `2. [The Geometric Shift / Trade-Off]` (Introduce the physical delta, map to coordinates).
  - `3. [The Core Invariant / Geometric Bridge]` (Derive the fundamental relation, side-by-side comparative widgets).
  - `4. [Extreme Limits & Cosmic Manifestation]` (Speed of light, horizon, real-world observational proof).
  - `5. [Multi-Dimensional / 3D Extension]` (Generalize to full spatial/geometric volume).
  - `[N]. [The Forward Bridge]` (Launchpad connecting to the next article in the series).
- **Subsections (`<h3>`)**: Formulate open questions (*"Why...?"*, *"Can you...?"*) and anchored phenomena.

### Step 3: Interactive Simulation Suite Plan
Plan between **4 to 7 simulations** covering the core archetypes:
1. *Baseline Exploration* (Archetype A or B: Dual-view or split view establishing the rest case vs moving case).
2. *Synthesis / Snapshot Grid* (Archetype C: 2×2 snapshot panel or 4-milestone card matrix).
3. *Core Dynamic Interactive* (Archetype A: Dual-view comparative bridge with synchronized Now-slice cursor and live clocks).
4. *Observational / Extreme Proof* (Archetype B: Real-world physical testbed, e.g. atmospheric muons, GPS satellites, light horizon).
5. *3D Volumetric Explorer* (Archetype B: Rotatable 3D projection with orbit touch controls and viewpoint presets).

### Step 4: Prose Composition
- Maintain the Monograph voice: rhythmic 2–4 sentence paragraphs.
- Zero external textbook complaining; pure constructive elevation.
- Never spoil widget discoveries in the introductory text before the simulation.
- Frame every widget with lean headers (`<div class="artifact-badge">...</div>` only).
- Insert `.formula-card` callouts with plain-English `.formula-note` explanations.
- End with the mandatory **Food for Thought: Three Cosmic Puzzles** callout.

### Step 5: JavaScript Engine Implementation (`js/post-XX.js`)
- Construct the script following the architecture in Section 7.
- Ensure every canvas uses `setupRetinaCanvas(canvas)` and dynamically retrieves colors via `getThemeColors()`.
- Use arrowheads for velocity vectors; use glowing dots for position paths.
- Enforce the 45° scale invariant on spacetime diagrams ($\Delta x = \Delta(ct)$).
- Clamp all in-canvas label pills (`drawLabelPill`) to screen bounds.
- Provide both continuous range sliders and tactile preset chips.
- Hook auto-play and manual scrubbing into deterministic bidirectional state updates.

### Step 6: Navigation, Hub, & Catalog Integration
- Update `index.html` (if applicable) with the new essay card.
- Wire top navigation (`← All Series`), pager buttons (`.series-pager`), and footer links.
- Add the new simulations to the simulation catalog table in this guide.

---

## 9. Live Simulation Catalog

### Series 01: Special Relativity — The Fabric of Spacetime

#### Part 1: Why Motion Through Space Affects Time (`posts/01-motion-and-time.html` / `js/post-01.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-cars` | `initWidgetCars` | Dual-view comparison: Position Map ($x_1, x_2$) vs Velocity Space ($V_E = 60\sin\theta, V_N = 60\cos\theta$) on 60 mph circle |
| **02** | `widget-stationary` | `initWidgetStationary` | Sitting at rest ($x=0$) carries you forward through Time at 100% capacity |
| **02b** | `widget-moving-snapshots` | `initWidgetMovingSnapshots` | 2×2 grid of position snapshots ($x$ vs $t$) for a moving observer at $t=0,1,2,3$ |
| **03** | `widget-tradeoff` | `initWidgetTradeoff` | Dual-view comparison: Position Over Time ($x$ vs $t$) vs Velocity Space ($v_t = \sqrt{c^2 - v_x^2}$) |
| **04** | `widget-time-dilation` | `initWidgetTimeDilation` | Velocity Space ($v_t = \sqrt{c^2 - v_x^2}$) with invariant speed circle, direct component drops, and live twin clocks |
| **05** | `widget-speed-limit` | `initWidgetSpeedLimit` | Cosmic speed limit $c$, the timeless photon, and forbidden regions |
| **06** | `widget-muon` | `initWidgetMuon` | Atmospheric muon decay: Relativistic survival vs Newtonian prediction |
| **07** | `widget-3d-spacetime` | `initWidget3DSpacetime` | 3D spherical Velocity Dome ($v_{x1}, v_{x2}, v_{\text{time}}$) with invariant cosmic speed sphere $c$ |

#### Part 2: The Cosmic Light Cone: Mapping Space & Time (`posts/02-light-cone.html` / `js/post-02.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-dual-bridge` | `initWidgetDualSpeedSpacetime` | Side-by-side comparison: Speed Space vs Coordinate Spacetime Map |
| **01b** | `widget-expanding-circles` | `initWidgetExpandingCircles` | 2×2 grid of outgoing light circles at $t=0,1,2,3$ in the $x$–$y$ plane |
| **01c** | `widget-synthesis-grid` | `initWidgetSynthesisGrid` | 2×2 synthesis grid bridging Velocity Space ($v_x, v_t$) to Spacetime ($\phi$) across 4 archetypes |
| **02** | `widget-3d-light-cone` | `initWidget3DLightConeExplorer` | Full 3D rotatable Light Cone volume ($x_1, x_2, ct$) with dynamic Now-Slice |
| **02b** | `widget-sun-delay` | `initWidgetSunDelay` | The 8-Minute Sun: 500-second causality lag, expanding wavefront at $c$, Elsewhere vs Causal Future |
| **02c** | `widget-past-light-cone` | `initWidgetPastLightCone` | Peering down the past light cone: Lookback time, ancient starlight dispatches, Elsewhere lag, and 45° boundary |
| **03** | `widget-cosmic-horizon` | `initWidgetCosmicHorizon` | Coordinated dual-view: Physical stellar radar bubble vs $(x, ct)$ past light cone |

#### Part 3: The Spacetime Loaf & Length Contraction (`posts/03-spacetime-loaf.html` / `js/post-03.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-loaf-alice` | `initWidgetLoafAlice` | 3D spacetime loaf volume with Alice's horizontal slice and expanding wavefront |
| **02** | `widget-loaf-bob` | `initWidgetLoafBob` | Bob in motion: slanting the worldtube across the spacetime loaf |
| **03** | `widget-beacons-bob` | `initWidgetBeaconsBob` | Bob's rest frame: simultaneous light beacon hits inside the coach ($\Delta t = 0$) |
| **04** | `widget-beacons-alice` | `initWidgetBeaconsAlice` | Alice's frame: moving coach causes desynchronized beacon hits ($\Delta t > 0$) |
| **05** | `widget-simultaneity-slice` | `initWidgetSimultaneitySlice` | Tilting the simultaneity hyperplane obliquely ($\tan\phi = v/c$) |
| **06** | `widget-length-contraction` | `initWidgetLengthContraction` | Geometric projection: Bob's tilted coach projecting onto Alice's present via $\cos\theta$ |
| **07** | `widget-dual-frame` | `initWidgetDualFrame` | Mutual relativity: invariant 10m coaches and reciprocal $\cos\theta$ projections |
| **08** | `widget-muon-contraction` | `initWidgetMuonContraction` | Atmospheric muons from both perspectives (Time Dilation vs Length Contraction) |

---

### Series 02: Information & Entropy — The Order of the Universe

#### Part 1: An Intuitive Guide To Entropy (`posts/04-understanding-entropy.html` / `js/post-04.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-certainty-coin` | `initWidgetCertaintyCoin` | The Predictability Spectrum: Certain coin vs uncertain coin outcomes |
| **02** | `widget-surprise-curve` | `initWidgetSurpriseCurve` | The Logarithmic Surprise Curve ($S(p) = -\log_2(p)$) and bit-depth of surprise |
| **03** | `widget-expected-entropy` | `initWidgetExpectedEntropy` | Expected Surprise / Shannon Entropy Curve ($H(p) = -p\log_2 p - (1-p)\log_2(1-p)$) |
| **04** | `widget-household-chaos` | `initWidgetHouseholdChaos` | Microstates vs Macrostates: Why messy rooms are statistically inevitable |

---

## 10. Planning & Workflow Rules

- **No Verification Plans**: For this project, the user does NOT want verification. Do not include verification plans, verification steps, or verification plan sections in implementation plans and workflow documents. Keep plans strictly focused on the proposed changes and execution strategy.
