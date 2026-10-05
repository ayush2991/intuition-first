/**
 * gravity-curvature.js - Spacetime Curvature & Geodesic Fall Simulations
 * Intuition First — Explorable Physics & Mathematics Series
 *
 * Implements:
 * 1. SIMULATION 01: The Pristine Fabric (Zero Mass, Straight Parallel Worldlines)
 * 2. SIMULATION 02: Mass Distorts the Fabric (Earth through t=0, 1, 2, 3 with 4-Panel Snapshot Strip)
 * 3. SIMULATION 03: The Falling Apple (Straight Motion into a Curved Future)
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

  // ==========================================================================
  // 1. WIDGET 1: THE PRISTINE FABRIC (ZERO-MASS WORLDLINES)
  // ==========================================================================
  function initWidgetFlatSpacetimeBaseline(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var btnReset = container.querySelector('.btn-reset');

    // Readout elements
    var elTime = container.querySelector('.readout-time');
    var elSeparation = container.querySelector('.readout-separation');
    var elVelocity = container.querySelector('.readout-velocity');

    var state = {
      t: parseFloat(sliderTime ? sliderTime.value : 1.2) || 1.2,
      maxT: 3.0,
      earthX: 3.5,
      appleX: 11.5,
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      if (sliderTime) sliderTime.value = state.t.toFixed(2);
      if (elTime) elTime.textContent = state.t.toFixed(2) + ' s';
      if (elSeparation) elSeparation.textContent = (state.appleX - state.earthX).toFixed(1) + ' m';
      if (elVelocity) elVelocity.textContent = '0.00 m/s';
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      // Coordinate Viewport Layout
      var padLeft = 60, padRight = 40, padBottom = 50, padTop = 40;
      var plotW = width - padLeft - padRight;
      var plotH = height - padBottom - padTop;

      var xMin = 0, xMax = 15;
      var tMin = 0, tMax = state.maxT;

      function toScreen(x, t) {
        return {
          x: padLeft + ((x - xMin) / (xMax - xMin)) * plotW,
          y: height - padBottom - ((t - tMin) / (tMax - tMin)) * plotH
        };
      }

      // Draw Pristine Cartesian Grid
      ctx.save();
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1.0;
      var numX = 15;
      for (var ix = 0; ix <= numX; ix++) {
        var ptA = toScreen(ix, tMin);
        var ptB = toScreen(ix, tMax);
        ctx.beginPath();
        ctx.moveTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);
        ctx.stroke();
      }
      for (var it = 0; it <= 6; it++) {
        var tVal = it * 0.5;
        var ptC = toScreen(xMin, tVal);
        var ptD = toScreen(xMax, tVal);
        ctx.beginPath();
        ctx.moveTo(ptC.x, ptC.y);
        ctx.lineTo(ptD.x, ptD.y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Coordinate Axes
      drawAxes(ctx, padLeft, height - padBottom, width - padRight, padTop, 'Space x (meters)', 'Time t (seconds)');

      // Draw Grid Ticks and Values
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.textAlign = 'center';
      for (var tx = 0; tx <= 15; tx += 3) {
        var pX = toScreen(tx, 0);
        ctx.fillText(tx + 'm', pX.x, height - padBottom + 16);
      }
      ctx.textAlign = 'right';
      for (var tt = 0; tt <= 3; tt += 1) {
        var pT = toScreen(0, tt);
        ctx.fillText(tt.toFixed(1) + 's', padLeft - 10, pT.y + 4);
      }
      ctx.restore();

      // 1. Earth's Worldline (Mass = 0: Straight vertical column)
      var earthBottom = toScreen(state.earthX, 0);
      var earthCurr = toScreen(state.earthX, state.t);
      var earthTop = toScreen(state.earthX, state.maxT);

      // Future ghost worldline (dashed)
      ctx.save();
      ctx.strokeStyle = c.timeColor;
      ctx.globalAlpha = 0.25;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(earthCurr.x, earthCurr.y);
      ctx.lineTo(earthTop.x, earthTop.y);
      ctx.stroke();
      ctx.restore();

      // Traversed worldline (solid)
      ctx.save();
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(earthBottom.x, earthBottom.y);
      ctx.lineTo(earthCurr.x, earthCurr.y);
      ctx.stroke();
      ctx.restore();

      // 2. Apple's Worldline (Mass = 0: Straight vertical column)
      var appleBottom = toScreen(state.appleX, 0);
      var appleCurr = toScreen(state.appleX, state.t);
      var appleTop = toScreen(state.appleX, state.maxT);

      // Future ghost worldline (dashed)
      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.globalAlpha = 0.25;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(appleCurr.x, appleCurr.y);
      ctx.lineTo(appleTop.x, appleTop.y);
      ctx.stroke();
      ctx.restore();

      // Traversed worldline (solid)
      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(appleBottom.x, appleBottom.y);
      ctx.lineTo(appleCurr.x, appleCurr.y);
      ctx.stroke();
      ctx.restore();

      // Instant of "Now" horizontal line
      ctx.save();
      ctx.strokeStyle = c.axisLine;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.0;
      var nowStart = toScreen(0, state.t);
      var nowEnd = toScreen(15, state.t);
      ctx.beginPath();
      ctx.moveTo(nowStart.x, nowStart.y);
      ctx.lineTo(nowEnd.x, nowEnd.y);
      ctx.stroke();
      ctx.restore();

      // Spatial Separation Dimension Line at current t
      ctx.save();
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(earthCurr.x, earthCurr.y);
      ctx.lineTo(appleCurr.x, appleCurr.y);
      ctx.stroke();

      // Small end ticks
      ctx.beginPath();
      ctx.moveTo(earthCurr.x, earthCurr.y - 6);
      ctx.lineTo(earthCurr.x, earthCurr.y + 6);
      ctx.moveTo(appleCurr.x, appleCurr.y - 6);
      ctx.lineTo(appleCurr.x, appleCurr.y + 6);
      ctx.stroke();
      ctx.restore();

      // Dimension Label
      var midX = (earthCurr.x + appleCurr.x) / 2;
      drawLabelPill(ctx, 'Constant Gap: Δx = 8.0 m', midX, earthCurr.y - 14, {
        textColor: c.invariantColor,
        bgColor: c.pillBg,
        borderColor: c.invariantColor
      });

      // Earth & Apple Dots
      drawGlowingDot(ctx, earthCurr.x, earthCurr.y, c.timeColor, 7);
      drawGlowingDot(ctx, appleCurr.x, appleCurr.y, c.spaceColor, 6);

      // Entity Labels
      drawLabelPill(ctx, 'Earth (M = 0)', earthCurr.x, earthCurr.y + 18, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });
      drawLabelPill(ctx, 'Apple (M = 0)', appleCurr.x, appleCurr.y + 18, {
        textColor: c.spaceColor,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });

      // Insight banner inside canvas
      drawLabelPill(ctx, 'Zero Mass = Zero Curvature · Parallel Worldlines Never Meet', width / 2, padTop + 8, {
        textColor: c.subtleText,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });
    }

    function stepAnimation() {
      if (!state.isPlaying || !state.isVisible) return;
      state.t += 0.012;
      if (state.t > state.maxT) {
        state.t = 0;
      }
      updateReadouts();
      draw();
      requestAnimationFrame(stepAnimation);
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function () {
        state.t = parseFloat(sliderTime.value);
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
        if (state.isPlaying) requestAnimationFrame(stepAnimation);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.t = 0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(stepAnimation);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // 2. WIDGET 2: MASS DISTORTS THE FABRIC (EARTH THROUGH t=0, 1, 2, 3)
  // ==========================================================================
  function initWidgetEarthWarpsSpacetime(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('.main-canvas');
    var sliderTime = container.querySelector('.slider-time');
    var sliderMass = container.querySelector('.slider-mass');
    var btnPlay = container.querySelector('.btn-play');
    var btnPresetChips = container.querySelectorAll('.preset-time-chip');

    // Readout elements
    var elTime = container.querySelector('.readout-time');
    var elMass = container.querySelector('.readout-mass');
    var elCurvature = container.querySelector('.readout-curvature');

    // Snapshot mini-canvases
    var snapshotCards = container.querySelectorAll('.snapshot-card');

    var state = {
      t: parseFloat(sliderTime ? sliderTime.value : 1.5) || 1.5,
      maxT: 3.0,
      mass: parseFloat(sliderMass ? sliderMass.value : 1.0) || 1.0, // 0 = flat, 1.0 = standard earth
      earthX: 7.5,
      earthRadius: 1.8,
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      if (sliderTime) sliderTime.value = state.t.toFixed(2);
      if (sliderMass) sliderMass.value = state.mass.toFixed(2);
      if (elTime) elTime.textContent = state.t.toFixed(2) + ' s';
      if (elMass) elMass.textContent = (state.mass * 9.25).toFixed(2) + ' × 10²⁴ kg';
      if (elCurvature) {
        var curvPercent = Math.round(state.mass * 100);
        elCurvature.textContent = curvPercent + '% Curvature (Earth Weight)';
      }

      // Update active chip state
      btnPresetChips.forEach(function (chip) {
        var chipT = parseFloat(chip.getAttribute('data-time'));
        if (Math.abs(chipT - state.t) < 0.1) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    /**
     * Common rendering routine for Simulation 02 main canvas and snapshots.
     * Demonstrates how mass bows space lines inward and sags time lines downward.
     */
    function renderSpacetimeFrame(targetCanvas, currentT, currentMass, isSnapshot) {
      if (!targetCanvas) return;
      var ret = setupRetinaCanvas(targetCanvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var padLeft = isSnapshot ? 32 : 55;
      var padRight = isSnapshot ? 20 : 35;
      var padBottom = isSnapshot ? 26 : 45;
      var padTop = isSnapshot ? 20 : 35;
      var plotW = width - padLeft - padRight;
      var plotH = height - padBottom - padTop;

      var xMin = 0, xMax = 15;
      var tMin = 0, tMax = state.maxT;

      function toScreen(x, t) {
        return {
          x: padLeft + ((x - xMin) / (xMax - xMin)) * plotW,
          y: height - padBottom - ((t - tMin) / (tMax - tMin)) * plotH
        };
      }

      // Curvature evolves smoothly across the loaf progression from t = 0 to t = 3.0
      var effectiveMass = currentMass * (0.25 + 0.75 * (currentT / state.maxT));

      // 1. Draw Distorted Spacetime Grid
      ctx.save();
      ctx.beginPath();
      ctx.rect(padLeft, padTop, plotW, plotH);
      ctx.clip();

      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1.0;

      var numX = 14;
      var numT = 10;
      var stepX = (xMax - xMin) / numX;
      var stepT = (tMax - tMin) / numT;
      var samples = 45;

      // Lines of Space: bow inward toward Earth's worldtube as time advances
      for (var ix = 0; ix <= numX; ix++) {
        var startX = xMin + ix * stepX;
        var dx0 = startX - state.earthX;
        var sign = dx0 > 0 ? 1 : (dx0 < 0 ? -1 : 0);
        var dist = Math.abs(dx0);

        ctx.beginPath();
        for (var s = 0; s <= samples; s++) {
          var tVal = tMin + (s / samples) * (tMax - tMin);
          // Curvature pulls inward continuously along the full time span
          var falloff = 1.0 / (1.0 + Math.pow(dist / 3.0, 2.0));
          var pull = 0.5 * effectiveMass * falloff * 1.305 * Math.pow(tVal, 1.8);
          var warpedX = startX - sign * pull;

          // Clamped so space lines don't pierce inside Earth's core
          if (sign > 0) warpedX = Math.max(state.earthX + state.earthRadius * 0.92, warpedX);
          if (sign < 0) warpedX = Math.min(state.earthX - state.earthRadius * 0.92, warpedX);

          var pt = toScreen(warpedX, tVal);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Lines of Time: sag downward near Earth (gravitational time dilation well)
      // Extended range so lines above the viewport that sag into view are rendered!
      var maxSagEstimate = 2.5;
      var minOrigT = tMin - 0.6;
      var maxOrigT = tMax + maxSagEstimate;

      for (var origT = minOrigT; origT <= maxOrigT; origT += stepT) {
        ctx.beginPath();
        for (var s2 = 0; s2 <= samples; s2++) {
          var xVal = xMin + (s2 / samples) * (xMax - xMin);
          var dist2 = Math.abs(xVal - state.earthX);
          var falloff2 = 1.0 / (1.0 + Math.pow(dist2 / 2.8, 2.0));
          var sag = effectiveMass * falloff2 * 1.30;
          var warpedT = origT - sag;

          var pt2 = toScreen(xVal, warpedT);
          if (s2 === 0) ctx.moveTo(pt2.x, pt2.y);
          else ctx.lineTo(pt2.x, pt2.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 2. Gravitational Well Gradient Overlay
      if (effectiveMass > 0.05) {
        ctx.save();
        var centerScreen = toScreen(state.earthX, currentT / 2);
        var radiusScreen = (state.earthRadius / (xMax - xMin)) * plotW * 2.8;
        var grad = ctx.createRadialGradient(centerScreen.x, centerScreen.y, 5, centerScreen.x, centerScreen.y, radiusScreen);
        grad.addColorStop(0, c.timeColorSubtle);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(padLeft, padTop, plotW, plotH);
        ctx.restore();
      }

      // 3. Axes
      if (!isSnapshot) {
        drawAxes(ctx, padLeft, height - padBottom, width - padRight, padTop, 'Space x', 'Time ct');
      } else {
        ctx.save();
        ctx.strokeStyle = c.pillBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, padTop, plotW, plotH);
        ctx.restore();
      }

      // 4. Earth's Worldtube (The cylindrical ribbon through spacetime)
      var earthLeftX = state.earthX - state.earthRadius;
      var earthRightX = state.earthX + state.earthRadius;

      var ptBL = toScreen(earthLeftX, 0);
      var ptBR = toScreen(earthRightX, 0);
      var ptTL = toScreen(earthLeftX, currentT);
      var ptTR = toScreen(earthRightX, currentT);

      // Shaded Earth Worldtube Interior
      ctx.save();
      var tubeGrad = ctx.createLinearGradient(ptBL.x, 0, ptBR.x, 0);
      tubeGrad.addColorStop(0, 'rgba(29, 78, 216, 0.18)');
      tubeGrad.addColorStop(0.5, 'rgba(29, 78, 216, 0.38)');
      tubeGrad.addColorStop(1, 'rgba(29, 78, 216, 0.18)');
      ctx.fillStyle = tubeGrad;
      ctx.fillRect(ptTL.x, ptTL.y, ptTR.x - ptTL.x, ptBL.y - ptTL.y);

      // Worldtube boundaries
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = isSnapshot ? 1.4 : 2.2;
      ctx.beginPath();
      ctx.moveTo(ptBL.x, ptBL.y);
      ctx.lineTo(ptTL.x, ptTL.y);
      ctx.moveTo(ptBR.x, ptBR.y);
      ctx.lineTo(ptTR.x, ptTR.y);
      ctx.stroke();

      // Earth Center Worldline (spine)
      var ptCenterBottom = toScreen(state.earthX, 0);
      var ptCenterTop = toScreen(state.earthX, currentT);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(ptCenterBottom.x, ptCenterBottom.y);
      ctx.lineTo(ptCenterTop.x, ptCenterTop.y);
      ctx.stroke();
      ctx.restore();

      // Un-traversed Future Worldtube (faint ghost)
      if (currentT < tMax) {
        var ptFutureTL = toScreen(earthLeftX, tMax);
        var ptFutureTR = toScreen(earthRightX, tMax);
        ctx.save();
        ctx.strokeStyle = c.timeColor;
        ctx.globalAlpha = 0.2;
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ptTL.x, ptTL.y);
        ctx.lineTo(ptFutureTL.x, ptFutureTL.y);
        ctx.moveTo(ptTR.x, ptTR.y);
        ctx.lineTo(ptFutureTR.x, ptFutureTR.y);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Line of Simultaneity / Horizon at currentT
      ctx.save();
      ctx.strokeStyle = c.axisLine;
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([3, 3]);
      var nowL = toScreen(0, currentT);
      var nowR = toScreen(15, currentT);
      ctx.beginPath();
      ctx.moveTo(nowL.x, nowL.y);
      ctx.lineTo(nowR.x, nowR.y);
      ctx.stroke();
      ctx.restore();

      // Earth Present Dot
      var earthPresent = toScreen(state.earthX, currentT);
      drawGlowingDot(ctx, earthPresent.x, earthPresent.y, c.timeColor, isSnapshot ? 5 : 8);

      if (!isSnapshot) {
        drawLabelPill(ctx, 'Earth Worldtube (Curvature Source)', earthPresent.x, earthPresent.y - 18, {
          textColor: c.timeColor,
          bgColor: c.pillBg,
          borderColor: c.timeColor
        });

        drawLabelPill(ctx, 'Spacetime grid bends inward toward Earth\'s worldtube', width / 2, padTop + 8, {
          textColor: c.subtleText,
          bgColor: c.pillBg,
          borderColor: c.pillBorder
        });
      } else {
        drawLabelPill(ctx, 't = ' + currentT.toFixed(0) + 's', width / 2, height - 12, {
          font: 'bold 9px "JetBrains Mono", monospace',
          textColor: c.timeColor,
          paddingX: 4,
          paddingY: 2
        });
      }
    }

    function drawMain() {
      renderSpacetimeFrame(canvas, state.t, state.mass, false);
    }

    function drawSnapshots() {
      snapshotCards.forEach(function (card) {
        var snapT = parseFloat(card.getAttribute('data-time'));
        var snapCanvas = card.querySelector('canvas');
        if (snapCanvas) {
          renderSpacetimeFrame(snapCanvas, snapT, state.mass, true);
        }
      });
    }

    function drawAll() {
      drawMain();
      drawSnapshots();
    }

    function stepAnimation() {
      if (!state.isPlaying || !state.isVisible) return;
      state.t += 0.012;
      if (state.t > state.maxT) {
        state.t = 0;
      }
      updateReadouts();
      drawMain();
      requestAnimationFrame(stepAnimation);
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function () {
        state.t = parseFloat(sliderTime.value);
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        drawMain();
      });
    }

    if (sliderMass) {
      sliderMass.addEventListener('input', function () {
        state.mass = parseFloat(sliderMass.value);
        updateReadouts();
        drawAll();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying ? '<span>❚❚</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (state.isPlaying) requestAnimationFrame(stepAnimation);
      });
    }

    btnPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var targetT = parseFloat(chip.getAttribute('data-time'));
        state.t = targetT;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        drawMain();
      });
    });

    snapshotCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var snapT = parseFloat(card.getAttribute('data-time'));
        state.t = snapT;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        drawMain();
      });
    });

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(stepAnimation);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(drawAll);
    window.addEventListener('resize', drawAll);
    updateReadouts();
    drawAll();
  }

  // ==========================================================================
  // Universal 3D Camera Controller for Spacetime Loaf Visualizations
  // ==========================================================================
  function setup3DCameraController(container, canvas, initialAz, initialEl, onUpdate) {
    var defAz = initialAz !== undefined ? initialAz : -35 * Math.PI / 180;
    var defEl = initialEl !== undefined ? initialEl : 25 * Math.PI / 180;

    var cam = {
      azimuth: defAz,
      elevation: defEl,
      defaultAz: defAz,
      defaultEl: defEl
    };

    var sliderAz = container.querySelector('.slider-azimuth');
    var sliderEl = container.querySelector('.slider-elevation');
    var readoutAz = container.querySelector('.readout-cam-az');
    var readoutEl = container.querySelector('.readout-cam-el');
    var btnReset = container.querySelector('.btn-reset-view');
    var chipPresets = container.querySelectorAll('.chip-cam-preset');

    function syncControls() {
      if (sliderAz) sliderAz.value = cam.azimuth.toFixed(2);
      if (sliderEl) sliderEl.value = cam.elevation.toFixed(2);
      if (readoutAz) readoutAz.textContent = Math.round((cam.azimuth * 180) / Math.PI) + '°';
      if (readoutEl) readoutEl.textContent = Math.round((cam.elevation * 180) / Math.PI) + '°';
    }

    function setAngles(az, el) {
      cam.azimuth = az;
      cam.elevation = Math.max(-0.35, Math.min(1.30, el));
      while (cam.azimuth > Math.PI) cam.azimuth -= Math.PI * 2;
      while (cam.azimuth < -Math.PI) cam.azimuth += Math.PI * 2;
      syncControls();
      if (onUpdate) onUpdate();
    }

    if (sliderAz) {
      sliderAz.addEventListener('input', function (e) {
        cam.azimuth = parseFloat(e.target.value);
        if (readoutAz) readoutAz.textContent = Math.round((cam.azimuth * 180) / Math.PI) + '°';
        if (onUpdate) onUpdate();
      });
    }

    if (sliderEl) {
      sliderEl.addEventListener('input', function (e) {
        cam.elevation = parseFloat(e.target.value);
        if (readoutEl) readoutEl.textContent = Math.round((cam.elevation * 180) / Math.PI) + '°';
        if (onUpdate) onUpdate();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        setAngles(cam.defaultAz, cam.defaultEl);
        for (var i = 0; i < chipPresets.length; i++) {
          chipPresets[i].classList.remove('active');
          if (chipPresets[i].getAttribute('data-preset') === 'default' || i === 0) {
            chipPresets[i].classList.add('active');
          }
        }
      });
    }

    for (var p = 0; p < chipPresets.length; p++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipPresets.length; j++) chipPresets[j].classList.remove('active');
          btn.classList.add('active');
          var az = parseFloat(btn.getAttribute('data-az'));
          var el = parseFloat(btn.getAttribute('data-el'));
          setAngles(az, el);
        });
      })(chipPresets[p]);
    }

    // Direct canvas mouse & touch drag
    var isDragging = false;
    var lastX = 0, lastY = 0;
    var viewportEl = canvas.closest('.canvas-viewport') || container;

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      if (viewportEl) viewportEl.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      setAngles(cam.azimuth + dx * 0.008, cam.elevation + dy * 0.008);
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        if (viewportEl) viewportEl.classList.remove('is-dragging');
      }
    });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastX;
      var dy = e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      setAngles(cam.azimuth + dx * 0.008, cam.elevation + dy * 0.008);
    }, { passive: true });

    window.addEventListener('touchend', function () { isDragging = false; });

    syncControls();
    return cam;
  }

  // ==========================================================================
  // 3. WIDGET 3: THE FALLING APPLE (3D SPACETIME LOAF & CURVED GEODESIC)
  // ==========================================================================
  function initWidgetAppleCurvedFuture(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var btnReset = container.querySelector('.btn-reset');
    var btnPresetChips = container.querySelectorAll('.preset-apple-chip');

    // Readout elements
    var elTime = container.querySelector('.readout-time');
    var elDistance = container.querySelector('.readout-distance');
    var elVelocity = container.querySelector('.readout-velocity');
    var elAccel = container.querySelector('.readout-accel');
    var elDeflection = container.querySelector('.readout-deflection');
    var readoutSliceTag = container.querySelector('.readout-slice-tag');

    // View switcher & feature toggle elements
    var btnViewModes = container.querySelectorAll('.btn-view-mode');
    var orbitControlsContainer = container.querySelector('.orbit-controls-container');
    var chkSlice = container.querySelector('.toggle-slice');
    var chkGhost = container.querySelector('.toggle-ghost');
    var chkVector = container.querySelector('.toggle-vector');
    var chkFabric = container.querySelector('.toggle-fabric');
    var viewportEl = container.querySelector('.canvas-viewport');

    var state = {
      viewMode: '3d',          // '3d' (Spacetime Loaf) or '2d' (Coordinate slice)
      t: parseFloat(sliderTime ? sliderTime.value : 1.2) || 1.2,
      maxT: 3.0,
      earthX: 7.5,
      earthRadius: 1.8,
      earthSurfaceLeftX: 5.7,  // 7.5 - 1.8
      earthSurfaceRightX: 9.3, // 7.5 + 1.8
      initialX: 4.0,           // Apple placed at line x = 4.0
      crashTime: 2.48,         // Crashes into earth worldtube at exactly 2.48s
      mass: 1.0,               // Earth weight (calibrated to 9.25 x 10^24 kg)
      showSlice: true,
      showGhost: true,
      showVector: true,
      showFabric: true,
      isPlaying: false,
      isVisible: true
    };

    // 3D Camera Controller for Spacetime Loaf
    var cam = setup3DCameraController(container, canvas, -35 * Math.PI / 180, 25 * Math.PI / 180, function () {
      if (state.viewMode === '3d') draw();
    });

    /**
     * Apple position and telemetry at coordinate time tVal.
     * Apple starts at x0 = 4.0 with v = 0.
     * Reaches earth worldtube boundary x = 5.7 at t = 2.48s.
     */
    function getAppleState(tVal) {
      var x0 = state.initialX;
      var xCrash = state.earthSurfaceLeftX; // 5.7
      var tCrash = state.crashTime;         // 2.48
      var deltaTotal = xCrash - x0;         // 1.7
      var aCrash = (2.0 * deltaTotal) / Math.pow(tCrash, 2.0); // ~0.5528

      var hasLanded = tVal >= tCrash;
      var curX, vel, properAccel;

      if (!hasLanded) {
        curX = x0 + 0.5 * aCrash * Math.pow(tVal, 2.0);
        vel = aCrash * tVal;
        properAccel = 0.0; // 0 g in free fall!
      } else {
        curX = xCrash;
        vel = 0.0;
        properAccel = 9.8; // surface push force!
      }

      var altitude = Math.max(0, xCrash - curX);
      var deflection = curX - x0;

      return {
        x: curX,
        v: vel,
        altitude: altitude,
        deflection: deflection,
        hasLanded: hasLanded,
        properAccel: properAccel,
        tCrash: tCrash
      };
    }

    function updateReadouts() {
      var ap = getAppleState(state.t);
      if (sliderTime) sliderTime.value = state.t.toFixed(2);

      if (elTime) elTime.textContent = state.t.toFixed(2) + ' s';
      if (elDistance) {
        if (ap.hasLanded) {
          elDistance.innerHTML = '<span style="color:var(--color-danger); font-weight:700;">0.00 m (Landed on Surface)</span>';
        } else {
          elDistance.textContent = ap.altitude.toFixed(2) + ' m';
        }
      }
      if (elVelocity) elVelocity.textContent = (ap.v * 9.8).toFixed(1) + ' m/s';
      if (elDeflection) elDeflection.textContent = ap.deflection.toFixed(2) + ' m';

      if (elAccel) {
        if (!ap.hasLanded) {
          elAccel.innerHTML = '<span style="color:var(--color-emerald); font-weight:700;">0.00 m/s² (Pure Weightless Free Fall)</span>';
        } else {
          elAccel.innerHTML = '<span style="color:var(--color-danger); font-weight:700;">+9.80 m/s² (Surface Push Force)</span>';
        }
      }

      if (readoutSliceTag) {
        readoutSliceTag.textContent = 'ct = ' + (state.t * 3.0).toFixed(1) + ' m (t = ' + state.t.toFixed(2) + ' s)';
      }

      btnPresetChips.forEach(function (chip) {
        var chipT = parseFloat(chip.getAttribute('data-time'));
        if (Math.abs(chipT - state.t) < 0.06) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    // ========================================================================
    // 3D SPACETIME LOAF RENDERING
    // ========================================================================
    function draw3DLoaf(ctx, width, height, c) {
      var cx = width * 0.50;
      var cy = height * 0.65;
      var scale = Math.min(width * 0.082, height * 0.16);

      function p3(x, y, z) {
        var cosAz = Math.cos(cam.azimuth);
        var sinAz = Math.sin(cam.azimuth);
        var xRot = x * cosAz - y * sinAz;
        var yRot = x * sinAz + y * cosAz;

        var cosEl = Math.cos(cam.elevation);
        var sinEl = Math.sin(cam.elevation);
        var yFinal = yRot * cosEl - z * sinEl;
        var zFinal = yRot * sinEl + z * cosEl;

        return {
          x: cx + xRot * scale,
          y: cy - zFinal * scale,
          depth: yFinal
        };
      }

      var H_loaf = 2.7; // Loaf vertical height
      var zNow = (state.t / state.maxT) * H_loaf;
      var xRange = 5.5;
      var yRange = 4.0;
      var curAp = getAppleState(state.t);

      // 1. Spacetime Loaf Ground Grid & Curvature (z = 0)
      ctx.save();
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1.0;

      // Concentric circles on the ground
      if (state.showFabric) {
        var radii = [1.8, 3.0, 4.3];
        radii.forEach(function (rad) {
          ctx.beginPath();
          var segs = 36;
          for (var si = 0; si <= segs; si++) {
            var ang = (si / segs) * Math.PI * 2;
            var pt = p3(rad * Math.cos(ang), rad * Math.sin(ang), 0);
            if (si === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        });
      }

      // X grid lines across space with optional curved sagging funnel
      for (var gx = -5.0; gx <= 5.01; gx += 1.0) {
        ctx.beginPath();
        var ySteps = 20;
        for (var sy = 0; sy <= ySteps; sy++) {
          var gyVal = -yRange + (sy / ySteps) * (2 * yRange);
          var warpX = gx;
          var warpZ = 0;
          if (state.showFabric) {
            var distR = Math.sqrt(gx * gx + gyVal * gyVal);
            var falloff = 1.0 / (1.0 + Math.pow(distR / 2.2, 2.0));
            var signX = gx > 0 ? 1 : (gx < 0 ? -1 : 0);
            warpX = gx - signX * 0.35 * falloff;
            warpZ = -0.32 * falloff;
          }
          var ptL = p3(warpX, gyVal, warpZ);
          if (sy === 0) ctx.moveTo(ptL.x, ptL.y);
          else ctx.lineTo(ptL.x, ptL.y);
        }
        ctx.stroke();
      }

      // Y grid lines across space
      for (var gy = -3.5; gy <= 3.51; gy += 1.0) {
        ctx.beginPath();
        var xSteps = 24;
        for (var sx = 0; sx <= xSteps; sx++) {
          var gxVal = -xRange + (sx / xSteps) * (2 * xRange);
          var warpY = gy;
          var warpZ_y = 0;
          if (state.showFabric) {
            var distR_y = Math.sqrt(gxVal * gxVal + gy * gy);
            var falloff_y = 1.0 / (1.0 + Math.pow(distR_y / 2.2, 2.0));
            var signY = gy > 0 ? 1 : (gy < 0 ? -1 : 0);
            warpY = gy - signY * 0.35 * falloff_y;
            warpZ_y = -0.32 * falloff_y;
          }
          var ptLy = p3(gxVal, warpY, warpZ_y);
          if (sx === 0) ctx.moveTo(ptLy.x, ptLy.y);
          else ctx.lineTo(ptLy.x, ptLy.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 2. Corner Pillars & Top Frame of the Spacetime Loaf block
      ctx.save();
      ctx.strokeStyle = c.borderMedium;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      var corners = [
        { x: -xRange, y: -yRange },
        { x: xRange, y: -yRange },
        { x: xRange, y: yRange },
        { x: -xRange, y: yRange }
      ];
      corners.forEach(function (cn) {
        var pBot = p3(cn.x, cn.y, 0);
        var pTop = p3(cn.x, cn.y, H_loaf);
        ctx.beginPath();
        ctx.moveTo(pBot.x, pBot.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.stroke();
      });
      ctx.beginPath();
      for (var ci = 0; ci <= corners.length; ci++) {
        var cnP = corners[ci % corners.length];
        var ptTop = p3(cnP.x, cnP.y, H_loaf);
        if (ci === 0) ctx.moveTo(ptTop.x, ptTop.y);
        else ctx.lineTo(ptTop.x, ptTop.y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Axes
      var pOrigin = p3(-xRange, -yRange, 0);
      var pX1 = p3(-xRange + 3.2, -yRange, 0);
      var pX2 = p3(-xRange, -yRange + 2.8, 0);
      var pTime = p3(-xRange, -yRange, H_loaf + 0.35);

      drawVector(ctx, pOrigin.x, pOrigin.y, pX1.x, pX1.y, { color: c.axisLine, lineWidth: 1.8, arrowLength: 7 });
      drawVector(ctx, pOrigin.x, pOrigin.y, pX2.x, pX2.y, { color: c.axisLine, lineWidth: 1.8, arrowLength: 7 });
      drawVector(ctx, pOrigin.x, pOrigin.y, pTime.x, pTime.y, { color: c.timeColor, lineWidth: 2.2, arrowLength: 8 });

      drawLabelPill(ctx, 'Space x₁', pX1.x + 24, pX1.y, { textColor: c.axisLabel, font: '10px "JetBrains Mono"' });
      drawLabelPill(ctx, 'Space x₂', pX2.x, pX2.y + 14, { textColor: c.axisLabel, font: '10px "JetBrains Mono"' });
      drawLabelPill(ctx, 'Time ct', pTime.x, pTime.y - 12, { textColor: c.timeColor, font: 'bold 10px "JetBrains Mono"' });

      // 4. Earth's Cylindrical Worldtube (Radius R = 1.8)
      var R_earth = state.earthRadius; // 1.8
      var numTubeSides = 24;

      ctx.save();
      var tubeFill = c.isLight ? 'rgba(29, 78, 216, 0.12)' : 'rgba(56, 189, 248, 0.16)';
      var tubeStroke = c.isLight ? 'rgba(29, 78, 216, 0.28)' : 'rgba(56, 189, 248, 0.32)';

      var quads = [];
      for (var ti = 0; ti < numTubeSides; ti++) {
        var a1 = (ti / numTubeSides) * Math.PI * 2;
        var a2 = ((ti + 1) / numTubeSides) * Math.PI * 2;
        var b1 = p3(R_earth * Math.cos(a1), R_earth * Math.sin(a1), 0);
        var b2 = p3(R_earth * Math.cos(a2), R_earth * Math.sin(a2), 0);
        var t1 = p3(R_earth * Math.cos(a1), R_earth * Math.sin(a1), H_loaf);
        var t2 = p3(R_earth * Math.cos(a2), R_earth * Math.sin(a2), H_loaf);
        var midDepth = (b1.depth + b2.depth) / 2;
        quads.push({ b1: b1, b2: b2, t1: t1, t2: t2, depth: midDepth });
      }

      quads.sort(function (qa, qb) { return qb.depth - qa.depth; });

      quads.forEach(function (qd) {
        ctx.fillStyle = tubeFill;
        ctx.strokeStyle = tubeStroke;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(qd.b1.x, qd.b1.y);
        ctx.lineTo(qd.b2.x, qd.b2.y);
        ctx.lineTo(qd.t2.x, qd.t2.y);
        ctx.lineTo(qd.t1.x, qd.t1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Earth center worldline spine
      var pCenterBot = p3(0, 0, 0);
      var pCenterTop = p3(0, 0, H_loaf);
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(pCenterBot.x, pCenterBot.y);
      ctx.lineTo(pCenterTop.x, pCenterTop.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Latitude rings on cylinder at t = 0, 1, 2, 3
      [0, 1.0, 2.0, 3.0].forEach(function (tMark) {
        var zMark = (tMark / 3.0) * H_loaf;
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = tMark === 0 ? 1.5 : 0.9;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        for (var mi = 0; mi <= numTubeSides; mi++) {
          var ma = (mi / numTubeSides) * Math.PI * 2;
          var mp = p3(R_earth * Math.cos(ma), R_earth * Math.sin(ma), zMark);
          if (mi === 0) ctx.moveTo(mp.x, mp.y);
          else ctx.lineTo(mp.x, mp.y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // Surface Boundary Silhouette Lines at x = -1.8 and x = +1.8
      var pSurfLeftBot = p3(-R_earth, 0, 0);
      var pSurfLeftTop = p3(-R_earth, 0, H_loaf);
      var pSurfRightBot = p3(R_earth, 0, 0);
      var pSurfRightTop = p3(R_earth, 0, H_loaf);

      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pSurfLeftBot.x, pSurfLeftBot.y);
      ctx.lineTo(pSurfLeftTop.x, pSurfLeftTop.y);
      ctx.moveTo(pSurfRightBot.x, pSurfRightBot.y);
      ctx.lineTo(pSurfRightTop.x, pSurfRightTop.y);
      ctx.stroke();
      ctx.restore();

      // Earth worldtube label
      var pEarthLabel = p3(0, 0, H_loaf + 0.12);
      drawLabelPill(ctx, 'Earth Worldtube (R = 1.8m)', pEarthLabel.x, pEarthLabel.y - 12, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.timeColor
      });

      // 5. Flat Spacetime Baseline (Ghost Straight Path straight up from x = -3.5)
      var appleStartX = -3.5; // (4.0 - 7.5)
      if (state.showGhost) {
        ctx.save();
        ctx.strokeStyle = c.axisLine;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2.0;

        var pGhostBot = p3(appleStartX, 0, 0);
        var pGhostTop = p3(appleStartX, 0, H_loaf);
        ctx.beginPath();
        ctx.moveTo(pGhostBot.x, pGhostBot.y);
        ctx.lineTo(pGhostTop.x, pGhostTop.y);
        ctx.stroke();

        var pGhostNow = p3(appleStartX, 0, zNow);
        ctx.beginPath();
        ctx.arc(pGhostNow.x, pGhostNow.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = c.subtleText;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        drawLabelPill(ctx, 'Flat Path: Straight Up (x = 4.0m)', pGhostTop.x - 30, pGhostTop.y - 12, {
          textColor: c.subtleText,
          bgColor: c.pillBg,
          borderColor: c.pillBorder
        });
      }

      // 6. Slicing Plane of "Now" (t = const)
      if (state.showSlice) {
        ctx.save();
        var s1 = p3(-xRange, -yRange, zNow);
        var s2 = p3(xRange, -yRange, zNow);
        var s3 = p3(xRange, yRange, zNow);
        var s4 = p3(-xRange, yRange, zNow);

        ctx.fillStyle = c.isLight ? 'rgba(29, 78, 216, 0.10)' : 'rgba(56, 189, 248, 0.14)';
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y);
        ctx.lineTo(s4.x, s4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Earth's Circular Cross-Section Disk on Slice of "Now"
        ctx.fillStyle = c.isLight ? 'rgba(29, 78, 216, 0.32)' : 'rgba(56, 189, 248, 0.38)';
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        var sliceDiskSegs = 36;
        for (var di = 0; di <= sliceDiskSegs; di++) {
          var dang = (di / sliceDiskSegs) * Math.PI * 2;
          var dpt = p3(R_earth * Math.cos(dang), R_earth * Math.sin(dang), zNow);
          if (di === 0) ctx.moveTo(dpt.x, dpt.y);
          else ctx.lineTo(dpt.x, dpt.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Disk center dot
        var pDiskCenter = p3(0, 0, zNow);
        ctx.beginPath();
        ctx.arc(pDiskCenter.x, pDiskCenter.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = c.timeColor;
        ctx.fill();

        // Slice title label pill
        drawLabelPill(ctx, 'Slice of "Now" (t = ' + state.t.toFixed(2) + 's)', s1.x + 36, s1.y - 12, {
          textColor: c.timeColor,
          bgColor: c.pillBg,
          borderColor: c.timeColor
        });

        // Spatial Distance Gap line on the slice
        var cur3DX = appleStartX + curAp.deflection;
        var pCurAppleSlice = p3(cur3DX, 0, zNow);
        var pSurfLeftSlice = p3(-R_earth, 0, zNow);

        if (!curAp.hasLanded) {
          ctx.strokeStyle = c.spaceColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(pCurAppleSlice.x, pCurAppleSlice.y);
          ctx.lineTo(pSurfLeftSlice.x, pSurfLeftSlice.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pCurAppleSlice.x, pCurAppleSlice.y - 4);
          ctx.lineTo(pCurAppleSlice.x, pCurAppleSlice.y + 4);
          ctx.moveTo(pSurfLeftSlice.x, pSurfLeftSlice.y - 4);
          ctx.lineTo(pSurfLeftSlice.x, pSurfLeftSlice.y + 4);
          ctx.stroke();

          var midGapX = (pCurAppleSlice.x + pSurfLeftSlice.x) / 2;
          var midGapY = (pCurAppleSlice.y + pSurfLeftSlice.y) / 2;
          drawLabelPill(ctx, 'Gap: ' + curAp.altitude.toFixed(2) + 'm', midGapX, midGapY - 14, {
            textColor: c.spaceColor,
            bgColor: c.pillBg,
            borderColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono"'
          });
        }
        ctx.restore();
      }

      // 7. Deflection from Straight Up
      if (state.showGhost && curAp.deflection > 0.08) {
        var pGhostCurrent = p3(appleStartX, 0, zNow);
        var pAppleCurrent = p3(appleStartX + curAp.deflection, 0, zNow);
        ctx.save();
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pGhostCurrent.x, pGhostCurrent.y);
        ctx.lineTo(pAppleCurrent.x, pAppleCurrent.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pGhostCurrent.x, pGhostCurrent.y - 4);
        ctx.lineTo(pGhostCurrent.x, pGhostCurrent.y + 4);
        ctx.moveTo(pAppleCurrent.x, pAppleCurrent.y - 4);
        ctx.lineTo(pAppleCurrent.x, pAppleCurrent.y + 4);
        ctx.stroke();
        ctx.restore();

        var midDefX = (pGhostCurrent.x + pAppleCurrent.x) / 2;
        var midDefY = (pGhostCurrent.y + pAppleCurrent.y) / 2;
        drawLabelPill(ctx, 'Δx = ' + curAp.deflection.toFixed(2) + 'm', midDefX, midDefY + 16, {
          textColor: c.invariantColor,
          bgColor: c.pillBg,
          borderColor: c.invariantColor,
          font: 'bold 10px "JetBrains Mono"'
        });
      }

      // 8. Apple's Curved Geodesic Worldline in 3D
      var numTrackPts = 80;
      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.globalAlpha = 0.32;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var fpi = 0; fpi <= numTrackPts; fpi++) {
        var tTrack = (fpi / numTrackPts) * state.maxT;
        var apTrack = getAppleState(tTrack);
        var xTrack = appleStartX + apTrack.deflection;
        var zTrack = (tTrack / state.maxT) * H_loaf;
        var ptTrack = p3(xTrack, 0, zTrack);
        if (fpi === 0) ctx.moveTo(ptTrack.x, ptTrack.y);
        else ctx.lineTo(ptTrack.x, ptTrack.y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      var travPts = Math.max(4, Math.round(numTrackPts * (state.t / state.maxT)));
      for (var tpi = 0; tpi <= travPts; tpi++) {
        var tTrav = (tpi / travPts) * state.t;
        var apTrav = getAppleState(tTrav);
        var xTrav = appleStartX + apTrav.deflection;
        var zTrav = (tTrav / state.maxT) * H_loaf;
        var ptTrav = p3(xTrav, 0, zTrav);
        if (tpi === 0) ctx.moveTo(ptTrav.x, ptTrav.y);
        else ctx.lineTo(ptTrav.x, ptTrav.y);
      }
      ctx.stroke();
      ctx.restore();

      // Impact Marker at t = 2.48s
      if (state.t >= state.crashTime) {
        var zCrash = (state.crashTime / state.maxT) * H_loaf;
        var pCrash = p3(-R_earth, 0, zCrash);

        ctx.save();
        ctx.beginPath();
        ctx.arc(pCrash.x, pCrash.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = c.photonColor;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        drawLabelPill(ctx, 'CRASH: Surface Impact (t = 2.48s)', pCrash.x - 76, pCrash.y, {
          textColor: c.photonColor,
          bgColor: c.pillBg,
          borderColor: c.photonColor
        });
      }

      // Apple Current Position Dot
      var cur3DAppleX = appleStartX + curAp.deflection;
      var pAppleNow = p3(cur3DAppleX, 0, zNow);
      drawGlowingDot(ctx, pAppleNow.x, pAppleNow.y, c.spaceColor, 7);

      var appleLabelText = curAp.hasLanded ? 'Apple on Ground (Resting)' : 'Apple (Free Fall, a = 0.00 m/s²)';
      drawLabelPill(ctx, appleLabelText, pAppleNow.x - 30, pAppleNow.y + 18, {
        textColor: c.spaceColor,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });

      // 9. Future Tangent Heading Vector (4-Velocity Heading)
      if (state.showVector) {
        var v3DX, v3DZ;
        if (!curAp.hasLanded) {
          v3DX = curAp.v * 0.45;
          v3DZ = 0.45;
        } else {
          v3DX = 0;
          v3DZ = 0.45;
        }

        var pVecTip = p3(cur3DAppleX + v3DX, 0, zNow + v3DZ);
        drawVector(ctx, pAppleNow.x, pAppleNow.y, pVecTip.x, pVecTip.y, {
          color: c.photonColor,
          lineWidth: 2.8,
          arrowLength: 9
        });

        var vecLabel;
        if (state.t < 0.05) {
          vecLabel = 'Initial Heading Points Strictly Straight Up (v = 0)';
        } else if (!curAp.hasLanded) {
          vecLabel = 'Future Vector Tilts Into Curved Geometry';
        } else {
          vecLabel = 'At Rest on Surface (Surface Push: +9.80 m/s²)';
        }

        drawLabelPill(ctx, vecLabel, pVecTip.x + 18, pVecTip.y - 10, {
          textColor: c.photonColor,
          bgColor: c.pillBg,
          borderColor: c.photonColor
        });
      }

      // Top Header pill
      drawLabelPill(ctx, '3D Spacetime Loaf · Drag canvas or adjust sliders to orbit camera', width / 2, 22, {
        textColor: c.subtleText,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });
    }

    // ========================================================================
    // 2D COORDINATE SPACETIME RENDERING (CROSS-SECTION THROUGH LOAF)
    // ========================================================================
    function draw2DCoordinate(ctx, width, height, c) {
      var padLeft = 55, padRight = 35, padBottom = 45, padTop = 35;
      var plotW = width - padLeft - padRight;
      var plotH = height - padBottom - padTop;

      var xMin = 0, xMax = 15;
      var tMin = 0, tMax = state.maxT;

      function toScreen(x, t) {
        return {
          x: padLeft + ((x - xMin) / (xMax - xMin)) * plotW,
          y: height - padBottom - ((t - tMin) / (tMax - tMin)) * plotH
        };
      }

      var effectiveMass = state.mass * (0.25 + 0.75 * (state.t / state.maxT));

      // 1. Warped 2D Grid
      if (state.showFabric) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, plotW, plotH);
        ctx.clip();

        ctx.strokeStyle = c.gridLine;
        ctx.lineWidth = 1.0;

        var numX = 14;
        var numT = 10;
        var stepX = (xMax - xMin) / numX;
        var stepT = (tMax - tMin) / numT;
        var samples = 45;

        // Space Lines bow inward toward Earth's worldtube
        for (var ix = 0; ix <= numX; ix++) {
          var startX = xMin + ix * stepX;
          var dx0 = startX - state.earthX;
          var sign = dx0 > 0 ? 1 : (dx0 < 0 ? -1 : 0);
          var dist = Math.abs(dx0);

          ctx.beginPath();
          for (var s = 0; s <= samples; s++) {
            var tVal = tMin + (s / samples) * (tMax - tMin);
            var falloff = 1.0 / (1.0 + Math.pow(dist / 3.0, 2.0));
            var pull = 0.5 * effectiveMass * falloff * 1.3052 * Math.pow(tVal, 2.0);
            var warpedX = startX - sign * pull;

            if (sign > 0) warpedX = Math.max(state.earthSurfaceRightX, warpedX);
            if (sign < 0) warpedX = Math.min(state.earthSurfaceLeftX, warpedX);

            var pt = toScreen(warpedX, tVal);
            if (s === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        // Time Lines sag downward near Earth
        var minOrigT = tMin - 0.6;
        var maxOrigT = tMax + 2.5;

        for (var origT = minOrigT; origT <= maxOrigT; origT += stepT) {
          ctx.beginPath();
          for (var s2 = 0; s2 <= samples; s2++) {
            var xVal = xMin + (s2 / samples) * (xMax - xMin);
            var dist2 = Math.abs(xVal - state.earthX);
            var falloff2 = 1.0 / (1.0 + Math.pow(dist2 / 2.8, 2.0));
            var sag = effectiveMass * falloff2 * 1.30;
            var warpedT = origT - sag;

            var pt2 = toScreen(xVal, warpedT);
            if (s2 === 0) ctx.moveTo(pt2.x, pt2.y);
            else ctx.lineTo(pt2.x, pt2.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Gravitational Well Gradient Overlay
      if (effectiveMass > 0.05) {
        ctx.save();
        var centerScreen = toScreen(state.earthX, state.t / 2);
        var radiusScreen = (state.earthRadius / (xMax - xMin)) * plotW * 2.8;
        var grad = ctx.createRadialGradient(centerScreen.x, centerScreen.y, 5, centerScreen.x, centerScreen.y, radiusScreen);
        grad.addColorStop(0, c.timeColorSubtle);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(padLeft, padTop, plotW, plotH);
        ctx.restore();
      }

      // 3. Axes
      drawAxes(ctx, padLeft, height - padBottom, width - padRight, padTop, 'Space x', 'Time ct');

      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.textAlign = 'center';
      for (var tx = 0; tx <= 15; tx += 3) {
        var pX = toScreen(tx, 0);
        ctx.fillText(tx + 'm', pX.x, height - padBottom + 16);
      }
      ctx.textAlign = 'right';
      for (var tt = 0; tt <= 3; tt += 1) {
        var pT = toScreen(0, tt);
        ctx.fillText(tt.toFixed(1) + 's', padLeft - 10, pT.y + 4);
      }
      ctx.restore();

      // 4. Earth's Worldtube
      var earthLeftX = state.earthSurfaceLeftX;
      var earthRightX = state.earthSurfaceRightX;

      var ptBL = toScreen(earthLeftX, 0);
      var ptBR = toScreen(earthRightX, 0);
      var ptTL = toScreen(earthLeftX, state.t);
      var ptTR = toScreen(earthRightX, state.t);

      ctx.save();
      var tubeGrad = ctx.createLinearGradient(ptBL.x, 0, ptBR.x, 0);
      tubeGrad.addColorStop(0, 'rgba(29, 78, 216, 0.18)');
      tubeGrad.addColorStop(0.5, 'rgba(29, 78, 216, 0.38)');
      tubeGrad.addColorStop(1, 'rgba(29, 78, 216, 0.18)');
      ctx.fillStyle = tubeGrad;
      ctx.fillRect(ptTL.x, ptTL.y, ptTR.x - ptTL.x, ptBL.y - ptTL.y);

      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ptBL.x, ptBL.y);
      ctx.lineTo(ptTL.x, ptTL.y);
      ctx.moveTo(ptBR.x, ptBR.y);
      ctx.lineTo(ptTR.x, ptTR.y);
      ctx.stroke();

      var ptCenterBottom = toScreen(state.earthX, 0);
      var ptCenterTop = toScreen(state.earthX, state.t);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(ptCenterBottom.x, ptCenterBottom.y);
      ctx.lineTo(ptCenterTop.x, ptCenterTop.y);
      ctx.stroke();
      ctx.restore();

      if (state.t < tMax) {
        var ptFutureTL = toScreen(earthLeftX, tMax);
        var ptFutureTR = toScreen(earthRightX, tMax);
        ctx.save();
        ctx.strokeStyle = c.timeColor;
        ctx.globalAlpha = 0.2;
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ptTL.x, ptTL.y);
        ctx.lineTo(ptFutureTL.x, ptFutureTL.y);
        ctx.moveTo(ptTR.x, ptTR.y);
        ctx.lineTo(ptFutureTR.x, ptFutureTR.y);
        ctx.stroke();
        ctx.restore();
      }

      drawLabelPill(ctx, 'Earth Worldtube (Surface x = 5.7m)', toScreen(state.earthX, padTop / 2 + 10).x, padTop + 14, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.timeColor
      });

      // 5. Flat baseline straight up (x = 4.0)
      if (state.showGhost) {
        var ghost0 = toScreen(state.initialX, 0);
        var ghostMax = toScreen(state.initialX, state.maxT);
        ctx.save();
        ctx.strokeStyle = c.axisLine;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(ghost0.x, ghost0.y);
        ctx.lineTo(ghostMax.x, ghostMax.y);
        ctx.stroke();
        ctx.restore();

        drawLabelPill(ctx, 'Flat Path: Straight Up (x = 4.0)', ghostMax.x, padTop + 14, {
          textColor: c.subtleText,
          bgColor: c.pillBg,
          borderColor: c.pillBorder
        });
      }

      // 6. Apple's curved geodesic track
      var numPathSamples = 80;
      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.globalAlpha = 0.26;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var kp = 0; kp <= numPathSamples; kp++) {
        var tp = (kp / numPathSamples) * state.maxT;
        var apP = getAppleState(tp);
        var ptTrack = toScreen(apP.x, tp);
        if (kp === 0) ctx.moveTo(ptTrack.x, ptTrack.y);
        else ctx.lineTo(ptTrack.x, ptTrack.y);
      }
      ctx.stroke();
      ctx.restore();

      // Traversed worldline
      var curAp2D = getAppleState(state.t);
      var curScreen = toScreen(curAp2D.x, state.t);

      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      var traversedSamples = Math.max(5, Math.round(numPathSamples * (state.t / state.maxT)));
      for (var kp2 = 0; kp2 <= traversedSamples; kp2++) {
        var tp2 = (kp2 / traversedSamples) * state.t;
        var apP2 = getAppleState(tp2);
        var ptTrav = toScreen(apP2.x, tp2);
        if (kp2 === 0) ctx.moveTo(ptTrav.x, ptTrav.y);
        else ctx.lineTo(ptTrav.x, ptTrav.y);
      }
      ctx.stroke();
      ctx.restore();

      // Deflection arrow
      if (state.showGhost && curAp2D.deflection > 0.08) {
        var ghostScreenNow = toScreen(state.initialX, state.t);
        ctx.save();
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ghostScreenNow.x, ghostScreenNow.y);
        ctx.lineTo(curScreen.x, curScreen.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ghostScreenNow.x, ghostScreenNow.y - 4);
        ctx.lineTo(ghostScreenNow.x, ghostScreenNow.y + 4);
        ctx.moveTo(curScreen.x, curScreen.y - 4);
        ctx.lineTo(curScreen.x, curScreen.y + 4);
        ctx.stroke();
        ctx.restore();

        var midDeflectX = (ghostScreenNow.x + curScreen.x) / 2;
        drawLabelPill(ctx, 'Δx = ' + curAp2D.deflection.toFixed(2) + 'm', midDeflectX, curScreen.y - 14, {
          font: 'bold 10px "JetBrains Mono", monospace',
          textColor: c.invariantColor,
          bgColor: c.pillBg,
          borderColor: c.invariantColor
        });
      }

      // Impact Event Marker
      if (state.t >= state.crashTime) {
        var impactPt = toScreen(state.earthSurfaceLeftX, state.crashTime);
        ctx.save();
        ctx.beginPath();
        ctx.arc(impactPt.x, impactPt.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = c.photonColor;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        drawLabelPill(ctx, 'CRASH: Impact at t = 2.48s', impactPt.x - 72, impactPt.y, {
          textColor: c.photonColor,
          bgColor: c.pillBg,
          borderColor: c.photonColor
        });
      }

      // Local Future Tangent Vector
      if (state.showVector) {
        var vecScale = 32;
        var dirX, dirY;

        if (!curAp2D.hasLanded) {
          var vx = curAp2D.v;
          var vt = 1.0;
          var norm = Math.sqrt(vx * vx + vt * vt);
          dirX = vx / norm;
          dirY = vt / norm;
        } else {
          dirX = 0;
          dirY = 1.0;
        }

        var tipX = curScreen.x + dirX * vecScale * 1.4;
        var tipY = curScreen.y - dirY * vecScale * 1.4;

        drawVector(ctx, curScreen.x, curScreen.y, tipX, tipY, {
          color: c.photonColor,
          lineWidth: 2.8,
          mode: 'velocity',
          arrowLength: 10
        });

        var vectorLabel;
        if (state.t < 0.05) {
          vectorLabel = 'Heading Points Strictly Straight Up (v = 0)';
        } else if (!curAp2D.hasLanded) {
          vectorLabel = 'Future Vector Tilts Toward Earth';
        } else {
          vectorLabel = 'At Rest on Ground (Pointing Up)';
        }

        drawLabelPill(ctx, vectorLabel, tipX + (dirX >= 0 ? 16 : -16), tipY, {
          textColor: c.photonColor,
          bgColor: c.pillBg,
          borderColor: c.photonColor
        });
      }

      // Apple Dot
      drawGlowingDot(ctx, curScreen.x, curScreen.y, c.spaceColor, 7);

      var labelText = curAp2D.hasLanded ? 'Apple on Ground (Resting)' : 'Apple (Released at x = 4.0)';
      drawLabelPill(ctx, labelText, curScreen.x - 24, curScreen.y + 18, {
        textColor: c.spaceColor,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });

      drawLabelPill(ctx, '2D Coordinate Slice (x vs ct) · Side view through Spacetime Loaf', width / 2, padTop + 8, {
        textColor: c.subtleText,
        bgColor: c.pillBg,
        borderColor: c.pillBorder
      });
    }

    // ========================================================================
    // MAIN DRAW DISPATCHER
    // ========================================================================
    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      if (state.viewMode === '3d') {
        draw3DLoaf(ctx, width, height, c);
      } else {
        draw2DCoordinate(ctx, width, height, c);
      }
    }

    function stepAnimation() {
      if (!state.isPlaying || !state.isVisible) return;
      state.t += 0.012;
      if (state.t > state.maxT) {
        state.t = 0;
      }
      updateReadouts();
      draw();
      requestAnimationFrame(stepAnimation);
    }

    // Scrubbers & Buttons Event Listeners
    if (sliderTime) {
      sliderTime.addEventListener('input', function () {
        state.t = parseFloat(sliderTime.value);
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
        if (state.isPlaying) requestAnimationFrame(stepAnimation);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.t = 0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    btnPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var targetT = parseFloat(chip.getAttribute('data-time'));
        state.t = targetT;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    });

    // View Mode Switcher
    btnViewModes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btnViewModes.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.viewMode = btn.getAttribute('data-view');

        if (orbitControlsContainer) {
          orbitControlsContainer.style.display = state.viewMode === '3d' ? 'flex' : 'none';
        }
        if (viewportEl) {
          if (state.viewMode === '3d') viewportEl.classList.add('is-3d');
          else viewportEl.classList.remove('is-3d');
        }
        draw();
      });
    });

    // Feature Toggles
    if (chkSlice) {
      chkSlice.addEventListener('change', function () {
        state.showSlice = chkSlice.checked;
        draw();
      });
    }

    if (chkGhost) {
      chkGhost.addEventListener('change', function () {
        state.showGhost = chkGhost.checked;
        draw();
      });
    }

    if (chkVector) {
      chkVector.addEventListener('change', function () {
        state.showVector = chkVector.checked;
        draw();
      });
    }

    if (chkFabric) {
      chkFabric.addEventListener('change', function () {
        state.showFabric = chkFabric.checked;
        draw();
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(stepAnimation);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // SIMULATION 04: 2x2 SPACETIME MATRIX (CRASH, ESCAPE, FREE-RETURN, DISTANT)
  // Unified (Space x vs Time t) stage reproducing Simulation 02 & Simulation 03
  // ==========================================================================
  function initWidgetTrajectoryMatrix(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var btnReset = container.querySelector('.btn-reset');
    var btnPresetChips = container.querySelectorAll('.preset-matrix-chip');
    var elTimeReadouts = container.querySelectorAll('.readout-time');

    // Canvas elements for each of the 4 panels
    var canvasCrash = container.querySelector('.canvas-panel-crash');
    var canvasFlyby = container.querySelector('.canvas-panel-flyby');
    var canvasSlingshot = container.querySelector('.canvas-panel-slingshot');
    var canvasOrbit = container.querySelector('.canvas-panel-orbit');

    // Footer readouts
    var cardCrash = container.querySelector('[data-panel="crash"]');
    var cardFlyby = container.querySelector('[data-panel="flyby"]');
    var cardSlingshot = container.querySelector('[data-panel="slingshot"]');
    var cardOrbit = container.querySelector('[data-panel="orbit"]');

    var state = {
      t: parseFloat(sliderTime ? sliderTime.value : 1.2) || 1.2,
      maxT: 3.0,
      mass: 1.0, // Calibrated Earth weight (9.25 x 10^24 kg)
      earthX: 7.5,
      earthRadius: 1.8,
      earthSurfaceLeftX: 5.7,
      earthSurfaceRightX: 9.3,
      isPlaying: false,
      isVisible: true
    };

    /**
     * Kinematic position for each scenario at coordinate time tVal.
     */
    // Scenario 1: The Apple (v0 = 0 at x0 = 4.0, crashes at t = 2.48s)
    function getCrashState(tVal) {
      var x0 = 4.0;
      var tCrash = 2.48;
      var aCrash = (2.0 * (state.earthSurfaceLeftX - x0)) / (tCrash * tCrash); // 0.5528
      var hasLanded = tVal >= tCrash;
      var curX = hasLanded ? state.earthSurfaceLeftX : x0 + 0.5 * aCrash * tVal * tVal;
      var curV = hasLanded ? 0.0 : aCrash * tVal;
      return {
        x: curX,
        v: curV,
        hasLanded: hasLanded,
        flatX: x0,
        tCrash: tCrash
      };
    }

    // Scenario 2: Fast Outward Escape (v0 = -2.3 m/s at x0 = 4.0, bends away and exits left edge naturally)
    function getEscapeState(tVal) {
      var x0 = 4.0;
      var v0 = -2.3;
      var flatX = x0 + v0 * tVal;
      // In curved spacetime, Earth's fabric pulls rightward (deceleration pull)
      var pull = 0.5 * 0.385 * tVal * tVal;
      var curX = flatX + pull; // Goes smoothly negative without artificial clamp!
      var curV = v0 + 0.385 * tVal;
      var isOutOfView = curX < 0.0;
      return {
        x: curX,
        v: curV,
        hasLanded: false,
        flatX: flatX,
        isOutOfView: isOutOfView
      };
    }

    // Scenario 3: Free-Return Slingshot / U-Turn (Launch outward from x0 = 5.6m, loops at apex t = 1.4s, returns at t = 2.8s)
    function getFreeReturnState(tVal) {
      var xApex = 2.4;
      var tApex = 1.4;
      var tReturn = 2.8;
      var k = (state.earthSurfaceLeftX - 0.1 - xApex) / (tApex * tApex); // ~1.63
      var hasLanded = tVal >= tReturn;
      var curX, curV;
      if (!hasLanded) {
        var dt = tVal - tApex;
        curX = xApex + k * dt * dt;
        curV = 2.0 * k * dt;
      } else {
        curX = state.earthSurfaceLeftX;
        curV = 0.0;
      }
      var flatX = (state.earthSurfaceLeftX - 0.1) - 2.3 * tVal;
      return {
        x: curX,
        v: curV,
        hasLanded: hasLanded,
        flatX: flatX,
        tApex: tApex,
        xApex: xApex,
        tReturn: tReturn,
        isOutOfView: false
      };
    }

    // Scenario 4: Distant Infall (The Distance Contrast: x0 = 1.5m in Weak Curvature)
    function getDistantState(tVal) {
      var x0 = 1.5;
      // At x = 1.5, dist = 6.0m. falloff = 1/(1 + (6/3)^2) = 1/5 = 0.20
      var aDistant = 0.5528 * 0.20; // 0.1105 m/s^2 (5x weaker than apple!)
      var curX = x0 + 0.5 * aDistant * tVal * tVal;
      var curV = aDistant * tVal;
      var flatX = x0; // straight baseline at x = 1.5
      return {
        x: curX,
        v: curV,
        hasLanded: false,
        flatX: flatX,
        isOutOfView: false
      };
    }

    /**
     * Render a single Spacetime Frame (Space x vs Time t)
     * Exact reproduction of Simulation 02 & Simulation 03 stage
     */
    function renderSpacetimePanel(canvas, opts) {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var padLeft = 42, padRight = 24, padBottom = 32, padTop = 26;
      var plotW = width - padLeft - padRight;
      var plotH = height - padBottom - padTop;

      var xMin = 0, xMax = 15;
      var tMin = 0, tMax = state.maxT;

      function toScreen(x, t) {
        return {
          x: padLeft + ((x - xMin) / (xMax - xMin)) * plotW,
          y: height - padBottom - ((t - tMin) / (tMax - tMin)) * plotH
        };
      }

      // ======================================================================
      // 1. WARPED SPACETIME GRID (Reproducing Simulation 02 & Simulation 03)
      // ======================================================================
      ctx.save();
      ctx.beginPath();
      ctx.rect(padLeft, padTop, plotW, plotH);
      ctx.clip();

      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1.0;

      var numX = 14;
      var numT = 8;
      var stepX = (xMax - xMin) / numX;
      var stepT = (tMax - tMin) / numT;
      var samples = 35;

      // Curvature evolves smoothly across the loaf progression from t = 0 to t = 3.0
      var effectiveMass = state.mass * (0.25 + 0.75 * (state.t / state.maxT));

      // Lines of Space: bow inward toward Earth's worldtube as time advances
      for (var ix = 0; ix <= numX; ix++) {
        var startX = xMin + ix * stepX;
        var dx0 = startX - state.earthX;
        var sign = dx0 > 0 ? 1 : (dx0 < 0 ? -1 : 0);
        var dist = Math.abs(dx0);

        ctx.beginPath();
        for (var s = 0; s <= samples; s++) {
          var tVal = tMin + (s / samples) * (tMax - tMin);
          var falloff = 1.0 / (1.0 + Math.pow(dist / 3.0, 2.0));
          var pull = 0.5 * effectiveMass * falloff * 1.3052 * Math.pow(tVal, 2.0);
          var warpedX = startX - sign * pull;

          if (sign > 0) warpedX = Math.max(state.earthSurfaceRightX, warpedX);
          if (sign < 0) warpedX = Math.min(state.earthSurfaceLeftX, warpedX);

          var pt = toScreen(warpedX, tVal);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Lines of Time: sag downward near Earth
      var minOrigT = tMin - 0.6;
      var maxOrigT = tMax + 2.5;

      for (var origT = minOrigT; origT <= maxOrigT; origT += stepT) {
        ctx.beginPath();
        for (var s2 = 0; s2 <= samples; s2++) {
          var xVal = xMin + (s2 / samples) * (xMax - xMin);
          var dist2 = Math.abs(xVal - state.earthX);
          var falloff2 = 1.0 / (1.0 + Math.pow(dist2 / 2.8, 2.0));
          var sag = effectiveMass * falloff2 * 1.30;
          var warpedT = origT - sag;

          var pt2 = toScreen(xVal, warpedT);
          if (s2 === 0) ctx.moveTo(pt2.x, pt2.y);
          else ctx.lineTo(pt2.x, pt2.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // ======================================================================
      // 2. AXES
      // ======================================================================
      drawAxes(ctx, padLeft, height - padBottom, width - padRight, padTop, 'Space x', 'Time t');

      // Axis ticks
      ctx.save();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.textAlign = 'center';
      for (var tx = 0; tx <= 15; tx += 5) {
        var pX = toScreen(tx, 0);
        ctx.fillText(tx + 'm', pX.x, height - padBottom + 13);
      }
      ctx.textAlign = 'right';
      for (var tt = 0; tt <= 3; tt += 1) {
        var pT = toScreen(0, tt);
        ctx.fillText(tt.toFixed(0) + 's', padLeft - 6, pT.y + 3);
      }
      ctx.restore();

      // ======================================================================
      // 3. EARTH WORLDTUBE
      // ======================================================================
      var ptBL = toScreen(state.earthSurfaceLeftX, 0);
      var ptBR = toScreen(state.earthSurfaceRightX, 0);
      var ptTL = toScreen(state.earthSurfaceLeftX, state.t);
      var ptTR = toScreen(state.earthSurfaceRightX, state.t);

      // Shaded Interior
      ctx.save();
      var tubeGrad = ctx.createLinearGradient(ptBL.x, 0, ptBR.x, 0);
      tubeGrad.addColorStop(0, 'rgba(29, 78, 216, 0.16)');
      tubeGrad.addColorStop(0.5, 'rgba(29, 78, 216, 0.32)');
      tubeGrad.addColorStop(1, 'rgba(29, 78, 216, 0.16)');
      ctx.fillStyle = tubeGrad;
      ctx.fillRect(ptTL.x, ptTL.y, ptTR.x - ptTL.x, ptBL.y - ptTL.y);

      // Boundaries
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ptBL.x, ptBL.y);
      ctx.lineTo(ptTL.x, ptTL.y);
      ctx.moveTo(ptBR.x, ptBR.y);
      ctx.lineTo(ptTR.x, ptTR.y);
      ctx.stroke();

      // Future ghost worldtube
      if (state.t < tMax) {
        var ptFutureTL = toScreen(state.earthSurfaceLeftX, tMax);
        var ptFutureTR = toScreen(state.earthSurfaceRightX, tMax);
        ctx.strokeStyle = c.timeColor;
        ctx.globalAlpha = 0.2;
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(ptTL.x, ptTL.y);
        ctx.lineTo(ptFutureTL.x, ptFutureTL.y);
        ctx.moveTo(ptTR.x, ptTR.y);
        ctx.lineTo(ptFutureTR.x, ptFutureTR.y);
        ctx.stroke();
      }
      ctx.restore();

      // Earth Spine (center)
      ctx.save();
      ctx.strokeStyle = c.timeColor;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([2, 3]);
      var ptC0 = toScreen(state.earthX, 0);
      var ptCT = toScreen(state.earthX, state.t);
      ctx.beginPath();
      ctx.moveTo(ptC0.x, ptC0.y);
      ctx.lineTo(ptCT.x, ptCT.y);
      ctx.stroke();
      ctx.restore();

      // Earth Label
      drawLabelPill(ctx, 'Earth (5.7m)', toScreen(state.earthX, 0).x, padTop + 10, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.timeColor,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // ======================================================================
      // 4. FLAT SPACETIME BASELINE (Zero Mass Straight Line)
      // ======================================================================
      ctx.save();
      ctx.strokeStyle = c.axisLine;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var sb = 0; sb <= samples; sb++) {
        var tb = (sb / samples) * tMax;
        var stB = opts.getState(tb);
        var ptBase = toScreen(stB.flatX, tb);
        if (sb === 0) ctx.moveTo(ptBase.x, ptBase.y);
        else ctx.lineTo(ptBase.x, ptBase.y);
      }
      ctx.stroke();
      ctx.restore();

      // ======================================================================
      // 5. FULL GEODESIC TRACK (Future Track Ghost)
      // ======================================================================
      ctx.save();
      ctx.strokeStyle = opts.color || c.spaceColor;
      ctx.globalAlpha = 0.22;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var kp = 0; kp <= samples; kp++) {
        var tp = (kp / samples) * tMax;
        var stP = opts.getState(tp);
        var ptTrk = toScreen(stP.x, tp);
        if (kp === 0) ctx.moveTo(ptTrk.x, ptTrk.y);
        else ctx.lineTo(ptTrk.x, ptTrk.y);
      }
      ctx.stroke();
      ctx.restore();

      // ======================================================================
      // 6. TRAVERSED GEODESIC TRACK (Solid Curve)
      // ======================================================================
      var curSt = opts.getState(state.t);
      var curScreen = toScreen(curSt.x, state.t);

      ctx.save();
      ctx.strokeStyle = opts.color || c.spaceColor;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      var travSamples = Math.max(4, Math.round(samples * (state.t / tMax)));
      for (var kp2 = 0; kp2 <= travSamples; kp2++) {
        var tp2 = (kp2 / travSamples) * state.t;
        var stP2 = opts.getState(tp2);
        var ptTrv = toScreen(stP2.x, tp2);
        if (kp2 === 0) ctx.moveTo(ptTrv.x, ptTrv.y);
        else ctx.lineTo(ptTrv.x, ptTrv.y);
      }
      ctx.stroke();
      ctx.restore();

      // ======================================================================
      // 7. LINE OF SIMULTANEITY ("NOW" SLICE)
      // ======================================================================
      ctx.save();
      ctx.strokeStyle = c.axisLine;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([3, 3]);
      var nowL = toScreen(0, state.t);
      var nowR = toScreen(15, state.t);
      ctx.beginPath();
      ctx.moveTo(nowL.x, nowL.y);
      ctx.lineTo(nowR.x, nowR.y);
      ctx.stroke();
      ctx.restore();

      // ======================================================================
      // 8. ACTIVE TRAVELER (GLOWING DOT & 4-VELOCITY TANGENT VECTOR)
      // ======================================================================
      if (curSt.hasLanded) {
        // Crash / Landing ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(curScreen.x, curScreen.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 2.0;
        ctx.stroke();
        ctx.restore();

        drawGlowingDot(ctx, curScreen.x, curScreen.y, c.dangerColor, 5.5);
        drawLabelPill(ctx, 'IMPACT', curScreen.x - 30, curScreen.y, {
          textColor: c.dangerColor,
          borderColor: c.dangerColor,
          font: 'bold 8.5px "JetBrains Mono", monospace'
        });
      } else if (!curSt.isOutOfView) {
        // Freely coasting traveler inside viewport
        drawGlowingDot(ctx, curScreen.x, curScreen.y, opts.color || c.spaceColor, 5.5);

        // Velocity Heading Arrow in spacetime: dx/dt = curSt.v, dt/dt = 1.0
        var vecScale = 22;
        var vx = curSt.v;
        var vt = 1.0;
        var norm = Math.sqrt(vx * vx + vt * vt);
        var dirX = vx / norm;
        var dirT = vt / norm;

        // In screen coordinates: space is rightward, time is upward
        var arrowTip = {
          x: curScreen.x + dirX * vecScale,
          y: curScreen.y - dirT * vecScale
        };

        ctx.save();
        ctx.strokeStyle = opts.color || c.spaceColor;
        ctx.fillStyle = opts.color || c.spaceColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(curScreen.x, curScreen.y);
        ctx.lineTo(arrowTip.x, arrowTip.y);
        ctx.stroke();

        // Arrowhead
        var headLen = 6;
        var headAngle = Math.atan2(-(arrowTip.y - curScreen.y), arrowTip.x - curScreen.x);
        ctx.beginPath();
        ctx.moveTo(arrowTip.x, arrowTip.y);
        ctx.lineTo(
          arrowTip.x - headLen * Math.cos(headAngle - Math.PI / 6),
          arrowTip.y + headLen * Math.sin(headAngle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowTip.x - headLen * Math.cos(headAngle + Math.PI / 6),
          arrowTip.y + headLen * Math.sin(headAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Traveler has escaped outside viewport into deep space
        drawLabelPill(ctx, 'Escaped Viewport into Deep Space →', padLeft + 78, curScreen.y, {
          textColor: c.subtleText,
          borderColor: c.pillBorder,
          font: 'italic 8px "JetBrains Mono", monospace'
        });
      }

      // Feature Label
      if (opts.badge) {
        drawLabelPill(ctx, opts.badge.text, opts.badge.x(width, padLeft), opts.badge.y(height, padTop), {
          textColor: opts.badge.color || opts.color,
          bgColor: c.pillBg,
          borderColor: opts.badge.color || opts.color,
          font: 'bold 8.5px "JetBrains Mono", monospace'
        });
      }
    }

    function updateReadouts() {
      if (sliderTime) sliderTime.value = state.t.toFixed(2);
      var timeText = state.t.toFixed(2) + ' s';
      elTimeReadouts.forEach(function (el) {
        el.textContent = timeText;
      });

      // Update Panel 1 Footer (The Apple Crash)
      var st1 = getCrashState(state.t);
      if (cardCrash) {
        var altEl1 = cardCrash.querySelector('.panel-readout-alt');
        if (altEl1) {
          if (st1.hasLanded) {
            altEl1.innerHTML = '<span style="color:var(--color-danger); font-weight:700;">Surface Crash (t = 2.48s)</span>';
          } else {
            altEl1.textContent = 'Gap: ' + (state.earthSurfaceLeftX - st1.x).toFixed(2) + ' m';
          }
        }
      }

      // Update Panel 2 Footer (Fast Escape Flyby)
      var st2 = getEscapeState(state.t);
      if (cardFlyby) {
        var altEl2 = cardFlyby.querySelector('.panel-readout-alt');
        if (altEl2) {
          altEl2.textContent = 'Position x = ' + st2.x.toFixed(2) + 'm (Escaping)';
        }
      }

      // Update Panel 3 Footer (Free Return Slingshot)
      var st3 = getFreeReturnState(state.t);
      if (cardSlingshot) {
        var altEl3 = cardSlingshot.querySelector('.panel-readout-alt');
        if (altEl3) {
          if (st3.hasLanded) {
            altEl3.innerHTML = '<span style="color:var(--color-photon); font-weight:700;">Returned to Earth (t = 2.80s)</span>';
          } else if (state.t < 1.4) {
            altEl3.textContent = 'Climbing Outward: x = ' + st3.x.toFixed(2) + 'm';
          } else {
            altEl3.textContent = 'Returning to Earth: x = ' + st3.x.toFixed(2) + 'm';
          }
        }
      }

      // Update Panel 4 Footer (Distant Observer)
      var st4 = getDistantState(state.t);
      if (cardOrbit) {
        var altEl4 = cardOrbit.querySelector('.panel-readout-alt');
        if (altEl4) {
          var defl = st4.x - 1.5;
          altEl4.textContent = 'Inward Drift: Δx = ' + defl.toFixed(2) + 'm (Weak Warp)';
        }
      }

      btnPresetChips.forEach(function (chip) {
        var chipT = parseFloat(chip.getAttribute('data-time'));
        if (Math.abs(chipT - state.t) < 0.08) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    function draw() {
      var c = getThemeColors();

      // Panel 1: Direct Fall / Crash (The Apple)
      renderSpacetimePanel(canvasCrash, {
        getState: getCrashState,
        color: c.dangerColor,
        badge: {
          text: 'Apple: v₀ = 0 (Heads Straight into Curved Grid)',
          x: function () { return 130; },
          y: function (h, padTop) { return padTop + 8; },
          color: c.dangerColor
        }
      });

      // Panel 2: Fast Escape Flyby
      renderSpacetimePanel(canvasFlyby, {
        getState: getEscapeState,
        color: c.spaceColor,
        badge: {
          text: 'Flyby: v₀ = −2.3 m/s (Bends & Escapes)',
          x: function () { return 130; },
          y: function (h, padTop) { return padTop + 8; },
          color: c.spaceColor
        }
      });

      // Panel 3: Free-Return Slingshot (The Spacetime U-Turn)
      renderSpacetimePanel(canvasSlingshot, {
        getState: getFreeReturnState,
        color: c.photonColor,
        badge: {
          text: 'Free Return: Sub-Orbital U-Turn Geodesic',
          x: function () { return 130; },
          y: function (h, padTop) { return padTop + 8; },
          color: c.photonColor
        }
      });

      // Panel 4: Distant Observer (Weak Curvature Gradient)
      renderSpacetimePanel(canvasOrbit, {
        getState: getDistantState,
        color: c.emeraldColor,
        badge: {
          text: 'Distant: x₀ = 1.5m (Gentle Outer Curvature)',
          x: function () { return 130; },
          y: function (h, padTop) { return padTop + 8; },
          color: c.emeraldColor
        }
      });
    }

    function stepAnimation() {
      if (!state.isPlaying || !state.isVisible) return;
      state.t += 0.012;
      if (state.t > state.maxT) {
        state.t = 0.0;
      }
      updateReadouts();
      draw();
      requestAnimationFrame(stepAnimation);
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function () {
        state.t = parseFloat(sliderTime.value);
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying
          ? '<span>❚❚</span><span>Pause</span>'
          : '<span>▶</span><span>Auto Play</span>';
        if (state.isPlaying) requestAnimationFrame(stepAnimation);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.t = 0.0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    btnPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.t = parseFloat(chip.getAttribute('data-time'));
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    });

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
      if (state.isPlaying) requestAnimationFrame(stepAnimation);
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initWidgetFlatSpacetimeBaseline('widget-flat-spacetime-baseline');
    initWidgetEarthWarpsSpacetime('widget-earth-warps-spacetime');
    initWidgetAppleCurvedFuture('widget-apple-curved-future');
    initWidgetTrajectoryMatrix('widget-trajectory-matrix');
  });

})(window);
