import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface LeakageScenario {
  id: string;
  actionTitle: string;
  description: string;
  isLeakage: boolean;
  explanation: string;
}

const LEAKAGE_SCENARIOS: LeakageScenario[] = [
  {
    id: 'l1',
    actionTitle: 'Global Normalization Before Splitting',
    description: 'Computing min and max across all 10,000 samples to scale features to [0, 1], then dividing into Train/Test.',
    isLeakage: true,
    explanation: 'SEVERE LEAKAGE: Test set distribution statistics (min/max) contaminated the training preprocessing! Always fit scaler on Train only.'
  },
  {
    id: 'l2',
    actionTitle: 'Hyperparameter Tuning on Validation Set',
    description: 'Training 5 different models on the Training set, evaluating on the Validation set, and choosing the best learning rate α.',
    isLeakage: false,
    explanation: 'BEST PRACTICE: The validation set is specifically intended for hyperparameter tuning and model selection!'
  },
  {
    id: 'l3',
    actionTitle: 'SMOTE Oversampling Before Splitting',
    description: 'Applying SMOTE to balance the entire raw dataset before performing an 80/20 train/test split.',
    isLeakage: true,
    explanation: 'SEVERE LEAKAGE: Synthetic clones formed from test points are placed into the training set, artificially inflating test accuracy!'
  },
  {
    id: 'l4',
    actionTitle: 'Fitting Parameters θ on Training Set Only',
    description: 'Running gradient descent updates exclusively using loss computed on the training set.',
    isLeakage: false,
    explanation: 'CORRECT: The training set is exclusively where model parameters are optimized.'
  },
  {
    id: 'l5',
    actionTitle: 'Selecting Features Using Test Set Correlations',
    description: 'Finding features with highest correlation to labels on the test set, then training on those features.',
    isLeakage: true,
    explanation: 'SEVERE LEAKAGE (Slide 100): Feature selection must strictly occur on Train/Validation, never on the test set!'
  }
];

