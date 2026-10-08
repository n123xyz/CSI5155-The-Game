import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek2BiasVarianceDartboard(container: HTMLElement) {
  let activeStep = 1;
  let selectedTarget = 'low_bias_low_var';
  let modelCapacity = 3; // 1 to 9

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🎯 Game 2.2: Bias-Variance Decomposition & Capacity U-Curve</h2>
            <p class="card-subtitle">Visual Intuition: Dissecting Generalization Error = Bias² + Variance + Irreducible Noise</p>
          </div>
          <span class="concept-badge">Week 2 Model Capacity</span>
        </div>

        <!-- Progressive Disclosure Stepper -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Progressive Tutorial:
          </span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Dartboard Physics</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Capacity U-Curve</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Concept Mastery</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: The Dartboard Analogy -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-secondary);">Select model behavior regime:</span>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-sm ${selectedTarget === 'low_bias_low_var' ? 'btn-primary' : 'btn-secondary'} target-btn" data-target="low_bias_low_var">
                  🎯 Low Bias, Low Var (Ideal)
                </button>
                <button class="btn btn-sm ${selectedTarget === 'low_bias_high_var' ? 'btn-primary' : 'btn-secondary'} target-btn" data-target="low_bias_high_var">
                  💥 Low Bias, High Var (Overfitting)
                </button>
                <button class="btn btn-sm ${selectedTarget === 'high_bias_low_var' ? 'btn-primary' : 'btn-secondary'} target-btn" data-target="high_bias_low_var">
                  📏 High Bias, Low Var (Underfitting)
                </button>
                <button class="btn btn-sm ${selectedTarget === 'high_bias_high_var' ? 'btn-primary' : 'btn-secondary'} target-btn" data-target="high_bias_high_var">
                  🌪️ High Bias, High Var (Worst)
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 16px;">
              <div class="game-viewport" style="height: 320px;">
                <canvas id="dart-canvas" width="600" height="320" style="width: 100%; height: 100%;"></canvas>
                <div class="viewport-overlay">
                  Bullseye Target = True Underlying Distribution \(f^*(x)\)
                </div>
              </div>

              <!-- Diagnostic Evaluation Box -->
              <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 13px; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 10px;">
                    ${selectedTarget === 'low_bias_low_var' ? '✅ Ideal Estimator' : selectedTarget === 'low_bias_high_var' ? '⚠️ Overfitting (High Variance)' : selectedTarget === 'high_bias_low_var' ? '⚠️ Underfitting (High Bias)' : '❌ Inadequate Model'}
                  </h4>
                  <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                    ${selectedTarget === 'low_bias_low_var' ? 'Shots cluster tightly around the bullseye center. Excellent generalization with minimal test error.' : selectedTarget === 'low_bias_high_var' ? 'Centered on bullseye on average, but wildly scattered across training splits. Memorizes training noise.' : selectedTarget === 'high_bias_low_var' ? 'Shots are tightly grouped but systematically far from the bullseye. Model is too rigid to learn true pattern.' : 'Both far from bullseye and heavily scattered. Model class is wrong and unstable.'}
                  </p>
                </div>

                <div style="background: rgba(0, 240, 255, 0.08); border-left: 3px solid var(--accent-cyan); padding: 10px; border-radius: 4px; font-size: 12px; color: #7dd3fc;">
                  <strong>Bias:</strong> Deviation of expected prediction from true value.<br>
                  <strong>Variance:</strong> Variability of predictions across different training sets.
                </div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: Capacity U-Curve -->
          <div style="animation: fadeIn 0.3s ease;">
            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item" style="flex: 1;">
                <label>Model Capacity / Polynomial Degree \(M\): <span id="cap-val" style="color: var(--accent-cyan); font-weight: bold;">${modelCapacity}</span></label>
                <input type="range" id="cap-slider" min="1" max="9" step="1" value="${modelCapacity}" style="width: 100%;">
              </div>
              <div class="control-item">
                <label>Current Status:</label>
                <span class="concept-badge" style="color: ${modelCapacity <= 2 ? 'var(--accent-amber)' : modelCapacity <= 4 ? 'var(--accent-green)' : 'var(--accent-red)'};">
                  ${modelCapacity <= 2 ? 'UNDERFITTING (High Bias)' : modelCapacity <= 4 ? 'OPTIMAL TRADEOFF' : 'OVERFITTING (High Variance)'}
                </span>
              </div>
            </div>

            <div class="game-viewport" style="height: 280px; margin-bottom: 16px;">
              <canvas id="ucurve-canvas" width="800" height="280" style="width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        ` : `
          <!-- Step 3: Interactive Verification -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.7); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">🧠 Concept Mastery: Occam’s Razor & Generalization Gap</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              If Model A (Linear) and Model B (Degree-8 Polynomial) achieve virtually identical MSE on the training data, which one should be selected, and why?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-bv" data-val="correct">
                <strong>Model A (Linear):</strong> According to Occam's Razor, among hypotheses with equivalent empirical performance, the simpler model with smaller capacity is preferred because it exhibits lower variance on unseen test data.
              </button>
              <button class="quiz-option-btn q-opt-bv" data-val="wrong">
                Model B (Degree-8): Always prefer the model with more parameters because more weights guarantee better future extrapolation.
              </button>
            </div>
            <div id="bv-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Formal Bias-Variance Decomposition (Week 2):</strong></p>
            <div class="formula-block">
              E[(y - f̂(x))²] = [Bias(f̂(x))]² + Var(f̂(x)) + σ²_noise<br><br>
              Where:<br>
              Bias(f̂(x)) = E[f̂(x)] - f*(x) (Systematic model error)<br>
              Var(f̂(x)) = E[(f̂(x) - E[f̂(x)])²] (Sensitivity to training sample shifts)<br>
              σ²_noise = Irreducible stochastic error
            </div>
          </div>
        </details>
      </div>
    `;

    // Draw Canvas
    if (activeStep === 1) {
      const canvas = container.querySelector('#dart-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Draw concentric target rings
        const rings = [120, 85, 50, 20];
        const ringColors = ['rgba(255,255,255,0.03)', 'rgba(0,240,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,51,68,0.2)'];
        rings.forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = ringColors[idx];
          ctx.fill();
          ctx.strokeStyle = idx === 3 ? 'var(--accent-red)' : 'rgba(255,255,255,0.15)';
          ctx.lineWidth = idx === 3 ? 2 : 1;
          ctx.stroke();
        });

        // Center crosshair
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(cx - 130, cy); ctx.lineTo(cx + 130, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - 130); ctx.lineTo(cx, cy + 130); ctx.stroke();

        // Generate shots based on target
        let offset = { x: 0, y: 0 };
        let spread = 12;

        if (selectedTarget === 'low_bias_low_var') {
          offset = { x: 0, y: 0 }; spread = 10;
        } else if (selectedTarget === 'low_bias_high_var') {
          offset = { x: 0, y: 0 }; spread = 65;
        } else if (selectedTarget === 'high_bias_low_var') {
          offset = { x: 65, y: -55 }; spread = 12;
        } else {
          offset = { x: 60, y: -50 }; spread = 70;
        }

        // Draw 30 simulated model shots
        for (let i = 0; i < 30; i++) {
          const u1 = Math.sin(i * 12.3) * Math.cos(i * 4.7);
          const u2 = Math.cos(i * 8.9) * Math.sin(i * 9.1);
          const sx = cx + offset.x + u1 * spread;
          const sy = cy + offset.y + u2 * spread;

          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    } else if (activeStep === 2) {
      const canvas = container.querySelector('#ucurve-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padX = 80, padY = 40;
        const w = canvas.width - padX * 2;
        const h = canvas.height - padY * 2;

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padX, padY);
        ctx.lineTo(padX, padY + h);
        ctx.lineTo(padX + w, padY + h);
        ctx.stroke();

        ctx.font = '11px Fira Code';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Model Capacity (Degree M) →', padX + w - 180, padY + h + 25);
        ctx.fillText('↑ Error', padX - 45, padY + 15);

        // Draw curves: Bias^2 (decaying), Variance (exponentially growing), Total Error (U-shape)
        // Bias^2
        ctx.strokeStyle = '#38bdf8'; // cyan/blue
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 5) {
          const t = x / w;
          const bias = Math.exp(-3 * t) * (h * 0.7);
          const py = padY + h - bias;
          if (x === 0) ctx.moveTo(padX + x, py); else ctx.lineTo(padX + x, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Bias²', padX + 20, padY + 40);

        // Variance
        ctx.strokeStyle = '#f43f5e'; // red
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 5) {
          const t = x / w;
          const variance = Math.pow(t, 2.5) * (h * 0.85);
          const py = padY + h - variance;
          if (x === 0) ctx.moveTo(padX + x, py); else ctx.lineTo(padX + x, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('Variance', padX + w - 70, padY + 40);

        // Total Error U-shape
        ctx.strokeStyle = '#a855f7'; // purple
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 5) {
          const t = x / w;
          const total = (Math.exp(-3 * t) * (h * 0.7)) + (Math.pow(t, 2.5) * (h * 0.85)) + 20;
          const py = padY + h - total;
          if (x === 0) ctx.moveTo(padX + x, py); else ctx.lineTo(padX + x, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#c084fc';
        ctx.fillText('Total Test Error (U-Curve)', padX + w / 2 - 60, padY + 30);

        // Mark current capacity
        const curT = (modelCapacity - 1) / 8;
        const curX = padX + curT * w;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(curX, padY);
        ctx.lineTo(curX, padY + h);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        const curTotal = (Math.exp(-3 * curT) * (h * 0.7)) + (Math.pow(curT, 2.5) * (h * 0.85)) + 20;
        ctx.arc(curX, padY + h - curTotal, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Event listeners
    container.querySelectorAll('.target-btn').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        selectedTarget = (b as HTMLElement).dataset.target || 'low_bias_low_var';
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
      if (activeStep > 1) { sound.playClick(); activeStep--; render(); }
    });

    container.querySelector('#btn-step-next')?.addEventListener('click', () => {
      if (activeStep < 3) { sound.playClick(); activeStep++; render(); }
    });

    const capSlider = container.querySelector('#cap-slider') as HTMLInputElement;
    capSlider?.addEventListener('input', (e) => {
      modelCapacity = parseInt((e.target as HTMLInputElement).value);
      render();
    });

    container.querySelectorAll('.q-opt-bv').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#bv-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week2_bias_variance');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! Occam\'s razor dictates choosing the simpler hypothesis when empirical fit is comparable.</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. Extra parameters risk high variance without providing empirical gain.</div>';
        }
      });
    });
  }

  render();
}
