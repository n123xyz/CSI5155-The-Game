import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface SensorPoint {
  id: number;
  x: number;
  y: 'Normal' | 'Faulty';
}

const DATASET_Q14: SensorPoint[] = [
  { id: 1, x: 2, y: 'Normal' },
  { id: 2, x: 4, y: 'Normal' },
  { id: 3, x: 6, y: 'Faulty' },
  { id: 4, x: 8, y: 'Faulty' },
  { id: 5, x: 10, y: 'Faulty' }
];

export function renderWeek3DecisionTree(container: HTMLElement) {
  let threshold = 5.0; // t1 = 5 or t2 = 7
  let impurityMetric: 'entropy' | 'gini' = 'entropy';

  function entropy(pNormal: number, pFaulty: number): number {
    let h = 0;
    if (pNormal > 0) h -= pNormal * Math.log2(pNormal);
    if (pFaulty > 0) h -= pFaulty * Math.log2(pFaulty);
    return h;
  }

  function gini(pNormal: number, pFaulty: number): number {
    return 1 - (pNormal * pNormal + pFaulty * pFaulty);
  }

  const nTotal = DATASET_Q14.length;
  const pNormParent = 2 / 5;
  const pFaultParent = 3 / 5;
  const parentEntropy = entropy(pNormParent, pFaultParent); // 0.971 bits
  const parentGini = gini(pNormParent, pFaultParent); // 0.480

  function computeSplit(t: number) {
    const left = DATASET_Q14.filter(d => d.x <= t);
    const right = DATASET_Q14.filter(d => d.x > t);

    const leftNorm = left.filter(d => d.y === 'Normal').length;
    const leftFault = left.filter(d => d.y === 'Faulty').length;
    const rightNorm = right.filter(d => d.y === 'Normal').length;
    const rightFault = right.filter(d => d.y === 'Faulty').length;

    const pLeftNorm = left.length ? leftNorm / left.length : 0;
    const pLeftFault = left.length ? leftFault / left.length : 0;
    const pRightNorm = right.length ? rightNorm / right.length : 0;
    const pRightFault = right.length ? rightFault / right.length : 0;

    const leftH = entropy(pLeftNorm, pLeftFault);
    const rightH = entropy(pRightNorm, pRightFault);
    const splitH = (left.length / nTotal) * leftH + (right.length / nTotal) * rightH;
    const infoGain = parentEntropy - splitH;

    const leftG = gini(pLeftNorm, pLeftFault);
    const rightG = gini(pRightNorm, pRightFault);
    const splitG = (left.length / nTotal) * leftG + (right.length / nTotal) * rightG;
    const giniGain = parentGini - splitG;

    return {
      left, right,
      leftNorm, leftFault, rightNorm, rightFault,
      leftH, rightH, splitH, infoGain,
      leftG, rightG, splitG, giniGain
    };
  }

  function render() {
    const s = computeSplit(threshold);

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🌳 Game 3.1: Entropy & Gini Guillotine (Decision Tree Slicer)</h2>
            <p class="card-subtitle">Visual Intuition: Dynamic Entropy Beakers & Guillotine Threshold Knife (Midterm Q14)</p>
          </div>
          <span class="concept-badge">Midterm Question 14 Focus</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Candidate Split Threshold t (Midterm Q14)</label>
            <div style="display:flex; gap: 8px;">
              <button id="btn-t-5" class="btn btn-sm ${threshold === 5 ? 'btn-primary' : 'btn-secondary'}">t₁ = 5 (Candidate 1 - Pure Split)</button>
              <button id="btn-t-7" class="btn btn-sm ${threshold === 7 ? 'btn-primary' : 'btn-secondary'}">t₂ = 7 (Candidate 2 - Impure Split)</button>
            </div>
          </div>

          <div class="control-item">
            <label>Threshold Knife Slider: <span id="thresh-label">${threshold.toFixed(1)}</span></label>
            <input type="range" id="tree-t-slider" min="1" max="11" step="1" value="${threshold}">
          </div>

          <div class="control-item">
            <label>Impurity Metric</label>
            <select id="metric-select">
              <option value="entropy" ${impurityMetric === 'entropy' ? 'selected' : ''}>Shannon Entropy (Bits) [Midterm Q14]</option>
              <option value="gini" ${impurityMetric === 'gini' ? 'selected' : ''}>Gini Impurity (CART Index)</option>
            </select>
          </div>
        </div>

        <!-- 1. Interactive Guillotine Slice Canvas -->
        <div class="game-viewport" style="height: 200px; margin-bottom: 20px;">
          <canvas id="tree-canvas" width="800" height="200" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong style="color:var(--accent-cyan);">Parent Node:</strong> H = ${parentEntropy.toFixed(3)} bits (2 Normal, 3 Faulty)</div>
            <div><strong style="color:var(--accent-green);">Split t = ${threshold}:</strong> Weighted Residual Impurity = ${s.splitH.toFixed(3)} bits</div>
            <div style="font-size:14px; margin-top:2px;"><strong style="color:var(--accent-amber);">Information Gain (IG):</strong> <span style="font-size:16px; font-weight:bold; color:#fef08a;">${s.infoGain.toFixed(3)} bits</span></div>
          </div>
        </div>

        <!-- 2. Visual Decision Tree Node Architecture with Animated Beakers -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;">
          <h4 style="text-align: center; color: var(--accent-cyan); font-size: 14px; margin-bottom: 16px;">Decision Tree Node Partition Diagram</h4>
          
          <!-- Parent Root Node -->
          <div style="display:flex; justify-content:center; margin-bottom: 12px;">
            <div style="background: rgba(20, 30, 50, 0.9); border: 2px solid var(--accent-cyan); border-radius: 12px; padding: 12px 24px; text-align: center; min-width: 260px;">
              <strong style="color: #fff; font-size: 14px;">Root: Is Sensor Reading X ≤ ${threshold}?</strong>
              <div style="font-family:'Fira Code'; font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                All 5 Sensors (2 Norm, 3 Faulty) • H = ${parentEntropy.toFixed(3)}
              </div>
            </div>
          </div>

          <!-- Tree Branches -->
          <div style="display: flex; justify-content: space-around; position: relative;">
            <!-- Left Branch (Yes) -->
            <div style="flex: 1; display:flex; flex-direction:column; align-items:center;">
              <div style="font-family:'Fira Code'; font-size:12px; color:var(--accent-green); margin-bottom:6px;">YES (X ≤ ${threshold})</div>
              <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid ${s.leftH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'}; border-radius: 12px; padding: 14px; width: 85%; text-align: center;">
                <div style="font-size: 13px; font-weight: bold; color: #fff;">Left Partition (${s.left.length} points)</div>
                <div style="font-family:'Fira Code'; font-size: 11px; margin: 6px 0;">
                  <span style="color:#38bdf8;">${s.leftNorm} Normal</span>, <span style="color:#f87171;">${s.leftFault} Faulty</span>
                </div>
                <!-- Entropy Purity Gauge -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 6px 10px; margin-top: 6px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Node Entropy:</span>
                  <strong style="color:${s.leftH === 0 ? 'var(--accent-green)' : '#f59e0b'}; font-family:'Fira Code'; font-size:13px;">
                    ${s.leftH.toFixed(3)} bits ${s.leftH === 0 ? ' (100% PURE!)' : ''}
                  </strong>
                </div>
              </div>
            </div>

            <!-- Right Branch (No) -->
            <div style="flex: 1; display:flex; flex-direction:column; align-items:center;">
              <div style="font-family:'Fira Code'; font-size:12px; color:var(--accent-red); margin-bottom:6px;">NO (X > ${threshold})</div>
              <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid ${s.rightH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'}; border-radius: 12px; padding: 14px; width: 85%; text-align: center;">
                <div style="font-size: 13px; font-weight: bold; color: #fff;">Right Partition (${s.right.length} points)</div>
                <div style="font-family:'Fira Code'; font-size: 11px; margin: 6px 0;">
                  <span style="color:#38bdf8;">${s.rightNorm} Normal</span>, <span style="color:#f87171;">${s.rightFault} Faulty</span>
                </div>
                <!-- Entropy Purity Gauge -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 6px 10px; margin-top: 6px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Node Entropy:</span>
                  <strong style="color:${s.rightH === 0 ? 'var(--accent-green)' : '#f59e0b'}; font-family:'Fira Code'; font-size:13px;">
                    ${s.rightH.toFixed(3)} bits ${s.rightH === 0 ? ' (100% PURE!)' : ''}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 13px; color: var(--text-secondary);">
            Compare the two exam candidates: <strong>t₁ = 5</strong> vs <strong>t₂ = 7</strong>
          </div>
          <button id="btn-compare-candidates" class="btn btn-primary">
            Lock In Midterm Answer (t₁ = 5)
          </button>
        </div>

        <div id="tree-solution-box" style="min-height: 20px;"></div>

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>(a) Parent Entropy:</strong> H(Y) = - [ (2/5) log₂(2/5) + (3/5) log₂(3/5) ] = -(0.4 × (-1.3219) + 0.6 × (-0.7370)) = <strong>0.971 bits</strong>.</p>
            <p><strong>(b) Threshold t₁ = 5:</strong> Left partition has only Normal sensors (H_left = 0), Right partition has only Faulty sensors (H_right = 0). Weighted entropy is 0. <strong>Information Gain: 0.971 - 0 = 0.971 bits.</strong></p>
            <p><strong>Threshold t₂ = 7:</strong> Left partition has 2 Normal and 1 Faulty (H_left = 0.918), Right partition has 2 Faulty (H_right = 0). Weighted entropy is 0.551. <strong>Information Gain: 0.971 - 0.551 = 0.420 bits.</strong></p>
            <p><strong>(c) Decision:</strong> Choose <strong>t₁ = 5</strong> because it maximizes information gain (0.971 > 0.420) and achieves zero impurity!</p>
          </div>
        </details>
    </div>
  `;

    // Draw sensor points and knife line
    const canvas = container.querySelector('#tree-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const maxX = 12;
      const padX = 60;
      const w = canvas.width - padX * 2;
      const cy = canvas.height / 2;

      const toScreenX = (val: number) => padX + (val / maxX) * w;

      // Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX, cy);
      ctx.lineTo(padX + w, cy);
      ctx.stroke();

      for (let tx = 0; tx <= 12; tx += 2) {
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '11px Fira Code';
        ctx.fillText(tx.toString(), toScreenX(tx) - 4, cy + 30);
      }

      // Draw Points
      DATASET_Q14.forEach(pt => {
        const sx = toScreenX(pt.x);
        ctx.fillStyle = pt.y === 'Normal' ? '#00f0ff' : '#ff3366';
        ctx.beginPath();
        ctx.arc(sx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Fira Code';
        ctx.fillText(`ID${pt.id}`, sx - 10, cy - 20);
        ctx.fillText(pt.y === 'Normal' ? 'NORM' : 'FLT', sx - 13, cy + 4);
      });

      // Split Knife Line
      const knifeX = toScreenX(threshold);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(knifeX, 15);
      ctx.lineTo(knifeX, canvas.height - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px Fira Code';
      ctx.fillText(`Split Knife t = ${threshold}`, knifeX + 8, 35);
    }

    container.querySelector('#btn-t-5')?.addEventListener('click', () => {
      sound.playSlice();
      threshold = 5.0;
      render();
    });

    container.querySelector('#btn-t-7')?.addEventListener('click', () => {
      sound.playSlice();
      threshold = 7.0;
      render();
    });

    container.querySelector('#tree-t-slider')?.addEventListener('input', (e) => {
      threshold = parseFloat((e.target as HTMLInputElement).value);
      render();
    });

    container.querySelector('#metric-select')?.addEventListener('change', (e) => {
      impurityMetric = (e.target as HTMLSelectElement).value as any;
      sound.playClick();
      render();
    });

    container.querySelector('#btn-compare-candidates')?.addEventListener('click', () => {
      sound.playVictory();
      confetti({ particleCount: 75, spread: 70 });
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week3_tree');

      const solBox = container.querySelector('#tree-solution-box') as HTMLElement;
      if (solBox) {
        solBox.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 18px; color: #a7f3d0; margin-bottom: 16px;">
            <h3 style="font-size: 16px; margin-bottom: 8px;">🏆 Official Midterm Conclusion Confirmed!</h3>
            <p style="margin-bottom: 6px;">Threshold <strong>t₁ = 5</strong> achieves <strong>IG = 0.971 bits</strong> (weighted entropy = 0.000 bits).</p>
            <p style="margin-bottom: 6px;">Threshold <strong>t₂ = 7</strong> achieves <strong>IG = 0.420 bits</strong> (weighted entropy = 0.551 bits).</p>
            <p><strong>Conclusion:</strong> The decision tree selects <strong>t₁ = 5</strong> because it maximizes information gain and cleanly isolates the faulty sensors!</p>
          </div>
        `;
      }
    });
  }

  render();
}
