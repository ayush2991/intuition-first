# Intuition First — Agent Guide & Publishing Architecture

## 1. Project Overview & Architecture

*Intuition First* is an interactive, explorable publishing series explaining physics, mathematics, and information theory from the ground up through visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.

### Core Architectural Invariants
- **100% Static & Zero Build Step**: Runs directly via `file://` or GitHub Pages without build tools or bundlers.
- **Single Source of Truth**:
  - Design system specification: [`DESIGN_SYSTEM.md`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/DESIGN_SYSTEM.md) (authoritative for tokens, styles, and UI components)
  - Global styles: [`css/style.css`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/css/style.css)
  - Shared runtime utilities & theme engine: [`js/core.js`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/js/core.js)
  - Modular essay simulation engines: `js/post-01.js`, `js/post-02.js`, `js/post-03.js`, `js/post-04.js`, `js/post-05.js`, `js/post-06.js`, etc.
  - Landing hub: [`index.html`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/index.html)
  - Longform essays: `posts/01-motion-and-time.html`, `posts/02-light-cone.html`, `posts/03-spacetime-loaf.html`, `posts/04-illusion-of-weight.html`, `posts/04-understanding-entropy.html`, `posts/05-cross-entropy.html`, `posts/06-moving-average.html`

---

## 2. Editorial Philosophy & Preferred Writing Style

Every article teaches **bottom-up**: mathematical formulas arrive as natural descriptions of geometric relationships the reader has already explored visually.

