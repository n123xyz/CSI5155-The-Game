interface CalculationAnswer {
  label: string;
  value: number;
}

interface CalculationExercise {
  title: string;
  section: string;
  prompt: string;
  formula: string;
  answers: CalculationAnswer[];
  working: string[];
}

function entropy(counts: number[]): number {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return -counts.reduce((sum, count) => {
    if (count === 0) return sum;
    const probability = count / total;
    return sum + probability * Math.log2(probability);
  }, 0);
}

function gini(counts: number[]): number {
  const total = counts.reduce((sum, count) => sum + count, 0);
  return 1 - counts.reduce((sum, count) => sum + (count / total) ** 2, 0);
}

const parentEntropy = entropy([4, 3]);
const sleepWeightedEntropy = (4 / 7) * entropy([2, 2]) + (3 / 7) * entropy([2, 1]);
const leftGini = gini([3, 1]);
const rightGini = gini([1, 3]);
const weightedGini = (4 / 8) * leftGini + (4 / 8) * rightGini;
const tp = 3;
const fn = 2;
const fp = 2;
const tn = 3;
const precision = tp / (tp + fp);
const recall = tp / (tp + fn);

const EXERCISES: CalculationExercise[] = [
  {
    title: 'Entropy & information gain',
    section: 'Decision tree calculations',
    prompt: 'From the guide’s seven-student table, compute the parent entropy, the Study Time information gain, and the Sleep Quality weighted entropy and information gain.',
    formula: 'H(D) = −Σ pᵢ log₂(pᵢ); IG(Y, X) = H(Y) − H(Y | X)',
    answers: [
      { label: 'Parent entropy H(D), in bits', value: parentEntropy },
      { label: 'Study Time information gain, in bits', value: parentEntropy },
      { label: 'Sleep Quality weighted entropy, in bits', value: sleepWeightedEntropy },
      { label: 'Sleep Quality information gain, in bits', value: parentEntropy - sleepWeightedEntropy },
    ],
    working: [
      `Parent: −(4/7 log₂(4/7) + 3/7 log₂(3/7)) = ${parentEntropy.toFixed(3)} bits.`,
      'Study Time makes pure children, so H(Y | Study Time) = 0 and IG = 0.985 − 0 = 0.985 bits.',
      `Sleep Quality: (4/7 × 1.000) + (3/7 × 0.918) = ${sleepWeightedEntropy.toFixed(3)} bits.`,
      `IG(Sleep Quality) = 0.985 − ${sleepWeightedEntropy.toFixed(3)} = ${(parentEntropy - sleepWeightedEntropy).toFixed(3)} bits. Study Time is the better split.`,
    ],
  },
  {
    title: 'Gini impurity',
    section: 'Decision tree calculations',
    prompt: 'A candidate split has a left child with 3 positive and 1 negative example, and a right child with 1 positive and 3 negative examples. Calculate each child’s Gini and the weighted split Gini.',
    formula: 'Gini(D) = 1 − Σ pᵢ²; Gini(split) = Σ (Nchild / N) × Gini(child)',
    answers: [
      { label: 'Left child Gini', value: leftGini },
      { label: 'Right child Gini', value: rightGini },
      { label: 'Weighted split Gini', value: weightedGini },
    ],
    working: [
      'Left: 1 − (3/4)² − (1/4)² = 0.375.',
      'Right: 1 − (1/4)² − (3/4)² = 0.375.',
      'The children each contain 4 of 8 examples, so weighted Gini = (4/8 × 0.375) + (4/8 × 0.375) = 0.375. Choose the lowest candidate split Gini.',
    ],
  },
  {
    title: 'Normalization & standardization',
    section: 'Feature scaling',
    prompt: 'A training feature ranges from 10 to 30. Normalize x = 20 to [0,1]. A different training feature has mean 5 and standard deviation 2; standardize x = 9. Enter the two transformed values.',
    formula: 'Min-max: (x − min) / (max − min); Z-score: (x − μ) / σ',
    answers: [
      { label: 'Min-max normalized value', value: (20 - 10) / (30 - 10) },
      { label: 'Standardized Z-score', value: (9 - 5) / 2 },
    ],
    working: [
      '(20 − 10) / (30 − 10) = 0.500. Min-max normalization is sensitive to outliers.',
      '(9 − 5) / 2 = 2.000. Fit scaling statistics on training data only, then reuse them for validation/test data.',
    ],
  },
  {
    title: 'Confusion-matrix metrics',
    section: 'Evaluation calculations',
    prompt: 'At a classification threshold, TP = 3, FN = 2, FP = 2, and TN = 3. Calculate accuracy, precision, recall/TPR, specificity, FPR, and F₁.',
    formula: 'Accuracy=(TP+TN)/N; Precision=TP/(TP+FP); Recall=TP/(TP+FN); FPR=FP/(FP+TN); F₁=2PR/(P+R)',
    answers: [
      { label: 'Accuracy', value: (tp + tn) / (tp + tn + fp + fn) },
      { label: 'Precision', value: precision },
      { label: 'Recall / TPR', value: recall },
      { label: 'Specificity / TNR', value: tn / (tn + fp) },
      { label: 'False positive rate (FPR)', value: fp / (fp + tn) },
      { label: 'F₁-score', value: 2 * (precision * recall) / (precision + recall) },
    ],
    working: [
      'Accuracy = (3 + 3) / 10 = 0.600.',
      'Precision = 3 / (3 + 2) = 0.600; recall/TPR = 3 / (3 + 2) = 0.600.',
      'Specificity = 3 / (3 + 2) = 0.600; FPR = 2 / (2 + 3) = 0.400.',
      'F₁ = 2 × (0.6 × 0.6) / (0.6 + 0.6) = 0.600.',
    ],
  },
  {
    title: 'Plotting ROC points by hand',
    section: 'Evaluation calculations',
    prompt: 'For the guide’s 10-example dataset, calculate (FPR, TPR) at thresholds 0.7, 0.5, and 0.3. The table gives (TP,FN,FP,TN) as (3,2,0,5), (3,2,2,3), and (5,0,3,2).',
    formula: 'TPR = TP / (TP + FN); FPR = FP / (FP + TN). Plot FPR on x and TPR on y.',
    answers: [
      { label: 'Threshold 0.7 FPR', value: 0 / 5 },
      { label: 'Threshold 0.7 TPR', value: 3 / 5 },
      { label: 'Threshold 0.5 FPR', value: 2 / 5 },
      { label: 'Threshold 0.5 TPR', value: 3 / 5 },
      { label: 'Threshold 0.3 FPR', value: 3 / 5 },
      { label: 'Threshold 0.3 TPR', value: 5 / 5 },
    ],
    working: [
      'At 0.7: FPR = 0/5 = 0.000 and TPR = 3/5 = 0.600 → point (0.0, 0.6).',
      'At 0.5: FPR = 2/5 = 0.400 and TPR = 3/5 = 0.600 → point (0.4, 0.6).',
      'At 0.3: FPR = 3/5 = 0.600 and TPR = 5/5 = 1.000 → point (0.6, 1.0).',
      'Add boundary points (0,0) and (1,1), then connect the threshold points in order.',
    ],
  },
  {
    title: 'Minkowski distance & SMOTE',
    section: 'Distance and resampling calculations',
    prompt: 'For x = (1,2) and y = (4,6), calculate Manhattan (p=1), Euclidean (p=2), and Hamming distances. Then SMOTE-interpolate from (1,2) toward (5,8) using λ = 0.25.',
    formula: 'Lₚ = (Σ |xⱼ − yⱼ|ᵖ)^(1/p); Hamming counts mismatches; xnew = xᵢ + λ(xzi − xᵢ)',
    answers: [
      { label: 'Manhattan distance', value: Math.abs(1 - 4) + Math.abs(2 - 6) },
      { label: 'Euclidean distance', value: Math.hypot(1 - 4, 2 - 6) },
      { label: 'Hamming distance', value: 2 },
      { label: 'SMOTE x-coordinate', value: 1 + 0.25 * (5 - 1) },
      { label: 'SMOTE y-coordinate', value: 2 + 0.25 * (8 - 2) },
    ],
    working: [
      'Manhattan: |1 − 4| + |2 − 6| = 3 + 4 = 7.',
      'Euclidean: √((1 − 4)² + (2 − 6)²) = √25 = 5. Hamming counts both mismatched coordinates = 2.',
      'SMOTE: (1,2) + 0.25 × ((5,8) − (1,2)) = (1,2) + (1,1.5) = (2,3.5).',
    ],
  },
  {
    title: 'Linear regression gradient update',
    section: 'Gradient descent calculations',
    prompt: 'For one example x=2, y=5, θ₀=1, θ₁=1, use L=(y−(θ₀+θ₁x))² and learning rate α=0.1. Calculate the prediction, both loss gradients, and the updated parameters.',
    formula: '∂L/∂θ₀ = −2(y−ŷ); ∂L/∂θ₁ = −2x(y−ŷ); θ ← θ − α∇L',
    answers: [
      { label: 'Prediction ŷ', value: 1 + 1 * 2 },
      { label: 'Gradient ∂L/∂θ₀', value: -2 * (5 - (1 + 1 * 2)) },
      { label: 'Gradient ∂L/∂θ₁', value: -2 * 2 * (5 - (1 + 1 * 2)) },
      { label: 'Updated θ₀', value: 1 - 0.1 * (-2 * (5 - (1 + 1 * 2))) },
      { label: 'Updated θ₁', value: 1 - 0.1 * (-2 * 2 * (5 - (1 + 1 * 2))) },
    ],
    working: [
      'Prediction: ŷ = 1 + 1×2 = 3, so residual y−ŷ = 2.',
      '∂L/∂θ₀ = −2×2 = −4; ∂L/∂θ₁ = −2×2×2 = −8.',
      'Subtract the learning-rate-scaled gradients: θ₀ = 1−0.1(−4)=1.4; θ₁ = 1−0.1(−8)=1.8.',
    ],
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

export function renderCalculationLab(container: HTMLElement) {
  let exerciseIndex = 0;
  let solvedCount = 0;

  const render = () => {
    const exercise = EXERCISES[exerciseIndex];
    if (!exercise) {
      container.innerHTML = `
        <section class="game-card calculation-lab" data-calculation-lab>
          <div class="card-header">
            <div class="card-title-group"><h2>🧮 Calculation Lab complete</h2></div>
            <span class="concept-badge">${solvedCount} / ${EXERCISES.length} solved</span>
          </div>
          <p>You worked through the guide’s entropy, Gini, scaling, evaluation, ROC, distance, SMOTE, and gradient-update calculations.</p>
          <button class="btn btn-primary" type="button" data-calc-restart>Start again</button>
        </section>
      `;
      container.querySelector('[data-calc-restart]')?.addEventListener('click', () => {
        exerciseIndex = 0;
        solvedCount = 0;
        render();
      });
      return;
    }

    container.innerHTML = `
      <section class="game-card calculation-lab" data-calculation-lab>
        <div class="card-header">
          <div class="card-title-group">
            <h2>🧮 Calculation Lab</h2>
            <p class="card-subtitle">Work the numbers yourself, then check each result.</p>
          </div>
          <span class="concept-badge">${exerciseIndex + 1} / ${EXERCISES.length} • ${solvedCount} solved</span>
        </div>
        <div class="flashcard-progress-row">
          <span>${escapeHtml(exercise.section)}</span>
          <span>Exercise ${exerciseIndex + 1} of ${EXERCISES.length}</span>
        </div>
        <div class="flashcard-progress-track" role="progressbar" aria-label="Calculation lab progress" aria-valuemin="0" aria-valuemax="${EXERCISES.length}" aria-valuenow="${exerciseIndex}">
          <span style="width: ${(exerciseIndex / EXERCISES.length) * 100}%"></span>
        </div>
        <h3 class="calculation-title">${escapeHtml(exercise.title)}</h3>
        <p class="calculation-prompt">${escapeHtml(exercise.prompt)}</p>
        <p class="calculation-formula">${escapeHtml(exercise.formula)}</p>
        <form data-calc-form novalidate>
          <div class="calculation-input-grid">
            ${exercise.answers.map((answer, index) => `
              <label class="calculation-input">
                <span>${escapeHtml(answer.label)}</span>
                <input type="number" step="any" inputmode="decimal" data-calc-answer="${index}" aria-label="${escapeHtml(answer.label)}" required>
              </label>
            `).join('')}
          </div>
          <div class="calculation-actions">
            <button class="btn btn-primary" type="submit">Check calculations</button>
            <span class="calculation-feedback" aria-live="polite"></span>
          </div>
        </form>
        <div class="calculation-solution" hidden></div>
        <button class="btn btn-secondary" type="button" data-calc-next hidden>Next calculation →</button>
        <details class="math-explainer calculation-reference">
          <summary>Open the complete 523-line study reference</summary>
          <div class="explainer-content">
            <p>The reference includes the worked entropy table, metric formulas, gradient derivation, SVM fundamentals, and generalization review.</p>
            <a class="btn btn-secondary btn-sm" href="/speed-run-reference.md" target="_blank" rel="noopener">Open full study reference ↗</a>
          </div>
        </details>
      </section>
    `;

    const form = container.querySelector<HTMLFormElement>('[data-calc-form]')!;
    const feedback = container.querySelector<HTMLElement>('.calculation-feedback')!;
    const solution = container.querySelector<HTMLElement>('.calculation-solution')!;
    const nextButton = container.querySelector<HTMLButtonElement>('[data-calc-next]')!;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const inputs = [...form.querySelectorAll<HTMLInputElement>('[data-calc-answer]')];
      const allCorrect = inputs.every((input, index) => {
        const value = input.valueAsNumber;
        const expected = exercise.answers[index]!.value;
        const isCorrect = Number.isFinite(value) && Math.abs(value - expected) <= 0.01;
        input.setAttribute('aria-invalid', String(!isCorrect));
        input.classList.toggle('is-correct', isCorrect);
        input.classList.toggle('is-incorrect', !isCorrect);
        return isCorrect;
      });

      if (!allCorrect) {
        feedback.textContent = 'Not all results are correct yet. Check the marked fields and try again.';
        solution.hidden = true;
        nextButton.hidden = true;
        return;
      }

      solvedCount++;
      feedback.textContent = 'All calculations are correct!';
      solution.innerHTML = `
        <h4>Worked solution</h4>
        <ol>${exercise.working.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ol>
      `;
      solution.hidden = false;
      nextButton.hidden = false;
      inputs.forEach(input => input.disabled = true);
      form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = true;
    });

    nextButton.addEventListener('click', () => {
      exerciseIndex++;
      render();
    });
  };

  render();
}
