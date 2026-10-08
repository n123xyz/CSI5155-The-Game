import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

interface Scenario {
  title: string;
  context: string;
  optionsE: string[];
  optionsT: string[];
  optionsP: string[];
  correctE: number;
  correctT: number;
  correctP: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Autonomous Drone Obstacle Navigation',
    context: 'A quadcopter learns to navigate through dense forest corridors without crashing.',
    optionsE: [
      '10,000 flight simulation hours recording sensor telemetry and collision incidents',
      'The raw weight of the drone in kilograms',
      'A set of hardcoded if-else statements'
    ],
    optionsT: [
      'Flying safely through tree obstacles to target coordinates',
      'Charging the lithium polymer battery pack',
      'Displaying real-time video to the remote controller'
    ],
    optionsP: [
      'Percentage of successful obstacle-free flights completed',
      'The purchase price of the propellers',
      'The speed of light in vacuum'
    ],
    correctE: 0,
    correctT: 0,
    correctP: 0,
    explanation: 'Experience E = flight logs & collisions; Task T = navigating safely; Performance P = obstacle-free flight success rate.'
  },
  {
    title: 'Clinical Speech Analysis (Prof. Katie Fraser Research)',
    context: 'Detecting early cognitive decline (Alzheimer’s) from conversational speech patterns.',
    optionsE: [
      'A clinical corpus of speech recordings labeled with diagnostic test scores',
      'Microphone hardware frequency specifications',
      'An English grammar textbook'
    ],
    optionsT: [
      'Classifying patient speech as Healthy vs Cognitive Impairment',
      'Transcribing speech to subtitles',
      'Measuring the loudness of patient laughter'
    ],
    optionsP: [
      'Diagnostic Sensitivity, Specificity, and F1-Score',
      'Number of words spoken per minute',
      'Volume in decibels'
    ],
    correctE: 0,
    correctT: 0,
    correctP: 0,
    explanation: 'Experience E = labeled patient speech recordings; Task T = diagnosing cognitive impairment; Performance P = diagnostic accuracy/F1-score.'
  }
];

export function renderWeek1MitchellBuilder(container: HTMLElement) {
  let scenarioIdx = 0;
  let selE: number | null = null;
  let selT: number | null = null;
  let selP: number | null = null;

  function render() {
    if (scenarioIdx >= SCENARIOS.length) {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 60 });
      gameManager.markGameComplete('week1_mitchell');
      container.innerHTML = `
        <div class="game-card">
          <h2>🏆 Mitchell's ML Architect Mastered!</h2>
          <p style="margin: 16px 0; color: var(--text-secondary);">You understand Tom Mitchell's foundational definition: <em>Experience E, Task T, Performance P</em>.</p>
          <button id="btn-restart-mitchell" class="btn btn-primary">Try Scenarios Again</button>
        </div>
      `;
      container.querySelector('#btn-restart-mitchell')?.addEventListener('click', () => {
        scenarioIdx = 0;
        render();
      });
      return;
    }

    const s = SCENARIOS[scenarioIdx];

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🧩 Game 1.2: Mitchell's Mission Control</h2>
            <p class="card-subtitle">Formulate the Machine Learning definition: Experience (E), Task (T), and Performance (P)</p>
          </div>
          <span class="concept-badge">Scenario ${scenarioIdx + 1} / ${SCENARIOS.length}</span>
        </div>

        <div style="background: rgba(12, 18, 30, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-cyan); font-size: 18px; margin-bottom: 6px;">${s.title}</h3>
          <p style="font-size: 14px; color: var(--text-secondary);">${s.context}</p>
        </div>

        <div class="grid-3" style="margin-bottom: 24px;">
          <!-- Column E -->
          <div style="background: rgba(16, 24, 40, 0.6); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="color: var(--accent-cyan); font-size: 14px; margin-bottom: 12px;">1. Experience (E)</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${s.optionsE.map((opt, i) => `
                <button class="btn btn-secondary opt-btn-e ${selE === i ? 'active' : ''}" data-idx="${i}" style="text-align: left; font-size: 12px; padding: 10px; border-radius: 8px; justify-content: flex-start;">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Column T -->
          <div style="background: rgba(16, 24, 40, 0.6); border: 1px solid rgba(157, 78, 221, 0.3); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="color: #c084fc; font-size: 14px; margin-bottom: 12px;">2. Task (T)</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${s.optionsT.map((opt, i) => `
                <button class="btn btn-secondary opt-btn-t ${selT === i ? 'active' : ''}" data-idx="${i}" style="text-align: left; font-size: 12px; padding: 10px; border-radius: 8px; justify-content: flex-start;">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Column P -->
          <div style="background: rgba(16, 24, 40, 0.6); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="color: var(--accent-green); font-size: 14px; margin-bottom: 12px;">3. Performance (P)</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${s.optionsP.map((opt, i) => `
                <button class="btn btn-secondary opt-btn-p ${selP === i ? 'active' : ''}" data-idx="${i}" style="text-align: left; font-size: 12px; padding: 10px; border-radius: 8px; justify-content: flex-start;">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div id="mitchell-feedback" style="min-height: 40px; margin-bottom: 16px;"></div>

        <div style="display: flex; justify-content: flex-end;">
          <button id="btn-verify-mitchell" class="btn btn-primary" ${selE !== null && selT !== null && selP !== null ? '' : 'disabled'}>
            Verify ML Architecture
          </button>
        </div>

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <h4>📖 Tom Mitchell’s Formal Definition (1997)</h4>
            <div class="formula-block">
              "A computer program learns from experience E with respect to task T and performance measure P, if its performance on T, measured by P, improves with experience E."
            </div>
          </div>
        </details>
      </div>
    `;

    container.querySelectorAll('.opt-btn-e').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        selE = parseInt((btn as HTMLElement).dataset.idx || '0');
        render();
      });
    });

    container.querySelectorAll('.opt-btn-t').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        selT = parseInt((btn as HTMLElement).dataset.idx || '0');
        render();
      });
    });

    container.querySelectorAll('.opt-btn-p').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        selP = parseInt((btn as HTMLElement).dataset.idx || '0');
        render();
      });
    });

    container.querySelector('#btn-verify-mitchell')?.addEventListener('click', () => {
      const feedback = container.querySelector('#mitchell-feedback') as HTMLElement;
      if (selE === s.correctE && selT === s.correctT && selP === s.correctP) {
        sound.playCorrect();
        gameManager.addScore(100, 50);
        feedback.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px 16px; color: #a7f3d0;">
            <strong>✓ Correct Architecture! (+100 pts)</strong> ${s.explanation}
          </div>
        `;
        setTimeout(() => {
          scenarioIdx++;
          selE = null; selT = null; selP = null;
          render();
        }, 1500);
      } else {
        sound.playWrong();
        feedback.innerHTML = `
          <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px 16px; color: #fca5a5;">
            <strong>✗ Not quite!</strong> Review the definitions of Experience E (data), Task T (action), and Performance P (metric).
          </div>
        `;
      }
    });
  }

  render();
}
