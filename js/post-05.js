/**
 * post-05.js - Part 2 Interactive Simulations: An Intuitive Guide To Cross-Entropy
 * Explorable visual models for Belief vs Reality, Empirical Learning, Cross-Entropy Curves,
 * KL Divergence, and Next-Token Machine Learning Loss.
 */

(function (window) {
  'use strict';

  var sim = window.UniverseSimulations || (window.UniverseSimulations = {});
  var getThemeColors = function () { return sim.getThemeColors(); };
  var setupRetinaCanvas = function (c) { return sim.setupRetinaCanvas(c); };
  var registerDraw = function (fn) { sim.registerDraw(fn); };
  var drawLabelPill = function (ctx, txt, x, y, opts) { sim.drawLabelPill(ctx, txt, x, y, opts); };
  var drawGlowingDot = function (ctx, x, y, c, r) { sim.drawGlowingDot(ctx, x, y, c, r); };
  var observeSimulationVisibility = function (c, onIn, onOut) {
    return sim.observeSimulationVisibility ? sim.observeSimulationVisibility(c, onIn, onOut) : null;
  };

  // Safe natural logarithm
  function safeLog(v) {
    if (v <= 0.000001) return -13.8;
    return Math.log(v);
  }

  // Cross-entropy calculation: - [p*ln(q) + (1-p)*ln(1-q)]
  function calcCrossEntropy(p, q) {
    var p0 = Math.max(0.00001, Math.min(0.99999, p));
    var q0 = Math.max(0.00001, Math.min(0.99999, q));
    return -(p0 * safeLog(q0) + (1 - p0) * safeLog(1 - q0));
  }

  // Entropy calculation: - [p*ln(p) + (1-p)*ln(1-p)]
  function calcEntropy(p) {
    if (p <= 0.00001 || p >= 0.99999) return 0.0;
    return -(p * safeLog(p) + (1 - p) * safeLog(1 - p));
  }

  // ==========================================================================
  // WIDGET 1: REALITY VS. BELIEF (DUAL DISTRIBUTION COIN SIMULATOR)
  // ==========================================================================
  function initWidgetRealityVsBelief(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderQ = container.querySelector('.slider-belief');
    var valBelief = container.querySelector('.val-belief');
    var chips = container.querySelectorAll('.chip-belief');
    var btnFlip = container.querySelector('.btn-flip');
    var btnAuto = container.querySelector('.btn-auto-flip');
    var readoutCE = container.querySelector('.readout-cross-entropy');
    var readoutEmpirical = container.querySelector('.readout-empirical-surprise');
    var readoutFlipCount = container.querySelector('.readout-flip-count');
    var readoutLastFlip = container.querySelector('.readout-last-flip-text');

    var pTrue = 0.90; // True coin physics: 90% Heads
    var qBelief = 0.50; // Observer belief: default fair
    var flips = [];
    var totalFlips = 0;
    var sumSurprise = 0;
    var lastOutcome = null;
    var lastSurprise = 0;
    var isAutoFlipping = false;
    var autoTimer = null;
    var isSpinning = false;
    var coinSpinAngle = 0;
    var isVisible = true;

    function updateTelemetry() {
      var ce = calcCrossEntropy(pTrue, qBelief);
      if (readoutCE) readoutCE.innerText = ce.toFixed(3) + ' nats';

      if (valBelief) {
        valBelief.innerText = qBelief.toFixed(2) + ' (' + Math.round(qBelief * 100) + '%)';
      }

      if (readoutFlipCount) {
        readoutFlipCount.innerText = totalFlips + ' flip' + (totalFlips === 1 ? '' : 's');
      }

      if (readoutEmpirical) {
        if (totalFlips === 0) {
          readoutEmpirical.innerText = '0.000 nats';
        } else {
          readoutEmpirical.innerText = (sumSurprise / totalFlips).toFixed(3) + ' nats';
        }
      }

      if (readoutLastFlip && lastOutcome) {
        var label = lastOutcome === 'H' ? 'Heads (H)' : 'Tails (T)';
        readoutLastFlip.innerHTML = 'Last: <strong>' + label + '</strong> · Felt ' + lastSurprise.toFixed(3) + ' nats';
      }
    }

    function doFlip() {
      var rand = Math.random();
      var outcome = rand < pTrue ? 'H' : 'T';
      var probBelief = outcome === 'H' ? qBelief : (1 - qBelief);
      var surprise = -safeLog(probBelief);

      lastOutcome = outcome;
      lastSurprise = surprise;
      totalFlips++;
      sumSurprise += surprise;
      flips.unshift({ outcome: outcome, surprise: surprise });
      if (flips.length > 20) flips.pop();

      // Coin spin animation
      isSpinning = true;
      var startTime = performance.now();
      function animateCoin(now) {
        var elapsed = (now - startTime) / 220;
        if (elapsed < 1) {
          coinSpinAngle = elapsed * Math.PI * 4;
          draw();
          requestAnimationFrame(animateCoin);
        } else {
          coinSpinAngle = 0;
          isSpinning = false;
          draw();
        }
      }
      requestAnimationFrame(animateCoin);
      updateTelemetry();
    }

    function draw() {
      if (!isVisible) return;
      var res = setupRetinaCanvas(canvas);
      var ctx = res.ctx;
      var w = res.width;
      var h = res.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      // Layout coordinates
      var padX = 28;
      var topY = 24;
      var contentW = w - padX * 2;

      // Section 1: Distribution Comparison Bars (Reality P vs Belief Q)
      var colW = Math.min(180, (contentW - 36) / 2);
      var pColX = padX;
      var qColX = padX + colW + 36;

      // Card headers
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('TRUE REALITY (P)', pColX, topY);
      ctx.fillText('MODEL BELIEF (Q)', qColX, topY);

      var barH = 22;
      var barY1 = topY + 12;
      var barY2 = barY1 + barH + 10;

      // Draw Reality Bars (p = 0.90 Heads, 0.10 Tails)
      function drawDistBar(x, y, label, val, color, isP) {
        ctx.fillStyle = colors.isLight ? '#ebe6db' : '#22201c';
        ctx.beginPath();
        ctx.roundRect(x, y, colW, barH, 4);
        ctx.fill();

        var fillW = Math.max(3, colW * val);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, fillW, barH, 4);
        ctx.fill();

        ctx.font = 'bold 11px var(--font-mono)';
        ctx.fillStyle = colors.pillText;
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 8, y + barH / 2 + 4);

        ctx.textAlign = 'right';
        ctx.fillText(Math.round(val * 100) + '%', x + colW - 8, y + barH / 2 + 4);
      }

      drawDistBar(pColX, barY1, 'Heads (H)', pTrue, colors.timeColor, true);
      drawDistBar(pColX, barY2, 'Tails (T)', 1 - pTrue, colors.spaceColor, true);

      drawDistBar(qColX, barY1, 'Heads (H)', qBelief, colors.timeColor, false);
      drawDistBar(qColX, barY2, 'Tails (T)', 1 - qBelief, colors.spaceColor, false);

      // Section 2: Felt Surprise Indicators
      var midY = barY2 + barH + 26;
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('FELT SURPRISE PER OUTCOME: S(outcome) = ln(1/q)', padX, midY);

      var meterY = midY + 14;
      var sH = -safeLog(qBelief);
      var sT = -safeLog(1 - qBelief);
      var maxS = 4.6; // capped visual scale (~99% bias)

      var meterW = (contentW - 20) / 2;

      function drawSurpriseGauge(x, y, outcome, probVal, surpriseVal, col) {
        ctx.fillStyle = colors.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
        ctx.strokeStyle = colors.pillBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, meterW, 46, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px var(--font-sans)';
        ctx.fillStyle = col;
        ctx.textAlign = 'left';
        ctx.fillText('If ' + outcome + ' lands:', x + 10, y + 18);

        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillStyle = colors.pillText;
        ctx.textAlign = 'right';
        ctx.fillText(surpriseVal.toFixed(3) + ' nats', x + meterW - 10, y + 18);

        // Progress line
        var barStartX = x + 10;
        var barAvailW = meterW - 20;
        var barTrackY = y + 28;
        ctx.fillStyle = colors.isLight ? '#e5e0d5' : '#2e2b26';
        ctx.beginPath();
        ctx.roundRect(barStartX, barTrackY, barAvailW, 8, 4);
        ctx.fill();

        var fillNorm = Math.min(1.0, surpriseVal / maxS);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(barStartX, barTrackY, Math.max(4, barAvailW * fillNorm), 8, 4);
        ctx.fill();
      }

      drawSurpriseGauge(padX, meterY, 'Heads (H)', qBelief, sH, colors.timeColor);
      drawSurpriseGauge(padX + meterW + 20, meterY, 'Tails (T)', 1 - qBelief, sT, colors.spaceColor);

      // Section 3: Weighted Cross-Entropy Synthesis Bar
      var synY = meterY + 68;
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('CROSS-ENTROPY SUMMATION: H(P, Q) = p · S(H) + (1−p) · S(T)', padX, synY);

      var synBarY = synY + 12;
      var synBarH = 24;
      var compH = pTrue * sH;
      var compT = (1 - pTrue) * sT;
      var totalCE = compH + compT;
      var visualMax = 2.0;

      ctx.fillStyle = colors.isLight ? '#ebe6db' : '#22201c';
      ctx.beginPath();
      ctx.roundRect(padX, synBarY, contentW, synBarH, 4);
      ctx.fill();

      var compHW = (contentW * (compH / visualMax));
      var compTW = (contentW * (compT / visualMax));

      // Heads contribution (Time Color / Blue)
      ctx.fillStyle = colors.timeColor;
      ctx.beginPath();
      ctx.roundRect(padX, synBarY, Math.max(2, compHW), synBarH, [4, 0, 0, 4]);
      ctx.fill();

      // Tails contribution (Space Color / Orange)
      ctx.fillStyle = colors.spaceColor;
      ctx.beginPath();
      ctx.roundRect(padX + compHW, synBarY, Math.max(2, compTW), synBarH, [0, 4, 4, 0]);
      ctx.fill();

      // Inherent Entropy Floor Indicator Line
      var minEntropy = calcEntropy(pTrue);
      var floorX = padX + (contentW * (minEntropy / visualMax));
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(floorX, synBarY - 4);
      ctx.lineTo(floorX, synBarY + synBarH + 4);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, 'Floor: ' + minEntropy.toFixed(3) + ' nats', floorX, synBarY + synBarH + 16, {
        textColor: colors.photonColor,
        borderColor: colors.photonColor,
        font: 'bold 10px var(--font-mono)'
      });

      // Animated coin display in top right corner
      var coinX = w - 42;
      var coinY = 46;
      var coinR = 20;

      ctx.save();
      ctx.translate(coinX, coinY);
      if (isSpinning) {
        ctx.scale(Math.cos(coinSpinAngle), 1);
      }
      ctx.beginPath();
      ctx.arc(0, 0, coinR, 0, Math.PI * 2);
      ctx.fillStyle = lastOutcome === 'T' ? colors.spaceColor : colors.timeColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.isLight ? '#ffffff' : '#000000';
      ctx.stroke();

      ctx.font = 'bold 14px var(--font-sans)';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lastOutcome ? lastOutcome : '?', 0, 0);
      ctx.restore();
    }

    // Event listeners
    if (sliderQ) {
      sliderQ.addEventListener('input', function () {
        qBelief = parseFloat(this.value) / 100.0;
        chips.forEach(function (c) { c.classList.remove('active'); });
        updateTelemetry();
        draw();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        qBelief = parseFloat(this.getAttribute('data-q'));
        if (sliderQ) sliderQ.value = Math.round(qBelief * 100);
        updateTelemetry();
        draw();
      });
    });

    if (btnFlip) {
      btnFlip.addEventListener('click', function () {
        doFlip();
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', function () {
        isAutoFlipping = !isAutoFlipping;
        if (isAutoFlipping) {
          btnAuto.classList.add('active');
          btnAuto.innerHTML = '<span>⏸</span><span>Stop Flips</span>';
          autoTimer = setInterval(doFlip, 320);
        } else {
          btnAuto.classList.remove('active');
          btnAuto.innerHTML = '<span>▶</span><span>Auto Flip</span>';
          if (autoTimer) clearInterval(autoTimer);
        }
      });
    }

    observeSimulationVisibility(container, function () {
      isVisible = true;
      draw();
    }, function () {
      isVisible = false;
      if (isAutoFlipping && btnAuto) btnAuto.click();
    });

    registerDraw(draw);
    updateTelemetry();
    draw();
  }

  // ==========================================================================
  // WIDGET 2: LEARNING SCENARIOS STEPPER
  // ==========================================================================
  function initWidgetLearningScenarios(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var items = container.querySelectorAll('.ce-scenario-item');
    var readoutStageBadge = container.querySelector('.readout-stage-badge');
    var readoutStageEntropy = container.querySelector('.readout-stage-entropy');
    var readoutStageGap = container.querySelector('.readout-stage-gap');
    var readoutExplanation = container.querySelector('.readout-stage-explanation');

    var pTrue = 0.90;
    var minEntropy = calcEntropy(pTrue); // ~0.32508

    var stages = [
      {
        index: 0,
        name: 'Stage 1: Prior Guess',
        flips: 0,
        q: 0.50,
        ce: 0.69315,
        desc: 'Uninformed prior: assuming a fair coin (q = 0.50). You expect 50/50, so both Heads and Tails deliver substantial surprise.'
      },
      {
        index: 1,
        name: 'Stage 2: 5 Flips (4H, 1T)',
        flips: 5,
        q: 0.80,
        ce: 0.36166,
        desc: 'Modest evidence: 4 out of 5 flips showed Heads. Revising to q = 0.80 cuts surprise nearly in half.'
      },
      {
        index: 2,
        name: 'Stage 3: 20 Flips (19H, 1T)',
        flips: 20,
        q: 0.95,
        ce: 0.34586,
        desc: 'Overestimation: observed 95% Heads. While Heads barely surprises you, the rare Tails now shocks you with a sharp penalty.'
      },
      {
        index: 3,
        name: 'Stage 4: 10,000 Flips',
        flips: 10000,
        q: 0.9012,
        ce: 0.32509,
        desc: 'Big Data: empirical frequency tightly matches nature (q = 0.9012). Average surprise is within 0.00001 nats of physical minimum.'
      },
      {
        index: 4,
        name: 'Stage 5: Ideal Model',
        flips: Infinity,
        q: 0.90,
        ce: 0.32508,
        desc: 'Perfect calibration: belief perfectly equals truth (q = p). Cross-entropy collapses into intrinsic system entropy!'
      }
    ];

    var currentStage = 0;
    var isVisible = true;

    function setStage(idx) {
      currentStage = idx;
      items.forEach(function (it, i) {
        if (i === idx) it.classList.add('active');
        else it.classList.remove('active');
      });

      var s = stages[idx];
      if (readoutStageBadge) readoutStageBadge.innerText = 'Stage ' + (idx + 1);
      if (readoutStageEntropy) readoutStageEntropy.innerText = s.ce.toFixed(4) + ' nats';
      if (readoutStageGap) {
        var gap = s.ce - minEntropy;
        readoutStageGap.innerText = gap < 0.0001 ? 'Equal to minimum entropy floor (0 nats wasted)' : '+' + gap.toFixed(4) + ' nats above floor';
      }
      if (readoutExplanation) readoutExplanation.innerText = s.desc;
      draw();
    }

    function draw() {
      if (!isVisible) return;
      var res = setupRetinaCanvas(canvas);
      var ctx = res.ctx;
      var w = res.width;
      var h = res.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      var padLeft = 36;
      var padRight = 24;
      var padBottom = 38;
      var topY = 24;
      var graphW = w - padLeft - padRight;
      var graphH = h - topY - padBottom;

      // Axis labels & title
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('CROSS-ENTROPY PROGRESSION ACROSS STAGES', padLeft, topY);

      var maxVal = 0.80; // visual y-axis ceiling
      var numBars = stages.length;
      var slotW = graphW / numBars;
      var barW = Math.min(46, slotW * 0.65);

      // Horizontal baseline for entropy floor H(P)
      var floorNorm = minEntropy / maxVal;
      var floorY = topY + graphH * (1 - floorNorm);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padLeft, floorY);
      ctx.lineTo(padLeft + graphW, floorY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, 'H(P) = ' + minEntropy.toFixed(3) + ' nats (Entropy Floor)', padLeft + graphW - 10, floorY, {
        textColor: colors.photonColor,
        borderColor: colors.photonColor,
        align: 'right',
        font: 'bold 10px var(--font-mono)'
      });

      // Draw bars for each stage
      for (var i = 0; i < numBars; i++) {
        var st = stages[i];
        var cx = padLeft + i * slotW + slotW / 2;
        var bx = cx - barW / 2;

        var sH = -safeLog(st.q);
        var sT = -safeLog(1 - st.q);
        var compH = pTrue * sH;
        var compT = (1 - pTrue) * sT;

        var hH = graphH * (compH / maxVal);
        var hT = graphH * (compT / maxVal);
        var totalH = hH + hT;
        var by = topY + graphH - totalH;

        var isSelected = (i === currentStage);

        // Highlight backplate for selected stage
        if (isSelected) {
          ctx.fillStyle = colors.isLight ? 'rgba(29, 78, 216, 0.08)' : 'rgba(96, 165, 250, 0.12)';
          ctx.beginPath();
          ctx.roundRect(cx - slotW * 0.45, topY + 10, slotW * 0.9, graphH + 20, 6);
          ctx.fill();
        }

        // Heads contribution (bottom component)
        ctx.fillStyle = isSelected ? colors.timeColor : (colors.isLight ? '#93c5fd' : '#2563eb');
        ctx.beginPath();
        ctx.roundRect(bx, topY + graphH - hH, barW, hH, [0, 0, 4, 4]);
        ctx.fill();

        // Tails contribution (top component)
        ctx.fillStyle = isSelected ? colors.spaceColor : (colors.isLight ? '#fdba74' : '#ea580c');
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, hT, [4, 4, 0, 0]);
        ctx.fill();

        // Border if selected
        if (isSelected) {
          ctx.strokeStyle = colors.pillText;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx - 1, by - 1, barW + 2, totalH + 2);
        }

        // Value text above bar
        ctx.font = isSelected ? 'bold 11px var(--font-mono)' : '10px var(--font-mono)';
        ctx.fillStyle = isSelected ? colors.pillText : colors.subtleText;
        ctx.textAlign = 'center';
        ctx.fillText(st.ce.toFixed(3), cx, by - 6);

        // Stage label below
        ctx.font = isSelected ? 'bold 11px var(--font-sans)' : '10px var(--font-sans)';
        ctx.fillStyle = isSelected ? colors.pillText : colors.subtleText;
        ctx.fillText('q=' + st.q.toFixed(2), cx, topY + graphH + 16);
      }
    }

    items.forEach(function (item, idx) {
      item.addEventListener('click', function () {
        setStage(idx);
      });
    });

    observeSimulationVisibility(container, function () {
      isVisible = true;
      draw();
    }, function () {
      isVisible = false;
    });

    registerDraw(draw);
    setStage(0);
  }

  // ==========================================================================
  // WIDGET 3: CROSS-ENTROPY CURVE & KL DIVERGENCE FLOOR
  // ==========================================================================
  function initWidgetCrossEntropyCurve(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderQ = container.querySelector('.slider-curve-q');
    var valQ = container.querySelector('.val-curve-q');
    var chipsP = container.querySelectorAll('.chip-curve-p');
    var btnSweep = container.querySelector('.btn-sweep-curve');
    var readoutCE = container.querySelector('.readout-curve-ce');
    var readoutKL = container.querySelector('.readout-curve-kl');

    var pFixed = 0.90;
    var qSelected = 0.90;
    var isSweeping = false;
    var sweepDirection = 1;
    var sweepAnimId = null;
    var isVisible = true;

    function updateTelemetry() {
      var ce = calcCrossEntropy(pFixed, qSelected);
      var ent = calcEntropy(pFixed);
      var kl = Math.max(0.0, ce - ent);

      if (valQ) valQ.innerText = qSelected.toFixed(2);
      if (readoutCE) readoutCE.innerText = ce.toFixed(3) + ' nats';
      if (readoutKL) readoutKL.innerText = kl.toFixed(3) + ' nats';
    }

    function draw() {
      if (!isVisible) return;
      var res = setupRetinaCanvas(canvas);
      var ctx = res.ctx;
      var w = res.width;
      var h = res.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      var padLeft = 46;
      var padRight = 24;
      var padBottom = 36;
      var padTop = 24;
      var graphW = w - padLeft - padRight;
      var graphH = h - padTop - padBottom;

      // Coordinate limits
      var minQ = 0.04;
      var maxQ = 0.96;
      var maxCE = 2.4; // ceiling for y-axis

      function qToX(q) {
        return padLeft + ((q - minQ) / (maxQ - minQ)) * graphW;
      }
      function ceToY(val) {
        var norm = Math.min(1.0, val / maxCE);
        return padTop + graphH * (1 - norm);
      }

      // Draw Grid lines
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 1;
      for (var gce = 0.5; gce <= 2.0; gce += 0.5) {
        var gy = ceToY(gce);
        ctx.beginPath();
        ctx.moveTo(padLeft, gy);
        ctx.lineTo(padLeft + graphW, gy);
        ctx.stroke();

        ctx.font = '10px var(--font-mono)';
        ctx.fillStyle = colors.subtleText;
        ctx.textAlign = 'right';
        ctx.fillText(gce.toFixed(1), padLeft - 8, gy + 3);
      }

      // Inherent Entropy Baseline H(P)
      var ent = calcEntropy(pFixed);
      var floorY = ceToY(ent);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft, floorY);
      ctx.lineTo(padLeft + graphW, floorY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, 'Entropy Floor: H(P) = ' + ent.toFixed(3) + ' nats', padLeft + graphW - 10, floorY, {
        textColor: colors.photonColor,
        borderColor: colors.photonColor,
        align: 'right',
        font: 'bold 10px var(--font-mono)'
      });

      // Shaded KL Divergence Area between Curve and Floor
      ctx.beginPath();
      var firstPoint = true;
      var step = 0.01;
      for (var q = minQ; q <= maxQ; q += step) {
        var ceVal = Math.min(maxCE, calcCrossEntropy(pFixed, q));
        var px = qToX(q);
        var py = ceToY(ceVal);
        if (firstPoint) {
          ctx.moveTo(px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      // Close polygon along the baseline floor
      for (var q2 = maxQ; q2 >= minQ; q2 -= step) {
        ctx.lineTo(qToX(q2), floorY);
      }
      ctx.closePath();
      ctx.fillStyle = colors.isLight ? 'rgba(194, 65, 12, 0.12)' : 'rgba(251, 146, 60, 0.16)';
      ctx.fill();

      // Draw Main Cross-Entropy Curve
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.timeColor;
      firstPoint = true;
      for (var q3 = minQ; q3 <= maxQ; q3 += step) {
        var val = Math.min(maxCE, calcCrossEntropy(pFixed, q3));
        var px3 = qToX(q3);
        var py3 = ceToY(val);
        if (firstPoint) {
          ctx.moveTo(px3, py3);
          firstPoint = false;
        } else {
          ctx.lineTo(px3, py3);
        }
      }
      ctx.stroke();

      // Minimum marker at q = p
      var minX = qToX(pFixed);
      var minY = floorY;
      drawGlowingDot(ctx, minX, minY, colors.emeraldColor || '#0f766e', 5);
      drawLabelPill(ctx, 'Minima: q = p (' + pFixed.toFixed(2) + ')', minX, minY - 16, {
        textColor: colors.emeraldColor || '#0f766e',
        borderColor: colors.emeraldColor || '#0f766e',
        font: 'bold 10px var(--font-mono)'
      });

      // Current Operating Point (qSelected)
      var curCE = calcCrossEntropy(pFixed, qSelected);
      var curX = qToX(qSelected);
      var curY = ceToY(Math.min(maxCE, curCE));

      // Drop lines
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(curX, padTop + graphH);
      ctx.lineTo(curX, curY);
      ctx.lineTo(padLeft, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawGlowingDot(ctx, curX, curY, colors.timeColor, 6);

      // Pill annotation for current point
      var klVal = Math.max(0.0, curCE - ent);
      var pillText = 'H=' + curCE.toFixed(3) + ' (KL=+' + klVal.toFixed(3) + ')';
      drawLabelPill(ctx, pillText, curX, curY - 18, {
        textColor: colors.pillText,
        borderColor: colors.timeColor,
        font: 'bold 11px var(--font-mono)'
      });

      // X-axis ticks & labels
      ctx.fillStyle = colors.subtleText;
      ctx.font = '10px var(--font-mono)';
      ctx.textAlign = 'center';
      for (var tq = 0.1; tq <= 0.9; tq += 0.2) {
        var tx = qToX(tq);
        ctx.fillText(tq.toFixed(1), tx, padTop + graphH + 16);
      }
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillText('Observer Belief (q) →', padLeft + graphW / 2, padTop + graphH + 30);
    }

    if (sliderQ) {
      sliderQ.addEventListener('input', function () {
        qSelected = parseFloat(this.value) / 100.0;
        updateTelemetry();
        draw();
      });
    }

    chipsP.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipsP.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        pFixed = parseFloat(this.getAttribute('data-p'));
        qSelected = pFixed;
        if (sliderQ) sliderQ.value = Math.round(qSelected * 100);
        updateTelemetry();
        draw();
      });
    });

    if (btnSweep) {
      btnSweep.addEventListener('click', function () {
        isSweeping = !isSweeping;
        if (isSweeping) {
          btnSweep.classList.add('active');
          btnSweep.innerHTML = '<span>⏸</span><span>Pause Sweep</span>';
          function loopSweep() {
            if (!isSweeping) return;
            qSelected += 0.005 * sweepDirection;
            if (qSelected >= 0.95) {
              qSelected = 0.95;
              sweepDirection = -1;
            } else if (qSelected <= 0.05) {
              qSelected = 0.05;
              sweepDirection = 1;
            }
            if (sliderQ) sliderQ.value = Math.round(qSelected * 100);
            updateTelemetry();
            draw();
            sweepAnimId = requestAnimationFrame(loopSweep);
          }
          sweepAnimId = requestAnimationFrame(loopSweep);
        } else {
          btnSweep.classList.remove('active');
          btnSweep.innerHTML = '<span>▶</span><span>Auto Sweep Belief</span>';
          if (sweepAnimId) cancelAnimationFrame(sweepAnimId);
        }
      });
    }

    observeSimulationVisibility(container, function () {
      isVisible = true;
      draw();
    }, function () {
      isVisible = false;
      if (isSweeping && btnSweep) btnSweep.click();
    });

    registerDraw(draw);
    updateTelemetry();
    draw();
  }

  // ==========================================================================
  // WIDGET 4: MACHINE LEARNING NEXT-TOKEN LOSS
  // ==========================================================================
  function initWidgetMLCrossEntropy(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderEpoch = container.querySelector('.slider-ml-epoch');
    var valEpoch = container.querySelector('.val-ml-epoch');
    var chips = container.querySelectorAll('.chip-ml-epoch');
    var readoutLoss = container.querySelector('.readout-ml-loss');
    var readoutEpochBadge = container.querySelector('.readout-epoch-badge');
    var readoutFloor = container.querySelector('.readout-ml-entropy-floor');
    var readoutStatus = container.querySelector('.readout-ml-status');

    var tokens = [
      { text: '“is delicious”', p: 0.55 },
      { text: '“was hot”', p: 0.30 },
      { text: '“spilled on rug”', p: 0.14 },
      { text: '“garden phone”', p: 0.01 }
    ];

    // Compute intrinsic language entropy floor H(P)
    var entropyFloor = 0;
    for (var i = 0; i < tokens.length; i++) {
      entropyFloor += -tokens[i].p * safeLog(tokens[i].p);
    }
    if (readoutFloor) readoutFloor.innerText = entropyFloor.toFixed(3) + ' nats';

    var currentEpoch = 0;
    var isVisible = true;

    function getPredictedDist(epoch) {
      // Exponential transition from uniform (25% each) to true distribution
      var progress = epoch / 100.0;
      var alpha = 1.0 - Math.exp(-3.2 * progress);
      var qDist = [];
      for (var j = 0; j < tokens.length; j++) {
        var uniform = 0.25;
        var qVal = (1.0 - alpha) * uniform + alpha * tokens[j].p;
        qDist.push(Math.max(0.0001, qVal));
      }
      return qDist;
    }

    function update() {
      var q = getPredictedDist(currentEpoch);
      var loss = 0;

      for (var k = 0; k < tokens.length; k++) {
        var pVal = tokens[k].p;
        var qVal = q[k];
        var component = -pVal * safeLog(qVal);
        loss += component;

        // Update DOM rows
        var fillEl = container.querySelector('.fill-token-' + k);
        var valEl = container.querySelector('.val-token-' + k);
        var lossEl = container.querySelector('.loss-token-' + k);

        if (fillEl) fillEl.style.width = Math.round(qVal * 100) + '%';
        if (valEl) valEl.innerText = (qVal * 100).toFixed(1) + '%';
        if (lossEl) lossEl.innerText = component.toFixed(2) + ' n';
      }

      if (readoutLoss) readoutLoss.innerText = loss.toFixed(3) + ' nats';
      if (readoutEpochBadge) readoutEpochBadge.innerText = 'Epoch ' + currentEpoch;
      if (valEpoch) {
        valEpoch.innerText = 'Epoch ' + currentEpoch + ' (' + (currentEpoch === 0 ? 'Untrained' : currentEpoch === 100 ? 'Converged' : 'Training') + ')';
      }

      if (readoutStatus) {
        if (currentEpoch === 0) {
          readoutStatus.innerText = 'Untrained model: uniform probabilities across all tokens lead to high loss and absurd completions.';
        } else if (currentEpoch < 50) {
          readoutStatus.innerText = 'Mid-training: the model begins learning syntax, suppressing absurdity while probabilities align toward reality.';
        } else {
          readoutStatus.innerText = 'Converged: predicted distribution tightly matches true language patterns, minimizing loss to the irreducible entropy floor.';
        }
      }

      draw();
    }

    function draw() {
      if (!isVisible) return;
      var res = setupRetinaCanvas(canvas);
      var ctx = res.ctx;
      var w = res.width;
      var h = res.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      var padLeft = 28;
      var padRight = 24;
      var topY = 24;
      var contentW = w - padLeft - padRight;

      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('TARGET TRUTH P (STRIPED) VS. MODEL PREDICTION Q (SOLID)', padLeft, topY);

      var q = getPredictedDist(currentEpoch);
      var numTokens = tokens.length;
      var rowH = 26;
      var rowGap = 12;

      for (var i = 0; i < numTokens; i++) {
        var t = tokens[i];
        var qVal = q[i];
        var ry = topY + 16 + i * (rowH + rowGap);

        // Background track
        ctx.fillStyle = colors.isLight ? '#ede8de' : '#22201c';
        ctx.beginPath();
        ctx.roundRect(padLeft, ry, contentW, rowH, 4);
        ctx.fill();

        // Target P ghost mark / indicator
        var pWidth = contentW * t.p;
        ctx.strokeStyle = colors.isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(padLeft, ry, pWidth, rowH);
        ctx.setLineDash([]);

        // Model Q filled bar
        var qWidth = Math.max(4, contentW * qVal);
        ctx.fillStyle = i === 3 ? colors.dangerColor : colors.timeColor;
        ctx.beginPath();
        ctx.roundRect(padLeft, ry, qWidth, rowH, 4);
        ctx.fill();

        // Label and numbers
        ctx.font = 'bold 11px var(--font-mono)';
        ctx.fillStyle = colors.pillText;
        ctx.textAlign = 'left';
        ctx.fillText(t.text, padLeft + 8, ry + rowH / 2 + 4);

        ctx.textAlign = 'right';
        ctx.fillText('Q: ' + Math.round(qVal * 100) + '% (P: ' + Math.round(t.p * 100) + '%)', padLeft + contentW - 8, ry + rowH / 2 + 4);
      }

      // Visual Loss Bar vs Entropy Floor at the bottom
      var lossBarY = topY + 16 + numTokens * (rowH + rowGap) + 16;
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillStyle = colors.subtleText;
      ctx.textAlign = 'left';
      ctx.fillText('TOTAL CROSS-ENTROPY LOSS VS. LANGUAGE ENTROPY FLOOR', padLeft, lossBarY);

      var meterY = lossBarY + 12;
      var meterH = 20;
      var maxVisualLoss = 1.6;

      ctx.fillStyle = colors.isLight ? '#ede8de' : '#22201c';
      ctx.beginPath();
      ctx.roundRect(padLeft, meterY, contentW, meterH, 4);
      ctx.fill();

      // Current loss bar
      var curLoss = 0;
      for (var l = 0; l < tokens.length; l++) {
        curLoss += -tokens[l].p * safeLog(q[l]);
      }
      var lossFillW = Math.min(contentW, contentW * (curLoss / maxVisualLoss));
      ctx.fillStyle = colors.timeColor;
      ctx.beginPath();
      ctx.roundRect(padLeft, meterY, lossFillW, meterH, 4);
      ctx.fill();

      // Entropy Floor Line
      var floorX = padLeft + contentW * (entropyFloor / maxVisualLoss);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(floorX, meterY - 4);
      ctx.lineTo(floorX, meterY + meterH + 4);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, 'Floor: ' + entropyFloor.toFixed(3) + ' nats', floorX, meterY + meterH + 16, {
        textColor: colors.photonColor,
        borderColor: colors.photonColor,
        font: 'bold 10px var(--font-mono)'
      });
    }

    if (sliderEpoch) {
      sliderEpoch.addEventListener('input', function () {
        currentEpoch = parseInt(this.value, 10);
        chips.forEach(function (c) { c.classList.remove('active'); });
        update();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        currentEpoch = parseInt(this.getAttribute('data-epoch'), 10);
        if (sliderEpoch) sliderEpoch.value = currentEpoch;
        update();
      });
    });

    observeSimulationVisibility(container, function () {
      isVisible = true;
      draw();
    }, function () {
      isVisible = false;
    });

    registerDraw(draw);
    update();
  }

  // ==========================================================================
  // INITIALIZATION RUNNER
  // ==========================================================================
  function init() {
    initWidgetRealityVsBelief('widget-reality-vs-belief');
    initWidgetLearningScenarios('widget-learning-scenarios');
    initWidgetCrossEntropyCurve('widget-cross-entropy-curve');
    initWidgetMLCrossEntropy('widget-ml-cross-entropy');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
