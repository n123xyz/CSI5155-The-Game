import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface PatientRecord {
  id: number;
  age: number | null;
  label: 'A' | 'B';
}

const DATA_Q13: PatientRecord[] = [
  { id: 1, age: 20, label: 'A' },
  { id: 2, age: 22, label: 'A' },
  { id: 3, age: null, label: 'A' }, // Missing!
  { id: 4, age: 30, label: 'B' },
  { id: 5, age: 28, label: 'B' },
  { id: 6, age: 32, label: 'B' }
];

export function renderWeek3MissingData(container: HTMLElement) {
  let selectedMode: 'none' | 'global' | 'class_conditional' = 'none';
  let testScenarioAnswer: string | null = null;

  // Known values
  const knownAges = DATA_Q13.filter(d => d.age !== null).map(d => d.age as number);
  const globalSum = knownAges.reduce((a, b) => a + b, 0); // 132
  const globalMean = globalSum / knownAges.length; // 26.4

  const classAAges = DATA_Q13.filter(d => d.label === 'A' && d.age !== null).map(d => d.age as number);
  const classAMean = classAAges.reduce((a, b) => a + b, 0) / classAAges.length; // 21.0

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🕵️ Game 3.3: Missing Data Detective & Leakage Patrol</h2>
            <p class="card-subtitle">Visual Intuition: Bar Chart Imputation & Why Test Set Leakage Fails (Midterm Q13)</p>
          </div>
          <span class="concept-badge">Midterm Question 13 Focus</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Select Imputation Strategy (Training Set)</label>
            <div style="display: flex; gap: 8px;">
              <button id="btn-imp-global" class="btn btn-sm ${selectedMode === 'global' ? 'btn-primary' : 'btn-secondary'}">
                (a) Global Mean Imputation (${globalMean.toFixed(1)})
              </button>
              <button id="btn-imp-class" class="btn btn-sm ${selectedMode === 'class_conditional' ? 'btn-primary' : 'btn-secondary'}">
                (b) Class-Conditional Mean (${classAMean.toFixed(1)})
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive Bar Chart Visualizer -->
        <div class="game-viewport" style="height: 300px; margin-bottom: 20px;">
          <canvas id="impute-canvas" width="800" height="300" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong style="color:var(--accent-cyan);">Blue Bars:</strong> Class A Patients | <strong style="color:#f87171;">Red Bars:</strong> Class B Patients</div>
            <div><strong>ID 3 Status:</strong> <span style="color:${selectedMode === 'none' ? 'var(--accent-amber)' : 'var(--accent-green)'}; font-weight:bold;">
              ${selectedMode === 'none' ? 'MISSING VALUE (?)' : selectedMode === 'global' ? `IMPUTED VIA GLOBAL MEAN = ${globalMean.toFixed(1)}` : `IMPUTED VIA CLASS A MEAN = ${classAMean.toFixed(1)}`}
            </span></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <!-- Dataset Table -->
          <div style="background: rgba(12, 18, 30, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="font-size: 13px; color: var(--accent-cyan); margin-bottom: 10px;">Training Set Table (Midterm Q13)</h4>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Fira Code', monospace; font-size: 12px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                  <th style="padding: 4px;">ID</th>
                  <th style="padding: 4px;">Age</th>
                  <th style="padding: 4px;">Label (Y)</th>
                </tr>
              </thead>
              <tbody>
                ${DATA_Q13.map(r => {
                  const isMissing = r.id === 3;
                  let displayAge = r.age !== null ? r.age.toString() : '?';
                  if (isMissing && selectedMode === 'global') displayAge = `<strong style="color:var(--accent-amber);">${globalMean.toFixed(1)}</strong>`;
                  if (isMissing && selectedMode === 'class_conditional') displayAge = `<strong style="color:var(--accent-green);">${classAMean.toFixed(1)}</strong>`;
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background:${isMissing ? 'rgba(255,170,0,0.1)' : 'transparent'};">
                      <td style="padding: 4px;">${r.id}</td>
                      <td style="padding: 4px;">${displayAge}</td>
                      <td style="padding: 4px; font-weight:bold; color:${r.label === 'A' ? 'var(--accent-cyan)' : '#f87171'};">${r.label}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Live Math Step-by-Step Card -->
          <div style="background: rgba(12, 18, 30, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="font-size: 13px; color: var(--accent-green); margin-bottom: 10px;">Math Step-by-Step Breakdown</h4>
            <div id="impute-math-box" style="font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.8;">
              ${selectedMode === 'none' ? `
                <p style="color: var(--text-muted);">Click an imputation button above to see the calculation!</p>
              ` : selectedMode === 'global' ? `
                <div style="color: #fef08a;">
                  <strong>(a) Global Mean Imputation:</strong><br>
                  Sum of observed ages = 20 + 22 + 30 + 28 + 32 = 132<br>
                  Sample count N = 5<br>
                  Replacement Age = 132 / 5 = <strong>26.4</strong>
                </div>
              ` : `
                <div style="color: #a7f3d0;">
                  <strong>(b) Class-Conditional Mean Imputation:</strong><br>
                  Target ID 3 has Label Y = 'A'<br>
                  Available ages in Class A = {20, 22}<br>
                  Sum = 20 + 22 = 42, Count = 2<br>
                  Replacement Age = 42 / 2 = <strong>21.0</strong>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Part (c) Interactive Visual Quarantine Dilemma -->
        <div style="background: rgba(16, 24, 40, 0.95); border: 2px solid var(--accent-amber); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="color: var(--accent-amber); font-size: 15px;">🚨 Part (c) Midterm Exam Challenge: The Test Set Dilemma</h4>
            <span class="badge-pill" style="border-color:var(--accent-red); color:var(--accent-red);">QUARANTINE ENFORCEMENT</span>
          </div>
          <p style="font-size: 14px; margin-bottom: 14px; color: #f1f5f9;">
            "Suppose instead the missing value appeared in the <strong>test set</strong>. Which imputation method is more appropriate: <em>global mean</em> or <em>class-conditional mean</em>?"
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="btn-ans-global" class="btn btn-secondary ${testScenarioAnswer === 'global' ? 'active' : ''}">
              (1) Global Mean (Training Set Mean)
            </button>
            <button id="btn-ans-class" class="btn btn-secondary ${testScenarioAnswer === 'class' ? 'active' : ''}">
              (2) Class-Conditional Mean
            </button>
          </div>

          <div id="test-dilemma-feedback" style="margin-top: 14px; font-size: 13px;"></div>
        </div>

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>(a) Global Mean:</strong> (20 + 22 + 30 + 28 + 32) / 5 = 132 / 5 = <strong>26.4</strong>.</p>
            <p><strong>(b) Class-Conditional Mean:</strong> Known Class A ages are {20, 22}. Mean is (20 + 22) / 2 = <strong>21.0</strong>.</p>
            <p><strong>(c) Test Set Dilemma:</strong> <strong>Global mean</strong> is more appropriate! At test/inference time, the true label Y is unknown/unseen. We cannot condition on a label we don't have. Doing so would violate the evaluation protocol and cause data leakage.</p>
          </div>
        </details>
    </div>
  `;

    // Draw Bar Chart on Canvas
    const canvas = container.querySelector('#impute-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padX = 60, padY = 40;
      const w = canvas.width - padX * 2;
      const h = canvas.height - padY * 2;
      const maxAge = 40;

      const toScreenY = (age: number) => padY + h - (age / maxAge) * h;
      const toScreenH = (age: number) => (age / maxAge) * h;

      // Base line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, padY + h);
      ctx.lineTo(padX + w, padY + h);
      ctx.stroke();

      const barWidth = 60;
      const spacing = w / DATA_Q13.length;

      DATA_Q13.forEach((pt, idx) => {
        const bx = padX + idx * spacing + (spacing - barWidth) / 2;
        const isMissing = pt.id === 3;
        let ageVal = pt.age;
        if (isMissing) {
          if (selectedMode === 'global') ageVal = globalMean;
          if (selectedMode === 'class_conditional') ageVal = classAMean;
        }

        if (ageVal !== null) {
          const bh = toScreenH(ageVal);
          const by = toScreenY(ageVal);

          if (isMissing) {
            ctx.fillStyle = selectedMode === 'global' ? '#ffaa00' : '#00ff88';
          } else {
            ctx.fillStyle = pt.label === 'A' ? '#00f0ff' : '#ff3366';
          }

          ctx.beginPath();
          ctx.roundRect(bx, by, barWidth, bh, [6, 6, 0, 0]);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Fira Code';
          ctx.fillText(ageVal.toFixed(1), bx + 12, by - 8);
        } else {
          // Empty dashed bar
          ctx.strokeStyle = '#eab308';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, padY + 30, barWidth, h - 30);
          ctx.setLineDash([]);

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 16px Fira Code';
          ctx.fillText('?', bx + 24, padY + h / 2);
        }

        // X Axis labels
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '11px Fira Code';
        ctx.fillText(`ID ${pt.id} (${pt.label})`, bx + 4, padY + h + 20);
      });

      // Draw horizontal reference line if mode selected
      if (selectedMode === 'global') {
        const ly = toScreenY(globalMean);
        ctx.strokeStyle = '#ffaa00';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padX, ly);
        ctx.lineTo(padX + w, ly);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`Global Mean = ${globalMean.toFixed(1)}`, padX + w - 160, ly - 8);
      } else if (selectedMode === 'class_conditional') {
        const lyA = toScreenY(classAMean);
        ctx.strokeStyle = '#00ff88';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padX, lyA);
        ctx.lineTo(padX + spacing * 3, lyA);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Class A Mean = ${classAMean.toFixed(1)}`, padX + 10, lyA - 8);
      }
    }

    container.querySelector('#btn-imp-global')?.addEventListener('click', () => {
      sound.playClick();
      selectedMode = 'global';
      render();
    });

    container.querySelector('#btn-imp-class')?.addEventListener('click', () => {
      sound.playClick();
      selectedMode = 'class_conditional';
      render();
    });

    container.querySelector('#btn-ans-global')?.addEventListener('click', () => {
      sound.playCorrect();
      confetti({ particleCount: 70, spread: 60 });
      testScenarioAnswer = 'global';
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week3_missing');

      const fb = container.querySelector('#test-dilemma-feedback') as HTMLElement;
      if (fb) {
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
            <strong>✓ Correct Assessment! (+150 pts)</strong> Global mean is mandatory because true test labels are unavailable during inference. Class-conditioning on the test set causes illegal data leakage!
          </div>
        `;
      }
    });

    container.querySelector('#btn-ans-class')?.addEventListener('click', () => {
      sound.playWrong();
      testScenarioAnswer = 'class';
      gameManager.resetStreak();

      const fb = container.querySelector('#test-dilemma-feedback') as HTMLElement;
      if (fb) {
        fb.innerHTML = `
          <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 14px; color: #fca5a5;">
            <strong>✗ Data Leakage Alert!</strong> In production deployment, you DO NOT have ground-truth test labels! You cannot compute class-conditional mean on unseen data.
          </div>
        `;
      }
    });
  }

  render();
}
