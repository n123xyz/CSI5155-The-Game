import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek2LogisticSigmoid(container: HTMLElement) {
  let threshold = 0.5; // standard p = 0.5
  let theta0 = -20.0;
  let theta1 = 0.15; // gives p = 0.5 at x = 133.3 mmHg!

  // Actual dataset from Week 2 slides (Slide 65 & 85)
  const clinicalPatients = [
    { bp: 102, actual: 0 },
    { bp: 103, actual: 0 },
    { bp: 112, actual: 0 },
    { bp: 120, actual: 1 }, // mild anomaly in data
    { bp: 132, actual: 0 },
    { bp: 132, actual: 0 },
    { bp: 151, actual: 1 },
    { bp: 154, actual: 1 },
    { bp: 161, actual: 1 },
    { bp: 168, actual: 1 },
  ];

  function sigmoid(z: number) {
    return 1 / (1 + Math.exp(-z));
  }

  function predictProb(bp: number) {
    return sigmoid(theta0 + theta1 * bp);
  }

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🩺 Game 2.3: Clinical Sigmoid Triage (Logistic Regression)</h2>
          <p class="card-subtitle">Tune decision boundaries & probability thresholds for patient heart disease diagnosis</p>
        </div>
        <span class="concept-badge">MLE & Decision Boundary</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Decision Threshold p: <span id="thresh-val">${threshold.toFixed(2)}</span></label>
          <input type="range" id="sig-thresh" min="0.05" max="0.90" step="0.05" value="${threshold}">
        </div>

        <div class="control-item">
          <label>Pre-set Protocols</label>
          <div style="display: flex; gap: 8px;">
            <button id="btn-proto-default" class="btn btn-secondary btn-sm">Default (p = 0.50)</button>
            <button id="btn-proto-cautious" class="btn btn-secondary btn-sm" style="color: var(--accent-amber); border-color: rgba(255,170,0,0.4);">
              Hospital Cautious (p = 0.10)
            </button>
          </div>
        </div>

        <div class="control-item" style="align-self: flex-end;">
          <button id="btn-triage-run" class="btn btn-primary btn-sm">Triage All Patients</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div class="game-viewport" style="height: 380px;">
          <canvas id="sig-canvas" width="700" height="380" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong style="color:var(--accent-cyan);">Boundary BP:</strong> <span id="bp-boundary-val">133.2</span> mmHg</div>
            <div><strong>Detected Disease:</strong> <span id="detected-count">0</span> / 5</div>
            <div><strong>Missed Disease (FN):</strong> <span id="missed-count" style="color:var(--accent-red);">0</span></div>
            <div><strong>False Alarms (FP):</strong> <span id="fp-count" style="color:var(--accent-amber);">0</span></div>
          </div>
        </div>

        <!-- Patients Roster Table -->
        <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; overflow-y: auto; max-height: 380px;">
          <h4 style="font-size: 13px; color: var(--accent-cyan); margin-bottom: 8px;">Patient Roster (Week 2 Slide Data)</h4>
          <table style="width:100%; border-collapse: collapse; font-family: 'Fira Code', monospace; font-size: 11px;">
            <thead>
              <tr style="color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: left;">
                <th style="padding: 4px;">BP</th>
                <th style="padding: 4px;">P(Y=1)</th>
                <th style="padding: 4px;">Actual</th>
                <th style="padding: 4px;">Triage</th>
              </tr>
            </thead>
            <tbody id="patient-table-body"></tbody>
          </table>
        </div>
      </div>

      <div id="triage-feedback" style="min-height: 32px; margin-bottom: 16px;"></div>

      <details class="math-explainer">
        <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p>By default, logistic regression uses threshold p = 0.5 (which corresponds to 133.2 mmHg). However, in high-stakes healthcare scenarios, missing a disease (False Negative) is far more hazardous than an extra blood test (False Positive)! Setting a cautious threshold like p = 0.10 catches patients with BP ≈ 118 mmHg for further screening.</p>
          <div class="formula-block">
            Logistic Model: P(y=1|x; θ) = σ(θᵀx) = 1 / (1 + e^{-(θ₀ + θ₁ x)})<br>
            Negative Log-Likelihood (NLL / Cross Entropy): NLL(θ) = - ∑ [ yᵢ ln f(xᵢ) + (1 - yᵢ) ln(1 - f(xᵢ)) ]
          </div>
        </div>
      </details>
    </div>
  `;

  const canvas = container.querySelector('#sig-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padX = 60, padY = 30;
    const w = canvas.width - padX * 2;
    const h = canvas.height - padY * 2;

    const minBP = 80, maxBP = 180;
    const toScreenX = (bp: number) => padX + ((bp - minBP) / (maxBP - minBP)) * w;
    const toScreenY = (prob: number) => padY + (1 - prob) * h;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0, 0.2, 0.4, 0.6, 0.8, 1.0].forEach(p => {
      ctx.beginPath();
      ctx.moveTo(padX, toScreenY(p));
      ctx.lineTo(padX + w, toScreenY(p));
      ctx.stroke();

      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '10px Fira Code';
      ctx.fillText(p.toFixed(1), padX - 30, toScreenY(p) + 4);
    });

    // BP Ticks
    for (let bp = 90; bp <= 170; bp += 20) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(bp), padY);
      ctx.lineTo(toScreenX(bp), padY + h);
      ctx.stroke();
      ctx.fillText(bp.toString(), toScreenX(bp) - 10, padY + h + 16);
    }

    // Sigmoid Curve (red/coral as in slide 85)
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let bp = minBP; bp <= maxBP; bp += 0.5) {
      const prob = predictProb(bp);
      const sx = toScreenX(bp);
      const sy = toScreenY(prob);
      if (bp === minBP) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Boundary Line where prob = threshold
    // theta0 + theta1 * bp = ln(threshold / (1 - threshold))
    const logit = Math.log(threshold / (1 - threshold));
    const boundaryBP = (logit - theta0) / theta1;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    // Horizontal threshold line
    ctx.beginPath();
    ctx.moveTo(padX, toScreenY(threshold));
    ctx.lineTo(padX + w, toScreenY(threshold));
    ctx.stroke();

    // Vertical boundary line
    if (boundaryBP >= minBP && boundaryBP <= maxBP) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(boundaryBP), padY);
      ctx.lineTo(toScreenX(boundaryBP), padY + h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    (container.querySelector('#bp-boundary-val') as HTMLElement).textContent = boundaryBP.toFixed(1);

    // Plot Clinical Patients
    let fn = 0, fp = 0, tp = 0;
    const tableBody = container.querySelector('#patient-table-body') as HTMLElement;
    let rowsHtml = '';

    clinicalPatients.forEach(p => {
      const prob = predictProb(p.bp);
      const predictedPos = prob >= threshold ? 1 : 0;
      if (p.actual === 1 && predictedPos === 1) tp++;
      if (p.actual === 1 && predictedPos === 0) fn++;
      if (p.actual === 0 && predictedPos === 1) fp++;

      // Draw point on canvas
      const sx = toScreenX(p.bp);
      const sy = toScreenY(p.actual);
      ctx.fillStyle = p.actual === 1 ? '#ff3366' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Table row
      const isCorrect = predictedPos === p.actual;
      rowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
          <td style="padding: 4px;">${p.bp}</td>
          <td style="padding: 4px; color:${prob > 0.5 ? '#ff85be' : '#7dd3fc'};">${prob.toFixed(2)}</td>
          <td style="padding: 4px; font-weight:bold; color:${p.actual ? '#ff3366' : '#00f0ff'};">${p.actual}</td>
          <td style="padding: 4px; color:${isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight:bold;">
            ${predictedPos === 1 ? 'SEND' : 'PASS'} ${isCorrect ? '✓' : '✗'}
          </td>
        </tr>
      `;
    });

    if (tableBody) tableBody.innerHTML = rowsHtml;

    (container.querySelector('#detected-count') as HTMLElement).textContent = tp.toString();
    (container.querySelector('#missed-count') as HTMLElement).textContent = fn.toString();
    (container.querySelector('#fp-count') as HTMLElement).textContent = fp.toString();

    return { tp, fn, fp, boundaryBP };
  }

  draw();

  container.querySelector('#sig-thresh')?.addEventListener('input', (e) => {
    threshold = parseFloat((e.target as HTMLInputElement).value);
    (container.querySelector('#thresh-val') as HTMLElement).textContent = threshold.toFixed(2);
    draw();
  });

  container.querySelector('#btn-proto-default')?.addEventListener('click', () => {
    sound.playClick();
    threshold = 0.5;
    (container.querySelector('#sig-thresh') as HTMLInputElement).value = '0.5';
    (container.querySelector('#thresh-val') as HTMLElement).textContent = '0.50';
    draw();
  });

  container.querySelector('#btn-proto-cautious')?.addEventListener('click', () => {
    sound.playClick();
    threshold = 0.1;
    (container.querySelector('#sig-thresh') as HTMLInputElement).value = '0.1';
    (container.querySelector('#thresh-val') as HTMLElement).textContent = '0.10';
    draw();
  });

  container.querySelector('#btn-triage-run')?.addEventListener('click', () => {
    const { tp, fn, fp, boundaryBP } = draw();
    const fb = container.querySelector('#triage-feedback') as HTMLElement;
    if (fn === 0) {
      sound.playVictory();
      confetti({ particleCount: 50, spread: 60 });
      gameManager.addScore(100, 50);
      gameManager.markGameComplete('week2_logistic');
      fb.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px 16px; color: #a7f3d0;">
          <strong>🛡️ Zero Missed Diseases! (+100 pts)</strong> You set a cautious threshold (BP cut-off: ${boundaryBP.toFixed(1)} mmHg) catching all heart disease cases (FN = 0).
        </div>
      `;
    } else {
      sound.playWrong();
      fb.innerHTML = `
        <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px 16px; color: #fca5a5;">
          <strong>⚠️ High Risk!</strong> You missed ${fn} heart disease patient(s)! In clinical safety, switch to Cautious Protocol (p = 0.10) to eliminate False Negatives.
        </div>
      `;
    }
  });
}
