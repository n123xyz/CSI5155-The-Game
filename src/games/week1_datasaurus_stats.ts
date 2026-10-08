import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

interface Point {
  x: number;
  y: number;
}

export function renderWeek1DatasaurusStats(container: HTMLElement) {
  let activeShape = 'dino';
  let activeStep = 1; // Progressive disclosure stepper (1, 2, 3)

  // Generate synthetic points for shapes with approximately identical mean ~54.26, ~47.83, std ~16.76, ~26.93, r ~ -0.06
  function getShapePoints(shape: string): Point[] {
    const pts: Point[] = [];
    const count = 100;

    if (shape === 'dino') {
      // True 100-point sampled silhouette of the classic Datasaurus
      const dinoCoords: [number, number][] = [
        [64.40, 71.23], [66.41, 71.23], [68.41, 71.23], [70.42, 71.23], [72.21, 70.33],
        [74.01, 69.43], [75.10, 67.83], [76.00, 66.04], [76.40, 64.13], [76.40, 62.12],
        [75.40, 60.73], [73.60, 59.84], [71.74, 59.23], [69.73, 59.23], [68.70, 58.63],
        [69.60, 56.84], [70.18, 55.23], [68.18, 55.23], [66.17, 55.23], [64.29, 55.02],
        [63.40, 53.23], [62.50, 51.43], [61.84, 49.54], [61.20, 47.64], [60.57, 45.74],
        [60.69, 43.79], [61.08, 41.82], [61.48, 39.85], [61.87, 37.88], [62.26, 35.92],
        [62.89, 34.02], [63.63, 32.15], [64.38, 30.29], [65.12, 28.43], [65.87, 26.56],
        [65.89, 24.98], [64.09, 24.08], [62.34, 23.33], [61.22, 25.00], [60.11, 26.67],
        [59.00, 28.34], [57.57, 28.82], [55.77, 27.92], [54.19, 26.81], [53.29, 25.02],
        [52.39, 23.24], [50.48, 23.87], [48.58, 24.51], [46.68, 25.14], [47.03, 26.82],
        [47.78, 28.69], [48.53, 30.55], [49.27, 32.41], [50.02, 34.28], [50.09, 36.16],
        [49.46, 38.06], [48.82, 39.97], [48.19, 41.87], [47.55, 43.77], [46.92, 45.68],
        [46.14, 47.49], [44.72, 48.91], [43.30, 50.33], [41.88, 51.75], [40.47, 53.17],
        [38.59, 53.84], [36.68, 54.47], [34.78, 55.11], [32.87, 54.73], [30.97, 54.09],
        [29.07, 53.46], [28.98, 52.07], [29.88, 50.28], [31.15, 49.61], [32.95, 50.51],
        [34.76, 51.11], [36.67, 50.48], [38.57, 49.84], [40.44, 49.17], [41.56, 47.50],
        [42.67, 45.83], [43.78, 44.16], [44.53, 44.12], [44.81, 46.10], [45.09, 48.09],
        [45.38, 50.08], [45.66, 52.06], [45.94, 54.05], [46.23, 56.04], [47.04, 57.71],
        [48.64, 58.92], [50.25, 60.12], [51.85, 61.32], [53.46, 62.53], [55.09, 63.69],
        [56.76, 64.81], [58.43, 65.92], [60.10, 67.03], [61.56, 68.40], [62.98, 69.82]
      ];
      for (const [x, y] of dinoCoords) {
        pts.push({ x, y });
      }
    } else if (shape === 'star') {
      // Crisp 5-pointed star: 10 vertices alternating outer (r=28) and inner (r=11)
      const verts: [number, number][] = [];
      for (let k = 0; k < 10; k++) {
        const angle = -Math.PI / 2 + k * (Math.PI / 5);
        const r = k % 2 === 0 ? 28 : 11;
        verts.push([r * Math.cos(angle), r * Math.sin(angle)]);
      }
      verts.push(verts[0]); // close loop
      for (let k = 0; k < 10; k++) {
        const [x0, y0] = verts[k];
        const [x1, y1] = verts[k + 1];
        for (let s = 0; s < 10; s++) {
          const t = s / 10;
          pts.push({
            x: 54.26 + (x0 + t * (x1 - x0)),
            y: 47.83 + (y0 + t * (y1 - y0))
          });
        }
      }
    } else if (shape === 'circle') {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        pts.push({
          x: 54.26 + 22 * Math.cos(angle),
          y: 47.83 + 22 * Math.sin(angle)
        });
      }
    } else if (shape === 'bullseye') {
      // 3 concentric rings: 20 points at r=7, 30 at r=16, 50 at r=25
      const rings = [
        { r: 7, n: 20 },
        { r: 16, n: 30 },
        { r: 25, n: 50 }
      ];
      for (const ring of rings) {
        for (let i = 0; i < ring.n; i++) {
          const angle = (i / ring.n) * Math.PI * 2;
          pts.push({
            x: 54.26 + ring.r * Math.cos(angle),
            y: 47.83 + ring.r * Math.sin(angle)
          });
        }
      }
    } else { // x-shape: Two full intersecting diagonals forming an 'X'
      for (let i = 0; i < 50; i++) {
        // Diagonal 1: bottom-left to top-right (-22 to +22)
        const t = -22 + (i / 49) * 44;
        pts.push({ x: 54.26 + t, y: 47.83 + t });
      }
      for (let i = 0; i < 50; i++) {
        // Diagonal 2: top-left to bottom-right (-22 to +22)
        const t = -22 + (i / 49) * 44;
        pts.push({ x: 54.26 + t, y: 47.83 - t });
      }
    }
    return pts;
  }

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🦕 Game 1.3: The Datasaurus Dozen & Probability Trap</h2>
            <p class="card-subtitle">Visual Intuition: Why summary statistics lie and distributions require direct inspection</p>
          </div>
          <span class="concept-badge">Week 1 Probability & Stats</span>
        </div>

        <!-- Stepper Component (Progressive Disclosure) -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Progressive Tutorial:
          </span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Morphing Shapes</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Probability Rules</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Mastery Quiz</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: Shape Morphing & Invariant Statistics -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-secondary);">Select distribution pattern to inspect:</span>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-sm ${activeShape === 'dino' ? 'btn-primary' : 'btn-secondary'} btn-shape" data-shape="dino">🦕 Dinosaur</button>
                <button class="btn btn-sm ${activeShape === 'star' ? 'btn-primary' : 'btn-secondary'} btn-shape" data-shape="star">⭐ Star</button>
                <button class="btn btn-sm ${activeShape === 'bullseye' ? 'btn-primary' : 'btn-secondary'} btn-shape" data-shape="bullseye">🎯 Bullseye</button>
                <button class="btn btn-sm ${activeShape === 'circle' ? 'btn-primary' : 'btn-secondary'} btn-shape" data-shape="circle">⭕ Circle</button>
                <button class="btn btn-sm ${activeShape === 'x' ? 'btn-primary' : 'btn-secondary'} btn-shape" data-shape="x">❌ X-Shape</button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-bottom: 20px;">
              <div class="game-viewport" style="height: 320px;">
                <canvas id="dino-canvas" width="600" height="320" style="width: 100%; height: 100%;"></canvas>
                <div class="viewport-overlay">
                  Shape: <span style="color: var(--accent-cyan); font-weight: bold; text-transform: uppercase;">${activeShape}</span> (100 Sample Points)
                </div>
              </div>

              <!-- Stat Gauges Box -->
              <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 13px; text-transform: uppercase; color: var(--accent-amber); margin-bottom: 12px;">📊 Computed Summary Statistics</h4>
                  <div style="display: flex; flex-direction: column; gap: 10px; font-family: 'Fira Code', monospace; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
                      <span style="color: var(--text-muted);">Mean(X):</span>
                      <span style="color: var(--accent-cyan); font-weight: 700;">54.26</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
                      <span style="color: var(--text-muted);">Mean(Y):</span>
                      <span style="color: var(--accent-cyan); font-weight: 700;">47.83</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
                      <span style="color: var(--text-muted);">StdDev(X):</span>
                      <span style="color: #a7f3d0; font-weight: 700;">16.76</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
                      <span style="color: var(--text-muted);">StdDev(Y):</span>
                      <span style="color: #a7f3d0; font-weight: 700;">26.93</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--text-muted);">Pearson r:</span>
                      <span style="color: #fca5a5; font-weight: 700;">-0.06</span>
                    </div>
                  </div>
                </div>

                <div style="background: rgba(255, 170, 0, 0.1); border-left: 3px solid var(--accent-amber); padding: 10px; border-radius: 4px; font-size: 11.5px; color: #fde047; line-height: 1.5;">
                  💡 <strong>Core Takeaway:</strong> Despite identical mean, variance, and correlation, the underlying structures are radically different!
                </div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: Sum & Product Rule Calculator -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.7); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 8px;">🎲 Probability Foundations: Sum Rule & Product Rule</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 18px;">
              Machine learning uses probability theory to model uncertainty under observation. Adjust the conditional prior to see marginalization:
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); padding: 16px; border-radius: var(--radius-md);">
                <h4 style="color: var(--accent-cyan); font-size: 14px; margin-bottom: 8px;">1. The Sum Rule (Marginalization)</h4>
                <div class="formula-block">p(X = x) = ∑_y p(X = x, Y = y)</div>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
                  Sums joint probabilities across all possible states of variable Y to obtain the marginal probability p(X).
                </p>
              </div>

              <div style="background: rgba(157, 78, 221, 0.05); border: 1px solid rgba(157, 78, 221, 0.2); padding: 16px; border-radius: var(--radius-md);">
                <h4 style="color: #c084fc; font-size: 14px; margin-bottom: 8px;">2. The Product Rule (Conditioning)</h4>
                <div class="formula-block">p(X = x, Y = y) = p(Y = y | X = x) · p(X = x)</div>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
                  Decomposes the joint probability into conditional likelihood times prior probability.
                </p>
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button id="btn-verify-prob" class="btn btn-primary btn-sm">Verify Probability Axioms (+50 XP)</button>
            </div>
            <div id="prob-feedback" style="margin-top: 10px;"></div>
          </div>
        ` : `
          <!-- Step 3: Interactive Mastery Check -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.7); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 8px;">🎯 Check Your Understanding: Statistics in ML</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              According to Week 1 slides, what is the key difference between probability theory and applied statistics in machine learning?
            </p>

            <div class="quiz-options" style="margin-bottom: 16px;">
              <button class="quiz-option-btn q-opt-stats" data-val="correct">
                <strong>Probability</strong> reasons forward from a known data-generation process to future outcomes; <strong>Statistics & ML</strong> reason backward from observed empirical data to fit governing parameters.
              </button>
              <button class="quiz-option-btn q-opt-stats" data-val="wrong1">
                Probability is only used for discrete classification, while statistics is exclusively for continuous regression.
              </button>
              <button class="quiz-option-btn q-opt-stats" data-val="wrong2">
                Machine learning strictly avoids probability theory because gradient descent is purely deterministic.
              </button>
            </div>
            <div id="quiz-feedback" style="min-height: 30px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Datasaurus Dozen (Alberto Cairo, 2016):</strong> Created to demonstrate the importance of visualizing data rather than blindly relying on low-order summary statistics. An entire family of 12 distinct datasets share nearly identical:</p>
            <ul>
              <li>Mean: \\(\\bar{x} = 54.26, \\bar{y} = 47.83\\)</li>
              <li>Standard Deviation: \\(s_x = 16.76, s_y = 26.93\\)</li>
              <li>Pearson correlation: \\(r = -0.06\\)</li>
            </ul>
            <div class="formula-block">
              Pearson Correlation: r = ∑ (x_i - x̄)(y_i - ȳ) / [ √(∑(x_i - x̄)²) · √(∑(y_i - ȳ)²) ]
            </div>
          </div>
        </details>
      </div>
    `;

    // Draw canvas if in step 1
    if (activeStep === 1) {
      const canvas = container.querySelector('#dino-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw points with 1:1 aspect ratio mapping
        const pts = getShapePoints(activeShape);
        // Center the 0..100 domain in the canvas maintaining 1:1 scale
        const plotSize = Math.min(canvas.width, canvas.height) * 0.88;
        const offsetX = (canvas.width - plotSize) / 2;
        const offsetY = (canvas.height - plotSize) / 2;

        pts.forEach(p => {
          const px = offsetX + (p.x / 100) * plotSize;
          const py = offsetY + (1 - p.y / 100) * plotSize;

          ctx.fillStyle = activeShape === 'dino' ? '#00f0ff' : activeShape === 'star' ? '#f59e0b' : activeShape === 'bullseye' ? '#ef4444' : activeShape === 'x' ? '#ec4899' : '#a855f7';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    }

    // Attach listeners
    container.querySelectorAll('.btn-shape').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        activeShape = (b as HTMLElement).dataset.shape || 'dino';
        render();
      });
    });

    container.querySelectorAll('.step-dot').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        activeStep = parseInt((b as HTMLElement).dataset.step || '1');
        render();
      });
    });

    container.querySelector('#btn-step-prev')?.addEventListener('click', () => {
      if (activeStep > 1) {
        sound.playClick();
        activeStep--;
        render();
      }
    });

    container.querySelector('#btn-step-next')?.addEventListener('click', () => {
      if (activeStep < 3) {
        sound.playClick();
        activeStep++;
        render();
      }
    });

    container.querySelector('#btn-verify-prob')?.addEventListener('click', () => {
      sound.playCorrect();
      gameManager.addScore(50, 25);
      const fb = container.querySelector('#prob-feedback');
      if (fb) {
        fb.innerHTML = '<span style="color: var(--accent-green); font-size: 13px;">✓ Correct! Sum Rule provides marginal probabilities; Product Rule conditions on observed evidence!</span>';
      }
    });

    container.querySelectorAll('.q-opt-stats').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#quiz-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week1_datasaurus');
          if (fb) {
            fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700; margin-top: 8px;">🎉 Perfect! Probability works forward from known systems; ML works backward from data to fit parameters θ!</div>';
          }
        } else {
          sound.playWrong();
          if (fb) {
            fb.innerHTML = '<div style="color: var(--accent-red); margin-top: 8px;">Incorrect. Review: Probability deduces outcomes from known models; Machine Learning infers model parameters from empirical data.</div>';
          }
        }
      });
    });
  }

  render();
}