### The Monograph Voice & Narrative Tone
- **Inviting & Intellectually Elevated**: Elegant, scholarly monograph tone (inspired by Feynman, Penrose, and Abbott's *Flatland*) without academic pretension or jargon walls.
- **Perspective**: Shared first-person plural (*"we"*, *"let us"*, *"our"*) for geometric exploration, paired with direct second-person experiential setups (*"sitting in your chair right now"*).
- **Pure Constructive Elevation**: Never disparage standard textbooks, curricula, or other educators. The beauty of geometry stands on its own merits.
- **Cadence Over Fragmentation (The 2–3 Sentence Rule)**: Avoid single-sentence paragraphs. Group connected thoughts into cohesive, rhythmic paragraphs of 2 to 4 sentences.
- **No Staccato Drama or Fragmented Rhetoric**: Avoid short, dramatic declarations, one-word punchlines, and punchy rhetorical setups (e.g., strictly avoid `"<fact>. Nothing. Why?"`, `"Why? Because..."`, or isolated single-question paragraphs). Prohibit exclamation marks in prose. Develop ideas through calm, continuous, expository sentences.
- **Concrete Physical Instruments Over Abstract Labels**: Always anchor frames to tangible instruments:
  - *"Alice's ground stopwatch"* instead of *"stationary observer coordinate time"*.
  - *"the traveler's personal wristwatch"* instead of *"proper time $\tau$"*.
  - Real physical milestones (e.g., *1 AU = 500 light-seconds*, *Vega at 25 ly*, *atmospheric muons created 10 km up*).
- **Self-Contained Revelation**: Zero prerequisites beyond basic curiosity and arithmetic. Derive everything from first principles without appealing to external authority.

### The 4-Stage Pedagogical Arc ("Pacing of Wonder")
1. **The Familiar Anchor**: Ground the topic in an everyday physical experience (two cars driving on a flat field, a flashlight beam, a stopwatch).
2. **The Natural Question**: Push the anchor toward a physical paradox without spoiling the answer (*"What happens when you sit completely still?"*, *"What if the Sun vanished this instant?"*).
3. **The Geometric Bridge**: Translate the scenario into visual coordinate space (Velocity Space circle, Spacetime diagram $(x, ct)$, expanding wave ripples).
4. **The Inevitable Insight**: The mathematical formula arrives last, summarizing the geometry already understood.

### Formula & Callout Cards
- **Formula Cards (`.formula-card`)**:
  ```html
  <div class="formula-card">
    <div class="formula-card-header"><span class="formula-tag">The Geometric Bridge</span></div>
    <div class="formula-body">tan <em>φ</em> = Δ<em>x</em> / (<em>c</em> · Δ<em>t</em>) = <em>v</em>_x / <em>c</em> = sin <em>θ</em></div>
    <div class="formula-note">Spatial speed governs worldline slope: tan <em>φ</em> = sin <em>θ</em>.</div>
  </div>
  ```
- **Inline Math**: Use `<span class="math-badge">v_space = c · sin θ</span>` or clean italicized symbols ($\theta$, $\phi$, $\tau$, $\gamma$, $c$).
- **Insight Callouts (`.insight-callout`)**: For pivotal takeaways and physical intuition shifts.
- **Food for Thought: Three Cosmic Puzzles (Mandatory Closing Invariant)**: Every article MUST conclude with exactly three named cosmic puzzles bridging to future explorations:
  ```html
  <div class="insight-callout">
    <h4>Food for Thought: Three Cosmic Puzzles [of the Topic]</h4>
    <p>Before we move forward, consider three subtle puzzles that emerge when we push this geometry to its natural extremes:</p>
    <p><strong>1. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
    <p><strong>2. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
    <p><strong>3. [Puzzle Name] ([Evocative Subtitle]):</strong><br>[Deep paradox statement]...</p>
  </div>
  ```

---

## 3. Headings Taxonomy & Best Practices

| Level | Role & Formatting | Preferred Pattern | Forbidden Patterns |
| :--- | :--- | :--- | :--- |
| **`<h1>`** | **Article Title**<br>Title Case, bold, profound insight or hook. | *"Borrowed Seconds: The Geometry of Moving Through Time"*<br>*"The Boundaries of Causality: Inside the Cosmic Light Cone"* | *"Special Relativity: Part 1"*<br>*"Lorentz Transformations & Time Dilation"* |
| **`<h2>`** | **Discovery Steps**<br>Numbered sequentially (`1. `, `2. `). Title Case. Physical metaphors & actions. | `1. The Two-Car Trade-Off`<br>`2. Moving While Sitting Still`<br>`3. Nature's Invariant Speed` | `1. Introduction`<br>`2. Time Dilation Theory`<br>`3. Mathematical Derivations` |
| **Final `<h2>`** | **The Forward Bridge**<br>Explicit launchpad to next essay. | `8. The Road to the Light Cone`<br>`4. The Angle of "Now"` | `Summary`<br>`Conclusion`<br>`Final Remarks` |
| **`<h3>`** | **Subsections & Thought Experiments**<br>Open questions & anchored setups. | *"Why is the Speed of Light an Unbreakable Limit?"*<br>*"The 8-Minute Sun"*, *"Atmospheric Muons"* | Taxonomic labels: *"Section 2.1"*, *"Properties of Light"* |
| **`<h4>`** | **Internal Callout Headers**<br>Inside `.insight-callout` / `.article-author`. | `<h4>Why 45° Is the Cosmic Speed Boundary</h4>` | Standalone section dividers. |

---

## 4. Semantic Physics & Editorial Color Palette (Monograph Theme)

Always retrieve canvas colors dynamically via `UniverseSimulations.getThemeColors()` rather than hardcoding hex values. For CSS variables, refer to [`DESIGN_SYSTEM.md`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/DESIGN_SYSTEM.md).

| Semantic Concept | Light Mode | Dark Mode | Canvas Property | Physical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `#faf8f5` | `#141311` | — | Base interactive canvas surface (`--bg-space`) |
| **Card Surface** | `#ffffff` | `#1c1a17` | — | Container & modal background (`--bg-card`) |
| **Card Subtle** | `#f4f1ea` | `#181613` | — | Readout trays, chips (`--bg-card-subtle`) |
| **Time / Rest Frame** | `#1d4ed8` | `#60a5fa` | `timeColor` | Motion through time, Alice's rest frame, $ct$-axis |
| **Space / Motion** | `#c2410c` | `#fb923c` | `spaceColor` | Spatial displacement, Bob's frame, $v_x$, coordinate distance |
| **Cosmic Invariant ($c$)** | `#6d28d9` | `#c084fc` | `invariantColor`| Cosmic speed limit $c$, invariant arc, 45° light cone |
| **Light / Wavefronts** | `#b45309` | `#fbbf24` | `photonColor` | Outgoing photon wavefronts, beacon flashes |
| **Sync / Entropy** | `#0f766e` | `#34d399` | `emeraldColor` | Invariant intervals, simultaneity, Shannon entropy |
| **Forbidden / Decay** | `#b91c1c` | `#f87171` | `dangerColor` | Speeds $> c$, causality disconnect, Newtonian decay |

---

## 5. Interactive Widget Design & Engineering Specification

### 1. Lean Widget Framing
Do not include redundant titles or subtitles when the preceding prose establishes context. Identify modules cleanly using the badge only:
`<div class="artifact-badge">SIMULATION 0X · [MODULE TITLE]</div>`.

### 2. The Three Canonical Layout Archetypes

- **Archetype A: Dual-View Comparison Grid (`.comparison-grid`)**: Bridges physical space with coordinate spacetime/velocity space side-by-side.
  ```html
  <div id="widget-[id]" class="interactive-artifact artifact-wide">
    <div class="artifact-header"><div class="artifact-badge">SIMULATION 0X · [TITLE]</div></div>
    <div class="comparison-grid">
      <div class="canvas-col">
        <div class="canvas-col-header"><span>PHYSICAL SPACE</span><span class="canvas-col-tag">Metric</span></div>
        <canvas class="canvas-space"></canvas>
      </div>
      <div class="canvas-col">
        <div class="canvas-col-header"><span>COORDINATE SPACETIME</span><span class="canvas-col-tag">x vs ct</span></div>
        <canvas class="canvas-spacetime"></canvas>
      </div>
    </div>
    <div class="artifact-controls controls-strip">...</div>
  </div>
  ```
- **Archetype B: Split Layout (`.artifact-split`)**: Dedicated canvas column alongside a side controls-and-telemetry column (for 3D orbital views or focused single-canvas simulations).
  ```html
  <div id="widget-[id]" class="interactive-artifact artifact-wide">
    <div class="artifact-header"><div class="artifact-badge">SIMULATION 0X · [TITLE]</div></div>
    <div class="artifact-split">
      <div class="split-canvas-col"><canvas></canvas></div>
      <div class="split-controls-col"><!-- Controls, Sliders, Preset Chips --></div>
    </div>
  </div>
  ```
- **Archetype C: Multi-Panel Synthesis / Snapshot Grid (`.expanding-circles-grid`, `.synthesis-grid`)**: Displays progression across discrete moments ($t = 0, 1, 2, 3$) or archetypes.
  ```html
  <div id="widget-[id]" class="interactive-artifact">
    <div class="artifact-header"><div class="artifact-badge">ILLUSTRATION 0X · [TITLE]</div></div>
    <div class="canvas-viewport" style="padding: 1rem;">
      <div class="synthesis-grid">
        <div class="synthesis-panel-card"><div class="synthesis-canvas-wrap"><canvas></canvas></div></div>
      </div>
    </div>
  </div>
  ```

### 3. Controls Strip Architecture
- **Baseline Single-Row (`.controls-strip`)**:
  `[ Clock Card (flex-shrink: 0) ]` + `[ Slider (flex: 1) ]` + `[ ▶ Auto Play (flex-shrink: 0) ]` on one horizontal desktop row (<85px height).
- **Dual-Tier Controls Deck (`.artifact-controls-deck` + `.controls-preset-row`)**:
  - Row 1: `.controls-strip` (Live status card + scrubber slider + play button).
  - Row 2: `.controls-preset-row` (Preset chips left, invariant tag right, subtle top border divider).
- **Mobile Responsive Rules (≤ 640px)**:
  - `.controls-strip` stacks vertically with 100% width and 40px touch targets.
  - Side-by-side clocks (`.twin-clocks-panel`) **never** collapse vertically; keep side-by-side (`1fr 1fr`) to preserve direct visual comparison.

### 4. Canvas Rendering Standards
1. **Retina DPI Setup**: Always initialize canvases with `setupRetinaCanvas(canvas)` for crisp high-DPI rendering.
2. **Deterministic & Bidirectional**: Scrubbing forward and backward must never accumulate state drift.
3. **Auto-Play + Manual Scrubbing**: Pair continuous animations with interactive range sliders (`.slider-speed`, `.slider-time`).
4. **Theme & Resize Awareness**: Register draw callbacks via `registerDraw(draw)` and `window.addEventListener('resize', draw)`. Never set inline canvas width/height.
5. **Edge Clamping for Label Pills**: Always clamp coordinates (`Math.min(width - padRight, Math.max(padLeft, x))`) so floating annotations never clip outside viewports.
6. **Tabular Numerals**: Numeric metrics and readouts must use monospaced fonts with tabular numbers (`JetBrains Mono` / `tnum`).
7. **Single Locus of Truth**: Keep live annotations directly on canvas elements and slider headers. Avoid auxiliary telemetry grids unless tracking non-spatial invariants.
8. **Vector Tip Convention**:
   - **Velocity Space canvases**: Terminate vectors with a filled triangular **arrowhead** (no glowing dot).
   - **Position Map canvases**: Use `drawGlowingDot` at the tip to mark physical position (no arrowhead).
9. **Coordinate Scale Invariant**: In coordinate spacetime ($x$ vs $ct$), ensure $scaleX = scaleY$ so light rays travel along exact 45° diagonals ($\Delta x = \Delta(ct)$).
10. **In-Canvas Causality Lag Indicators**: In the *Elsewhere*, draw direct dimension lines between the photon wavefront and observer worldlines annotated with the remaining causal buffer ($\Delta x = d - ct$).

---

## 6. Complete HTML Document Blueprint

Every essay uses this standard static document structure:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Article Title] · Intuition First</title>
    <link rel="stylesheet" href="../css/style.css" />
    <meta name="description" content="[1-2 sentence core intuition summary]" />
    <script>
      (function () {
        var isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      })();
    </script>
  </head>
  <body>
    <div class="reading-progress-bar" id="reading-progress"></div>
    <nav class="site-nav">
      <div class="site-nav-inner">
        <a href="../index.html" class="brand-link">
          <div class="brand-badge">IF</div>
          <div><span class="brand-title">INTUITION FIRST</span><span class="brand-tag">ESSAYS</span></div>
        </a>
        <div class="nav-links"><a href="../index.html">← All Series</a></div>
      </div>
    </nav>
    <main class="wide-reading-container">
      <header class="article-header">
        <div class="category-tag">Part 0X · [Series Name]</div>
        <h1 class="article-title">[Article Title]</h1>
        <p class="article-subtitle">[Engaging subtitle stating core paradox]</p>
        <div class="article-meta"><span>By Aayush Agarwal</span><span>•</span><span>Interactive Explorable</span><span>•</span><span>10 min read</span></div>
      </header>
      <article class="editorial-prose">
        <p>[Opening hook establishing intuition and core question...]</p>
        <h2>1. [First Anchor & Setup]</h2>
        <div id="widget-[name]" class="interactive-artifact artifact-wide"><!-- Widget markup --></div>
        <div class="formula-card"><!-- Formula markup --></div>
        <h2>[N]. [The Forward Bridge]</h2>
        <div class="insight-callout">
          <h4>Food for Thought: Three Cosmic Puzzles</h4>
          <p>Before we move forward, consider three subtle puzzles that emerge when we push this geometry to its natural extremes:</p>
          <p><strong>1. [Puzzle 1]:</strong> [Paradox]</p>
          <p><strong>2. [Puzzle 2]:</strong> [Paradox]</p>
          <p><strong>3. [Puzzle 3]:</strong> [Paradox]</p>
        </div>
        <div class="series-pager">
          <a href="[prev].html" class="btn-secondary">← Part [X-1]: [Title]</a>
          <a href="[next].html" class="btn-primary">Explore Part [X+1]: [Title] →</a>
        </div>
        <div class="article-author">
          <div class="brand-badge">IF</div>
          <div><h4>Aayush Agarwal</h4><p>Exploring physics, mathematics, and machine learning through intuitive visual geometry.</p></div>
        </div>
      </article>
    </main>
    <footer class="site-footer">
      <div class="wide-container">
        <p><strong>Intuition First</strong> · An Explorable Science &amp; Mathematics Series by Aayush Agarwal</p>
      </div>
    </footer>
    <script src="../js/core.js"></script>
    <script src="../js/post-0X.js"></script>
  </body>
