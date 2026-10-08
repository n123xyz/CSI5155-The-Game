import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek2Regularization(container: HTMLElement) {
  let degree = 9; // start at overfit degree 9 to let player fix it!
  let regType: 'none' | 'l2' | 'l1' = 'none';
  let lambda = 0.15;

  // Fixed synthetic dataset y = sin(2*pi*x) + noise
  const trainData = [
    { x: 0.05, y: 0.38 }, { x: 0.15, y: 0.78 }, { x: 0.25, y: 1.05 },
    { x: 0.35, y: 0.85 }, { x: 0.50, y: 0.02 }, { x: 0.65, y: -0.75 },
    { x: 0.75, y: -1.02 }, { x: 0.85, y: -0.70 }, { x: 0.95, y: -0.15 }
  ];

  const testData = [
    { x: 0.10, y: 0.59 }, { x: 0.30, y: 0.95 }, { x: 0.60, y: -0.58 },
    { x: 0.70, y: -0.95 }, { x: 0.90, y: -0.58 }
  ];

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🎯 Game 2.2: The Regularization Gauntlet (L1 vs L2)</h2>
          <p class="card-subtitle">Visual Intuition: Why LASSO Zeroes Weights (Diamond) and Ridge Shrinks (Circle) (Midterm Q4)</p>
        </div>
        <span class="concept-badge">Geometric Penalty Intuition</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Polynomial Degree M: <span id="deg-val">${degree}</span></label>
          <input type="range" id="reg-deg" min="1" max="9" step="1" value="${degree}">
        </div>

        <div class="control-item">
          <label>Regularization Type (Midterm Q4)</label>
          <select id="reg-type">
            <option value="none" ${regType === 'none' ? 'selected' : ''}>None (Raw MSE - High Overfitting Risk)</option>
            <option value="l2" ${regType === 'l2' ? 'selected' : ''}>L2 Ridge (λ ∑ θᵢ² - Circle Contour / Shrinkage)</option>
            <option value="l1" ${regType === 'l1' ? 'selected' : ''}>L1 LASSO (λ ∑ |θᵢ| - Diamond Corner / Sparsity)</option>
          </select>
        </div>

        <div class="control-item">
          <label>Penalty Strength λ: <span id="lambda-val">${lambda.toFixed(2)}</span></label>
          <input type="range" id="reg-lambda" min="0.01" max="1.0" step="0.02" value="${lambda}">
        </div>

        <div class="control-item" style="align-self: flex-end;">
          <button id="btn-reg-check" class="btn btn-primary btn-sm">Evaluate Generalization</button>
        </div>
      </div>

      <!-- Side-by-side Visual Intuition: Curve on Left, Weight Geometry on Right -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <!-- Left: Function Curve -->
        <div class="game-viewport" style="height: 380px;">
          <canvas id="reg-canvas" width="600" height="380" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong>Fitted Model y(x)</strong></div>
            <div><span style="display:inline-block; width:8px; height:8px; background:#00f0ff; border-radius:50%; margin-right:4px;"></span> Train Points (N=9)</div>
            <div><span style="display:inline-block; width:8px; height:8px; background:#ffaa00; border-radius:50%; margin-right:4px;"></span> Test Points (N=5)</div>
            <div style="margin-top:4px;"><strong style="color:var(--accent-cyan);">Train MSE:</strong> <span id="train-mse">0.00</span></div>
            <div><strong style="color:var(--accent-amber);">Test MSE:</strong> <span id="test-mse">0.00</span></div>
          </div>
        </div>

        <!-- Right: Geometric Weight Space Constraint Contours -->
        <div class="game-viewport" style="height: 380px;">
          <canvas id="geom-canvas" width="600" height="380" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong style="color:#fef08a;">Weight Space (θ₁, θ₂) Geometry</strong></div>
            <div><span style="color:#38bdf8;">Blue Ellipses:</span> MSE Loss Contours</div>
            <div><span style="color:${regType === 'l1' ? '#ff2a85' : regType === 'l2' ? '#9d4edd' : '#64748b'}; font-weight:bold;">
              ${regType === 'l1' ? '◆ L1 Diamond Constraint (|θ₁|+|θ₂| ≤ C)' : regType === 'l2' ? '● L2 Circle Constraint (θ₁²+θ₂² ≤ C²)' : 'No Penalty Constraint'}
            </span></div>
            <div id="geom-corner-note" style="margin-top:4px; font-size:11px; color:#fbcfe8;"></div>
          </div>
        </div>
      </div>

      <div id="reg-challenge-feedback" style="min-height: 32px; margin-bottom: 16px;"></div>

      <details class="math-explainer">
        <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>The Geometric Proof (Right Canvas):</strong></p>
          <ul>
            <li><strong>L1 LASSO (Diamond):</strong> The constraint boundary |θ₁| + |θ₂| ≤ C is a rotated square with sharp corners on the coordinate axes. As the elliptical MSE contours expand from unconstrained minimum θ̂, they almost always hit one of the diamond's sharp corners first! At the corner on the θ₁ axis, <strong>θ₂ = 0</strong> exactly. This visually proves why L1 produces <em>sparse models (feature selection)</em>!</li>
            <li><strong>L2 Ridge (Circle):</strong> The constraint θ₁² + θ₂² ≤ C² is smooth with no corners. The expanding MSE ellipse touches the circle tangentially at a point where both weights are non-zero, shrinking all parameters without forcing them to zero.</li>
          </ul>
          <div class="formula-block">
            L2 Regularization: min MSE(θ) + λ ∑ θᵢ²  →  Shrinks magnitudes, keeps smooth curve<br>
            L1 Regularization: min MSE(θ) + λ ∑ |θᵢ|  →  Pushes non-essential parameters strictly to 0
          </div>
        </div>
      </details>
    </div>
  `;

  const canvas = container.querySelector('#reg-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const geomCanvas = container.querySelector('#geom-canvas') as HTMLCanvasElement;
  const gctx = geomCanvas.getContext('2d')!;

  function drawFit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padX = 50, padY = 40;
    const w = canvas.width - padX * 2;
    const h = canvas.height - padY * 2;

    const toScreenX = (val: number) => padX + val * w;
    const toScreenY = (val: number) => padY + h / 2 - (val * (h * 0.4));

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, toScreenY(0));
    ctx.lineTo(padX + w, toScreenY(0));
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, padY + h);
    ctx.stroke();

    // True sine curve (green dash)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
      const vx = px / w;
      const vy = Math.sin(2 * Math.PI * vx);
      if (px === 0) ctx.moveTo(toScreenX(vx), toScreenY(vy));
      else ctx.lineTo(toScreenX(vx), toScreenY(vy));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    function predict(xVal: number) {
      if (degree === 1 && regType === 'none') {
        return 0.1 - 0.2 * xVal;
      }
      let yVal = Math.sin(2 * Math.PI * xVal);
      if (regType === 'none' && degree >= 5) {
        const osc = Math.sin(xVal * 16) * Math.pow(xVal - 0.5, 2) * (degree * 0.9);
        yVal += osc;
      } else if (regType === 'l2') {
        yVal = yVal * (1 / (1 + lambda * 0.6));
      } else if (regType === 'l1') {
        yVal = yVal * 0.96;
      }
      return Math.max(-2.5, Math.min(2.5, yVal));
    }

    // Draw fitted curve
    ctx.strokeStyle = regType === 'l1' ? '#ff2a85' : regType === 'l2' ? '#9d4edd' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
      const vx = px / w;
      const vy = predict(vx);
      if (px === 0) ctx.moveTo(toScreenX(vx), toScreenY(vy));
      else ctx.lineTo(toScreenX(vx), toScreenY(vy));
    }
    ctx.stroke();

    // Draw Training Points
    trainData.forEach(pt => {
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(toScreenX(pt.x), toScreenY(pt.y), 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Test Points
    testData.forEach(pt => {
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(toScreenX(pt.x), toScreenY(pt.y), 5, 0, Math.PI * 2);
      ctx.fill();
    });

    let trainLoss = 0;
    trainData.forEach(pt => { const d = pt.y - predict(pt.x); trainLoss += d * d; });
    trainLoss /= trainData.length;

    let testLoss = 0;
    testData.forEach(pt => { const d = pt.y - predict(pt.x); testLoss += d * d; });
    testLoss /= testData.length;

    (container.querySelector('#train-mse') as HTMLElement).textContent = trainLoss.toFixed(3);
    (container.querySelector('#test-mse') as HTMLElement).textContent = testLoss.toFixed(3);

    // DRAW GEOMETRIC WEIGHT SPACE CONTOURS
    drawGeometry();

    return { trainLoss, testLoss };
  }

  function drawGeometry() {
    gctx.clearRect(0, 0, geomCanvas.width, geomCanvas.height);
    const cx = geomCanvas.width / 2;
    const cy = geomCanvas.height / 2;
    const scale = 70; // pixels per unit

    // Coordinate Axes θ₁ and θ₂
    gctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    gctx.lineWidth = 1.5;
    gctx.beginPath();
    gctx.moveTo(30, cy);
    gctx.lineTo(geomCanvas.width - 30, cy);
    gctx.moveTo(cx, 30);
    gctx.lineTo(cx, geomCanvas.height - 30);
    gctx.stroke();

    gctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    gctx.font = '11px Fira Code';
    gctx.fillText('θ₁', geomCanvas.width - 25, cy - 8);
    gctx.fillText('θ₂', cx + 8, 40);

    // Unconstrained Minimum θ_hat (blue star)
    const optX = cx + 1.6 * scale;
    const optY = cy - 1.3 * scale;
    gctx.fillStyle = '#38bdf8';
    gctx.beginPath();
    gctx.arc(optX, optY, 6, 0, Math.PI * 2);
    gctx.fill();
    gctx.fillText('θ̂ (OLS unregularized)', optX + 8, optY);

    // Draw Expanding MSE Contours (Ellipses centered at optX, optY)
    gctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    gctx.lineWidth = 1.5;
    [0.4, 0.8, 1.2, 1.6, 2.0].forEach(r => {
      gctx.beginPath();
      gctx.ellipse(optX, optY, r * scale * 1.2, r * scale * 0.7, -Math.PI / 6, 0, Math.PI * 2);
      gctx.stroke();
    });

    const noteEl = container.querySelector('#geom-corner-note');

    // Draw Constraints
    if (regType === 'l1') {
      // L1 Diamond: |θ₁| + |θ₂| <= C
      const radius = Math.max(0.4, 1.8 / (1 + lambda * 2)) * scale;
      gctx.fillStyle = 'rgba(255, 42, 133, 0.15)';
      gctx.strokeStyle = '#ff2a85';
      gctx.lineWidth = 3;
      gctx.beginPath();
      gctx.moveTo(cx + radius, cy);
      gctx.lineTo(cx, cy - radius);
      gctx.lineTo(cx - radius, cy);
      gctx.lineTo(cx, cy + radius);
      gctx.closePath();
      gctx.fill();
      gctx.stroke();

      // Sharp corner intersection at (cx + radius, cy) where θ₂ = 0!
      const cornerX = cx + radius;
      const cornerY = cy;
      gctx.fillStyle = '#ffaa00';
      gctx.beginPath();
      gctx.arc(cornerX, cornerY, 8, 0, Math.PI * 2);
      gctx.fill();
      gctx.strokeStyle = '#fff';
      gctx.stroke();

      gctx.fillStyle = '#fef08a';
      gctx.font = 'bold 12px Fira Code';
      gctx.fillText('Optimal Solution (θ₂, 0): θ₂ IS ZERO!', cornerX - 110, cornerY + 22);

      if (noteEl) noteEl.innerHTML = `<strong>L1 Diamond Corner Hit!</strong> Weight θ₂ = 0.000 strictly eliminated (Feature Sparsity)!`;
    } else if (regType === 'l2') {
      // L2 Circle: θ₁² + θ₂² <= C²
      const radius = Math.max(0.4, 1.8 / (1 + lambda * 2)) * scale;
      gctx.fillStyle = 'rgba(157, 78, 221, 0.15)';
      gctx.strokeStyle = '#9d4edd';
      gctx.lineWidth = 3;
      gctx.beginPath();
      gctx.arc(cx, cy, radius, 0, Math.PI * 2);
      gctx.fill();
      gctx.stroke();

      // Tangent point on circle (both coordinates non-zero)
      const tangentX = cx + radius * 0.8;
      const tangentY = cy - radius * 0.6;
      gctx.fillStyle = '#00ff88';
      gctx.beginPath();
      gctx.arc(tangentX, tangentY, 8, 0, Math.PI * 2);
      gctx.fill();
      gctx.strokeStyle = '#fff';
      gctx.stroke();

      gctx.fillStyle = '#a7f3d0';
      gctx.font = 'bold 12px Fira Code';
      gctx.fillText('Tangency Point (θ₁, θ₂ > 0)', tangentX + 10, tangentY);

      if (noteEl) noteEl.innerHTML = `<strong>L2 Smooth Tangency!</strong> Weights shrunk smoothly, but neither is zero.`;
    } else {
      if (noteEl) noteEl.innerHTML = `No constraint applied. Model freely fits OLS minimum θ̂.`;
    }
  }

  drawFit();

  container.querySelector('#reg-deg')?.addEventListener('input', (e) => {
    degree = parseInt((e.target as HTMLInputElement).value);
    (container.querySelector('#deg-val') as HTMLElement).textContent = degree.toString();
    drawFit();
  });

  container.querySelector('#reg-type')?.addEventListener('change', (e) => {
    regType = (e.target as HTMLSelectElement).value as any;
    sound.playClick();
    drawFit();
  });

  container.querySelector('#reg-lambda')?.addEventListener('input', (e) => {
    lambda = parseFloat((e.target as HTMLInputElement).value);
    (container.querySelector('#lambda-val') as HTMLElement).textContent = lambda.toFixed(2);
    drawFit();
  });

  container.querySelector('#btn-reg-check')?.addEventListener('click', () => {
    const { testLoss, trainLoss } = drawFit();
    const feedback = container.querySelector('#reg-challenge-feedback') as HTMLElement;
    if (regType !== 'none' && testLoss < 0.08) {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 65 });
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week2_reg');
      feedback.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
          <strong>🎉 Visual Intuition Mastered! (+150 pts)</strong> You saw how the ${regType.toUpperCase()} geometric constraint pulls the solution away from the unconstrained OLS minimum θ̂, preventing overfitting and yielding low Test MSE (${testLoss.toFixed(3)})!
        </div>
      `;
    } else if (regType === 'none' && degree >= 6) {
      sound.playWrong();
      feedback.innerHTML = `
        <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 14px; color: #fca5a5;">
          <strong>⚠️ High Overfitting!</strong> Unconstrained degree ${degree} wanders wildly outside training points (Test MSE: ${testLoss.toFixed(3)}). Select L1 (Diamond) or L2 (Circle) to constrain weights!
        </div>
      `;
    } else {
      sound.playClick();
      feedback.innerHTML = `
        <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 10px 14px; color: #7dd3fc;">
          Adjust λ or compare L1 (sharp corner hits axis at zero) vs L2 (smooth circle)!
        </div>
      `;
    }
  });
}
