import { sound } from './audio/sound';
import confetti from 'canvas-confetti';

interface SpeedRunQuestion {
  section: string;
  prompt: string;
  choices: string[];
  correct: number;
  explanation: string;
}

const RUN_SECONDS = 180;

const QUESTIONS: SpeedRunQuestion[] = [
  {
    section: 'On-paper calculations',
    prompt: 'A node has 4 Pass and 3 Fail examples. What is its binary entropy?',
    choices: ['Approximately 0.985 bits', 'Exactly 0 bits', 'Exactly 0.571 bits', 'Approximately 1.585 bits'],
    correct: 0,
    explanation: 'H(D) = −(4/7 log₂(4/7) + 3/7 log₂(3/7)) ≈ 0.985 bits.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'Study Time perfectly separates those 7 examples. What are the weighted child entropy and information gain?',
    choices: ['Weighted entropy 0; IG ≈ 0.985', 'Weighted entropy 0.985; IG 0', 'Weighted entropy 1; IG ≈ −0.015', 'Weighted entropy 0.5; IG ≈ 0.485'],
    correct: 0,
    explanation: 'Both children are pure, so weighted entropy is 0 and IG = 0.985 − 0 = 0.985.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'A binary node is split into left (3 positive, 1 negative) and right (1 positive, 3 negative). What is the weighted Gini after the split?',
    choices: ['0.375', '0.5', '0.75', '1.0'],
    correct: 0,
    explanation: 'Each child has Gini 2(3/4)(1/4) = 0.375, so the weighted average is 0.375. Choose the split with the lowest weighted Gini.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'For a feature with minimum 10 and maximum 30, min-max normalization maps x = 20 to what?',
    choices: ['0.5', '1.0', '10', '−0.5'],
    correct: 0,
    explanation: '(20 − 10) / (30 − 10) = 0.5. Min-max maps to [0, 1] and is sensitive to outliers.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'When standardizing test data, which statistics should be used?',
    choices: ['Mean and standard deviation fitted on the training set', 'Mean and standard deviation recomputed on the test set', 'Statistics from the combined train and test sets', 'The test-set median and interquartile range'],
    correct: 0,
    explanation: 'Fit scaling statistics only on training data; reuse them to transform validation/test data to prevent leakage.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'At threshold 0.5, the source ROC example gives TP=3, FN=2, FP=2, TN=3. What ROC point (FPR, TPR) does this produce?',
    choices: ['(0.4, 0.6)', '(0.6, 0.4)', '(0.4, 0.4)', '(0.6, 0.6)'],
    correct: 0,
    explanation: 'FPR = FP/(FP+TN) = 2/5 = 0.4; TPR = TP/(TP+FN) = 3/5 = 0.6.',
  },
  {
    section: 'On-paper calculations',
    prompt: 'SMOTE interpolates from xᵢ=(2,4) toward neighbor xzi=(6,8) with λ=0.25. What is xnew?',
    choices: ['(3, 5)', '(4, 6)', '(2.5, 4.5)', '(6, 8)'],
    correct: 0,
    explanation: 'xnew = xᵢ + λ(xzi − xᵢ) = (2,4) + 0.25(4,4) = (3,5).',
  },
  {
    section: 'On-paper calculations',
    prompt: 'Which distance counts coordinate mismatches, making it suitable for binary/categorical vectors?',
    choices: ['Hamming distance (p=0)', 'Manhattan distance (p=1)', 'Euclidean distance (p=2)', 'Cosine distance'],
    correct: 0,
    explanation: 'Hamming distance counts mismatched dimensions; L₁ is Manhattan and L₂ is Euclidean.',
  },
  {
    section: 'Gradient descent',
    prompt: 'What distinguishes a per-example loss from a dataset cost?',
    choices: ['Loss scores one example; cost aggregates/averages losses over the dataset', 'Loss is always regularized; cost is always unregularized', 'They are unrelated quantities', 'Cost scores one example; loss aggregates the dataset'],
    correct: 0,
    explanation: 'J(θ) = (1/N) Σᵢ L(yᵢ, f(xᵢ; θ)); an objective may further include regularization.',
  },
  {
    section: 'Gradient descent',
    prompt: 'For f(xᵢ)=θ₀+θ₁xᵢ and squared error (yᵢ−f(xᵢ))², what is the sample gradient with respect to θ₁?',
    choices: ['−2xᵢ(yᵢ−(θ₀+θ₁xᵢ))', '−2(yᵢ−(θ₀+θ₁xᵢ))', '2xᵢ(yᵢ−θ₁)', '−xᵢ²(yᵢ−f(xᵢ))'],
    correct: 0,
    explanation: 'Apply the chain rule: derivative of squared residual is −2(yᵢ−f(xᵢ)), multiplied by ∂f/∂θ₁=xᵢ.',
  },
  {
    section: 'Gradient descent',
    prompt: 'The gradient is positive. Which update moves a parameter downhill?',
    choices: ['θ ← θ − α∇J', 'θ ← θ + α∇J', 'θ ← α/∇J', 'θ ← θ − ∇J/α'],
    correct: 0,
    explanation: 'Subtract the gradient scaled by learning rate α to move opposite the direction of steepest ascent.',
  },
  {
    section: 'Gradient descent',
    prompt: 'Which gradient descent variant updates after each individual training example?',
    choices: ['Stochastic gradient descent', 'Batch gradient descent', 'Mini-batch gradient descent', 'Closed-form least squares'],
    correct: 0,
    explanation: 'SGD updates per sample; batch uses all N samples per update; mini-batch uses a subset B<N.',
  },
  {
    section: 'Gradient descent',
    prompt: 'What is a typical benefit of mini-batch gradient descent?',
    choices: ['Balances vectorized efficiency with less noisy updates than single-example SGD', 'Guarantees the global minimum for every objective', 'Needs no learning rate', 'Uses the entire dataset for every single update'],
    correct: 0,
    explanation: 'Mini-batches combine efficient vectorized computation with updates less noisy than single-example SGD.',
  },
  {
    section: 'Classification fundamentals',
    prompt: 'What does the logistic sigmoid return when z=θᵀx=0?',
    choices: ['0.5', '0', '1', '−1'],
    correct: 0,
    explanation: 'σ(0)=1/(1+e⁰)=1/2. The sigmoid maps real-valued scores into [0,1].',
  },
  {
    section: 'Classification fundamentals',
    prompt: 'Why maximize likelihood or minimize negative log-likelihood for logistic regression?',
    choices: ['For i.i.d. Bernoulli labels, maximizing the product likelihood is equivalent to minimizing binary cross-entropy', 'It directly maximizes the classification margin', 'It forces every predicted probability to 0.5', 'It minimizes squared Euclidean distance between classes'],
    correct: 0,
    explanation: 'Taking the negative log turns the product likelihood into a sum and avoids numerical underflow.',
  },
  {
    section: 'Classification fundamentals',
    prompt: 'For a soft-margin SVM, what does a large C generally do?',
    choices: ['Penalizes margin violations more, favoring fewer training errors but risking a narrower margin/overfit', 'Tolerates more violations and always widens the margin', 'Turns the SVM into logistic regression', 'Sets every slack variable to zero by definition'],
    correct: 0,
    explanation: 'C trades margin size against violations: large C penalizes errors strongly; small C allows more for a wider margin.',
  },
  {
    section: 'Classification fundamentals',
    prompt: 'How many binary classifiers does one-vs-one train for K classes?',
    choices: ['K(K−1)/2', 'K', 'K²', 'K−1'],
    correct: 0,
    explanation: 'OvO trains one classifier per class pair and predicts by majority vote.',
  },
  {
    section: 'Classification fundamentals',
    prompt: 'What is the kernel trick?',
    choices: ['Compute feature-space inner products implicitly without explicitly constructing the high-dimensional mapping', 'Replace support vectors with k nearest neighbors', 'Convert class probabilities into calibrated likelihoods', 'Project every input down to one dimension'],
    correct: 0,
    explanation: 'A kernel K(x,x′)=⟨φ(x),φ(x′)⟩ enables nonlinear boundaries without explicitly storing φ(x).',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'Which decomposition describes expected test error?',
    choices: ['Bias² + Variance + Irreducible Error', 'Bias + Variance² − Training Error', 'Precision + Recall + Accuracy', 'Training Error × Model Complexity'],
    correct: 0,
    explanation: 'The bias-variance decomposition separates systematic error, sensitivity to training data, and irreducible noise.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'Which regularizer encourages sparse weights and automatic feature selection?',
    choices: ['L1 (Lasso)', 'L2 (Ridge)', 'Neither L1 nor L2', 'Both always force every weight to zero'],
    correct: 0,
    explanation: 'L1 penalizes Σ|θᵢ| and can zero weights; L2 penalizes Σθᵢ² and typically shrinks weights smoothly.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'Why can k-NN degrade in very high-dimensional spaces?',
    choices: ['Data become sparse and distances become less discriminative', 'All features become categorical', 'The nearest neighbor is no longer defined', 'Every distance becomes exactly zero'],
    correct: 0,
    explanation: 'The curse of dimensionality makes space volume grow rapidly and distances converge, weakening neighborhood contrast.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'Which feature encoding pairing is appropriate?',
    choices: ['Nominal category → one-hot encoding; ordinal category → rank-aware mapping', 'Nominal category → Euclidean distance on arbitrary IDs', 'Ordinal category → discard its ordering', 'Numerical feature → always one-hot encode each value'],
    correct: 0,
    explanation: 'Nominal values have no natural order; ordinal values do. Numerical features represent measurements.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'A dataset has 85% negative examples. What accuracy does the majority-class baseline achieve by predicting negative every time?',
    choices: ['85%', '50%', '15%', '100%'],
    correct: 0,
    explanation: 'The majority baseline achieves the majority proportion but can miss every minority case; accuracy alone can mislead.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'Which averaging gives every class equal importance regardless of support?',
    choices: ['Macro average', 'Micro average', 'Weighted average', 'Majority-class average'],
    correct: 0,
    explanation: 'Macro averages per-class metrics equally; weighted uses class support; micro pools global TP, FP, FN.',
  },
  {
    section: 'Generalization & evaluation',
    prompt: 'For time-ordered data, what split avoids training on future information?',
    choices: ['Temporal/block split', 'Random split across all timestamps', 'Fit preprocessing before splitting', 'Use test data to choose features'],
    correct: 0,
    explanation: 'Temporal splitting preserves chronology. All learned preprocessing and feature selection must be fit within training folds.',
  },
  {
    section: 'Quick-check concepts',
    prompt: 'Why is logistic regression called “regression” even when used for classification?',
    choices: ['It fits a linear score to log-odds, then applies a sigmoid link to model class probability', 'It predicts only continuous labels', 'It uses squared-error tree splits', 'It regresses the number of classes'],
    correct: 0,
    explanation: 'The linear predictor models log-odds; applying the sigmoid yields a probability for classification.',
  },
  {
    section: 'Quick-check concepts',
    prompt: 'Why can 1-NN have zero training error yet high variance?',
    choices: ['Each training sample is its own nearest neighbor, so the model memorizes noise', 'It averages every training sample into one centroid', 'It always predicts the majority class', 'It prunes the decision boundary'],
    correct: 0,
    explanation: 'A point’s nearest training sample is itself at distance zero, but this makes predictions sensitive to noise.',
  },
  {
    section: 'Quick-check concepts',
    prompt: 'In X=UΣVᵀ, what do the right singular vectors V represent for PCA?',
    choices: ['Principal orthogonal directions of variance', 'Class probabilities', 'Per-example residuals', 'The confusion matrix'],
    correct: 0,
    explanation: 'The columns of V give principal directions; PCA questions here focus on this interpretation, not full derivations.',
  },
  {
    section: 'Quick-check concepts',
    prompt: 'What is the goal of pruning a decision tree?',
    choices: ['Limit complexity (for example depth or minimum leaf size) to reduce overfitting', 'Increase the number of one-sample leaves', 'Maximize training depth without validation', 'Convert entropy directly into a distance metric'],
    correct: 0,
    explanation: 'Depth limits, minimum leaf sizes, and minimum impurity decrease prevent overly specific branches.',
  },
];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

