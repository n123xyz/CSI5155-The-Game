import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderWeek4PipelineLifecycle(container: HTMLElement) {
  let activeStep = 1;
  let quizAnswer: 'a' | 'b' | 'c' | 'd' | null = null;

  function render() {
    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🏭 Game 4.1: ML Pipeline Lifecycle & Leakage Crime Lab</h2>
            <p class="card-subtitle">Visual Intuition: The 10-stage engineering loop and catching Preprocessing vs Temporal vs Group leakage</p>
          </div>
          <span class="concept-badge">Week 4 Lifecycle</span>
        </div>

        <!-- Stepper Component -->
        <div class="stepper-container">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tutorial:</span>
          <div class="step-indicator">
            <button class="step-dot ${activeStep === 1 ? 'active' : activeStep > 1 ? 'done' : ''}" data-step="1">1</button>
            <span style="font-size: 11px; color: var(--text-muted);">10 Pipeline Stages</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''}" data-step="2">2</button>
            <span style="font-size: 11px; color: var(--text-muted);">Leakage Crime Lab</span>
            <div style="width: 20px; height: 1px; background: rgba(255,255,255,0.1);"></div>
            <button class="step-dot ${activeStep === 3 ? 'active' : 'done'}" data-step="3">3</button>
            <span style="font-size: 11px; color: var(--text-muted);">Baselines & SOTA</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-step-prev" class="btn btn-secondary btn-sm" ${activeStep === 1 ? 'disabled style="opacity: 0.4;"' : ''}>◀ Prev</button>
            <button id="btn-step-next" class="btn btn-primary btn-sm" ${activeStep === 3 ? 'disabled style="opacity: 0.4;"' : ''}>Next ▶</button>
          </div>
        </div>

        ${activeStep === 1 ? `
          <!-- Step 1: 10 Pipeline Stages -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🔄 The 10-Stage Industrial Machine Learning Lifecycle</h3>
            
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center; font-size: 11px; margin-bottom: 16px;">
              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">1️⃣</div>
                <strong>Problem Formulation</strong>
              </div>
              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">2️⃣</div>
                <strong>Data Collection</strong>
              </div>
              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">3️⃣</div>
                <strong>Data Labeling</strong>
              </div>
              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">4️⃣</div>
                <strong>Distribution Analysis</strong>
              </div>
              <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--accent-cyan); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">5️⃣</div>
                <strong>Preprocessing & Splits</strong>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center; font-size: 11px; margin-bottom: 16px;">
              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">6️⃣</div>
                <strong>Model Training</strong>
              </div>
              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">7️⃣</div>
                <strong>Model Evaluation</strong>
              </div>
              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">8️⃣</div>
                <strong>Model Deployment</strong>
              </div>
              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">9️⃣</div>
                <strong>Documentation & Cards</strong>
              </div>
              <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid var(--accent-purple); padding: 10px 6px; border-radius: 6px;">
                <div style="font-size: 16px; margin-bottom: 4px;">🔟</div>
                <strong>Monitoring & Feedback</strong>
              </div>
            </div>
          </div>
        ` : activeStep === 2 ? `
          <!-- Step 2: The 3 Crimes of Data Leakage -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">🚨 The 3 Deadly Sins of Data Leakage</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              Information from outside the training set leaks into model parameters, yielding artificially high validation scores that collapse in production:
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(255, 51, 68, 0.05); border: 1px solid rgba(255, 51, 68, 0.3); padding: 16px; border-radius: var(--radius-md);">
                <div style="font-size: 13px; font-weight: 700; color: #fca5a5; margin-bottom: 6px;">1. Preprocessing Leakage</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                  Performing feature scaling (μ, σ), missing imputation, or PCA projection on the whole dataset before splitting!
                </div>
              </div>

              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.3); padding: 16px; border-radius: var(--radius-md);">
                <div style="font-size: 13px; font-weight: 700; color: #fde047; margin-bottom: 6px;">2. Temporal Leakage</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                  Randomly shuffling time-series data! The model trains on future data points to predict past records.
                </div>
              </div>

              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.3); padding: 16px; border-radius: var(--radius-md);">
                <div style="font-size: 13px; font-weight: 700; color: #7dd3fc; margin-bottom: 6px;">3. Group / Entity Leakage</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                  Randomly splitting multiple records from the same entity (e.g., patient hospital visits or software repos) across train and test!
                </div>
              </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.4); border-left: 3px solid var(--accent-red); padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #fca5a5;">
              <strong>Case Study (Code Vulnerability Detection):</strong> Random splitting gave a bogus 45% accuracy by learning time-correlated repo patterns. Proper temporal splitting revealed true performance was only 30%!
            </div>
          </div>
        ` : `
          <!-- Step 3: Baselines & SOTA -->
          <div style="animation: fadeIn 0.3s ease; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 12px;">📊 Baselines: Random & Majority Class</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
              Expected accuracy of a Random Baseline predicting classes based on prior distributions:
            </p>
            <div class="formula-block">
              Expected Random Accuracy = ∑_{c} P(c) · P(predict c) = ∑ P(c)²
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 14px;">
              For a binary dataset with 90% Class 0 and 10% Class 1, the Majority Class Baseline achieves <strong>90% accuracy</strong> with 0 learning! Always evaluate against simple baselines before declaring victory with deep learning!
            </p>

            <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
              <h4 style="font-size: 14px; color: var(--accent-amber); margin-bottom: 8px;">🧠 Pipeline Mastery Check: Random Baseline Calculation</h4>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
                A dataset contains <strong>80% Class 0</strong> and <strong>20% Class 1</strong>. What is the expected accuracy of a <em>Random Baseline</em> that predicts classes according to their prior class probabilities?
              </p>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
                <button id="btn-quiz-a" class="btn btn-sm ${quizAnswer === 'a' ? 'btn-primary' : 'btn-secondary'}">A) 50.0% (Coin Flip)</button>
                <button id="btn-quiz-b" class="btn btn-sm ${quizAnswer === 'b' ? 'btn-primary' : 'btn-secondary'}">B) 68.0% (0.80² + 0.20² = 0.64 + 0.04)</button>
                <button id="btn-quiz-c" class="btn btn-sm ${quizAnswer === 'c' ? 'btn-primary' : 'btn-secondary'}">C) 80.0% (Majority Class)</button>
                <button id="btn-quiz-d" class="btn btn-sm ${quizAnswer === 'd' ? 'btn-primary' : 'btn-secondary'}">D) 20.0% (Minority Class)</button>
              </div>
              <button id="btn-verify-pipeline" class="btn btn-primary" style="width: 100%;">Verify & Certify Pipeline Mastery</button>
            </div>
            <div id="pipeline-feedback" style="margin-top: 12px;"></div>
          </div>
        `}

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Pipeline Integrity Golden Rule:</strong> The test set is a vault. It is opened strictly once at the end of development. All decisions (feature selection, hyperparameter tuning, scaling) must rely exclusively on training and validation partitions.</p>
            <p><strong>Baselines:</strong> Random Baseline accuracy = ∑ P(c)² = 0.8² + 0.2² = 0.64 + 0.04 = 0.68. Majority class baseline = max_c P(c) = 0.80.</p>
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

    container.querySelector('#btn-quiz-a')?.addEventListener('click', () => { sound.playClick(); quizAnswer = 'a'; render(); });
    container.querySelector('#btn-quiz-b')?.addEventListener('click', () => { sound.playClick(); quizAnswer = 'b'; render(); });
    container.querySelector('#btn-quiz-c')?.addEventListener('click', () => { sound.playClick(); quizAnswer = 'c'; render(); });
    container.querySelector('#btn-quiz-d')?.addEventListener('click', () => { sound.playClick(); quizAnswer = 'd'; render(); });

    container.querySelector('#btn-verify-pipeline')?.addEventListener('click', () => {
      const fb = container.querySelector('#pipeline-feedback');
      if (!quizAnswer) {
        sound.playWrong();
        if (fb) fb.innerHTML = `<div style="color: var(--accent-amber); font-size: 13px;">⚠️ Please select an answer before verifying.</div>`;
        return;
      }
      if (quizAnswer === 'b') {
        sound.playVictory();
        confetti({ particleCount: 75, spread: 65 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week4_pipeline');
        if (fb) fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px; color: #a7f3d0;">
            <strong>🎉 Correct! (68%)</strong> Expected accuracy is ∑ P(c)² = 0.8² + 0.2² = 0.64 + 0.04 = 0.68. ML Pipeline Lifecycle Mastered! (+150 Score awarded)
          </div>
        `;
      } else {
        sound.playWrong();
        if (fb) fb.innerHTML = `
          <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px; color: #fca5a5;">
            <strong>❌ Incorrect:</strong> Remember, the expected accuracy for random guessing proportional to priors is ∑ P(c) · P(predict c) = ∑ P(c)². For 80/20, that is 0.80² + 0.20² = 0.68.
          </div>
        `;
      }
    });
  }

  render();
}