</html>
```

---

## 7. Modular Simulation Script Architecture (`js/post-XX.js`)

Each post pairs with a standalone simulation script following this modular pattern:

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
  var drawVector = function (ctx, ox, oy, tx, ty, o) { return sim.drawVector(ctx, ox, oy, tx, ty, o); };
  var observeSimulationVisibility = function (c, onIn, onOut) {
    return sim.observeSimulationVisibility ? sim.observeSimulationVisibility(c, onIn, onOut) : null;
  };

  function initWidgetExample(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var slider = container.querySelector('.range-slider');
    var btnPlay = container.querySelector('.btn-play');
    var state = { val: parseFloat(slider ? slider.value : 0) || 0, isPlaying: false, isVisible: true };

    function updateReadouts() {
      if (slider) slider.value = state.val;
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 40, height - 40, width, height, 32);
      drawAxes(ctx, 40, height - 40, width, height, 'Space x', 'Time ct');
      drawLabelPill(ctx, 'State: ' + state.val.toFixed(2), width / 2, 24, { textColor: c.timeColor });
    }

    function loop() {
      if (!state.isPlaying || !state.isVisible) return;
      state.val = (state.val + 0.01) % 1.0;
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    if (slider) {
      slider.addEventListener('input', function () {
        state.val = parseFloat(slider.value);
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying ? '<span>❚❚</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (state.isPlaying) requestAnimationFrame(loop);
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(loop);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initWidgetExample('widget-example');
  });
})(window);
```