let runSequence = 0;

export function renderSpeedRun(container: HTMLElement) {
  let intervalId: number | undefined;
  let secondsRemaining = RUN_SECONDS;
  let questionIndex = 0;
  let correctCount = 0;
  let answered = false;
  let ended = false;
  const runId = ++runSequence;
  const runQuestions = shuffled(QUESTIONS).map(question => ({
    question,
    choices: shuffled(question.choices.map((text, index) => ({ text, correct: index === question.correct }))),
  }));

  const stopTimer = () => {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const renderShell = (content: string) => {
    container.innerHTML = `
      <section class="game-card speed-run-panel" data-speed-run-root>
        <div class="card-header">
          <div class="card-title-group">
            <h2>⏱️ CSI 5155 Speed Run</h2>
            <p class="card-subtitle">A timed calculation and concept sprint across the attached exam-review guide.</p>
          </div>
          <span class="concept-badge">29 questions • 3 minutes</span>
        </div>
        ${content}
      </section>
    `;
  };

  const renderIntro = () => {
    renderShell(`
      <p>Race through decision-tree calculations, scaling and leakage, ROC metrics, distances and SMOTE, gradient descent, logistic regression, SVMs, generalization, class imbalance, pipelines, and exam quick checks.</p>
      <p>Correct answers score 100 points. Answer all 29 as fast as you can; explanations appear after every choice.</p>
      <button class="btn btn-primary" type="button" data-speed-start>Start speed run</button>
      <details class="math-explainer" style="margin-top: 18px;">
        <summary>📚 Open the full calculation and concept reference</summary>
        <div class="explainer-content">
          <p>The complete supplied study notes are available as Markdown so you can review every worked example and derivation.</p>
          <a class="btn btn-secondary btn-sm" href="/speed-run-reference.md" target="_blank" rel="noopener">Open full speed-run reference ↗</a>
        </div>
      </details>
    `);
    container.querySelector('[data-speed-start]')?.addEventListener('click', startRun);
  };

  const finishRun = (timedOut = false) => {
    if (ended) return;
    ended = true;
    stopTimer();
    const score = correctCount * 100;
    if (!timedOut && questionIndex >= QUESTIONS.length) {
      sound.playVictory();
      confetti({ particleCount: 90, spread: 70 });
    }
    renderShell(`
      <div class="speed-run-results" role="status">
        <h3>${timedOut ? 'Time is up!' : 'Sprint complete!'}</h3>
        <p>You answered <strong>${correctCount} / ${QUESTIONS.length}</strong> correctly.</p>
        <p class="concept-badge">Speed Run Score: ${score}</p>
        <button class="btn btn-primary" type="button" data-speed-retry>Run it again</button>
      </div>
    `);
    container.querySelector('[data-speed-retry]')?.addEventListener('click', () => renderSpeedRun(container));
  };

  const renderQuestion = () => {
    if (ended) return;
    if (questionIndex >= runQuestions.length) {
      finishRun();
      return;
    }
    const entry = runQuestions[questionIndex]!;
    answered = false;
    renderShell(`
      <div class="flashcard-progress-row">
        <span data-speed-category>${escapeHtml(entry.question.section)}</span>
        <span>Question ${questionIndex + 1} of ${QUESTIONS.length}</span>
        <strong data-speed-timer aria-live="polite">${secondsRemaining}s</strong>
      </div>
      <div class="flashcard-progress-track" role="progressbar" aria-label="Speed run progress" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${questionIndex}">
        <span style="width: ${(questionIndex / QUESTIONS.length) * 100}%"></span>
      </div>
      <h3 class="speed-run-question">${escapeHtml(entry.question.prompt)}</h3>
      <div class="quiz-options speed-run-choices">
        ${entry.choices.map((choice, index) => `
          <button class="quiz-option-btn speed-run-choice" type="button" data-choice="${index}" data-correct="${choice.correct}">${escapeHtml(choice.text)}</button>
        `).join('')}
      </div>
      <div class="speed-run-feedback" aria-live="polite"></div>
      <button class="btn btn-primary" type="button" data-speed-next hidden>Next question →</button>
    `);
    container.querySelectorAll<HTMLButtonElement>('.speed-run-choice').forEach(button => {
      button.addEventListener('click', () => {
        if (answered || ended) return;
        answered = true;
        const correct = button.dataset.correct === 'true';
        if (correct) {
          correctCount++;
          sound.playCorrect();
        } else {
          sound.playWrong();
        }
        container.querySelectorAll<HTMLButtonElement>('.speed-run-choice').forEach(option => {
          option.disabled = true;
          if (option.dataset.correct === 'true') option.classList.add('selected');
        });
        const feedback = container.querySelector<HTMLElement>('.speed-run-feedback');
        if (feedback) {
          feedback.innerHTML = `
            <p class="${correct ? 'game-feedback-success' : 'game-feedback-error'}">
              <strong>${correct ? '✓ Correct' : '✗ Not quite'}.</strong>
              ${escapeHtml(entry.question.explanation)}
            </p>
          `;
        }
        const nextButton = container.querySelector<HTMLButtonElement>('[data-speed-next]');
        if (nextButton) nextButton.hidden = false;
      });
    });
    container.querySelector('[data-speed-next]')?.addEventListener('click', () => {
      if (!answered || ended) return;
      questionIndex++;
      renderQuestion();
    });
  };

  function startRun() {
    stopTimer();
    secondsRemaining = RUN_SECONDS;
    questionIndex = 0;
    correctCount = 0;
    ended = false;
    renderQuestion();
    const activeRun = runId;
    intervalId = window.setInterval(() => {
      const stillActive = container.dataset.speedRunId === String(activeRun)
        && Boolean(container.querySelector('[data-speed-run-root]'));
      if (!stillActive) {
        stopTimer();
        return;
      }
      secondsRemaining--;
      const timer = container.querySelector<HTMLElement>('[data-speed-timer]');
      if (timer) timer.textContent = `${secondsRemaining}s`;
      if (secondsRemaining <= 0) finishRun(true);
    }, 1000);
  }

  container.dataset.speedRunId = String(runId);
  renderIntro();
}
