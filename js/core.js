/**
 * core.js - Shared Design System & Canvas Utilities
 * Intuition First - Explorable Physics & Mathematics Series
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 1. Theme Color Provider & Canvas Utilities (Monograph Theme)
  // ==========================================================================
  function getThemeColors() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') &&
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (!isDark) {
      // Monograph Light (Warm Natural Parchment)
      return {
        isLight: true,
        style: 'monograph',
        gridLine: 'rgba(24, 25, 27, 0.06)',
        axisLine: '#18191b',        // Archival ink
        axisArrow: '#18191b',
        axisLabel: '#18191b',
        constraintArc: '#d1cac0',   // Warm parchment arc
        timeColor: '#1d4ed8',       // Deep Academic Cobalt
        timeColorSubtle: 'rgba(29, 78, 216, 0.12)',
        spaceColor: '#c2410c',      // Terracotta Rust
        spaceColorSubtle: 'rgba(194, 65, 12, 0.12)',
        invariantColor: '#6d28d9',  // Royal Amethyst
        photonColor: '#b45309',     // Amber
        dangerColor: '#b91c1c',     // Crimson
        subtleText: '#646872',
        dotCenter: '#ffffff',
        pillBg: 'rgba(255, 255, 255, 0.96)',
        pillBorder: '#e5e0d5',
        pillText: '#18191b',
        muonAtmosphereTop: 'rgba(29, 78, 216, 0.05)',
        muonAtmosphereBottom: 'rgba(29, 78, 216, 0.16)'
      };
    } else {
      // Monograph Dark (Scholarly Dark Archive)
      return {
        isLight: false,
        style: 'monograph',
        gridLine: 'rgba(232, 228, 218, 0.06)',
        axisLine: '#d4cebf',        // Soft aged bone
        axisArrow: '#f4f1ea',
        axisLabel: '#f4f1ea',
        constraintArc: 'rgba(232, 228, 218, 0.2)',
        timeColor: '#60a5fa',       // Soft Archival Blue
        timeColorSubtle: 'rgba(96, 165, 250, 0.2)',
        spaceColor: '#fb923c',      // Warm Ochre-Coral
        spaceColorSubtle: 'rgba(251, 146, 60, 0.2)',
        invariantColor: '#c084fc',  // Muted Violet
        photonColor: '#fbbf24',     // Aged Gold
        dangerColor: '#f87171',
        subtleText: '#9e998e',
        dotCenter: '#ffffff',
        pillBg: 'rgba(28, 26, 23, 0.95)',
        pillBorder: 'rgba(232, 228, 218, 0.15)',
        pillText: '#f4f1ea',
        muonAtmosphereTop: 'rgba(96, 165, 250, 0.06)',
        muonAtmosphereBottom: 'rgba(96, 165, 250, 0.22)'
      };
    }
  }

  function invalidateCanvasCaches() {
    var canvases = document.querySelectorAll('canvas');
    for (var i = 0; i < canvases.length; i++) {
      canvases[i]._cachedRect = null;
    }
  }

  function setupRetinaCanvas(canvas) {
    var rect = canvas._cachedRect;
    if (!rect || rect.width === 0 || rect.height === 0) {
      rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas._cachedRect = rect;
      }
    }
    var w = rect.width;
    var h = rect.height;
    if ((!w || !h) && canvas.parentElement) {
      var pRect = canvas.parentElement.getBoundingClientRect();
      if (pRect.width > 0 && pRect.height > 0) {
        w = pRect.width;
        h = pRect.height;
      }
    }
    w = w || 300;
    h = h || 200;
    var dpr = window.devicePixelRatio || 1;
    var targetWidth = Math.round(w * dpr);
    var targetHeight = Math.round(h * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: w, height: h, dpr: dpr };
  }

  function drawLabelPill(ctx, text, x, y, options) {
    options = options || {};
    var c = getThemeColors();
    var font = options.font || 'bold 11px "JetBrains Mono", monospace';
    var textColor = options.textColor || c.pillText;
    var bgColor = options.bgColor || c.pillBg;
    var borderColor = options.borderColor || c.pillBorder;
    var align = options.align || 'center';
    var baseline = options.baseline || 'middle';
    var padX = options.paddingX !== undefined ? options.paddingX : 6;
    var padY = options.paddingY !== undefined ? options.paddingY : 3;

    ctx.save();
    ctx.font = font;
    var textMetrics = ctx.measureText(text);
    var textW = textMetrics.width;
    var textH = 11;
    var match = font.match(/(\d+)px/);
    if (match) textH = parseInt(match[1], 10);

    var pillW = textW + padX * 2;
    var pillH = textH + padY * 2;

    var pillX = x;
    if (align === 'center') pillX = x - pillW / 2;
    else if (align === 'right') pillX = x - pillW;

    var pillY = y;
    if (baseline === 'middle') pillY = y - pillH / 2;
    else if (baseline === 'bottom') pillY = y - pillH;

    // Automatic Canvas Edge Clamping
    if (ctx.canvas && ctx.canvas.width) {
      var dpr = window.devicePixelRatio || 1;
      var maxCanvasW = ctx.canvas.width / dpr;
      var maxCanvasH = ctx.canvas.height / dpr;
      var clampPad = 6;
      if (maxCanvasW > pillW + clampPad * 2) {
        pillX = Math.max(clampPad, Math.min(maxCanvasW - pillW - clampPad, pillX));
      }
      if (maxCanvasH > pillH + clampPad * 2) {
        pillY = Math.max(clampPad, Math.min(maxCanvasH - pillH - clampPad, pillY));
      }
    }

    // Draw background pill
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    var r = 4;
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
    ctx.lineTo(pillX + pillW, pillY + pillH - r);
    ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
    ctx.lineTo(pillX + r, pillY + pillH);
    ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
    ctx.lineTo(pillX, pillY + r);
    ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text inside pill
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pillX + padX, pillY + pillH / 2);
    ctx.restore();
  }

  function drawGrid(ctx, ox, oy, width, height, step) {
    step = step || 32;
    var c = getThemeColors();
    ctx.strokeStyle = c.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = ox + step; x < width - 15; x += step) {
      ctx.moveTo(x, 15);
      ctx.lineTo(x, oy);
    }
    for (var y = oy - step; y > 15; y -= step) {
      ctx.moveTo(ox, y);
      ctx.lineTo(width - 15, y);
    }
    ctx.stroke();
  }

  function drawAxes(ctx, ox, oy, width, height, xLabel, yLabel) {
    var c = getThemeColors();
    ctx.strokeStyle = c.axisLine;
    ctx.lineWidth = 2.2;

    // Horizontal Axis
    ctx.beginPath();
    ctx.moveTo(ox - 15, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();

    // Horizontal Arrowhead
    ctx.fillStyle = c.axisArrow;
    ctx.beginPath();
    ctx.moveTo(width - 25, oy - 5);
    ctx.lineTo(width - 15, oy);
    ctx.lineTo(width - 25, oy + 5);
    ctx.fill();

    // Vertical Axis
    ctx.beginPath();
    ctx.moveTo(ox, oy + 15);
    ctx.lineTo(ox, 25);
    ctx.stroke();

    // Vertical Arrowhead
    ctx.beginPath();
    ctx.moveTo(ox - 5, 25);
    ctx.lineTo(ox, 15);
    ctx.lineTo(ox + 5, 25);
    ctx.fill();

    // Labels with crisp pill background
    if (xLabel) {
      drawLabelPill(ctx, xLabel, width - 20, oy + 18, {
        font: 'bold 11px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
        paddingX: 5,
        paddingY: 2
      });
    }
    if (yLabel) {
      drawLabelPill(ctx, yLabel, ox, 14, {
        font: 'bold 11px "JetBrains Mono", monospace',
        align: 'left',
        baseline: 'middle',
        paddingX: 5,
        paddingY: 2
      });
    }
  }

  function drawConstraintArc(ctx, ox, oy, radius, color) {
    var c = getThemeColors();
    ctx.strokeStyle = color || c.constraintArc;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawGlowingDot(ctx, x, y, color, radius) {
    radius = radius || 6;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================================================
  // 1b. Shared Canvas Graphics Primitives
  // ==========================================================================
  function drawArrowhead(ctx, tipX, tipY, angle, options) {
    options = options || {};
    var c = getThemeColors();
    var color = options.color || c.axisArrow;
    var length = options.length || 7;
    var spread = options.spread !== undefined ? options.spread : 0.48;
    var backOffset = options.backOffset !== undefined ? options.backOffset : length;
    var tipOffset = options.tipOffset !== undefined ? options.tipOffset : 0;

    if (angle === undefined || angle === null) {
      if (options.fromX !== undefined && options.fromY !== undefined) {
        angle = Math.atan2(tipY - options.fromY, tipX - options.fromX);
      } else {
        angle = 0;
      }
    }

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    var headTipX = tipX + tipOffset * Math.cos(angle);
    var headTipY = tipY + tipOffset * Math.sin(angle);
    ctx.moveTo(headTipX, headTipY);
    ctx.lineTo(tipX - backOffset * Math.cos(angle - spread), tipY - backOffset * Math.sin(angle - spread));
    ctx.lineTo(tipX - backOffset * Math.cos(angle + spread), tipY - backOffset * Math.sin(angle + spread));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawVector(ctx, ox, oy, tipX, tipY, options) {
    options = options || {};
    var c = getThemeColors();
    var color = options.color || c.invariantColor;
    var lineWidth = options.lineWidth !== undefined ? options.lineWidth : 2.5;
    var lineDash = options.lineDash || [];
    var mode = options.mode || 'velocity'; // 'velocity' (arrowhead) | 'position' (glowing dot) | 'ray' | 'none'

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (lineDash.length) ctx.setLineDash(lineDash);

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    if (lineDash.length) ctx.setLineDash([]);
    ctx.restore();

    if (mode === 'velocity' || mode === 'arrow') {
      var angle = Math.atan2(tipY - oy, tipX - ox);
      var arrowLen = options.arrowLength || 7;
      drawArrowhead(ctx, tipX, tipY, angle, {
        color: options.arrowColor || color,
        length: arrowLen,
        spread: options.arrowSpread || 0.48,
        tipOffset: options.tipOffset !== undefined ? options.tipOffset : (arrowLen * 0.8),
        backOffset: options.backOffset !== undefined ? options.backOffset : (arrowLen * 0.95)
      });
    } else if (mode === 'position' || mode === 'dot') {
      drawGlowingDot(ctx, tipX, tipY, options.dotColor || color, options.dotRadius || 5);
    }
  }

  function drawDropLines(ctx, ox, oy, tipX, tipY, options) {
    options = options || {};
    var c = getThemeColors();
    var horizontalColor = options.horizontalColor || options.spaceColor || c.spaceColor;
    var verticalColor = options.verticalColor || options.timeColor || c.timeColor;
    var lineWidth = options.lineWidth || 1.2;
    var lineDash = options.lineDash || [3, 3];

    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(lineDash);

    // Vertical drop line to horizontal axis (space component)
    if (options.dropX !== false) {
      ctx.strokeStyle = horizontalColor;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX, oy);
      ctx.stroke();
    }

    // Horizontal drop line to vertical axis (time component)
    if (options.dropY !== false) {
      ctx.strokeStyle = verticalColor;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(ox, tipY);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawDimensionLine(ctx, x1, y1, x2, y2, label, options) {
    options = options || {};
    var c = getThemeColors();
    var color = options.color || c.dangerColor;
    var lineWidth = options.lineWidth || 1.5;
    var angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (options.lineDash) ctx.setLineDash(options.lineDash);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (options.lineDash) ctx.setLineDash([]);
    ctx.restore();

    if (options.arrows !== false) {
      drawArrowhead(ctx, x1, y1, angle + Math.PI, { color: color, length: options.arrowLength || 6 });
      drawArrowhead(ctx, x2, y2, angle, { color: color, length: options.arrowLength || 6 });
    }

    if (label) {
      var midX = (x1 + x2) / 2 + (options.labelOffsetX || 0);
      var midY = (y1 + y2) / 2 + (options.labelOffsetY || 0);
      drawLabelPill(ctx, label, midX, midY, options.labelOptions || {
        textColor: color,
        borderColor: color,
        font: options.font || 'bold 9.5px "JetBrains Mono", monospace'
      });
    }
  }

  function drawTicks(ctx, ox, oy, scale, count, options) {
    options = options || {};
    var c = getThemeColors();
    var color = options.color || c.axisLine;
    var textColor = options.textColor || c.subtleText;
    var font = options.font || '500 8.5px "JetBrains Mono", monospace';
    var tickLen = options.tickLen || 3.5;
    var direction = options.direction || 'vertical';
    var angle = options.angle !== undefined ? options.angle : (direction === 'vertical' ? -Math.PI / 2 : 0);
    var format = options.format || function (val) { return val + ''; };

    ctx.save();
    ctx.font = font;
    ctx.strokeStyle = color;
    ctx.fillStyle = textColor;
    ctx.lineWidth = options.lineWidth || 1.5;

    for (var i = 1; i <= count; i++) {
      var fraction = i / count;
      var x, y, perpAngle;
      if (direction === 'vertical') {
        x = ox;
        y = oy - fraction * scale;
        perpAngle = 0;
      } else if (direction === 'horizontal') {
        x = ox + fraction * scale;
        y = oy;
        perpAngle = Math.PI / 2;
      } else {
        x = ox + Math.cos(angle) * fraction * scale;
        y = oy + Math.sin(angle) * fraction * scale;
        perpAngle = angle + Math.PI / 2;
      }

      ctx.beginPath();
      ctx.moveTo(x - Math.cos(perpAngle) * tickLen, y - Math.sin(perpAngle) * tickLen);
      ctx.lineTo(x + Math.cos(perpAngle) * tickLen, y + Math.sin(perpAngle) * tickLen);
      ctx.stroke();

      var label = format(i, fraction);
      if (label) {
        if (options.align) ctx.textAlign = options.align;
        if (options.baseline) ctx.textBaseline = options.baseline;
        var textX = x + (options.offsetX !== undefined ? options.offsetX : (direction === 'vertical' ? 7 : 0));
        var textY = y + (options.offsetY !== undefined ? options.offsetY : (direction === 'horizontal' ? 8 : 3));
        ctx.fillText(label, textX, textY);
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // 1c. 3D Coordinate Projection & Orbit Engine
  // ==========================================================================
  function project3D(x, y, z, cx, cy, scale, azimuth, elevation) {
    var cosAz = Math.cos(azimuth);
    var sinAz = Math.sin(azimuth);
    var xRot = x * cosAz - y * sinAz;
    var yRot = x * sinAz + y * cosAz;

    var cosEl = Math.cos(elevation);
    var sinEl = Math.sin(elevation);
    var yFinal = yRot * cosEl - z * sinEl;
    var zFinal = yRot * sinEl + z * cosEl;

    return {
      x: cx + xRot * scale,
      y: cy - yFinal * scale,
      zDepth: zFinal,
      xRot: xRot,
      yRot: yRot,
      yFinal: yFinal
    };
  }

  function attachOrbitControls(canvas, options) {
    options = options || {};
    var state = {
      azimuth: options.azimuth !== undefined ? options.azimuth : 0.65,
      elevation: options.elevation !== undefined ? options.elevation : 0.45,
      minElevation: options.minElevation !== undefined ? options.minElevation : 0.05,
      maxElevation: options.maxElevation !== undefined ? options.maxElevation : 1.4,
      sensitivity: options.sensitivity || 0.01,
      isDragging: false
    };

    var lastMouseX = 0;
    var lastMouseY = 0;
    canvas.style.cursor = 'grab';

    function triggerChange() {
      if (options.sliderOrbit) {
        var deg = Math.round((state.azimuth * 180 / Math.PI) % 360);
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        options.sliderOrbit.value = deg;
      }
      if (options.sliderElevation) {
        options.sliderElevation.value = state.elevation.toFixed(2);
      }
      if (options.onChange) {
        options.onChange({
          azimuth: state.azimuth,
          elevation: state.elevation
        });
      }
    }

    function onMouseDown(e) {
      state.isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    }

    function onMouseMove(e) {
      if (!state.isDragging) return;
      var dx = e.clientX - lastMouseX;
      var dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      state.azimuth += dx * state.sensitivity;
      state.elevation += dy * state.sensitivity;
      state.elevation = Math.max(state.minElevation, Math.min(state.maxElevation, state.elevation));
      triggerChange();
    }

    function onMouseUp() {
      if (state.isDragging) {
        state.isDragging = false;
        canvas.style.cursor = 'grab';
      }
    }

    function onTouchStart(e) {
      if (e.touches.length === 1) {
        state.isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        canvas.style.cursor = 'grabbing';
      }
    }

    function onTouchMove(e) {
      if (!state.isDragging || e.touches.length !== 1) return;
      if (e.cancelable) e.preventDefault();
      var dx = e.touches[0].clientX - lastMouseX;
      var dy = e.touches[0].clientY - lastMouseY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;

      state.azimuth += dx * state.sensitivity;
      state.elevation += dy * state.sensitivity;
      state.elevation = Math.max(state.minElevation, Math.min(state.maxElevation, state.elevation));
      triggerChange();
    }

    function onTouchEnd() {
      if (state.isDragging) {
        state.isDragging = false;
        canvas.style.cursor = 'grab';
      }
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    if (options.sliderOrbit) {
      options.sliderOrbit.addEventListener('input', function (e) {
        state.azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
        if (options.onChange) {
          options.onChange({ azimuth: state.azimuth, elevation: state.elevation });
        }
      });
    }

    if (options.sliderElevation) {
      options.sliderElevation.addEventListener('input', function (e) {
        state.elevation = parseFloat(e.target.value);
        if (options.onChange) {
          options.onChange({ azimuth: state.azimuth, elevation: state.elevation });
        }
      });
    }

    return {
      getState: function () { return state; },
      setView: function (az, el) {
        state.azimuth = az;
        state.elevation = Math.max(state.minElevation, Math.min(state.maxElevation, el));
        triggerChange();
      },
      destroy: function () {
        canvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }
    };
  }

  // ==========================================================================
  // 1d. Simulation Lifecycle & Animation Controller
  // ==========================================================================
  function createAnimationLoop(options) {
    options = options || {};
    var isPlaying = options.autoStart !== undefined ? options.autoStart : true;
    var isVisible = true;
    var playBtn = options.playButton || (options.container ? options.container.querySelector('.btn-play, button[class*="btn-play"]') : null);
    var playText = options.playText || 'Auto Play';
    var pauseText = options.pauseText || 'Pause';
    var lastTimestamp = null;
    var animFrameId = null;

    function updateButton() {
      if (!playBtn) return;
      playBtn.innerHTML = isPlaying ?
        '<span>⏸</span><span>' + pauseText + '</span>' :
        '<span>▶</span><span>' + playText + '</span>';
    }

    function step(now) {
      if (!isPlaying || !isVisible) {
        animFrameId = null;
        lastTimestamp = null;
        return;
      }
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      if (dt > 0.25) dt = 0.25;

      if (options.onStep) options.onStep(dt);
      if (options.onDraw) options.onDraw();

      animFrameId = requestAnimationFrame(step);
    }

    function start() {
      if (isPlaying && animFrameId) return;
      isPlaying = true;
      updateButton();
      if (isVisible && !animFrameId) {
        lastTimestamp = null;
        animFrameId = requestAnimationFrame(step);
      }
    }

    function stop() {
      isPlaying = false;
      updateButton();
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      lastTimestamp = null;
    }

    function toggle() {
      if (isPlaying) stop();
      else start();
    }

    if (playBtn) {
      playBtn.addEventListener('click', toggle);
    }

    if (options.container) {
      observeSimulationVisibility(options.container, function () {
        isVisible = true;
        if (isPlaying && !animFrameId) {
          lastTimestamp = null;
          animFrameId = requestAnimationFrame(step);
        }
      }, function () {
        isVisible = false;
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        lastTimestamp = null;
      });
    }

    updateButton();
    if (isPlaying) {
      animFrameId = requestAnimationFrame(step);
    }

    return {
      start: start,
      stop: stop,
      toggle: toggle,
      isPlaying: function () { return isPlaying; },
      renderOnce: function () {
        if (options.onDraw) options.onDraw();
      }
    };
  }

  // ==========================================================================
  // 1e. UI Controls Synchronizers
  // ==========================================================================
  function bindChipGroup(container, chipSelector, options) {
    options = options || {};
    var chips = typeof chipSelector === 'string' ? container.querySelectorAll(chipSelector) : chipSelector;
    if (!chips || !chips.length) return null;

    var dataAttr = options.dataAttr || 'val';
    var activeClass = options.activeClass || 'active';

    function setActive(targetChip) {
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.remove(activeClass);
        chips[i].classList.remove('is-active');
      }
      if (targetChip) {
        targetChip.classList.add(activeClass);
      }
    }

    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          setActive(chip);
          var rawVal = chip.getAttribute('data-' + dataAttr);
          var numVal = parseFloat(rawVal);
          var val = isNaN(numVal) ? rawVal : numVal;

          if (options.slider) {
            options.slider.value = rawVal;
          }
          if (options.onSelect) {
            options.onSelect(val, chip);
          }
        });
      })(chips[i]);
    }

    if (options.slider) {
      options.slider.addEventListener('input', function (e) {
        var currentVal = parseFloat(e.target.value);
        var matched = false;
        for (var j = 0; j < chips.length; j++) {
          var chipVal = parseFloat(chips[j].getAttribute('data-' + dataAttr));
          if (Math.abs(chipVal - currentVal) < 0.001) {
            setActive(chips[j]);
            matched = true;
            break;
          }
        }
        if (!matched) {
          setActive(null);
        }
      });
    }

    return {
      setActive: setActive,
      chips: chips
    };
  }

  function bindSliderBadge(slider, badge, formatter) {
    if (!slider || !badge) return;
    function update() {
      var val = parseFloat(slider.value);
      badge.innerText = formatter ? formatter(val) : slider.value;
    }
    slider.addEventListener('input', update);
    update();
  }

  // Active redraw registry for theme switches & resize
  var registeredDraws = [];
  function registerDraw(fn) {
    if (registeredDraws.indexOf(fn) === -1) {
      registeredDraws.push(fn);
    }
  }

  function redrawAll() {
    invalidateCanvasCaches();
    for (var i = 0; i < registeredDraws.length; i++) {
      try {
        registeredDraws[i]();
      } catch (e) {
        console.error(e);
      }
    }
  }

  function observeSimulationVisibility(container, onEnter, onLeave) {
    if (!container) return null;
    if (!('IntersectionObserver' in window)) {
      if (onEnter) onEnter();
      return null;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (onEnter) onEnter();
        } else {
          if (onLeave) onLeave();
        }
      });
    }, {
      rootMargin: '120px 0px 120px 0px',
      threshold: 0
    });
    observer.observe(container);
    return observer;
  }

  window.addEventListener('resize', invalidateCanvasCaches);

  // ==========================================================================
  // 2. Theme Manager (Monograph Theme · Automatic Device Mode Detection)
  // ==========================================================================
  function initThemeManager() {
    // Clear legacy localStorage overrides to prioritize device settings
    try {
      localStorage.removeItem('universe_theme');
      localStorage.removeItem('universe_style');
    } catch (e) {}

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      redrawAll();
    }

    function syncWithDevice(e) {
      var isDark = e ? e.matches : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var targetTheme = isDark ? 'dark' : 'light';
      if (document.documentElement.getAttribute('data-theme') !== targetTheme) {
        document.documentElement.setAttribute('data-theme', targetTheme);
        redrawAll();
      }
    }

    // Set initial theme according to device settings if not already set
    if (!document.documentElement.getAttribute('data-theme')) {
      var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Listen for device appearance changes (system theme toggles)
    if (window.matchMedia) {
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', syncWithDevice);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(syncWithDevice);
      }
    }

    // Expose applyTheme on window.UniverseSimulations for programmatic use
    window.UniverseSimulations.applyTheme = applyTheme;
  }


  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    function updateProgress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) {
        var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
        bar.style.width = pct + '%';
      }
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ==========================================================================
  // Series Article Catalog & Side Navigation Drawer
  // ==========================================================================
  var SERIES_ARTICLES = [
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 1,
      partNumber: '01',
      title: 'Why Motion Through Space Affects Time',
      shortTitle: 'Motion & Time',
      subtitle: 'You are already moving at the speed of light. Discover how spatial motion slows your passage through time.',
      tag: 'Special Relativity',
      filename: '01-motion-and-time.html',
      readTime: '10 min',
      status: 'live'
    },
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 2,
      partNumber: '02',
      title: 'The Cosmic Light Cone: Mapping Space & Time',
      shortTitle: 'The Light Cone',
      subtitle: 'Mapping the boundaries of cause and effect: how flashes of light carve reality into what can touch your life.',
      tag: 'Spacetime Geometry',
      filename: '02-light-cone.html',
      readTime: '12 min',
      status: 'coming-soon'
    },
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 3,
      partNumber: '03',
      title: 'The Spacetime Loaf & Length Contraction',
      shortTitle: 'The Loaf & Length',
      subtitle: 'There is no cosmic master clock: how motion angles your slice through spacetime to reshape length.',
      tag: 'Simultaneity & Length',
      filename: '03-spacetime-loaf.html',
      readTime: '14 min',
      status: 'coming-soon'
    },
    {
      seriesId: 'entropy',
      seriesName: 'Series 02: Information and Entropy',
      part: 1,
      partNumber: '01',
      title: 'An Intuitive Guide To Entropy',
      shortTitle: 'Guide To Entropy',
      subtitle: 'From coin flips to lost books: how quantifying surprise turns entropy into an intuitive measure of uncertainty.',
      tag: 'Information & Entropy',
      filename: '04-understanding-entropy.html',
      readTime: '8 min',
      status: 'coming-soon'
    },
    {
      seriesId: 'entropy',
      seriesName: 'Series 02: Information and Entropy',
      part: 2,
      partNumber: '02',
      title: 'Cross-Entropy & Kullback-Leibler Divergence',
      shortTitle: 'Cross-Entropy & KL',
      subtitle: 'Probability geometry, surprise, and why cross-entropy powers modern AI loss functions.',
      tag: 'Information & Entropy',
      filename: '#',
      readTime: 'Coming Soon',
      status: 'coming-soon'
    }
  ];

  function initSeriesNavigation() {
    // Only run on article pages or pages with .wide-reading-container
    var isArticlePage = !!document.querySelector('.wide-reading-container') ||
      window.location.pathname.indexOf('/posts/') !== -1 ||
      window.location.pathname.indexOf('01-') !== -1 ||
      window.location.pathname.indexOf('02-') !== -1 ||
      window.location.pathname.indexOf('03-') !== -1;

    if (!isArticlePage) return;

    // Determine current filename to mark active article
    var currentPath = window.location.pathname;
    var currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || '01-motion-and-time.html';
    // If running in index or edge case, default check
    var isInPostsDir = currentPath.indexOf('/posts/') !== -1 || document.querySelector('link[href="../css/style.css"]');
    var rootPrefix = isInPostsDir ? '../' : './';
    var postPrefix = isInPostsDir ? '' : 'posts/';

    // Create Backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'article-nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    // Create Left Floating Tab
    var tabBtn = document.createElement('button');
    tabBtn.className = 'article-nav-tab';
    tabBtn.setAttribute('aria-label', 'Open series article navigation');
    tabBtn.setAttribute('title', 'Browse all series and essays');
    tabBtn.innerHTML =
      '<span class="article-nav-tab-icon">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<line x1="3" y1="12" x2="21" y2="12"></line>' +
          '<line x1="3" y1="6" x2="21" y2="6"></line>' +
          '<line x1="3" y1="18" x2="21" y2="18"></line>' +
        '</svg>' +
      '</span>' +
      '<span class="article-nav-tab-label">Series</span>' +
      '<span class="article-nav-tab-badge">' + SERIES_ARTICLES.length + '</span>';
    document.body.appendChild(tabBtn);

    // Create Drawer Sidebar
    var drawer = document.createElement('aside');
    drawer.className = 'article-nav-drawer';
    drawer.setAttribute('aria-label', 'Series Navigation');
    drawer.setAttribute('aria-hidden', 'true');

    // Build articles list HTML grouped by series
    var listHtml = '';
    var lastSeries = '';

    for (var i = 0; i < SERIES_ARTICLES.length; i++) {
      var item = SERIES_ARTICLES[i];
      if (item.seriesName !== lastSeries) {
        lastSeries = item.seriesName;
        listHtml += '<li class="drawer-group-divider" style="list-style:none; padding: 0.75rem 0.25rem 0.35rem; font-family:var(--font-mono); font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted);">' + item.seriesName + '</li>';
      }

      var isLive = item.status === 'live';
      var isActive = isLive && ((currentFile === item.filename) || (i === 0 && currentFile === ''));
      var activeClass = isActive ? ' is-active' : (isLive ? '' : ' is-coming-soon');
      var itemHref = isLive ? (postPrefix + item.filename) : '#';

      listHtml +=
        '<li class="drawer-article-item' + activeClass + '" style="' + (isLive ? '' : 'opacity:0.65;') + '">' +
          '<a href="' + itemHref + '" class="drawer-article-link"' + (isActive ? ' aria-current="page"' : '') + (isLive ? '' : ' onclick="return false;"') + '>' +
            '<div class="drawer-article-meta">' +
              '<span class="drawer-part-badge" style="' + (item.seriesId === 'entropy' ? 'color:var(--color-emerald);' : '') + '">Part ' + item.partNumber + '</span>' +
              '<span class="drawer-time-tag">' + item.readTime + '</span>' +
            '</div>' +
            '<h4 class="drawer-article-title">' + item.title + '</h4>' +
            '<p class="drawer-article-sub">' + item.subtitle + '</p>' +
            (isActive ? '<span class="drawer-active-pill">Reading Now</span>' : '') +
          '</a>' +
        '</li>';
    }

    drawer.innerHTML =
      '<div class="drawer-header">' +
        '<div class="drawer-header-brand">' +
          '<a href="' + rootPrefix + 'index.html" class="drawer-brand-link">' +
            '<span class="brand-badge" style="font-size:0.78rem;">IF</span>' +
            '<div>' +
              '<div class="drawer-brand-title">INTUITION FIRST</div>' +
              '<div class="drawer-brand-sub">Explorable Science & Math</div>' +
            '</div>' +
          '</a>' +
        '</div>' +
        '<button class="drawer-close-btn" aria-label="Close navigation" title="Close">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="drawer-scroll-body">' +
        '<div class="drawer-section-heading">' +
          '<span>Table of Contents</span>' +
          '<span class="drawer-count">2 Series</span>' +
        '</div>' +
        '<ol class="drawer-articles-list" style="padding-left:0; list-style:none;">' +
          listHtml +
        '</ol>' +
      '</div>' +
      '<div class="drawer-footer">' +
        '<a href="' + rootPrefix + 'index.html" class="drawer-footer-link">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
            '<polyline points="9 22 9 12 15 12 15 22"></polyline>' +
          '</svg>' +
          '<span>All Series & Overview</span>' +
        '</a>' +
      '</div>';

    document.body.appendChild(drawer);

    // Event Handlers for Drawer
    var isOpen = false;

    function openDrawer() {
      isOpen = true;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('is-visible');
      tabBtn.classList.add('is-active');
      document.body.classList.add('drawer-open-lock');
    }

    function closeDrawer() {
      isOpen = false;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('is-visible');
      tabBtn.classList.remove('is-active');
      document.body.classList.remove('drawer-open-lock');
    }

    function toggleDrawer() {
      if (isOpen) closeDrawer();
      else openDrawer();
    }

    tabBtn.addEventListener('click', toggleDrawer);
    backdrop.addEventListener('click', closeDrawer);

    var closeBtn = drawer.querySelector('.drawer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    // Keyboard navigation (Esc to close)
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    });

    // Also support any element on page with .btn-toggle-articles
    var customToggles = document.querySelectorAll('.btn-toggle-articles');
    for (var k = 0; k < customToggles.length; k++) {
      customToggles[k].addEventListener('click', function (e) {
        e.preventDefault();
        toggleDrawer();
      });
      var countBadge = customToggles[k].querySelector('.nav-badge-count');
      if (countBadge) {
        countBadge.textContent = String(SERIES_ARTICLES.length);
      }
    }
  }

  // Global Registry & Initialization
  window.UniverseSimulations = window.UniverseSimulations || {};
  window.UniverseSimulations.SERIES_ARTICLES = SERIES_ARTICLES;
  window.UniverseSimulations.getThemeColors = getThemeColors;
  window.UniverseSimulations.setupRetinaCanvas = setupRetinaCanvas;
  window.UniverseSimulations.invalidateCanvasCaches = invalidateCanvasCaches;
  window.UniverseSimulations.observeSimulationVisibility = observeSimulationVisibility;
  window.UniverseSimulations.drawLabelPill = drawLabelPill;
  window.UniverseSimulations.drawGrid = drawGrid;
  window.UniverseSimulations.drawAxes = drawAxes;
  window.UniverseSimulations.drawConstraintArc = drawConstraintArc;
  window.UniverseSimulations.drawGlowingDot = drawGlowingDot;
  window.UniverseSimulations.drawArrowhead = drawArrowhead;
  window.UniverseSimulations.drawVector = drawVector;
  window.UniverseSimulations.drawDropLines = drawDropLines;
  window.UniverseSimulations.drawDimensionLine = drawDimensionLine;
  window.UniverseSimulations.drawTicks = drawTicks;
  window.UniverseSimulations.project3D = project3D;
  window.UniverseSimulations.attachOrbitControls = attachOrbitControls;
  window.UniverseSimulations.createAnimationLoop = createAnimationLoop;
  window.UniverseSimulations.bindChipGroup = bindChipGroup;
  window.UniverseSimulations.bindSliderBadge = bindSliderBadge;
  window.UniverseSimulations.registerDraw = registerDraw;
  window.UniverseSimulations.redrawAll = redrawAll;
  window.UniverseSimulations.initThemeManager = initThemeManager;
  window.UniverseSimulations.initReadingProgress = initReadingProgress;
  window.UniverseSimulations.initSeriesNavigation = initSeriesNavigation;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeManager();
      initReadingProgress();
      initSeriesNavigation();
    });
  } else {
    initThemeManager();
    initReadingProgress();
    initSeriesNavigation();
  }
})(window);