export function renderWeek4SplitLeakage(container: HTMLElement) {
  let activeScenarioIdx = 0;
  let correctCount = 0;

  function render() {
    if (activeScenarioIdx >= LEAKAGE_SCENARIOS.length) {
      const passed = correctCount >= 4;
      if (passed) {
        sound.playVictory();
        confetti({ particleCount: 75, spread: 65 });
        gameManager.markGameComplete('week4_split');
        container.innerHTML = `
          <div class="game-card">
            <h2>🏆 Data Partition & Leakage Protocol Mastered!</h2>
            <p style="margin: 16px 0; color: #a7f3d0;">Outstanding! You scored <strong>${correctCount} / ${LEAKAGE_SCENARIOS.length}</strong> on data leakage defense! You are fully prepped for <strong>Midterm Question 9</strong>.</p>
            <button id="btn-replay-split" class="btn btn-primary">Replay Protocol Audit</button>
          </div>
        `;
      } else {
        sound.playWrong();
        container.innerHTML = `
          <div class="game-card">
            <h2 style="color: var(--accent-amber);">⚠️ Protocol Audit Incomplete</h2>
            <p style="margin: 16px 0; color: #fca5a5;">You scored <strong>${correctCount} / ${LEAKAGE_SCENARIOS.length}</strong>. A minimum of <strong>4 / 5</strong> correct audits is required to earn the Leakage Defense badge.</p>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Remember: Test data must never inform scaling, feature selection, or SMOTE synthesis!</p>
            <button id="btn-replay-split" class="btn btn-primary">Retry Gauntlet</button>
          </div>
        `;
      }
      container.querySelector('#btn-replay-split')?.addEventListener('click', () => {
        activeScenarioIdx = 0;
        correctCount = 0;
        render();
      });
      return;
    }

    const cur = LEAKAGE_SCENARIOS[activeScenarioIdx];

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🛡️ Game 4.3: The 3-Way Partition & Leakage Gauntlet</h2>
            <p class="card-subtitle">Train vs Validation vs Test Partitions & Defeating Data Leakage Traps (Midterm Q9)</p>
          </div>
          <span class="concept-badge">Scenario ${activeScenarioIdx + 1} / ${LEAKAGE_SCENARIOS.length}</span>
        </div>

        <!-- 3-Way Partition Reference Card -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px;">
          <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 14px;">
            <strong style="color: var(--accent-cyan); font-size: 14px;">1. Training Set</strong>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
              <strong>Purpose:</strong> Fit model parameters / weights θ, learn decision boundaries.
            </p>
          </div>

          <div style="background: rgba(157, 78, 221, 0.08); border: 1px solid rgba(157, 78, 221, 0.3); border-radius: var(--radius-md); padding: 14px;">
            <strong style="color: #c084fc; font-size: 14px;">2. Validation Set</strong>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
              <strong>Purpose:</strong> Tune hyperparameters (α, λ, k, C), select model architectures, early stopping.
            </p>
          </div>

          <div style="background: rgba(0, 255, 136, 0.08); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: var(--radius-md); padding: 14px;">
            <strong style="color: var(--accent-green); font-size: 14px;">3. Test Set</strong>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
              <strong>Purpose:</strong> Unbiased final evaluation of true generalization error on held-out data.
            </p>
          </div>
        </div>

        <!-- Pipeline Scenario Inspection Box -->
        <div style="background: rgba(10, 16, 28, 0.9); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-amber); letter-spacing: 1.5px; margin-bottom: 6px;">Audit In Progress</div>
          <h3 style="font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">${cur.actionTitle}</h3>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${cur.description}</p>
        </div>

        <div id="split-feedback-box" style="min-height: 40px; margin-bottom: 16px;"></div>

        <!-- Choice Buttons -->
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button id="btn-detect-valid" class="btn btn-secondary" style="border-color: var(--accent-green); color: #a7f3d0; padding: 14px 28px;">
            ✓ Valid ML Protocol (No Leakage)
          </button>
          <button id="btn-detect-leak" class="btn btn-secondary" style="border-color: var(--accent-red); color: #fca5a5; padding: 14px 28px;">
            ⚠️ DATA LEAKAGE DETECTED!
          </button>
        </div>

        <details class="math-explainer">
        <summary>💡 Midterm Practice Question 9 Official Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>1. Training Subset:</strong> Used directly to optimize parameters θ (e.g., weights in regression/neural networks, splits in trees).</p>
          <p><strong>2. Validation Subset:</strong> Used to assess model performance across different hyperparameter settings (regularization strength λ, learning rate α, polynomial order M, depth) and select the optimal model without peeking at the test set.</p>
          <p><strong>3. Test Subset:</strong> A completely held-out, untouched set used strictly once at the very end to provide an unbiased estimate of the chosen model's generalization performance on unseen real-world data.</p>
        </div>
      </details>
    </div>
  `;

    function handleAudit(userSaidLeakage: boolean) {
      const isCorrect = userSaidLeakage === cur.isLeakage;
      const fb = container.querySelector('#split-feedback-box') as HTMLElement;
      if (isCorrect) {
        sound.playCorrect();
        correctCount++;
        gameManager.addScore(80, 40);
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px 16px; color: #a7f3d0;">
            <strong>✓ Correct Assessment! (+80 pts)</strong> ${cur.explanation}
          </div>
        `;
      } else {
        sound.playWrong();
        fb.innerHTML = `
          <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px 16px; color: #fca5a5;">
            <strong>✗ Incorrect Assessment!</strong> ${cur.explanation}
          </div>
        `;
      }

      (container.querySelector('#btn-detect-valid') as HTMLButtonElement).disabled = true;
      (container.querySelector('#btn-detect-leak') as HTMLButtonElement).disabled = true;

      setTimeout(() => {
        activeScenarioIdx++;
        render();
      }, 1600);
    }

    container.querySelector('#btn-detect-valid')?.addEventListener('click', () => handleAudit(false));
    container.querySelector('#btn-detect-leak')?.addEventListener('click', () => handleAudit(true));
  }

  render();
}