---

## 8. Autonomous Article Generation Protocol (From Topic to Published Article)

When requested to produce a new essay from a topic name, follow this 6-step sequence:

1. **Physical Anchor & Character Selection**:
   - Establish the tangible physical setup (e.g., accelerating elevator, synchronized tower clocks).
   - Define concrete observers and their personal instruments (Alice's ground stopwatch, Bob's summit wristwatch).
   - Pose the central open paradox without pre-announcing the resolution.
2. **Headings & Narrative Outline**:
   - Formulate evocative title (`<h1>`) and subtitle hook.
   - Sequence sections (`<h2>`) following the 4-stage pedagogical arc: Anchor $\to$ Shift $\to$ Core Invariant Bridge $\to$ Extreme Limit $\to$ Forward Bridge.
   - Formulate open question subheadings (`<h3>`).
3. **Interactive Simulation Suite Plan**:
   - Plan 4 to 7 simulations combining Archetypes A, B, and C (baseline rest/motion, snapshot grid, core comparative bridge, physical proof/decay, and 3D volumetric explorer).
4. **Prose Composition**:
   - Write in the Monograph voice: rhythmic 2–4 sentence paragraphs without external textbook disparagement.
   - Insert `.formula-card` callouts with plain-English notes.
   - Conclude with the mandatory **Food for Thought: Three Cosmic Puzzles** callout.
5. **JavaScript Engine Implementation (`js/post-XX.js`)**:
   - Implement widgets using the Section 7 template.
   - Enforce the 10 Canvas Rendering Standards in Section 5 (Retina DPI, theme colors, vector tips, 45° scale invariant, pill edge clamping, deterministic scrubbing).
6. **Navigation & Hub Integration**:
   - Add the essay card to [`index.html`](file:///usr/local/google/home/aayushagarwal/projects/intuition-first/index.html).
   - Wire header nav (`← All Series`), pager links (`.series-pager`), and footer links.

---

## 9. Planning & Workflow Rules

- **No Verification Plans**: For this project, the user does NOT want verification. Do not include verification plans, verification steps, or verification plan sections in implementation plans and workflow documents. Keep plans strictly focused on the proposed changes and execution strategy.
