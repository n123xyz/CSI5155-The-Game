import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek2MulticlassShowdown(container: HTMLElement) {
  let activeStep = 1;
  let strategy = 'softmax'; // 'softmax' | 'ova' | 'ovo'
  let classCountK = 4;

  function render() {
    const ovoClassifiers = (classCountK * (classCountK - 1)) / 2;
    const ovaClassifiers = classCountK;

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>⚔️ Game 2.6: Multi-Class Showdown (Softmax vs OvA vs OvO)</h2>
            <p class="card-subtitle">Visual Intuition: Scaling binary classifiers to K-class boundaries</p>
          </div>
          <span class="concept-badge">Week 2 Multi-Class</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">Strategy Comparison</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Pairwise Scaling</span>
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
          <!-- Step 1: Strategy Battle -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-secondary);">Select multi-class paradigm:</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm ${strategy === 'softmax' ? 'btn-primary' : 'btn-secondary'} strat-btn" data-strat="softmax">
                  ⚡ Softmax (Multinomial)
                </button>
                <button class="btn btn-sm ${strategy === 'ova' ? 'btn-primary' : 'btn-secondary'} strat-btn" data-strat="ova">
                  🛡️ One-vs-All (OvA)
                </button>
                <button class="btn btn-sm ${strategy === 'ovo' ? 'btn-primary' : 'btn-secondary'} strat-btn" data-strat="ovo">
                  ⚔️ One-vs-One (OvO)
                </button>
              </div>
            </div>

            <div style="background: rgba(10, 15, 25, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="font-size: 15px; color: #fff;">
                  ${strategy === 'softmax' ? '1. Softmax Multinomial Logistic Regression' : strategy === 'ova' ? '2. One-vs-All (One-vs-Rest / OvA)' : '3. One-vs-One (Pairwise Duels / OvO)'}
                </h4>
                <span class="concept-badge" style="color: var(--accent-cyan);">
                  ${strategy === 'softmax' ? '1 Joint Model' : strategy === 'ova' ? `${classCountK} Binary Models` : `${ovoClassifiers} Pairwise Models`}
                </span>
              </div>
              
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                ${strategy === 'softmax' ? 
                  'Computes unnormalized logits for all K classes simultaneously, exponentiates them to enforce positivity, and normalizes them so probabilities sum to 1.0.' : 
                  strategy === 'ova' ? 
                  'Trains K separate binary classifiers. Classifier k separates class k against all other (K-1) classes pooled together. Assigns prediction to the classifier with the highest decision margin.' : 
                  'Trains K(K-1)/2 pairwise binary classifiers for every distinct pair (Class i vs Class j). Each classifier casts one vote; majority vote determines the final predicted class.'}
              </div>

              <div class="formula-block">
                ${strategy === 'softmax' ? 
                  'P(y = i | x; θ) = exp(θ_iᵀ x) / ∑_{j=1}^K exp(θ_jᵀ x)' : 
                  strategy === 'ova' ? 
                  'Argmax_{k=1..K} (θ_kᵀ x + b_k)   [K classifiers total]' : 
                  'Argmax_{k} ∑_{j ≠ k} Vote(f_{k,j}(x))   [K(K-1)/2 classifiers total]'}
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: Complexity Scaler -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">📈 Classifier Complexity Scaling: OvA vs OvO</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 18px;">
              Drag the class count slider \\(K\\) to observe how One-vs-One explodes quadratically compared to One-vs-All:
            </p>

            <div class="control-item" style="margin-bottom: 24px;">
              <label>Number of Target Classes (\\(K\\)): <strong style="color: var(--accent-cyan); font-size: 16px;">${classCountK}</strong></label>
              <input type="range" id="k-slider" min="3" max="25" step="1" value="${classCountK}" style="width: 100%;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); padding: 18px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">One-vs-All (OvA)</div>
                <div style="font-size: 32px; font-weight: 900; color: var(--accent-cyan); margin: 8px 0; font-family: 'Fira Code', monospace;">
                  ${ovaClassifiers}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">Linear Growth: \\(O(K)\\)</div>
              </div>

              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.2); padding: 18px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">One-vs-One (OvO)</div>
                <div style="font-size: 32px; font-weight: 900; color: var(--accent-amber); margin: 8px 0; font-family: 'Fira Code', monospace;">
                  ${ovoClassifiers}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">Quadratic Explosion: \\(\\frac{K(K-1)}{2} = O(K^2)\\)</div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Step 3: Interactive Mastery Quiz -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🎯 Quick Mastery Check: ImageNet Scaling</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              If training a dataset with \\(K = 1000\\) visual categories (e.g., ImageNet), why is OvO strictly avoided in favor of Softmax or OvA?
            </p>
            <div class="quiz-options">
              <button class="quiz-option-btn q-opt-mc" data-val="correct">
                <strong>Computational Intractability:</strong> OvO would require training \\(\\frac{1000 \\times 999}{2} = 499,500\\) individual binary classifiers, requiring astronomical memory and evaluation time!
              </button>
              <button class="quiz-option-btn q-opt-mc" data-val="wrong">
                Because OvO cannot compute majority votes when K is an even number.
              </button>
            </div>
            <div id="mc-feedback" style="min-height: 28px; margin-top: 10px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Multi-Class Decision Rules:</strong></p>
            <ul>
              <li><strong>Softmax Log-Loss:</strong> \\(L = -\\sum_{i=1}^K y_i \\ln \\hat{y}_i\\), where \\(\\hat{y}_i = \\frac{e^{z_i}}{\\sum e^{z_j}}\\). Gradient with respect to logit \\(z_i\\) is simply \\((\\hat{y}_i - y_i)\\).</li>
              <li><strong>OvA Imbalance:</strong> In OvA, each binary classifier suffers from an artificial class imbalance ratio of \(1 : (K-1)\), often requiring cost-sensitive adjustment.</li>
            </ul>
          </div>
        </details>
      </div>
    `;

    // Listeners
    container.querySelectorAll('.strat-btn').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        strategy = (b as HTMLElement).dataset.strat || 'softmax';
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

    const kSlider = container.querySelector('#k-slider') as HTMLInputElement;
    kSlider?.addEventListener('input', (e) => {
      classCountK = parseInt((e.target as HTMLInputElement).value);
      render();
    });

    container.querySelectorAll('.q-opt-mc').forEach(b => {
      b.addEventListener('click', () => {
        const val = (b as HTMLElement).dataset.val;
        const fb = container.querySelector('#mc-feedback');
        if (val === 'correct') {
          sound.playVictory();
          confetti({ particleCount: 50, spread: 60 });
          gameManager.addScore(100, 50);
          gameManager.markGameComplete('week2_multiclass');
          if (fb) fb.innerHTML = '<div style="color: var(--accent-green); font-weight: 700;">✓ Correct! OvO requires K(K-1)/2 = 499,500 classifiers, making it completely infeasible for large K.</div>';
        } else {
          sound.playWrong();
          if (fb) fb.innerHTML = '<div style="color: var(--accent-red);">Incorrect. OvO fails on large K due to quadratic computational complexity.</div>';
        }
      });
    });
  }

  render();
}
