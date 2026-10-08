import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  cls: 'majority' | 'minority' | 'synthetic';
}

export function renderWeek3ClassImbalance(container: HTMLElement) {
  let mode: 'raw' | 'random_under' | 'near_miss' | 'smote' = 'raw';

  // Base raw dataset: 50 majority points (blue), 6 minority points (red)
  const baseMajority: DataPoint[] = [];
  for (let i = 0; i < 45; i++) {
    baseMajority.push({
      id: `maj_${i}`,
      x: 0.15 + (Math.random() * 0.45),
      y: 0.2 + (Math.random() * 0.6),
      cls: 'majority'
    });
  }

  const baseMinority: DataPoint[] = [
    { id: 'min_0', x: 0.72, y: 0.40, cls: 'minority' },
    { id: 'min_1', x: 0.78, y: 0.55, cls: 'minority' },
    { id: 'min_2', x: 0.75, y: 0.70, cls: 'minority' },
    { id: 'min_3', x: 0.85, y: 0.45, cls: 'minority' },
    { id: 'min_4', x: 0.82, y: 0.62, cls: 'minority' },
    { id: 'min_5', x: 0.88, y: 0.68, cls: 'minority' },
  ];

  function getProcessedData() {
    let pts: DataPoint[] = [];
    if (mode === 'raw') {
      pts = [...baseMajority, ...baseMinority];
    } else if (mode === 'random_under') {
      // Randomly keep 8 majority points
      const kept = baseMajority.slice(0, 8);
      pts = [...kept, ...baseMinority];
    } else if (mode === 'near_miss') {
      // Near miss: keep majority points closest to minority cluster
      const sortedByDist = [...baseMajority].sort((a, b) => {
        const distA = Math.min(...baseMinority.map(m => Math.hypot(m.x - a.x, m.y - a.y)));
        const distB = Math.min(...baseMinority.map(m => Math.hypot(m.x - b.x, m.y - b.y)));
        return distA - distB;
      });
      const nearKept = sortedByDist.slice(0, 8);
      pts = [...nearKept, ...baseMinority];
    } else if (mode === 'smote') {
      // Synthesize new points between minority neighbors
      const synthetic: DataPoint[] = [];
      for (let i = 0; i < baseMinority.length; i++) {
        for (let j = i + 1; j < baseMinority.length; j++) {
          const m1 = baseMinority[i];
          const m2 = baseMinority[j];
          const interp = 0.5;
          synthetic.push({
            id: `syn_${i}_${j}`,
            x: m1.x + (m2.x - m1.x) * interp,
            y: m1.y + (m2.y - m1.y) * interp,
            cls: 'synthetic'
          });
        }
      }
      pts = [...baseMajority, ...baseMinority, ...synthetic.slice(0, 15)];
    }
    return pts;
  }

  function render() {
    const pts = getProcessedData();
    const majCount = pts.filter(p => p.cls === 'majority').length;
    const minCount = pts.filter(p => p.cls === 'minority' || p.cls === 'synthetic').length;

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>⚖️ Game 3.4: The Class Balancer (SMOTE vs Near-Miss)</h2>
            <p class="card-subtitle">Balance Severely Imbalanced Datasets & Master Sampling Drawbacks (Midterm Q10)</p>
          </div>
          <span class="concept-badge">Midterm Question 10 Focus</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Balancing Strategy</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button id="btn-mode-raw" class="btn btn-sm ${mode === 'raw' ? 'btn-primary' : 'btn-secondary'}">1. Raw Imbalanced (45 vs 6)</button>
              <button id="btn-mode-rand" class="btn btn-sm ${mode === 'random_under' ? 'btn-primary' : 'btn-secondary'}">2. Random Undersample</button>
              <button id="btn-mode-near" class="btn btn-sm ${mode === 'near_miss' ? 'btn-primary' : 'btn-secondary'}">3. Near-Miss Undersample</button>
              <button id="btn-mode-smote" class="btn btn-sm ${mode === 'smote' ? 'btn-primary' : 'btn-secondary'}">4. SMOTE (Oversampling)</button>
            </div>
          </div>
        </div>

        <div class="game-viewport" style="height: 380px; margin-bottom: 20px;">
          <canvas id="imbalance-canvas" width="750" height="380" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <div><strong style="color:var(--accent-cyan);">Majority Class (Blue):</strong> ${majCount} points</div>
            <div><strong style="color:#f87171;">Minority Class (Red):</strong> ${minCount} points ${mode === 'smote' ? '(Includes SMOTE synthetic)' : ''}</div>
            <div><strong>Active Mode:</strong> <span style="text-transform:uppercase; color:var(--accent-amber);">${mode.replace('_', ' ')}</span></div>
          </div>
        </div>

        <!-- Strategy Drawback Analysis Cards -->
        <div class="grid-2" style="margin-bottom: 20px;">
          <div style="background: rgba(14, 22, 36, 0.85); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 18px;">
            <h4 style="color: var(--accent-cyan); font-size: 14px; margin-bottom: 8px;">🔻 Undersampling Analysis</h4>
            <p style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
              <strong>Description:</strong> Reduces the majority class to balance class counts.<br>
              <strong>Key Drawback (Midterm Q10):</strong> <span style="color: #fca5a5;">Information Loss!</span> Discarding vast amounts of data can discard critical majority patterns and introduce bias if the remaining sample doesn't represent the full distribution.
            </p>
          </div>

          <div style="background: rgba(14, 22, 36, 0.85); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: var(--radius-md); padding: 18px;">
            <h4 style="color: var(--accent-amber); font-size: 14px; margin-bottom: 8px;">🔺 Oversampling (SMOTE) Analysis</h4>
            <p style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
              <strong>Description:</strong> Synthesizes minority samples by interpolating between k-nearest minority neighbors.<br>
              <strong>Key Drawback (Midterm Q10):</strong> <span style="color: #fca5a5;">Synthetic Noise!</span> Artificial instances may bridge across class boundaries, not accurately represent the real-world data distribution, or induce overfitting.
            </p>
          </div>
        </div>

        <div style="text-align: right;">
          <button id="btn-master-imbalance" class="btn btn-primary">Verify Exam Question 10 Mastery</button>
        </div>

        <div id="imbalance-feedback" style="min-height: 24px; margin-top: 14px;"></div>

        <details class="math-explainer">
        <summary>💡 Midterm Practice Question 10 Official Answer (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>Undersampling:</strong> Artificially balances data by reducing instances from the majority class. <em>Key Drawback:</em> Loss of potentially valuable information/data, and risk of introducing bias if the retained majority points fail to represent the true data distribution.</p>
          <p><strong>Oversampling:</strong> Balances data by duplicating or generating synthetic instances (e.g. SMOTE interpolation) from the minority class. <em>Key Drawback:</em> Can cause overfitting, and synthetic samples may not reflect true underlying distribution patterns.</p>
          <p><strong>Rule (Slide 125):</strong> Always apply sampling to the <strong>training set only</strong>! Keep the test set at its natural class distribution to reflect true deployment conditions.</p>
        </div>
      </details>
    </div>
  `;

    // Draw canvas
    const canvas = container.querySelector('#imbalance-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pad = 40;
      const w = canvas.width - pad * 2;
      const h = canvas.height - pad * 2;
      const toSx = (x: number) => pad + x * w;
      const toSy = (y: number) => pad + (1 - y) * h;

      // Draw SMOTE interpolation lines if in SMOTE mode
      if (mode === 'smote') {
        ctx.strokeStyle = 'rgba(255, 42, 133, 0.25)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < baseMinority.length; i++) {
          for (let j = i + 1; j < baseMinority.length; j++) {
            ctx.beginPath();
            ctx.moveTo(toSx(baseMinority[i].x), toSy(baseMinority[i].y));
            ctx.lineTo(toSx(baseMinority[j].x), toSy(baseMinority[j].y));
            ctx.stroke();
          }
        }
      }

      // Draw points
      pts.forEach(p => {
        const sx = toSx(p.x);
        const sy = toSy(p.y);
        ctx.beginPath();
        if (p.cls === 'majority') {
          ctx.fillStyle = '#00f0ff';
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        } else if (p.cls === 'minority') {
          ctx.fillStyle = '#ff3366';
          ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        } else {
          // Synthetic
          ctx.fillStyle = '#ffaa00';
          ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    container.querySelector('#btn-mode-raw')?.addEventListener('click', () => { sound.playClick(); mode = 'raw'; render(); });
    container.querySelector('#btn-mode-rand')?.addEventListener('click', () => { sound.playClick(); mode = 'random_under'; render(); });
    container.querySelector('#btn-mode-near')?.addEventListener('click', () => { sound.playClick(); mode = 'near_miss'; render(); });
    container.querySelector('#btn-mode-smote')?.addEventListener('click', () => { sound.playClick(); mode = 'smote'; render(); });

    container.querySelector('#btn-master-imbalance')?.addEventListener('click', () => {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 60 });
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week3_imbalance');
      const fb = container.querySelector('#imbalance-feedback') as HTMLElement;
      if (fb) {
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
            <strong>✓ Question 10 Mastered!</strong> You clearly comprehend undersampling (information loss), oversampling (synthetic distribution mismatch), and the golden rule of never resampling test sets!
          </div>
        `;
      }
    });
  }

  render();
}
