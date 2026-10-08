import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek3FeaturePrepEthics(container: HTMLElement) {
  let activeStep = 1;
  let rawValues = [18, 22, 25, 29, 32, 95]; // contains outlier 95

  function render() {
    const minVal = Math.min(...rawValues);
    const maxVal = Math.max(...rawValues);
    const meanVal = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
    const stdVal = Math.sqrt(rawValues.reduce((a, b) => a + Math.pow(b - meanVal, 2), 0) / rawValues.length);

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🧼 Game 3.5: Feature Engineering, Scaling & Data Ethics</h2>
            <p class="card-subtitle">Visual Intuition: GIGO Principle, Min-Max vs Z-Score on outliers, and Datasheets</p>
          </div>
          <span class="concept-badge">Week 3 Preprocessing</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Feature Typologies</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Scaling & Outliers</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Ethics & Leakage</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: Feature Typologies -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">🏷️ The 4 Foundational Feature Typologies</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              According to the <strong>GIGO Principle</strong> ("Garbage In, Garbage Out"), models depend fundamentally on input data representation:
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <strong style="color: var(--accent-cyan); font-size: 13px;">1. Categorical (Nominal)</strong>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Qualitative labels lacking intrinsic order (e.g., Blood Type, Country). Requires <strong>One-Hot Encoding</strong> into orthogonal binary vectors.
                </p>
              </div>

              <div style="background: rgba(157, 78, 221, 0.05); border: 1px solid rgba(157, 78, 221, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <strong style="color: #c084fc; font-size: 13px;">2. Ordinal</strong>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Categories with meaningful order but non-constant intervals (e.g., Likert rating: Low, Medium, High; Education Level: BSc, MSc, PhD).
                </p>
              </div>

              <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <strong style="color: var(--accent-green); font-size: 13px;">3. Quantitative (Numerical)</strong>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Continuous/discrete physical measurements where ratios carry literal arithmetic meaning (e.g., Patient Blood Pressure, Annual Income).
                </p>
              </div>

              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <strong style="color: var(--accent-amber); font-size: 13px;">4. Boolean</strong>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Binary indicator flags: 0 (False) or 1 (True) (e.g., Has Smoked, Fraud Flag).
                </p>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: The 5 Normalization & Scaling Methods -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; flex-wrap:wrap; gap:10px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px;">⚖️ The 5 Normalization & Feature Scaling Methods (Lecture Slides)</h3>
                <p style="color: var(--text-secondary); font-size: 13px;">
                  Sample data: <code>[18, 22, 25, 29, 32, <strong style="color:var(--accent-red);">${rawValues[rawValues.length - 1]}</strong>]</code>.
                </p>
              </div>
              <div style="display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.05); padding: 6px 14px; border-radius: 8px;">
                <label style="font-size: 12px; color: var(--accent-amber); font-weight: bold;">Outlier Value:</label>
                <input type="range" id="outlier-slider" min="35" max="250" step="5" value="${rawValues[rawValues.length - 1]}" style="width: 120px;">
                <span id="outlier-val-lbl" style="font-family:'Fira Code'; font-size: 13px; font-weight:bold; color:var(--accent-red);">${rawValues[rawValues.length - 1]}</span>
              </div>
            </div>

            <!-- 5-Way Comparison Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px;">
              <!-- 1. Min-Max Normalization -->
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); padding: 12px; border-radius: var(--radius-md);">
                <h4 style="color: var(--accent-cyan); font-size: 13px; margin-bottom: 4px;">1. Min-Max Normalization: [0, 1]</h4>
                <div class="formula-block" style="font-size: 10.5px; padding: 4px 6px;">x' = (x - min) / (max - min)</div>
                <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: #7dd3fc; line-height: 1.5; max-height: 100px; overflow-y:auto;">
                  ${rawValues.map(v => `${v} → ${((v - minVal) / (maxVal - minVal)).toFixed(3)}`).join('<br>')}
                </div>
                <div style="font-size: 11px; color: var(--accent-red); margin-top: 6px;">
                  ⚠️ Extreme outlier squashes regular points into tiny range!
                </div>
              </div>

              <!-- 2. Z-Score Normalization -->
              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.25); padding: 12px; border-radius: var(--radius-md);">
                <h4 style="color: var(--accent-amber); font-size: 13px; margin-bottom: 4px;">2. Z-Score Standardization: μ=0, σ=1</h4>
                <div class="formula-block" style="font-size: 10.5px; padding: 4px 6px;">x' = (x - μ) / σ</div>
                <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: #fef08a; line-height: 1.5; max-height: 100px; overflow-y:auto;">
                  ${rawValues.map(v => `${v} → ${((v - meanVal) / (stdVal || 1)).toFixed(3)}`).join('<br>')}
                </div>
                <div style="font-size: 11px; color: var(--accent-amber); margin-top: 6px;">
                  ⚠️ μ (${meanVal.toFixed(1)}) and σ (${stdVal.toFixed(1)}) are distorted by outlier!
                </div>
              </div>

              <!-- 3. RobustScaler -->
              <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.25); padding: 12px; border-radius: var(--radius-md);">
                <h4 style="color: var(--accent-green); font-size: 13px; margin-bottom: 4px;">3. RobustScaler: Median, IQR</h4>
                <div class="formula-block" style="font-size: 10.5px; padding: 4px 6px;">x' = (x - Median) / (Q₃ - Q₁)</div>
                <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: #a7f3d0; line-height: 1.5; max-height: 100px; overflow-y:auto;">
                  ${(() => {
                    const sorted = [...rawValues].sort((a, b) => a - b);
                    const med = (sorted[2]! + sorted[3]!) / 2; // median
                    const q1 = sorted[1]!;
                    const q3 = sorted[4]!;
                    const iqr = Math.max(1, q3 - q1);
                    return rawValues.map(v => `${v} → ${((v - med) / iqr).toFixed(3)}`).join('<br>');
                  })()}
                </div>
                <div style="font-size: 11px; color: var(--accent-green); margin-top: 6px;">
                  ✓ Rock solid! Median and IQR resist outlier contamination.
                </div>
              </div>
            </div>

            <!-- Bottom Row: Decimal Scaling & Unit Vector -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- 4. Decimal Scaling -->
              <div style="background: rgba(157, 78, 221, 0.05); border: 1px solid rgba(157, 78, 221, 0.25); padding: 12px; border-radius: var(--radius-md);">
                <h4 style="color: #c084fc; font-size: 13px; margin-bottom: 4px;">4. Decimal Scaling Normalization</h4>
                <div class="formula-block" style="font-size: 10.5px; padding: 4px 6px;">
                  x' = x / 10^j, where j = ⌈log₁₀(max |x|)⌉
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 6px;">
                  For max value ${maxVal}: smallest integer j gives 10^j = ${Math.pow(10, Math.ceil(Math.log10(maxVal || 1)))} (j = ${Math.ceil(Math.log10(maxVal || 1))}).
                </div>
                <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: #d8b4fe; line-height: 1.5;">
                  ${(() => {
                    const j = Math.ceil(Math.log10(maxVal || 1));
                    const denom = Math.pow(10, j);
                    return rawValues.map(v => `${v} → ${(v / denom).toFixed(3)}`).join(', ');
                  })()}
                </div>
              </div>

              <!-- 5. Unit Vector Normalization -->
              <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.25); padding: 12px; border-radius: var(--radius-md);">
                <h4 style="color: #38bdf8; font-size: 13px; margin-bottom: 4px;">5. Unit Vector (L₁ & L₂ Normalization)</h4>
                <div class="formula-block" style="font-size: 10.5px; padding: 4px 6px;">
                  L₁: x / ∑|x_i| | L₂: x / √(∑ x_i²)
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 6px;">
                  Projects feature vectors onto unit hyper-sphere (sum of L₁ = 1, Euclidean norm L₂ = 1). Essential for cosine similarity.
                </div>
                <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: #7dd3fc; line-height: 1.5;">
                  ${(() => {
                    const l2 = Math.sqrt(rawValues.reduce((s, v) => s + v * v, 0));
                    return `L₂ Unit Vector: [${rawValues.map(v => (v / l2).toFixed(2)).join(', ')}]`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Step 3: Contamination & Ethics Audit -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">🛡️ Data Contamination Rule & Datasheets for Datasets</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              What is the strict rule regarding feature scaling parameters (\\(\\mu, \\sigma, \\min, \\max\\)) when evaluating models?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-prep" data-val="correct">
                <strong>Strict Train-Only Estimation:</strong> Scaling statistics (\\(\\mu, \\sigma\\)) must be computed strictly on the Training set, and applied forward to Test data without recalculating on the Test set to prevent <strong>preprocessing data leakage</strong>.
              </button>
              <button class="quiz-option-btn q-opt-prep" data-val="wrong">
                Scaling statistics should always be recalculated on the combined dataset to maximize accuracy.
              </button>
            </div>
            <div id="prep-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Datasheets for Datasets (Gebru et al., 2021):</strong> Standardized documentation detailing dataset motivation, composition, collection process, preprocessing, and recommended uses to prevent algorithmic bias and demographic underrepresentation.</p>
          </div>
        </details>
      </div>
    `;

    // Event listeners
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

    container.querySelector('#outlier-slider')?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      rawValues[rawValues.length - 1] = val;
      const lbl = container.querySelector('#outlier-val-lbl');
      if (lbl) lbl.textContent = val.toString();
      render();
    });

    container.querySelectorAll('.q-opt-prep').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#prep-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week3_feature_prep');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! Calculating scaling metrics on test data causes data leakage and invalidates evaluation!</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. Test data statistics must never contaminate training pipelines.</div>';
        }
      });
    });
  }

  render();
}
