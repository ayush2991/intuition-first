/**
 * post-06.js - Interactive Simulations:
 * Echoes in Time: The Intuition Behind Moving-Average Models
 *
 * Explorable simulations:
 * 1. The Vesting Schedule Ledger & Ramp-Up (Waterfall / Cohort Matrix)
 * 2. The Ripple of an Isolated Shock (Impulse Response & 4-Year Memory Window)
 * 3. Swimming in a Stream of Shocks (Stochastic White Noise Realizations)
 * 4. The MA(q) Sandbox & The ACF Diagnostic Fingerprint (Autocorrelation Cutoff)
 */

(function (window) {
  'use strict';

  var sim = window.UniverseSimulations || (window.UniverseSimulations = {});

  // Robust theme color resolver ensuring full coverage for Monograph Light and Dark themes
  var getThemeColors = function () {
    var base = sim.getThemeColors ? sim.getThemeColors() : {};
    var isDark = !base.isLight;

    return {
      isLight: base.isLight,
      timeColor: base.timeColor || (isDark ? '#60a5fa' : '#1d4ed8'),
      spaceColor: base.spaceColor || (isDark ? '#fb923c' : '#c2410c'),
      invariantColor: base.invariantColor || (isDark ? '#c084fc' : '#6d28d9'),
      photonColor: base.photonColor || (isDark ? '#fbbf24' : '#b45309'),
      dangerColor: base.dangerColor || (isDark ? '#f87171' : '#b91c1c'),
      emeraldColor: isDark ? '#34d399' : '#0f766e',
      textPrimary: isDark ? '#f4f1ea' : '#18191b',
      textSecondary: isDark ? '#d4cebf' : '#4b5563',
      textMuted: isDark ? '#9e998e' : '#646872',
      borderSubtle: isDark ? 'rgba(232, 228, 218, 0.08)' : 'rgba(24, 25, 27, 0.08)',
      borderMedium: isDark ? 'rgba(232, 228, 218, 0.2)' : 'rgba(24, 25, 27, 0.2)',
      bgSpace: isDark ? '#141311' : '#faf8f5',
      bgCard: isDark ? '#1c1a17' : '#ffffff',
      bgCardSubtle: isDark ? '#181613' : '#f4f1ea',
      pillBg: base.pillBg || (isDark ? 'rgba(28, 26, 23, 0.95)' : 'rgba(255, 255, 255, 0.96)'),
      pillBorder: base.pillBorder || (isDark ? 'rgba(232, 228, 218, 0.15)' : '#e5e0d5'),
      pillText: base.pillText || (isDark ? '#f4f1ea' : '#18191b')
    };
  };

  var setupRetinaCanvas = function (c) { return sim.setupRetinaCanvas(c); };
  var registerDraw = function (fn) { sim.registerDraw(fn); };
  var drawLabelPill = function (ctx, txt, x, y, opts) { sim.drawLabelPill(ctx, txt, x, y, opts); };
  var drawGlowingDot = function (ctx, x, y, c, r) { sim.drawGlowingDot(ctx, x, y, c, r); };
  var observeSimulationVisibility = function (c, onIn, onOut) {
    return sim.observeSimulationVisibility ? sim.observeSimulationVisibility(c, onIn, onOut) : null;
  };

  // Seedable pseudorandom number generator (LCG)
  function makePRNG(seed) {
    var s = (seed || 123456789) >>> 0;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Box-Muller transform for standard normal samples N(0, 1)
  function gaussianRandom(rng) {
    var u1 = rng();
    var u2 = rng();
    while (u1 <= 1e-15) u1 = rng();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  // Clamped coordinate utility
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // ==========================================================================
  // SIMULATION 01: THE VESTING SCHEDULE LEDGER & RAMP-UP
  // ==========================================================================
  function initWidgetVestingRamp(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderYear = container.querySelector('.slider-year');
    var sliderGrant = container.querySelector('.slider-grant');
    var valYear = container.querySelector('.val-year');
    var valGrant = container.querySelector('.val-grant');
    var btnPlay = container.querySelector('.btn-play');
    var btnReset = container.querySelector('.btn-reset');

    var readoutYear = container.querySelector('.readout-current-year');
    var readoutTotal = container.querySelector('.readout-total-unvested');
    var readoutEquilibrium = container.querySelector('.readout-equilibrium-target');
    var readoutStatusBadge = container.querySelector('.readout-ramp-badge');
    var cohortsContainer = container.querySelector('.readout-cohorts-list');

    var state = {
      year: parseInt(sliderYear ? sliderYear.value : 4, 10) || 4,
      grantC: parseFloat(sliderGrant ? sliderGrant.value : 100) || 100,
      isPlaying: false,
      isVisible: true,
      lastTick: 0
    };

    var cohortPalette = [
      '#1d4ed8',
      '#c2410c',
      '#6d28d9',
      '#b45309',
      '#0f766e',
      '#0284c7',
      '#d97706',
      '#8b5cf6',
      '#059669',
      '#e11d48'
    ];

    // Calculate unvested shares for each cohort at year t
    function getVestingBreakdown(targetYear, C) {
      var breakdown = [];
      var total = 0;
      for (var k = 1; k <= targetYear; k++) {
        var age = targetYear - k; // 0 = granted this year
        var weight = 0;
        if (age === 0) weight = 1.0;
        else if (age === 1) weight = 0.75;
        else if (age === 2) weight = 0.50;
        else if (age === 3) weight = 0.25;
        else weight = 0.0;

        var unvested = weight * C;
        if (unvested > 0) {
          breakdown.push({
            grantYear: k,
            age: age,
            weight: weight,
            shares: unvested
          });
          total += unvested;
        }
      }
      return { breakdown: breakdown, total: total };
    }

    function updateReadouts() {
      if (valYear) valYear.textContent = 'Year ' + state.year;
      if (valGrant) valGrant.textContent = state.grantC.toFixed(0) + ' shares';
      if (sliderYear) sliderYear.value = state.year;
      if (sliderGrant) sliderGrant.value = state.grantC;

      var res = getVestingBreakdown(state.year, state.grantC);
      var eq = 2.5 * state.grantC;

      if (readoutYear) readoutYear.textContent = 'Y' + state.year;
      if (readoutTotal) readoutTotal.textContent = res.total.toFixed(0) + ' shares';
      if (readoutEquilibrium) readoutEquilibrium.textContent = eq.toFixed(0) + ' shares';

      if (readoutStatusBadge) {
        if (state.year < 4) {
          readoutStatusBadge.textContent = 'Ramping Up (Transient)';
          readoutStatusBadge.style.background = 'rgba(194, 65, 12, 0.12)';
          readoutStatusBadge.style.color = 'var(--color-space)';
        } else {
          readoutStatusBadge.textContent = 'Steady-State Locked (2.5 × C)';
          readoutStatusBadge.style.background = 'rgba(15, 118, 110, 0.12)';
          readoutStatusBadge.style.color = 'var(--color-emerald)';
        }
      }

      if (cohortsContainer) {
        var html = '';
        if (res.breakdown.length === 0) {
          html = '<div style="color: var(--text-muted); font-size: 0.85rem;">No active unvested grants.</div>';
        } else {
          for (var i = 0; i < res.breakdown.length; i++) {
            var item = res.breakdown[i];
            var pct = Math.round(item.weight * 100);
            var color = cohortPalette[(item.grantYear - 1) % cohortPalette.length];
            html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.85rem;">' +
              '<span style="display: flex; align-items: center; gap: 0.45rem;">' +
              '<span style="display:inline-block; width:9px; height:9px; border-radius:50%; background-color:' + color + ';"></span>' +
              '<strong>Grant A(' + item.grantYear + ')</strong> <span style="color: var(--text-muted);">(' + pct + '% unvested)</span></span>' +
              '<span style="font-family: var(--font-mono); font-weight: 600;">' + item.shares.toFixed(0) + ' sh</span>' +
              '</div>';
          }
        }
        cohortsContainer.innerHTML = html;
      }
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var padLeft = 55;
      var padRight = 35;
      var padTop = 40;
      var padBottom = 45;
      var chartW = width - padLeft - padRight;
      var chartH = height - padTop - padBottom;

      var maxYears = 10;
      var maxShares = Math.max(320, state.grantC * 3.2);

      var colW = chartW / maxYears;
      var scaleX = function (y) { return padLeft + (y - 0.5) * colW; };
      var scaleY = function (s) { return padTop + chartH - (s / maxShares) * chartH; };

      // Background grid lines
      ctx.strokeStyle = c.borderSubtle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var yTicks = [50, 100, 150, 200, 250, 300];
      for (var ti = 0; ti < yTicks.length; ti++) {
        var yt = scaleY(yTicks[ti]);
        if (yt >= padTop && yt <= padTop + chartH) {
          ctx.moveTo(padLeft, yt);
          ctx.lineTo(width - padRight, yt);
          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(yTicks[ti].toString(), padLeft - 8, yt);
        }
      }
      ctx.stroke();

      // Equilibrium guide line at 2.5 * C
      var eqVal = 2.5 * state.grantC;
      var eqY = scaleY(eqVal);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = c.emeraldColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padLeft, eqY);
      ctx.lineTo(width - padRight, eqY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = c.emeraldColor;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Steady-State Equilibrium: 2.5 × C = ' + eqVal.toFixed(0) + ' shares', padLeft + 8, eqY - 8);

      // Stacked cohort bar chart for years 1..maxYears
      var barWidth = Math.min(30, colW * 0.65);

      for (var yr = 1; yr <= maxYears; yr++) {
        var bx = scaleX(yr);
        var resYr = getVestingBreakdown(yr, state.grantC);
        var curY = scaleY(0);

        // Dim bars in future beyond current state.year
        var isFuture = yr > state.year;
        var alpha = isFuture ? 0.22 : 0.85;

        // Draw stacked cohorts
        for (var bIdx = 0; bIdx < resYr.breakdown.length; bIdx++) {
          var seg = resYr.breakdown[bIdx];
          var segH = (seg.shares / maxShares) * chartH;
          var segTop = curY - segH;

          var colorIdx = (seg.grantYear - 1) % cohortPalette.length;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = cohortPalette[colorIdx];
          ctx.fillRect(bx - barWidth / 2, segTop, barWidth, segH);
          ctx.strokeStyle = c.bgSpace;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx - barWidth / 2, segTop, barWidth, segH);
          ctx.restore();

          curY = segTop;
        }

        // Year labels on X-axis
        ctx.fillStyle = (yr === state.year) ? c.textPrimary : c.textMuted;
        ctx.font = (yr === state.year) ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Y' + yr, bx, padTop + chartH + 8);
      }

      // Draw trajectory line connecting unvested total U(t)
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]); // transient ramp dotted
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;

      for (var p = 1; p <= 4; p++) {
        var px = scaleX(p);
        var py = scaleY(getVestingBreakdown(p, state.grantC).total);
        if (p === 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([]); // solid for locked equilibrium
      ctx.moveTo(scaleX(4), scaleY(getVestingBreakdown(4, state.grantC).total));
      for (var pSolid = 5; pSolid <= maxYears; pSolid++) {
        ctx.lineTo(scaleX(pSolid), scaleY(getVestingBreakdown(pSolid, state.grantC).total));
      }
      ctx.stroke();
      ctx.restore();

      // Current active year highlight circle
      var curBreakdown = getVestingBreakdown(state.year, state.grantC);
      var curX = scaleX(state.year);
      var curYPos = scaleY(curBreakdown.total);
      drawGlowingDot(ctx, curX, curYPos, c.timeColor, 6);

      // Label pill above current dot with edge clamping
      var pillX = clamp(curX, padLeft + 52, width - padRight - 52);
      drawLabelPill(ctx, 'U(' + state.year + ') = ' + curBreakdown.total.toFixed(0) + ' sh', pillX, curYPos - 18, {
        textColor: c.timeColor,
        bgColor: c.bgCard,
        borderColor: c.borderMedium
      });

      // Axes lines
      ctx.strokeStyle = c.borderMedium;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop);
      ctx.lineTo(padLeft, padTop + chartH);
      ctx.lineTo(width - padRight, padTop + chartH);
      ctx.stroke();

      // Axis titles
      ctx.fillStyle = c.textSecondary;
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Time (Years t)', width - padRight, padTop + chartH + 34);

      ctx.save();
      ctx.translate(16, padTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Unvested Shares U(t)', 0, 0);
      ctx.restore();
    }

    function loop(timestamp) {
      if (!state.isPlaying || !state.isVisible) return;
      if (!state.lastTick) state.lastTick = timestamp;

      if (timestamp - state.lastTick > 1200) {
        state.year = state.year >= 10 ? 1 : state.year + 1;
        state.lastTick = timestamp;
        updateReadouts();
        draw();
      }
      requestAnimationFrame(loop);
    }

    if (sliderYear) {
      sliderYear.addEventListener('input', function () {
        state.year = parseInt(sliderYear.value, 10);
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    if (sliderGrant) {
      sliderGrant.addEventListener('input', function () {
        state.grantC = parseFloat(sliderGrant.value);
        updateReadouts();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying ? '<span>❚❚</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (state.isPlaying) {
          state.lastTick = performance.now();
          requestAnimationFrame(loop);
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.year = 1;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) {
        state.lastTick = performance.now();
        requestAnimationFrame(loop);
      }
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // SIMULATION 02: THE RIPPLE OF AN ISOLATED SHOCK
  // ==========================================================================
  function initWidgetImpulseResponse(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasAwards = container.querySelector('.canvas-awards');
    var canvasPortfolio = container.querySelector('.canvas-portfolio');
    var sliderShock = container.querySelector('.slider-shock');
    var valShock = container.querySelector('.val-shock');
    var chips = container.querySelectorAll('.chip-shock');
    var readoutDeficit = container.querySelector('.readout-shock-delta');
    var readoutActiveWindow = container.querySelector('.readout-active-window');

    var state = {
      shockAward: parseFloat(sliderShock ? sliderShock.value : 20) || 20,
      baselineC: 100,
      totalYears: 16
    };

    function getSeriesData() {
      var awards = [];
      var unvested = [];
      var delta = state.shockAward - state.baselineC; // e.g. 20 - 100 = -80

      for (var t = 1; t <= state.totalYears; t++) {
        var a = (t === 9) ? state.shockAward : state.baselineC;
        awards.push(a);

        // Portfolio steady-state formula with exact shock lingering over 4 years
        var u = 2.5 * state.baselineC;
        if (t === 1) u = 1.0 * state.baselineC;
        else if (t === 2) u = 1.75 * state.baselineC;
        else if (t === 3) u = 2.25 * state.baselineC;
        else if (t === 9) u = 2.5 * state.baselineC + 1.0 * delta;
        else if (t === 10) u = 2.5 * state.baselineC + 0.75 * delta;
        else if (t === 11) u = 2.5 * state.baselineC + 0.50 * delta;
        else if (t === 12) u = 2.5 * state.baselineC + 0.25 * delta;
        else u = 2.5 * state.baselineC;

        unvested.push(u);
      }
      return { awards: awards, unvested: unvested, delta: delta };
    }

    function updateReadouts() {
      var delta = state.shockAward - state.baselineC;
      if (valShock) {
        valShock.textContent = state.shockAward.toFixed(0) + ' shares (' + (delta >= 0 ? '+' : '') + delta.toFixed(0) + ')';
        valShock.style.color = delta < 0 ? 'var(--color-danger)' : (delta > 0 ? 'var(--color-emerald)' : 'var(--color-time)');
      }
      if (readoutDeficit) {
        readoutDeficit.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(0) + ' shares';
        readoutDeficit.style.color = delta < 0 ? 'var(--color-danger)' : (delta > 0 ? 'var(--color-emerald)' : 'var(--text-primary)');
      }
      if (readoutActiveWindow) {
        readoutActiveWindow.textContent = 'Y9 – Y12 (Exactly 4 Years / Lag q = 3)';
      }
    }

    function draw() {
      if (!canvasAwards || !canvasPortfolio) return;
      var retA = setupRetinaCanvas(canvasAwards);
      var retP = setupRetinaCanvas(canvasPortfolio);
      var c = getThemeColors();
      var data = getSeriesData();

      // --- Draw Left Canvas: Annual Awards A(t) ---
      (function () {
        var ctx = retA.ctx, width = retA.width, height = retA.height;
        ctx.clearRect(0, 0, width, height);

        var padLeft = 48, padRight = 20, padTop = 35, padBottom = 35;
        var chartW = width - padLeft - padRight;
        var chartH = height - padTop - padBottom;
        var maxA = 240;

        var scaleX = function (t) { return padLeft + ((t - 1) / (state.totalYears - 1)) * chartW; };
        var scaleY = function (a) { return padTop + chartH - (a / maxA) * chartH; };

        // Grid and Y-axis ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var aTicks = [0, 50, 100, 150, 200];
        for (var i = 0; i < aTicks.length; i++) {
          var yTick = scaleY(aTicks[i]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yTick);
          ctx.lineTo(width - padRight, yTick);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(aTicks[i].toString(), padLeft - 6, yTick);
        }

        // Baseline guideline at 100
        var baseBY = scaleY(state.baselineC);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(padLeft, baseBY);
        ctx.lineTo(width - padRight, baseBY);
        ctx.stroke();
        ctx.restore();

        // Shaded shock column highlight at Year 9
        var x9 = scaleX(9);
        var colW = (chartW / state.totalYears) * 0.75;
        ctx.fillStyle = data.delta < 0 ? 'rgba(185, 28, 28, 0.08)' : (data.delta > 0 ? 'rgba(15, 118, 110, 0.08)' : 'transparent');
        ctx.fillRect(x9 - colW, padTop, colW * 2, chartH);

        // Plot bars for awards
        for (var t = 1; t <= state.totalYears; t++) {
          var x = scaleX(t);
          var a = data.awards[t - 1];
          var y = scaleY(a);
          var barH = Math.max(0, chartH - (y - padTop));

          ctx.fillStyle = (t === 9) ? (data.delta < 0 ? c.dangerColor : (data.delta > 0 ? c.emeraldColor : c.timeColor)) : c.timeColor;
          ctx.fillRect(x - 4, y, 8, barH);

          // Dot on top
          drawGlowingDot(ctx, x, y, ctx.fillStyle, 3.5);

          // X tick
          if (t === 1 || t === 5 || t === 9 || t === 13 || t === 16) {
            ctx.fillStyle = (t === 9) ? (data.delta < 0 ? c.dangerColor : (data.delta > 0 ? c.emeraldColor : c.textPrimary)) : c.textMuted;
            ctx.font = (t === 9) ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Y' + t, x, padTop + chartH + 14);
          }
        }

        // Pill label on Year 9 shock
        var pillA9X = clamp(x9, padLeft + 45, width - padRight - 45);
        drawLabelPill(ctx, 'A(9) = ' + state.shockAward.toFixed(0), pillA9X, scaleY(state.shockAward) - 16, {
          textColor: data.delta < 0 ? c.dangerColor : (data.delta > 0 ? c.emeraldColor : c.timeColor),
          bgColor: c.bgCard,
          borderColor: c.borderMedium
        });

        // Axes
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.lineTo(width - padRight, padTop + chartH);
        ctx.stroke();

        ctx.fillStyle = c.textSecondary;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Annual Stock Awards A(t)', padLeft + 6, padTop - 12);
      })();

      // --- Draw Right Canvas: Total Unvested Shares U(t) ---
      (function () {
        var ctx = retP.ctx, width = retP.width, height = retP.height;
        ctx.clearRect(0, 0, width, height);

        var padLeft = 48, padRight = 20, padTop = 35, padBottom = 35;
        var chartW = width - padLeft - padRight;
        var chartH = height - padTop - padBottom;
        var minU = 70, maxU = 370;

        var scaleX = function (t) { return padLeft + ((t - 1) / (state.totalYears - 1)) * chartW; };
        var scaleY = function (u) { return padTop + chartH - ((u - minU) / (maxU - minU)) * chartH; };

        // Grid and Y-axis ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var uTicks = [100, 150, 200, 250, 300, 350];
        for (var ti = 0; ti < uTicks.length; ti++) {
          var yUTick = scaleY(uTicks[ti]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yUTick);
          ctx.lineTo(width - padRight, yUTick);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(uTicks[ti].toString(), padLeft - 6, yUTick);
        }

        // Shaded 4-Year Memory Window [Y9, Y12] with recovery at Y13
        var startMemX = scaleX(9);
        var endMemX = scaleX(13);
        ctx.fillStyle = 'rgba(194, 65, 12, 0.08)';
        ctx.fillRect(startMemX, padTop, endMemX - startMemX, chartH);

        // Memory Window Top Bracket
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(startMemX, padTop + 4);
        ctx.lineTo(endMemX, padTop + 4);
        ctx.moveTo(startMemX, padTop);
        ctx.lineTo(startMemX, padTop + 8);
        ctx.moveTo(endMemX, padTop);
        ctx.lineTo(endMemX, padTop + 8);
        ctx.stroke();

        ctx.fillStyle = c.spaceColor;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Finite Memory Window (4 Years / q = 3)', (startMemX + endMemX) / 2, padTop + 18);

        // Steady-state 250 guideline
        var ssY = scaleY(250);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.emeraldColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(padLeft, ssY);
        ctx.lineTo(width - padRight, ssY);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = c.emeraldColor;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Equilibrium (250)', padLeft + 6, ssY - 6);

        // Draw line for U(t) with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, chartW, chartH);
        ctx.clip();

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = c.spaceColor;
        for (var t = 1; t <= state.totalYears; t++) {
          var u = data.unvested[t - 1];
          var x = scaleX(t);
          var y = scaleY(u);
          if (t === 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw points along U(t)
        for (var pt = 1; pt <= state.totalYears; pt++) {
          var uVal = data.unvested[pt - 1];
          var px = scaleX(pt);
          var py = scaleY(uVal);

          var isImpactYear = (pt >= 9 && pt <= 12);
          var dotColor = isImpactYear ? (data.delta < 0 ? c.dangerColor : c.emeraldColor) : c.spaceColor;
          drawGlowingDot(ctx, px, py, dotColor, isImpactYear ? 4.5 : 3);
        }
        ctx.restore();

        // X tick labels
        for (var xt = 1; xt <= state.totalYears; xt++) {
          if (xt === 1 || xt === 5 || xt === 9 || xt === 13 || xt === 16) {
            var xTickPos = scaleX(xt);
            ctx.fillStyle = (xt === 9) ? (data.delta < 0 ? c.dangerColor : (data.delta > 0 ? c.emeraldColor : c.textPrimary)) : c.textMuted;
            ctx.font = (xt === 9) ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Y' + xt, xTickPos, padTop + chartH + 14);
          }
        }

        // Recovery point at Y13 highlight
        var x13 = scaleX(13);
        var y13 = scaleY(250);
        var pill13X = clamp(x13, padLeft + 55, width - padRight - 55);
        drawLabelPill(ctx, 'Y13: Recovered (250)', pill13X, y13 - 18, {
          textColor: c.emeraldColor,
          bgColor: c.bgCard,
          borderColor: c.borderMedium
        });

        // Axes
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.lineTo(width - padRight, padTop + chartH);
        ctx.stroke();

        ctx.fillStyle = c.textSecondary;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Total Unvested Shares U(t)', padLeft + 6, padTop - 12);
      })();
    }

    if (sliderShock) {
      sliderShock.addEventListener('input', function () {
        state.shockAward = parseFloat(sliderShock.value);
        for (var ci = 0; ci < chips.length; ci++) {
          var chipVal = parseFloat(chips[ci].getAttribute('data-val'));
          if (chipVal === state.shockAward) {
            chips[ci].classList.add('active');
          } else {
            chips[ci].classList.remove('active');
          }
        }
        updateReadouts();
        draw();
      });
    }

    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          var val = parseFloat(chip.getAttribute('data-val'));
          state.shockAward = val;
          if (sliderShock) sliderShock.value = val;
          for (var ci = 0; ci < chips.length; ci++) chips[ci].classList.remove('active');
          chip.classList.add('active');
          updateReadouts();
          draw();
        });
      })(chips[i]);
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // SIMULATION 03: SWIMMING IN A STREAM OF SHOCKS
  // ==========================================================================
  function initWidgetStochasticStream(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderC = container.querySelector('.slider-baseline-c');
    var sliderSigma = container.querySelector('.slider-sigma');
    var valC = container.querySelector('.val-baseline-c');
    var valSigma = container.querySelector('.val-sigma');
    var btnReseed = container.querySelector('.btn-reseed');
    var btnToggleTransient = container.querySelector('.btn-toggle-transient');

    var readoutMean = container.querySelector('.readout-sample-mean');
    var readoutStd = container.querySelector('.readout-sample-std');
    var readoutTheoreticalStd = container.querySelector('.readout-theoretical-std');

    var state = {
      C: parseFloat(sliderC ? sliderC.value : 100) || 100,
      sigma: parseFloat(sliderSigma ? sliderSigma.value : 20) || 20,
      seed: 42,
      showTransient: true,
      numSteps: 34
    };

    function generateData() {
      var rng = makePRNG(state.seed);
      var shocks = [];
      var awards = [];
      var unvested = [];

      for (var t = 0; t < state.numSteps; t++) {
        var eps = gaussianRandom(rng) * state.sigma;
        shocks.push(eps);
        awards.push(state.C + eps);
      }

      // Exact unvested formula matching four-year ledger
      for (var i = 0; i < state.numSteps; i++) {
        var u = awards[i] +
          (i >= 1 ? 0.75 * awards[i - 1] : 0) +
          (i >= 2 ? 0.50 * awards[i - 2] : 0) +
          (i >= 3 ? 0.25 * awards[i - 3] : 0);
        unvested.push(u);
      }

      return { shocks: shocks, awards: awards, unvested: unvested };
    }

    function updateReadouts() {
      if (valC) valC.textContent = state.C.toFixed(0);
      if (valSigma) valSigma.textContent = state.sigma.toFixed(0);

      var data = generateData();
      // Steady-state statistics evaluated on stationary portion (i >= 3)
      var steadySlice = data.unvested.slice(3);

      var sum = 0;
      for (var i = 0; i < steadySlice.length; i++) sum += steadySlice[i];
      var mean = sum / steadySlice.length;

      var variance = 0;
      for (var j = 0; j < steadySlice.length; j++) variance += Math.pow(steadySlice[j] - mean, 2);
      var std = Math.sqrt(variance / steadySlice.length);

      // Theoretical std for MA(3): sigma * sqrt(1 + 0.75^2 + 0.5^2 + 0.25^2) = sigma * sqrt(1.875)
      var theoreticalStd = state.sigma * Math.sqrt(1.875);

      if (readoutMean) readoutMean.textContent = mean.toFixed(1) + ' sh';
      if (readoutStd) readoutStd.textContent = std.toFixed(1) + ' sh';
      if (readoutTheoreticalStd) readoutTheoreticalStd.textContent = theoreticalStd.toFixed(1) + ' sh';
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();
      var data = generateData();

      ctx.clearRect(0, 0, width, height);

      var padLeft = 48;
      var padRight = 30;
      var padTop = 25;
      var padBottom = 30;
      var gap = 35;

      var usableH = height - padTop - padBottom - gap;
      var panelH = usableH / 2;

      var topY0 = padTop;
      var botY0 = padTop + panelH + gap;
      var chartW = width - padLeft - padRight;

      var startIdx = state.showTransient ? 0 : 3;
      var numPoints = state.numSteps - startIdx;

      var scaleX = function (idx) {
        return padLeft + ((idx - startIdx) / (numPoints - 1)) * chartW;
      };

      // --- TOP PANEL: Awards A(t) = C + eps(t) ---
      (function () {
        var minA = state.C - 3.2 * state.sigma;
        var maxA = state.C + 3.2 * state.sigma;
        var scaleYA = function (v) { return topY0 + panelH - ((v - minA) / (maxA - minA)) * panelH; };

        // Grid lines & Y ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var tickVals = [
          Math.round(state.C - 2 * state.sigma),
          Math.round(state.C),
          Math.round(state.C + 2 * state.sigma)
        ];
        for (var ti = 0; ti < tickVals.length; ti++) {
          var yPos = scaleYA(tickVals[ti]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yPos);
          ctx.lineTo(width - padRight, yPos);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(tickVals[ti].toString(), padLeft - 6, yPos);
        }

        // Baseline C dashed line
        var yC = scaleYA(state.C);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(padLeft, yC);
        ctx.lineTo(width - padRight, yC);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = c.dangerColor;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Mean Award C = ' + state.C.toFixed(0), width - padRight - 6, yC - 6);

        // Series line with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, topY0, chartW, panelH);
        ctx.clip();

        ctx.beginPath();
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.8;
        for (var i = startIdx; i < state.numSteps; i++) {
          var x = scaleX(i);
          var y = scaleYA(data.awards[i]);
          if (i === startIdx) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dots
        for (var j = startIdx; j < state.numSteps; j++) {
          drawGlowingDot(ctx, scaleX(j), scaleYA(data.awards[j]), c.timeColor, 2.5);
        }
        ctx.restore();

        // Border & title
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, topY0, chartW, panelH);

        ctx.fillStyle = c.textPrimary;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Annual Stock Awards A(t) = C + ε(t)', padLeft + 8, topY0 - 8);
      })();

      // --- BOTTOM PANEL: Unvested U(t) ---
      (function () {
        var mu = 2.5 * state.C;
        var theoStd = state.sigma * Math.sqrt(1.875);
        var minU = mu - 3.4 * theoStd;
        var maxU = mu + 3.4 * theoStd;
        var scaleYU = function (v) { return botY0 + panelH - ((v - minU) / (maxU - minU)) * panelH; };

        // Grid lines & Y ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var tickUVals = [
          Math.round(mu - 2 * theoStd),
          Math.round(mu),
          Math.round(mu + 2 * theoStd)
        ];
        for (var ti = 0; ti < tickUVals.length; ti++) {
          var yUPos = scaleYU(tickUVals[ti]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yUPos);
          ctx.lineTo(width - padRight, yUPos);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(tickUVals[ti].toString(), padLeft - 6, yUPos);
        }

        // Equilibrium mu dashed line
        var yMu = scaleYU(mu);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.emeraldColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(padLeft, yMu);
        ctx.lineTo(width - padRight, yMu);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = c.emeraldColor;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Steady-State Mean μ = ' + mu.toFixed(0), width - padRight - 6, yMu - 6);

        // Highlight transient ramp if visible
        if (state.showTransient) {
          var xRampEnd = scaleX(2.5);
          ctx.fillStyle = 'rgba(194, 65, 12, 0.08)';
          ctx.fillRect(padLeft, botY0, Math.max(0, xRampEnd - padLeft), panelH);
          ctx.fillStyle = c.spaceColor;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('Transient Ramp (t < 4)', padLeft + 6, botY0 + 14);
        }

        // Series line with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, botY0, chartW, panelH);
        ctx.clip();

        ctx.beginPath();
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2.0;
        for (var i = startIdx; i < state.numSteps; i++) {
          var x = scaleX(i);
          var y = scaleYU(data.unvested[i]);
          if (i === startIdx) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dots
        for (var j = startIdx; j < state.numSteps; j++) {
          var dotCol = (state.showTransient && j < 3) ? c.dangerColor : c.spaceColor;
          drawGlowingDot(ctx, scaleX(j), scaleYU(data.unvested[j]), dotCol, 2.5);
        }
        ctx.restore();

        // X-axis ticks
        for (var t = startIdx; t < state.numSteps; t += 5) {
          var tx = scaleX(t);
          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('t=' + (t + 1), tx, botY0 + panelH + 14);
        }

        // Border & title
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, botY0, chartW, panelH);

        ctx.fillStyle = c.textPrimary;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Total Unvested Shares U(t) [Moving-Average MA(3) Process]', padLeft + 8, botY0 - 8);
      })();
    }

    if (sliderC) {
      sliderC.addEventListener('input', function () {
        state.C = parseFloat(sliderC.value);
        updateReadouts();
        draw();
      });
    }

    if (sliderSigma) {
      sliderSigma.addEventListener('input', function () {
        state.sigma = parseFloat(sliderSigma.value);
        updateReadouts();
        draw();
      });
    }

    if (btnReseed) {
      btnReseed.addEventListener('click', function () {
        state.seed = Math.floor(Math.random() * 1000000);
        updateReadouts();
        draw();
      });
    }

    if (btnToggleTransient) {
      btnToggleTransient.addEventListener('click', function () {
        state.showTransient = !state.showTransient;
        btnToggleTransient.textContent = state.showTransient ? 'Hide Initial Ramp-Up (t < 4)' : 'Show Initial Ramp-Up (t < 4)';
        updateReadouts();
        draw();
      });
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // SIMULATION 04: THE MA(q) SANDBOX & ACF DIAGNOSTIC FINGERPRINT
  // ==========================================================================
  function initWidgetMASandbox(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasSeries = container.querySelector('.canvas-ma-series');
    var canvasACF = container.querySelector('.canvas-ma-acf');
    var chips = container.querySelectorAll('.chip-order');
    var sliderTheta1 = container.querySelector('.slider-theta1');
    var sliderTheta2 = container.querySelector('.slider-theta2');
    var sliderTheta3 = container.querySelector('.slider-theta3');
    var sliderTheta4 = container.querySelector('.slider-theta4');
    var valTheta1 = container.querySelector('.val-theta1');
    var valTheta2 = container.querySelector('.val-theta2');
    var valTheta3 = container.querySelector('.val-theta3');
    var valTheta4 = container.querySelector('.val-theta4');
    var rowTheta2 = container.querySelector('.row-theta2');
    var rowTheta3 = container.querySelector('.row-theta3');
    var rowTheta4 = container.querySelector('.row-theta4');
    var btnRegenerate = container.querySelector('.btn-regenerate-ma');

    var readoutOrder = container.querySelector('.readout-ma-order');
    var readoutCutoffLag = container.querySelector('.readout-cutoff-lag');

    var state = {
      order: 3, // MA(3) by default
      thetas: [0.75, 0.50, 0.25, 0.20],
      seed: 98765,
      N: 80,
      maxLag: 8
    };

    function generateMAData() {
      var rng = makePRNG(state.seed);
      var shocks = [];
      // Warm up shocks to eliminate initial condition transients
      for (var i = 0; i < state.N + 30; i++) {
        shocks.push(gaussianRandom(rng));
      }

      var series = [];
      for (var t = 30; t < state.N + 30; t++) {
        var x = shocks[t];
        for (var k = 0; k < state.order; k++) {
          var thVal = state.thetas[k] !== undefined ? state.thetas[k] : 0;
          x += thVal * shocks[t - (k + 1)];
        }
        series.push(x);
      }

      // Compute sample mean
      var sum = 0;
      for (var s = 0; s < series.length; s++) sum += series[s];
      var mean = sum / series.length;

      // Compute sample autocovariances for lags 0..maxLag
      var gamma0 = 0;
      for (var g = 0; g < series.length; g++) {
        gamma0 += Math.pow(series[g] - mean, 2);
      }
      gamma0 /= series.length;

      var acf = [];
      for (var lag = 0; lag <= state.maxLag; lag++) {
        if (lag === 0) {
          acf.push(1.0);
          continue;
        }
        var cov = 0;
        for (var idx = 0; idx < series.length - lag; idx++) {
          cov += (series[idx] - mean) * (series[idx + lag] - mean);
        }
        cov /= series.length;
        acf.push(gamma0 > 1e-10 ? cov / gamma0 : 0);
      }

      // Theoretical ACF for MA(q):
      // gamma_0 = sigma^2 * (1 + sum_{i=1}^q theta_i^2)
      // gamma_k = sigma^2 * (theta_k + sum_{j=1}^{q - k} theta_j * theta_{j + k}) for k <= q, and 0 for k > q
      var theoACF = [];
      var sumSqThetas = 1.0;
      for (var th = 0; th < state.order; th++) {
        var thV = state.thetas[th] !== undefined ? state.thetas[th] : 0;
        sumSqThetas += Math.pow(thV, 2);
      }

      for (var tLag = 0; tLag <= state.maxLag; tLag++) {
        if (tLag === 0) {
          theoACF.push(1.0);
        } else if (tLag > state.order) {
          theoACF.push(0.0);
        } else {
          var num = state.thetas[tLag - 1] !== undefined ? state.thetas[tLag - 1] : 0;
          for (var j = 0; j < state.order - tLag; j++) {
            var thA = state.thetas[j] !== undefined ? state.thetas[j] : 0;
            var thB = state.thetas[j + tLag] !== undefined ? state.thetas[j + tLag] : 0;
            num += thA * thB;
          }
          theoACF.push(sumSqThetas > 1e-10 ? num / sumSqThetas : 0);
        }
      }

      return { series: series, acf: acf, theoACF: theoACF };
    }

    function updateControlsUI() {
      if (rowTheta2) rowTheta2.style.display = (state.order >= 2) ? 'block' : 'none';
      if (rowTheta3) rowTheta3.style.display = (state.order >= 3) ? 'block' : 'none';
      if (rowTheta4) rowTheta4.style.display = (state.order >= 4) ? 'block' : 'none';

      if (sliderTheta1) sliderTheta1.value = state.thetas[0];
      if (sliderTheta2) sliderTheta2.value = state.thetas[1];
      if (sliderTheta3) sliderTheta3.value = state.thetas[2];
      if (sliderTheta4) sliderTheta4.value = state.thetas[3];

      if (valTheta1) valTheta1.textContent = (state.thetas[0] || 0).toFixed(2);
      if (valTheta2) valTheta2.textContent = (state.thetas[1] || 0).toFixed(2);
      if (valTheta3) valTheta3.textContent = (state.thetas[2] || 0).toFixed(2);
      if (valTheta4) valTheta4.textContent = (state.thetas[3] || 0).toFixed(2);

      if (readoutOrder) readoutOrder.textContent = 'MA(' + state.order + ')';
      if (readoutCutoffLag) readoutCutoffLag.textContent = 'Lag k = ' + state.order;
    }

    function draw() {
      if (!canvasSeries || !canvasACF) return;
      var retS = setupRetinaCanvas(canvasSeries);
      var retA = setupRetinaCanvas(canvasACF);
      var c = getThemeColors();
      var data = generateMAData();

      // --- Left Canvas: Time Series X_t ---
      (function () {
        var ctx = retS.ctx, width = retS.width, height = retS.height;
        ctx.clearRect(0, 0, width, height);

        var padLeft = 42, padRight = 20, padTop = 30, padBottom = 35;
        var chartW = width - padLeft - padRight;
        var chartH = height - padTop - padBottom;

        // Dynamic scale adapting to empirical shock spread
        var maxAbs = 3.5;
        for (var si = 0; si < state.N; si++) {
          if (Math.abs(data.series[si]) > maxAbs) maxAbs = Math.abs(data.series[si]);
        }
        var bound = Math.ceil(maxAbs * 1.15);
        var minX = -bound, maxX = bound;

        var scaleX = function (i) { return padLeft + (i / (state.N - 1)) * chartW; };
        var scaleY = function (v) { return padTop + chartH - ((v - minX) / (maxX - minX)) * chartH; };

        // Grid lines & Y ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var sTicks = [-Math.round(bound / 2), 0, Math.round(bound / 2)];
        for (var ti = 0; ti < sTicks.length; ti++) {
          var yTick = scaleY(sTicks[ti]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yTick);
          ctx.lineTo(width - padRight, yTick);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText((sTicks[ti] > 0 ? '+' : '') + sTicks[ti].toString(), padLeft - 6, yTick);
        }

        // Zero center line
        var y0 = scaleY(0);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(padLeft, y0);
        ctx.lineTo(width - padRight, y0);
        ctx.stroke();
        ctx.restore();

        // Line plot with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, chartW, chartH);
        ctx.clip();

        ctx.beginPath();
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.8;
        for (var i = 0; i < state.N; i++) {
          var px = scaleX(i);
          var py = scaleY(data.series[i]);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        for (var j = 0; j < state.N; j++) {
          drawGlowingDot(ctx, scaleX(j), scaleY(data.series[j]), c.timeColor, 2.0);
        }
        ctx.restore();

        // Axes
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.lineTo(width - padRight, padTop + chartH);
        ctx.stroke();

        ctx.fillStyle = c.textSecondary;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Simulated Realization X_t (N = 80 Steps)', padLeft + 6, padTop - 10);
      })();

      // --- Right Canvas: Sample & Theoretical ACF Lollipop Chart ---
      (function () {
        var ctx = retA.ctx, width = retA.width, height = retA.height;
        ctx.clearRect(0, 0, width, height);

        var padLeft = 45, padRight = 25, padTop = 30, padBottom = 35;
        var chartW = width - padLeft - padRight;
        var chartH = height - padTop - padBottom;

        var minR = -0.65, maxR = 1.1;
        var scaleLagX = function (lag) { return padLeft + (lag / state.maxLag) * chartW; };
        var scaleR = function (r) { return padTop + chartH - ((r - minR) / (maxR - minR)) * chartH; };

        // Grid lines & Y ticks
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        var rTicks = [-0.5, 0.0, 0.5, 1.0];
        for (var ti = 0; ti < rTicks.length; ti++) {
          var yRTick = scaleR(rTicks[ti]);
          ctx.beginPath();
          ctx.moveTo(padLeft, yRTick);
          ctx.lineTo(width - padRight, yRTick);
          ctx.stroke();

          ctx.fillStyle = c.textMuted;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(rTicks[ti].toFixed(1), padLeft - 6, yRTick);
        }

        // 95% Bartlett confidence band (+/- 1.96 / sqrt(N))
        var confBound = 1.96 / Math.sqrt(state.N);
        var yTopConf = scaleR(confBound);
        var yBotConf = scaleR(-confBound);

        ctx.fillStyle = 'rgba(29, 78, 216, 0.07)';
        ctx.fillRect(padLeft, yTopConf, chartW, yBotConf - yTopConf);

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(29, 78, 216, 0.35)';
        ctx.beginPath();
        ctx.moveTo(padLeft, yTopConf);
        ctx.lineTo(width - padRight, yTopConf);
        ctx.moveTo(padLeft, yBotConf);
        ctx.lineTo(width - padRight, yBotConf);
        ctx.stroke();
        ctx.restore();

        // Label on confidence band
        ctx.fillStyle = c.textMuted;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('95% Noise Band (±1.96/√N)', width - padRight - 6, yTopConf - 4);

        // Baseline zero line
        var yZero = scaleR(0);
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, yZero);
        ctx.lineTo(width - padRight, yZero);
        ctx.stroke();

        // Vertical cutoff divider at lag q + 0.5
        var cutoffX = scaleLagX(state.order + 0.5);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cutoffX, padTop);
        ctx.lineTo(cutoffX, padTop + chartH);
        ctx.stroke();
        ctx.restore();

        var clampedCutoffTextX = clamp(cutoffX, padLeft + 55, width - padRight - 55);
        ctx.fillStyle = c.dangerColor;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Cutoff (Lag ' + state.order + ')', clampedCutoffTextX, padTop + 10);

        // Draw ACF lollipops for each lag with clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, chartW, chartH);
        ctx.clip();

        for (var lag = 0; lag <= state.maxLag; lag++) {
          var lx = scaleLagX(lag);
          var sampleVal = data.acf[lag];
          var theoVal = data.theoACF[lag];

          var ySample = scaleR(sampleVal);
          var yTheo = scaleR(theoVal);

          var isWithinOrder = (lag <= state.order);

          // Theoretical marker (horizontal tick in emerald)
          ctx.strokeStyle = c.emeraldColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lx - 5, yTheo);
          ctx.lineTo(lx + 5, yTheo);
          ctx.stroke();

          // Sample stick
          ctx.strokeStyle = isWithinOrder ? c.spaceColor : c.textMuted;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(lx, yZero);
          ctx.lineTo(lx, ySample);
          ctx.stroke();

          // Sample lollipop head
          drawGlowingDot(ctx, lx, ySample, isWithinOrder ? c.spaceColor : c.textMuted, 4);
        }
        ctx.restore();

        // X tick labels
        for (var xLag = 0; xLag <= state.maxLag; xLag++) {
          var tickXPos = scaleLagX(xLag);
          ctx.fillStyle = (xLag === state.order) ? c.dangerColor : c.textMuted;
          ctx.font = (xLag === state.order) ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(xLag.toString(), tickXPos, padTop + chartH + 14);
        }

        // Axes
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.lineTo(width - padRight, padTop + chartH);
        ctx.stroke();

        ctx.fillStyle = c.textSecondary;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Autocorrelation (ACF): Sample (Dot) vs Theory (Bar)', padLeft + 6, padTop - 10);
      })();
    }

    // Set order preset
    function setOrder(orderVal, thetas) {
      state.order = orderVal;
      state.thetas = [
        thetas[0] !== undefined ? thetas[0] : 0,
        thetas[1] !== undefined ? thetas[1] : 0,
        thetas[2] !== undefined ? thetas[2] : 0,
        thetas[3] !== undefined ? thetas[3] : 0
      ];
      for (var i = 0; i < chips.length; i++) {
        if (parseInt(chips[i].getAttribute('data-order'), 10) === orderVal) {
          chips[i].classList.add('active');
        } else {
          chips[i].classList.remove('active');
        }
      }
      updateControlsUI();
      draw();
    }

    for (var ci = 0; ci < chips.length; ci++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          var o = parseInt(chip.getAttribute('data-order'), 10);
          if (o === 1) setOrder(1, [0.80, 0.0, 0.0, 0.0]);
          else if (o === 2) setOrder(2, [0.70, -0.40, 0.0, 0.0]);
          else if (o === 3) setOrder(3, [0.75, 0.50, 0.25, 0.0]); // Stock ledger default
          else if (o === 4) setOrder(4, [0.70, 0.50, 0.35, 0.20]);
        });
      })(chips[ci]);
    }

    function clearChipHighlightIfCustom() {
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    }

    if (sliderTheta1) {
      sliderTheta1.addEventListener('input', function () {
        state.thetas[0] = parseFloat(sliderTheta1.value);
        clearChipHighlightIfCustom();
        updateControlsUI();
        draw();
      });
    }

    if (sliderTheta2) {
      sliderTheta2.addEventListener('input', function () {
        state.thetas[1] = parseFloat(sliderTheta2.value);
        clearChipHighlightIfCustom();
        updateControlsUI();
        draw();
      });
    }

    if (sliderTheta3) {
      sliderTheta3.addEventListener('input', function () {
        state.thetas[2] = parseFloat(sliderTheta3.value);
        clearChipHighlightIfCustom();
        updateControlsUI();
        draw();
      });
    }

    if (sliderTheta4) {
      sliderTheta4.addEventListener('input', function () {
        state.thetas[3] = parseFloat(sliderTheta4.value);
        clearChipHighlightIfCustom();
        updateControlsUI();
        draw();
      });
    }

    if (btnRegenerate) {
      btnRegenerate.addEventListener('click', function () {
        state.seed = Math.floor(Math.random() * 1000000);
        draw();
      });
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateControlsUI();
    draw();
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initWidgetVestingRamp('widget-vesting-ramp');
    initWidgetImpulseResponse('widget-impulse-response');
    initWidgetStochasticStream('widget-stochastic-stream');
    initWidgetMASandbox('widget-ma-sandbox');
  });

})(window);
