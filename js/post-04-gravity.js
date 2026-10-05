/**
 * post-04-gravity.js - Part 4 Interactive Simulations: The Illusion of Weight & Curved Spacetime
 * Explores the Equivalence Principle, Laser Bending, Gravitational Time Dilation,
 * Geodesics in Warped Spacetime, Tidal Curvature, and Gravitational Lensing.
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

  // Helper: Draw 2D Observer Figure
  function drawObserverFigure(ctx, x, y, color, scale, isFloating) {
    scale = scale || 1.0;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.0 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var headR = 5 * scale;
    var bodyH = 20 * scale;
    var legW = 8 * scale;
    var legH = 18 * scale;
    var armW = 12 * scale;

    var footY = y;
    var hipY = footY - legH;
    var shoulderY = hipY - bodyH;
    var headY = shoulderY - headR;

    if (isFloating) {
      // Relaxed limbs in microgravity
      ctx.beginPath();
      ctx.arc(x, headY, headR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x, hipY);
      ctx.stroke();

      // Floating legs (slightly splayed)
      ctx.beginPath();
      ctx.moveTo(x - legW * 1.2, footY - 4 * scale);
      ctx.lineTo(x - legW * 0.4, hipY);
      ctx.lineTo(x, hipY);
      ctx.lineTo(x + legW * 0.4, hipY);
      ctx.lineTo(x + legW * 1.1, footY - 6 * scale);
      ctx.stroke();

      // Floating arms (gentle drift outward)
      ctx.beginPath();
      ctx.moveTo(x - armW * 1.2, shoulderY + 8 * scale);
      ctx.lineTo(x - armW * 0.3, shoulderY + 2 * scale);
      ctx.lineTo(x, shoulderY + 2 * scale);
      ctx.lineTo(x + armW * 0.3, shoulderY + 2 * scale);
      ctx.lineTo(x + armW * 1.1, shoulderY + 10 * scale);
      ctx.stroke();
    } else {
      // Standing firmly on the scale
      ctx.beginPath();
      ctx.arc(x, headY, headR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x, hipY);
      ctx.stroke();

      // Legs standing straight down
      ctx.beginPath();
      ctx.moveTo(x - legW * 0.7, footY);
      ctx.lineTo(x, hipY);
      ctx.lineTo(x + legW * 0.7, footY);
      ctx.stroke();

      // Right arm outstretched holding apple, left arm at side
      ctx.beginPath();
      ctx.moveTo(x - armW * 0.8, shoulderY + bodyH * 0.6);
      ctx.lineTo(x, shoulderY + 3 * scale);
      ctx.lineTo(x + armW * 1.3, shoulderY + bodyH * 0.35);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // WIDGET 1: THE EQUIVALENCE ELEVATOR (EINSTEIN'S HAPPIEST THOUGHT)
  // ==========================================================================
  function initWidgetElevatorEquivalence(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var modeChips = container.querySelectorAll('.chip-elevator-mode');
    var btnDrop = container.querySelector('.btn-drop-apple');
    var btnPlay = container.querySelector('.btn-play');
    var sliderG = container.querySelector('.slider-gravity');

    var readoutScaleKg = container.querySelector('.readout-scale-kg');
    var readoutNormalForce = container.querySelector('.readout-normal-force');
    var readoutFeltG = container.querySelector('.readout-felt-g');
    var readoutAppleStatus = container.querySelector('.readout-apple-status');

    var state = {
      mode: 'earth', // 'earth' | 'freefall' | 'rocket'
      gUser: 1.0,    // in g-units
      appleState: 'held', // 'held' | 'falling' | 'dropped'
      appleY: 0,     // 0 = at hand, 1 = at floor
      appleVy: 0,
      cabinY: 0,     // scroll offset for motion illusion
      isPlaying: false,
      isVisible: true,
      cableSeveredProgress: 0
    };

    var MASS_OBSERVER = 75.0; // kg
    var STANDARD_G = 9.80665; // m/s^2

    function updateReadouts() {
      var effG = 0;
      var normalForce = 0;
      var scaleKg = 0;

      if (state.mode === 'earth') {
        effG = state.gUser;
        normalForce = MASS_OBSERVER * STANDARD_G * effG;
        scaleKg = MASS_OBSERVER * effG;
      } else if (state.mode === 'freefall') {
        effG = 0.0;
        normalForce = 0.0;
        scaleKg = 0.0;
      } else if (state.mode === 'rocket') {
        effG = state.gUser;
        normalForce = MASS_OBSERVER * STANDARD_G * effG;
        scaleKg = MASS_OBSERVER * effG;
      }

      if (readoutScaleKg) readoutScaleKg.innerHTML = scaleKg.toFixed(1) + ' <span>kg</span>';
      if (readoutNormalForce) readoutNormalForce.innerHTML = normalForce.toFixed(0) + ' <span>N</span>';
      if (readoutFeltG) readoutFeltG.innerHTML = effG.toFixed(2) + ' <span>g</span>';

      if (readoutAppleStatus) {
        if (state.appleState === 'held') {
          readoutAppleStatus.textContent = 'Held in hand (at rest relative to cabin)';
        } else if (state.mode === 'freefall') {
          readoutAppleStatus.textContent = 'Weightless (floating motionless beside hand)';
        } else if (state.appleY >= 1.0) {
          readoutAppleStatus.textContent = 'Resting on cabin floor';
        } else {
          readoutAppleStatus.textContent = 'Falling toward floor with apparent acceleration g';
        }
      }

      if (btnDrop) {
        if (state.appleState === 'held') {
          btnDrop.textContent = 'Drop Apple';
        } else {
          btnDrop.textContent = 'Pick Up Apple';
        }
      }
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      // Background Environment
      var isRocket = state.mode === 'rocket';
      var isFreefall = state.mode === 'freefall';

      if (isRocket) {
        // Deep space starry backdrop
        ctx.fillStyle = c.isLight ? '#1a1829' : '#0a0910';
        ctx.fillRect(0, 0, width, height);

        // Twinkling stars
        ctx.fillStyle = '#ffffff';
        var starSeeds = [0.12, 0.28, 0.45, 0.67, 0.83, 0.91, 0.35, 0.74, 0.18, 0.55];
        for (var i = 0; i < starSeeds.length; i++) {
          var sx = (starSeeds[i] * width + state.cabinY * 0.2) % width;
          var sy = (starSeeds[(i + 3) % starSeeds.length] * height + state.cabinY * 0.1) % height;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Elevator shaft background
        ctx.fillStyle = c.isLight ? '#f2eee6' : '#121110';
        ctx.fillRect(0, 0, width, height);

        // Vertical shaft guide rails with scrolling motion lines if freefall
        ctx.strokeStyle = c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        var shaftOffset = isFreefall ? (state.cabinY % 40) : 0;
        for (var sy = -40 + shaftOffset; sy < height + 40; sy += 40) {
          ctx.beginPath();
          ctx.moveTo(30, sy);
          ctx.lineTo(width - 30, sy);
          ctx.stroke();
        }
      }

      // Cabin geometry
      var cabinW = Math.min(320, width * 0.7);
      var cabinH = Math.min(360, height * 0.78);
      var cabinX = (width - cabinW) / 2;
      var cabinY = (height - cabinH) / 2 + 10;

      // Rocket thrust flame if rocket mode
      if (isRocket) {
        var flameH = 45 + Math.sin(Date.now() * 0.02) * 8;
        var flameGrad = ctx.createLinearGradient(0, cabinY + cabinH, 0, cabinY + cabinH + flameH);
        flameGrad.addColorStop(0, '#f97316');
        flameGrad.addColorStop(0.5, '#facc15');
        flameGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW * 0.35, cabinY + cabinH);
        ctx.lineTo(cabinX + cabinW * 0.5, cabinY + cabinH + flameH);
        ctx.lineTo(cabinX + cabinW * 0.65, cabinY + cabinH);
        ctx.closePath();
        ctx.fill();
      }

      // Overhead suspension cables or severed cable
      if (state.mode === 'earth') {
        ctx.strokeStyle = c.axisLine;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW / 2, 0);
        ctx.lineTo(cabinX + cabinW / 2, cabinY);
        ctx.stroke();
      } else if (isFreefall) {
        // Severed frayed cable ends
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW / 2, 0);
        ctx.lineTo(cabinX + cabinW / 2, cabinY * 0.35);
        ctx.stroke();

        // Frayed wires
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW / 2, cabinY * 0.35);
        ctx.lineTo(cabinX + cabinW / 2 - 6, cabinY * 0.35 + 8);
        ctx.moveTo(cabinX + cabinW / 2, cabinY * 0.35);
        ctx.lineTo(cabinX + cabinW / 2 + 5, cabinY * 0.35 + 10);
        ctx.stroke();

        // Stub on cabin roof
        ctx.strokeStyle = c.axisLine;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW / 2, cabinY);
        ctx.lineTo(cabinX + cabinW / 2, cabinY - 12);
        ctx.stroke();
      }

      // Cabin Outer Shell & Interior
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = c.isLight ? '#ffffff' : '#1c1a17';
      ctx.fillRect(cabinX, cabinY, cabinW, cabinH);
      ctx.restore();

      // Cabin wall border
      ctx.strokeStyle = c.isLight ? '#d1cac0' : '#3a3630';
      ctx.lineWidth = 4;
      ctx.strokeRect(cabinX, cabinY, cabinW, cabinH);

      // Cabin floor plate
      ctx.fillStyle = c.isLight ? '#e5e0d5' : '#282520';
      ctx.fillRect(cabinX, cabinY + cabinH - 12, cabinW, 12);

      // Ceiling light fixture
      ctx.fillStyle = c.isLight ? '#fef3c7' : '#3b3420';
      ctx.fillRect(cabinX + cabinW * 0.35, cabinY, cabinW * 0.3, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cabinX + cabinW * 0.42, cabinY + 6, cabinW * 0.16, 2);

      // The Bathroom Scale
      var scaleW = 54;
      var scaleH = 10;
      var scaleX = cabinX + cabinW * 0.38 - scaleW / 2;
      var scaleY = cabinY + cabinH - 12 - scaleH;

      ctx.fillStyle = c.isLight ? '#dbeafe' : '#1e293b';
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(scaleX, scaleY, scaleW, scaleH, 3) : ctx.rect(scaleX, scaleY, scaleW, scaleH);
      ctx.fill();
      ctx.stroke();

      // Scale dial needle
      var effG = (state.mode === 'freefall') ? 0.0 : state.gUser;
      ctx.fillStyle = c.timeColor;
      ctx.fillRect(scaleX + scaleW / 2 - 2, scaleY + 2, 4, 3);

      // Alice (The Observer)
      var observerX = scaleX + scaleW / 2;
      var observerFootY = scaleY;
      var isFloating = (state.mode === 'freefall');

      if (isFloating) {
        observerFootY = scaleY - 14 - Math.sin(Date.now() * 0.003) * 4;
      }

      drawObserverFigure(ctx, observerX, observerFootY, c.axisLine, 1.15, isFloating);

      // Scale readout pill directly above scale
      var scaleReadingText = isFloating ? '0.0 kg (N = 0)' : (MASS_OBSERVER * effG).toFixed(1) + ' kg';
      drawLabelPill(ctx, scaleReadingText, scaleX + scaleW / 2, scaleY + 18, {
        textColor: isFloating ? c.dangerColor : c.timeColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      // The Apple
      var handX = observerX + 16;
      var handY = observerFootY - 32;
      var floorAppleY = cabinY + cabinH - 12 - 7;
      var currentAppleY = handY + state.appleY * (floorAppleY - handY);
      var currentAppleX = handX;

      if (isFloating && state.appleState !== 'held') {
        currentAppleY = handY + Math.sin(Date.now() * 0.0025 + 1.2) * 5;
        currentAppleX = handX + 8;
      }

      // Draw Apple
      ctx.save();
      ctx.fillStyle = c.spaceColor;
      ctx.beginPath();
      ctx.arc(currentAppleX, currentAppleY, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Apple stem and leaf
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(currentAppleX, currentAppleY - 6.5);
      ctx.quadraticCurveTo(currentAppleX + 3, currentAppleY - 11, currentAppleX + 2, currentAppleY - 12);
      ctx.stroke();
      ctx.restore();

      // Force vectors (if not free fall)
      if (!isFloating && effG > 0.05) {
        // Normal force arrow pointing up from scale to Alice's feet
        var arrowLen = 32 * effG;
        drawVector(ctx, observerX, scaleY, observerX, scaleY - arrowLen, {
          color: c.timeColor,
          lineWidth: 2.2,
          arrowSize: 6
        });
        drawLabelPill(ctx, 'Normal Force N', observerX - 44, scaleY - arrowLen * 0.5, {
          textColor: c.timeColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });

        // Apparent weight force arrow on Alice's center of mass
        drawVector(ctx, observerX, observerFootY - 26, observerX, observerFootY - 26 + arrowLen, {
          color: c.spaceColor,
          lineWidth: 2.0,
          arrowSize: 6
        });
      }

      // Overhead Context Header inside cabin
      var envLabel = '1. RESTING ON EARTH (g = 9.8 m/s²)';
      if (isFreefall) envLabel = '2. FREE FALL (CUT CABLE: APPARENT g = 0)';
      if (isRocket) envLabel = '3. DEEP SPACE ROCKET ACCELERATING (a = 9.8 m/s²)';

      drawLabelPill(ctx, envLabel, cabinX + cabinW / 2, cabinY + 22, {
        textColor: isFreefall ? c.dangerColor : (isRocket ? c.invariantColor : c.timeColor),
        font: 'bold 11px "JetBrains Mono", monospace',
        paddingX: 10,
        paddingY: 4
      });

      // Bottom Insight Tag
      var insightText = isFreefall
        ? 'Inside a freely falling chamber, gravity is completely extinguished locally.'
        : 'Weight is not an attractive pull from below; weight is the floor pushing you upward!';
      drawLabelPill(ctx, insightText, width / 2, height - 16, {
        textColor: c.subtleText,
        font: '11px "Newsreader", Georgia, serif',
        bgColor: 'transparent',
        borderColor: 'transparent'
      });
    }

    function stepPhysics() {
      if (state.mode === 'freefall') {
        state.cabinY += 6;
      } else if (state.mode === 'rocket') {
        state.cabinY -= 4;
      }

      if (state.appleState === 'falling' && state.mode !== 'freefall') {
        var effG = state.gUser;
        state.appleVy += 0.04 * effG;
        state.appleY += state.appleVy;
        if (state.appleY >= 1.0) {
          state.appleY = 1.0;
          state.appleVy = 0;
          state.appleState = 'dropped';
        }
      }
    }

    function loop() {
      if (!state.isVisible) return;
      stepPhysics();
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    // Controls Wiring
    for (var i = 0; i < modeChips.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < modeChips.length; j++) modeChips[j].classList.remove('active');
          btn.classList.add('active');
          state.mode = btn.getAttribute('data-mode');
          state.appleState = 'held';
          state.appleY = 0;
          state.appleVy = 0;
          updateReadouts();
          draw();
        });
      })(modeChips[i]);
    }

    if (btnDrop) {
      btnDrop.addEventListener('click', function () {
        if (state.appleState === 'held') {
          state.appleState = (state.mode === 'freefall') ? 'dropped' : 'falling';
          state.appleVy = 0;
        } else {
          state.appleState = 'held';
          state.appleY = 0;
          state.appleVy = 0;
        }
        updateReadouts();
        draw();
      });
    }

    if (sliderG) {
      sliderG.addEventListener('input', function () {
        state.gUser = parseFloat(sliderG.value) / 100.0;
        var label = container.querySelector('.val-g-label');
        if (label) label.textContent = state.gUser.toFixed(2) + ' g';
        updateReadouts();
        draw();
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // WIDGET 2: THE BENDING LASER BEAM (DUAL COMPARISON GRID)
  // ==========================================================================
  function initWidgetLaserBending(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasInertial = container.querySelector('.canvas-inertial');
    var canvasAccelerated = container.querySelector('.canvas-accelerated');
    var sliderProgress = container.querySelector('.slider-laser-progress');
    var sliderAccel = container.querySelector('.slider-laser-accel');
    var btnPlay = container.querySelector('.btn-play');
    var btnPresets = container.querySelectorAll('.chip-laser-accel');

    var readoutDeflection = container.querySelector('.readout-deflection');
    var readoutTransitTime = container.querySelector('.readout-transit-time');

    var state = {
      progress: 0.75, // 0 to 1 (transit across width W)
      accel: 2.5,     // arbitrary g scale factor
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      // Deflection formula: Delta y = 1/2 a (x/c)^2
      var maxDeflectionMm = 0.5 * state.accel * 4.2; // visual scaling
      var currentDeflection = maxDeflectionMm * (state.progress * state.progress);
      if (readoutDeflection) {
        readoutDeflection.innerHTML = currentDeflection.toFixed(2) + ' <span>mm</span>';
      }
      if (readoutTransitTime) {
        var transitNs = (state.progress * 3.33).toFixed(2);
        readoutTransitTime.innerHTML = transitNs + ' <span>ns</span>';
      }
      if (sliderProgress) {
        sliderProgress.value = Math.round(state.progress * 1000);
      }
    }

    function drawInertial(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 36, height - 36, width, height, 28);

      var cabW = width * 0.74;
      var cabH = height * 0.62;
      var cabX = (width - cabW) / 2;

      // Rocket Cabin rises with acceleration: y_cab = 1/2 a t^2
      var maxRise = height * 0.22 * (state.accel / 5.0);
      var currentRise = maxRise * (state.progress * state.progress);
      var baseCabY = height * 0.28;
      var currentCabY = baseCabY - currentRise;

      // Draw Rocket Cabin outline at current elevated position
      ctx.save();
      ctx.fillStyle = c.isLight ? 'rgba(29, 78, 216, 0.03)' : 'rgba(96, 165, 250, 0.04)';
      ctx.fillRect(cabX, currentCabY, cabW, cabH);
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cabX, currentCabY, cabW, cabH);

      // Rocket thrust under floor
      var flameH = 24 + Math.sin(Date.now() * 0.03) * 6;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(cabX + cabW * 0.4, currentCabY + cabH);
      ctx.lineTo(cabX + cabW * 0.5, currentCabY + cabH + flameH);
      ctx.lineTo(cabX + cabW * 0.6, currentCabY + cabH);
      ctx.closePath();
      ctx.fill();

      // Original launch height (straight dashed guide)
      var laserLaunchY = baseCabY + cabH * 0.4;
      ctx.strokeStyle = c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cabX, laserLaunchY);
      ctx.lineTo(cabX + cabW, laserLaunchY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Laser emitter on left wall
      ctx.fillStyle = c.photonColor;
      ctx.fillRect(cabX - 4, currentCabY + cabH * 0.4 - 4, 8, 8);

      // Horizontal photon trajectory in inertial space: strictly straight horizontal line!
      var photonX = cabX + state.progress * cabW;
      var photonY = laserLaunchY;

      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cabX, laserLaunchY);
      ctx.lineTo(photonX, photonY);
      ctx.stroke();

      drawGlowingDot(ctx, photonX, photonY, c.photonColor, 4.5);

      // Target on right wall (it has risen!)
      var targetY = currentCabY + cabH * 0.4;
      ctx.fillStyle = c.spaceColor;
      ctx.fillRect(cabX + cabW - 4, targetY - 4, 8, 8);

      // Vertical dimension line showing rocket floor catch-up
      if (state.progress > 0.1) {
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cabX + cabW + 12, laserLaunchY);
        ctx.lineTo(cabX + cabW + 12, targetY);
        ctx.stroke();

        // Arrowheads
        ctx.beginPath();
        ctx.moveTo(cabX + cabW + 9, laserLaunchY);
        ctx.lineTo(cabX + cabW + 12, laserLaunchY + 3);
        ctx.lineTo(cabX + cabW + 15, laserLaunchY);
        ctx.moveTo(cabX + cabW + 9, targetY);
        ctx.lineTo(cabX + cabW + 12, targetY - 3);
        ctx.lineTo(cabX + cabW + 15, targetY);
        ctx.stroke();

        drawLabelPill(ctx, 'Floor Rises Δy', cabX + cabW + 50, (laserLaunchY + targetY) / 2, {
          textColor: c.dangerColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      ctx.restore();

      drawLabelPill(ctx, 'Laser travels in a straight horizontal line in space', width / 2, 22, {
        textColor: c.photonColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function drawAccelerated(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 36, height - 36, width, height, 28);

      var cabW = width * 0.74;
      var cabH = height * 0.62;
      var cabX = (width - cabW) / 2;
      var cabY = (height - cabH) / 2 + 10;

      // Stationary cabin outline inside its own frame
      ctx.fillStyle = c.isLight ? 'rgba(194, 65, 12, 0.03)' : 'rgba(251, 146, 60, 0.04)';
      ctx.fillRect(cabX, cabY, cabW, cabH);
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cabX, cabY, cabW, cabH);

      var laserLaunchY = cabY + cabH * 0.35;

      // Flat horizontal reference line
      ctx.strokeStyle = c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cabX, laserLaunchY);
      ctx.lineTo(cabX + cabW, laserLaunchY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Emitter
      ctx.fillStyle = c.photonColor;
      ctx.fillRect(cabX - 4, laserLaunchY - 4, 8, 8);

      // Parabolic curved beam trajectory: y(x) = y0 - 1/2 a (x/c)^2
      var maxDeflectionPx = height * 0.22 * (state.accel / 5.0);
      var currentX = cabX + state.progress * cabW;
      var currentY = laserLaunchY + maxDeflectionPx * (state.progress * state.progress);

      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cabX, laserLaunchY);

      var steps = 40;
      for (var s = 1; s <= steps; s++) {
        var frac = (s / steps) * state.progress;
        var px = cabX + frac * cabW;
        var py = laserLaunchY + maxDeflectionPx * (frac * frac);
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      drawGlowingDot(ctx, currentX, currentY, c.photonColor, 4.5);

      // Downward deflection dimension line on right wall
      if (state.progress > 0.15) {
        var rightWallY = laserLaunchY + maxDeflectionPx * (state.progress * state.progress);
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(currentX + 10, laserLaunchY);
        ctx.lineTo(currentX + 10, rightWallY);
        ctx.stroke();

        drawLabelPill(ctx, 'Deflection: y = -½ a (x/c)²', currentX + 64, (laserLaunchY + rightWallY) / 2, {
          textColor: c.dangerColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      drawLabelPill(ctx, 'To cabin observer, the laser beam bends parabolically downward!', width / 2, 22, {
        textColor: c.spaceColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function draw() {
      if (canvasInertial) {
        var r1 = setupRetinaCanvas(canvasInertial);
        drawInertial(r1.ctx, r1.width, r1.height);
      }
      if (canvasAccelerated) {
        var r2 = setupRetinaCanvas(canvasAccelerated);
        drawAccelerated(r2.ctx, r2.width, r2.height);
      }
    }

    function loop() {
      if (!state.isPlaying || !state.isVisible) return;
      state.progress += 0.008;
      if (state.progress > 1.0) state.progress = 0.0;
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    if (sliderProgress) {
      sliderProgress.addEventListener('input', function () {
        state.progress = parseFloat(sliderProgress.value) / 1000.0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    if (sliderAccel) {
      sliderAccel.addEventListener('input', function () {
        state.accel = parseFloat(sliderAccel.value);
        var label = container.querySelector('.val-laser-accel-label');
        if (label) label.textContent = state.accel.toFixed(1) + ' g';
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

    for (var b = 0; b < btnPresets.length; b++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var k = 0; k < btnPresets.length; k++) btnPresets[k].classList.remove('active');
          btn.classList.add('active');
          state.accel = parseFloat(btn.getAttribute('data-accel'));
          if (sliderAccel) sliderAccel.value = state.accel;
          var label = container.querySelector('.val-laser-accel-label');
          if (label) label.textContent = state.accel.toFixed(1) + ' g';
          updateReadouts();
          draw();
        });
      })(btnPresets[b]);
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

  // ==========================================================================
  // WIDGET 3: THE TOWER OF TIME (GRAVITATIONAL REDSHIFT & DILATION)
  // ==========================================================================
  function initWidgetTimeTower(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderHeight = container.querySelector('.slider-tower-height');
    var sliderGravity = container.querySelector('.slider-tower-gravity');
    var btnPlay = container.querySelector('.btn-play');
    var chips = container.querySelectorAll('.chip-tower-preset');

    var readoutShift = container.querySelector('.readout-redshift-fraction');
    var readoutDailyDrift = container.querySelector('.readout-daily-drift');
    var readoutSummitClock = container.querySelector('.readout-summit-clock');
    var readoutBaseClock = container.querySelector('.readout-base-clock');

    var state = {
      heightMeters: 8848, // default: Everest
      gravityVal: 9.8,
      phase: 0,
      baseSeconds: 100.0,
      isPlaying: true,
      isVisible: true
    };

    var C_SPEED = 299792458; // m/s

    function updateReadouts() {
      // Fractional redshift: Delta f / f = - g h / c^2
      var fracShift = (state.gravityVal * state.heightMeters) / (C_SPEED * C_SPEED);
      // Daily drift: 86400 seconds * fracShift in microseconds
      var dailyDriftMicro = fracShift * 86400 * 1e6;

      if (readoutShift) readoutShift.textContent = (fracShift * 1e15).toFixed(2) + ' × 10⁻¹⁵';
      if (readoutDailyDrift) readoutDailyDrift.innerHTML = (dailyDriftMicro >= 1 ? dailyDriftMicro.toFixed(2) : (dailyDriftMicro * 1000).toFixed(1) + ' n') + ' <span>µs/day</span>';

      var summitLeadSec = state.baseSeconds * fracShift;
      if (readoutBaseClock) readoutBaseClock.innerHTML = state.baseSeconds.toFixed(4) + ' <span>s</span>';
      if (readoutSummitClock) readoutSummitClock.innerHTML = (state.baseSeconds + summitLeadSec).toFixed(4) + ' <span>s</span>';
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      // Layout: Vertical Tower on the left, Wavefront propagation in center, Readout cards on right
      var towerX = width * 0.22;
      var towerTopY = height * 0.16;
      var towerBotY = height * 0.82;
      var towerW = 34;

      // Ground plane
      ctx.fillStyle = c.isLight ? '#e5e0d5' : '#282520';
      ctx.fillRect(0, towerBotY, width, height - towerBotY);

      // Tower structure (Pound-Rebka lattice)
      ctx.strokeStyle = c.isLight ? '#b8b2a7' : '#454038';
      ctx.lineWidth = 2;
      ctx.strokeRect(towerX - towerW / 2, towerTopY, towerW, towerBotY - towerTopY);

      // Cross struts
      var strutStep = 24;
      for (var y = towerTopY; y < towerBotY - 10; y += strutStep) {
        ctx.beginPath();
        ctx.moveTo(towerX - towerW / 2, y);
        ctx.lineTo(towerX + towerW / 2, y + strutStep);
        ctx.moveTo(towerX + towerW / 2, y);
        ctx.lineTo(towerX - towerW / 2, y + strutStep);
        ctx.stroke();
      }

      // Alice at Base
      drawObserverFigure(ctx, towerX - towerW / 2 - 20, towerBotY, c.timeColor, 0.9, false);
      drawLabelPill(ctx, 'Alice (Base)', towerX - towerW / 2 - 20, towerBotY + 14, {
        textColor: c.timeColor,
        font: 'bold 9px "JetBrains Mono", monospace'
      });

      // Bob at Summit
      drawObserverFigure(ctx, towerX - towerW / 2 - 20, towerTopY + 12, c.spaceColor, 0.9, false);
      drawLabelPill(ctx, 'Bob (Summit)', towerX - towerW / 2 - 20, towerTopY - 6, {
        textColor: c.spaceColor,
        font: 'bold 9px "JetBrains Mono", monospace'
      });

      // Light pulses propagating upward from Alice to Bob
      var waveX = towerX + towerW / 2 + 50;
      var numWaves = 10;
      var waveH = towerBotY - towerTopY;

      ctx.save();
      // Upward beam line
      ctx.strokeStyle = c.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(waveX, towerBotY);
      ctx.lineTo(waveX, towerTopY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw wavefronts: spacing stretches as wave climbs (gravitational redshift!)
      var fracShift = (state.gravityVal * state.heightMeters) / (C_SPEED * C_SPEED);
      var stretchFactor = 1.0 + fracShift * 1e12 * 8.0; // exaggerated visually for perception

      for (var i = 0; i < numWaves; i++) {
        var baseProgress = ((i / numWaves) + state.phase) % 1.0;
        // Non-linear upward spacing to visually represent stretching wavelength
        var currY = towerBotY - baseProgress * waveH;
        var wavelengthVisual = 12 + (1.0 - baseProgress) * 16 * (stretchFactor - 1.0);

        // Wavefront arc
        var waveGrad = ctx.createLinearGradient(waveX - 22, currY, waveX + 22, currY);
        waveGrad.addColorStop(0, 'rgba(180, 83, 9, 0)');
        waveGrad.addColorStop(0.5, c.photonColor);
        waveGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(waveX - 20, currY);
        ctx.quadraticCurveTo(waveX, currY - 4, waveX + 20, currY);
        ctx.stroke();
      }

      ctx.restore();

      // Right-side Diagram Annotations: Gravitational Potential Gradient
      var gradX = width * 0.65;
      var gradW = width * 0.28;

      ctx.save();
      // Height dimension line
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(towerX + towerW / 2 + 14, towerBotY);
      ctx.lineTo(towerX + towerW / 2 + 14, towerTopY);
      ctx.stroke();

      drawLabelPill(ctx, 'Height h = ' + state.heightMeters.toLocaleString() + ' m', towerX + towerW / 2 + 14, (towerTopY + towerBotY) / 2, {
        textColor: c.axisLine,
        align: 'left',
        paddingX: 8,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      // Summit vs Base clock rates comparison banner
      drawLabelPill(ctx, 'Gravitational Potential Φ = g · h', gradX + gradW / 2, towerTopY + 20, {
        textColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      drawLabelPill(ctx, 'Summit Clock: Ticks FASTER (Higher Potential)', gradX + gradW / 2, towerTopY + 54, {
        textColor: c.spaceColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      drawLabelPill(ctx, 'Base Clock: Ticks SLOWER (Deeper in Gravitational Well)', gradX + gradW / 2, towerBotY - 30, {
        textColor: c.timeColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      ctx.restore();

      // Header Tag
      drawLabelPill(ctx, 'Photons lose energy climbing the well: Wavelength Stretches (Redshift)', width / 2, 22, {
        textColor: c.photonColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function loop() {
      if (!state.isVisible) return;
      if (state.isPlaying) {
        state.phase = (state.phase + 0.005) % 1.0;
        state.baseSeconds += 0.016;
        updateReadouts();
        draw();
      }
      requestAnimationFrame(loop);
    }

    if (sliderHeight) {
      sliderHeight.addEventListener('input', function () {
        state.heightMeters = parseFloat(sliderHeight.value);
        var label = container.querySelector('.val-tower-height-label');
        if (label) label.textContent = state.heightMeters.toLocaleString() + ' m';
        updateReadouts();
        draw();
      });
    }

    if (sliderGravity) {
      sliderGravity.addEventListener('input', function () {
        state.gravityVal = parseFloat(sliderGravity.value);
        var label = container.querySelector('.val-tower-gravity-label');
        if (label) label.textContent = state.gravityVal.toFixed(1) + ' m/s²';
        updateReadouts();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying ? '<span>❚❚</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      });
    }

    for (var i = 0; i < chips.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chips.length; j++) chips[j].classList.remove('active');
          btn.classList.add('active');
          state.heightMeters = parseFloat(btn.getAttribute('data-h'));
          if (sliderHeight) sliderHeight.value = state.heightMeters;
          var label = container.querySelector('.val-tower-height-label');
          if (label) label.textContent = state.heightMeters.toLocaleString() + ' m';
          updateReadouts();
          draw();
        });
      })(chips[i]);
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // WIDGET 4: THE WARPED LOAF & THE GEODESIC APPLE (DUAL VIEW GRID)
  // ==========================================================================
  function initWidgetGeodesicApple(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasNewton = container.querySelector('.canvas-newton');
    var canvasEinstein = container.querySelector('.canvas-einstein');
    var sliderTime = container.querySelector('.slider-geodesic-time');
    var btnPlay = container.querySelector('.btn-play');
    var btnRelease = container.querySelector('.btn-release-toggle');

    var readoutNewtonState = container.querySelector('.readout-newton-state');
    var readoutEinsteinState = container.querySelector('.readout-einstein-state');

    var state = {
      t: 0.5,        // time parameter (0 to 1)
      isReleased: true,
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      if (sliderTime) sliderTime.value = Math.round(state.t * 1000);

      if (readoutNewtonState) {
        if (!state.isReleased) {
          readoutNewtonState.textContent = 'Held on branch: support force balances gravity (F_net = 0)';
        } else {
          readoutNewtonState.textContent = 'Free fall: downward gravitational force causes acceleration g';
        }
      }

      if (readoutEinsteinState) {
        if (!state.isReleased) {
          readoutEinsteinState.textContent = 'Held on branch: branch forces apple OFF its natural geodesic!';
        } else {
          readoutEinsteinState.textContent = 'Free fall: apple follows a straight geodesic through curved spacetime!';
        }
      }

      if (btnRelease) {
        btnRelease.textContent = state.isReleased ? 'Attach to Branch' : 'Release into Free Fall';
      }
    }

    function drawNewton(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 36, height - 36, width, height, 28);

      var branchY = height * 0.28;
      var groundY = height * 0.82;
      var appleX = width * 0.5;

      // Ground plane
      ctx.fillStyle = c.isLight ? '#e5e0d5' : '#282520';
      ctx.fillRect(0, groundY, width, height - groundY);

      // Tree branch
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(appleX - 70, branchY - 8);
      ctx.quadraticCurveTo(appleX, branchY, appleX + 70, branchY + 6);
      ctx.stroke();

      // Stem or Fall Trajectory
      var currentAppleY = branchY + 16;
      if (state.isReleased) {
        // Parabolic drop: y = y0 + 1/2 g t^2
        var dropFrac = state.t * state.t;
        currentAppleY = (branchY + 16) + dropFrac * (groundY - (branchY + 16) - 10);
      } else {
        // Stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(appleX, branchY + 3);
        ctx.lineTo(appleX, branchY + 14);
        ctx.stroke();
      }

      // Apple
      ctx.fillStyle = c.spaceColor;
      ctx.beginPath();
      ctx.arc(appleX, currentAppleY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Force vectors
      if (!state.isReleased) {
        // Upward support force from branch
        drawVector(ctx, appleX, currentAppleY, appleX, currentAppleY - 34, {
          color: c.timeColor,
          lineWidth: 2.2,
          arrowSize: 6
        });
        drawLabelPill(ctx, 'Support F_branch', appleX - 56, currentAppleY - 20, {
          textColor: c.timeColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });

        // Downward gravitational pull
        drawVector(ctx, appleX, currentAppleY, appleX, currentAppleY + 34, {
          color: c.spaceColor,
          lineWidth: 2.2,
          arrowSize: 6
        });
        drawLabelPill(ctx, 'Gravity F_g = mg', appleX + 56, currentAppleY + 20, {
          textColor: c.spaceColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      } else {
        // Single downward force arrow
        drawVector(ctx, appleX, currentAppleY, appleX, currentAppleY + 42, {
          color: c.spaceColor,
          lineWidth: 2.6,
          arrowSize: 7
        });
        drawLabelPill(ctx, 'Accelerating Downward (F = mg)', appleX, currentAppleY + 54, {
          textColor: c.spaceColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      drawLabelPill(ctx, 'Newtonian: Space is flat; invisible force pulls apple down', width / 2, 22, {
        textColor: c.spaceColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function drawEinstein(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);

      // Spacetime coordinates: Horizontal = Altitude y, Vertical = Coordinate Time ct (flowing downward or upward)
      var ox = 40;
      var oy = height - 40;
      var mapW = width - 80;
      var mapH = height - 80;

      // Draw warped metric grid lines (Proper time contours crowd near ground where time runs slower!)
      ctx.save();
      var numContourLines = 9;
      for (var i = 0; i <= numContourLines; i++) {
        var frac = i / numContourLines;
        // Non-linear metric spacing
        var yCoord = oy - frac * mapH;
        ctx.strokeStyle = c.isLight ? 'rgba(29, 78, 216, 0.08)' : 'rgba(96, 165, 250, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Slices of constant proper time curve downward near ground
        ctx.moveTo(ox, yCoord);
        ctx.quadraticCurveTo(ox + mapW * 0.5, yCoord + 12 * (1.0 - frac), ox + mapW, yCoord);
        ctx.stroke();
      }

      drawAxes(ctx, ox, oy, width, height, 'Altitude (y)', 'Time (ct)');

      // Apple's Spacetime Worldline
      var startX = ox + mapW * 0.7; // high altitude
      var endX = ox + mapW * 0.15;   // ground level
      var startY = oy;               // t = 0
      var endY = oy - mapH;          // t = max

      if (!state.isReleased) {
        // Held on tree: altitude is constant, so worldline is vertical in space... BUT because spacetime is warped,
        // this vertical line is CURVED relative to geodesics!
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.stroke();

        var currPtY = startY - state.t * mapH;
        drawGlowingDot(ctx, startX, currPtY, c.timeColor, 5.0);

        drawLabelPill(ctx, 'Branch forces worldline OFF geodesic!', startX - 80, currPtY, {
          textColor: c.timeColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      } else {
        // Free fall: The apple follows a straight geodesic through curved spacetime!
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        var steps = 30;
        for (var s = 1; s <= steps; s++) {
          var frac = s / steps;
          var ptT = frac;
          var ptX = startX - (ptT * ptT) * (startX - endX);
          var ptY = startY - ptT * mapH;
          ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();

        var currFrac = state.t;
        var currX = startX - (currFrac * currFrac) * (startX - endX);
        var currY = startY - currFrac * mapH;
        drawGlowingDot(ctx, currX, currY, c.invariantColor, 5.5);

        drawLabelPill(ctx, 'Unaccelerated Geodesic (Straight in curved loaf)', currX + 60, currY, {
          textColor: c.invariantColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      ctx.restore();

      drawLabelPill(ctx, 'Einstein: Free fall is an unaccelerated straight geodesic!', width / 2, 22, {
        textColor: c.invariantColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function draw() {
      if (canvasNewton) {
        var r1 = setupRetinaCanvas(canvasNewton);
        drawNewton(r1.ctx, r1.width, r1.height);
      }
      if (canvasEinstein) {
        var r2 = setupRetinaCanvas(canvasEinstein);
        drawEinstein(r2.ctx, r2.width, r2.height);
      }
    }

    function loop() {
      if (!state.isPlaying || !state.isVisible) return;
      state.t += 0.006;
      if (state.t > 1.0) state.t = 0.0;
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function () {
        state.t = parseFloat(sliderTime.value) / 1000.0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    if (btnRelease) {
      btnRelease.addEventListener('click', function () {
        state.isReleased = !state.isReleased;
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

  // ==========================================================================
  // WIDGET 5: TIDAL FORCES: THE CURVATURE DETECTOR (COMPARISON GRID)
  // ==========================================================================
  function initWidgetTidalCurvature(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasFlat = container.querySelector('.canvas-tidal-flat');
    var canvasCurved = container.querySelector('.canvas-tidal-curved');
    var sliderProgress = container.querySelector('.slider-tidal-progress');
    var btnPlay = container.querySelector('.btn-play');
    var chipsOrientation = container.querySelectorAll('.chip-tidal-orientation');

    var readoutSeparation = container.querySelector('.readout-separation');
    var readoutCurvatureVerdict = container.querySelector('.readout-curvature-verdict');

    var state = {
      progress: 0.6, // 0 to 1
      orientation: 'horizontal', // 'horizontal' | 'vertical'
      isPlaying: false,
      isVisible: true
    };

    function updateReadouts() {
      if (sliderProgress) sliderProgress.value = Math.round(state.progress * 1000);

      var initialDist = 10.0; // meters
      var currentDist = initialDist;

      if (state.orientation === 'horizontal') {
        // Converges toward center of Earth
        currentDist = initialDist * (1.0 - state.progress * 0.38);
        if (readoutSeparation) {
          readoutSeparation.innerHTML = currentDist.toFixed(2) + ' <span>m (Converging)</span>';
        }
        if (readoutCurvatureVerdict) {
          readoutCurvatureVerdict.textContent = 'Horizontal geodesics converge toward planet center (Tidal compression)';
        }
      } else {
        // Vertical pair stretches apart
        currentDist = initialDist * (1.0 + state.progress * 0.45);
        if (readoutSeparation) {
          readoutSeparation.innerHTML = currentDist.toFixed(2) + ' <span>m (Stretching)</span>';
        }
        if (readoutCurvatureVerdict) {
          readoutCurvatureVerdict.textContent = 'Lower sphere accelerates faster than upper sphere (Tidal spaghettification)';
        }
      }
    }

    function drawFlat(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 36, height - 36, width, height, 28);

      var cabW = width * 0.7;
      var cabH = height * 0.72;
      var cabX = (width - cabW) / 2;
      var cabY = (height - cabH) / 2 + 10;

      // Rocket cabin
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cabX, cabY, cabW, cabH);

      var centerX = cabX + cabW / 2;
      var initialSepPx = 64;

      if (state.orientation === 'horizontal') {
        var xA = centerX - initialSepPx / 2;
        var xB = centerX + initialSepPx / 2;
        var yDrop = cabY + 30 + state.progress * (cabH - 70);

        // Parallel dashed tracks
        ctx.strokeStyle = c.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(xA, cabY + 20);
        ctx.lineTo(xA, cabY + cabH - 20);
        ctx.moveTo(xB, cabY + 20);
        ctx.lineTo(xB, cabY + cabH - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Spheres
        ctx.fillStyle = c.timeColor;
        ctx.beginPath();
        ctx.arc(xA, yDrop, 7, 0, Math.PI * 2);
        ctx.arc(xB, yDrop, 7, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal dimension line
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(xA, yDrop);
        ctx.lineTo(xB, yDrop);
        ctx.stroke();

        drawLabelPill(ctx, 'Δx = Constant (Parallel)', centerX, yDrop - 14, {
          textColor: c.timeColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      } else {
        // Vertical pair
        var xC = centerX;
        var yTop = cabY + 30 + state.progress * (cabH - 90);
        var yBot = yTop + initialSepPx;

        // Spheres
        ctx.fillStyle = c.timeColor;
        ctx.beginPath();
        ctx.arc(xC, yTop, 7, 0, Math.PI * 2);
        ctx.arc(xC, yBot, 7, 0, Math.PI * 2);
        ctx.fill();

        // Vertical dimension line
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(xC, yTop);
        ctx.lineTo(xC, yBot);
        ctx.stroke();

        drawLabelPill(ctx, 'Δy = Constant', xC + 44, (yTop + yBot) / 2, {
          textColor: c.timeColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      drawLabelPill(ctx, 'Uniform Rocket: Spacetime is flat (Zero tidal drift)', width / 2, 22, {
        textColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function drawCurved(ctx, width, height) {
      var c = getThemeColors();
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, 36, height - 36, width, height, 28);

      var cabW = width * 0.7;
      var cabH = height * 0.72;
      var cabX = (width - cabW) / 2;
      var cabY = (height - cabH) / 2 + 10;

      // Elevator cabin near Earth
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cabX, cabY, cabW, cabH);

      var centerX = cabX + cabW / 2;
      var centerOfEarthY = cabY + cabH + 280; // Earth's center far below

      if (state.orientation === 'horizontal') {
        var initialSepPx = 76;
        var startXA = centerX - initialSepPx / 2;
        var startXB = centerX + initialSepPx / 2;
        var startY = cabY + 30;

        // Radial convergence toward center of Earth
        var currentY = startY + state.progress * (cabH - 70);
        var fracFall = (currentY - startY) / (centerOfEarthY - startY);

        var currentXA = startXA + (centerX - startXA) * fracFall;
        var currentXB = startXB + (centerX - startXB) * fracFall;

        // Converging radial lines
        ctx.strokeStyle = c.isLight ? 'rgba(194, 65, 12, 0.15)' : 'rgba(251, 146, 60, 0.15)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(startXA, startY);
        ctx.lineTo(centerX, centerOfEarthY);
        ctx.moveTo(startXB, startY);
        ctx.lineTo(centerX, centerOfEarthY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Spheres
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.arc(currentXA, currentY, 7, 0, Math.PI * 2);
        ctx.arc(currentXB, currentY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal dimension line showing convergence
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(currentXA, currentY);
        ctx.lineTo(currentXB, currentY);
        ctx.stroke();

        drawLabelPill(ctx, 'Δx Shrinks! (Radial Convergence)', centerX, currentY - 14, {
          textColor: c.dangerColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      } else {
        // Vertical stretching: lower ball accelerates faster
        var xC = centerX;
        var startY = cabY + 30;
        var initialSepPx = 48;
        var stretchPx = state.progress * 38;

        var yTop = startY + state.progress * (cabH - 110);
        var yBot = yTop + initialSepPx + stretchPx;

        // Spheres
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.arc(xC, yTop, 7, 0, Math.PI * 2);
        ctx.arc(xC, yBot, 7, 0, Math.PI * 2);
        ctx.fill();

        // Vertical dimension line
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(xC, yTop);
        ctx.lineTo(xC, yBot);
        ctx.stroke();

        drawLabelPill(ctx, 'Δy Stretches! (Tidal Strain)', xC + 60, (yTop + yBot) / 2, {
          textColor: c.dangerColor,
          font: 'bold 9px "JetBrains Mono", monospace'
        });
      }

      drawLabelPill(ctx, 'Earth Gravity: True Spacetime Curvature (Riemann Tensor)', width / 2, 22, {
        textColor: c.dangerColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function draw() {
      if (canvasFlat) {
        var r1 = setupRetinaCanvas(canvasFlat);
        drawFlat(r1.ctx, r1.width, r1.height);
      }
      if (canvasCurved) {
        var r2 = setupRetinaCanvas(canvasCurved);
        drawCurved(r2.ctx, r2.width, r2.height);
      }
    }

    function loop() {
      if (!state.isPlaying || !state.isVisible) return;
      state.progress += 0.007;
      if (state.progress > 1.0) state.progress = 0.0;
      updateReadouts();
      draw();
      requestAnimationFrame(loop);
    }

    if (sliderProgress) {
      sliderProgress.addEventListener('input', function () {
        state.progress = parseFloat(sliderProgress.value) / 1000.0;
        state.isPlaying = false;
        if (btnPlay) btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
        updateReadouts();
        draw();
      });
    }

    for (var o = 0; o < chipsOrientation.length; o++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var p = 0; p < chipsOrientation.length; p++) chipsOrientation[p].classList.remove('active');
          btn.classList.add('active');
          state.orientation = btn.getAttribute('data-orientation');
          updateReadouts();
          draw();
        });
      })(chipsOrientation[o]);
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

  // ==========================================================================
  // WIDGET 6: THE SPACETIME FUNNEL & GRAVITATIONAL LENSING (3D EXPLORER)
  // ==========================================================================
  function initWidgetSpacetimeOrbit(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderMass = container.querySelector('.slider-star-mass');
    var sliderAngle = container.querySelector('.slider-view-angle');
    var btnLensing = container.querySelector('.btn-lensing-toggle');
    var btnPlay = container.querySelector('.btn-play');

    var readoutDeflectionAngle = container.querySelector('.readout-deflection-angle');
    var readoutOrbitalPeriod = container.querySelector('.readout-orbital-period');

    var state = {
      mass: 1.0,         // Solar masses
      tiltAngle: 35,     // degrees
      orbitPhase: 0,
      showEinsteinLight: true,
      isPlaying: true,
      isVisible: true
    };

    function updateReadouts() {
      // Einstein deflection = 4 G M / c^2 R (approx 1.75 arcsec for Sun)
      var deflectionArcsec = state.showEinsteinLight ? (1.75 * state.mass) : (0.875 * state.mass);
      if (readoutDeflectionAngle) {
        readoutDeflectionAngle.innerHTML = deflectionArcsec.toFixed(3) + ' <span>arcsec</span>';
      }
      if (readoutOrbitalPeriod) {
        var periodYears = 1.0 / Math.sqrt(state.mass);
        readoutOrbitalPeriod.innerHTML = periodYears.toFixed(2) + ' <span>yr</span>';
      }
      if (btnLensing) {
        btnLensing.textContent = state.showEinsteinLight
          ? 'Mode: Einstein (Space + Time = 1.75″)'
          : 'Mode: Newton (Corpuscular = 0.875″)';
      }
    }

    // 3D Isometric projection helper
    function project3D(x, y, z, cx, cy, tiltRad, zoom) {
      // Rotate around X axis by tiltRad
      var rotY = y * Math.cos(tiltRad) - z * Math.sin(tiltRad);
      var rotZ = y * Math.sin(tiltRad) + z * Math.cos(tiltRad);
      return {
        px: cx + x * zoom,
        py: cy + rotY * zoom
      };
    }

    function draw() {
      if (!canvas) return;
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var cx = width / 2;
      var cy = height * 0.52;
      var zoom = Math.min(width, height) * 0.0032;
      var tiltRad = (state.tiltAngle * Math.PI) / 180;

      // Draw Curved Spacetime Embedding Funnel (Wireframe Mesh)
      var gridR = 120;
      var radialSteps = 8;
      var circleSteps = 32;

      ctx.save();
      // Concentric circles warped downward near center
      for (var r = 1; r <= radialSteps; r++) {
        var radius = (r / radialSteps) * gridR;
        // Funnel depth z = - 2 * M / sqrt(r)
        var depth = - (45 * state.mass) / Math.sqrt(radius * 0.08);

        ctx.strokeStyle = c.isLight ? 'rgba(109, 40, 217, 0.15)' : 'rgba(192, 132, 252, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (var th = 0; th <= circleSteps; th++) {
          var angle = (th / circleSteps) * Math.PI * 2;
          var x = radius * Math.cos(angle);
          var y = radius * Math.sin(angle);
          var pt = project3D(x, y, depth, cx, cy, tiltRad, zoom);
          if (th === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        }
        ctx.stroke();
      }

      // Radial spoke lines
      var numSpokes = 16;
      for (var s = 0; s < numSpokes; s++) {
        var spAngle = (s / numSpokes) * Math.PI * 2;
        ctx.strokeStyle = c.isLight ? 'rgba(109, 40, 217, 0.12)' : 'rgba(192, 132, 252, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (var r = 1; r <= radialSteps; r++) {
          var rad = (r / radialSteps) * gridR;
          var dep = - (45 * state.mass) / Math.sqrt(rad * 0.08);
          var sx = rad * Math.cos(spAngle);
          var sy = rad * Math.sin(spAngle);
          var pt = project3D(sx, sy, dep, cx, cy, tiltRad, zoom);
          if (r === 1) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        }
        ctx.stroke();
      }

      // Central Massive Body (The Sun)
      var sunDepth = - (45 * state.mass) / Math.sqrt(12 * 0.08);
      var sunPt = project3D(0, 0, sunDepth, cx, cy, tiltRad, zoom);

      var sunGrad = ctx.createRadialGradient(sunPt.px, sunPt.py, 3, sunPt.px, sunPt.py, 18);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.6, '#f59e0b');
      sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunPt.px, sunPt.py, 18, 0, Math.PI * 2);
      ctx.fill();

      drawGlowingDot(ctx, sunPt.px, sunPt.py, '#facc15', 7);
      drawLabelPill(ctx, 'Central Mass (Sun)', sunPt.px, sunPt.py - 24, {
        textColor: '#d97706',
        font: 'bold 9px "JetBrains Mono", monospace'
      });

      // Earth Orbiting in Funnel (Helical Geodesic)
      var orbitR = gridR * 0.62;
      var orbitDepth = - (45 * state.mass) / Math.sqrt(orbitR * 0.08);

      // Orbital ellipse track
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (var a = 0; a <= 48; a++) {
        var ang = (a / 48) * Math.PI * 2;
        var ex = orbitR * Math.cos(ang);
        var ey = orbitR * Math.sin(ang);
        var ptE = project3D(ex, ey, orbitDepth, cx, cy, tiltRad, zoom);
        if (a === 0) ctx.moveTo(ptE.px, ptE.py);
        else ctx.lineTo(ptE.px, ptE.py);
      }
      ctx.stroke();

      // Earth Planet Dot
      var earthAng = state.orbitPhase * Math.PI * 2;
      var earthX = orbitR * Math.cos(earthAng);
      var earthY = orbitR * Math.sin(earthAng);
      var earthPt = project3D(earthX, earthY, orbitDepth, cx, cy, tiltRad, zoom);

      drawGlowingDot(ctx, earthPt.px, earthPt.py, c.timeColor, 5.0);
      drawLabelPill(ctx, 'Earth Geodesic', earthPt.px, earthPt.py + 16, {
        textColor: c.timeColor,
        font: 'bold 9px "JetBrains Mono", monospace'
      });

      // Gravitational Lensing Starlight Ray grazing the Sun
      var lightStartX = -gridR * 1.1;
      var lightEndX = gridR * 1.1;
      var lightYImpact = -gridR * 0.22; // passing just above sun

      var deflectionMultiplier = state.showEinsteinLight ? 2.0 : 1.0;
      var bendAmp = 18 * state.mass * deflectionMultiplier;

      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      var raySteps = 40;
      for (var rs = 0; rs <= raySteps; rs++) {
        var frac = rs / raySteps;
        var rx = lightStartX + frac * (lightEndX - lightStartX);
        // Lorentzian bend profile
        var distFromSun = Math.abs(rx);
        var ry = lightYImpact + bendAmp / (1.0 + (distFromSun * distFromSun) / 1200);
        var rz = 0; // along plane
        var ptR = project3D(rx, ry, rz, cx, cy, tiltRad, zoom);
        if (rs === 0) ctx.moveTo(ptR.px, ptR.py);
        else ctx.lineTo(ptR.px, ptR.py);
      }
      ctx.stroke();

      drawLabelPill(ctx, state.showEinsteinLight ? 'Einstein Starlight Ray (1.75″)' : 'Newton Corpuscular Ray (0.875″)', cx, height * 0.18, {
        textColor: c.photonColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      ctx.restore();

      // Header Tag
      drawLabelPill(ctx, 'Mass curves spacetime; free objects follow straight geodesics in the funnel', width / 2, 22, {
        textColor: c.invariantColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function loop() {
      if (!state.isVisible) return;
      if (state.isPlaying) {
        state.orbitPhase = (state.orbitPhase + 0.004 * Math.sqrt(state.mass)) % 1.0;
        draw();
      }
      requestAnimationFrame(loop);
    }

    if (sliderMass) {
      sliderMass.addEventListener('input', function () {
        state.mass = parseFloat(sliderMass.value);
        var label = container.querySelector('.val-star-mass-label');
        if (label) label.textContent = state.mass.toFixed(1) + ' M☉';
        updateReadouts();
        draw();
      });
    }

    if (sliderAngle) {
      sliderAngle.addEventListener('input', function () {
        state.tiltAngle = parseFloat(sliderAngle.value);
        var label = container.querySelector('.val-view-angle-label');
        if (label) label.textContent = state.tiltAngle + '°';
        draw();
      });
    }

    if (btnLensing) {
      btnLensing.addEventListener('click', function () {
        state.showEinsteinLight = !state.showEinsteinLight;
        updateReadouts();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        state.isPlaying = !state.isPlaying;
        btnPlay.innerHTML = state.isPlaying ? '<span>❚❚</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      });
    }

    observeSimulationVisibility(container, function () {
      state.isVisible = true;
    }, function () {
      state.isVisible = false;
    });

    registerDraw(draw);
    window.addEventListener('resize', draw);
    updateReadouts();
    draw();
    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initWidgetElevatorEquivalence('widget-elevator-equivalence');
    initWidgetLaserBending('widget-laser-bending');
    initWidgetTimeTower('widget-time-tower');
    initWidgetGeodesicApple('widget-geodesic-apple');
    initWidgetTidalCurvature('widget-tidal-curvature');
    initWidgetSpacetimeOrbit('widget-spacetime-orbit');
  });

})(window);
