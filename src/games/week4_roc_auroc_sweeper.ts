import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek4RocAurocSweeper(container: HTMLElement) {
  let activeStep = 1;
  let threshold = 0.50; // 0.00 to 1.00

  // 10 sample patients with predicted probability and true label
  const samples = [
    { prob: 0.95, label: 1 },
    { prob: 0.88, label: 1 },
    { prob: 0.82, label: 1 },
    { prob: 0.74, label: 0 }, // false positive at high threshold
    { prob: 0.65, label: 1 },
    { prob: 0.55, label: 0 },
    { prob: 0.45, label: 1 }, // false negative at default threshold
    { prob: 0.35, label: 0 },
    { prob: 0.20, label: 0 },
    { prob: 0.10, label: 0 },
  ];

  function getMetrics(tau: number) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    samples.forEach(s => {
      const pred = s.prob >= tau ? 1 : 0;
      if (pred === 1 && s.label === 1) tp++;
      else if (pred === 1 && s.label === 0) fp++;
      else if (pred === 0 && s.label === 0) tn++;
      else if (pred === 0 && s.label === 1) fn++;
    });

    const tpr = tp / (tp + fn || 1); // Recall
    const fpr = fp / (fp + tn || 1); // 1 - Specificity
    const precision = tp / (tp + fp || 1);
    const f1 = (2 * precision * tpr) / (precision + tpr || 1);

    return { tp, fp, tn, fn, tpr, fpr, precision, f1 };
  }

  function render() {
    const m = getMetrics(threshold);

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>📈 Game 4.3: ROC Curve & AUROC Threshold Sweeper</h2>
            <p class="card-subtitle">Visual Intuition: Sweeping decision threshold τ to map True Positive Rate vs False Positive Rate</p>
          </div>
          <span class="concept-badge">Week 4 Evaluation</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Threshold Sweeper</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">AUROC Benchmark</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Macro vs Micro</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: Interactive ROC Slider -->
          <div style="animation: fadeIn 0.3s ease;">
            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item" style="flex: 1;">
                <label>Decision Threshold \(\\tau\): <span id="tau-val" style="color: var(--accent-cyan); font-weight: bold;">${threshold.toFixed(2)}</span></label>
                <input type="range" id="tau-slider" min="0.05" max="0.95" step="0.05" value="${threshold}" style="width: 100%;">
              </div>
              <div class="control-item">
                <label>Operating Point:</label>
                <span class="concept-badge" style="color: #a7f3d0;">TPR: ${(m.tpr * 100).toFixed(0)}% | FPR: ${(m.fpr * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 16px;">
              <div class="game-viewport" style="height: 320px;">
                <canvas id="roc-canvas" width="600" height="320" style="width: 100%; height: 100%;"></canvas>
                <div class="viewport-overlay" style="left: auto; right: 14px; top: 14px; font-size: 11px;">
                  AUROC: <strong style="color:var(--accent-green);">${auroc.toFixed(2)}</strong> (Empirical Piecewise Curve)
                </div>
              </div>

              <!-- Live Confusion Breakdown -->
              <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 13px; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 10px;">Live Outcome Matrix</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: 'Fira Code', monospace; text-align: center; margin-bottom: 12px;">
                    <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid var(--accent-green); padding: 8px; border-radius: 4px;">
                      <div style="font-size: 10px; color: var(--text-muted);">TP</div>
                      <div style="font-size: 18px; font-weight: 800; color: #a7f3d0;">${m.tp}</div>
                    </div>
                    <div style="background: rgba(255, 51, 68, 0.1); border: 1px solid var(--accent-red); padding: 8px; border-radius: 4px;">
                      <div style="font-size: 10px; color: var(--text-muted);">FP</div>
                      <div style="font-size: 18px; font-weight: 800; color: #fca5a5;">${m.fp}</div>
                    </div>
                    <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid var(--accent-amber); padding: 8px; border-radius: 4px;">
                      <div style="font-size: 10px; color: var(--text-muted);">FN</div>
                      <div style="font-size: 18px; font-weight: 800; color: #fde047;">${m.fn}</div>
                    </div>
                    <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--accent-cyan); padding: 8px; border-radius: 4px;">
                      <div style="font-size: 10px; color: var(--text-muted);">TN</div>
                      <div style="font-size: 18px; font-weight: 800; color: #7dd3fc;">${m.tn}</div>
                    </div>
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                    • <strong>Recall / TPR:</strong> ${m.tpr.toFixed(2)}<br>
                    • <strong>Precision:</strong> ${m.precision.toFixed(2)}<br>
                    • <strong>F1 Score:</strong> ${m.f1.toFixed(2)}
                  </div>
                </div>

                <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 4px; font-size: 11px; color: var(--text-muted);">
                  Lowering \(\tau \to 0\) pushes Recall \(\to 1.0\) but spikes False Positives!
                </div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: AUROC Diagnostic Benchmark -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🏆 Understanding AUROC (Area Under the Curve)</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              AUROC is a threshold-independent aggregate measure of ranking ability across all possible operating thresholds:
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-green);">AUROC = 1.0</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  <strong>Perfect Classifier:</strong> Perfectly separates all positive and negative samples with zero overlap at some threshold.
                </div>
              </div>

              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-amber);">AUROC = 0.50</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  <strong>Random Guessing:</strong> Coincides directly with the diagonal chance line (TPR = FPR).
                </div>
              </div>

              <div style="background: rgba(255, 51, 68, 0.05); border: 1px solid rgba(255, 51, 68, 0.2); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-red);">AUROC &lt; 0.50</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  <strong>Inverted Predictions:</strong> Model has learned the pattern in reverse! Flipping class labels yields \(1 - \text{AUROC}\).
                </div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Step 3: Multi-Class Averaging Challenge -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">📊 Multi-Class Averaging: Macro vs Micro</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              If evaluating a dataset with 90% Class A, 8% Class B, and 2% rare Disease Class C, which averaging method should you prioritize to ensure the model doesn't fail on Class C?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-roc" data-val="correct">
                <strong>Macro-Averaging:</strong> Computes metrics independently for each class and calculates the unweighted mean, treating all classes equally regardless of frequency and exposing failure on Class C.
              </button>
              <button class="quiz-option-btn q-opt-roc" data-val="wrong">
                Micro-Averaging: Because it weights by sample count, allowing Class A's dominance to mask errors.
              </button>
            </div>
            <div id="roc-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Evaluation Formulas (Week 4):</strong></p>
            <div class="formula-block">
              TPR (Recall) = TP / (TP + FN)<br>
              FPR = FP / (FP + TN) = 1 - Specificity<br>
              Precision = TP / (TP + FP)<br>
              F1 = 2 · (Precision · Recall) / (Precision + Recall)<br>
              Macro-F1 = (F1_A + F1_B + F1_C) / 3
            </div>
          </div>
        </details>
      </div>
    `;

    // Draw canvas if in step 1
    if (activeStep === 1) {
      const canvas = container.querySelector('#roc-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padX = 60, padY = 30;
        const w = canvas.width - padX * 2;
        const h = canvas.height - padY * 2;

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padX, padY);
        ctx.lineTo(padX, padY + h);
        ctx.lineTo(padX + w, padY + h);
        // X-axis label (centered beneath)
        ctx.textAlign = 'center';
        ctx.font = '11px "Fira Code", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('False Positive Rate (1 - Specificity) →', padX + w / 2, padY + h + 26);

        // Y-axis label (cleanly rotated along the left margin)
        ctx.save();
        ctx.translate(20, padY + h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '11px "Fira Code", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('True Positive Rate (Sensitivity) →', 0, 0);
        ctx.restore();

        // Diagonal chance line (AUROC = 0.5)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padX, padY + h);
        ctx.lineTo(padX + w, padY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Empirical Data-Derived ROC Curve from actual sample thresholds
        // Sort distinct score thresholds and sweep FPR & TPR steps
        const sortedThresholds = [1.01, ...Array.from(new Set(samples.map(s => s.prob))).sort((a, b) => b - a), -0.01];
        const empiricalRocPoints: { fpr: number; tpr: number }[] = [];
        sortedThresholds.forEach(t => {
          const res = getMetrics(t);
          empiricalRocPoints.push({ fpr: res.fpr, tpr: res.tpr });
        });

        // Fill area under empirical curve
        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(padX, padY + h);
        empiricalRocPoints.forEach(p => {
          ctx.lineTo(padX + p.fpr * w, padY + h - p.tpr * h);
        });
        ctx.lineTo(padX + w, padY + h);
        ctx.closePath();
        ctx.fill();

        // Draw empirical staircase/step curve
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(padX, padY + h);
        empiricalRocPoints.forEach(p => {
          ctx.lineTo(padX + p.fpr * w, padY + h - p.tpr * h);
        });
        ctx.stroke();

        // Current operational operating point on empirical ROC curve
        const curX = padX + m.fpr * w;
        const curY = padY + h - m.tpr * h;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(curX, curY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px Fira Code';
        ctx.fillText(`(FPR: ${m.fpr.toFixed(2)}, TPR: ${m.tpr.toFixed(2)})`, curX + 10, curY - 10);
      }
    }

    // Attach listeners
    const tauSlider = container.querySelector('#tau-slider') as HTMLInputElement;
    tauSlider?.addEventListener('input', (e) => {
      threshold = parseFloat((e.target as HTMLInputElement).value);
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

    container.querySelectorAll('.q-opt-roc').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#roc-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week4_roc');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! Macro-averaging treats each class equally and exposes minority failures!</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. Micro-averaging weights by sample count, masking minority errors.</div>';
        }
      });
    });
  }

  render();
}
