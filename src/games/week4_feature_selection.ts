import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface FeatureItem {
  id: string;
  name: string;
  relevance: number; // 0 to 100
  isCollinear: boolean; // redundant with another
  collinearWith?: string;
  isNoise: boolean;
}

const CANDIDATE_FEATURES: FeatureItem[] = [
  { id: 'f_age', name: 'Age', relevance: 85, isCollinear: false, isNoise: false },
  { id: 'f_dob', name: 'Date of Birth', relevance: 85, isCollinear: true, collinearWith: 'Age', isNoise: false },
  { id: 'f_income', name: 'Income', relevance: 78, isCollinear: false, isNoise: false },
  { id: 'f_bp', name: 'Systolic Blood Pressure', relevance: 92, isCollinear: false, isNoise: false },
  { id: 'f_chol', name: 'Cholesterol Level', relevance: 88, isCollinear: false, isNoise: false },
  { id: 'f_shoe', name: 'Shoe Size', relevance: 5, isCollinear: false, isNoise: true },
  { id: 'f_house_num', name: 'Street House Number', relevance: 2, isCollinear: false, isNoise: true },
  { id: 'f_bmi', name: 'Body Mass Index (BMI)', relevance: 80, isCollinear: false, isNoise: false }
];

export function renderWeek4FeatureSelection(container: HTMLElement) {
  let strategy: 'forward' | 'backward' = 'forward';
  let activeFeatures: Set<string> = new Set();
  let stepCount = 0;

  function initStrategy(newStrat: 'forward' | 'backward') {
    strategy = newStrat;
    stepCount = 0;
    if (strategy === 'forward') {
      activeFeatures = new Set(); // start empty!
    } else {
      activeFeatures = new Set(CANDIDATE_FEATURES.map(f => f.id)); // start full!
    }
    render();
  }

  function evaluateModel() {
    let score = 50;
    const selected = CANDIDATE_FEATURES.filter(f => activeFeatures.has(f.id));
    
    selected.forEach(f => {
      if (f.isNoise) score -= 8; // noise hurts model
      else score += (f.relevance / 10);
    });

    // Collinear penalty: if both Age and Date of Birth selected
    if (activeFeatures.has('f_age') && activeFeatures.has('f_dob')) {
      score -= 15; // Multicollinearity penalty!
    }

    // Overfitting penalty if too many features
    if (selected.length > 5) {
      score -= (selected.length - 5) * 5;
    }

    return Math.max(20, Math.min(98, score));
  }

  function render() {
    const currentScore = evaluateModel();

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🧪 Game 4.2: Feature Selection Tournament</h2>
            <p class="card-subtitle">Master Forward Selection vs Backward Elimination & Dodge Multicollinearity (Midterm Q6)</p>
          </div>
          <span class="concept-badge">Midterm Question 6 Focus</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Selection Strategy (Midterm Q6)</label>
            <div style="display: flex; gap: 8px;">
              <button id="btn-strat-fwd" class="btn btn-sm ${strategy === 'forward' ? 'btn-primary' : 'btn-secondary'}">
                ➡️ Forward Selection (Start Empty, Add Best)
              </button>
              <button id="btn-strat-bwd" class="btn btn-sm ${strategy === 'backward' ? 'btn-primary' : 'btn-secondary'}">
                ⬅️ Backward Elimination (Start Full, Remove Worst)
              </button>
            </div>
          </div>

          <div class="control-item">
            <label>Model Validation Accuracy: <span style="color:var(--accent-green); font-weight:bold;">${currentScore.toFixed(1)}%</span></label>
            <span style="font-size: 11px; color: var(--text-muted);">Active Features: ${activeFeatures.size} / ${CANDIDATE_FEATURES.length}</span>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid-2" style="margin-bottom: 24px;">
          ${CANDIDATE_FEATURES.map(f => {
            const isActive = activeFeatures.has(f.id);
            return `
              <div style="background: rgba(12, 18, 30, 0.85); border: 1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="font-size: 14px; color: #fff; margin-bottom: 2px;">${f.name}</h4>
                  <div style="font-size: 11px; color: var(--text-secondary);">
                    Relevance: ${f.relevance}/100 
                    ${f.isCollinear ? '<span style="color:var(--accent-amber); margin-left:4px;">[Collinear with Age]</span>' : ''}
                    ${f.isNoise ? '<span style="color:var(--accent-red); margin-left:4px;">[Irrelevant Noise]</span>' : ''}
                  </div>
                </div>

                <button class="btn btn-sm btn-feat-toggle ${isActive ? 'btn-primary' : 'btn-secondary'}" data-fid="${f.id}">
                  ${isActive ? '✓ Included' : '+ Add Feature'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 13px; color: var(--text-secondary);">
            Goal: Discover optimal subset without noisy features (Shoe size, House number) or redundant duplicates (Age + DOB)!
          </div>
          <button id="btn-verify-subset" class="btn btn-accent">Verify Optimal Feature Subset</button>
        </div>

        <div id="feat-feedback-box" style="min-height: 24px;"></div>

        <details class="math-explainer">
        <summary>💡 Midterm Practice Question 6 Official Answer (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>Forward Feature Selection:</strong> Starts with an <em>empty set</em> of features. At each step, it trains a model testing each unselected candidate feature, and adds the single feature that produces the <em>largest increase in model performance</em>. Repeats until adding features no longer improves performance.</p>
          <p><strong>Backward Feature Elimination:</strong> Starts with the <em>full set of all features</em>. At each step, it temporarily removes each feature, and eliminates the feature whose removal <em>least decreases (or most improves) model performance</em>. Repeats until all remaining features are strictly essential.</p>
          <p><strong>Why Filter methods fail alone (Slide 102):</strong> Filter ranking looks at features in isolation; once "Age" is included, "Date of Birth" contains identical information, creating multicollinearity without any new predictive value!</p>
        </div>
      </details>
    </div>
  `;

    container.querySelectorAll('.btn-feat-toggle').forEach(b => {
      b.addEventListener('click', () => {
        sound.playClick();
        const fid = (b as HTMLElement).dataset.fid!;
        if (activeFeatures.has(fid)) activeFeatures.delete(fid);
        else activeFeatures.add(fid);
        render();
      });
    });

    container.querySelector('#btn-strat-fwd')?.addEventListener('click', () => {
      sound.playClick();
      initStrategy('forward');
    });

    container.querySelector('#btn-strat-bwd')?.addEventListener('click', () => {
      sound.playClick();
      initStrategy('backward');
    });

    container.querySelector('#btn-verify-subset')?.addEventListener('click', () => {
      const cur = evaluateModel();
      const fb = container.querySelector('#feat-feedback-box') as HTMLElement;
      const hasBothAgeDob = activeFeatures.has('f_age') && activeFeatures.has('f_dob');
      const hasNoise = activeFeatures.has('f_shoe') || activeFeatures.has('f_house_num');

      if (cur >= 88 && !hasBothAgeDob && !hasNoise) {
        sound.playVictory();
        confetti({ particleCount: 70, spread: 65 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week4_feat_sel');
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
            <strong>🎉 Outstanding Feature Selection (${cur.toFixed(1)}% Accuracy)!</strong> You purged noise (Shoe size, House number) and eliminated collinear redundancy (kept only Age, dropped Date of Birth)!
          </div>
        `;
      } else {
        sound.playWrong();
        let issues = [];
        if (hasBothAgeDob) issues.push('Both Age and Date of Birth are included (Multicollinearity!)');
        if (hasNoise) issues.push('Noisy features (Shoe size or House number) are polluting the model');
        fb.innerHTML = `
          <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 14px; color: #fca5a5;">
            <strong>Suboptimal Subset (${cur.toFixed(1)}%):</strong> ${issues.join('. ')}. Refine your features!
          </div>
        `;
      }
    });
  }

  initStrategy('forward');
}
