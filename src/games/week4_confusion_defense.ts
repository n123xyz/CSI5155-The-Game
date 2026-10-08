import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek4ConfusionDefense(container: HTMLElement) {
  let threshold = 0.50;

  // Stream of 20 radar signals: 10 Positive (Threats), 10 Negative (Decoys)
  // Each has a model predicted probability of being a threat
  const radarSignals = [
    { id: 1, isThreat: true, prob: 0.95 },
    { id: 2, isThreat: true, prob: 0.88 },
    { id: 3, isThreat: true, prob: 0.82 },
    { id: 4, isThreat: true, prob: 0.76 },
    { id: 5, isThreat: true, prob: 0.68 },
    { id: 6, isThreat: true, prob: 0.62 },
    { id: 7, isThreat: true, prob: 0.54 },
    { id: 8, isThreat: true, prob: 0.44 },
    { id: 9, isThreat: true, prob: 0.38 },
    { id: 10, isThreat: true, prob: 0.22 },
    // Decoys (Actual Negative)
    { id: 11, isThreat: false, prob: 0.72 }, // Hard decoy (causes FP at low thresh)
    { id: 12, isThreat: false, prob: 0.58 }, // Hard decoy
    { id: 13, isThreat: false, prob: 0.46 },
    { id: 14, isThreat: false, prob: 0.35 },
    { id: 15, isThreat: false, prob: 0.28 },
    { id: 16, isThreat: false, prob: 0.20 },
    { id: 17, isThreat: false, prob: 0.15 },
    { id: 18, isThreat: false, prob: 0.12 },
    { id: 19, isThreat: false, prob: 0.08 },
    { id: 20, isThreat: false, prob: 0.05 },
  ];

  function computeMetrics() {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    radarSignals.forEach(s => {
      const pred = s.prob >= threshold;
      if (s.isThreat && pred) tp++;
      else if (!s.isThreat && pred) fp++;
      else if (!s.isThreat && !pred) tn++;
      else if (s.isThreat && !pred) fn++;
    });

    const total = radarSignals.length;
    const accuracy = (tp + tn) / total;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return { tp, fp, tn, fn, accuracy, precision, recall, f1 };
  }

  function render() {
    const m = computeMetrics();

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🛡️ Game 4.1: Confusion Matrix Defense</h2>
            <p class="card-subtitle">Balance Precision vs Recall vs F1 Score under Hostile Radar Infiltration</p>
          </div>
          <span class="concept-badge">Evaluation & Metrics</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Intercept Decision Threshold: <span id="thresh-val">${threshold.toFixed(2)}</span></label>
            <input type="range" id="cm-threshold" min="0.10" max="0.90" step="0.05" value="${threshold}">
          </div>

          <div class="control-item">
            <label>Doctrine Quick-Presets</label>
            <div style="display: flex; gap: 8px;">
              <button id="btn-pre-balanced" class="btn btn-secondary btn-sm">Balanced (p=0.50)</button>
              <button id="btn-pre-maxrecall" class="btn btn-secondary btn-sm" style="color:var(--accent-cyan);">Zero FN (p=0.20)</button>
              <button id="btn-pre-maxprec" class="btn btn-secondary btn-sm" style="color:var(--accent-amber);">Zero FP (p=0.75)</button>
            </div>
          </div>
        </div>

        <!-- 2x2 Confusion Matrix + Metrics Grid -->
        <div class="grid-2" style="margin-bottom: 24px;">
          <!-- Confusion Matrix Box -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
            <h4 style="font-size: 14px; color: var(--accent-cyan); margin-bottom: 12px; text-align: center;">Confusion Matrix (2 × 2)</h4>
            
            <div style="display: grid; grid-template-columns: 80px 1fr 1fr; gap: 8px; text-align: center; font-family: 'Fira Code', monospace; font-size: 12px;">
              <div></div>
              <div style="color: var(--accent-cyan); font-weight: bold;">Pred Positive</div>
              <div style="color: var(--text-muted); font-weight: bold;">Pred Negative</div>

              <div style="color: var(--accent-green); font-weight: bold; display: flex; align-items: center; justify-content: flex-end;">Actual Pos</div>
              <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); padding: 14px; border-radius: 8px;">
                <div style="font-size: 11px; color: var(--text-muted);">TRUE POS (TP)</div>
                <strong style="font-size: 20px; color: #a7f3d0;">${m.tp}</strong>
              </div>
              <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); padding: 14px; border-radius: 8px;">
                <div style="font-size: 11px; color: var(--text-muted);">FALSE NEG (FN)</div>
                <strong style="font-size: 20px; color: #fca5a5;">${m.fn}</strong>
              </div>

              <div style="color: var(--text-muted); font-weight: bold; display: flex; align-items: center; justify-content: flex-end;">Actual Neg</div>
              <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); padding: 14px; border-radius: 8px;">
                <div style="font-size: 11px; color: var(--text-muted);">FALSE POS (FP)</div>
                <strong style="font-size: 20px; color: #fef08a;">${m.fp}</strong>
              </div>
              <div style="background: rgba(0, 240, 255, 0.15); border: 1px solid var(--accent-cyan); padding: 14px; border-radius: 8px;">
                <div style="font-size: 11px; color: var(--text-muted);">TRUE NEG (TN)</div>
                <strong style="font-size: 20px; color: #7dd3fc;">${m.tn}</strong>
              </div>
            </div>
          </div>

          <!-- Live Metrics Gauges -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; justify-content: space-around;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Accuracy: (TP + TN) / Total</span>
                <strong style="font-family:'Fira Code'; color:#fff;">${(m.accuracy * 100).toFixed(1)}%</strong>
              </div>
              <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${m.accuracy * 100}%; height:100%; background:var(--accent-cyan);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Precision: TP / (TP + FP)</span>
                <strong style="font-family:'Fira Code'; color:var(--accent-amber);">${(m.precision * 100).toFixed(1)}%</strong>
              </div>
              <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${m.precision * 100}%; height:100%; background:var(--accent-amber);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Recall (Sensitivity): TP / (TP + FN)</span>
                <strong style="font-family:'Fira Code'; color:var(--accent-green);">${(m.recall * 100).toFixed(1)}%</strong>
              </div>
              <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${m.recall * 100}%; height:100%; background:var(--accent-green);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>F1-Score: Harmonic Mean 2(P·R)/(P+R)</span>
                <strong style="font-family:'Fira Code'; color:var(--accent-pink);">${(m.f1 * 100).toFixed(1)}%</strong>
              </div>
              <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${m.f1 * 100}%; height:100%; background:var(--accent-pink);"></div>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <button id="btn-master-metrics" class="btn btn-primary">Lock In Optimal F1 Strategy</button>
        </div>

        <div id="defense-feedback" style="min-height: 24px; margin-top: 14px;"></div>

        <details class="math-explainer">
        <summary>💡 📊 Machine Learning Pipeline: Confusion Matrix Essentials (Click to expand)</summary>
        <div class="explainer-content">
          <div class="formula-block">
            Accuracy = (TP + TN) / (TP + TN + FP + FN)<br>
            Precision = TP / (TP + FP)  (Of all predicted positives, how many are true?)<br>
            Recall = TP / (TP + FN)     (Of all actual positives, how many did we catch?)<br>
            F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
          </div>
          <p>Notice: When classes are imbalanced, Accuracy is misleading! F1-score balances precision against recall, making it an essential evaluation metric.</p>
        </div>
      </details>
    </div>
  `;

    container.querySelector('#cm-threshold')?.addEventListener('input', (e) => {
      threshold = parseFloat((e.target as HTMLInputElement).value);
      render();
    });

    container.querySelector('#btn-pre-balanced')?.addEventListener('click', () => {
      sound.playClick();
      threshold = 0.50;
      render();
    });

    container.querySelector('#btn-pre-maxrecall')?.addEventListener('click', () => {
      sound.playClick();
      threshold = 0.20;
      render();
    });

    container.querySelector('#btn-pre-maxprec')?.addEventListener('click', () => {
      sound.playClick();
      threshold = 0.75;
      render();
    });

    container.querySelector('#btn-master-metrics')?.addEventListener('click', () => {
      const cur = computeMetrics();
      const fb = container.querySelector('#defense-feedback') as HTMLElement;
      if (cur.f1 >= 0.75) {
        sound.playVictory();
        confetti({ particleCount: 65, spread: 60 });
        gameManager.addScore(100, 50);
        gameManager.markGameComplete('week4_confusion');
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
            <strong>🎯 High F1-Score Accomplished (${(cur.f1 * 100).toFixed(1)}%)!</strong> You harmonized Precision and Recall to protect the base with minimal collateral waste.
          </div>
        `;
      } else {
        sound.playWrong();
        fb.innerHTML = `
          <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 14px; color: #fef08a;">
            <strong>F1 is ${(cur.f1 * 100).toFixed(1)}%:</strong> Slide the threshold down closer to <strong>0.30 ~ 0.35</strong> (where F1 reaches maximum 78.3%) to reduce False Negatives without destroying Precision!
          </div>
        `;
      }
    });
  }

  render();
}
