/**
 * post-02.js - Part 2 Interactive Simulations: The Boundaries of Causality: Inside the Cosmic Light Cone
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

  function initWidgetDualSpeedSpacetime(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasSpeed = container.querySelector('.canvas-speed');
    var canvasSpacetime = container.querySelector('.canvas-spacetime');
    var sliderTheta = container.querySelector('.slider-theta');
    var btnPlay = container.querySelector('.btn-play');
    var valThetaLabel = container.querySelector('.val-theta-label');
    var elThetaReading = container.querySelector('.val-theta-reading');
    var elBadgeThetaStatus = container.querySelector('.badge-theta-status');

    var presetBtns = container.querySelectorAll('.preset-btn');

    var thetaDeg = parseFloat(sliderTheta ? sliderTheta.value : 0) || 0;
    var isPlaying = false;
    var isVisible = true;
    var playAnimId = null;
    var playDirection = 1;

    function updateReadouts() {
      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var phiRad = Math.atan(vx);
      var phiDeg = (phiRad * 180) / Math.PI;

      if (sliderTheta) sliderTheta.value = thetaDeg.toFixed(1);
      if (valThetaLabel) valThetaLabel.textContent = 'Tilt φ: ' + phiDeg.toFixed(1) + '°';
      if (elThetaReading) elThetaReading.innerHTML = thetaDeg.toFixed(1) + '<span>°</span>';
      if (elBadgeThetaStatus) {
        if (thetaDeg === 0) elBadgeThetaStatus.textContent = 'AT REST (v = 0)';
        else if (thetaDeg >= 89.9) elBadgeThetaStatus.textContent = 'PURE LIGHT (v = c)';
        else elBadgeThetaStatus.textContent = 'v = ' + vx.toFixed(2) + 'c';
      }

      for (var p = 0; p < presetBtns.length; p++) {
        var pTheta = parseFloat(presetBtns[p].getAttribute('data-theta'));
        if (Math.abs(pTheta - thetaDeg) < 1.0) {
          presetBtns[p].classList.add('active');
        } else {
          presetBtns[p].classList.remove('active');
        }
      }
    }

    function drawSpeedSpace() {
      if (!canvasSpeed) return;
      var ret = setupRetinaCanvas(canvasSpeed);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var ox = 50;
      var oy = height - 45;
      var radius = Math.min(width - 80, height - 75);

      drawGrid(ctx, ox, oy, width, height, 32);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + radius + 25, oy);
      ctx.stroke();

      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(ox + radius + 25, oy - 4);
      ctx.lineTo(ox + radius + 32, oy);
      ctx.lineTo(ox + radius + 25, oy + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - radius - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox - 4, oy - radius - 25);
      ctx.lineTo(ox, oy - radius - 32);
      ctx.lineTo(ox + 4, oy - radius - 25);
      ctx.fill();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('v_space (Motion)', ox + radius - 60, oy + 22);

      ctx.fillStyle = colors.timeColor;
      ctx.fillText('v_time (Aging)', ox + 8, oy - radius - 12);

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('0', ox - 14, oy + 14);
      ctx.fillText('c', ox + radius - 3, oy + 16);
      ctx.fillText('c', ox - 16, oy - radius + 4);

      ctx.strokeStyle = colors.invariantColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.invariantColor;
      ctx.fillText('Total Speed = c', ox + radius * 0.55, oy - radius * 0.75);

      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var vt = Math.cos(thetaRad);

      var tipX = ox + vx * radius;
      var tipY = oy - vt * radius;

      drawDropLines(ctx, ox, oy, tipX, tipY, {
        spaceColor: colors.spaceColor,
        timeColor: colors.timeColor,
        lineWidth: 1.5,
        lineDash: [3, 3]
      });

      if (thetaDeg > 1) {
        ctx.strokeStyle = colors.photonColor;
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.arc(ox, oy, 32, -Math.PI / 2, -Math.PI / 2 + thetaRad, false);
        ctx.stroke();

        var labelAngle = -Math.PI / 2 + thetaRad / 2;
        var lx = ox + Math.cos(labelAngle) * 44;
        var ly = oy + Math.sin(labelAngle) * 44;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.photonColor;
        ctx.fillText('θ=' + thetaDeg.toFixed(0) + '°', lx - 10, ly + 4);
      }

      drawVector(ctx, ox, oy, tipX, tipY, {
        color: colors.photonColor,
        lineWidth: 3.5,
        mode: 'velocity'
      });

      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var pillPad = 12;
      var pillW = width - pillPad * 2;
      if (ctx.roundRect) {
        ctx.roundRect(pillPad, 12, pillW, 26, 6);
      } else {
        ctx.rect(pillPad, 12, pillW, 26);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 ' + (width < 440 ? '9px' : '10.5px') + ' "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      if (width < 440) {
        if (thetaDeg === 0) {
          ctx.fillText('θ = 0° : 100% in Time (At Rest)', pillPad + 8, 28);
        } else if (thetaDeg >= 89.9) {
          ctx.fillText('θ = 90° : Pure Space (v = c)', pillPad + 8, 28);
        } else {
          ctx.fillText('θ = ' + thetaDeg.toFixed(0) + '° : v_space=' + (vx * 100).toFixed(0) + '%c, v_time=' + (vt * 100).toFixed(0) + '%c', pillPad + 8, 28);
        }
      } else {
        if (thetaDeg === 0) {
          ctx.fillText('θ = 0° : 100% Motion in Time (Sitting at Rest)', pillPad + 10, 29);
        } else if (thetaDeg >= 89.9) {
          ctx.fillText('θ = 90° : 100% Motion in Space (Speed of Light, v = c)', pillPad + 10, 29);
        } else {
          ctx.fillText('θ = ' + thetaDeg.toFixed(1) + '° : v_space = ' + (vx * 100).toFixed(1) + '%c, v_time = ' + (vt * 100).toFixed(1) + '%c', pillPad + 10, 29);
        }
      }
    }

    function drawSpacetime() {
      if (!canvasSpacetime) return;
      var ret = setupRetinaCanvas(canvasSpacetime);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var ox = width / 2;
      var oy = height - 45;
      var scale = Math.min((width / 2) - 40, height - 75);

      drawGrid(ctx, ox, oy, width, height, 32);

      var coneXLeft = ox - scale;
      var coneXRight = ox + scale;
      var coneYTop = oy - scale;

      // Shaded Future Causal Cone
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.07)' : 'rgba(56, 189, 248, 0.09)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXLeft, coneYTop);
      ctx.lineTo(coneXRight, coneYTop);
      ctx.closePath();
      ctx.fill();

      // Shaded Elsewhere
      ctx.fillStyle = colors.isLight ? 'rgba(220, 38, 38, 0.06)' : 'rgba(248, 113, 113, 0.08)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXLeft, coneYTop);
      ctx.lineTo(10, coneYTop);
      ctx.lineTo(10, oy);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXRight, coneYTop);
      ctx.lineTo(width - 10, coneYTop);
      ctx.lineTo(width - 10, oy);
      ctx.closePath();
      ctx.fill();

      // Light Cone Boundary Lines
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXLeft, coneYTop);
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXRight, coneYTop);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.photonColor;
      ctx.fillText('Photon (45°)', coneXRight - 65, coneYTop + 16);
      ctx.fillText('Light Cone (v = c)', coneXLeft + 8, coneYTop + 16);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(25, oy);
      ctx.lineTo(width - 25, oy);
      ctx.stroke();

      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(width - 25, oy - 4);
      ctx.lineTo(width - 18, oy);
      ctx.lineTo(width - 25, oy + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - scale - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox - 4, oy - scale - 25);
      ctx.lineTo(ox, oy - scale - 32);
      ctx.lineTo(ox + 4, oy - scale - 25);
      ctx.fill();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('+x (Space)', width - 85, oy + 18);
      ctx.fillText('-x', 25, oy + 18);

      ctx.fillStyle = colors.timeColor;
      ctx.fillText('ct (Time)', ox + 8, oy - scale - 12);

      // Alice: Stationary Worldline
      ctx.strokeStyle = colors.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, coneYTop);
      ctx.stroke();

      var numTicks = 5;
      for (var i = 1; i <= numTicks; i++) {
        var ty = oy - (scale / numTicks) * i;
        ctx.strokeStyle = colors.timeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox - 4, ty);
        ctx.lineTo(ox + 4, ty);
        ctx.stroke();

        ctx.font = '500 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.timeColor;
        ctx.fillText(i + 's', ox + 7, ty + 3);
      }

      // Bob: Moving Worldline
      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var phiRad = Math.atan(vx);
      var phiDeg = (phiRad * 180) / Math.PI;

      var bobTopX = ox + vx * scale;
      var bobTopY = oy - scale;

      ctx.strokeStyle = colors.spaceColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(bobTopX, bobTopY);
      ctx.stroke();

      var vt = Math.cos(thetaRad);
      if (vt > 0.05) {
        var gamma = 1 / vt;
        for (var j = 1; j <= numTicks; j++) {
          var ctCoord = (scale / numTicks) * j * gamma;
          if (ctCoord <= scale) {
            var bx = ox + vx * ctCoord;
            var by = oy - ctCoord;

            var perpAngle = phiRad + Math.PI / 2;
            var tickLen = 4;
            ctx.strokeStyle = colors.spaceColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx - Math.cos(perpAngle) * tickLen, by + Math.sin(perpAngle) * tickLen);
            ctx.lineTo(bx + Math.cos(perpAngle) * tickLen, by - Math.sin(perpAngle) * tickLen);
            ctx.stroke();

            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.spaceColor;
            ctx.fillText(j + 's', bx + 6, by + 3);
          }
        }
      }

      if (phiDeg > 1) {
        ctx.strokeStyle = colors.spaceColor;
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.arc(ox, oy, 40, -Math.PI / 2, -Math.PI / 2 + phiRad, false);
        ctx.stroke();

        var labelAngle = -Math.PI / 2 + phiRad / 2;
        var lx = ox + Math.cos(labelAngle) * 52;
        var ly = oy + Math.sin(labelAngle) * 52;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.spaceColor;
        ctx.fillText('φ=' + phiDeg.toFixed(1) + '°', lx - 12, ly);
      }

      drawGlowingDot(ctx, bobTopX, bobTopY, colors.spaceColor, 6);

      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var pillPad = 12;
      var pillW = width - pillPad * 2;
      if (ctx.roundRect) {
        ctx.roundRect(pillPad, 12, pillW, 26, 6);
      } else {
        ctx.rect(pillPad, 12, pillW, 26);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 ' + (width < 440 ? '9px' : '10.5px') + ' "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      if (width < 440) {
        if (thetaDeg === 0) {
          ctx.fillText('Bob: φ = 0° (At Rest, τ = 100%)', pillPad + 8, 28);
        } else if (thetaDeg >= 89.9) {
          ctx.fillText('Bob: φ = 45° (On Light Cone, τ = 0s)', pillPad + 8, 28);
        } else {
          ctx.fillText('Bob: φ = ' + phiDeg.toFixed(1) + '° · Watch rate: ' + (vt * 100).toFixed(0) + '%', pillPad + 8, 28);
        }
      } else {
        if (thetaDeg === 0) {
          ctx.fillText('Bob Worldline: φ = 0° (Vertical, Standing Beside Alice)', pillPad + 10, 29);
        } else if (thetaDeg >= 89.9) {
          ctx.fillText('Bob Worldline: φ = 45.0° (Lying on Light Cone! τ = 0.00s Frozen)', pillPad + 10, 29);
        } else {
          ctx.fillText('Bob Worldline: φ = ' + phiDeg.toFixed(1) + '° · Proper time ticks run at ' + (vt * 100).toFixed(0) + '% rate', pillPad + 10, 29);
        }
      }
    }

    function renderAll() {
      updateReadouts();
      drawSpeedSpace();
      drawSpacetime();
    }

    if (sliderTheta) {
      sliderTheta.addEventListener('input', function (e) {
        thetaDeg = parseFloat(e.target.value);
        if (isPlaying) stopPlay();
        renderAll();
      });
    }

    bindChipGroup(container, '.preset-btn', {
      dataAttr: 'theta',
      slider: sliderTheta,
      onSelect: function (val) {
        thetaDeg = val;
        if (isPlaying) stopPlay();
        renderAll();
      }
    });

    function stopPlay() {
      isPlaying = false;
      if (playAnimId) {
        cancelAnimationFrame(playAnimId);
        playAnimId = null;
      }
      if (btnPlay) {
        btnPlay.innerHTML = '<span>▶</span><span>Auto Sweep</span>';
      }
    }

    function runLoop() {
      if (!playAnimId && isPlaying && isVisible) {
        var lastTime = performance.now();
        function step(now) {
          if (!isPlaying || !isVisible) {
            playAnimId = null;
            return;
          }
          var dt = (now - lastTime) / 1000;
          lastTime = now;
          if (dt > 0.2) dt = 0.2;

          thetaDeg += playDirection * dt * 18;
          if (thetaDeg >= 90) {
            thetaDeg = 90;
            playDirection = -1;
          } else if (thetaDeg <= 0) {
            thetaDeg = 0;
            playDirection = 1;
          }
          renderAll();
          playAnimId = requestAnimationFrame(step);
        }
        playAnimId = requestAnimationFrame(step);
      }
    }

    function startPlay() {
      isPlaying = true;
      if (btnPlay) {
        btnPlay.innerHTML = '<span>⏸</span><span>Pause</span>';
      }
      runLoop();
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        if (isPlaying) stopPlay();
        else startPlay();
      });
    }

    observeSimulationVisibility(container, function () {
      isVisible = true;
      if (isPlaying) runLoop();
    }, function () {
      isVisible = false;
      if (playAnimId) {
        cancelAnimationFrame(playAnimId);
        playAnimId = null;
      }
    });

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 1b: Expanding Circles — 2×2 grid of light ripple snapshots at t=0,1,2,3
  function initWidgetExpandingCircles(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var panels = container.querySelectorAll('canvas.circle-panel');
    if (!panels || panels.length === 0) return;

    // Maximum time value drives the coordinate scale so all four panels share the same grid
    var MAX_T = 3;

    function drawPanel(canvas, t) {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      // Padding around the axes
      var pad = Math.max(28, Math.min(38, w * 0.11));
      var plotW = w - pad * 2;
      var plotH = h - pad * 2;
      var ox = pad + plotW / 2;   // origin x
      var oy = pad + plotH / 2;   // origin y
      // Scale: the full plot width spans [-MAX_T … +MAX_T]
      var scale = Math.min(plotW, plotH) / 2 / MAX_T;

      // ── Background subtle grid ──────────────────────────────────────────────
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 0.5;
      for (var g = -MAX_T; g <= MAX_T; g++) {
        var gx = ox + g * scale;
        ctx.beginPath();
        ctx.moveTo(gx, pad);
        ctx.lineTo(gx, h - pad);
        ctx.stroke();
        var gy = oy + g * scale;
        ctx.beginPath();
        ctx.moveTo(pad, gy);
        ctx.lineTo(w - pad, gy);
        ctx.stroke();
      }

      // ── Axes ────────────────────────────────────────────────────────────────
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      // x-axis
      ctx.beginPath();
      ctx.moveTo(pad, oy);
      ctx.lineTo(w - pad + 6, oy);
      ctx.stroke();
      // y-axis
      ctx.beginPath();
      ctx.moveTo(ox, pad);
      ctx.lineTo(ox, h - pad + 6);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(w - pad + 6, oy - 3);
      ctx.lineTo(w - pad + 11, oy);
      ctx.lineTo(w - pad + 6, oy + 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ox - 3, pad);
      ctx.lineTo(ox, pad - 5);
      ctx.lineTo(ox + 3, pad);
      ctx.fill();

      // Axis labels
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('x', w - pad + 13, oy + 3);
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('y', ox + 5, pad - 7);

      // ── Light circle (or origin dot for t=0) ────────────────────────────────
      var radius = t * scale;

      if (t === 0) {
        // Just a glowing origin dot — the flash "here and now"
        drawGlowingDot(ctx, ox, oy, colors.photonColor, 5);
      } else {
        // Filled disc with low alpha showing the interior (inside the light shell)
        ctx.fillStyle = colors.isLight
          ? 'rgba(250, 204, 21, 0.10)'
          : 'rgba(250, 204, 21, 0.13)';
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();

        // The circle itself (the wavefront)
        ctx.strokeStyle = colors.photonColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = colors.photonColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radius arrow from origin to right edge of circle
        ctx.strokeStyle = colors.isLight ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + radius, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // 'r = ct' label along the radius arrow
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.photonColor;
        var labelX = Math.min(w - pad - 4, ox + radius / 2 - 12);
        ctx.fillText('r=' + t + 'c', labelX, oy - 5);

        // Origin dot
        drawGlowingDot(ctx, ox, oy, colors.invariantColor, 3);
      }

      // ── Panel time label (top-left pill) ────────────────────────────────────
      var pillW = 46, pillH = 20, pillX = 8, pillY = 8;
      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, 5);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      ctx.fillText('t = ' + t, pillX + 7, pillY + 13);
    }

    function renderAll() {
      for (var i = 0; i < panels.length; i++) {
        var t = parseInt(panels[i].getAttribute('data-t'), 10);
        drawPanel(panels[i], t);
      }
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 1c: The Mathematical Synthesis Grid — 2×2 archetypes connecting Velocity Space & Spacetime
  function initWidgetSynthesisGrid(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var panels = container.querySelectorAll('.synthesis-canvas-wrap canvas');
    if (!panels || panels.length === 0) return;

    // Archetype definitions for the 4 panels
    var archetypes = {
      '0': {
        thetaDeg: 0,
        thetaRad: 0,
        vx: 0,
        vt: 1,
        phiDeg: 0,
        properRate: 1.0,
        title: 'Stationary Observer (At Rest)',
        desc: 'All speed directed through time'
      },
      '30': {
        thetaDeg: 30,
        thetaRad: (30 * Math.PI) / 180,
        vx: 0.5,
        vt: Math.cos((30 * Math.PI) / 180), // 0.866
        phiDeg: (Math.atan(0.5) * 180) / Math.PI, // 26.57°
        properRate: Math.cos((30 * Math.PI) / 180),
        title: 'Cruising Sub-light (v = 0.50c)',
        desc: 'Balanced space and time motion'
      },
      '60': {
        thetaDeg: 60,
        thetaRad: (60 * Math.PI) / 180,
        vx: Math.sin((60 * Math.PI) / 180), // 0.866
        vt: 0.5,
        phiDeg: (Math.atan(Math.sin((60 * Math.PI) / 180)) * 180) / Math.PI, // 40.89°
        properRate: 0.5,
        title: 'Ultra-Relativistic (v = 0.866c)',
        desc: 'Heavily tilted, clock runs at ½ rate'
      },
      '90': {
        thetaDeg: 90,
        thetaRad: (90 * Math.PI) / 180,
        vx: 1.0,
        vt: 0,
        phiDeg: 45.0,
        properRate: 0.0,
        title: 'The Photon Bound (v = c)',
        desc: 'Pure spatial speed, clock stands still'
      }
    };

    function drawPanel(canvas, key) {
      var data = archetypes[key];
      if (!data) return;

      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      // We split the canvas horizontally: Left = Velocity Space (mini circle), Right = Coordinate Spacetime
      var dividerX = Math.round(w * 0.44);

      // Subtle divider line
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dividerX, 8);
      ctx.lineTo(dividerX, h - 8);
      ctx.stroke();

      // ==========================================
      // 1. LEFT SIDE: VELOCITY CIRCLE (PART 1)
      // ==========================================
      var leftW = dividerX;
      var lPad = Math.max(16, Math.min(24, leftW * 0.12));
      var lOx = lPad + (leftW - lPad * 2) * 0.35;
      var lOy = h - lPad - 16;
      var lRadius = Math.min((leftW - lPad * 2) * 0.85, (h - lPad * 2 - 28));

      // Velocity axes
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.25;
      // vx axis (horizontal)
      ctx.beginPath();
      ctx.moveTo(lOx - 4, lOy);
      ctx.lineTo(lOx + lRadius + 14, lOy);
      ctx.stroke();
      // vt axis (vertical)
      ctx.beginPath();
      ctx.moveTo(lOx, lOy + 4);
      ctx.lineTo(lOx, lOy - lRadius - 14);
      ctx.stroke();

      // Axis labels
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('v_x', lOx + lRadius + 4, lOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_t', lOx - 16, lOy - lRadius - 4);

      // The circular constraint arc (|V| = c)
      ctx.strokeStyle = c.isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([2.5, 2.5]);
      ctx.beginPath();
      ctx.arc(lOx, lOy, lRadius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed vector tip
      var tipX = lOx + Math.sin(data.thetaRad) * lRadius;
      var tipY = lOy - Math.cos(data.thetaRad) * lRadius;

      // Projection lines
      ctx.strokeStyle = c.isLight ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX, lOy);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(lOx, tipY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Theta arc
      if (data.thetaDeg > 0) {
        ctx.strokeStyle = c.photonColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(lOx, lOy, Math.min(22, lRadius * 0.4), -Math.PI / 2, -Math.PI / 2 + data.thetaRad, false);
        ctx.stroke();
      }

      // 4-Velocity Vector
      drawVector(ctx, lOx, lOy, tipX, tipY, {
        color: c.photonColor,
        lineWidth: 2.25,
        mode: 'velocity',
        arrowLength: 5.5
      });

      // Mini Header Left
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.fillText('SPEED SPACE: θ = ' + data.thetaDeg + '°', lPad - 6, 16);

      // Readouts Left
      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('v_x=' + data.vx.toFixed(2) + 'c', lOx + 8, lOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_t=' + data.vt.toFixed(2) + 'c', lPad - 6, lOy - lRadius + 10);

      // ==========================================
      // 2. RIGHT SIDE: COORDINATE SPACETIME (PART 2)
      // ==========================================
      var rightW = w - dividerX;
      var rPad = Math.max(14, Math.min(22, rightW * 0.12));
      var rOx = dividerX + rPad + (rightW - rPad * 2) * (w < 380 ? 0.32 : 0.28);
      var rOy = h - rPad - 16;
      var rScale = Math.min((rightW - rPad * 2) * 0.70, (h - rPad * 2 - 28));

      // 45° Light cone reference line
      var coneX = rOx + rScale;
      var coneY = rOy - rScale;

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(56, 189, 248, 0.06)';
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(coneX, coneY);
      ctx.lineTo(rOx, coneY);
      ctx.closePath();
      ctx.fill();

      // 45° photon line
      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(coneX, coneY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spacetime axes
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.25;
      // x axis
      ctx.beginPath();
      ctx.moveTo(rOx - 4, rOy);
      ctx.lineTo(rOx + rScale + 14, rOy);
      ctx.stroke();
      // ct axis
      ctx.beginPath();
      ctx.moveTo(rOx, rOy + 4);
      ctx.lineTo(rOx, rOy - rScale - 14);
      ctx.stroke();

      // Axis labels
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('x', rOx + rScale + 4, rOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('ct', rOx - 14, rOy - rScale - 4);

      // Worldline
      var wlTopX = rOx + data.vx * rScale;
      var wlTopY = rOy - rScale;

      ctx.strokeStyle = data.thetaDeg === 90 ? c.photonColor : c.spaceColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(wlTopX, wlTopY);
      ctx.stroke();
      drawGlowingDot(ctx, wlTopX, wlTopY, data.thetaDeg === 90 ? c.photonColor : c.spaceColor, 3.5);

      // Proper time ticks along worldline
      if (data.thetaDeg < 90) {
        var numTicks = 3;
        for (var t = 1; t <= numTicks; t++) {
          var frac = t / numTicks;
          // In coordinate time ct, each tick appears at dt = dtau / cos(theta)
          // For visual clarity, ticks are spaced by proper time dtau
          var tickFrac = frac / (data.properRate > 0 ? 1 : 1);
          if (tickFrac <= 1.0) {
            var tx = rOx + (wlTopX - rOx) * frac;
            var ty = rOy + (wlTopY - rOy) * frac;
            
            // Draw cross tick mark perpendicular to worldline
            var perpAngle = Math.atan2(wlTopY - rOy, wlTopX - rOx) + Math.PI / 2;
            var tickLen = 3.5;
            ctx.strokeStyle = c.timeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx - Math.cos(perpAngle) * tickLen, ty - Math.sin(perpAngle) * tickLen);
            ctx.lineTo(tx + Math.cos(perpAngle) * tickLen, ty + Math.sin(perpAngle) * tickLen);
            ctx.stroke();
          }
        }
      }

      // Mini Header Right
      ctx.font = '700 ' + (w < 380 ? '7.5px' : '8px') + ' "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.fillText('SPACETIME: φ = ' + data.phiDeg.toFixed(1) + '°', dividerX + 8, 16);

      // Readouts Right
      ctx.font = '600 ' + (w < 380 ? '7px' : '7.5px') + ' "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('tan φ = ' + data.vx.toFixed(2), dividerX + 8, 28);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('dτ = ' + (data.properRate * 100).toFixed(0) + '% dt', dividerX + 8, 39);
    }

    function renderAll() {
      for (var i = 0; i < panels.length; i++) {
        var p = panels[i];
        var key = p.getAttribute('data-preset');
        drawPanel(p, key);
      }
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 2: 3D Light Cone Explorer
  function initWidget3DLightConeExplorer(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    if (!canvas) return;

    var sliderTime = container.querySelector('.slider-time');
    var sliderAzimuth = container.querySelector('.slider-azimuth');
    var sliderElevation = container.querySelector('.slider-elevation');
    var btnReset = container.querySelector('.btn-reset-view');

    var elRegionBadge = container.querySelector('.badge-region');
    var elSliceTime = container.querySelector('.val-slice-time');
    var elWaveRadius = container.querySelector('.val-wave-radius');

    var azimuth = 0.65;
    var elevation = parseFloat(sliderElevation ? sliderElevation.value : 0.05) || 0.05;
    var sliceT = parseFloat(sliderTime ? sliderTime.value : 0.4) || 0.4;

    var btnPlay3D = container.querySelector('.btn-play-3d');
    var elValSliceBadge = container.querySelector('.val-slice-badge');
    var sliceBtns = container.querySelectorAll('.preset-slice-btn');
    var viewBtns = container.querySelectorAll('.preset-view-btn');

    var isPlaying3D = false;
    var playAnimId3D = null;
    var playDirection3D = 1;

    function project3DLocal(x, y, z, cx, cy, scale, az, el) {
      var p = project3D(x, y, z, cx, cy, scale, az, el);
      return {
        x: p.x,
        y: cy - p.zDepth * scale,
        depth: p.yFinal
      };
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var cx = width / 2;
      var cy = height / 2;
      var scale = Math.min(width, height) * (height <= 300 ? 0.31 : 0.38);

      var gridStep = 0.25;
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = -1; x <= 1.01; x += gridStep) {
        var p1 = project3DLocal(x, -1, 0, cx, cy, scale, azimuth, elevation);
        var p2 = project3DLocal(x, 1, 0, cx, cy, scale, azimuth, elevation);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      for (var y = -1; y <= 1.01; y += gridStep) {
        var p1y = project3DLocal(-1, y, 0, cx, cy, scale, azimuth, elevation);
        var p2y = project3DLocal(1, y, 0, cx, cy, scale, azimuth, elevation);
        ctx.moveTo(p1y.x, p1y.y);
        ctx.lineTo(p2y.x, p2y.y);
      }
      ctx.stroke();

      var origin = project3DLocal(0, 0, 0, cx, cy, scale, azimuth, elevation);
      var axisX = project3DLocal(1.15, 0, 0, cx, cy, scale, azimuth, elevation);
      var axisY = project3DLocal(0, 1.15, 0, cx, cy, scale, azimuth, elevation);
      var axisZPos = project3DLocal(0, 0, 1.25, cx, cy, scale, azimuth, elevation);
      var axisZNeg = project3DLocal(0, 0, -1.25, cx, cy, scale, azimuth, elevation);

      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.75;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(axisZNeg.x, axisZNeg.y);
      ctx.lineTo(origin.x, origin.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axisZPos.x, axisZPos.y);
      ctx.stroke();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.timeColor;
      ctx.fillText('+ct (Future)', axisZPos.x + 8, axisZPos.y + 4);
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('-ct (Past)', axisZNeg.x + 8, axisZNeg.y + 4);

      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('x (Space 1)', axisX.x + 6, axisX.y + 4);
      ctx.fillText('y (Space 2)', axisY.x + 6, axisY.y + 4);

      var coneLevels = [-1.0, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1.0];
      var numCirclePts = 36;

      for (var k = 0; k < coneLevels.length; k++) {
        var level = coneLevels[k];
        var radius = Math.abs(level);
        ctx.strokeStyle = colors.isLight ? 'rgba(217, 119, 6, 0.25)' : 'rgba(250, 204, 21, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (var i = 0; i <= numCirclePts; i++) {
          var angle = (i / numCirclePts) * Math.PI * 2;
          var px = Math.cos(angle) * radius;
          var py = Math.sin(angle) * radius;
          var pt = project3DLocal(px, py, level, cx, cy, scale, azimuth, elevation);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      var numGenerators = 8;
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 1.5;
      for (var g = 0; g < numGenerators; g++) {
        var gAngle = (g / numGenerators) * Math.PI * 2;
        var cosA = Math.cos(gAngle);
        var sinA = Math.sin(gAngle);

        var pBottom = project3DLocal(cosA, sinA, -1.0, cx, cy, scale, azimuth, elevation);
        var pTop = project3DLocal(cosA, sinA, 1.0, cx, cy, scale, azimuth, elevation);

        ctx.beginPath();
        ctx.moveTo(pBottom.x, pBottom.y);
        ctx.lineTo(origin.x, origin.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.stroke();
      }

      var planeRadius = 1.15;
      var slicePlanePts = [
        project3DLocal(-planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(-planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation)
      ];

      ctx.fillStyle = sliceT >= 0
        ? (colors.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)')
        : (colors.isLight ? 'rgba(100, 116, 139, 0.06)' : 'rgba(148, 163, 184, 0.05)');
      ctx.beginPath();
      ctx.moveTo(slicePlanePts[0].x, slicePlanePts[0].y);
      for (var p = 1; p < 4; p++) ctx.lineTo(slicePlanePts[p].x, slicePlanePts[p].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = colors.timeColor;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      var waveR = Math.abs(sliceT);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var w = 0; w <= numCirclePts; w++) {
        var wAngle = (w / numCirclePts) * Math.PI * 2;
        var wpx = Math.cos(wAngle) * waveR;
        var wpy = Math.sin(wAngle) * waveR;
        var wpt = project3DLocal(wpx, wpy, sliceT, cx, cy, scale, azimuth, elevation);
        if (w === 0) ctx.moveTo(wpt.x, wpt.y);
        else ctx.lineTo(wpt.x, wpt.y);
      }
      ctx.stroke();

      var sliceCenter = project3DLocal(0, 0, sliceT, cx, cy, scale, azimuth, elevation);
      drawGlowingDot(ctx, sliceCenter.x, sliceCenter.y, colors.timeColor, 4.5);

      var emerald = colors.isLight ? '#059669' : '#10b981';
      drawGlowingDot(ctx, origin.x, origin.y, emerald, 6);

      ctx.font = '700 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = emerald;
      ctx.fillText('YOU: HERE & NOW (t=0)', origin.x + 12, origin.y + 4);

      if (elSliceTime) elSliceTime.textContent = (sliceT >= 0 ? '+' : '') + sliceT.toFixed(2) + ' c·t';
    if (elWaveRadius) elWaveRadius.textContent = waveR.toFixed(2);
    if (elValSliceBadge) elValSliceBadge.textContent = (sliceT >= 0 ? '+' : '') + sliceT.toFixed(2);

    if (sliderTime && !isPlaying3D && document.activeElement !== sliderTime) {
      sliderTime.value = sliceT.toFixed(2);
    }

    sliceBtns.forEach(function (btn) {
      var sVal = parseFloat(btn.getAttribute('data-slice'));
      if (Math.abs(sVal - sliceT) < 0.12) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (elRegionBadge) {
      if (Math.abs(sliceT) < 0.05) {
        elRegionBadge.textContent = 'THE PRESENT: HERE & NOW';
        elRegionBadge.style.color = emerald;
      } else if (sliceT > 0) {
        elRegionBadge.textContent = 'CAUSAL FUTURE (Expanding Wave: r = ct)';
        elRegionBadge.style.color = colors.timeColor;
      } else {
        elRegionBadge.textContent = 'CAUSAL PAST (Converging Wave: r = c|t|)';
        elRegionBadge.style.color = colors.photonColor;
      }
    }
  }

  function stopPlay3D() {
    isPlaying3D = false;
    if (playAnimId3D) {
      cancelAnimationFrame(playAnimId3D);
      playAnimId3D = null;
    }
    if (btnPlay3D) {
      btnPlay3D.innerHTML = '<span>▶</span><span>Auto Sweep</span>';
    }
  }

  function startPlay3D() {
    isPlaying3D = true;
    if (btnPlay3D) {
      btnPlay3D.innerHTML = '<span>⏸</span><span>Pause</span>';
    }
    var lastTime = performance.now();
    function step(now) {
      if (!isPlaying3D) return;
      var dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) dt = 0.1;

      sliceT += playDirection3D * dt * 0.45;
      if (sliceT >= 0.95) {
        sliceT = 0.95;
        playDirection3D = -1;
      } else if (sliceT <= -0.95) {
        sliceT = -0.95;
        playDirection3D = 1;
      }
      if (sliderTime) sliderTime.value = sliceT.toFixed(2);
      draw();
      playAnimId3D = requestAnimationFrame(step);
    }
    playAnimId3D = requestAnimationFrame(step);
  }

  if (btnPlay3D) {
    btnPlay3D.addEventListener('click', function () {
      if (isPlaying3D) stopPlay3D();
      else startPlay3D();
    });
  }

  sliceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sVal = parseFloat(btn.getAttribute('data-slice'));
      if (!isNaN(sVal)) {
        sliceT = sVal;
        if (sliderTime) sliderTime.value = sliceT.toFixed(2);
        if (isPlaying3D) stopPlay3D();
        draw();
      }
    });
  });

  viewBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var azVal = parseFloat(btn.getAttribute('data-az'));
      var elVal = parseFloat(btn.getAttribute('data-el'));
      if (!isNaN(azVal) && !isNaN(elVal)) {
        azimuth = azVal;
        elevation = elVal;
        if (sliderAzimuth) sliderAzimuth.value = azimuth.toFixed(2);
        if (sliderElevation) sliderElevation.value = elevation.toFixed(2);
        draw();
      }
    });
  });

  attachOrbitControls(canvas, {
    azimuth: azimuth,
    elevation: elevation,
    minElevation: -0.6,
    maxElevation: 1.2,
    sliderElevation: sliderElevation,
    onChange: function (st) {
      azimuth = st.azimuth;
      elevation = st.elevation;
      if (sliderAzimuth) sliderAzimuth.value = azimuth.toFixed(2);
      draw();
    }
  });

  if (sliderTime) {
    sliderTime.addEventListener('input', function (e) {
      sliceT = parseFloat(e.target.value);
      if (isPlaying3D) stopPlay3D();
      draw();
    });
  }

  if (sliderAzimuth) {
    sliderAzimuth.addEventListener('input', function (e) {
      azimuth = parseFloat(e.target.value);
      draw();
    });
  }

  if (sliderElevation) {
    sliderElevation.addEventListener('input', function (e) {
      elevation = parseFloat(e.target.value);
      draw();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function () {
      azimuth = 0.65;
      elevation = 0.05;
      sliceT = 0.4;
      if (isPlaying3D) stopPlay3D();
      if (sliderTime) sliderTime.value = 0.4;
      if (sliderAzimuth) sliderAzimuth.value = 0.65;
      if (sliderElevation) sliderElevation.value = 0.05;
      draw();
    });
  }

  observeSimulationVisibility(container, function () {
    // visible
  }, function () {
    if (isPlaying3D) stopPlay3D();
  });

  registerDraw(draw);
  window.addEventListener('resize', draw);
  draw();
}

  // SIMULATION 3: Cosmic Horizon & Human Lifespan Simulator (Split 03A Space & 03B Spacetime)
  function initWidgetCosmicHorizon(containerId) {
    // Find all relevant containers (split 03A and 03B, or fallback single container)
    var containerA = document.getElementById('widget-cosmic-horizon-space');
    var containerB = document.getElementById('widget-cosmic-horizon-spacetime');
    var fallbackContainer = containerId ? document.getElementById(containerId) : document.getElementById('widget-cosmic-horizon');

    var containers = [];
    if (containerA) containers.push(containerA);
    if (containerB) containers.push(containerB);
    if (fallbackContainer && containers.indexOf(fallbackContainer) === -1) containers.push(fallbackContainer);
    if (containers.length === 0) return;

    var canvasRadarList = [];
    var canvasConeList = [];
    var slidersAge = [];
    var elsAgeNum = [];
    var elsAgeReading = [];
    var badgesHorizonStatus = [];
    var cardsHorizonStatus = [];
    var allPresetBtns = [];
    var btnsAutoAge = [];

    containers.forEach(function (c) {
      var cr = c.querySelector('.canvas-radar');
      if (cr) canvasRadarList.push(cr);
      var cc = c.querySelector('.canvas-spacetime-cone');
      if (cc) canvasConeList.push(cc);

      var sa = c.querySelector('.slider-lifespan-age');
      if (sa) slidersAge.push(sa);
      var an = c.querySelector('.val-age-num');
      if (an) elsAgeNum.push(an);
      var ar = c.querySelector('.val-age-reading');
      if (ar) elsAgeReading.push(ar);
      var bh = c.querySelector('.badge-horizon-status');
      if (bh) badgesHorizonStatus.push(bh);
      var ch = c.querySelector('.clock-horizon-status-card');
      if (ch) cardsHorizonStatus.push(ch);
      var pb = c.querySelectorAll('.preset-star');
      if (pb && pb.length) pb.forEach(function (btn) { allPresetBtns.push(btn); });
      var ba = c.querySelector('.btn-auto-age');
      if (ba) btnsAutoAge.push(ba);
    });

    var currentAge = 25;
    if (slidersAge.length > 0) {
      currentAge = parseFloat(slidersAge[0].value) || 25;
    }

    var selectedStar = {
      name: 'Vega',
      label: 'Vega (25 ly)',
      dist: 25.0,
      angle: -0.45 // angle in physical radar space (radians)
    };

    var stars = [
      { name: 'The Sun', label: 'Sun (8.3m)', dist: 0.000016, angle: 0 },
      { name: 'Proxima Centauri', label: 'Proxima (4.2 ly)', dist: 4.2, angle: 1.85 },
      { name: 'Sirius', label: 'Sirius (8.6 ly)', dist: 8.6, angle: 3.6 },
      { name: 'Vega', label: 'Vega (25 ly)', dist: 25.0, angle: -0.45 },
      { name: 'Regulus', label: 'Regulus (79 ly)', dist: 79.0, angle: 0.95 },
      { name: 'Alkaid', label: 'Alkaid (104 ly)', dist: 104.0, angle: -2.35 }
    ];

    var isPlaying = false;
    var isVisible = true;
    var animFrameId = null;
    var maxLifespan = 80;
    var maxRadarDist = 106; // Zoomed-in coordinate radius: Alkaid (104 ly) sits comfortably at the perimeter
    var maxTimePlot = 115;  // vertical time axis scale in years

    function updateTelemetry() {
      slidersAge.forEach(function (sl) { sl.value = currentAge.toFixed(1); });
      elsAgeNum.forEach(function (el) { el.textContent = currentAge.toFixed(1) + ' yrs'; });
      elsAgeReading.forEach(function (el) { el.innerHTML = currentAge.toFixed(1) + ' <span>yrs</span>'; });

      var hasWitnessed = currentAge >= selectedStar.dist;
      var isArrivingNow = Math.abs(currentAge - selectedStar.dist) < 1.0;

      badgesHorizonStatus.forEach(function (b) {
        if (isArrivingNow) {
          b.textContent = selectedStar.name.toUpperCase() + ' ARRIVING NOW!';
        } else if (hasWitnessed) {
          b.textContent = selectedStar.name.toUpperCase() + ' WITNESSED';
        } else if (selectedStar.dist > maxLifespan) {
          b.textContent = selectedStar.name.toUpperCase() + ' (ELSEWHERE)';
        } else {
          var waitYrs = (selectedStar.dist - currentAge).toFixed(0);
          b.textContent = selectedStar.name.toUpperCase() + ' (' + waitYrs + 'y AWAY)';
        }
      });

      cardsHorizonStatus.forEach(function (card) {
        if (selectedStar.dist > maxLifespan && !hasWitnessed) {
          card.className = 'clock-card danger clock-horizon-status-card';
        } else if (hasWitnessed) {
          card.className = 'clock-card emerald clock-horizon-status-card';
        } else {
          card.className = 'clock-card cyan clock-horizon-status-card';
        }
      });

      // Update preset chips active state across all containers
      allPresetBtns.forEach(function (btn) {
        var pName = btn.getAttribute('data-name');
        if (pName === selectedStar.name) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // ── 1. Physical Stellar Radar Canvas (Simulation 03A) ─────────────────────
    function drawRadar() {
      if (canvasRadarList.length === 0) return;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      canvasRadarList.forEach(function (cRadar) {
        var ret = setupRetinaCanvas(cRadar);
        var ctx = ret.ctx, w = ret.width, h = ret.height;
        ctx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;
        // Zoomed in with tight margin (14px) so inner stars have generous separation
        var maxPlotR = Math.min(cx, cy) - 14;
        var scale = maxPlotR / maxRadarDist; // pixels per light-year

        // Concentric subtle radar rings (20, 40, 60, 80, 100 ly)
        ctx.strokeStyle = colors.gridLine;
        ctx.lineWidth = 0.75;
        var rings = [20, 40, 60, 80, 100];
        for (var r = 0; r < rings.length; r++) {
          var radiusPx = rings[r] * scale;
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = '500 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.subtleText;
          ctx.fillText(rings[r] + ' ly', cx + 4, cy - radiusPx + 10);
        }

        // Expanding Earth Causal Bubble / Reach (r = currentAge * c)
        var bubbleR = currentAge * scale;
        if (bubbleR > 0) {
          ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.16)';
          ctx.beginPath();
          ctx.arc(cx, cy, bubbleR, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = colors.timeColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = colors.timeColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(cx, cy, bubbleR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Radius label
          if (bubbleR > 20) {
            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.timeColor;
            ctx.fillText('r = ' + currentAge.toFixed(1) + ' ly', cx + bubbleR * 0.5 - 18, cy + 12);
          }
        }

        // Draw Selected Star's expanding wavefront from star towards Earth
        if (selectedStar.dist >= 1.0) {
          var starX = cx + Math.cos(selectedStar.angle) * selectedStar.dist * scale;
          var starY = cy + Math.sin(selectedStar.angle) * selectedStar.dist * scale;

          var starWaveR = currentAge * scale;
          ctx.strokeStyle = colors.isLight ? 'rgba(234, 88, 12, 0.65)' : 'rgba(251, 146, 60, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(starX, starY, starWaveR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Earth at the center
        var isEarthReceiving = Math.abs(currentAge - selectedStar.dist) < 1.2;
        if (isEarthReceiving && selectedStar.dist >= 1.0) {
          // Flash arrival pulse on Earth
          ctx.fillStyle = colors.photonColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        drawGlowingDot(ctx, cx, cy, emerald, 5);
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = emerald;
        ctx.fillText('Earth (You)', cx + 8, cy + 3);

        // Draw Stars
        for (var s = 0; s < stars.length; s++) {
          var star = stars[s];
          if (star.dist < 0.001) continue; // Sun on center

          var isSelected = star.name === selectedStar.name;
          var hasReached = currentAge >= star.dist;

          var sx = cx + Math.cos(star.angle) * star.dist * scale;
          var sy = cy + Math.sin(star.angle) * star.dist * scale;

          if (hasReached) {
            // Reached / Witnessed: glowing golden flare
            drawGlowingDot(ctx, sx, sy, colors.photonColor, isSelected ? 6.5 : 4.5);
            if (isSelected) {
              ctx.strokeStyle = colors.photonColor;
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]);
              ctx.beginPath();
              ctx.arc(sx, sy, 11, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            var alignRight = (sx > w - 85);
            var textX = alignRight ? (sx - 8) : (sx + 8);
            ctx.textAlign = alignRight ? 'right' : 'left';

            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.photonColor;
            ctx.fillText(star.label, textX, sy - 2);
            ctx.font = '500 8px "JetBrains Mono", monospace';
            ctx.fillStyle = emerald;
            ctx.fillText('✓ Reached at ' + star.dist.toFixed(1) + 'y', textX, sy + 8);
            ctx.textAlign = 'left';
          } else {
            // Not yet reached: dimmed / waiting
            ctx.fillStyle = star.dist > maxLifespan ? danger : (colors.isLight ? '#94a3b8' : '#64748b');
            ctx.beginPath();
            ctx.arc(sx, sy, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (isSelected) {
              ctx.strokeStyle = star.dist > maxLifespan ? danger : colors.timeColor;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(sx, sy, 9, 0, Math.PI * 2);
              ctx.stroke();
            }

            var alignRightNotReached = (sx > w - 85);
            var textXNotReached = alignRightNotReached ? (sx - 8) : (sx + 8);
            ctx.textAlign = alignRightNotReached ? 'right' : 'left';

            ctx.font = (isSelected ? '700' : '600') + ' 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = isSelected ? (star.dist > maxLifespan ? danger : colors.textPrimary) : colors.subtleText;
            ctx.fillText(star.label, textXNotReached, sy + 3);

            if (star.dist > maxLifespan) {
              ctx.font = '500 7.5px "JetBrains Mono", monospace';
              ctx.fillStyle = danger;
              ctx.fillText('Elsewhere (' + star.dist.toFixed(0) + 'y)', textXNotReached, sy + 13);
            }
            ctx.textAlign = 'left';
          }
        }
      });
    }

    // ── 2. Spacetime Coordinate Canvas (Simulation 03B, x vs ct) ────────────
    function drawSpacetimeCone() {
      if (canvasConeList.length === 0) return;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      canvasConeList.forEach(function (cCone) {
        var ret = setupRetinaCanvas(cCone);
        var ctx = ret.ctx, w = ret.width, h = ret.height;
        ctx.clearRect(0, 0, w, h);

        var padLeft = 45;
        var padRight = 35;
        var padBottom = 32;
        var padTop = 25;

        var ox = padLeft + (w - padLeft - padRight) / 2;
        var oy = h - padBottom;
        var plotW = (w - padLeft - padRight) / 2;
        var plotH = oy - padTop;

        var scaleX = plotW / maxTimePlot; // pixels per light-year
        var scaleY = plotH / maxTimePlot;  // pixels per year

        drawGrid(ctx, ox, oy, w, h, 36);

        // Axes
        ctx.strokeStyle = colors.axisLine;
        ctx.lineWidth = 1.75;

        // Horizontal space axis
        ctx.beginPath();
        ctx.moveTo(padLeft - 10, oy);
        ctx.lineTo(w - padRight + 15, oy);
        ctx.stroke();

        // Vertical time axis
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, padTop - 12);
        ctx.stroke();

        // Arrowheads
        ctx.fillStyle = colors.axisArrow;
        ctx.beginPath();
        ctx.moveTo(w - padRight + 15, oy - 3);
        ctx.lineTo(w - padRight + 21, oy);
        ctx.lineTo(w - padRight + 15, oy + 3);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(ox - 3, padTop - 12);
        ctx.lineTo(ox, padTop - 18);
        ctx.lineTo(ox + 3, padTop - 12);
        ctx.fill();

        // Axis labels
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.spaceColor;
        ctx.fillText('+x (ly)', w - padRight - 15, oy + 18);
        ctx.fillText('-x', padLeft - 8, oy + 18);
        ctx.fillStyle = colors.timeColor;
        ctx.fillText('ct (Years)', ox + 8, padTop - 8);

        // Axis tick marks (Space: ±40, ±80, ±100 ly)
        ctx.font = '500 8px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.subtleText;
        var spaceTicks = w < 440 ? [-80, -40, 40] : [-100, -80, -40, 40, 80, 100];
        for (var st = 0; st < spaceTicks.length; st++) {
          var tickX = ox + spaceTicks[st] * scaleX;
          ctx.strokeStyle = colors.axisLine;
          ctx.beginPath();
          ctx.moveTo(tickX, oy - 3);
          ctx.lineTo(tickX, oy + 3);
          ctx.stroke();
          ctx.fillText(spaceTicks[st], tickX - (Math.abs(spaceTicks[st]) >= 100 ? 12 : 8), oy + 12);
        }

        // Time ticks: 20, 40, 60, 80, 100 yr
        var timeTicks = [20, 40, 60, 80, 100];
        for (var tt = 0; tt < timeTicks.length; tt++) {
          var valT = timeTicks[tt];
          var tickY = oy - valT * scaleY;
          ctx.strokeStyle = colors.axisLine;
          ctx.beginPath();
          ctx.moveTo(ox - 3, tickY);
          ctx.lineTo(ox + 3, tickY);
          ctx.stroke();
          ctx.fillText(valT + 'y', ox - (valT >= 100 ? 30 : 24), tickY + 3);
        }

        // Maximum 80-year lifespan horizontal line
        var y80 = oy - 80 * scaleY;
        ctx.strokeStyle = danger;
        ctx.lineWidth = 1.25;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ox - 85 * scaleX, y80);
        ctx.lineTo(ox + 85 * scaleX, y80);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = danger;
        ctx.fillText('80-Yr Life Boundary', ox + 35 * scaleX, y80 - 4);

        // Past Light Cone at Current Age
        var apexY = oy - currentAge * scaleY;
        var coneLeftX = ox - currentAge * scaleX;
        var coneRightX = ox + currentAge * scaleX;

        if (currentAge > 0) {
          // Shaded Past Light Cone interior
          ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.14)';
          ctx.beginPath();
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneLeftX, oy);
          ctx.lineTo(coneRightX, oy);
          ctx.closePath();
          ctx.fill();

          // Light cone boundaries (45° photon paths)
          ctx.strokeStyle = colors.photonColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneLeftX, oy);
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneRightX, oy);
          ctx.stroke();

          if (currentAge >= 15) {
            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.photonColor;
            ctx.fillText('Past Light Cone', ox + (currentAge * scaleX) * 0.4 + 4, apexY + (currentAge * scaleY) * 0.5);
          }
        }

        // Observer's Worldline (at x = 0, climbs from t = 0 to t = currentAge)
        ctx.strokeStyle = colors.timeColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, apexY);
        ctx.stroke();

        // Glowing dot for observer's current moment
        drawGlowingDot(ctx, ox, apexY, colors.timeColor, 6);
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.timeColor;
        ctx.fillText('You: Age ' + currentAge.toFixed(1), ox + 10, apexY + 3);

        // Star events at t = 0 (emitted on day you were born)
        for (var s = 0; s < stars.length; s++) {
          var star = stars[s];
          if (star.dist < 0.001) continue;

          var isSelected = star.name === selectedStar.name;
          var hasReached = currentAge >= star.dist;

          var starX = ox + star.dist * scaleX;
          var starY = oy;

          // Event dot on t=0 axis
          drawGlowingDot(ctx, starX, starY, hasReached ? colors.photonColor : (star.dist > maxLifespan ? danger : (colors.isLight ? '#94a3b8' : '#64748b')), isSelected ? 6 : 3.5);

          // Worldline of star (vertical line at x = star.dist)
          ctx.strokeStyle = colors.isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(starX, oy);
          ctx.lineTo(starX, padTop);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ray of light racing to Earth (reaches observer's worldline at t = star.dist)
          var arrivalY = oy - star.dist * scaleY;
          ctx.strokeStyle = star.dist > maxLifespan ? danger : colors.photonColor;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(starX, starY);
          ctx.lineTo(ox, arrivalY);
          ctx.stroke();

          if (isSelected) {
            drawGlowingDot(ctx, ox, arrivalY, star.dist > maxLifespan ? danger : emerald, 5);
            ctx.font = '700 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = star.dist > maxLifespan ? danger : emerald;
            var arrTxt = 'Arrival: t=' + star.dist.toFixed(0) + 'y' + (star.dist > maxLifespan ? ' (After Death)' : '');
            var arrW = ctx.measureText(arrTxt).width;
            var arrX = Math.max(8, ox - arrW - 8);
            ctx.fillText(arrTxt, arrX, arrivalY - 4);
          }

          var displayName = star.name === 'Proxima Centauri' ? 'Proxima' : star.name;
          ctx.font = (isSelected ? '700' : '500') + ' 8px "JetBrains Mono", monospace';
          ctx.fillStyle = isSelected ? (star.dist > maxLifespan ? danger : colors.photonColor) : colors.subtleText;
          var starNameW = ctx.measureText(displayName).width;
          var starNameX = Math.min(w - padRight - starNameW + 10, Math.max(ox + 4, starX - starNameW / 2));
          var starNameY = oy + (w < 440 ? (s % 2 === 0 ? 21 : 28) : 24);
          ctx.fillText(displayName, starNameX, starNameY);
        }
      });
    }

    function renderAll() {
      updateTelemetry();
      drawRadar();
      drawSpacetimeCone();
    }

    slidersAge.forEach(function (slider) {
      slider.addEventListener('input', function (e) {
        currentAge = parseFloat(e.target.value);
        if (isPlaying) stopAnimation();
        renderAll();
      });
    });

    allPresetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dist = parseFloat(btn.getAttribute('data-dist'));
        var name = btn.getAttribute('data-name');
        for (var i = 0; i < stars.length; i++) {
          if (stars[i].name === name || Math.abs(stars[i].dist - dist) < 0.01) {
            selectedStar = stars[i];
            break;
          }
        }
        if (isPlaying) stopAnimation();
        renderAll();
      });
    });

    function stopAnimation() {
      isPlaying = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      btnsAutoAge.forEach(function (btn) {
        btn.innerHTML = '<span>▶</span><span>Simulate Lifespan</span>';
      });
    }

    function runAnimation() {
      if (!animFrameId && isPlaying && isVisible) {
        var lastTime = performance.now();
        function step(now) {
          if (!isPlaying || !isVisible) {
            animFrameId = null;
            return;
          }
          var dt = (now - lastTime) / 1000;
          lastTime = now;
          if (dt > 0.2) dt = 0.2;

          currentAge += dt * 10; // 10 years per second
          if (currentAge >= maxLifespan) {
            currentAge = maxLifespan;
            renderAll();
            stopAnimation();
            return;
          }

          renderAll();
          animFrameId = requestAnimationFrame(step);
        }
        animFrameId = requestAnimationFrame(step);
      }
    }

    function startAnimation() {
      isPlaying = true;
      btnsAutoAge.forEach(function (btn) {
        btn.innerHTML = '<span>⏸</span><span>Pause</span>';
      });
      runAnimation();
    }

    btnsAutoAge.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (isPlaying) {
          stopAnimation();
        } else {
          if (currentAge >= maxLifespan) currentAge = 0;
          startAnimation();
        }
      });
    });

    containers.forEach(function (c) {
      observeSimulationVisibility(c, function () {
        isVisible = true;
        if (isPlaying) runAnimation();
      }, function () {
        isVisible = false;
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
      });
    });

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // ILLUSTRATION 02b: The 8-Minute Sun & Causality Lag (Dual View)
  function initWidgetSunDelay(containerId) {
    var container = document.getElementById(containerId || 'widget-sun-delay');
    if (!container) return;

    var canvasSpace = container.querySelector('.canvas-sun-space');
    var canvasSpacetime = container.querySelector('.canvas-sun-spacetime');
    if (!canvasSpace && !canvasSpacetime) return;

    var sliderTime = container.querySelector('.slider-sun-time');
    var elSunTime = container.querySelector('.val-sun-time');
    var elTimeClock = container.querySelector('.val-time-clock');
    var badgeStatus = container.querySelector('.badge-sun-status');
    var clockCard = container.querySelector('.clock-status-card');
    var btnPlay = container.querySelector('.btn-play-sun');
    var presetBtns = container.querySelectorAll('.preset-sun-time');

    var currentTime = 250; // seconds (0 to 600)
    var isPlaying = false;
    var isVisible = true;
    var animFrameId = null;

    function formatTimeMinSec(sec) {
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
    }

    function updateControls() {
      if (sliderTime) sliderTime.value = currentTime;
      if (elSunTime) elSunTime.innerHTML = Math.round(currentTime) + ' <span>s</span>';
      if (elTimeClock) elTimeClock.textContent = formatTimeMinSec(currentTime);

      var isElsewhere = currentTime < 500;
      if (badgeStatus) {
        badgeStatus.textContent = isElsewhere ? 'ELSEWHERE' : 'CAUSAL FUTURE';
      }
      if (clockCard) {
        if (isElsewhere) {
          clockCard.className = 'clock-card cyan clock-status-card';
        } else {
          clockCard.className = 'clock-card danger clock-status-card';
        }
      }

      presetBtns.forEach(function (btn) {
        var tVal = parseFloat(btn.getAttribute('data-time'));
        if (Math.abs(tVal - currentTime) < 18) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // ── 1. Physical Space Track Canvas ────────────────────────────────────
    function drawSpace() {
      if (!canvasSpace) return;
      var colors = getThemeColors();
      var ret = setupRetinaCanvas(canvasSpace);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      ctx.clearRect(0, 0, w, h);

      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';
      var sunColor = colors.photonColor || '#f59e0b';

      var padLeft = 60;
      var padRight = 65;
      var cy = h * 0.48;

      var sunX = padLeft;
      var earthX = w - padRight;
      var totalTrackDist = earthX - sunX;

      drawGrid(ctx, sunX, cy, w, h, 34);

      // Distance Axis Track Line
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sunX - 25, cy);
      ctx.lineTo(earthX + 35, cy);
      ctx.stroke();

      // Axis ticks and labels
      var ticks = (w < 440) ? [
        { frac: 0.0, label: 'Sun (0)', sub: 't=0s' },
        { frac: 0.5, label: '75M km', sub: '250s' },
        { frac: 1.0, label: 'Earth (1 AU)', sub: '500s (8m)' }
      ] : [
        { frac: 0.0, label: '0 km (Sun)', sub: 't = 0s' },
        { frac: 0.5, label: '75M km', sub: 't = 250s' },
        { frac: 1.0, label: '150M km (Earth)', sub: 't = 500s (8m 20s)' }
      ];
      ticks.forEach(function (tk) {
        var tx = sunX + tk.frac * totalTrackDist;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(tx, cy - 4);
        ctx.lineTo(tx, cy + 4);
        ctx.stroke();

        ctx.font = '600 ' + (w < 440 ? '7.5px' : '8px') + ' "JetBrains Mono", monospace';
        ctx.fillStyle = colors.subtleText;
        ctx.textAlign = 'center';
        ctx.fillText(tk.label, tx, cy + 16);
        ctx.font = '500 ' + (w < 440 ? '6.5px' : '7px') + ' "JetBrains Mono", monospace';
        ctx.fillText(tk.sub, tx, cy + 26);
      });

      // Wavefront Position
      var waveFrac = currentTime / 500.0;
      var waveX = sunX + waveFrac * totalTrackDist;

      // Void / Causal Shadow Region (behind wavefront)
      var clampedWaveX = Math.min(earthX + 35, Math.max(sunX, waveX));
      if (clampedWaveX > sunX) {
        ctx.fillStyle = colors.isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(15, 23, 42, 0.40)';
        ctx.fillRect(sunX, cy - 75, clampedWaveX - sunX, 150);

        if (clampedWaveX - sunX > 75) {
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillStyle = danger;
          ctx.textAlign = 'center';
          ctx.fillText('CAUSAL SHADOW', (sunX + clampedWaveX) / 2, cy - 50);
          ctx.font = '500 7px "JetBrains Mono", monospace';
          ctx.fillText('Darkness & Zero Gravity', (sunX + clampedWaveX) / 2, cy - 38);
        }
      }

      // Pre-Vanish Sunlight En Route (ahead of wavefront)
      if (waveX < earthX) {
        ctx.fillStyle = colors.isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)';
        ctx.fillRect(waveX, cy - 75, earthX - waveX, 150);

        ctx.strokeStyle = colors.isLight ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);
        var beamYs = [-35, -18, 0, 18, 35];
        beamYs.forEach(function (by) {
          ctx.beginPath();
          ctx.moveTo(waveX, cy + by);
          ctx.lineTo(earthX, cy + by);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        if (earthX - waveX > 90) {
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.isLight ? '#b45309' : '#fbbf24';
          ctx.textAlign = 'center';
          ctx.fillText('PRE-VANISH SUNLIGHT', (waveX + earthX) / 2, cy - 50);
          ctx.font = '500 7px "JetBrains Mono", monospace';
          ctx.fillText('Speed c · Gravity Active', (waveX + earthX) / 2, cy - 38);
        }
      }

      // Wavefront line & arrow
      if (currentTime > 0) {
        ctx.strokeStyle = sunColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = sunColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(waveX, cy, 70, -Math.PI / 2.8, Math.PI / 2.8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.moveTo(waveX + 8, cy);
        ctx.lineTo(waveX + 1, cy - 4);
        ctx.lineTo(waveX + 1, cy + 4);
        ctx.closePath();
        ctx.fill();

        var wavePillX = Math.min(w - 70, Math.max(sunX + 45, waveX));
        drawLabelPill(ctx, 'Wavefront (v = c)', wavePillX, cy - 85, {
          textColor: sunColor,
          font: 'bold 8.5px "JetBrains Mono", monospace'
        });
      }

      // Vanished Sun Marker
      ctx.strokeStyle = colors.isLight ? 'rgba(234, 88, 12, 0.6)' : 'rgba(251, 146, 60, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(sunX, cy, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.isLight ? '#ea580c' : '#fb923c';
      ctx.beginPath();
      ctx.arc(sunX, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      drawLabelPill(ctx, 'Sun (Vanished)', sunX, cy + 45, {
        textColor: colors.isLight ? '#c2410c' : '#fb923c',
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Earth & State
      var isElsewhere = currentTime < 500;
      var isArriving = Math.abs(currentTime - 500) < 10;

      // Orbit arc
      ctx.strokeStyle = isElsewhere ? (colors.isLight ? 'rgba(5, 150, 105, 0.35)' : 'rgba(16, 185, 129, 0.35)') : colors.borderSubtle;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(sunX, cy, totalTrackDist, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!isElsewhere) {
        var driftFrac = (currentTime - 500) / 100.0;
        var earthCurrY = cy - driftFrac * 36;

        ctx.strokeStyle = danger;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(earthX, cy);
        ctx.lineTo(earthX, cy - 45);
        ctx.stroke();
        ctx.setLineDash([]);

        drawGlowingDot(ctx, earthX, earthCurrY, danger, 7);
        ctx.fillStyle = colors.isLight ? '#334155' : '#1e293b';
        ctx.beginPath();
        ctx.arc(earthX, earthCurrY, 6, 0, Math.PI * 2);
        ctx.fill();

        drawLabelPill(ctx, 'Earth: CAUSAL FUTURE', earthX - 25, earthCurrY - 22, {
          textColor: danger,
          font: 'bold 8.5px "JetBrains Mono", monospace'
        });
      } else {
        drawGlowingDot(ctx, earthX, cy, emerald, isArriving ? 11 : 6.5);
        ctx.fillStyle = colors.photonColor;
        ctx.beginPath();
        ctx.arc(earthX, cy, 6.5, Math.PI / 2, -Math.PI / 2, false);
        ctx.fill();

        if (isArriving) {
          ctx.strokeStyle = colors.photonColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(earthX, cy, 16, 0, Math.PI * 2);
          ctx.stroke();

          drawLabelPill(ctx, 'WAVEFRONT HITS (8m 20s)', earthX - 35, cy - 25, {
            textColor: colors.photonColor,
            font: 'bold 9px "JetBrains Mono", monospace'
          });
        } else {
          drawLabelPill(ctx, 'Earth: ELSEWHERE', earthX - 30, cy - 24, {
            textColor: emerald,
            font: 'bold 8.5px "JetBrains Mono", monospace'
          });
        }
      }

      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = isElsewhere ? emerald : danger;
      ctx.textAlign = 'center';
      ctx.fillText(isElsewhere ? 'Orbit Stable · Daylight' : 'Tangent Drift · Darkness', earthX, cy + 45);
    }

    // ── 2. Coordinate Spacetime Canvas (x vs ct) ──────────────────────────
    function drawSpacetime() {
      if (!canvasSpacetime) return;
      var colors = getThemeColors();
      var ret = setupRetinaCanvas(canvasSpacetime);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      ctx.clearRect(0, 0, w, h);

      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';
      var photonCol = colors.photonColor || '#f59e0b';

      var padLeft = 45;
      var padRight = 30;
      var padBottom = 34;
      var padTop = 26;

      var ox = padLeft + 15;
      var oy = h - padBottom;
      var plotW = w - ox - padRight;
      var plotH = oy - padTop;

      // Ensure exact 45° slope for light: Δx == Δ(ct)
      // 500 light-seconds fits comfortably on both axes
      var scale = Math.min((plotW * 0.72) / 500, (plotH * 0.80) / 500);
      var scaleX = scale;
      var scaleY = scale;

      drawGrid(ctx, ox, oy, w, h, 34);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;

      // Horizontal space axis (+x)
      ctx.beginPath();
      ctx.moveTo(ox - 10, oy);
      ctx.lineTo(w - padRight + 10, oy);
      ctx.stroke();

      // Vertical time axis (+ct)
      ctx.beginPath();
      ctx.moveTo(ox, oy + 8);
      ctx.lineTo(ox, padTop - 12);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(w - padRight + 10, oy - 3);
      ctx.lineTo(w - padRight + 16, oy);
      ctx.lineTo(w - padRight + 10, oy + 3);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox - 3, padTop - 12);
      ctx.lineTo(ox, padTop - 18);
      ctx.lineTo(ox + 3, padTop - 12);
      ctx.fill();

      // Axis labels
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('+x (ls)', w - padRight - 8, oy + 16);
      ctx.fillStyle = colors.timeColor;
      ctx.fillText('ct (Seconds)', ox + 8, padTop - 8);

      // Space ticks (250 ls, 500 ls = 1 AU)
      ctx.font = '500 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      [250, 500].forEach(function (sx) {
        var tx = ox + sx * scaleX;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(tx, oy - 3);
        ctx.lineTo(tx, oy + 3);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText(sx + (sx === 500 ? ' (1 AU)' : ' ls'), tx, oy + 14);
      });

      // Time ticks (250s, 500s = 8m20s, 600s)
      [250, 500, 600].forEach(function (st) {
        var ty = oy - st * scaleY;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(ox - 3, ty);
        ctx.lineTo(ox + 3, ty);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(st + (st === 500 ? ' (8m20s)' : 's'), ox - 6, ty + 3);
      });

      // ── Shaded 45° Light Cone Region (Causal Future) ────────────────────
      var maxConeT = Math.min(620, (oy - padTop) / scaleY);
      var coneTopX = ox + maxConeT * scaleX;
      var coneTopY = oy - maxConeT * scaleY;

      ctx.fillStyle = colors.isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneTopX, coneTopY);
      ctx.lineTo(ox, coneTopY);
      ctx.closePath();
      ctx.fill();

      // Label inside cone (Causal Future)
      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.isLight ? '#b45309' : '#fbbf24';
      ctx.textAlign = 'left';
      ctx.fillText('CAUSAL FUTURE OF SUN', ox + 18, oy - 320 * scaleY);

      // Label in Elsewhere (Outside cone, x > ct)
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.75)' : 'rgba(56, 189, 248, 0.75)';
      ctx.fillText('THE ELSEWHERE (x > ct)', ox + 280 * scaleX, oy - 140 * scaleY);

      // ── 45° Light Cone Boundary Line ────────────────────────────────────
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneTopX, coneTopY);
      ctx.stroke();

      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = photonCol;
      ctx.textAlign = 'left';
      ctx.fillText('45° Light Cone (v = c)', ox + 120 * scaleX, oy - 120 * scaleY - 6);

      // ── Sun's Worldline (at x = 0) ──────────────────────────────────────
      // Origin node at (0, 0): Sun Vanishes!
      drawGlowingDot(ctx, ox, oy, danger, 6);
      drawLabelPill(ctx, 'Sun Vanishes (t = 0)', ox + 22, oy + 2, {
        textColor: danger,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Sun's line after t = 0 (dashed / empty)
      ctx.strokeStyle = colors.isLight ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, padTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Earth's Worldline (at x = 500 ls = 1 AU) ────────────────────────
      var earthPlotX = ox + 500 * scaleX;
      var earthIntersectY = oy - 500 * scaleY;

      // Section 1: t = 0 to 500s (In the Elsewhere, solid blue/green line)
      ctx.strokeStyle = emerald;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(earthPlotX, oy);
      ctx.lineTo(earthPlotX, earthIntersectY);
      ctx.stroke();

      // Section 2: t > 500s (Inside light cone / causal future, dashed red line)
      ctx.strokeStyle = danger;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(earthPlotX, earthIntersectY);
      ctx.lineTo(earthPlotX, padTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── The 500s Intersection Event Node ────────────────────────────────
      drawGlowingDot(ctx, earthPlotX, earthIntersectY, photonCol, 6.5);
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(earthPlotX, earthIntersectY, 11, 0, Math.PI * 2);
      ctx.stroke();

      drawLabelPill(ctx, 'Intersection Event (8m 20s)', earthPlotX - 42, earthIntersectY - 14, {
        textColor: photonCol,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Earth worldline label at bottom (t = 0)
      drawLabelPill(ctx, 'Earth Worldline (x = 1 AU)', earthPlotX, oy + 20, {
        textColor: colors.timeColor,
        font: 'bold 8px "JetBrains Mono", monospace'
      });

      // ── Milestone Indicators along Earth's lifeline ──────────────────────
      // Milestone t = 0
      drawGlowingDot(ctx, earthPlotX, oy, emerald, 4);

      // Milestone t = 250s marker
      var y250 = oy - 250 * scaleY;
      ctx.fillStyle = emerald;
      ctx.beginPath();
      ctx.arc(earthPlotX, y250, 3, 0, Math.PI * 2);
      ctx.fill();

      // ── Current "Now" Slice (t = currentTime) ───────────────────────────
      var currY = oy - currentTime * scaleY;
      var photonCurrX = ox + currentTime * scaleX;

      // Horizontal "Now" line across spacetime
      ctx.strokeStyle = colors.isLight ? 'rgba(100, 116, 139, 0.45)' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox, currY);
      ctx.lineTo(w - padRight, currY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point on 45° photon line
      if (currentTime > 0 && photonCurrX <= w - padRight) {
        drawGlowingDot(ctx, photonCurrX, currY, photonCol, 5);
      }

      // Point on Earth's Worldline
      var isElsewhere = currentTime < 500;
      var isHit = Math.abs(currentTime - 500) < 10;
      var earthDotColor = isHit ? photonCol : (isElsewhere ? emerald : danger);
      drawGlowingDot(ctx, earthPlotX, currY, earthDotColor, isHit ? 8 : 6);

      // Status pill on Earth node
      var pillStatusText = isHit
        ? 'Wave Hits Earth!'
        : (isElsewhere ? 'Earth: In Elsewhere' : 'Earth: In Causal Future');
      drawLabelPill(ctx, pillStatusText, earthPlotX + (isElsewhere ? -25 : -35), currY - 16, {
        textColor: earthDotColor,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Double-arrow lag connector between photon dot and Earth dot (when in Elsewhere)
      if (isElsewhere && currentTime >= 40 && earthPlotX - photonCurrX > 35) {
        drawDimensionLine(ctx, photonCurrX + 6, currY, earthPlotX - 6, currY, 'Lag: ' + Math.round(500 - currentTime) + 's', {
          color: colors.isLight ? 'rgba(234, 88, 12, 0.85)' : 'rgba(251, 146, 60, 0.85)',
          lineWidth: 1,
          arrows: true,
          labelOffsetY: -6,
          labelOptions: {
            textColor: colors.spaceColor,
            font: 'bold 8px "JetBrains Mono", monospace',
            paddingX: 4,
            paddingY: 1.5
          }
        });
      }
    }

    function renderAll() {
      updateControls();
      drawSpace();
      drawSpacetime();
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        currentTime = parseFloat(e.target.value);
        if (isPlaying) stopPlay();
        renderAll();
      });
    }

    bindChipGroup(container, '.preset-sun-time', {
      dataAttr: 'time',
      slider: sliderTime,
      onSelect: function (val) {
        currentTime = val;
        if (isPlaying) stopPlay();
        renderAll();
      }
    });

    function stopPlay() {
      isPlaying = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (btnPlay) {
        btnPlay.innerHTML = '<span>▶</span><span>Auto Play</span>';
      }
    }

    function runLoop() {
      if (!animFrameId && isPlaying && isVisible) {
        var lastTime = performance.now();
        function step(now) {
          if (!isPlaying || !isVisible) {
            animFrameId = null;
            return;
          }
          var dt = (now - lastTime) / 1000;
          lastTime = now;
          if (dt > 0.2) dt = 0.2;

          // Sweep from 0 to 600 in ~12 seconds
          currentTime += dt * 50;
          if (currentTime >= 600) {
            currentTime = 600;
            renderAll();
            stopPlay();
            return;
          }
          renderAll();
          animFrameId = requestAnimationFrame(step);
        }
        animFrameId = requestAnimationFrame(step);
      }
    }

    function startPlay() {
      if (currentTime >= 600) currentTime = 0;
      isPlaying = true;
      if (btnPlay) {
        btnPlay.innerHTML = '<span>⏸</span><span>Pause</span>';
      }
      runLoop();
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        if (isPlaying) stopPlay();
        else startPlay();
      });
    }

    observeSimulationVisibility(container, function () {
      isVisible = true;
      if (isPlaying) runLoop();
    }, function () {
      isVisible = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // ILLUSTRATION 02c: Peering Down the Past Light Cone (Dual View)
  function initWidgetPastLightCone(containerId) {
    var container = document.getElementById(containerId || 'widget-past-light-cone');
    if (!container) return;

    var canvasSpace = container.querySelector('.canvas-past-space');
    var canvasSpacetime = container.querySelector('.canvas-past-spacetime');
    if (!canvasSpace && !canvasSpacetime) return;

    var sliderDist = container.querySelector('.slider-past-dist');
    var elPastTime = container.querySelector('.val-past-time');
    var elStarName = container.querySelector('.val-past-star-name');
    var badgeStatus = container.querySelector('.badge-past-status');
    var btnPlay = container.querySelector('.btn-play-past');
    var presetBtns = container.querySelectorAll('.preset-past-star');

    var currentDist = 25.0; // Light-years (0 to 110)
    var isPlaying = false;
    var isVisible = true;
    var animFrameId = null;
    var starlightPhase = 0;
    var tourTargets = [4.2, 8.6, 25.0, 79.0, 104.0];
    var tourIndex = 2; // start at Vega
    var tourPauseTime = 0;

    var starsData = [
      { name: 'Proxima Centauri', shortName: 'Proxima', dist: 4.2, color: '#f97316' },
      { name: 'Sirius', shortName: 'Sirius', dist: 8.6, color: '#38bdf8' },
      { name: 'Vega', shortName: 'Vega', dist: 25.0, color: '#60a5fa' },
      { name: 'Regulus', shortName: 'Regulus', dist: 79.0, color: '#a78bfa' },
      { name: 'Alkaid', shortName: 'Alkaid', dist: 104.0, color: '#c084fc' }
    ];

    function getClosestStar(d) {
      var closest = starsData[0];
      var minDist = 999;
      starsData.forEach(function (s) {
        var diff = Math.abs(s.dist - d);
        if (diff < minDist) {
          minDist = diff;
          closest = s;
        }
      });
      return { star: closest, diff: minDist };
    }

    function updateControls() {
      if (sliderDist) sliderDist.value = currentDist;
      if (elPastTime) elPastTime.innerHTML = currentDist.toFixed(1) + ' <span>yrs</span>';

      var match = getClosestStar(currentDist);
      if (elStarName) {
        if (match.diff < 1.8) {
          elStarName.textContent = match.star.shortName + ' · ' + currentDist.toFixed(1) + ' ly';
        } else {
          elStarName.textContent = currentDist.toFixed(1) + ' ly · Custom Target';
        }
      }

      if (badgeStatus) {
        if (match.diff < 1.8) {
          badgeStatus.textContent = match.star.shortName.toUpperCase() + ' DISPATCH';
        } else {
          badgeStatus.textContent = 'PAST CONE INTERSECTION';
        }
      }

      presetBtns.forEach(function (btn) {
        var dVal = parseFloat(btn.getAttribute('data-dist'));
        if (Math.abs(dVal - currentDist) < 1.8) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // ── 1. Physical Stellar Track (Left Column) ───────────────────────────
    function drawSpace() {
      if (!canvasSpace) return;
      var colors = getThemeColors();
      var ret = setupRetinaCanvas(canvasSpace);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      ctx.clearRect(0, 0, w, h);

      var photonCol = colors.photonColor || (colors.isLight ? '#b45309' : '#fbbf24');

      var padLeft = 55;
      var padRight = 50;
      var cy = h * 0.48;

      var earthX = padLeft;
      var endX = w - padRight;
      var trackDist = endX - earthX;
      var maxTrackLy = 110.0;

      drawGrid(ctx, earthX, cy, w, h, 34);

      // Main Stellar Distance Track Line
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(earthX - 25, cy);
      ctx.lineTo(endX + 30, cy);
      ctx.stroke();

      // Axis ticks and labels (0, 25, 50, 75, 100 ly)
      [0, 25, 50, 75, 100].forEach(function (dLy) {
        var tx = earthX + (dLy / maxTrackLy) * trackDist;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(tx, cy - 4);
        ctx.lineTo(tx, cy + 4);
        ctx.stroke();

        ctx.font = '600 7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.subtleText;
        ctx.textAlign = 'center';
        ctx.fillText(dLy + (dLy === 0 ? ' (Earth)' : ' ly'), tx, cy + 16);
      });

      // Target Star Position
      var targetX = earthX + (currentDist / maxTrackLy) * trackDist;
      var match = getClosestStar(currentDist);

      // Starlight In Transit (Light in Flight / Lag Region)
      if (targetX > earthX) {
        ctx.fillStyle = colors.isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)';
        ctx.fillRect(earthX, cy - 65, targetX - earthX, 130);

        ctx.strokeStyle = colors.isLight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        var beamOffsets = [-32, -16, 0, 16, 32];
        beamOffsets.forEach(function (bo) {
          ctx.beginPath();
          ctx.moveTo(earthX, cy + bo);
          ctx.lineTo(targetX, cy + bo);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        if (targetX - earthX > 75) {
          var midX = (earthX + targetX) / 2;
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.isLight ? '#b45309' : '#fbbf24';
          ctx.textAlign = 'center';
          ctx.fillText('LIGHT IN FLIGHT (' + currentDist.toFixed(1) + ' YRS EN ROUTE)', midX, cy - 44);
          ctx.font = '500 7px "JetBrains Mono", monospace';
          ctx.fillText('The Elsewhere: Star has evolved for ' + currentDist.toFixed(1) + ' yrs unseen', midX, cy - 32);
        }

        // Animated photon packets traveling inward toward Earth
        for (var pIdx = 0; pIdx < 3; pIdx++) {
          var frac = (starlightPhase + pIdx / 3.0) % 1.0;
          var pX = targetX + (earthX - targetX) * frac;
          drawGlowingDot(ctx, pX, cy, photonCol, 3.5);
        }
      }

      // Incoming Wavefront hitting Earth
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = photonCol;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(earthX, cy, 22, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw all stars as background markers
      starsData.forEach(function (s) {
        var sx = earthX + (s.dist / maxTrackLy) * trackDist;
        var isTarget = Math.abs(s.dist - currentDist) < 1.8;

        drawGlowingDot(ctx, sx, cy, isTarget ? photonCol : s.color, isTarget ? 6.5 : 4);

        ctx.font = (isTarget ? '700 8.5px' : '500 7px') + ' "JetBrains Mono", monospace';
        ctx.fillStyle = isTarget ? colors.textPrimary : colors.subtleText;
        ctx.textAlign = 'center';
        ctx.fillText(s.shortName, sx, cy - (isTarget ? 18 : 12));
      });

      // Earth Observer
      drawGlowingDot(ctx, earthX, cy, colors.timeColor, 7);
      drawLabelPill(ctx, 'Earth Observer (Now)', earthX, cy + 34, {
        textColor: colors.timeColor,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Target Pill
      var targetLabelText = (match.diff < 1.8 ? match.star.shortName : 'Target') + ' (' + currentDist.toFixed(1) + ' ly)';
      var targetPillY = (targetX - earthX < 90) ? cy + 50 : cy + 34;
      drawLabelPill(ctx, targetLabelText, targetX, targetPillY, {
        textColor: photonCol,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });
    }

    // ── 2. Coordinate Spacetime Canvas (Right Column, x vs ct) ────────────
    function drawSpacetime() {
      if (!canvasSpacetime) return;
      var colors = getThemeColors();
      var ret = setupRetinaCanvas(canvasSpacetime);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      ctx.clearRect(0, 0, w, h);

      var danger = colors.isLight ? '#dc2626' : '#f87171';
      var photonCol = colors.photonColor || (colors.isLight ? '#b45309' : '#fbbf24');

      var padLeft = 45;
      var padRight = 30;
      var padTop = 26;
      var padBottom = 34;

      var ox = padLeft + 15;
      var oy = padTop + 24; // Earth at t = 0 (Present / Now)
      var plotW = w - ox - padRight;
      var plotH = h - padBottom - oy;

      // Enforce exact 45° slope for light: Δx == Δ(ct)
      var maxConeDist = 115; // light-years & years
      var scale = Math.min((plotW * 0.88) / maxConeDist, (plotH * 0.90) / maxConeDist);
      var scaleX = scale;
      var scaleY = scale;

      drawGrid(ctx, ox, oy, w, h, 34);

      // ── Axes ──────────────────────────────────────────────────────────
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;

      // Horizontal space axis (+x) along Present line (t = 0)
      ctx.beginPath();
      ctx.moveTo(ox - 10, oy);
      ctx.lineTo(w - padRight + 10, oy);
      ctx.stroke();

      // Vertical time axis (+ct / -ct)
      ctx.beginPath();
      ctx.moveTo(ox, oy - 14);
      ctx.lineTo(ox, oy + maxConeDist * scaleY + 12);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = colors.axisArrow;
      // Space +x arrow
      ctx.beginPath();
      ctx.moveTo(w - padRight + 10, oy - 3);
      ctx.lineTo(w - padRight + 16, oy);
      ctx.lineTo(w - padRight + 10, oy + 3);
      ctx.fill();

      // Time +ct arrow pointing UP
      ctx.beginPath();
      ctx.moveTo(ox - 3, oy - 14);
      ctx.lineTo(ox, oy - 20);
      ctx.lineTo(ox + 3, oy - 14);
      ctx.fill();

      // Axis labels
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('+x (ly)', w - padRight - 8, oy + 16);
      ctx.fillStyle = colors.timeColor;
      ctx.fillText('ct (Time · Years)', ox + 8, padTop - 8);

      // Space ticks (25, 50, 75, 100 ly)
      ctx.font = '500 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      [25, 50, 75, 100].forEach(function (sx) {
        var tx = ox + sx * scaleX;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(tx, oy - 3);
        ctx.lineTo(tx, oy + 3);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText(sx + ' ly', tx, oy + 14);
      });

      // Time ticks: Now (0), -25y, -50y, -75y, -100y
      ctx.textAlign = 'right';
      ctx.fillText('Now', ox - 6, oy + 3);

      [25, 50, 75, 100].forEach(function (st) {
        var ty = oy + st * scaleY;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(ox - 3, ty);
        ctx.lineTo(ox + 3, ty);
        ctx.stroke();
        ctx.fillText('-' + st + 'y', ox - 6, ty + 3);
      });

      // ── Shaded Regions ────────────────────────────────────────────────
      var coneBottomX = ox + maxConeDist * scaleX;
      var coneBottomY = oy + maxConeDist * scaleY;

      // 1. Shaded Elsewhere (Triangle between t=0, right edge, and 45° diagonal)
      ctx.fillStyle = colors.isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneBottomX, oy);
      ctx.lineTo(coneBottomX, coneBottomY);
      ctx.closePath();
      ctx.fill();

      // Label inside Elsewhere
      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.isLight ? '#b45309' : '#fbbf24';
      ctx.textAlign = 'left';
      ctx.fillText('THE ELSEWHERE (Causally Severed Today)', ox + 32 * scaleX, oy + 18 * scaleY);
      ctx.font = '500 7px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('Unseen history in transit (cannot affect Earth yet)', ox + 32 * scaleX, oy + 26 * scaleY);

      // 2. Shaded Observable Past (Inside past light cone, x < ct_lookback)
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.07)' : 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, coneBottomY);
      ctx.lineTo(coneBottomX, coneBottomY);
      ctx.closePath();
      ctx.fill();

      // Label inside Observable Past
      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.85)' : 'rgba(56, 189, 248, 0.85)';
      ctx.fillText('OBSERVABLE PAST', ox + 14 * scaleX, oy + 70 * scaleY);
      ctx.font = '500 7px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('Past signals that have reached Earth', ox + 14 * scaleX, oy + 78 * scaleY);

      // ── 45° Past Light Cone Boundary Line ─────────────────────────────
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneBottomX, coneBottomY);
      ctx.stroke();

      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = photonCol;
      ctx.textAlign = 'left';
      ctx.fillText('45° Past Light Cone (v = c)', ox + 52 * scaleX, oy + 52 * scaleY - 6);

      // ── Star Worldlines ───────────────────────────────────────────────
      starsData.forEach(function (s, sIdx) {
        var sx = ox + s.dist * scaleX;
        var sy_emit = oy + s.dist * scaleY;
        var isTarget = Math.abs(s.dist - currentDist) < 1.8;

        // Past worldline (below cone intersection)
        ctx.strokeStyle = colors.isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, coneBottomY);
        ctx.lineTo(sx, sy_emit);
        ctx.stroke();

        // Elsewhere worldline (between cone intersection and t=0)
        ctx.strokeStyle = colors.isLight ? 'rgba(234, 88, 12, 0.45)' : 'rgba(251, 146, 60, 0.45)';
        ctx.lineWidth = 1.25;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, sy_emit);
        ctx.lineTo(sx, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small node on Present line (t = 0)
        ctx.fillStyle = colors.subtleText;
        ctx.beginPath();
        ctx.arc(sx, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Small node on 45° boundary (emission event)
        drawGlowingDot(ctx, sx, sy_emit, isTarget ? photonCol : s.color, isTarget ? 6.5 : 3.5);

        // Star label at top
        ctx.font = (isTarget ? '700 8px' : '500 7px') + ' "JetBrains Mono", monospace';
        ctx.fillStyle = isTarget ? colors.textPrimary : colors.subtleText;
        ctx.textAlign = 'center';
        var starLabelY = (w < 440 && sIdx % 2 === 1) ? oy - 16 : oy - 8;
        ctx.fillText(s.shortName, sx, starLabelY);
      });

      // ── Target Star Highlights & Incoming Photon Ray ──────────────────
      var targetPlotX = ox + currentDist * scaleX;
      var targetEmitY = oy + currentDist * scaleY;
      var match = getClosestStar(currentDist);

      // Highlighted target worldline (dashed lag line)
      ctx.strokeStyle = danger;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(targetPlotX, targetEmitY);
      ctx.lineTo(targetPlotX, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Present node (in Elsewhere)
      drawGlowingDot(ctx, targetPlotX, oy, danger, 5);

      // Incoming Photon Path along 45° boundary (from emission to Earth)
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetPlotX, targetEmitY);
      ctx.lineTo(ox, oy);
      ctx.stroke();

      // Arrowhead at Earth pointing inward
      ctx.fillStyle = photonCol;
      ctx.beginPath();
      ctx.moveTo(ox + 8, oy + 8);
      ctx.lineTo(ox + 1, oy + 7);
      ctx.lineTo(ox + 7, oy + 1);
      ctx.closePath();
      ctx.fill();

      // Animated photons streaming along 45° vector toward Earth
      for (var aIdx = 0; aIdx < 3; aIdx++) {
        var fracA = (starlightPhase + aIdx / 3.0) % 1.0;
        var animX = targetPlotX + (ox - targetPlotX) * fracA;
        var animY = targetEmitY + (oy - targetEmitY) * fracA;
        drawGlowingDot(ctx, animX, animY, photonCol, 3.5);
      }

      // Emission event node on 45° cone
      drawGlowingDot(ctx, targetPlotX, targetEmitY, photonCol, 7);
      ctx.strokeStyle = photonCol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetPlotX, targetEmitY, 11, 0, Math.PI * 2);
      ctx.stroke();

      // In-Canvas Callout Pills
      var dispatchPillText = (match.diff < 1.8 ? match.star.shortName : 'Target') + ' Dispatch: ' + currentDist.toFixed(1) + 'y ago';
      drawLabelPill(ctx, dispatchPillText, targetPlotX - 25, targetEmitY + 16, {
        textColor: photonCol,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      var lagPillText = (match.diff < 1.8 ? match.star.shortName : 'Star') + ' Today (Lag: ' + currentDist.toFixed(1) + 'y)';
      var lagPillY = (targetPlotX - ox < 90) ? oy - 32 : oy - 22;
      drawLabelPill(ctx, lagPillText, targetPlotX, lagPillY, {
        textColor: danger,
        font: 'bold 8px "JetBrains Mono", monospace'
      });

      // Earth Observer Node at (ox, oy)
      drawGlowingDot(ctx, ox, oy, colors.timeColor, 7);
      drawLabelPill(ctx, 'Earth Observer (Now)', ox + 22, oy - 14, {
        textColor: colors.timeColor,
        font: 'bold 8.5px "JetBrains Mono", monospace'
      });

      // Distance & Lookback Projections
      ctx.strokeStyle = colors.isLight ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      // Horizontal drop to time axis
      ctx.beginPath();
      ctx.moveTo(ox, targetEmitY);
      ctx.lineTo(targetPlotX, targetEmitY);
      ctx.stroke();
      // Vertical drop from space axis
      ctx.beginPath();
      ctx.moveTo(targetPlotX, oy);
      ctx.lineTo(targetPlotX, targetEmitY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '500 7px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.textAlign = 'center';
      ctx.fillText('Δx = ' + currentDist.toFixed(1) + ' ly', (ox + targetPlotX) / 2, targetEmitY - 4);

      ctx.fillStyle = colors.timeColor;
      ctx.textAlign = 'right';
      ctx.fillText('Δt = ' + currentDist.toFixed(1) + ' y', ox - 6, (oy + targetEmitY) / 2);
    }

    function renderAll() {
      updateControls();
      drawSpace();
      drawSpacetime();
    }

    // ── Interaction Listeners ─────────────────────────────────────────────
    if (sliderDist) {
      sliderDist.addEventListener('input', function (e) {
        currentDist = parseFloat(e.target.value);
        if (isPlaying) stopTour();
        renderAll();
      });
    }

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = parseFloat(btn.getAttribute('data-dist'));
        if (!isNaN(d)) {
          currentDist = d;
          if (isPlaying) stopTour();
          renderAll();
        }
      });
    });

    function stopTour() {
      isPlaying = false;
      if (btnPlay) {
        btnPlay.innerHTML = '<span>▶</span><span>Auto Tour</span>';
      }
    }

    function startTour() {
      isPlaying = true;
      tourPauseTime = 0;
      if (btnPlay) {
        btnPlay.innerHTML = '<span>⏸</span><span>Pause</span>';
      }
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        if (isPlaying) stopTour();
        else startTour();
      });
    }

    // Continuous animation loop for streaming starlight and smooth tour
    function animLoop() {
      if (isVisible) {
        starlightPhase = (starlightPhase + 0.015) % 1.0;

        if (isPlaying) {
          var targetVal = tourTargets[tourIndex];
          var distDiff = targetVal - currentDist;

          if (Math.abs(distDiff) > 0.3) {
            currentDist += distDiff * 0.045;
          } else {
            currentDist = targetVal;
            tourPauseTime += 1;
            if (tourPauseTime > 80) { // ~1.3 second pause on each star
              tourPauseTime = 0;
              tourIndex = (tourIndex + 1) % tourTargets.length;
            }
          }
        }

        renderAll();
      }
      animFrameId = requestAnimationFrame(animLoop);
    }

    observeSimulationVisibility(container, function () {
      isVisible = true;
    }, function () {
      isVisible = false;
    });

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    animFrameId = requestAnimationFrame(animLoop);
  }

  function initAllPost02() {
    try { initWidgetDualSpeedSpacetime('widget-dual-bridge'); } catch (e) { console.error('Error in initWidgetDualSpeedSpacetime:', e); }
    try { initWidgetExpandingCircles('widget-expanding-circles'); } catch (e) { console.error('Error in initWidgetExpandingCircles:', e); }
    try { initWidget3DLightConeExplorer('widget-3d-light-cone'); } catch (e) { console.error('Error in initWidget3DLightConeExplorer:', e); }
    try { initWidgetSunDelay('widget-sun-delay'); } catch (e) { console.error('Error in initWidgetSunDelay:', e); }
    try { initWidgetPastLightCone('widget-past-light-cone'); } catch (e) { console.error('Error in initWidgetPastLightCone:', e); }
    try { initWidgetCosmicHorizon('widget-cosmic-horizon'); } catch (e) { console.error('Error in initWidgetCosmicHorizon:', e); }
    try { initWidgetSynthesisGrid('widget-synthesis-grid'); } catch (e) { console.error('Error in initWidgetSynthesisGrid:', e); }
  }

  sim.initWidgetDualSpeedSpacetime = initWidgetDualSpeedSpacetime;
  sim.initWidgetExpandingCircles = initWidgetExpandingCircles;
  sim.initWidget3DLightConeExplorer = initWidget3DLightConeExplorer;
  sim.initWidgetSunDelay = initWidgetSunDelay;
  sim.initWidgetPastLightCone = initWidgetPastLightCone;
  sim.initWidgetCosmicHorizon = initWidgetCosmicHorizon;
  sim.initWidgetSynthesisGrid = initWidgetSynthesisGrid;
  sim.initAllPost02 = initAllPost02;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPost02);
  } else {
    initAllPost02();
  }
})(window);
