import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek3MinkowskiMetricSpace(container: HTMLElement) {
  let activeStep = 1;
  let pOrder = 2.0; // 1.0 (Manhattan), 2.0 (Euclidean), 0.5 (concave), 4.0 (approaching Chebyshev)

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>📐 Game 3.2: Minkowski Metric Spaces & Axiom Geometry</h2>
            <p class="card-subtitle">Visual Intuition: Unit ball geometry across Lp norms, Cosine Distance, and Metric Axioms</p>
          </div>
          <span class="concept-badge">Week 3 Distance Metrics</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Lp Unit Ball</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Metric Axioms</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Cosine vs Euclidean</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: Unit Ball Morpher -->
          <div style="animation: fadeIn 0.3s ease;">
            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item" style="flex: 1;">
                <label>Minkowski Order \(p\): <span id="p-val" style="color: var(--accent-cyan); font-weight: bold;">${pOrder.toFixed(1)}</span></label>
                <input type="range" id="p-slider" min="0.5" max="6.0" step="0.5" value="${pOrder}" style="width: 100%;">
              </div>
              <div class="control-item">
                <label>Presets:</label>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-sm btn-secondary p-preset" data-p="1.0">p = 1 (Manhattan)</button>
                  <button class="btn btn-sm btn-secondary p-preset" data-p="2.0">p = 2 (Euclidean)</button>
                  <button class="btn btn-sm btn-secondary p-preset" data-p="0.5">p = 0.5 (Non-Convex)</button>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-bottom: 16px;">
              <div class="game-viewport" style="height: 300px;">
                <canvas id="minkowski-canvas" width="600" height="300" style="width: 100%; height: 100%;"></canvas>
                <div class="viewport-overlay">
                  Unit Circle Contour: \(\{|x_1|^p + |x_2|^p\}^{1/p} = 1\)
                </div>
              </div>

              <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 13px; text-transform: uppercase; color: var(--accent-amber); margin-bottom: 8px;">
                    ${pOrder === 1.0 ? '💎 L1 Manhattan (Taxicab)' : pOrder === 2.0 ? '⭕ L2 Euclidean (Standard Circle)' : pOrder < 1.0 ? '⭐ Non-Convex (Violates Triangle Ineq)' : '⏹️ Approaching L∞ (Chebyshev Box)'}
                  </h4>
                  <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                    ${pOrder === 1.0 ? 'City-block grid distance. The unit ball forms a diamond with sharp vertices along coordinate axes.' : pOrder === 2.0 ? 'Standard straight-line Pythagorean distance. The unit ball is isotropic and rotationally invariant.' : pOrder < 1.0 ? 'Curves inward into a star-shape. Triangle inequality fails; not a valid mathematical metric!' : 'Rounds out towards a square. As p → ∞, distance is governed purely by the single maximum coordinate difference!'}
                  </p>
                </div>

                <div class="formula-block" style="font-size: 11px;">
                  Dis_p(x, y) = ( ∑ |x_j - y_j|^p )^{1/p}
                </div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: Formal Metric Axioms -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🏛️ The 3 Formal Metric Axioms (Week 3)</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              For any valid distance metric function \(Dis(x, y)\) on a metric space:
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">1. Indiscernibles</div>
                <div class="formula-block" style="font-size: 11px;">Dis(x, x) = 0<br>x ≠ y ⇒ Dis(x, y) > 0</div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px;">Distance is zero if and only if points are identical.</div>
              </div>

              <div style="background: rgba(157, 78, 221, 0.05); border: 1px solid rgba(157, 78, 221, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: #c084fc; margin-bottom: 4px;">2. Symmetry</div>
                <div class="formula-block" style="font-size: 11px;">Dis(x, y) = Dis(y, x)</div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px;">Distance from A to B equals distance from B to A.</div>
              </div>

              <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-green); margin-bottom: 4px;">3. Triangle Inequality</div>
                <div class="formula-block" style="font-size: 11px;">Dis(x, z) ≤ Dis(x, y) + Dis(y, z)</div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px;">Direct path is always shorter than or equal to a detour.</div>
              </div>
            </div>

            <div style="background: rgba(255, 170, 0, 0.08); border-left: 3px solid var(--accent-amber); padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #fde047;">
              💡 <strong>Pseudo-Metric:</strong> Relaxes strict positivity, permitting \(Dis(x, y) = 0\) for distinct points \(x \neq y\).
            </div>
          </div>
        ` : `
          <!-- Step 3: Cosine Similarity vs Cosine Distance Check -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">📐 High-Dimensional Text: Cosine vs Euclidean</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              Why is <strong>Cosine Distance</strong> (\(1 - \cos\theta\)) preferred over Euclidean distance when comparing text embeddings of documents with very different lengths?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-mink" data-val="correct">
                <strong>Length Invariance:</strong> Cosine distance measures vector angular orientation \(\theta\) regardless of magnitude/word-count, whereas Euclidean distance is inflated purely by document length differences!
              </button>
              <button class="quiz-option-btn q-opt-mink" data-val="wrong">
                Because Euclidean distance cannot be calculated in spaces with more than 3 dimensions.
              </button>
            </div>
            <div id="mink-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Minkowski Norms and Voronoi Partitions:</strong></p>
            <ul>
              <li>\(p = 2\): Standard \(L_2\) Euclidean norm: \(\sqrt{\sum (x_i - y_i)^2}\)</li>
              <li>\(p = 1\): \(L_1\) Manhattan norm: \(\sum |x_i - y_i|\)</li>
              <li>\(p = 0\): Hamming distance: counts number of coordinate mismatches \(\sum \mathbb{I}[x_i \neq y_i]\)</li>
              <li><strong>Cosine Similarity:</strong> \(\frac{A \cdot B}{\|A\|\|B\|} = \cos(\theta)\)</li>
            </ul>
          </div>
        </details>
      </div>
    `;

    // Draw canvas if in step 1
    if (activeStep === 1) {
      const canvas = container.querySelector('#minkowski-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const scale = 100;

        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();

        // Draw Lp unit ball contour: |x|^p + |y|^p = 1
        ctx.strokeStyle = '#00f0ff';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const steps = 360;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          // In polar coordinates for Lp norm: r = ( |cos|^p + |sin|^p )^(-1/p)
          const denom = Math.pow(Math.pow(Math.abs(cosT), pOrder) + Math.pow(Math.abs(sinT), pOrder), 1 / pOrder);
          const r = 1 / denom;

          const px = cx + r * cosT * scale;
          const py = cy - r * sinT * scale;

          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label points (1,0), (0,1), (-1,0), (0,-1)
        ctx.fillStyle = '#fff';
        ctx.font = '10px Fira Code';
        ctx.fillText('(1, 0)', cx + scale + 5, cy + 12);
        ctx.fillText('(0, 1)', cx - 18, cy - scale - 8);
      }
    }

    // Attach listeners
    container.querySelectorAll('.p-preset').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        pOrder = parseFloat((b as HTMLElement).dataset.p || '2.0');
        render();
      });
    });

    const pSlider = container.querySelector('#p-slider') as HTMLInputElement;
    pSlider?.addEventListener('input', (e) => {
      pOrder = parseFloat((e.target as HTMLInputElement).value);
      render();
    });

    container.querySelectorAll('.step-dot').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        activeStep = parseInt((b as HTMLElement).dataset.step || '1');
        render();
      });
    });

    container.querySelector('#btn-step-prev')?.addEventListener('click', () => {
      if (activeStep > 1) { sound.playClick(); activeStep--; render(); }
    });

    container.querySelector('#btn-step-next')?.addEventListener('click', () => {
      if (activeStep < 3) { sound.playClick(); activeStep++; render(); }
    });

    container.querySelectorAll('.q-opt-mink').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#mink-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week3_minkowski');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! Cosine distance measures direction θ and is invariant to document length!</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. Euclidean distance is sensitive to document length; Cosine isolates angular alignment.</div>';
        }
      });
    });
  }

  render();
}
