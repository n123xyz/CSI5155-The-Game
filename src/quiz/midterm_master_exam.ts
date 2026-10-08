import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

export function renderMidtermMasterExam(container: HTMLElement) {
  // State for each question
  const userAnswers: Record<string, any> = {
    // Q1: Supervised vs Unsupervised
    q1_1: null, // 'S' | 'U'
    q1_2: null,
    q1_3: null,
    q1_4: null,

    // Q2: Batch GD vs SGD
    q2: null,

    // Q3: Parametric vs Non-parametric
    q3_def: null,
    q3_dt: null,
    q3_lr: null,

    // Q4: L1 vs L2 Regularization
    q4: null,

    // Q5: Dimensionality reduction PCA
    q5_reasons: [] as string[],

    // Q6: Forward vs Backward Feature Selection
    q6: null,

    // Q7: SVM Kernel Trick
    q7: null,

    // Q8: Decision Tree Overfitting & Pruning
    q8: null,

    // Q9: Train / Val / Test sets
    q9_train: null,
    q9_val: null,
    q9_test: null,

    // Q10: Class Imbalance & Drawbacks
    q10: null,

    // Q11: High Bias Ensemble
    q11_choice: null,
    q11_reason: null,

    // Q12: k-NN Numerical
    q12_d2: '',
    q12_d3: '',
    q12_k1: null,
    q12_k3: null,

    // Q13: Missing Data Imputation
    q13_global: '',
    q13_classA: '',
    q13_test_strategy: null,

    // Q14: Decision Tree Entropy & Info Gain
    q14_parent_entropy: '',
    q14_ig_t1: '',
    q14_ig_t2: '',
    q14_choice: null,
  };

  // Solution toggle state per question
  const solutionsVisible: Record<number, boolean> = {};
  for (let i = 1; i <= 14; i++) {
    solutionsVisible[i] = false;
  }

  // Submitted / evaluated state
  let hasEvaluated = false;
  const questionScores: Record<number, { earned: number; max: number; isCorrect: boolean; feedback: string }> = {};

  const QUESTION_WEIGHTS: Record<number, number> = {
    1: 6,
    2: 6,
    3: 8,
    4: 6,
    5: 6,
    6: 6,
    7: 6,
    8: 6,
    9: 6,
    10: 6,
    11: 8,
    12: 10,
    13: 10,
    14: 10,
  };

  function evaluateQuestion(qNum: number): { earned: number; max: number; isCorrect: boolean; feedback: string } {
    const max = QUESTION_WEIGHTS[qNum];
    let earned = 0;
    let feedback = '';

    switch (qNum) {
      case 1: {
        // Q1: S or U (4 items, 1.5 pts each)
        let count = 0;
        if (userAnswers.q1_1 === 'S') count++;
        if (userAnswers.q1_2 === 'U') count++;
        if (userAnswers.q1_3 === 'U') count++;
        if (userAnswers.q1_4 === 'S') count++;
        earned = (count / 4) * max;
        const isCorrect = count === 4;
        feedback = isCorrect
          ? '✓ Perfect! Linear Regression and SVM are Supervised (labeled targets), while K-Means and Hierarchical Clustering are Unsupervised (discovering latent groupings without target labels).'
          : `${count}/4 correct. Remember: Supervised requires ground truth labels y; Unsupervised operates on features X alone.`;
        return { earned, max, isCorrect, feedback };
      }

      case 2: {
        // Q2: Batch GD vs SGD
        const isCorrect = userAnswers.q2 === 'opt_bgd_sgd_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Correct! Batch GD sums the gradient over all m dataset samples before updating θ (smooth, slow); SGD calculates the gradient at each individual sample point (noisy, rapid, can escape shallow local minima).'
          : '✗ Incorrect. Batch GD iterates over all training instances before updating weights; SGD updates weights immediately after every single training point.';
        return { earned, max, isCorrect, feedback };
      }

      case 3: {
        // Q3: Parametric vs Non-parametric (def: 4 pts, DT: 2 pts, LR: 2 pts)
        let pts = 0;
        if (userAnswers.q3_def === 'opt_def_correct') pts += 4;
        if (userAnswers.q3_dt === 'non_parametric') pts += 2;
        if (userAnswers.q3_lr === 'parametric') pts += 2;
        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ Masterful! Parametric models have a fixed set of weights (Logistic Regression has d+1 weights). Non-parametric models grow complexity and parameters with dataset size (Decision Trees branch deeper with more data).'
          : `${pts}/${max} pts earned. Decision Trees are Non-parametric (grow with N); Logistic Regression is Parametric (fixed number of weights independent of N).`;
        return { earned, max, isCorrect, feedback };
      }

      case 4: {
        // Q4: L1 vs L2
        const isCorrect = userAnswers.q4 === 'opt_l1_l2_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Correct! L1 (Lasso) uses λΣ|θᵢ| and drives weights strictly to 0 due to diamond constraint vertices (sparse feature selection). L2 (Ridge) uses λΣθᵢ² and shrinks weights smoothly toward zero without exact nullification.'
          : '✗ Incorrect. L1 enforces sparsity (exact zeros for feature selection), whereas L2 shrinks weight magnitudes smoothly to prevent exploding weights and multicollinearity.';
        return { earned, max, isCorrect, feedback };
      }

      case 5: {
        // Q5: PCA reasons (select 2 valid reasons from options)
        const selected = userAnswers.q5_reasons as string[];
        const validOptions = ['curse_of_dim', 'multicollinearity', 'noise_vis'];
        const chosenValid = selected.filter(s => validOptions.includes(s)).length;
        const chosenInvalid = selected.filter(s => !validOptions.includes(s)).length;
        
        if (selected.length === 2 && chosenValid === 2 && chosenInvalid === 0) {
          earned = max;
        } else if (selected.length >= 2 && chosenValid >= 2) {
          earned = Math.max(0, max - chosenInvalid * 2);
        } else {
          earned = chosenValid * (max / 2);
        }
        earned = Math.min(max, Math.max(0, earned));
        const isCorrect = earned === max;
        feedback = isCorrect
          ? '✓ Great! PCA mitigates the curse of dimensionality (sparsity in high dimensions), eliminates multicollinearity (creates orthogonal principal components), reduces noise, and enables 2D/3D visualization.'
          : 'Review PCA benefits: 1) Overcoming the curse of dimensionality, 2) Eliminating multicollinearity via orthogonal axes, and 3) Noise reduction & 2D/3D projection.';
        return { earned, max, isCorrect, feedback };
      }

      case 6: {
        // Q6: Forward vs Backward Feature Selection
        const isCorrect = userAnswers.q6 === 'opt_fwd_bwd_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Spot on! Forward selection starts with an empty feature set and greedily adds the best feature at each iteration; Backward elimination starts with all features and iteratively discards the least informative feature.'
          : '✗ Incorrect. Forward begins empty and adds features; Backward begins with the complete set and eliminates features.';
        return { earned, max, isCorrect, feedback };
      }

      case 7: {
        // Q7: SVM Kernel Trick
        const isCorrect = userAnswers.q7 === 'opt_kernel_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Exactly right! The kernel function K(x, z) = ⟨φ(x), φ(z)⟩ implicitly maps data into a higher-dimensional feature space where it becomes linearly separable, computing inner products directly without explicitly evaluating high-dimensional coordinates.'
          : '✗ Incorrect. The kernel trick computes inner products in high-dimensional space implicitly, making non-linear data linearly separable without computing the coordinates explicitly.';
        return { earned, max, isCorrect, feedback };
      }

      case 8: {
        // Q8: Avoid overfitting in Decision Tree
        const isCorrect = userAnswers.q8 === 'opt_pruning_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Correct! Pruning (e.g. limiting max_depth, setting min_samples_split, min_samples_leaf, or cost-complexity post-pruning) restricts tree capacity and stops it from memorizing noisy training data.'
          : '✗ Incorrect. The primary technique to prevent decision tree overfitting is Pruning (limiting max depth, setting min samples per leaf/split, or cost-complexity pruning).';
        return { earned, max, isCorrect, feedback };
      }

      case 9: {
        // Q9: Three Subsets (Train, Val, Test - 2 pts each)
        let pts = 0;
        if (userAnswers.q9_train === 'fit_params') pts += 2;
        if (userAnswers.q9_val === 'tune_hyperparams') pts += 2;
        if (userAnswers.q9_test === 'unbiased_eval') pts += 2;
        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ Perfect 3-way split! Training set fits model parameters θ; Validation set tunes hyperparameters & selects models; Test set provides strictly unbiased evaluation of final generalization.'
          : `${pts}/${max} pts earned. Training = fit parameters; Validation = tune hyperparameters; Test = final unbiased generalization evaluation.`;
        return { earned, max, isCorrect, feedback };
      }

      case 10: {
        // Q10: Undersampling vs Oversampling Drawbacks
        const isCorrect = userAnswers.q10 === 'opt_imbalance_correct';
        earned = isCorrect ? max : 0;
        feedback = isCorrect
          ? '✓ Correct! Undersampling discards majority samples leading to loss of valuable information; Oversampling (e.g. SMOTE) duplicates/synthesizes minority samples, increasing computational cost and risking overfitting to synthetic noise.'
          : '✗ Incorrect. Undersampling suffers from information loss from discarded majority samples; Oversampling risks overfitting and synthetic distortion.';
        return { earned, max, isCorrect, feedback };
      }

      case 11: {
        // Q11: High bias model -> Bagging or Boosting? (Choice 4 pts, Reason 4 pts)
        let pts = 0;
        if (userAnswers.q11_choice === 'boosting') pts += 4;
        if (userAnswers.q11_reason === 'bias_reduction') pts += 4;
        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ Outstanding! Boosting is preferred because it sequentially trains weak learners to correct previous errors, systematically reducing BIAS. Bagging averages parallel models to reduce VARIANCE, and cannot reduce high bias.'
          : `${pts}/${max} pts earned. High bias (underfitting) demands Boosting to sequentially reduce bias. Bagging only reduces variance!`;
        return { earned, max, isCorrect, feedback };
      }

      case 12: {
        // Q12: k-NN Numerical
        let pts = 0;
        const d2Val = parseFloat(userAnswers.q12_d2);
        const d3Val = parseFloat(userAnswers.q12_d3);

        if (!isNaN(d2Val) && Math.abs(d2Val - 1.0) < 0.05) pts += 2.5;
        if (!isNaN(d3Val) && Math.abs(d3Val - 2.0) < 0.05) pts += 2.5;
        if (userAnswers.q12_k1 === 'A') pts += 2.5;
        if (userAnswers.q12_k3 === 'B') pts += 2.5;

        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ 10/10 Numerical Precision! Distances from x*=(2,1): d(x₂)=1.0, d(x₃)=2.0, d(x₅)=2.0, d(x₁)=√5≈2.24, d(x₄)=√5≈2.24. For k=1, nearest is x₂(A) → Label A. For k=3, nearest are x₂(A), x₃(B), x₅(B) → 2 votes B vs 1 vote A → Label B.'
          : `${pts}/${max} pts. Check distance formula d = √((x-x*)² + (y-y*)²). At k=1: x₂ is closest (dist 1.0) → A. At k=3: x₂, x₃, x₅ are closest (two B vs one A) → B.`;
        return { earned, max, isCorrect, feedback };
      }

      case 13: {
        // Q13: Missing data imputation
        let pts = 0;
        const gVal = parseFloat(userAnswers.q13_global);
        const cVal = parseFloat(userAnswers.q13_classA);

        if (!isNaN(gVal) && Math.abs(gVal - 26.4) < 0.1) pts += 4;
        if (!isNaN(cVal) && Math.abs(cVal - 21.0) < 0.1) pts += 3;
        if (userAnswers.q13_test_strategy === 'global_no_leakage') pts += 3;

        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ 10/10 Perfect! Global mean = (20+22+30+28+32)/5 = 132/5 = 26.4. Class-conditional mean for A = (20+22)/2 = 21.0. At test time, Global Mean must be used because label Y is unknown; using Class-Conditional would cause data leakage!'
          : `${pts}/${max} pts. Global mean = 132/5 = 26.4. Class A mean = 42/2 = 21.0. At test time, label Y is unobserved, so class conditioning causes test leakage.`;
        return { earned, max, isCorrect, feedback };
      }

      case 14: {
        // Q14: Decision Tree Entropy & IG
        let pts = 0;
        const hVal = parseFloat(userAnswers.q14_parent_entropy);
        const ig1Val = parseFloat(userAnswers.q14_ig_t1);
        const ig2Val = parseFloat(userAnswers.q14_ig_t2);

        if (!isNaN(hVal) && Math.abs(hVal - 0.971) < 0.02) pts += 3;
        if (!isNaN(ig1Val) && Math.abs(ig1Val - 0.971) < 0.02) pts += 3;
        if (!isNaN(ig2Val) && Math.abs(ig2Val - 0.420) < 0.03) pts += 2;
        if (userAnswers.q14_choice === 't1_maximizes_ig') pts += 2;

        earned = pts;
        const isCorrect = pts === max;
        feedback = isCorrect
          ? '✓ 10/10 Flawless Information Theory Calculation! H(S) = -[0.4 log₂(0.4) + 0.6 log₂(0.6)] = 0.971 bits. Split t₁=5 gives pure partitions H=0, so IG = 0.971 - 0 = 0.971 bits. Split t₂=7 has weighted H = 0.551 bits, IG = 0.420 bits. t₁=5 is chosen because it maximizes Information Gain!'
          : `${pts}/${max} pts. Parent H(S) = 0.971 bits. Split t₁=5 gives IG = 0.971 bits. Split t₂=7 gives IG = 0.420 bits. Choose t₁=5 to maximize Information Gain.`;
        return { earned, max, isCorrect, feedback };
      }

      default:
        return { earned: 0, max: 0, isCorrect: false, feedback: '' };
    }
  }

  function calculateTotalScore(): { earned: number; max: number; pct: number } {
    let earned = 0;
    let max = 0;
    for (let i = 1; i <= 14; i++) {
      const qEval = evaluateQuestion(i);
      earned += qEval.earned;
      max += qEval.max;
      questionScores[i] = qEval;
    }
    const pct = Math.round((earned / max) * 100);
    return { earned: Math.round(earned * 10) / 10, max, pct };
  }

  function getAnsweredCount(): number {
    let count = 0;
    if (userAnswers.q1_1 && userAnswers.q1_2 && userAnswers.q1_3 && userAnswers.q1_4) count++;
    if (userAnswers.q2) count++;
    if (userAnswers.q3_def && userAnswers.q3_dt && userAnswers.q3_lr) count++;
    if (userAnswers.q4) count++;
    if ((userAnswers.q5_reasons as string[]).length > 0) count++;
    if (userAnswers.q6) count++;
    if (userAnswers.q7) count++;
    if (userAnswers.q8) count++;
    if (userAnswers.q9_train && userAnswers.q9_val && userAnswers.q9_test) count++;
    if (userAnswers.q10) count++;
    if (userAnswers.q11_choice && userAnswers.q11_reason) count++;
    if (userAnswers.q12_d2 && userAnswers.q12_d3 && userAnswers.q12_k1 && userAnswers.q12_k3) count++;
    if (userAnswers.q13_global && userAnswers.q13_classA && userAnswers.q13_test_strategy) count++;
    if (userAnswers.q14_parent_entropy && userAnswers.q14_ig_t1 && userAnswers.q14_ig_t2 && userAnswers.q14_choice) count++;
    return count;
  }

  let currentQuestion = 1;
  let viewMode: 'single' | 'all' = 'single';

  const QUESTION_TITLES: Record<number, string> = {
    1: 'Supervised vs Unsupervised Learning',
    2: 'Batch GD vs Stochastic GD (SGD)',
    3: 'Parametric vs Non-parametric Models',
    4: 'L1 (Lasso) vs L2 (Ridge) Regularization',
    5: 'Dimensionality Reduction (PCA)',
    6: 'Forward vs Backward Feature Selection',
    7: 'SVM Kernel Trick & Hilbert Space',
    8: 'Decision Tree Overfitting & Pruning',
    9: 'Train / Validation / Test Subsets',
    10: 'Class Imbalance: Undersampling vs Oversampling',
    11: 'Ensemble Clash: High Bias Model (Bagging vs Boosting)',
    12: 'k-Nearest Neighbors (k-NN) Numerical Calculation',
    13: 'Missing Data Imputation & Leakage Prevention',
    14: 'Decision Tree Shannon Entropy & Information Gain',
  };

  function isQuestionAnswered(qNum: number): boolean {
    switch (qNum) {
      case 1: return Boolean(userAnswers.q1_1 && userAnswers.q1_2 && userAnswers.q1_3 && userAnswers.q1_4);
      case 2: return Boolean(userAnswers.q2);
      case 3: return Boolean(userAnswers.q3_def && userAnswers.q3_dt && userAnswers.q3_lr);
      case 4: return Boolean(userAnswers.q4);
      case 5: return (userAnswers.q5_reasons as string[]).length > 0;
      case 6: return Boolean(userAnswers.q6);
      case 7: return Boolean(userAnswers.q7);
      case 8: return Boolean(userAnswers.q8);
      case 9: return Boolean(userAnswers.q9_train && userAnswers.q9_val && userAnswers.q9_test);
      case 10: return Boolean(userAnswers.q10);
      case 11: return Boolean(userAnswers.q11_choice && userAnswers.q11_reason);
      case 12: return Boolean(userAnswers.q12_d2 && userAnswers.q12_d3 && userAnswers.q12_k1 && userAnswers.q12_k3);
      case 13: return Boolean(userAnswers.q13_global && userAnswers.q13_classA && userAnswers.q13_test_strategy);
      case 14: return Boolean(userAnswers.q14_parent_entropy && userAnswers.q14_ig_t1 && userAnswers.q14_ig_t2 && userAnswers.q14_choice);
      default: return false;
    }
  }

  function getQuestionCardStyle(qNum: number): string {
    if (viewMode === 'all') return 'display: block;';
    return currentQuestion === qNum ? 'display: block;' : 'display: none;';
  }

  function render() {
    const answeredCount = getAnsweredCount();
    const scoreSummary = calculateTotalScore();

    container.innerHTML = `
      <div class="exam-simulator-wrap" style="max-width: 1200px; margin: 0 auto; padding-bottom: 60px;">
        
        <!-- Header Banner -->
        <div class="game-card exam-header-card" style="background: linear-gradient(135deg, rgba(20, 30, 55, 0.9), rgba(15, 20, 35, 0.95)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: var(--radius-xl); padding: 32px; margin-bottom: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span class="concept-badge" style="background: rgba(255, 170, 0, 0.15); color: var(--accent-amber); border-color: rgba(255, 170, 0, 0.4);">
                  ★ OFFICIAL PRACTICE SPECIFICATION
                </span>
                <span class="concept-badge">uOttawa CSI 5155 Fall 2026</span>
              </div>
              <h1 style="font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 8px; letter-spacing: -0.5px;">
                📝 Grand Midterm Practice Exam Simulator
              </h1>
              <p style="color: var(--text-secondary); max-width: 720px; font-size: 14px; line-height: 1.6;">
                Step-by-step examination mode. Tackle each question with instant feedback, formula checks, and on-demand derivation reveals.
              </p>
            </div>

            <!-- Score / Status Box -->
            <div style="display: flex; gap: 14px; align-items: center; background: rgba(10, 15, 25, 0.8); border: 1px solid var(--border-color); padding: 16px 22px; border-radius: var(--radius-lg);">
              <div style="text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Answered</div>
                <div style="font-size: 24px; font-weight: 800; color: var(--accent-cyan); font-family: 'Fira Code', monospace;">
                  ${answeredCount} / 14
                </div>
              </div>
              <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.1);"></div>
              <div style="text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Grade</div>
                <div style="font-size: 24px; font-weight: 800; color: ${scoreSummary.pct >= 80 ? 'var(--accent-green)' : scoreSummary.pct >= 50 ? 'var(--accent-amber)' : '#fff'}; font-family: 'Fira Code', monospace;">
                  ${hasEvaluated ? `${scoreSummary.pct}%` : `${scoreSummary.earned}/${scoreSummary.max}`}
                </div>
              </div>
            </div>
          </div>

          <!-- Question Selector Pills -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                Question Selector (${answeredCount}/14 Answered):
              </div>
              <button id="btn-toggle-view-mode" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 5px 12px;">
                ${viewMode === 'single' ? '📑 Switch to All Questions View' : '📄 Switch to Single Question View'}
              </button>
            </div>
            <div class="q-nav-pill-grid">
              ${Array.from({ length: 14 }, (_, idx) => {
                const qNum = idx + 1;
                const evaluated = questionScores[qNum];
                const isAnswered = isQuestionAnswered(qNum);
                const isActive = viewMode === 'single' && currentQuestion === qNum;
                
                let stateClass = '';
                if (isActive) stateClass += ' active';
                if (hasEvaluated && evaluated) {
                  stateClass += evaluated.isCorrect ? ' correct' : ' incorrect';
                } else if (isAnswered) {
                  stateClass += ' answered';
                }

                return `
                  <button class="q-pill ${stateClass}" data-jump-q="${qNum}" title="Q${qNum}: ${QUESTION_TITLES[qNum]}">
                    Q${qNum}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Action Control Bar -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; align-items: center;">
            <button id="btn-submit-exam" class="btn btn-primary" style="padding: 10px 24px; font-size: 14px;">
              ⚡ Grade & Submit Entire Exam
            </button>
            <button id="btn-reveal-all-solutions" class="btn btn-secondary btn-sm">
              📖 ${Object.values(solutionsVisible).every(Boolean) ? 'Hide All Solutions' : 'Reveal All Solutions'}
            </button>
            <button id="btn-reset-exam" class="btn btn-secondary btn-sm" style="color: var(--accent-red); border-color: rgba(255, 51, 68, 0.3);">
              🔄 Reset Answers
            </button>
          </div>
        </div>

        ${viewMode === 'single' ? `
          <!-- Stepper Pager Header Bar for Single Question Mode -->
          <div class="exam-pager-header">
            <div style="display: flex; gap: 8px; align-items: center;">
              <button id="btn-prev-q" class="btn btn-secondary btn-sm" ${currentQuestion <= 1 ? 'disabled style="opacity: 0.4;"' : ''}>
                ◀ Prev
              </button>
              <div style="font-weight: 800; font-size: 13px; color: var(--accent-cyan); font-family: 'Fira Code', monospace; padding: 0 4px;">
                Question ${currentQuestion} of 14
              </div>
              <button id="btn-next-q" class="btn btn-secondary btn-sm" ${currentQuestion >= 14 ? 'disabled style="opacity: 0.4;"' : ''}>
                Next ▶
              </button>
            </div>
            
            <div style="font-size: 13px; font-weight: 600; color: #fff; max-width: 500px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${QUESTION_TITLES[currentQuestion]}
            </div>

            <div style="font-family: 'Fira Code', monospace; font-size: 12px; color: var(--accent-amber);">
              Worth ${QUESTION_WEIGHTS[currentQuestion]} Points
            </div>
          </div>
        ` : ''}

        <!-- 14 Questions Container -->
        <div class="quiz-container">
          
          <!-- ================= QUESTION 1 ================= -->
          <div id="question-1" class="quiz-question-card ${getCardBorderClass(1)} exam-single-question-box" style="${getQuestionCardStyle(1)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 1 [${QUESTION_WEIGHTS[1]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Supervised vs Unsupervised Learning</span>
              </div>
              ${renderScoreBadge(1)}
            </div>

            <div class="quiz-q-prompt">
              Categorize each of the following four machine learning tasks into <strong>Supervised Learning (S)</strong> or <strong>Unsupervised Learning (U)</strong>:
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
              <!-- 1.1 -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 12px 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 14px;">1. Linear Regression parameter optimization (fitting continuous target <i>y</i>)</span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q1_1 === 'S' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_1" data-val="S">Supervised (S)</button>
                  <button class="btn btn-sm ${userAnswers.q1_1 === 'U' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_1" data-val="U">Unsupervised (U)</button>
                </div>
              </div>
              <!-- 1.2 -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 12px 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 14px;">2. K-means to partition data points into <i>k</i> clusters</span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q1_2 === 'S' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_2" data-val="S">Supervised (S)</button>
                  <button class="btn btn-sm ${userAnswers.q1_2 === 'U' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_2" data-val="U">Unsupervised (U)</button>
                </div>
              </div>
              <!-- 1.3 -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 12px 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 14px;">3. Hierarchical agglomerative clustering on unlabelled gene profiles</span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q1_3 === 'S' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_3" data-val="S">Supervised (S)</button>
                  <button class="btn btn-sm ${userAnswers.q1_3 === 'U' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_3" data-val="U">Unsupervised (U)</button>
                </div>
              </div>
              <!-- 1.4 -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 12px 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 14px;">4. Training a Support Vector Machine (SVM) on labeled image classes</span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q1_4 === 'S' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_4" data-val="S">Supervised (S)</button>
                  <button class="btn btn-sm ${userAnswers.q1_4 === 'U' ? 'btn-primary' : 'btn-secondary'} q1-opt" data-task="q1_4" data-val="U">Unsupervised (U)</button>
                </div>
              </div>
            </div>

            ${renderQuestionActions(1)}
            ${renderSolutionBox(1, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>1. Linear Regression → Supervised (S):</strong> Learns a predictive mapping <i>f</i>(<i>x</i>) ≈ <i>y</i> where ground-truth continuous labels <i>y</i> guide parameter updates via Mean Squared Error.<br>
              • <strong>2. K-means → Unsupervised (U):</strong> Minimizes within-cluster inertia without ground-truth classification labels.<br>
              • <strong>3. Hierarchical Agglomerative Clustering → Unsupervised (U):</strong> Merges nearest cluster pairs bottom-up based purely on pairwise distance linkages without external guidance.<br>
              • <strong>4. Support Vector Machine (SVM) → Supervised (S):</strong> Maximizes margin separating labeled positive and negative training classes (<i>y<sub>i</sub></i> ∈ {−1, +1}).
            `)}
          </div>

          <!-- ================= QUESTION 2 ================= -->
          <div id="question-2" class="quiz-question-card ${getCardBorderClass(2)} exam-single-question-box" style="${getQuestionCardStyle(2)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 2 [${QUESTION_WEIGHTS[2]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Batch GD vs Stochastic GD</span>
              </div>
              ${renderScoreBadge(2)}
            </div>

            <div class="quiz-q-prompt">
              Explain the fundamental difference between <strong>Batch Gradient Descent (BGD)</strong> and <strong>Stochastic Gradient Descent (SGD)</strong> in terms of computational mechanism, trajectory, and update frequency.
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q2 === 'opt_bgd_sgd_correct' ? 'selected' : ''} q2-opt" data-val="opt_bgd_sgd_correct">
                <strong>(A) Batch GD calculates the gradient summing over the entire dataset (<i>m</i> samples)</strong> before updating parameters θ (smooth trajectory, slow per epoch). <strong>SGD calculates the gradient and updates θ at each individual sample point</strong> (noisy/oscillating trajectory, faster per step, can jump out of shallow local minima).
              </button>
              <button class="quiz-option-btn ${userAnswers.q2 === 'opt_bgd_sgd_wrong1' ? 'selected' : ''} q2-opt" data-val="opt_bgd_sgd_wrong1">
                <strong>(B)</strong> Batch GD updates weights after every single sample; SGD only updates weights once after processing the entire dataset.
              </button>
              <button class="quiz-option-btn ${userAnswers.q2 === 'opt_bgd_sgd_wrong2' ? 'selected' : ''} q2-opt" data-val="opt_bgd_sgd_wrong2">
                <strong>(C)</strong> Batch GD operates without a learning rate parameter α, whereas SGD strictly requires an adaptive learning rate like Adam.
              </button>
              <button class="quiz-option-btn ${userAnswers.q2 === 'opt_bgd_sgd_wrong3' ? 'selected' : ''} q2-opt" data-val="opt_bgd_sgd_wrong3">
                <strong>(D)</strong> Batch GD is only applicable to non-convex loss functions; SGD can only be applied to strictly convex paraboloids.
              </button>
            </div>

            ${renderQuestionActions(2)}
            ${renderSolutionBox(2, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Batch Gradient Descent:</strong> Update rule is <code>θ := θ − α · (1/m) Σ ∇<sub>θ</sub> L(θ; x<sup>(i)</sup>, y<sup>(i)</sup>)</code>. Sums over all <i>m</i> instances. Trajectory is deterministic, smooth, and heads straight towards the gradient minimum, but computation scales linearly with massive dataset sizes.<br>
              • <strong>Stochastic Gradient Descent (SGD):</strong> Update rule is <code>θ := θ − α · ∇<sub>θ</sub> L(θ; x<sup>(i)</sup>, y<sup>(i)</sup>)</code> evaluated on a single randomized instance <i>i</i>. Steps are computationally cheap and immediate. The noisy path creates high variance fluctuations, allowing SGD to escape shallow local minima and saddle points.
            `)}
          </div>

          <!-- ================= QUESTION 3 ================= -->
          <div id="question-3" class="quiz-question-card ${getCardBorderClass(3)} exam-single-question-box" style="${getQuestionCardStyle(3)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 3 [${QUESTION_WEIGHTS[3]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Parametric vs Non-parametric</span>
              </div>
              ${renderScoreBadge(3)}
            </div>

            <div class="quiz-q-prompt">
              (a) State the precise definition distinguishing <strong>Parametric</strong> from <strong>Non-parametric</strong> models.<br>
              (b) Categorize <strong>Decision Trees</strong> and <strong>Logistic Regression</strong> into parametric or non-parametric with explicit justification.
            </div>

            <!-- Part A -->
            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">
                Part (a): Fundamental Definition
              </div>
              <div class="quiz-options">
                <button class="quiz-option-btn ${userAnswers.q3_def === 'opt_def_correct' ? 'selected' : ''} q3-def-opt" data-val="opt_def_correct">
                  <strong>Parametric:</strong> Has a fixed, finite set of parameters (weights) independent of dataset size <i>N</i>.<br>
                  <strong>Non-parametric:</strong> Model complexity/parameter count grows dynamically with the size of the training dataset <i>N</i> (data defines the hypothesis representation).
                </button>
                <button class="quiz-option-btn ${userAnswers.q3_def === 'opt_def_inverted' ? 'selected' : ''} q3-def-opt" data-val="opt_def_inverted">
                  <strong>Parametric:</strong> Parameter count scales with <i>N</i>; <strong>Non-parametric:</strong> Fixed parameter count.
                </button>
              </div>
            </div>

            <!-- Part B -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">Decision Trees:</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q3_dt === 'parametric' ? 'btn-primary' : 'btn-secondary'} q3-dt-opt" data-val="parametric">Parametric</button>
                  <button class="btn btn-sm ${userAnswers.q3_dt === 'non_parametric' ? 'btn-primary' : 'btn-secondary'} q3-dt-opt" data-val="non_parametric">Non-parametric</button>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Tree depth, leaves & split rules scale as <i>N</i> grows.</div>
              </div>

              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">Logistic Regression:</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q3_lr === 'parametric' ? 'btn-primary' : 'btn-secondary'} q3-lr-opt" data-val="parametric">Parametric</button>
                  <button class="btn btn-sm ${userAnswers.q3_lr === 'non_parametric' ? 'btn-primary' : 'btn-secondary'} q3-lr-opt" data-val="non_parametric">Non-parametric</button>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Fixed weight vector θ ∈ ℝ<sup>d+1</sup> (<i>d</i> features + bias).</div>
              </div>
            </div>

            ${renderQuestionActions(3)}
            ${renderSolutionBox(3, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>(a) Definition:</strong> A <em>parametric</em> model makes strong structural assumptions about the underlying distribution, possessing a fixed number of parameters θ predetermined before seeing training data, invariant to dataset size <i>N</i>. A <em>non-parametric</em> model makes fewer rigid distribution assumptions; the effective number of parameters and capacity grow flexibly with the training dataset size.<br>
              • <strong>(b) Classifications:</strong><br>
              - <strong>Decision Trees: NON-PARAMETRIC.</strong> As the dataset grows in size and complexity, deeper branches, splits, and terminal leaf nodes are added. The tree structure depends directly on the training instances.<br>
              - <strong>Logistic Regression: PARAMETRIC.</strong> The model is constrained to the fixed linear form <i>P</i>(<i>Y</i>=1|<i>X</i>) = σ(θ<sup>T</sup> <i>X</i>). The number of parameters is exactly <i>d</i> + 1 (one weight per feature plus one intercept bias), regardless of whether there are 100 or 10,000,000 data rows.
            `)}
          </div>

          <!-- ================= QUESTION 4 ================= -->
          <div id="question-4" class="quiz-question-card ${getCardBorderClass(4)} exam-single-question-box" style="${getQuestionCardStyle(4)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 4 [${QUESTION_WEIGHTS[4]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">L1 (Lasso) vs L2 (Ridge) Regularization</span>
              </div>
              ${renderScoreBadge(4)}
            </div>

            <div class="quiz-q-prompt">
              Distinguish between <strong>L1 Regularization (Lasso)</strong> and <strong>L2 Regularization (Ridge)</strong> in terms of penalty formulation, geometry, and feature weight effects.
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q4 === 'opt_l1_l2_correct' ? 'selected' : ''} q4-opt" data-val="opt_l1_l2_correct">
                <strong>(A) L1 adds λ Σ |θᵢ| (diamond contour)</strong> which drives non-informative weights <strong>strictly to zero</strong>, yielding sparse models and built-in feature selection. <strong>L2 adds λ Σ θᵢ² (circular contour)</strong> which smoothly shrinks weights toward zero without forcing exact zero weights, mitigating exploding weights and handling multicollinearity.
              </button>
              <button class="quiz-option-btn ${userAnswers.q4 === 'opt_l1_l2_wrong1' ? 'selected' : ''} q4-opt" data-val="opt_l1_l2_wrong1">
                <strong>(B)</strong> L1 adds squared weights λ Σ θᵢ² for smoothness; L2 adds absolute weights λ Σ |θᵢ| for sparsity.
              </button>
              <button class="quiz-option-btn ${userAnswers.q4 === 'opt_l1_l2_wrong2' ? 'selected' : ''} q4-opt" data-val="opt_l1_l2_wrong2">
                <strong>(C)</strong> L1 and L2 both eliminate features identically; their only difference is the sign of the hyperparameter λ.
              </button>
              <button class="quiz-option-btn ${userAnswers.q4 === 'opt_l1_l2_wrong3' ? 'selected' : ''} q4-opt" data-val="opt_l1_l2_wrong3">
                <strong>(D)</strong> L2 drives weights strictly to zero, whereas L1 causes weights to explode exponentially.
              </button>
            </div>

            ${renderQuestionActions(4)}
            ${renderSolutionBox(4, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>L1 Regularization (Lasso):</strong> Loss = MSE + λ Σ |θ<sub>j</sub>|. Geometrically, the L1 norm creates a sharp diamond-shaped constraint region in parameter space. Contours of the unconstrained loss function frequently intersect the diamond at its sharp vertices on coordinate axes, setting irrelevant weights exactly to zero (θ<sub>j</sub> = 0), performing automated feature selection.<br>
              • <strong>L2 Regularization (Ridge):</strong> Loss = MSE + λ Σ θ<sub>j</sub>². Geometrically, the L2 norm creates a smooth spherical/circular constraint region. Contours touch smoothly along surfaces rather than on axes, shrinking all weights proportionally toward zero but rarely setting them exactly to 0. It is effective for preventing exploding weights and stabilizing multicollinear features.
            `)}
          </div>

          <!-- ================= QUESTION 5 ================= -->
          <div id="question-5" class="quiz-question-card ${getCardBorderClass(5)} exam-single-question-box" style="${getQuestionCardStyle(5)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 5 [${QUESTION_WEIGHTS[5]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Dimensionality Reduction (PCA)</span>
              </div>
              ${renderScoreBadge(5)}
            </div>

            <div class="quiz-q-prompt">
              List <strong>two valid reasons</strong> why dimensionality reduction techniques like <strong>Principal Component Analysis (PCA)</strong> are valuable in a machine learning workflow (Select all valid justifications):
            </div>

            <div class="quiz-options">
              <label class="quiz-option-btn ${userAnswers.q5_reasons.includes('curse_of_dim') ? 'selected' : ''}" style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer;">
                <input type="checkbox" class="q5-check" value="curse_of_dim" ${userAnswers.q5_reasons.includes('curse_of_dim') ? 'checked' : ''} style="margin-top: 4px;">
                <div>
                  <strong>1. Overcomes the Curse of Dimensionality:</strong> High-dimensional spaces become exponentially sparse, causing distance metrics (e.g. Euclidean in k-NN/K-Means) to lose contrast and models to overfit.
                </div>
              </label>

              <label class="quiz-option-btn ${userAnswers.q5_reasons.includes('multicollinearity') ? 'selected' : ''}" style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer;">
                <input type="checkbox" class="q5-check" value="multicollinearity" ${userAnswers.q5_reasons.includes('multicollinearity') ? 'checked' : ''} style="margin-top: 4px;">
                <div>
                  <strong>2. Eliminates Multicollinearity:</strong> Projects features onto orthogonal principal axes with zero covariance (Cov(Z<sub>i</sub>, Z<sub>j</sub>) = 0), stabilizing linear models.
                </div>
              </label>

              <label class="quiz-option-btn ${userAnswers.q5_reasons.includes('noise_vis') ? 'selected' : ''}" style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer;">
                <input type="checkbox" class="q5-check" value="noise_vis" ${userAnswers.q5_reasons.includes('noise_vis') ? 'checked' : ''} style="margin-top: 4px;">
                <div>
                  <strong>3. Reduces Noise & Enables 2D/3D Visualization:</strong> Discarding low-variance principal components strips noise while allowing humans to inspect clusters in 2D/3D.
                </div>
              </label>

              <label class="quiz-option-btn ${userAnswers.q5_reasons.includes('guarantee_100') ? 'selected' : ''}" style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer;">
                <input type="checkbox" class="q5-check" value="guarantee_100" ${userAnswers.q5_reasons.includes('guarantee_100') ? 'checked' : ''} style="margin-top: 4px;">
                <div>
                  <strong>4. Guarantees 100% Classification Accuracy:</strong> Discarding dimensions mathematically guarantees that any downstream classifier reaches zero training error.
                </div>
              </label>
            </div>

            ${renderQuestionActions(5)}
            ${renderSolutionBox(5, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              Any two of the following constitute a full-credit exam response:<br>
              • <strong>1. Mitigates the Curse of Dimensionality:</strong> In high dimensions, sample density decreases exponentially, distances become equidistant (<i>d</i><sub>max</sub> ≈ <i>d</i><sub>min</sub>), and variance increases drastically.<br>
              • <strong>2. Eliminates Multicollinearity:</strong> Principal components are eigenvectors of the covariance matrix and are mutually orthogonal (correlation = 0).<br>
              • <strong>3. Computational Efficiency & Denoising:</strong> Reduces model memory footprint and training runtimes while discarding components containing mostly noise.<br>
              • <strong>4. Data Visualization:</strong> Enables human qualitative inspection of datasets in 2D or 3D scatter plots.
            `)}
          </div>

          <!-- ================= QUESTION 6 ================= -->
          <div id="question-6" class="quiz-question-card ${getCardBorderClass(6)} exam-single-question-box" style="${getQuestionCardStyle(6)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 6 [${QUESTION_WEIGHTS[6]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Forward Selection vs Backward Elimination</span>
              </div>
              ${renderScoreBadge(6)}
            </div>

            <div class="quiz-q-prompt">
              What is the key operational difference between <strong>Forward Feature Selection</strong> and <strong>Backward Feature Elimination</strong>?
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q6 === 'opt_fwd_bwd_correct' ? 'selected' : ''} q6-opt" data-val="opt_fwd_bwd_correct">
                <strong>(A) Forward selection starts with an empty set ∅ and iteratively adds the single best feature</strong> until stopping criteria are met; <strong>Backward elimination starts with the complete set of all features</strong> and iteratively removes the least informative feature.
              </button>
              <button class="quiz-option-btn ${userAnswers.q6 === 'opt_fwd_bwd_wrong1' ? 'selected' : ''} q6-opt" data-val="opt_fwd_bwd_wrong1">
                <strong>(B)</strong> Forward selection is an unsupervised clustering algorithm, while Backward elimination is a supervised regression technique.
              </button>
              <button class="quiz-option-btn ${userAnswers.q6 === 'opt_fwd_bwd_wrong2' ? 'selected' : ''} q6-opt" data-val="opt_fwd_bwd_wrong2">
                <strong>(C)</strong> Forward selection starts with all features and removes them; Backward elimination starts with none and adds them.
              </button>
              <button class="quiz-option-btn ${userAnswers.q6 === 'opt_fwd_bwd_wrong3' ? 'selected' : ''} q6-opt" data-val="opt_fwd_bwd_wrong3">
                <strong>(D)</strong> Forward selection is only compatible with decision trees, while Backward elimination only works with SVMs.
              </button>
            </div>

            ${renderQuestionActions(6)}
            ${renderSolutionBox(6, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Forward Feature Selection:</strong> Greedy wrapper method starting from an empty subset <i>S</i>₀ = ∅. At step <i>k</i>, it tests every unused feature <i>f<sub>j</sub></i> ∉ <i>S</i><sub><i>k</i>−1</sub>, training a model and selecting the feature that produces the greatest validation improvement (highest <i>R</i>², lowest AIC/CV error). Adds features one by one until improvement drops below a threshold.<br>
              • <strong>Backward Feature Elimination:</strong> Starts from the full feature subset <i>S</i>₀ = {<i>f</i>₁, <i>f</i>₂, ..., <i>f<sub>d</sub></i>}. At step <i>k</i>, it tests removing each individual feature in <i>S</i><sub><i>k</i>−1</sub> and eliminates the feature whose absence causes the least loss in predictive performance (or most improves cross-validation). Continues removing features until further removal degrades the model.
            `)}
          </div>

          <!-- ================= QUESTION 7 ================= -->
          <div id="question-7" class="quiz-question-card ${getCardBorderClass(7)} exam-single-question-box" style="${getQuestionCardStyle(7)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 7 [${QUESTION_WEIGHTS[7]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">SVM Kernel Function Role</span>
              </div>
              ${renderScoreBadge(7)}
            </div>

            <div class="quiz-q-prompt">
              What is the role and mathematical benefit of a <strong>Kernel Function</strong> in Support Vector Machines (SVM) when handling non-linearly separable data?
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q7 === 'opt_kernel_correct' ? 'selected' : ''} q7-opt" data-val="opt_kernel_correct">
                <strong>(A) It implicitly maps data into a higher-dimensional feature space ℋ</strong> where the classes become linearly separable, computing inner products <i>K</i>(<i>x</i>, <i>z</i>) = ⟨φ(<i>x</i>), φ(<i>z</i>)⟩ directly in input space <strong>without explicitly calculating or storing high-dimensional coordinates</strong> (the kernel trick).
              </button>
              <button class="quiz-option-btn ${userAnswers.q7 === 'opt_kernel_wrong1' ? 'selected' : ''} q7-opt" data-val="opt_kernel_wrong1">
                <strong>(B)</strong> It compresses the training dataset into a single 1D scalar to make linear regression run in <i>O</i>(1) time.
              </button>
              <button class="quiz-option-btn ${userAnswers.q7 === 'opt_kernel_wrong2' ? 'selected' : ''} q7-opt" data-val="opt_kernel_wrong2">
                <strong>(C)</strong> It eliminates all support vectors from memory, transforming the SVM into a decision tree.
              </button>
              <button class="quiz-option-btn ${userAnswers.q7 === 'opt_kernel_wrong3' ? 'selected' : ''} q7-opt" data-val="opt_kernel_wrong3">
                <strong>(D)</strong> It restricts the decision boundary strictly to linear hyperplanes in original 2D space.
              </button>
            </div>

            ${renderQuestionActions(7)}
            ${renderSolutionBox(7, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Role:</strong> When patterns cannot be separated linearly in input space 𝒳 (e.g. concentric circles or XOR problems), Cover's Theorem states that non-linear data mapped into a higher-dimensional space with non-linear transformation φ(<i>x</i>) has higher probability of being linearly separable.<br>
              • <strong>The Kernel Trick:</strong> SVM optimization only requires evaluating dot products between vectors ⟨φ(<i>x</i>), φ(<i>z</i>)⟩. A Mercer kernel function <i>K</i>(<i>x</i>, <i>z</i>) computes this inner product directly using the original coordinates, bypassing explicit computation of φ(<i>x</i>) (which could be infinite-dimensional, as with Gaussian RBF kernels <i>K</i>(<i>x</i>, <i>z</i>) = exp(−γ ||<i>x</i> − <i>z</i>||²)).
            `)}
          </div>

          <!-- ================= QUESTION 8 ================= -->
          <div id="question-8" class="quiz-question-card ${getCardBorderClass(8)} exam-single-question-box" style="${getQuestionCardStyle(8)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 8 [${QUESTION_WEIGHTS[8]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Decision Tree Overfitting</span>
              </div>
              ${renderScoreBadge(8)}
            </div>

            <div class="quiz-q-prompt">
              Identify a specific, widely used method to prevent <strong>overfitting</strong> in a Decision Tree:
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q8 === 'opt_pruning_correct' ? 'selected' : ''} q8-opt" data-val="opt_pruning_correct">
                <strong>(A) Tree Pruning</strong> (restricting tree depth e.g. <code>max_depth</code>, requiring <code>min_samples_split</code>, <code>min_samples_leaf</code>, or applying cost-complexity post-pruning <i>R</i><sub>α</sub>(<i>T</i>)).
              </button>
              <button class="quiz-option-btn ${userAnswers.q8 === 'opt_pruning_wrong1' ? 'selected' : ''} q8-opt" data-val="opt_pruning_wrong1">
                <strong>(B)</strong> Allowing the tree to grow until every leaf contains exactly 1 training sample with 0 impurity.
              </button>
              <button class="quiz-option-btn ${userAnswers.q8 === 'opt_pruning_wrong2' ? 'selected' : ''} q8-opt" data-val="opt_pruning_wrong2">
                <strong>(C)</strong> Standardizing feature values to mean 0 and variance 1 using z-score normalization.
              </button>
              <button class="quiz-option-btn ${userAnswers.q8 === 'opt_pruning_wrong3' ? 'selected' : ''} q8-opt" data-val="opt_pruning_wrong3">
                <strong>(D)</strong> Adding an L1 penalty term directly onto the Gini impurity calculation.
              </button>
            </div>

            ${renderQuestionActions(8)}
            ${renderSolutionBox(8, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Method: Tree Pruning (Pre-pruning or Post-pruning):</strong><br>
              - <em>Pre-pruning (Early stopping):</em> Halts node splitting when heuristic thresholds are met: setting <code>max_depth</code>, enforcing minimum samples required to split a node (<code>min_samples_split</code>), or setting minimum samples per leaf (<code>min_samples_leaf</code>).<br>
              - <em>Post-pruning (Cost-Complexity Pruning):</em> Grows full tree to completion, then clips subtrees that contribute marginally to predictive power relative to model complexity penalty α|<i>T</i>|, minimizing <i>R</i><sub>α</sub>(<i>T</i>) = <i>R</i>(<i>T</i>) + α|<i>T</i>|.
            `)}
          </div>

          <!-- ================= QUESTION 9 ================= -->
          <div id="question-9" class="quiz-question-card ${getCardBorderClass(9)} exam-single-question-box" style="${getQuestionCardStyle(9)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 9 [${QUESTION_WEIGHTS[9]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Train / Validation / Test Subsets</span>
              </div>
              ${renderScoreBadge(9)}
            </div>

            <div class="quiz-q-prompt">
              Match each of the three standard ML development subsets with its dedicated functional purpose:
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px;">
              <!-- Training -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; color: var(--accent-cyan); margin-bottom: 8px;">1. Training Set (~60-70%):</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button class="quiz-option-btn ${userAnswers.q9_train === 'fit_params' ? 'selected' : ''} q9-train-opt" data-val="fit_params">
                    Used to fit/learn the model parameters θ (weights, decision split boundaries).
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_train === 'tune_hyperparams' ? 'selected' : ''} q9-train-opt" data-val="tune_hyperparams">
                    Used to tune hyperparameters and choose model architecture.
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_train === 'unbiased_eval' ? 'selected' : ''} q9-train-opt" data-val="unbiased_eval">
                    Used strictly for final unbiased evaluation of generalization.
                  </button>
                </div>
              </div>

              <!-- Validation -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; color: var(--accent-purple); margin-bottom: 8px;">2. Validation (Dev) Set (~15-20%):</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button class="quiz-option-btn ${userAnswers.q9_val === 'fit_params' ? 'selected' : ''} q9-val-opt" data-val="fit_params">
                    Used to fit/learn the model parameters θ (weights, decision split boundaries).
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_val === 'tune_hyperparams' ? 'selected' : ''} q9-val-opt" data-val="tune_hyperparams">
                    Used to tune hyperparameters (learning rate α, tree depth <i>d</i>, regularization λ) and select models.
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_val === 'unbiased_eval' ? 'selected' : ''} q9-val-opt" data-val="unbiased_eval">
                    Used strictly for final unbiased evaluation of generalization.
                  </button>
                </div>
              </div>

              <!-- Test -->
              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; color: var(--accent-green); margin-bottom: 8px;">3. Test Set (~15-20%):</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button class="quiz-option-btn ${userAnswers.q9_test === 'fit_params' ? 'selected' : ''} q9-test-opt" data-val="fit_params">
                    Used to fit/learn the model parameters θ (weights, decision split boundaries).
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_test === 'tune_hyperparams' ? 'selected' : ''} q9-test-opt" data-val="tune_hyperparams">
                    Used to tune hyperparameters and choose model architecture.
                  </button>
                  <button class="quiz-option-btn ${userAnswers.q9_test === 'unbiased_eval' ? 'selected' : ''} q9-test-opt" data-val="unbiased_eval">
                    Held-out completely; provides strictly unbiased evaluation of final model generalization on unseen data.
                  </button>
                </div>
              </div>
            </div>

            ${renderQuestionActions(9)}
            ${renderSolutionBox(9, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>1. Training Set:</strong> Directly accessed by optimization algorithms (e.g. gradient descent) to adjust internal weights/coefficients θ and tree thresholds.<br>
              • <strong>2. Validation Set:</strong> Evaluates performance of candidate models with different hyperparameter choices (e.g., <i>k</i> in k-NN, tree depth, λ in Ridge/Lasso). Prevents overfitting to the training set during model tuning.<br>
              • <strong>3. Test Set:</strong> Kept strictly locked away until all modeling and tuning decisions are final. Provides the gold-standard, unbiased estimate of real-world generalization. Tuning on the test set causes data leakage!
            `)}
          </div>

          <!-- ================= QUESTION 10 ================= -->
          <div id="question-10" class="quiz-question-card ${getCardBorderClass(10)} exam-single-question-box" style="${getQuestionCardStyle(10)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 10 [${QUESTION_WEIGHTS[10]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Class Imbalance</span>
              </div>
              ${renderScoreBadge(10)}
            </div>

            <div class="quiz-q-prompt">
              Explain the difference between <strong>Undersampling</strong> and <strong>Oversampling</strong> for addressing class imbalance, and state the critical drawback of each technique.
            </div>

            <div class="quiz-options">
              <button class="quiz-option-btn ${userAnswers.q10 === 'opt_imbalance_correct' ? 'selected' : ''} q10-opt" data-val="opt_imbalance_correct">
                <strong>(A) Undersampling reduces majority class instances</strong> (Drawback: <em>loss of valuable training information</em> and potential bias). <strong>Oversampling increases minority class instances</strong> e.g. via SMOTE synthetic interpolation (Drawback: <em>risk of overfitting</em> to duplicated/synthetic points, longer training time, and synthetic samples may cross class boundaries into noise).
              </button>
              <button class="quiz-option-btn ${userAnswers.q10 === 'opt_imbalance_wrong1' ? 'selected' : ''} q10-opt" data-val="opt_imbalance_wrong1">
                <strong>(B)</strong> Undersampling increases minority class; Oversampling reduces majority class.
              </button>
              <button class="quiz-option-btn ${userAnswers.q10 === 'opt_imbalance_wrong2' ? 'selected' : ''} q10-opt" data-val="opt_imbalance_wrong2">
                <strong>(C)</strong> Neither method has any drawbacks; both guarantee zero false positives.
              </button>
              <button class="quiz-option-btn ${userAnswers.q10 === 'opt_imbalance_wrong3' ? 'selected' : ''} q10-opt" data-val="opt_imbalance_wrong3">
                <strong>(D)</strong> Undersampling always leads to exploding gradients; Oversampling causes all weights to collapse to 0.
              </button>
            </div>

            ${renderQuestionActions(10)}
            ${renderSolutionBox(10, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Undersampling:</strong> Randomly or heuristically discards samples from the over-represented majority class to achieve balanced ratios.<br>
              - <em>Drawback:</em> <strong>Information Loss.</strong> Discarding data can discard critical boundary examples, weakening the model's ability to recognize legitimate majority variations.<br>
              • <strong>Oversampling:</strong> Replicates minority samples or synthetically generates new instances (e.g., SMOTE - Synthetic Minority Over-sampling Technique via k-NN interpolation).<br>
              - <em>Drawback:</em> <strong>Overfitting & Noise Amplification.</strong> Exact copies lead to overfitting specific minority profiles. Synthetic interpolations may place synthetic samples inside regions populated by majority class noise.
            `)}
          </div>

          <!-- ================= QUESTION 11 ================= -->
          <div id="question-11" class="quiz-question-card ${getCardBorderClass(11)} exam-single-question-box" style="${getQuestionCardStyle(11)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 11 [${QUESTION_WEIGHTS[11]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Ensembles: High Bias (Bagging vs Boosting)</span>
              </div>
              ${renderScoreBadge(11)}
            </div>

            <div class="quiz-q-prompt">
              If your base machine learning model exhibits <strong>high bias</strong> (severe underfitting on training data), which ensemble paradigm is preferred: <strong>Bagging</strong> or <strong>Boosting</strong>? Justify your choice based on bias-variance decomposition.
            </div>

            <!-- Part A: Choice -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">Ensemble Method Preference:</div>
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-sm ${userAnswers.q11_choice === 'bagging' ? 'btn-primary' : 'btn-secondary'} q11-choice-opt" data-val="bagging">Bagging</button>
                <button class="btn btn-sm ${userAnswers.q11_choice === 'boosting' ? 'btn-primary' : 'btn-secondary'} q11-choice-opt" data-val="boosting">Boosting (Preferred)</button>
              </div>
            </div>

            <!-- Part B: Justification -->
            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--accent-purple); margin-bottom: 8px;">Mathematical Justification:</div>
              <div class="quiz-options">
                <button class="quiz-option-btn ${userAnswers.q11_reason === 'bias_reduction' ? 'selected' : ''} q11-reason-opt" data-val="bias_reduction">
                  <strong>Boosting sequentially trains weak models to correct errors of prior models, reducing BIAS.</strong> Bagging trains models independently in parallel on bootstrap samples and averages predictions, which reduces <em>variance</em> but <strong>cannot reduce bias</strong>.
                </button>
                <button class="quiz-option-btn ${userAnswers.q11_reason === 'variance_reduction' ? 'selected' : ''} q11-reason-opt" data-val="variance_reduction">
                  Bagging is preferred because bootstrap sampling always increases the depth of individual decision trees.
                </button>
                <button class="quiz-option-btn ${userAnswers.q11_reason === 'identical' ? 'selected' : ''} q11-reason-opt" data-val="identical">
                  Both methods reduce bias and variance by identical proportions mathematically.
                </button>
              </div>
            </div>

            ${renderQuestionActions(11)}
            ${renderSolutionBox(11, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Preferred Paradigm: BOOSTING.</strong><br>
              • <strong>Bias-Variance Justification:</strong><br>
              - <em>High Bias means Underfitting:</em> The base model is too simple to capture the underlying pattern.<br>
              - <em>Boosting (Sequential Ensemble):</em> Trains base learners in sequence. Each new learner is trained on the weighted residuals / misclassified samples of the preceding ensemble. By combining weak learners additively, Boosting progressively increases model expressive capacity, systematically <strong>driving down BIAS</strong>.<br>
              - <em>Bagging (Parallel Ensemble):</em> Bootstrap Aggregating averages <i>M</i> independently trained models: <code>Var(f̄) = (1/M) · σ²</code>. While this drastically dampens variance, the expected value of the average is equal to the expected value of a single learner: <code>𝔼[f̄] = 𝔼[fᵢ]</code>. Consequently, <strong>Bagging cannot fix a model that suffers from high bias!</strong>
            `)}
          </div>

          <!-- ================= QUESTION 12 ================= -->
          <div id="question-12" class="quiz-question-card ${getCardBorderClass(12)} exam-single-question-box" style="${getQuestionCardStyle(12)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 12 [${QUESTION_WEIGHTS[12]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">k-NN Numerical Calculation</span>
              </div>
              ${renderScoreBadge(12)}
            </div>

            <div class="quiz-q-prompt">
              Given five 2D training instances:<br>
              <div style="font-family: 'Fira Code', monospace; color: #7dd3fc; margin: 8px 0; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;">
                x₁=(0, 0, Class A) | x₂=(2, 0, Class A) | x₃=(2, 3, Class B) | x₄=(1, 3, Class B) | x₅=(4, 1, Class B)
              </div>
              Classify the unseen test query point <strong>x* = (2, 1)</strong> using <strong>Euclidean Distance</strong>:
            </div>

            <!-- Distance checks -->
            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item">
                <label>Distance <i>d</i>(x₂, x*):</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.1" class="num-input" id="inp-q12-d2" value="${userAnswers.q12_d2}" placeholder="e.g. 1.0" style="width: 120px;">
                  <span style="font-size: 11px; color: var(--text-muted);">x₂ = (2, 0)</span>
                </div>
              </div>

              <div class="control-item">
                <label>Distance <i>d</i>(x₃, x*):</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.1" class="num-input" id="inp-q12-d3" value="${userAnswers.q12_d3}" placeholder="e.g. 2.0" style="width: 120px;">
                  <span style="font-size: 11px; color: var(--text-muted);">x₃ = (2, 3)</span>
                </div>
              </div>
            </div>

            <!-- Classification decisions -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 16px;">
              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">(a) Predicted Label for <i>k</i> = 1:</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q12_k1 === 'A' ? 'btn-primary' : 'btn-secondary'} q12-k1-opt" data-val="A">Class A</button>
                  <button class="btn btn-sm ${userAnswers.q12_k1 === 'B' ? 'btn-primary' : 'btn-secondary'} q12-k1-opt" data-val="B">Class B</button>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Single closest nearest neighbor.</div>
              </div>

              <div style="background: rgba(10, 15, 25, 0.6); padding: 14px; border-radius: var(--radius-md);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">(b) Predicted Label for <i>k</i> = 3:</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm ${userAnswers.q12_k3 === 'A' ? 'btn-primary' : 'btn-secondary'} q12-k3-opt" data-val="A">Class A</button>
                  <button class="btn btn-sm ${userAnswers.q12_k3 === 'B' ? 'btn-primary' : 'btn-secondary'} q12-k3-opt" data-val="B">Class B</button>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Majority vote among 3 nearest neighbors.</div>
              </div>
            </div>

            ${renderQuestionActions(12)}
            ${renderSolutionBox(12, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>Step 1: Compute Euclidean Distances to x* = (2, 1):</strong><br>
              - <i>d</i>(x₁) = √((0−2)² + (0−1)²) = √(4 + 1) = √5 ≈ 2.236<br>
              - <i>d</i>(x₂) = √((2−2)² + (0−1)²) = √(0 + 1) = <b>1.0</b><br>
              - <i>d</i>(x₃) = √((2−2)² + (3−1)²) = √(0 + 4) = <b>2.0</b><br>
              - <i>d</i>(x₄) = √((1−2)² + (3−1)²) = √(1 + 4) = √5 ≈ 2.236<br>
              - <i>d</i>(x₅) = √((4−2)² + (1−1)²) = √(4 + 0) = <b>2.0</b><br><br>
              • <strong>Step 2: Distance Ranking:</strong><br>
              - 1st: x₂ (dist = 1.0, Label A)<br>
              - 2nd & 3rd (tied): x₃ (dist = 2.0, Label B) and x₅ (dist = 2.0, Label B)<br><br>
              • <strong>(a) For <i>k</i> = 1:</strong> Nearest point is x₂ (distance 1.0) with label A ⟹ <strong>Predicted Label = A</strong>.<br>
              • <strong>(b) For <i>k</i> = 3:</strong> The three closest points are x₂ (A), x₃ (B), and x₅ (B).<br>
              - Class A: 1 vote | Class B: 2 votes ⟹ Majority Vote ⟹ <strong>Predicted Label = B</strong>.
            `)}
          </div>

          <!-- ================= QUESTION 13 ================= -->
          <div id="question-13" class="quiz-question-card ${getCardBorderClass(13)} exam-single-question-box" style="${getQuestionCardStyle(13)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 13 [${QUESTION_WEIGHTS[13]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Missing Data Imputation & Leakage</span>
              </div>
              ${renderScoreBadge(13)}
            </div>

            <div class="quiz-q-prompt">
              A clinical study measures age across two diagnosis classes (A and B):<br>
              <div style="font-family: 'Fira Code', monospace; color: #7dd3fc; margin: 8px 0; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;">
                ID 1: Age=20 (Class A) | ID 2: Age=22 (Class A) | ID 3: Age=? (Class A)<br>
                ID 4: Age=30 (Class B) | ID 5: Age=28 (Class B) | ID 6: Age=32 (Class B)
              </div>
              Answer the following:
            </div>

            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item">
                <label>(a) Global Mean Imputation Value:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.1" class="num-input" id="inp-q13-global" value="${userAnswers.q13_global}" placeholder="e.g. 26.4" style="width: 140px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Mean of all 5 known values</span>
                </div>
              </div>

              <div class="control-item">
                <label>(b) Class-Conditional Mean for Class A:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.1" class="num-input" id="inp-q13-classA" value="${userAnswers.q13_classA}" placeholder="e.g. 21.0" style="width: 140px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Mean of known Class A records</span>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">
                (c) When deploying model to evaluate an unseen Test Set, which strategy is appropriate?
              </div>
              <div class="quiz-options">
                <button class="quiz-option-btn ${userAnswers.q13_test_strategy === 'global_no_leakage' ? 'selected' : ''} q13-strategy-opt" data-val="global_no_leakage">
                  <strong>Global Mean (computed from training set) is appropriate.</strong> At test/inference time, the true label <i>Y</i> is unknown (the model is predicting it!), so conditioning on class labels would constitute fatal <em>data leakage</em> and cannot be executed at test time.
                </button>
                <button class="quiz-option-btn ${userAnswers.q13_test_strategy === 'class_conditional_leakage' ? 'selected' : ''} q13-strategy-opt" data-val="class_conditional_leakage">
                  Class-Conditional Mean using the test labels is appropriate because we want maximum possible accuracy on the test set.
                </button>
              </div>
            </div>

            ${renderQuestionActions(13)}
            ${renderSolutionBox(13, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>(a) Global Mean:</strong> Sum of all known ages = 20 + 22 + 30 + 28 + 32 = 132. Number of observations <i>N</i> = 5.<br>
              <code>Global Mean = 132 / 5 = <b>26.4</b></code><br><br>
              • <strong>(b) Class-Conditional Mean for Class A:</strong> Known observations in Class A = 20 and 22 (<i>N<sub>A</sub></i> = 2).<br>
              <code>Class A Mean = (20 + 22) / 2 = 42 / 2 = <b>21.0</b></code><br><br>
              • <strong>(c) Test Set Strategy Rationale:</strong> In real-world deployment and validation test sets, the true label <i>Y</i> is unavailable (unobserved). Performing class-conditional imputation assumes knowledge of the test labels, introducing severe <strong>target data leakage</strong>. Therefore, global statistics learned exclusively from training data must be applied.
            `)}
          </div>

          <!-- ================= QUESTION 14 ================= -->
          <div id="question-14" class="quiz-question-card ${getCardBorderClass(14)} exam-single-question-box" style="${getQuestionCardStyle(14)}">
            <div class="quiz-question-header">
              <div>
                <span class="quiz-q-num">QUESTION 14 [${QUESTION_WEIGHTS[14]} PTS]</span>
                <span class="concept-badge" style="margin-left: 8px;">Decision Tree Entropy & Info Gain</span>
              </div>
              ${renderScoreBadge(14)}
            </div>

            <div class="quiz-q-prompt">
              Consider five 1D sensor readings classified as Normal or Faulty:<br>
              <div style="font-family: 'Fira Code', monospace; color: #7dd3fc; margin: 8px 0; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;">
                X=2 (Norm) | X=4 (Norm) | X=6 (Faulty) | X=8 (Faulty) | X=10 (Faulty)
              </div>
              Total <i>N</i> = 5 samples (2 Normal, 3 Faulty).<br>
              Calculate the entropy and Information Gain for candidate thresholds <i>t</i>₁ = 5 and <i>t</i>₂ = 7:
            </div>

            <div class="controls-panel" style="margin-bottom: 16px;">
              <div class="control-item">
                <label>(a) Parent Entropy <i>H</i>(<i>S</i>) prior to split:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.001" class="num-input" id="inp-q14-h" value="${userAnswers.q14_parent_entropy}" placeholder="e.g. 0.971" style="width: 130px;">
                  <span style="font-size: 11px; color: var(--text-muted);">bits (3 dec)</span>
                </div>
              </div>

              <div class="control-item">
                <label>(b1) Info Gain <i>IG</i>(<i>S</i>, <i>t</i>₁ = 5):</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.001" class="num-input" id="inp-q14-ig1" value="${userAnswers.q14_ig_t1}" placeholder="e.g. 0.971" style="width: 130px;">
                  <span style="font-size: 11px; color: var(--text-muted);"><i>X</i> ≤ 5 vs <i>X</i> > 5</span>
                </div>
              </div>

              <div class="control-item">
                <label>(b2) Info Gain <i>IG</i>(<i>S</i>, <i>t</i>₂ = 7):</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="number" step="0.001" class="num-input" id="inp-q14-ig2" value="${userAnswers.q14_ig_t2}" placeholder="e.g. 0.420" style="width: 130px;">
                  <span style="font-size: 11px; color: var(--text-muted);"><i>X</i> ≤ 7 vs <i>X</i> > 7</span>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">
                (c) Which split threshold should the decision tree select, and why?
              </div>
              <div class="quiz-options">
                <button class="quiz-option-btn ${userAnswers.q14_choice === 't1_maximizes_ig' ? 'selected' : ''} q14-choice-opt" data-val="t1_maximizes_ig">
                  <strong>Select <i>t</i>₁ = 5 because it maximizes Information Gain (<i>IG</i> = 0.971 > 0.420)</strong> and produces 100% pure child partitions with zero residual entropy (<i>H</i> = 0).
                </button>
                <button class="quiz-option-btn ${userAnswers.q14_choice === 't2_larger_split' ? 'selected' : ''} q14-choice-opt" data-val="t2_larger_split">
                  Select <i>t</i>₂ = 7 because it places more samples in the left branch.
                </button>
              </div>
            </div>

            ${renderQuestionActions(14)}
            ${renderSolutionBox(14, `
              <strong>Official Midterm Solution Breakdown:</strong><br>
              • <strong>(a) Entropy of the Parent Dataset <i>H</i>(<i>S</i>):</strong><br>
              <i>p</i>(Norm) = 2/5 = 0.4, <i>p</i>(Fault) = 3/5 = 0.6.<br>
              <i>H</i>(<i>S</i>) = − [0.4 · log₂(0.4) + 0.6 · log₂(0.6)] = − [−0.52877 − 0.44218] = <b>0.971 bits</b>.<br><br>
              • <strong>(b) Information Gain Calculations:</strong><br>
              - <strong>Candidate <i>t</i>₁ = 5:</strong><br>
                Left child (<i>X</i> ≤ 5): {2, 4} ⟹ 2 Norm, 0 Fault ⟹ <i>H</i>(Left) = 0.<br>
                Right child (<i>X</i> > 5): {6, 8, 10} ⟹ 0 Norm, 3 Fault ⟹ <i>H</i>(Right) = 0.<br>
                Weighted entropy = (2/5)·0 + (3/5)·0 = 0.<br>
                <i>IG</i>(<i>S</i>, <i>t</i>₁=5) = <i>H</i>(<i>S</i>) − 0 = <b>0.971 bits</b>.<br><br>
              - <strong>Candidate <i>t</i>₂ = 7:</strong><br>
                Left child (<i>X</i> ≤ 7): {2, 4, 6} ⟹ 2 Norm, 1 Fault ⟹ <i>H</i>(Left) = − [(2/3)·log₂(2/3) + (1/3)·log₂(1/3)] ≈ 0.9183 bits.<br>
                Right child (<i>X</i> > 7): {8, 10} ⟹ 0 Norm, 2 Fault ⟹ <i>H</i>(Right) = 0.<br>
                Weighted entropy = (3/5)·0.9183 + (2/5)·0 = <b>0.551 bits</b>.<br>
                <i>IG</i>(<i>S</i>, <i>t</i>₂=7) = 0.971 − 0.551 = <b>0.420 bits</b>.<br><br>
              • <strong>(c) Decision:</strong> Choose <i>t</i>₁ = 5 because it achieves maximum Information Gain (0.971 > 0.420) and completely purifies both subsets in a single step.
            `)}
          </div>

        </div> <!-- end quiz-container -->

        ${viewMode === 'single' ? `
          <!-- Bottom Single Question Navigation Controls -->
          <div class="exam-bottom-pager" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 14px 20px; background: rgba(10, 15, 26, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <button id="btn-bottom-prev" class="btn btn-secondary" ${currentQuestion <= 1 ? 'disabled style="opacity: 0.4;"' : ''}>
              ◀ Previous Question
            </button>
            <div style="font-size: 12px; color: var(--text-muted); font-family: 'Fira Code', monospace;">
              Progress: ${answeredCount} / 14 Answered
            </div>
            <div style="display: flex; gap: 10px;">
              ${currentQuestion < 14 ? `
                <button id="btn-bottom-next" class="btn btn-primary">
                  Next Question (Q${currentQuestion + 1}) ▶
                </button>
              ` : `
                <button id="btn-submit-exam-finish" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-green), #059669); border-color: var(--accent-green); color: #000; font-weight: 800;">
                  🎓 Finish & Grade Exam
                </button>
              `}
            </div>
          </div>
        ` : ''}

        <!-- Bottom Grand Submit Banner -->
        <div class="game-card exam-finish-card" style="margin-top: 32px; text-align: center; padding: 36px; border-radius: var(--radius-xl); background: linear-gradient(135deg, rgba(20,28,45,0.9), rgba(12,18,30,0.95)); border: 1px solid var(--border-color);">
          <h2 style="font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 12px;">Ready to Finalize Your Midterm Score?</h2>
          <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 20px auto; font-size: 14px;">
            Submitting will evaluate all 14 questions, calculate your weighted percentage grade out of 100%, record your progress in the game profile, and unlock full solution derivations.
          </p>
          <button id="btn-submit-exam-bottom" class="btn btn-accent" style="padding: 14px 36px; font-size: 16px;">
            ⚡ Submit Exam & Record Midterm Grade
          </button>
        </div>

      </div>
    `;

    attachEventHandlers();
  }

  function getCardBorderClass(qNum: number): string {
    if (!hasEvaluated) return '';
    const qScore = questionScores[qNum];
    if (!qScore) return '';
    if (qScore.isCorrect) return 'card-correct';
    if (qScore.earned > 0) return 'card-partial';
    return 'card-incorrect';
  }

  function renderScoreBadge(qNum: number): string {
    if (!hasEvaluated) return '';
    const qScore = questionScores[qNum];
    if (!qScore) return '';
    if (qScore.isCorrect) {
      return `<span class="concept-badge" style="background: rgba(0, 255, 136, 0.15); border-color: var(--accent-green); color: #a7f3d0;">✓ Correct (+${qScore.earned}/${qScore.max} pts)</span>`;
    }
    if (qScore.earned > 0) {
      return `<span class="concept-badge" style="background: rgba(255, 170, 0, 0.15); border-color: var(--accent-amber); color: #fef08a;">Partial (+${qScore.earned}/${qScore.max} pts)</span>`;
    }
    return `<span class="concept-badge" style="background: rgba(255, 51, 68, 0.15); border-color: var(--accent-red); color: #fca5a5;">✗ Incorrect (0/${qScore.max} pts)</span>`;
  }

  function renderQuestionActions(qNum: number): string {
    const isVisible = solutionsVisible[qNum];
    return `
      <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-sm btn-secondary btn-check-single" data-q="${qNum}">
          Check Question ${qNum}
        </button>
        <button class="btn btn-sm btn-secondary btn-toggle-sol" data-q="${qNum}" style="font-size: 12px;">
          ${isVisible ? 'Hide Solution ▲' : 'Show Step-by-Step Derivation ▼'}
        </button>
        ${hasEvaluated && questionScores[qNum] ? `
          <span style="font-size: 12.5px; color: ${questionScores[qNum].isCorrect ? '#a7f3d0' : questionScores[qNum].earned > 0 ? '#fef08a' : '#fca5a5'}; margin-left: 6px;">
            ${questionScores[qNum].feedback}
          </span>
        ` : ''}
      </div>
    `;
  }

  function renderSolutionBox(qNum: number, content: string): string {
    return `
      <details class="math-explainer" ${solutionsVisible[qNum] ? 'open' : ''} style="margin-top: 16px;">
        <summary>💡 Step-by-Step Midterm Derivation & Official Solution (Click to toggle)</summary>
        <div class="explainer-content">
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-primary);">
            ${content}
          </div>
        </div>
      </details>
    `;
  }

  function attachEventHandlers() {
    // Pill navigation jumps
    container.querySelectorAll("[data-jump-q]").forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        const qNum = parseInt((btn as HTMLElement).dataset.jumpQ || "1");
        currentQuestion = qNum;
        render();
        if (viewMode === "all") {
          container.querySelector("#question-" + qNum)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Pager Previous & Next
    const handlePrev = () => {
      if (currentQuestion > 1) {
        sound.playClick();
        currentQuestion--;
        render();
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    };
    container.querySelector("#btn-prev-q")?.addEventListener("click", handlePrev);
    container.querySelector("#btn-bottom-prev")?.addEventListener("click", handlePrev);

    const handleNext = () => {
      if (currentQuestion < 14) {
        sound.playClick();
        currentQuestion++;
        render();
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    };
    container.querySelector("#btn-next-q")?.addEventListener("click", handleNext);
    container.querySelector("#btn-bottom-next")?.addEventListener("click", handleNext);

    // Toggle view mode
    container.querySelector("#btn-toggle-view-mode")?.addEventListener("click", () => {
      sound.playClick();
      viewMode = viewMode === "single" ? "all" : "single";
      render();
    });

    container.querySelector("#btn-submit-exam-finish")?.addEventListener("click", handleSubmit);

    // Q1 buttons
    container.querySelectorAll('.q1-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const task = (btn as HTMLElement).dataset.task!;
        const val = (btn as HTMLElement).dataset.val!;
        userAnswers[task] = val;
        render();
      });
    });

    // Q2 buttons
    container.querySelectorAll('.q2-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q2 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q3 buttons
    container.querySelectorAll('.q3-def-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q3_def = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q3-dt-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q3_dt = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q3-lr-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q3_lr = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q4 buttons
    container.querySelectorAll('.q4-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q4 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q5 checkboxes
    container.querySelectorAll('.q5-check').forEach(input => {
      input.addEventListener('change', (e) => {
        sound.playClick();
        const val = (e.target as HTMLInputElement).value;
        const checked = (e.target as HTMLInputElement).checked;
        const arr = userAnswers.q5_reasons as string[];
        if (checked && !arr.includes(val)) {
          arr.push(val);
        } else if (!checked && arr.includes(val)) {
          userAnswers.q5_reasons = arr.filter(x => x !== val);
        }
        render();
      });
    });

    // Q6 buttons
    container.querySelectorAll('.q6-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q6 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q7 buttons
    container.querySelectorAll('.q7-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q7 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q8 buttons
    container.querySelectorAll('.q8-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q8 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q9 buttons
    container.querySelectorAll('.q9-train-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q9_train = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q9-val-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q9_val = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q9-test-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q9_test = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q10 buttons
    container.querySelectorAll('.q10-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q10 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q11 buttons
    container.querySelectorAll('.q11-choice-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q11_choice = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q11-reason-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q11_reason = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q12 inputs
    const inpQ12D2 = container.querySelector('#inp-q12-d2') as HTMLInputElement;
    inpQ12D2?.addEventListener('input', (e) => {
      userAnswers.q12_d2 = (e.target as HTMLInputElement).value;
    });
    const inpQ12D3 = container.querySelector('#inp-q12-d3') as HTMLInputElement;
    inpQ12D3?.addEventListener('input', (e) => {
      userAnswers.q12_d3 = (e.target as HTMLInputElement).value;
    });
    container.querySelectorAll('.q12-k1-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q12_k1 = (btn as HTMLElement).dataset.val;
        render();
      });
    });
    container.querySelectorAll('.q12-k3-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q12_k3 = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q13 inputs
    const inpQ13G = container.querySelector('#inp-q13-global') as HTMLInputElement;
    inpQ13G?.addEventListener('input', (e) => {
      userAnswers.q13_global = (e.target as HTMLInputElement).value;
    });
    const inpQ13C = container.querySelector('#inp-q13-classA') as HTMLInputElement;
    inpQ13C?.addEventListener('input', (e) => {
      userAnswers.q13_classA = (e.target as HTMLInputElement).value;
    });
    container.querySelectorAll('.q13-strategy-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q13_test_strategy = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Q14 inputs
    const inpQ14H = container.querySelector('#inp-q14-h') as HTMLInputElement;
    inpQ14H?.addEventListener('input', (e) => {
      userAnswers.q14_parent_entropy = (e.target as HTMLInputElement).value;
    });
    const inpQ14IG1 = container.querySelector('#inp-q14-ig1') as HTMLInputElement;
    inpQ14IG1?.addEventListener('input', (e) => {
      userAnswers.q14_ig_t1 = (e.target as HTMLInputElement).value;
    });
    const inpQ14IG2 = container.querySelector('#inp-q14-ig2') as HTMLInputElement;
    inpQ14IG2?.addEventListener('input', (e) => {
      userAnswers.q14_ig_t2 = (e.target as HTMLInputElement).value;
    });
    container.querySelectorAll('.q14-choice-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        userAnswers.q14_choice = (btn as HTMLElement).dataset.val;
        render();
      });
    });

    // Single Question Check buttons
    container.querySelectorAll('.btn-check-single').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const qNum = parseInt((btn as HTMLElement).dataset.q || '1');
        hasEvaluated = true;
        const qEval = evaluateQuestion(qNum);
        questionScores[qNum] = qEval;
        if (qEval.isCorrect) {
          sound.playCorrect();
        } else {
          sound.playWrong();
        }
        render();
      });
    });

    // Toggle solution buttons
    container.querySelectorAll('.btn-toggle-sol').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const qNum = parseInt((btn as HTMLElement).dataset.q || '1');
        solutionsVisible[qNum] = !solutionsVisible[qNum];
        render();
      });
    });

    // Submit Exam Buttons
    const handleSubmit = () => {
      hasEvaluated = true;
      const summary = calculateTotalScore();

      // Record to GameManager
      gameManager.recordQuizScore('midterm_master_exam', summary.pct, 100);
      gameManager.addScore(summary.pct * 5, summary.pct * 2);
      if (summary.pct >= 60) {
        gameManager.markGameComplete('midterm_master_exam');
      }

      if (summary.pct >= 80) {
        sound.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else if (summary.pct >= 50) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }

      // Automatically show all solutions upon submit
      for (let i = 1; i <= 14; i++) {
        solutionsVisible[i] = true;
      }

      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    container.querySelector('#btn-submit-exam')?.addEventListener('click', handleSubmit);
    container.querySelector('#btn-submit-exam-bottom')?.addEventListener('click', handleSubmit);

    // Reveal/Hide All Solutions
    container.querySelector('#btn-reveal-all-solutions')?.addEventListener('click', () => {
      sound.playClick();
      const allOpen = Object.values(solutionsVisible).every(Boolean);
      for (let i = 1; i <= 14; i++) {
        solutionsVisible[i] = !allOpen;
      }
      render();
    });

    // Reset Exam
    container.querySelector('#btn-reset-exam')?.addEventListener('click', () => {
      sound.playClick();
      if (confirm('Are you sure you want to reset all answers for the midterm exam?')) {
        for (const k in userAnswers) {
          if (Array.isArray(userAnswers[k])) userAnswers[k] = [];
          else userAnswers[k] = null;
        }
        userAnswers.q12_d2 = '';
        userAnswers.q12_d3 = '';
        userAnswers.q13_global = '';
        userAnswers.q13_classA = '';
        userAnswers.q14_parent_entropy = '';
        userAnswers.q14_ig_t1 = '';
        userAnswers.q14_ig_t2 = '';
        hasEvaluated = false;
        for (let i = 1; i <= 14; i++) {
          solutionsVisible[i] = false;
          delete questionScores[i];
        }
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Initial render
  render();
}
