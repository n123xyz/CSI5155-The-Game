import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek4RegressionMetrics(container: HTMLElement) {
  let activeStep = 1;
  let outlierY = 180; // normal range 30-70
  let masteryAwarded = Boolean(gameManager.getState().completedGames['week4_regression']);

  const baselinePoints = [
    { x: 10, y: 35, pred: 38 },
    { x: 20, y: 48, pred: 50 },
    { x: 30, y: 62, pred: 65 },
    { x: 40, y: 78, pred: 77 },
  ];

  function calcMetrics() {
    const pts = [...baselinePoints, { x: 50, y: outlierY, pred: 92 }];
    const n = pts.length;

    let sumSq = 0;
    let sumAbs = 0;
    let maxErr = 0;

    pts.forEach(p => {
      const err = Math.abs(p.y - p.pred);
      sumSq += err * err;
      sumAbs += err;
      if (err > maxErr) maxErr = err;
    });

    const mse = sumSq / n;
    const rmse = Math.sqrt(mse);
    const mae = sumAbs / n;

    return { mse, rmse, mae, maxErr };
  }

  function render() {
    const m = calcMetrics();

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>📏 Game 4.5: Regression Metrics & Outlier Stress Lab</h2>
            <p class="card-subtitle">Visual Intuition: Why MSE explodes on outliers while MAE remains robust</p>
          </div>
          <span class="concept-badge">Week 4 Regression</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Outlier Stress Test</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Metric Comparison</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Mastery Check</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: Outlier Stress Slider -->
          <div style="animation: fadeIn 0.3s ease;">
            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item" style="flex: 1;">
                <label>Outlier Sample Target Value \\(y_{\\text{outlier}}\\): <span id="outlier-val" style="color: var(--accent-red); font-weight: bold;">${outlierY}</span></label>
                <input type="range" id="outlier-slider" min="90" max="300" step="5" value="${outlierY}" style="width: 100%;">
              </div>
              <div class="control-item">
                <label>Single Outlier Residual:</label>
                <span class="concept-badge" style="color: var(--accent-red);">|${outlierY} - 92| = ${Math.abs(outlierY - 92)}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
              <div style="background: rgba(255, 51, 68, 0.08); border: 1px solid var(--accent-red); padding: 16px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">MSE (Squared)</div>
                <div style="font-size: 26px; font-weight: 900; color: #fca5a5; margin: 6px 0; font-family: 'Fira Code', monospace;">
                  ${m.mse.toFixed(1)}
                </div>
                <div style="font-size: 11px; color: #f87171;">Penalizes quadratically!</div>
              </div>

              <div style="background: rgba(255, 170, 0, 0.08); border: 1px solid var(--accent-amber); padding: 16px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">RMSE (Root MSE)</div>
                <div style="font-size: 26px; font-weight: 900; color: #fde047; margin: 6px 0; font-family: 'Fira Code', monospace;">
                  ${m.rmse.toFixed(1)}
                </div>
                <div style="font-size: 11px; color: #fde047;">Original target units</div>
              </div>

              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 16px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">MAE (Absolute)</div>
                <div style="font-size: 26px; font-weight: 900; color: #7dd3fc; margin: 6px 0; font-family: 'Fira Code', monospace;">
                  ${m.mae.toFixed(1)}
                </div>
                <div style="font-size: 11px; color: #38bdf8;">Robust to outliers</div>
              </div>

              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 16px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Max Error</div>
                <div style="font-size: 26px; font-weight: 900; color: #d8b4fe; margin: 6px 0; font-family: 'Fira Code', monospace;">
                  ${m.maxErr.toFixed(1)}
                </div>
                <div style="font-size: 11px; color: #c084fc;">Worst-case single error</div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: Formulas & Dummy Baseline -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">📉 Dummy Regression Baseline: Predicting Mean Target ȳ</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              Before deploying any sophisticated regression model, always compare its RMSE against a dumb baseline that predicts constant target mean \\(\\bar{y} = \\frac{1}{N} \\sum y_i\\).
            </p>
            <div class="formula-block">
              MSE = (1/N) ∑ (y_i - ŷ_i)²<br>
              RMSE = √MSE<br>
              MAE = (1/N) ∑ |y_i - ŷ_i|<br>
              Max Error = max_i |y_i - ŷ_i|
            </div>
          </div>
        ` : `
          <!-- Step 3: Quick Quiz -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">🧠 Which metric to prioritize?</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              If your training dataset contains severe measurement sensor glitches that occasionally introduce 100x corrupted values, which error metric will prevent model parameters from being dominated by these anomalies?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-reg" data-val="correct">
                <strong>Mean Absolute Error (MAE):</strong> Because MAE penalizes errors linearly rather than quadratically, making it significantly more robust to corrupted outlier instances!
              </button>
              <button class="quiz-option-btn q-opt-reg" data-val="wrong">
                Mean Squared Error (MSE): Because squaring errors suppresses large values.
              </button>
            </div>
            <div id="reg-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Outlier Sensitivity:</strong> Under MSE loss, an error of magnitude 10 contributes 100 to the total loss, while an error of magnitude 1 contributes only 1. Under MAE (L1 loss), an error of 10 contributes only 10 times more than an error of 1, providing bounded influence.</p>
          </div>
        </details>
      </div>
    `;

    // Attach listeners
    const slider = container.querySelector('#outlier-slider') as HTMLInputElement;
    slider?.addEventListener('input', (e) => {
      outlierY = parseFloat((e.target as HTMLInputElement).value);
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

    container.querySelectorAll('.q-opt-reg').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#reg-feedback');
        if (val === 'correct') {
          if (!masteryAwarded) {
            masteryAwarded = true;
            sound.playVictory();
            confetti({ particleCount: 50, spread: 60 });
            gameManager.addScore(100, 50);
            gameManager.markGameComplete('week4_regression');
          }
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! MAE is robust against outlier distortion!</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. MSE heavily inflates large errors by squaring them.</div>';
        }
      });
    });
  }

  render();
}
