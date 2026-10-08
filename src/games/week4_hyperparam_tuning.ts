import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek4HyperparamTuning(container: HTMLElement) {
  let activeStep = 1;
  let mode = 'grid'; // 'grid' | 'random'
  let budget = 16; // 16 evaluations

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🏎️ Game 4.6: Hyperparameter Tuning Race (Grid vs Random Search)</h2>
            <p class="card-subtitle">Visual Intuition: Why Random Search beats Grid Search, and K-Fold vs Leave-One-Out CV</p>
          </div>
          <span class="concept-badge">Week 4 Optimization</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Search Space Race</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">K-Fold vs LOO-CV</span>
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
          <!-- Step 1: Grid vs Random Search Visualizer -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-secondary);">Select hyperparameter sampling method:</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm ${mode === 'grid' ? 'btn-primary' : 'btn-secondary'} mode-btn" data-mode="grid">
                  📊 Grid Search (4 × 4 = 16 trials)
                </button>
                <button class="btn btn-sm ${mode === 'random' ? 'btn-primary' : 'btn-secondary'} mode-btn" data-mode="random">
                  🎲 Random Search (16 random trials)
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 16px;">
              <div class="game-viewport" style="height: 300px;">
                <canvas id="tuning-canvas" width="600" height="300" style="width: 100%; height: 100%;"></canvas>
                <div class="viewport-overlay" style="left: auto; right: 14px; top: 14px; font-size: 11.5px;">
                  Strategy: <strong style="color: ${mode === 'grid' ? 'var(--accent-cyan)' : '#c084fc'};">${mode === 'grid' ? 'Grid Search (16 Trials)' : 'Random Search (16 Trials)'}</strong>
                </div>
              </div>

              <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 13px; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 8px;">
                    ${mode === 'grid' ? 'Grid Search Redundancy' : 'Random Search Efficiency'}
                  </h4>
                  <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                    ${mode === 'grid' ? 
                      'Grid Search tests only 4 distinct values along the critical Learning Rate axis (repeating each 4 times for the uninfluential second parameter). 75% of evaluations are wasted!' : 
                      'Random Search tests 16 completely distinct values along the critical Learning Rate axis! Much higher probability of discovering the optimal global basin!'}
                  </p>
                </div>

                <div style="background: rgba(0, 240, 255, 0.08); border-left: 3px solid var(--accent-cyan); padding: 10px; border-radius: 4px; font-size: 11.5px; color: #7dd3fc;">
                  💡 <strong>Bergstra & Bengio (2012):</strong> Random Search significantly outperforms Grid Search because real ML problems usually have low effective dimensionality!
                </div>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: K-Fold vs LOO-CV -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🔄 Cross-Validation Paradigms: K-Fold vs LOO-CV</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); padding: 16px; border-radius: var(--radius-md);">
                <h4 style="color: var(--accent-cyan); font-size: 13px; margin-bottom: 6px;">K-Fold Cross-Validation (e.g. K = 5)</h4>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                  • Partitions training dataset into K equal subsets (folds).<br>
                  • Iteratively trains on K-1 folds and validates on the remaining 1 fold.<br>
                  • Fast, scalable, variance-reducing estimate of generalization.
                </div>
              </div>

              <div style="background: rgba(157, 78, 221, 0.05); border: 1px solid rgba(157, 78, 221, 0.2); padding: 16px; border-radius: var(--radius-md);">
                <h4 style="color: #c084fc; font-size: 13px; margin-bottom: 6px;">Leave-One-Out (LOO) CV (K = N)</h4>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                  • Extreme form of K-fold where each fold is a single sample point.<br>
                  • Trains N separate models on N-1 samples.<br>
                  • Unbiased but computationally expensive for large datasets ($O(N)$ training runs).
                </div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Step 3: Mastery Quiz -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">🧠 Concept Mastery: Tuning Strategy</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
              Under a fixed computational budget of 64 training iterations, why is Random Search preferred over Grid Search for tuning neural networks?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-tune" data-val="correct">
                <strong>Higher Dimensional Efficiency:</strong> Not all hyperparameters are equally important; Random Search explores 64 unique values for every parameter rather than wasting trials repeating a coarse grid!
              </button>
              <button class="quiz-option-btn q-opt-tune" data-val="wrong">
                Because Grid Search is incapable of exploring continuous hyperparameters.
              </button>
            </div>
            <div id="tune-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Cross-Validation Expectation:</strong></p>
            <div class="formula-block">
              CV_Score = (1/K) ∑_{k=1}^K Loss(Model_{(-k)}, Fold_k)
            </div>
          </div>
        </details>
      </div>
    `;

    // Draw canvas in step 1
    if (activeStep === 1) {
      const canvas = container.querySelector('#tuning-canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padLeft = 65, padRight = 35, padTop = 35, padBottom = 45;
        const w = canvas.width - padLeft - padRight;
        const h = canvas.height - padTop - padBottom;

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft, padTop + h);
        ctx.lineTo(padLeft + w, padTop + h);
        ctx.stroke();

        // X-axis label (centered beneath)
        ctx.textAlign = 'center';
        ctx.font = '11px "Fira Code", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Important Parameter (e.g. Learning Rate α) →', padLeft + w / 2, padTop + h + 30);

        // Y-axis label (cleanly rotated along the left margin)
        ctx.save();
        ctx.translate(22, padTop + h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '11px "Fira Code", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Unimportant Parameter (Batch Seed) →', 0, 0);
        ctx.restore();

        if (mode === 'grid') {
          // 4x4 Grid points
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              const px = padLeft + (i / 3) * w;
              const py = padTop + (j / 3) * h;
              ctx.fillStyle = '#00f0ff';
              ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
            }
          }
        } else {
          // 16 pseudo-random points with good spread
          const seeds = [
            [0.12, 0.88], [0.24, 0.35], [0.38, 0.65], [0.52, 0.15],
            [0.67, 0.78], [0.81, 0.42], [0.93, 0.92], [0.05, 0.50],
            [0.45, 0.25], [0.75, 0.12], [0.31, 0.95], [0.58, 0.48],
            [0.88, 0.70], [0.18, 0.08], [0.63, 0.31], [0.98, 0.22]
          ];
          seeds.forEach(([rx, ry]) => {
            const px = padLeft + rx * w;
            const py = padTop + ry * h;
            ctx.fillStyle = '#c084fc';
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
          });
        }
      }
    }

    // Attach listeners
    container.querySelectorAll('.mode-btn').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        mode = (b as HTMLElement).dataset.mode || 'grid';
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

    container.querySelectorAll('.q-opt-tune').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#tune-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week4_hyperparam');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! Random Search evaluates distinct values along critical dimensions without wasting trials!</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. Random Search works on continuous spaces and outperforms Grid Search on real problems.</div>';
        }
      });
    });
  }

  render();
}
