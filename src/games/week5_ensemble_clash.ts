import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface HouseData {
  id: number;
  name: string;
  size: number; // sqft
  bathrooms: number;
  price: number; // k$ (actual y)
}

interface AdaPoint {
  id: number;
  x: number;
  y: number;
  label: 1 | -1;
  weight: number;
}

interface AdaStump {
  feature: 'x' | 'y';
  threshold: number;
  direction: 1 | -1; // 1 means > thresh is +1, -1 means > thresh is -1
  alpha: number;
  error: number;
}

export function renderWeek5EnsembleClash(container: HTMLElement) {
  let activeTab: 'midterm_q11' | 'bagging' | 'adaboost' | 'gradient_boost' = 'midterm_q11';

  // ---------------------------------------------------------
  // Midterm Q11 State
  // ---------------------------------------------------------
  let q11SelectedAnswer: number | null = null;
  let q11Submitted = false;

  // ---------------------------------------------------------
  // Bagging Simulator State
  // ---------------------------------------------------------
  let numTrees = 10;
  const baggingN = 25;
  // Generate a noisy non-linear dataset (sine wave)
  const baggingData = Array.from({ length: baggingN }, (_, i) => {
    const x = -3 + (6 * i) / (baggingN - 1);
    const yTrue = Math.sin(x) * 1.8;
    const y = yTrue + (Math.sin(i * 99) * 0.7); // deterministic noise
    return { x, y, yTrue };
  });

  // ---------------------------------------------------------
  // AdaBoost Simulator State
  // ---------------------------------------------------------
  const initialAdaPoints: AdaPoint[] = [
    { id: 1, x: -2.2, y: 1.5, label: 1, weight: 0.1 },
    { id: 2, x: -1.8, y: 0.4, label: 1, weight: 0.1 },
    { id: 3, x: -1.2, y: 1.8, label: 1, weight: 0.1 },
    { id: 4, x: -0.5, y: -1.2, label: 1, weight: 0.1 },
    { id: 5, x: 0.2, y: 1.6, label: 1, weight: 0.1 },
    // Negative points
    { id: 6, x: 1.8, y: -1.5, label: -1, weight: 0.1 },
    { id: 7, x: 2.2, y: -0.4, label: -1, weight: 0.1 },
    { id: 8, x: 1.2, y: 0.8, label: -1, weight: 0.1 }, // Hard sample near border
    { id: 9, x: 0.8, y: -1.8, label: -1, weight: 0.1 },
    { id: 10, x: -0.2, y: -0.5, label: -1, weight: 0.1 },
  ];

  let adaPoints: AdaPoint[] = JSON.parse(JSON.stringify(initialAdaPoints));
  let adaStumps: AdaStump[] = [];
  let adaRound = 0;

  // ---------------------------------------------------------
  // Gradient Boosting House Price Data (Slides 82-91)
  // ---------------------------------------------------------
  const houseData: HouseData[] = [
    { id: 1, name: 'House 1', size: 1500, bathrooms: 2, price: 600 },
    { id: 2, name: 'House 2', size: 1200, bathrooms: 1, price: 550 },
    { id: 3, name: 'House 3', size: 2800, bathrooms: 4, price: 899 },
    { id: 4, name: 'House 4', size: 2400, bathrooms: 3, price: 725 },
    { id: 5, name: 'House 5', size: 900,  bathrooms: 2, price: 410 },
  ];

  // Base initial constant prediction f0 = mean(y) = 636.8
  const f0 = 636.8;
  let gbStep = 0; // 0: f0 baseline, 1: after f1 (size > 2000), 2: after f2 (baths > 3)
  let gbLearningRate = 0.5; // alpha shrinkage factor

  // Calculations for Gradient Boosting
  function getGbState() {
    // Step 0: Residuals r0 = y - 636.8
    const r0 = houseData.map(h => h.price - f0);

    // Learner 1: Split on Size > 2000
    // Left: H1, H2, H5 (size <= 2000) -> mean residual = (-36.8 + -86.8 + -226.8)/3 = -116.8
    // Right: H3, H4 (size > 2000) -> mean residual = (262.2 + 88.2)/2 = +175.2
    const gamma1Left = -116.8;
    const gamma1Right = 175.2;

    const f1 = houseData.map(h => {
      const g = h.size > 2000 ? gamma1Right : gamma1Left;
      return f0 + gbLearningRate * g;
    });

    const r1 = houseData.map((h, i) => h.price - (f1[i] ?? f0));

    // Learner 2: Split on Bathrooms > 3
    // Left: H1, H2, H4, H5 (baths <= 3) -> mean residual r1
    // Right: H3 (baths > 3 = 4) -> residual r1 of H3
    const leftIndices = [0, 1, 3, 4];
    const leftR1Sum = leftIndices.reduce((sum, idx) => sum + (r1[idx] ?? 0), 0);
    const gamma2Left = leftR1Sum / leftIndices.length;
    const gamma2Right = r1[2] ?? 0;

    const f2 = houseData.map((h, i) => {
      const g = h.bathrooms > 3 ? gamma2Right : gamma2Left;
      return (f1[i] ?? f0) + gbLearningRate * g;
    });

    const r2 = houseData.map((h, i) => h.price - (f2[i] ?? f0));

    // MSE calculations
    const mse0 = r0.reduce((s, r) => s + r * r, 0) / houseData.length;
    const mse1 = r1.reduce((s, r) => s + r * r, 0) / houseData.length;
    const mse2 = r2.reduce((s, r) => s + r * r, 0) / houseData.length;

    return { r0, f1, r1, gamma1Left, gamma1Right, f2, r2, gamma2Left, gamma2Right, mse0, mse1, mse2 };
  }

  // ---------------------------------------------------------
  // AdaBoost Step Execution
  // ---------------------------------------------------------
  function stepAdaBoost() {
    sound.playClick();
    adaRound++;

    // Candidate stumps along X or Y
    const candidates: AdaStump[] = [
      { feature: 'x', threshold: 0.0, direction: -1, alpha: 0, error: 0 },
      { feature: 'x', threshold: 0.5, direction: -1, alpha: 0, error: 0 },
      { feature: 'x', threshold: -0.8, direction: 1, alpha: 0, error: 0 },
      { feature: 'y', threshold: 0.0, direction: 1, alpha: 0, error: 0 },
      { feature: 'y', threshold: 0.5, direction: 1, alpha: 0, error: 0 },
      { feature: 'y', threshold: -0.5, direction: -1, alpha: 0, error: 0 },
    ];

    let bestStump: AdaStump | null = null;
    let minErr = Infinity;

    candidates.forEach(cand => {
      let err = 0;
      adaPoints.forEach(p => {
        const val = cand.feature === 'x' ? p.x : p.y;
        const pred: 1 | -1 = (val > cand.threshold ? 1 : -1) * cand.direction as 1 | -1;
        if (pred !== p.label) {
          err += p.weight;
        }
      });

      if (err < minErr && err > 0 && err < 0.5) {
        minErr = err;
        bestStump = { ...cand, error: err, alpha: 0.5 * Math.log((1 - err) / err) };
      }
    });

    if (!bestStump) {
      // Fallback stump
      bestStump = {
        feature: 'x',
        threshold: 0.1,
        direction: -1,
        error: 0.2,
        alpha: 0.5 * Math.log((1 - 0.2) / 0.2)
      };
    }

    adaStumps.push(bestStump);

    // Update weights: w_i = w_i * exp(-alpha * y_i * h(x_i)) / Z
    let z = 0;
    adaPoints.forEach(p => {
      const val = bestStump!.feature === 'x' ? p.x : p.y;
      const pred: 1 | -1 = (val > bestStump!.threshold ? 1 : -1) * bestStump!.direction as 1 | -1;
      const factor = Math.exp(-bestStump!.alpha * p.label * pred);
      p.weight *= factor;
      z += p.weight;
    });

    // Normalize weights
    adaPoints.forEach(p => {
      p.weight /= z;
    });

    sound.playCorrect();
  }

  // ---------------------------------------------------------
  // 2D Canvas Visualizers
  // ---------------------------------------------------------
  function drawBaggingCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 35) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const toCanvasX = (val: number) => ((val + 3.2) / 6.4) * w;
    const toCanvasY = (val: number) => h / 2 - (val / 2.8) * (h / 2);

    interface RegTreeNode {
      splitX?: number;
      val?: number;
      left?: RegTreeNode;
      right?: RegTreeNode;
    }

    function fitTree(data: { x: number; y: number }[], depth: number, maxDepth: number): RegTreeNode {
      if (depth >= maxDepth || data.length <= 2) {
        const meanY = data.reduce((s, d) => s + d.y, 0) / (data.length || 1);
        return { val: meanY };
      }
      let bestSplit = 0;
      let minLoss = Infinity;
      let bestLeft: { x: number; y: number }[] = [];
      let bestRight: { x: number; y: number }[] = [];

      for (let i = 0; i < data.length - 1; i++) {
        const mid = (data[i]!.x + data[i + 1]!.x) / 2;
        const left = data.filter(d => d.x <= mid);
        const right = data.filter(d => d.x > mid);
        if (left.length === 0 || right.length === 0) continue;
        const mL = left.reduce((s, d) => s + d.y, 0) / left.length;
        const mR = right.reduce((s, d) => s + d.y, 0) / right.length;
        const loss = left.reduce((s, d) => s + (d.y - mL) ** 2, 0) + right.reduce((s, d) => s + (d.y - mR) ** 2, 0);
        if (loss < minLoss) {
          minLoss = loss;
          bestSplit = mid;
          bestLeft = left;
          bestRight = right;
        }
      }

      if (bestLeft.length === 0 || bestRight.length === 0) {
        const meanY = data.reduce((s, d) => s + d.y, 0) / (data.length || 1);
        return { val: meanY };
      }

      return {
        splitX: bestSplit,
        left: fitTree(bestLeft, depth + 1, maxDepth),
        right: fitTree(bestRight, depth + 1, maxDepth)
      };
    }

    function evalTree(node: RegTreeNode, x: number): number {
      if (node.val !== undefined) return node.val;
      if (x <= node.splitX!) return evalTree(node.left!, x);
      return evalTree(node.right!, x);
    }

    // Draw individual bootstrap models (thin dashed faint step-curves - high variance)
    const curvePoints = 80;
    const xs = Array.from({ length: curvePoints }, (_, i) => -3 + (6 * i) / (curvePoints - 1));

    // Fit genuine bootstrap regression trees (depth 3)
    const treePredictions: number[][] = [];
    for (let t = 0; t < numTrees; t++) {
      ctx.strokeStyle = `hsla(${(t * 45) % 360}, 80%, 65%, 0.28)`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();

      // Bootstrap sample with replacement
      const sample: { x: number; y: number }[] = [];
      for (let i = 0; i < baggingN; i++) {
        const pseudoRand = Math.abs(Math.sin((t + 1) * 7919 + (i + 1) * 31));
        const idx = Math.floor(pseudoRand * baggingN) % baggingN;
        sample.push(baggingData[idx] || baggingData[0]!);
      }
      sample.sort((a, b) => a.x - b.x);
      const tree = fitTree(sample, 0, 3);

      const preds: number[] = [];
      xs.forEach((xVal, idx) => {
        const yPred = evalTree(tree, xVal);
        preds.push(yPred);

        const cx = toCanvasX(xVal);
        const cy = toCanvasY(yPred);
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      treePredictions.push(preds);
    }
    ctx.setLineDash([]);

    // Draw Ensemble Average (Solid Glowing Emerald Curve)
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.beginPath();

    xs.forEach((xVal, idx) => {
      let sum = 0;
      for (let t = 0; t < numTrees; t++) {
        sum += treePredictions[t]?.[idx] ?? 0;
      }
      const avgY = sum / numTrees;
      const cx = toCanvasX(xVal);
      const cy = toCanvasY(avgY);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Data points
    baggingData.forEach(p => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function drawAdaCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 35) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const toCanvasX = (val: number) => ((val + 3.0) / 6.0) * w;
    const toCanvasY = (val: number) => ((-val + 3.0) / 6.0) * h;

    // Draw decision stumps boundaries
    adaStumps.forEach((stump, sIdx) => {
      ctx.strokeStyle = sIdx === adaStumps.length - 1 ? 'rgba(0, 255, 136, 0.85)' : 'rgba(255, 170, 0, 0.4)';
      ctx.lineWidth = sIdx === adaStumps.length - 1 ? 3 : 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();

      if (stump.feature === 'x') {
        const cx = toCanvasX(stump.threshold);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
      } else {
        const cy = toCanvasY(stump.threshold);
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw points sized by weight w_i!
    adaPoints.forEach(p => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);
      const isPos = p.label === 1;

      // Weight expands radius from 4px up to 26px!
      const radius = 4 + p.weight * 70;

      ctx.save();
      ctx.fillStyle = isPos ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 42, 133, 0.8)';
      ctx.shadowColor = isPos ? '#00f0ff' : '#ff2a85';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Display sign (+ / -)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPos ? '+' : '−', cx, cy);
      ctx.restore();
    });
  }

  function render() {
    const gb = getGbState();

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>⚔️ Game 5.3: Ensemble Clash (Bagging vs Boosting Arena)</h2>
            <p class="card-subtitle">Master Bias vs Variance Reduction, AdaBoost Exponential Weighting, and Gradient Boosted Residual Trees (Midterm Q11 & Slides 82-91)</p>
          </div>
          <span class="concept-badge">Midterm Question 11 Arena</span>
        </div>

        <!-- Mode Sub-Tabs -->
        <div style="display:flex; gap:10px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap:wrap;">
          <button id="tab-q11" class="btn btn-sm ${activeTab === 'midterm_q11' ? 'btn-primary' : 'btn-secondary'}">
            🎯 1. Midterm Practice Question 11
          </button>
          <button id="tab-bagging" class="btn btn-sm ${activeTab === 'bagging' ? 'btn-primary' : 'btn-secondary'}">
            📦 2. Bagging Variance Reducer
          </button>
          <button id="tab-adaboost" class="btn btn-sm ${activeTab === 'adaboost' ? 'btn-primary' : 'btn-secondary'}">
            🚀 3. AdaBoost Exponential Weights
          </button>
          <button id="tab-gb" class="btn btn-sm ${activeTab === 'gradient_boost' ? 'btn-primary' : 'btn-secondary'}">
            🏡 4. Gradient Boosting House Price Solver (Slides 82-91)
          </button>
        </div>

        ${activeTab === 'midterm_q11' ? `
          <!-- Question 11 Interactive Exam Solver -->
          <div style="background: rgba(14, 22, 38, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
              <span class="badge-pill" style="font-size:12px; padding:4px 10px;">uOttawa CSI 5155 Midterm • Question 11</span>
              <span style="font-family:'Fira Code', monospace; color:var(--accent-amber); font-weight:bold;">Worth 5 Marks</span>
            </div>

            <div style="font-size:15px; font-weight:600; line-height:1.6; color:#fff; margin-bottom: 16px; background:rgba(0,0,0,0.3); padding:16px; border-radius:var(--radius-sm); border-left:4px solid var(--accent-cyan);">
              "Assume you are training a base model (like a decision tree) that exhibits very high bias (underfitting) on the training data. Would Bagging or Boosting be the preferred ensemble approach to improve performance? Justify your answer by referencing the primary mechanism of improvement for each method."
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom: 18px;">
              <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:${q11SelectedAnswer === 1 ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${q11SelectedAnswer === 1 ? 'var(--accent-cyan)' : 'var(--border-color)'}; border-radius:var(--radius-sm); cursor:pointer;">
                <input type="radio" name="q11" value="1" ${q11SelectedAnswer === 1 ? 'checked' : ''} style="margin-top:4px;">
                <div>
                  <strong style="color:var(--text-primary);">A) Bagging</strong>
                  <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                    Because bagging trains independent trees on bootstrap samples and averages their outputs, which flattens the bias of the underfitting tree.
                  </p>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:${q11SelectedAnswer === 2 ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${q11SelectedAnswer === 2 ? 'var(--accent-green)' : 'var(--border-color)'}; border-radius:var(--radius-sm); cursor:pointer;">
                <input type="radio" name="q11" value="2" ${q11SelectedAnswer === 2 ? 'checked' : ''} style="margin-top:4px;">
                <div>
                  <strong style="color:var(--accent-green);">B) Boosting (Preferred)</strong>
                  <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                    Because boosting trains weak learners sequentially, with each new model specifically targeting the errors/residuals of preceding models to systematically drive down bias. Bagging only reduces variance by averaging!
                  </p>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:${q11SelectedAnswer === 3 ? 'rgba(255,51,68,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${q11SelectedAnswer === 3 ? 'var(--accent-red)' : 'var(--border-color)'}; border-radius:var(--radius-sm); cursor:pointer;">
                <input type="radio" name="q11" value="3" ${q11SelectedAnswer === 3 ? 'checked' : ''} style="margin-top:4px;">
                <div>
                  <strong style="color:var(--text-primary);">C) Bagging</strong>
                  <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                    Because the ~36.8% Out-of-Bag (OOB) samples inject fresh unseen patterns into each parallel learner to escape underfitting.
                  </p>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:${q11SelectedAnswer === 4 ? 'rgba(255,170,0,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${q11SelectedAnswer === 4 ? 'var(--accent-amber)' : 'var(--border-color)'}; border-radius:var(--radius-sm); cursor:pointer;">
                <input type="radio" name="q11" value="4" ${q11SelectedAnswer === 4 ? 'checked' : ''} style="margin-top:4px;">
                <div>
                  <strong style="color:var(--text-primary);">D) Neither</strong>
                  <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                    Ensembles are incapable of altering the bias of base learners; only feature engineering can adjust bias.
                  </p>
                </div>
              </label>
            </div>

            <button id="btn-submit-q11" class="btn btn-primary">Submit Answer for Midterm Evaluation</button>

            ${q11Submitted ? `
              <div style="margin-top:16px; padding:16px; border-radius:var(--radius-md); background:${q11SelectedAnswer === 2 ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,68,0.15)'}; border:1px solid ${q11SelectedAnswer === 2 ? 'var(--accent-green)' : 'var(--accent-red)'};">
                <h4 style="color:${q11SelectedAnswer === 2 ? '#a7f3d0' : '#fca5a5'}; margin-bottom:6px;">
                  ${q11SelectedAnswer === 2 ? '🎉 100% CORRECT (5/5 Marks)!' : '❌ INCORRECT'}
                </h4>
                <p style="font-size:13px; line-height:1.6; color:#fff;">
                  <strong>Official Exam Solution:</strong> <strong>BOOSTING</strong> is the preferred approach.
                  <br>• <strong>Boosting Mechanism:</strong> Base models are trained <em>sequentially</em>. Each successive weak learner fits the residual errors (in Gradient Boosting) or re-weighted misclassifications (in AdaBoost) of the previous ensemble. This sequential correction directly converts a high-bias weak model into an arbitrarily complex low-bias ensemble.
                  <br>• <strong>Bagging Mechanism:</strong> Bagging trains independent models in <em>parallel</em> on bootstrap samples and averages predictions. The mathematical expectation of an average is the expectation of the base learner: $\\mathbb{E}[\\bar{f}] = \\mathbb{E}[f_{base}]$. Thus, <strong>Bagging does NOT reduce bias</strong>; its sole mechanism is reducing variance ($\text{Var} \\approx \\rho \\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$) for deep high-variance trees!
                </p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${activeTab === 'bagging' ? `
          <div class="controls-panel">
            <div class="control-item">
              <label>Number of Parallel Trees (B): <span id="lbl-trees">${numTrees}</span></label>
              <input type="range" id="slider-trees" min="1" max="30" step="1" value="${numTrees}">
            </div>

            <div class="control-item">
              <label>Out-of-Bag (OOB) Fraction</label>
              <div style="font-family:'Fira Code', monospace; color:var(--accent-cyan); font-weight:bold; font-size:14px; margin-top:4px;">
                (1 - 1/N)^N ≈ 36.8%
              </div>
            </div>

            <div class="control-item" style="margin-left:auto;">
              <div style="font-size:11px; color:var(--text-muted); font-weight:bold;">ENSEMBLE VARIANCE</div>
              <div style="font-size:18px; font-weight:800; font-family:'Fira Code', monospace; color:var(--accent-green);">
                ${(0.45 + (1.2 / numTrees)).toFixed(3)}
              </div>
            </div>
          </div>

          <div class="game-viewport" style="height: 380px; margin-bottom: 20px;">
            <canvas id="bagging-canvas" width="850" height="380" style="width:100%; height:100%;"></canvas>
            <div class="viewport-overlay">
              <div><strong style="color:var(--accent-cyan);">Data Points:</strong> ${baggingN} Samples</div>
              <div><strong style="color:var(--accent-green);">Ensemble Average (Solid):</strong> Variance smoothed by averaging</div>
              <div><strong style="color:var(--accent-pink);">Individual Trees (Dashed):</strong> High-variance bootstrap fits</div>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'adaboost' ? `
          <div class="controls-panel">
            <div class="control-item">
              <label>Current Round (m)</label>
              <div style="font-size:18px; font-weight:800; font-family:'Fira Code', monospace; color:var(--accent-cyan);">
                Round ${adaRound} (${adaStumps.length} Stumps)
              </div>
            </div>

            <div class="control-item" style="align-self:flex-end;">
              <button id="btn-step-adaboost" class="btn btn-primary btn-sm">
                Next AdaBoost Iteration (Fit Stump & Re-weight)
              </button>
            </div>

            <div class="control-item" style="align-self:flex-end;">
              <button id="btn-reset-adaboost" class="btn btn-secondary btn-sm">
                Reset AdaBoost
              </button>
            </div>

            ${adaStumps.length > 0 ? `
              <div class="control-item" style="margin-left:auto;">
                <label>Latest Stump Weight α_m</label>
                <div style="font-family:'Fira Code', monospace; color:var(--accent-amber); font-weight:bold; font-size:14px;">
                  α_${adaRound} = ${(adaStumps[adaStumps.length - 1]?.alpha ?? 0).toFixed(3)} (err = ${(adaStumps[adaStumps.length - 1]?.error ?? 0).toFixed(2)})
                </div>
              </div>
            ` : ''}
          </div>

          <div class="game-viewport" style="height: 380px; margin-bottom: 20px;">
            <canvas id="adaboost-canvas" width="850" height="380" style="width:100%; height:100%;"></canvas>
            <div class="viewport-overlay">
              <div><strong style="color:var(--accent-cyan);">Point Size:</strong> Scales with sample weight w_i!</div>
              <div><strong style="color:var(--accent-green);">Stump Boundary:</strong> Dashed line partition</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                Misclassified samples swell up (multiplied by e^α), forcing next stump to prioritize them!
              </div>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'gradient_boost' ? `
          <!-- Gradient Boosting Slides 82-91 Walkthrough -->
          <div class="controls-panel">
            <div class="control-item">
              <label>Model Iteration Step</label>
              <div style="display:flex; gap:8px;">
                <button id="btn-gb-step-0" class="btn btn-sm ${gbStep === 0 ? 'btn-primary' : 'btn-secondary'}">
                  Step 0: f₀ = ȳ = 636.8
                </button>
                <button id="btn-gb-step-1" class="btn btn-sm ${gbStep === 1 ? 'btn-primary' : 'btn-secondary'}">
                  Step 1: + f₁ (Size > 2000)
                </button>
                <button id="btn-gb-step-2" class="btn btn-sm ${gbStep === 2 ? 'btn-primary' : 'btn-secondary'}">
                  Step 2: + f₂ (Baths > 3)
                </button>
              </div>
            </div>

            <div class="control-item">
              <label>Shrinkage Learning Rate α: <span id="lbl-lr">${gbLearningRate.toFixed(2)}</span></label>
              <input type="range" id="slider-lr" min="0.1" max="1.0" step="0.1" value="${gbLearningRate}">
            </div>

            <div class="control-item" style="margin-left:auto;">
              <div style="font-size:11px; color:var(--text-muted); font-weight:bold;">MEAN SQUARED ERROR (MSE)</div>
              <div style="font-size:20px; font-weight:800; font-family:'Fira Code', monospace; color:${gbStep === 2 ? 'var(--accent-green)' : (gbStep === 1 ? 'var(--accent-amber)' : 'var(--accent-red)')};">
                ${gbStep === 0 ? gb.mse0.toFixed(1) : (gbStep === 1 ? gb.mse1.toFixed(1) : gb.mse2.toFixed(1))}
              </div>
            </div>
          </div>

          <!-- House Price Table from Slides 82-91 -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <h4 style="font-size:14px; color:var(--accent-cyan);">
                House Price Residual Fitting Table (Week 5 Slides 82-91)
              </h4>
              <span style="font-size:12px; color:var(--accent-amber); font-family:'Fira Code', monospace;">
                ${gbStep === 0 ? 'Baseline f₀ = 636.8' : (gbStep === 1 ? `Tree 1 Splits Size > 2000 (Left: ${gb.gamma1Left.toFixed(1)}, Right: +${gb.gamma1Right.toFixed(1)})` : `Tree 2 Splits Baths > 3 (Left: ${gb.gamma2Left.toFixed(1)}, Right: +${gb.gamma2Right.toFixed(1)})`)}
              </span>
            </div>

            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse: collapse; font-family: 'Fira Code', monospace; font-size: 11px;">
                <thead>
                  <tr style="color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: left;">
                    <th style="padding: 8px;">House</th>
                    <th style="padding: 8px;">Size (sqft)</th>
                    <th style="padding: 8px;">Bathrooms</th>
                    <th style="padding: 8px;">Actual Price y</th>
                    <th style="padding: 8px; color:var(--accent-cyan);">Current Pred f(x)</th>
                    <th style="padding: 8px; color:var(--accent-pink);">Residual r = y - f(x)</th>
                    <th style="padding: 8px;">Split Branch</th>
                  </tr>
                </thead>
                <tbody>
                  ${houseData.map((h, i) => {
                    const currentPred = gbStep === 0 ? f0 : (gbStep === 1 ? (gb.f1[i] ?? f0) : (gb.f2[i] ?? f0));
                    const currentResidual = gbStep === 0 ? (gb.r0[i] ?? 0) : (gbStep === 1 ? (gb.r1[i] ?? 0) : (gb.r2[i] ?? 0));
                    const branch = gbStep === 0 
                      ? 'Root' 
                      : (gbStep === 1 
                        ? (h.size > 2000 ? 'Size > 2000 (Right)' : 'Size ≤ 2000 (Left)')
                        : (h.bathrooms > 3 ? 'Baths > 3 (Right)' : 'Baths ≤ 3 (Left)'));

                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px; font-weight:bold; color:#fff;">${h.name}</td>
                        <td style="padding: 8px;">${h.size}</td>
                        <td style="padding: 8px;">${h.bathrooms}</td>
                        <td style="padding: 8px; font-weight:bold; color:var(--accent-green);">$${h.price}k</td>
                        <td style="padding: 8px; color:var(--accent-cyan); font-weight:bold;">$${currentPred.toFixed(1)}k</td>
                        <td style="padding: 8px; color:${currentResidual >= 0 ? '#38bdf8' : '#ff4d6d'}; font-weight:bold;">
                          ${currentResidual >= 0 ? '+' : ''}${currentResidual.toFixed(1)}k
                        </td>
                        <td style="padding: 8px; color:var(--text-secondary);">${branch}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; margin-top: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--accent-amber); margin-bottom: 8px;">
            Ensemble Mastery Checklist:
          </div>
          <div style="display: flex; gap: 20px; font-size: 12px; margin-bottom: 12px; flex-wrap: wrap;">
            <span style="color: ${q11SelectedAnswer === 2 ? 'var(--accent-green)' : 'var(--text-muted)'};">
              ${q11SelectedAnswer === 2 ? '✓' : '○'} Midterm Q11 (Exponential Loss)
            </span>
            <span style="color: ${adaRound >= 1 ? 'var(--accent-green)' : 'var(--text-muted)'};">
              ${adaRound >= 1 ? '✓' : '○'} AdaBoost (Sample Re-weighting)
            </span>
            <span style="color: ${gbStep >= 1 ? 'var(--accent-green)' : 'var(--text-muted)'};">
              ${gbStep >= 1 ? '✓' : '○'} Gradient Boosting (Residual Stumps)
            </span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div id="ensemble-feedback" style="min-height: 24px; font-size: 13px;"></div>
            <button id="btn-certify-ensemble" class="btn btn-accent">Verify Ensemble Clash Mastery</button>
          </div>
        </div>

        <!-- Academic Explainer Card -->
        <details class="math-explainer">
        <summary>💡 Week 5 Slide Insights: Bagging vs Boosting & Gradient Residual Optimization (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>Bagging (Variance Reduction):</strong> Trains $B$ independent learners in parallel on bootstrap samples. Variance reduces as $\text{Var} = \rho \sigma^2 + \frac{1-\rho}{B}\sigma^2$. Bias is untouched!</p>
          <p><strong>AdaBoost (Sequential Re-weighting):</strong> Focuses on hard samples by multiplying misclassified sample weights by $e^{\alpha_m}$ and correctly classified by $e^{-\alpha_m}$ where $\alpha_m = \frac{1}{2}\ln\left(\frac{1 - \epsilon_m}{\epsilon_m}\right)$.</p>
          <p><strong>Gradient Boosting (Pseudo-Residuals):</strong> Minimizes loss $\mathcal{L}(y, f(x))$ by training each new regression tree directly on the negative gradient (residuals): $r_{im} = -\left[\frac{\partial \mathcal{L}(y_i, f(x_i))}{\partial f(x_i)}\right]$.</p>
          <div class="formula-block">
            AdaBoost Update: w_{i}^{(m+1)} = (w_i^{(m)} / Z_m) · exp(-α_m y_i h_m(x_i))<br>
            Gradient Boosting: f_m(x) = f_{m-1}(x) + α · γ_m(x), where r_n = y_n - f_{m-1}(x_n)
          </div>
        </div>
      </details>
    </div>
  `;

    // Canvas rendering
    if (activeTab === 'bagging') {
      const cv = container.querySelector('#bagging-canvas') as HTMLCanvasElement | null;
      if (cv) drawBaggingCanvas(cv);
    } else if (activeTab === 'adaboost') {
      const cv = container.querySelector('#adaboost-canvas') as HTMLCanvasElement | null;
      if (cv) drawAdaCanvas(cv);
    }

    // Tab Listeners
    container.querySelector('#tab-q11')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'midterm_q11';
      render();
    });

    container.querySelector('#tab-bagging')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'bagging';
      render();
    });

    container.querySelector('#tab-adaboost')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'adaboost';
      render();
    });

    container.querySelector('#tab-gb')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'gradient_boost';
      render();
    });

    // Question 11 listeners
    container.querySelectorAll('input[name="q11"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        sound.playClick();
        q11SelectedAnswer = parseInt((e.target as HTMLInputElement).value);
        render();
      });
    });

    container.querySelector('#btn-submit-q11')?.addEventListener('click', () => {
      if (!q11SelectedAnswer) return;
      q11Submitted = true;
      if (q11SelectedAnswer === 2) {
        sound.playVictory();
        confetti({ particleCount: 50, spread: 60 });
      } else {
        sound.playWrong();
      }
      render();
    });

    // Bagging slider
    container.querySelector('#slider-trees')?.addEventListener('input', (e) => {
      numTrees = parseInt((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-trees');
      if (lbl) lbl.textContent = numTrees.toString();
      const cv = container.querySelector('#bagging-canvas') as HTMLCanvasElement | null;
      if (cv) drawBaggingCanvas(cv);
    });

    // AdaBoost buttons
    container.querySelector('#btn-step-adaboost')?.addEventListener('click', () => {
      stepAdaBoost();
      render();
    });

    container.querySelector('#btn-reset-adaboost')?.addEventListener('click', () => {
      sound.playClick();
      adaPoints = JSON.parse(JSON.stringify(initialAdaPoints));
      adaStumps = [];
      adaRound = 0;
      render();
    });

    // Gradient Boosting buttons
    container.querySelector('#btn-gb-step-0')?.addEventListener('click', () => {
      sound.playClick();
      gbStep = 0;
      render();
    });

    container.querySelector('#btn-gb-step-1')?.addEventListener('click', () => {
      sound.playClick();
      gbStep = 1;
      render();
    });

    container.querySelector('#btn-gb-step-2')?.addEventListener('click', () => {
      sound.playClick();
      gbStep = 2;
      render();
    });

    container.querySelector('#slider-lr')?.addEventListener('input', (e) => {
      gbLearningRate = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-lr');
      if (lbl) lbl.textContent = gbLearningRate.toFixed(2);
      render();
    });

    // Certify button
    container.querySelector('#btn-certify-ensemble')?.addEventListener('click', () => {
      const fb = container.querySelector('#ensemble-feedback');
      const hasQ11 = q11SelectedAnswer === 2;
      const hasAda = adaRound >= 1;
      const hasGb = gbStep >= 1;

      if (hasQ11 && hasAda && hasGb) {
        sound.playVictory();
        confetti({ particleCount: 80, spread: 70 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week5_ensemble');

        if (fb) {
          fb.innerHTML = `
            <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px; color: #a7f3d0;">
              <strong>🎉 Ensemble Mastery Certified!</strong> 
              Mastered Bagging variance smoothing, AdaBoost exponential weighting, Gradient Boosting residual trees, and Midterm Question 11! +150 Score awarded.
            </div>
          `;
        }
      } else {
        sound.playWrong();
        const missing: string[] = [];
        if (!hasQ11) missing.push('Submit correct answer for Midterm Q11');
        if (!hasAda) missing.push('Run at least 1 AdaBoost round');
        if (!hasGb) missing.push('Step through Gradient Boosting (Learner 1 / 2)');

        if (fb) {
          fb.innerHTML = `
            <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 12px; color: #fef08a;">
              <strong>Remaining to certify:</strong> ${missing.join(' • ')}
            </div>
          `;
        }
      }
    });
  }

  render();
}
