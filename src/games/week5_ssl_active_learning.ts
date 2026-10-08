import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface SSLPoint {
  id: number;
  x: number;
  y: number;
  trueLabel: 1 | -1;
  currentLabel: 1 | -1 | 0; // 0 = unlabeled
  probPos: number; // P(Y = +1)
  isSeed: boolean;
  pseudoLabeled: boolean;
  queried: boolean;
  view1Confidence?: number;
  view2Confidence?: number;
}

interface ALSample {
  id: number;
  name: string;
  p1: number;
  p2: number;
  p3: number;
  trueClass: 1 | 2 | 3;
  queried: boolean;
}

export function renderWeek5SslActiveLearning(container: HTMLElement) {
  let activeTab: 'assumptions' | 'wrapper' | 'active' = 'assumptions';

  // Sub-state for Assumptions
  let currentAssumption: 'smoothness' | 'low_density' | 'manifold' = 'smoothness';
  let neighborhoodRadius = 1.4;
  let boundarySplitX = 0.0; // For low density test
  let manifoldMode: 'euclidean' | 'geodesic' = 'geodesic';

  // Sub-state for Wrapper Methods
  let wrapperMode: 'self_training' | 'co_training' = 'self_training';
  let confidenceThreshold = 0.80;
  let wrapperIteration = 0;

  // Sub-state for Active Learning Game
  let alStrategy: 'least_confident' | 'margin' | 'entropy' = 'entropy';
  let queryBudget = 5;
  let queriesUsed = 0;
  let alAccuracy = 62.0;

  // Active learning 3-class candidate pool (from slide formulation)
  const alCandidates: ALSample[] = [
    { id: 1, name: 'Sample α (Border Ambiguity)', p1: 0.49, p2: 0.48, p3: 0.03, trueClass: 1, queried: false },
    { id: 2, name: 'Sample β (Max Entropy Chaos)', p1: 0.34, p2: 0.33, p3: 0.33, trueClass: 2, queried: false },
    { id: 3, name: 'Sample γ (Moderate Certainty)', p1: 0.72, p2: 0.20, p3: 0.08, trueClass: 1, queried: false },
    { id: 4, name: 'Sample δ (Class 2/3 Border)', p1: 0.04, p2: 0.49, p3: 0.47, trueClass: 3, queried: false },
    { id: 5, name: 'Sample ε (High Confidence Core)', p1: 0.94, p2: 0.04, p3: 0.02, trueClass: 1, queried: false },
    { id: 6, name: 'Sample ζ (Class 1/3 Border)', p1: 0.46, p2: 0.06, p3: 0.48, trueClass: 3, queried: false },
    { id: 7, name: 'Sample η (Tri-state Dispersion)', p1: 0.38, p2: 0.32, p3: 0.30, trueClass: 2, queried: false },
    { id: 8, name: 'Sample θ (Firm Class 2)', p1: 0.08, p2: 0.88, p3: 0.04, trueClass: 2, queried: false },
    { id: 9, name: 'Sample ι (Razor Thin Margin)', p1: 0.45, p2: 0.46, p3: 0.09, trueClass: 2, queried: false },
    { id: 10, name: 'Sample κ (Outlier Uncertainty)', p1: 0.35, p2: 0.35, p3: 0.30, trueClass: 1, queried: false },
  ];

  // Helper to generate two moon SSL points
  function generateMoonsData(): SSLPoint[] {
    const pts: SSLPoint[] = [];
    const nPerMoon = 18;
    let idCounter = 1;

    // Moon 1 (Upper arc: Class +1)
    for (let i = 0; i < nPerMoon; i++) {
      const angle = (Math.PI * i) / (nPerMoon - 1);
      const r = 2.0 + (Math.random() - 0.5) * 0.3;
      const x = r * Math.cos(angle) - 0.8;
      const y = r * Math.sin(angle) - 0.2;
      const isSeed = (i === 2 || i === nPerMoon - 3); // Only 2 labeled seeds!
      pts.push({
        id: idCounter++,
        x,
        y,
        trueLabel: 1,
        currentLabel: isSeed ? 1 : 0,
        probPos: isSeed ? 0.99 : 0.5,
        isSeed,
        pseudoLabeled: false,
        queried: false,
        view1Confidence: isSeed ? 0.95 : 0.5 + (Math.random() - 0.5) * 0.3,
        view2Confidence: isSeed ? 0.95 : 0.5 + (Math.random() - 0.5) * 0.3
      });
    }

    // Moon 2 (Lower arc: Class -1)
    for (let i = 0; i < nPerMoon; i++) {
      const angle = (Math.PI * i) / (nPerMoon - 1);
      const r = 2.0 + (Math.random() - 0.5) * 0.3;
      const x = -r * Math.cos(angle) + 0.8;
      const y = -r * Math.sin(angle) + 0.2;
      const isSeed = (i === 2 || i === nPerMoon - 3); // Only 2 labeled seeds!
      pts.push({
        id: idCounter++,
        x,
        y,
        trueLabel: -1,
        currentLabel: isSeed ? -1 : 0,
        probPos: isSeed ? 0.01 : 0.5,
        isSeed,
        pseudoLabeled: false,
        queried: false,
        view1Confidence: isSeed ? 0.05 : 0.5 + (Math.random() - 0.5) * 0.3,
        view2Confidence: isSeed ? 0.05 : 0.5 + (Math.random() - 0.5) * 0.3
      });
    }

    return pts;
  }

  let sslPoints: SSLPoint[] = generateMoonsData();

  // Active learning score calculators
  function calcLeastConfident(s: ALSample): number {
    const maxP = Math.max(s.p1, s.p2, s.p3);
    return 1 - maxP;
  }

  function calcMargin(s: ALSample): number {
    const sorted = [s.p1, s.p2, s.p3].sort((a, b) => b - a);
    const first = sorted[0] ?? 0;
    const second = sorted[1] ?? 0;
    return first - second; // smallest margin is most uncertain
  }

  function calcEntropy(s: ALSample): number {
    let ent = 0;
    [s.p1, s.p2, s.p3].forEach(p => {
      if (p > 0.0001) {
        ent -= p * Math.log2(p);
      }
    });
    return ent;
  }

  // Step 1: Label propagation for Smoothness Assumption
  function runSmoothnessDiffusion() {
    sound.playClick();
    const radiusSq = neighborhoodRadius * neighborhoodRadius;
    const nextLabels = sslPoints.map(p => p.currentLabel);

    sslPoints.forEach((p, idx) => {
      if (p.isSeed) return; // Seeds stay fixed

      let score = 0;
      let totalWeight = 0;

      sslPoints.forEach((other, oIdx) => {
        if (idx === oIdx || other.currentLabel === 0) return;
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dSq = dx * dx + dy * dy;
        if (dSq <= radiusSq) {
          const w = Math.exp(-dSq / (2 * 0.5));
          score += other.currentLabel * w;
          totalWeight += w;
        }
      });

      if (totalWeight > 0.05) {
        const normScore = score / totalWeight;
        if (normScore > 0.15) {
          nextLabels[idx] = 1;
          p.probPos = 0.5 + 0.45 * Math.min(1, Math.abs(normScore));
        } else if (normScore < -0.15) {
          nextLabels[idx] = -1;
          p.probPos = 0.5 - 0.45 * Math.min(1, Math.abs(normScore));
        }
      }
    });

    let newlyLabeled = 0;
    sslPoints.forEach((p, idx) => {
      const nLab = nextLabels[idx];
      if (nLab !== undefined && p.currentLabel === 0 && nLab !== 0) {
        p.currentLabel = nLab;
        newlyLabeled++;
      }
    });

    if (newlyLabeled > 0) {
      sound.playCorrect();
    }
  }

  // Step 2: Self-Training / Co-Training Wrapper Step
  function runWrapperStep() {
    sound.playClick();
    wrapperIteration++;

    if (wrapperMode === 'self_training') {
      let newlyPseudo = 0;
      sslPoints.forEach(p => {
        if (p.currentLabel !== 0) return;

        // Model confidence based on distance to labeled centroids
        const labeledPos = sslPoints.filter(o => o.currentLabel === 1);
        const labeledNeg = sslPoints.filter(o => o.currentLabel === -1);

        const dPos = labeledPos.length > 0 
          ? Math.min(...labeledPos.map(o => Math.hypot(p.x - o.x, p.y - o.y)))
          : 99;
        const dNeg = labeledNeg.length > 0
          ? Math.min(...labeledNeg.map(o => Math.hypot(p.x - o.x, p.y - o.y)))
          : 99;

        const probPos = 1 / (1 + Math.exp((dPos - dNeg) * 1.5));
        p.probPos = probPos;

        if (probPos >= confidenceThreshold) {
          p.currentLabel = 1;
          p.pseudoLabeled = true;
          newlyPseudo++;
        } else if (probPos <= (1 - confidenceThreshold)) {
          p.currentLabel = -1;
          p.pseudoLabeled = true;
          newlyPseudo++;
        }
      });

      if (newlyPseudo > 0) sound.playCorrect();
    } else {
      // Co-Training: View 1 (X spatial) & View 2 (Y spatial) cross-labeling
      let crossLabeled = 0;
      const unlabeled = sslPoints.filter(p => p.currentLabel === 0);

      // View 1 picks most confident point along X axis
      unlabeled.forEach(p => {
        p.view1Confidence = 1 / (1 + Math.exp(-p.x * 1.8));
        p.view2Confidence = 1 / (1 + Math.exp(-p.y * 1.8));
      });

      // View 1 labels high confidence item
      const topV1 = unlabeled.filter(p => (p.view1Confidence ?? 0.5) > confidenceThreshold);
      topV1.slice(0, 2).forEach(p => {
        p.currentLabel = 1;
        p.pseudoLabeled = true;
        crossLabeled++;
      });

      // View 2 labels high confidence negative item
      const topV2 = unlabeled.filter(p => (p.view2Confidence ?? 0.5) < (1 - confidenceThreshold));
      topV2.slice(0, 2).forEach(p => {
        p.currentLabel = -1;
        p.pseudoLabeled = true;
        crossLabeled++;
      });

      if (crossLabeled > 0) sound.playCorrect();
    }
  }

  // Draw 2D SSL Canvas
  function drawCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // Draw Cyber Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1;
    const gridStep = 35;
    for (let x = 0; x < w; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Mapping coordinates (-3.5, 3.5) to canvas
    const toCanvasX = (val: number) => ((val + 3.5) / 7.0) * w;
    const toCanvasY = (val: number) => ((-val + 3.5) / 7.0) * h;

    if (activeTab === 'assumptions' && currentAssumption === 'manifold') {
      // Draw Geodesic vs Euclidean comparison path
      const pStart = sslPoints[0];
      const pEnd = sslPoints[sslPoints.length - 1];
      if (pStart && pEnd) {
        const sx = toCanvasX(pStart.x);
        const sy = toCanvasY(pStart.y);
        const ex = toCanvasX(pEnd.x);
        const ey = toCanvasY(pEnd.y);

        if (manifoldMode === 'euclidean') {
          // Euclidean shortcut in Red/Orange
          ctx.strokeStyle = 'rgba(255, 51, 68, 0.85)';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#ff4d6d';
          ctx.font = 'bold 12px "Fira Code", monospace';
          ctx.fillText('❌ Euclidean Shortcut (Cuts Empty Space!)', (sx + ex) / 2 - 120, (sy + ey) / 2 - 15);
        } else {
          // Geodesic path curving along the manifold
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.9)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          sslPoints.slice(0, 18).forEach((pt, i) => {
            const px = toCanvasX(pt.x);
            const py = toCanvasY(pt.y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          ctx.fillStyle = '#00ff88';
          ctx.font = 'bold 12px "Fira Code", monospace';
          ctx.fillText('✔ Geodesic Path (Follows Lower-Dim Manifold)', toCanvasX(-1.5), toCanvasY(2.2));
        }
      }
    }

    if (activeTab === 'assumptions' && currentAssumption === 'low_density') {
      // Draw Candidate Decision Boundary
      const bx = toCanvasX(boundarySplitX);
      ctx.strokeStyle = Math.abs(boundarySplitX) < 0.4 ? 'rgba(0, 255, 136, 0.85)' : 'rgba(255, 51, 68, 0.85)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = Math.abs(boundarySplitX) < 0.4 ? '#00ff88' : '#ff4d6d';
      ctx.font = 'bold 12px "Fira Code", monospace';
      ctx.fillText(
        Math.abs(boundarySplitX) < 0.4 
          ? '✔ Low-Density Valley (Passes Through Sparse Space)' 
          : '❌ Dense Region Cut (Violates Low-Density Assumption!)',
        bx + 10,
        40
      );
    }

    // Connect neighbors if in Smoothness mode
    if (activeTab === 'assumptions' && currentAssumption === 'smoothness') {
      const radiusSq = neighborhoodRadius * neighborhoodRadius;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < sslPoints.length; i++) {
        const p1 = sslPoints[i];
        if (!p1) continue;
        for (let j = i + 1; j < sslPoints.length; j++) {
          const p2 = sslPoints[j];
          if (!p2) continue;
          const dSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
          if (dSq <= radiusSq) {
            ctx.beginPath();
            ctx.moveTo(toCanvasX(p1.x), toCanvasY(p1.y));
            ctx.lineTo(toCanvasX(p2.x), toCanvasY(p2.y));
            ctx.stroke();
          }
        }
      }
    }

    // Draw all points
    sslPoints.forEach(p => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);

      // Glow & Color
      let color = '#64748b'; // Unlabeled gray
      let shadowColor = 'transparent';
      let r = 7;

      if (p.currentLabel === 1) {
        color = '#00f0ff'; // Positive cyan
        shadowColor = '#00f0ff';
      } else if (p.currentLabel === -1) {
        color = '#ff2a85'; // Negative pink
        shadowColor = '#ff2a85';
      }

      if (p.isSeed) {
        r = 11;
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Seed crown marker
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', cx, cy);
      } else if (p.pseudoLabeled) {
        r = 8.5;
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  function render() {
    const labeledCount = sslPoints.filter(p => p.currentLabel !== 0).length;
    const seedCount = sslPoints.filter(p => p.isSeed).length;
    const pseudoCount = sslPoints.filter(p => p.pseudoLabeled).length;
    const totalCount = sslPoints.length;

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🔮 Game 5.2: Semi-Supervised Learning & Active Learning Oracle</h2>
            <p class="card-subtitle">Master the 3 Core SSL Assumptions, Self/Co-Training Wrappers, and Uncertainty Sampling (Least Confident, Margin, Entropy)</p>
          </div>
          <span class="concept-badge">Semi-Supervised & Active Learning</span>
        </div>

        <!-- Mode Sub-Tabs -->
        <div style="display:flex; gap:10px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <button id="tab-assumptions" class="btn btn-sm ${activeTab === 'assumptions' ? 'btn-primary' : 'btn-secondary'}">
            1. The 3 SSL Assumptions
          </button>
          <button id="tab-wrapper" class="btn btn-sm ${activeTab === 'wrapper' ? 'btn-primary' : 'btn-secondary'}">
            2. Wrapper Methods (Self- & Co-Training)
          </button>
          <button id="tab-active" class="btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}">
            3. Active Learning Uncertainty Game
          </button>
        </div>

        ${activeTab === 'assumptions' ? `
          <div class="controls-panel">
            <div class="control-item">
              <label>Select SSL Assumption</label>
              <div style="display:flex; gap:8px;">
                <button id="btn-asm-smooth" class="btn btn-sm ${currentAssumption === 'smoothness' ? 'btn-primary' : 'btn-secondary'}">
                  Smoothness (Transitive Propagation)
                </button>
                <button id="btn-asm-density" class="btn btn-sm ${currentAssumption === 'low_density' ? 'btn-primary' : 'btn-secondary'}">
                  Low-Density (Sparse Valley Boundary)
                </button>
                <button id="btn-asm-manifold" class="btn btn-sm ${currentAssumption === 'manifold' ? 'btn-primary' : 'btn-secondary'}">
                  Manifold (Lower-Dim Geodesic)
                </button>
              </div>
            </div>

            ${currentAssumption === 'smoothness' ? `
              <div class="control-item">
                <label>Propagation Radius: <span id="lbl-radius">${neighborhoodRadius.toFixed(1)}</span></label>
                <input type="range" id="slider-radius" min="0.8" max="2.4" step="0.2" value="${neighborhoodRadius}">
              </div>
              <div class="control-item" style="align-self:flex-end;">
                <button id="btn-smooth-diffuse" class="btn btn-primary btn-sm">Propagate Labels Transitively</button>
              </div>
            ` : ''}

            ${currentAssumption === 'low_density' ? `
              <div class="control-item">
                <label>Decision Boundary Position X: <span id="lbl-split-x">${boundarySplitX.toFixed(2)}</span></label>
                <input type="range" id="slider-split-x" min="-2.0" max="2.0" step="0.1" value="${boundarySplitX}">
              </div>
            ` : ''}

            ${currentAssumption === 'manifold' ? `
              <div class="control-item">
                <label>Distance Metric</label>
                <div style="display:flex; gap:8px;">
                  <button id="btn-mani-geo" class="btn btn-sm ${manifoldMode === 'geodesic' ? 'btn-primary' : 'btn-secondary'}">Geodesic Along Manifold (✔ Correct)</button>
                  <button id="btn-mani-euc" class="btn btn-sm ${manifoldMode === 'euclidean' ? 'btn-primary' : 'btn-secondary'}">Euclidean Shortcut (❌ Fails)</button>
                </div>
              </div>
            ` : ''}

            <div class="control-item" style="margin-left:auto; align-self:flex-end;">
              <button id="btn-reset-data" class="btn btn-secondary btn-sm">Reset Points</button>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'wrapper' ? `
          <div class="controls-panel">
            <div class="control-item">
              <label>Wrapper Method Type</label>
              <div style="display:flex; gap:8px;">
                <button id="btn-wrap-self" class="btn btn-sm ${wrapperMode === 'self_training' ? 'btn-primary' : 'btn-secondary'}">
                  Self-Training (Confidence Threshold τ)
                </button>
                <button id="btn-wrap-co" class="btn btn-sm ${wrapperMode === 'co_training' ? 'btn-primary' : 'btn-secondary'}">
                  Co-Training (Two Diverse Views V1 & V2)
                </button>
              </div>
            </div>

            <div class="control-item">
              <label>Confidence Threshold τ: <span id="lbl-thresh">${confidenceThreshold.toFixed(2)}</span></label>
              <input type="range" id="slider-thresh" min="0.65" max="0.95" step="0.05" value="${confidenceThreshold}">
            </div>

            <div class="control-item" style="align-self:flex-end;">
              <button id="btn-step-wrapper" class="btn btn-primary btn-sm">
                Run Step (Iterate Wrapper)
              </button>
            </div>

            <div class="control-item" style="margin-left:auto; align-self:flex-end;">
              <button id="btn-reset-data" class="btn btn-secondary btn-sm">Reset Dataset</button>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'active' ? `
          <div class="controls-panel">
            <div class="control-item">
              <label>Active Learning Sampling Strategy (Week 5 Slides)</label>
              <div style="display:flex; gap:8px;">
                <button id="btn-al-entropy" class="btn btn-sm ${alStrategy === 'entropy' ? 'btn-primary' : 'btn-secondary'}">
                  Entropy Sampling: -∑ p_k log₂(p_k)
                </button>
                <button id="btn-al-margin" class="btn btn-sm ${alStrategy === 'margin' ? 'btn-primary' : 'btn-secondary'}">
                  Margin Sampling: P(1) - P(2)
                </button>
                <button id="btn-al-least" class="btn btn-sm ${alStrategy === 'least_confident' ? 'btn-primary' : 'btn-secondary'}">
                  Least Confident: 1 - P(max)
                </button>
              </div>
            </div>

            <div class="control-item" style="align-self:flex-end;">
              <button id="btn-al-query-top" class="btn btn-primary btn-sm" ${queryBudget <= 0 ? 'disabled' : ''}>
                Query Oracle on Top Uncertain Sample
              </button>
            </div>

            <div class="control-item" style="margin-left:auto;">
              <div style="display:flex; gap:14px; align-items:center;">
                <div>
                  <div style="font-size:10px; color:var(--text-muted); font-weight:bold;">QUERY BUDGET</div>
                  <div style="font-size:20px; font-weight:800; font-family:'Fira Code', monospace; color:${queryBudget > 0 ? 'var(--accent-cyan)' : 'var(--accent-amber)'};">
                    ${queryBudget} / 5
                  </div>
                </div>
                <div>
                  <div style="font-size:10px; color:var(--text-muted); font-weight:bold;">MODEL ACCURACY</div>
                  <div style="font-size:20px; font-weight:800; font-family:'Fira Code', monospace; color:var(--accent-green);">
                    ${alAccuracy.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${activeTab !== 'active' ? `
          <!-- Canvas Viewport for Assumptions & Wrappers -->
          <div class="game-viewport" style="height: 400px; margin-bottom: 20px;">
            <canvas id="ssl-canvas" width="850" height="400" style="width:100%; height:100%;"></canvas>
            <div class="viewport-overlay">
              <div><strong style="color:var(--accent-cyan);">Labeled Seeds (L):</strong> ${seedCount}</div>
              <div><strong style="color:var(--accent-amber);">Pseudo-Labeled:</strong> ${pseudoCount}</div>
              <div><strong style="color:#a7f3d0;">Total Labeled:</strong> ${labeledCount} / ${totalCount}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                ${activeTab === 'assumptions' 
                  ? (currentAssumption === 'smoothness' ? 'Transitive graph diffusion propagating along manifold' : (currentAssumption === 'low_density' ? 'Density penalizes boundaries cutting through clusters' : 'Manifold distance respects geometry'))
                  : (wrapperMode === 'self_training' ? 'Self-training adds confident pseudo-labels to training set' : 'Co-training: Two diverse views cross-train each other')}
              </div>
            </div>
          </div>
        ` : `
          <!-- Active Learning Candidate Query Table & Oracle Dashboard -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <h4 style="font-size:14px; color:var(--accent-cyan);">
                Candidate Unlabeled Pool (Active Learning Budget: ${queryBudget} Left)
              </h4>
              <span style="font-size:11px; color:var(--text-muted);">Click "Query Oracle" button or row to consult the human expert</span>
            </div>

            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse: collapse; font-family: 'Fira Code', monospace; font-size: 11px;">
                <thead>
                  <tr style="color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: left;">
                    <th style="padding: 8px;">Sample</th>
                    <th style="padding: 8px;">P(C1)</th>
                    <th style="padding: 8px;">P(C2)</th>
                    <th style="padding: 8px;">P(C3)</th>
                    <th style="padding: 8px;">Least Conf (1-max)</th>
                    <th style="padding: 8px;">Margin (P₁-P₂)</th>
                    <th style="padding: 8px;">Entropy (bits)</th>
                    <th style="padding: 8px;">Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${alCandidates.map(s => {
                    const lc = calcLeastConfident(s);
                    const mg = calcMargin(s);
                    const ent = calcEntropy(s);
                    const isQueried = s.queried;

                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background:${isQueried ? 'rgba(0,255,136,0.08)' : 'transparent'};">
                        <td style="padding: 8px; font-weight:bold; color:#fff;">${s.name}</td>
                        <td style="padding: 8px; color:var(--accent-cyan);">${s.p1.toFixed(2)}</td>
                        <td style="padding: 8px; color:var(--accent-amber);">${s.p2.toFixed(2)}</td>
                        <td style="padding: 8px; color:var(--accent-pink);">${s.p3.toFixed(2)}</td>
                        <td style="padding: 8px; color:${alStrategy === 'least_confident' ? '#38bdf8' : 'inherit'}; font-weight:${alStrategy === 'least_confident' ? 'bold' : 'normal'};">
                          ${lc.toFixed(3)}
                        </td>
                        <td style="padding: 8px; color:${alStrategy === 'margin' ? '#fde047' : 'inherit'}; font-weight:${alStrategy === 'margin' ? 'bold' : 'normal'};">
                          ${mg.toFixed(3)}
                        </td>
                        <td style="padding: 8px; color:${alStrategy === 'entropy' ? '#00ff88' : 'inherit'}; font-weight:${alStrategy === 'entropy' ? 'bold' : 'normal'};">
                          ${ent.toFixed(3)}
                        </td>
                        <td style="padding: 8px;">
                          ${isQueried ? `
                            <span style="color:var(--accent-green); font-weight:bold;">✔ Labeled: Class ${s.trueClass}</span>
                          ` : `
                            <button class="btn btn-secondary btn-sm btn-query-row" data-id="${s.id}" ${queryBudget <= 0 ? 'disabled' : ''} style="padding:3px 8px; font-size:10px;">
                              Query Oracle
                            </button>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 14px;">
          <div id="ssl-feedback" style="min-height: 24px; font-size: 13px;"></div>
          <button id="btn-ssl-certify" class="btn btn-accent">Verify Semi-Supervised & Active Learning Mastery</button>
        </div>

        <!-- Academic Explainer Card based on Slides -->
        <details class="math-explainer">
        <summary>💡 📚 Week 5 Slide Synthesis: The 3 SSL Assumptions & Active Learning Uncertainty (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>1. Smoothness Assumption:</strong> If two inputs $\\mathbf{x}_1, \\mathbf{x}_2$ in high-density regions are close, their outputs $y_1, y_2$ should be close. Transitivity allows label information to propagate across a chain of neighbors!</p>
          <p><strong>2. Low-Density Assumption:</strong> The decision boundary should pass through a low-density region (sparse empty space) and avoid cutting through dense data clusters.</p>
          <p><strong>3. Manifold Assumption:</strong> High-dimensional data lies on a lower-dimensional manifold. Distances should be measured along the manifold (geodesic) rather than Euclidean shortcuts through empty space.</p>
          <div class="formula-block">
            Least Confident: x* = argmax_x (1 - P(y*|x))<br>
            Margin Sampling: x* = argmin_x (P(y₁|x) - P(y₂|x))<br>
            Entropy Sampling: x* = argmax_x [ - ∑_k P(y=k|x) log₂ P(y=k|x) ]
          </div>
        </div>
      </details>
    </div>
  `;

    // Draw canvas if available
    const canvas = container.querySelector('#ssl-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      drawCanvas(canvas);
    }

    // Attach Listeners
    container.querySelector('#tab-assumptions')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'assumptions';
      render();
    });

    container.querySelector('#tab-wrapper')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'wrapper';
      render();
    });

    container.querySelector('#tab-active')?.addEventListener('click', () => {
      sound.playClick();
      activeTab = 'active';
      render();
    });

    // Assumptions listeners
    container.querySelector('#btn-asm-smooth')?.addEventListener('click', () => {
      sound.playClick();
      currentAssumption = 'smoothness';
      render();
    });

    container.querySelector('#btn-asm-density')?.addEventListener('click', () => {
      sound.playClick();
      currentAssumption = 'low_density';
      render();
    });

    container.querySelector('#btn-asm-manifold')?.addEventListener('click', () => {
      sound.playClick();
      currentAssumption = 'manifold';
      render();
    });

    container.querySelector('#slider-radius')?.addEventListener('input', (e) => {
      neighborhoodRadius = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-radius');
      if (lbl) lbl.textContent = neighborhoodRadius.toFixed(1);
      const cv = container.querySelector('#ssl-canvas') as HTMLCanvasElement | null;
      if (cv) drawCanvas(cv);
    });

    container.querySelector('#btn-smooth-diffuse')?.addEventListener('click', () => {
      runSmoothnessDiffusion();
      const cv = container.querySelector('#ssl-canvas') as HTMLCanvasElement | null;
      if (cv) drawCanvas(cv);
    });

    container.querySelector('#slider-split-x')?.addEventListener('input', (e) => {
      boundarySplitX = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-split-x');
      if (lbl) lbl.textContent = boundarySplitX.toFixed(2);
      const cv = container.querySelector('#ssl-canvas') as HTMLCanvasElement | null;
      if (cv) drawCanvas(cv);
    });

    container.querySelector('#btn-mani-geo')?.addEventListener('click', () => {
      sound.playClick();
      manifoldMode = 'geodesic';
      render();
    });

    container.querySelector('#btn-mani-euc')?.addEventListener('click', () => {
      sound.playClick();
      manifoldMode = 'euclidean';
      render();
    });

    container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
      sound.playClick();
      sslPoints = generateMoonsData();
      wrapperIteration = 0;
      render();
    });

    // Wrapper listeners
    container.querySelector('#btn-wrap-self')?.addEventListener('click', () => {
      sound.playClick();
      wrapperMode = 'self_training';
      render();
    });

    container.querySelector('#btn-wrap-co')?.addEventListener('click', () => {
      sound.playClick();
      wrapperMode = 'co_training';
      render();
    });

    container.querySelector('#slider-thresh')?.addEventListener('input', (e) => {
      confidenceThreshold = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-thresh');
      if (lbl) lbl.textContent = confidenceThreshold.toFixed(2);
    });

    container.querySelector('#btn-step-wrapper')?.addEventListener('click', () => {
      runWrapperStep();
      const cv = container.querySelector('#ssl-canvas') as HTMLCanvasElement | null;
      if (cv) drawCanvas(cv);
      const fb = container.querySelector('#ssl-feedback');
      if (fb) {
        fb.innerHTML = `
          <span style="color:var(--accent-cyan); font-weight:bold;">
            ${wrapperMode === 'self_training' ? 'Self-Training' : 'Co-Training'} Iteration ${wrapperIteration}: 
            Models evaluated confidence threshold τ = ${confidenceThreshold.toFixed(2)}. High confidence predictions pseudo-labeled!
          </span>
        `;
      }
    });

    // Active learning listeners
    container.querySelector('#btn-al-entropy')?.addEventListener('click', () => {
      sound.playClick();
      alStrategy = 'entropy';
      render();
    });

    container.querySelector('#btn-al-margin')?.addEventListener('click', () => {
      sound.playClick();
      alStrategy = 'margin';
      render();
    });

    container.querySelector('#btn-al-least')?.addEventListener('click', () => {
      sound.playClick();
      alStrategy = 'least_confident';
      render();
    });

    function querySample(sample: ALSample) {
      if (queryBudget <= 0 || sample.queried) return;
      sound.playCorrect();
      sample.queried = true;
      queryBudget--;
      queriesUsed++;

      // Information Gain proportional to sample Shannon Entropy
      // Max entropy for 3 classes is log2(3) ≈ 1.585
      const ent = calcEntropy(sample);
      const boost = Math.max(1.0, parseFloat((ent * 5.2).toFixed(1)));
      alAccuracy = Math.min(96.5, alAccuracy + boost);
      render();

      const fb = container.querySelector('#ssl-feedback');
      if (fb) {
        const isHighGain = ent >= 1.2;
        fb.innerHTML = `
          <div style="background: ${isHighGain ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 170, 0, 0.15)'}; border: 1px solid ${isHighGain ? 'var(--accent-green)' : 'var(--accent-amber)'}; border-radius: var(--radius-md); padding: 10px 14px; margin-top: 8px;">
            <strong>${isHighGain ? '🔥 High Information Gain' : '⚠️ Low Information Gain'} (+${boost.toFixed(1)}% Acc):</strong> 
            Oracle labeled ${sample.name} as Class ${sample.trueClass} (Entropy H = ${ent.toFixed(2)}). 
            ${isHighGain ? 'Boundary uncertainty resolved!' : 'Sample was already confident; minimal knowledge gained.'}
            Model accuracy now: <strong>${alAccuracy.toFixed(1)}%</strong>.
          </div>
        `;
      }
    }

    container.querySelector('#btn-al-query-top')?.addEventListener('click', () => {
      if (queryBudget <= 0) return;
      // Find top uncertain unqueried sample according to selected strategy
      const unqueried = alCandidates.filter(s => !s.queried);
      if (unqueried.length === 0) return;

      let topSample = unqueried[0]!;
      if (alStrategy === 'entropy') {
        topSample = [...unqueried].sort((a, b) => calcEntropy(b) - calcEntropy(a))[0]!;
      } else if (alStrategy === 'margin') {
        topSample = [...unqueried].sort((a, b) => calcMargin(a) - calcMargin(b))[0]!;
      } else {
        topSample = [...unqueried].sort((a, b) => calcLeastConfident(b) - calcLeastConfident(a))[0]!;
      }

      querySample(topSample);
    });

    container.querySelectorAll('.btn-query-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id ?? '0');
        const s = alCandidates.find(c => c.id === id);
        if (s) querySample(s);
      });
    });

    // Certification button
    container.querySelector('#btn-ssl-certify')?.addEventListener('click', () => {
      const fb = container.querySelector('#ssl-feedback');
      const alQualified = queriesUsed >= 2 && alAccuracy >= 74.0;
      const sslQualified = wrapperIteration >= 1 || labeledCount >= 8;

      if (alQualified || sslQualified) {
        sound.playVictory();
        confetti({ particleCount: 80, spread: 70 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week5_ssl');

        if (fb) {
          fb.innerHTML = `
            <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px; color: #a7f3d0; margin-top: 8px;">
              <strong>🎉 Semi-Supervised & Active Learning Mastery Certified!</strong> 
              You mastered the 3 SSL Assumptions, Wrapper Methods, and Oracle Uncertainty Sampling (Least Confident, Margin, Entropy)! +150 Score awarded.
            </div>
          `;
        }
      } else {
        sound.playWrong();
        if (fb) {
          fb.innerHTML = `
            <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 12px; color: #fef08a; margin-top: 8px;">
              <strong>Keep Exploring:</strong> Query informative high-entropy samples in Active Learning to reach ≥ 74% accuracy, or run Semi-Supervised Wrapper iterations!
            </div>
          `;
        }
      }
    });
  }

  render();
}
