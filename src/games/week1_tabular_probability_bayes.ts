import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

interface TennisSample {
  id: number;
  outlook: 'Sunny' | 'Overcast' | 'Rain';
  temp: 'Hot' | 'Mild' | 'Cool';
  humidity: 'High' | 'Normal';
  wind: 'Strong' | 'Weak';
  play: 'Yes' | 'No';
}

const TENNIS_DATASET: TennisSample[] = [
  { id: 1,  outlook: 'Sunny',    temp: 'Hot',  humidity: 'High',   wind: 'Weak',   play: 'No' },
  { id: 2,  outlook: 'Sunny',    temp: 'Hot',  humidity: 'High',   wind: 'Strong', play: 'No' },
  { id: 3,  outlook: 'Overcast', temp: 'Hot',  humidity: 'High',   wind: 'Weak',   play: 'Yes' },
  { id: 4,  outlook: 'Rain',     temp: 'Mild', humidity: 'High',   wind: 'Weak',   play: 'Yes' },
  { id: 5,  outlook: 'Rain',     temp: 'Cool', humidity: 'Normal', wind: 'Weak',   play: 'Yes' },
  { id: 6,  outlook: 'Rain',     temp: 'Cool', humidity: 'Normal', wind: 'Strong', play: 'No' },
  { id: 7,  outlook: 'Overcast', temp: 'Cool', humidity: 'Normal', wind: 'Strong', play: 'Yes' },
  { id: 8,  outlook: 'Sunny',    temp: 'Mild', humidity: 'High',   wind: 'Weak',   play: 'No' },
  { id: 9,  outlook: 'Sunny',    temp: 'Cool', humidity: 'Normal', wind: 'Weak',   play: 'Yes' },
  { id: 10, outlook: 'Rain',     temp: 'Mild', humidity: 'Normal', wind: 'Weak',   play: 'Yes' },
  { id: 11, outlook: 'Sunny',    temp: 'Mild', humidity: 'Normal', wind: 'Strong', play: 'Yes' },
  { id: 12, outlook: 'Overcast', temp: 'Mild', humidity: 'High',   wind: 'Strong', play: 'Yes' },
  { id: 13, outlook: 'Overcast', temp: 'Hot',  humidity: 'Normal', wind: 'Weak',   play: 'Yes' },
  { id: 14, outlook: 'Rain',     temp: 'Mild', humidity: 'High',   wind: 'Strong', play: 'No' },
];

export function renderWeek1TabularProbabilityBayes(container: HTMLElement) {
  let activeTab: 'table' | 'contingency' | 'practice' | 'naive_bayes' = 'table';
  let selectedFeature: 'outlook' | 'temp' | 'humidity' | 'wind' = 'outlook';
  let filterVal: string | null = null;

  // Practice state
  let practiceCorrect = 0;
  let practiceTotal = 0;
  let currentQuestionIdx = 0;
  let practiceFeedback = '';

  const PRACTICE_QUESTIONS = [
    {
      q: 'From the dataset (N = 14), what is the Prior Probability P(Play = Yes)?',
      choices: ['9 / 14 (≈ 0.643)', '5 / 14 (≈ 0.357)', '9 / 9 (1.000)', '14 / 9 (1.555)'],
      correct: 0,
      expl: 'Count(Play = Yes) = 9 out of 14 total samples. Therefore P(Play = Yes) = 9/14 ≈ 0.643.'
    },
    {
      q: 'What is the Marginal Feature Probability P(Outlook = Sunny)?',
      choices: ['5 / 14 (≈ 0.357)', '2 / 9 (≈ 0.222)', '3 / 5 (0.600)', '4 / 14 (≈ 0.286)'],
      correct: 0,
      expl: 'Count(Sunny) = 5 samples (Rows 1, 2, 8, 9, 11). Therefore P(Sunny) = 5/14 ≈ 0.357.'
    },
    {
      q: 'What is the Conditional Probability (Likelihood) P(Outlook = Sunny | Play = Yes)?',
      choices: ['2 / 9 (≈ 0.222)', '2 / 14 (≈ 0.143)', '2 / 5 (0.400)', '5 / 9 (≈ 0.556)'],
      correct: 0,
      expl: 'P(Sunny | Yes) = Count(Sunny AND Yes) / Count(Yes) = 2 / 9 ≈ 0.222. Out of 9 "Yes" rows, only 2 have Sunny.'
    },
    {
      q: 'What is the Conditional Probability P(Outlook = Sunny | Play = No)?',
      choices: ['3 / 5 (0.600)', '3 / 14 (≈ 0.214)', '2 / 5 (0.400)', '5 / 5 (1.000)'],
      correct: 0,
      expl: 'P(Sunny | No) = Count(Sunny AND No) / Count(No) = 3 / 5 = 0.600. Out of 5 "No" rows, 3 have Sunny.'
    },
    {
      q: 'Using Bayes Rule: P(Play = Yes | Outlook = Sunny) = [P(Sunny | Yes) · P(Yes)] / P(Sunny). What is the result?',
      choices: ['2 / 5 (0.400)', '3 / 5 (0.600)', '2 / 9 (≈ 0.222)', '9 / 14 (≈ 0.643)'],
      correct: 0,
      expl: 'P(Yes | Sunny) = (2/9 · 9/14) / (5/14) = (2/14) / (5/14) = 2/5 = 0.400. Direct count: 2 Yes out of 5 Sunny.'
    },
    {
      q: 'What is the Conditional Probability P(Humidity = High | Play = No)?',
      choices: ['4 / 5 (0.800)', '3 / 9 (≈ 0.333)', '4 / 14 (≈ 0.286)', '1 / 5 (0.200)'],
      correct: 0,
      expl: 'Out of 5 "No" samples, 4 have High humidity (Rows 1, 2, 8, 14). So P(High | No) = 4/5 = 0.800.'
    }
  ];
  const practiceChoiceOrders = PRACTICE_QUESTIONS.map(question => {
    const order = question.choices.map((_, index) => index);
    for (let index = order.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex]!, order[index]!];
    }
    if (order[0] === question.correct) {
      const firstIncorrect = order.findIndex(index => index !== question.correct);
      [order[0], order[firstIncorrect]] = [order[firstIncorrect]!, order[0]!];
    }
    return order;
  });

  // Naive Bayes Test query state
  let testOutlook: 'Sunny' | 'Overcast' | 'Rain' = 'Sunny';
  let testTemp: 'Hot' | 'Mild' | 'Cool' = 'Cool';
  let testHumidity: 'High' | 'Normal' = 'High';
  let testWind: 'Strong' | 'Weak' = 'Strong';

  function render() {
    const N = TENNIS_DATASET.length; // 14
    const yesRows = TENNIS_DATASET.filter(d => d.play === 'Yes');
    const noRows = TENNIS_DATASET.filter(d => d.play === 'No');

    // Contingency matrix for selectedFeature
    const featureValues = Array.from(new Set(TENNIS_DATASET.map(d => d[selectedFeature])));
    const contingencyData = featureValues.map(val => {
      const totalMatching = TENNIS_DATASET.filter(d => d[selectedFeature] === val);
      const yesMatching = totalMatching.filter(d => d.play === 'Yes').length;
      const noMatching = totalMatching.filter(d => d.play === 'No').length;
      return {
        val,
        total: totalMatching.length,
        p_x: totalMatching.length / N,
        yes: yesMatching,
        no: noMatching,
        p_x_given_yes: yesMatching / yesRows.length,
        p_x_given_no: noMatching / noRows.length,
        p_yes_given_x: totalMatching.length > 0 ? yesMatching / totalMatching.length : 0,
        p_no_given_x: totalMatching.length > 0 ? noMatching / totalMatching.length : 0,
      };
    });

    // Naive Bayes calculation for current test sample
    const pYes = yesRows.length / N;
    const pNo = noRows.length / N;

    const pOutlookYes = yesRows.filter(d => d.outlook === testOutlook).length / yesRows.length;
    const pOutlookNo = noRows.filter(d => d.outlook === testOutlook).length / noRows.length;

    const pTempYes = yesRows.filter(d => d.temp === testTemp).length / yesRows.length;
    const pTempNo = noRows.filter(d => d.temp === testTemp).length / noRows.length;

    const pHumidityYes = yesRows.filter(d => d.humidity === testHumidity).length / yesRows.length;
    const pHumidityNo = noRows.filter(d => d.humidity === testHumidity).length / noRows.length;

    const pWindYes = yesRows.filter(d => d.wind === testWind).length / yesRows.length;
    const pWindNo = noRows.filter(d => d.wind === testWind).length / noRows.length;

    const unnormYes = pYes * pOutlookYes * pTempYes * pHumidityYes * pWindYes;
    const unnormNo = pNo * pOutlookNo * pTempNo * pHumidityNo * pWindNo;
    const totalEvidence = unnormYes + unnormNo;
    const postYes = totalEvidence > 0 ? unnormYes / totalEvidence : 0.5;
    const postNo = totalEvidence > 0 ? unnormNo / totalEvidence : 0.5;

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>📊 Game 1.5: Tabular Probability & Bayes Matrix</h2>
            <p class="card-subtitle">Master Computing Prior P(Y), Marginal P(X), Likelihood P(X|Y), Posterior P(Y|X) & Naive Bayes from Tabular Datasets</p>
          </div>
          <span class="concept-badge">Probability Foundations</span>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; flex-wrap: wrap;">
          <button id="tab-table" class="btn btn-sm ${activeTab === 'table' ? 'btn-primary' : 'btn-secondary'}">
            📋 1. Raw Dataset (N=14)
          </button>
          <button id="tab-contingency" class="btn btn-sm ${activeTab === 'contingency' ? 'btn-primary' : 'btn-secondary'}">
            🧮 2. Contingency & Conditional Matrix
          </button>
          <button id="tab-practice" class="btn btn-sm ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}">
            🎯 3. Probability Drill & Practice (${practiceCorrect}/${practiceTotal})
          </button>
          <button id="tab-naive" class="btn btn-sm ${activeTab === 'naive_bayes' ? 'btn-primary' : 'btn-secondary'}">
            ⚡ 4. Naive Bayes Classifier
          </button>
        </div>

        ${activeTab === 'table' ? `
          <!-- Tab 1: Dataset Explorer -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
              <div>
                <strong style="color: var(--accent-cyan); font-size: 14px;">Canonical ML Weather Dataset:</strong>
                <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">14 Days • Target: PlayTennis (9 Yes, 5 No)</span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 12px; color: var(--text-muted);">Quick Filter:</span>
                <button class="btn btn-xs ${filterVal === null ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="all">All (14)</button>
                <button class="btn btn-xs ${filterVal === 'Sunny' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="Sunny">Sunny (5)</button>
                <button class="btn btn-xs ${filterVal === 'Overcast' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="Overcast">Overcast (4)</button>
                <button class="btn btn-xs ${filterVal === 'Rain' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="Rain">Rain (5)</button>
                <button class="btn btn-xs ${filterVal === 'Yes' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="Yes">Play = Yes (9)</button>
                <button class="btn btn-xs ${filterVal === 'No' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-val="No">Play = No (5)</button>
              </div>
            </div>

            <!-- Table -->
            <div style="overflow-x: auto; background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); max-height: 420px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                  <tr style="background: rgba(0, 240, 255, 0.08); border-bottom: 1px solid var(--border-color);">
                    <th style="padding: 10px 14px; color: var(--text-muted);"># Day</th>
                    <th style="padding: 10px 14px; color: var(--accent-cyan);">Outlook</th>
                    <th style="padding: 10px 14px; color: #c084fc;">Temperature</th>
                    <th style="padding: 10px 14px; color: var(--accent-amber);">Humidity</th>
                    <th style="padding: 10px 14px; color: #38bdf8;">Wind</th>
                    <th style="padding: 10px 14px; color: var(--accent-green);">Play Tennis (Y)</th>
                  </tr>
                </thead>
                <tbody>
                  ${TENNIS_DATASET.map(d => {
                    const matchesFilter = filterVal === null ||
                      d.outlook === filterVal ||
                      d.play === filterVal;
                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: ${matchesFilter ? (filterVal ? 'rgba(0, 240, 255, 0.08)' : 'transparent') : 'rgba(0,0,0,0.3)'}; opacity: ${matchesFilter ? '1' : '0.35'}; transition: all 0.2s;">
                        <td style="padding: 8px 14px; font-family:'Fira Code'; color:var(--text-muted);">${d.id}</td>
                        <td style="padding: 8px 14px; font-weight:bold; color:var(--accent-cyan);">${d.outlook}</td>
                        <td style="padding: 8px 14px;">${d.temp}</td>
                        <td style="padding: 8px 14px;">${d.humidity}</td>
                        <td style="padding: 8px 14px;">${d.wind}</td>
                        <td style="padding: 8px 14px;">
                          <span class="badge-pill" style="background:${d.play === 'Yes' ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,68,0.15)'}; color:${d.play === 'Yes' ? 'var(--accent-green)' : 'var(--accent-red)'}; border:1px solid ${d.play === 'Yes' ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,68,0.3)'};">
                            ${d.play}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Quick Summary Metrics -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px;">
              <div style="background: rgba(0, 255, 136, 0.06); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">PRIOR P(Play = Yes)</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--accent-green); margin-top: 4px;">9 / 14 ≈ 0.643</div>
              </div>
              <div style="background: rgba(255, 51, 68, 0.06); border: 1px solid rgba(255, 51, 68, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">PRIOR P(Play = No)</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--accent-red); margin-top: 4px;">5 / 14 ≈ 0.357</div>
              </div>
              <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">SUM RULE CHECK</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--accent-cyan); margin-top: 4px;">P(Yes) + P(No) = 1.0</div>
              </div>
              <div style="background: rgba(157, 78, 221, 0.06); border: 1px solid rgba(157, 78, 221, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">TOTAL SAMPLES N</div>
                <div style="font-size: 18px; font-weight: bold; color: #c084fc; margin-top: 4px;">14 Instances</div>
              </div>
            </div>
          </div>
        ` : activeTab === 'contingency' ? `
          <!-- Tab 2: Contingency Matrix -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-secondary);">Select Feature to Compute Probabilities:</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm ${selectedFeature === 'outlook' ? 'btn-primary' : 'btn-secondary'} btn-sel-feat" data-f="outlook">Outlook</button>
                <button class="btn btn-sm ${selectedFeature === 'temp' ? 'btn-primary' : 'btn-secondary'} btn-sel-feat" data-f="temp">Temperature</button>
                <button class="btn btn-sm ${selectedFeature === 'humidity' ? 'btn-primary' : 'btn-secondary'} btn-sel-feat" data-f="humidity">Humidity</button>
                <button class="btn btn-sm ${selectedFeature === 'wind' ? 'btn-primary' : 'btn-secondary'} btn-sel-feat" data-f="wind">Wind</button>
              </div>
            </div>

            <!-- Contingency & Probability Table -->
            <div style="overflow-x: auto; background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 18px;">
              <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13px;">
                <thead>
                  <tr style="background: rgba(0, 240, 255, 0.08); border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 12px; text-align: left; color: var(--accent-cyan);">Value (x)</th>
                    <th style="padding: 12px; color: var(--text-muted);">Count(x)</th>
                    <th style="padding: 12px; color: var(--accent-cyan);">Marginal P(x)</th>
                    <th style="padding: 12px; color: var(--accent-green);">Play = Yes</th>
                    <th style="padding: 12px; color: var(--accent-red);">Play = No</th>
                    <th style="padding: 12px; color: #a7f3d0;">Likelihood P(x | Yes)</th>
                    <th style="padding: 12px; color: #fca5a5;">Likelihood P(x | No)</th>
                    <th style="padding: 12px; color: #fef08a;">Posterior P(Yes | x)</th>
                  </tr>
                </thead>
                <tbody>
                  ${contingencyData.map(row => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <td style="padding: 10px 14px; text-align: left; font-weight: bold; color: #fff;">${row.val}</td>
                      <td style="padding: 10px; font-family:'Fira Code';">${row.total}</td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:var(--accent-cyan);">${row.total}/14 (≈ ${row.p_x.toFixed(3)})</td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:var(--accent-green); font-weight:bold;">${row.yes}</td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:var(--accent-red); font-weight:bold;">${row.no}</td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:#a7f3d0; background:rgba(0,255,136,0.04); font-weight:bold;">
                        ${row.yes}/9 (≈ ${row.p_x_given_yes.toFixed(3)})
                      </td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:#fca5a5; background:rgba(255,51,68,0.04); font-weight:bold;">
                        ${row.no}/5 (≈ ${row.p_x_given_no.toFixed(3)})
                      </td>
                      <td style="padding: 10px; font-family:'Fira Code'; color:#fef08a; font-weight:bold;">
                        ${row.yes}/${row.total} (≈ ${row.p_yes_given_x.toFixed(3)})
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Mathematical Formula Explainer Card -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
              <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 14px;">
                <strong style="color: var(--accent-cyan); font-size: 13px;">1. Marginal P(X = x)</strong>
                <div class="formula-block" style="font-size: 11px; margin-top: 6px;">
                  P(x) = Count(x) / N
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">
                  Total probability of feature value x across all class outcomes.
                </p>
              </div>

              <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px; padding: 14px;">
                <strong style="color: var(--accent-green); font-size: 13px;">2. Likelihood P(X = x | Y = y)</strong>
                <div class="formula-block" style="font-size: 11px; margin-top: 6px;">
                  P(x | y) = Count(x ∩ y) / Count(y)
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">
                  Frequency of feature x strictly within subset of class y.
                </p>
              </div>

              <div style="background: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.2); border-radius: 8px; padding: 14px;">
                <strong style="color: var(--accent-amber); font-size: 13px;">3. Bayes Theorem P(Y = y | X = x)</strong>
                <div class="formula-block" style="font-size: 11px; margin-top: 6px;">
                  P(y | x) = [P(x | y) · P(y)] / P(x)
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">
                  Inverting the conditioning to find class posterior probability!
                </p>
              </div>
            </div>
          </div>
        ` : activeTab === 'practice' ? `
          <!-- Tab 3: Probability Practice Drill -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <span style="font-size: 12px; text-transform: uppercase; color: var(--accent-amber); font-weight: bold; letter-spacing: 1px;">
                  Question ${currentQuestionIdx + 1} of ${PRACTICE_QUESTIONS.length}
                </span>
                <span class="badge-pill">Mastery Score: ${practiceCorrect} / ${practiceTotal}</span>
              </div>

              <h3 style="font-size: 17px; color: #fff; margin-bottom: 18px; line-height: 1.5;">
                ${PRACTICE_QUESTIONS[currentQuestionIdx]!.q}
              </h3>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                ${practiceChoiceOrders[currentQuestionIdx]!.map((choiceIdx, displayIdx) => `
                  <button class="btn btn-secondary btn-q-choice" data-idx="${choiceIdx}" style="text-align: left; padding: 14px 18px; font-family:'Fira Code'; font-size: 13px;">
                    ${String.fromCharCode(65 + displayIdx)}) ${PRACTICE_QUESTIONS[currentQuestionIdx]!.choices[choiceIdx]}
                  </button>
                `).join('')}
              </div>

              <div id="practice-feedback" style="min-height: 36px; margin-bottom: 14px;">
                ${practiceFeedback}
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <button id="btn-prev-q" class="btn btn-secondary btn-sm" ${currentQuestionIdx === 0 ? 'disabled' : ''}>◀ Previous Question</button>
                <button id="btn-next-q" class="btn btn-primary btn-sm" ${currentQuestionIdx === PRACTICE_QUESTIONS.length - 1 ? 'disabled' : ''}>Next Question ▶</button>
              </div>
            </div>
          </div>
        ` : `
          <!-- Tab 4: Naive Bayes Classifier -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 6px;">⚡ Naive Bayes Real-Time Predictor</h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 18px;">
                Conditional Independence Assumption: \\( P(X_1, \\dots, X_d \\mid Y) = \\prod_{i=1}^d P(X_i \\mid Y) \\). Configure unseen test query probe \\( X^* \\):
              </p>

              <!-- Probe selectors -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px;">
                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Outlook</label>
                  <select id="sel-nb-outlook" class="form-control" style="width: 100%; margin-top: 4px; padding: 8px; background: #0c1220; border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
                    <option value="Sunny" ${testOutlook === 'Sunny' ? 'selected' : ''}>Sunny</option>
                    <option value="Overcast" ${testOutlook === 'Overcast' ? 'selected' : ''}>Overcast</option>
                    <option value="Rain" ${testOutlook === 'Rain' ? 'selected' : ''}>Rain</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Temperature</label>
                  <select id="sel-nb-temp" class="form-control" style="width: 100%; margin-top: 4px; padding: 8px; background: #0c1220; border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
                    <option value="Hot" ${testTemp === 'Hot' ? 'selected' : ''}>Hot</option>
                    <option value="Mild" ${testTemp === 'Mild' ? 'selected' : ''}>Mild</option>
                    <option value="Cool" ${testTemp === 'Cool' ? 'selected' : ''}>Cool</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Humidity</label>
                  <select id="sel-nb-humidity" class="form-control" style="width: 100%; margin-top: 4px; padding: 8px; background: #0c1220; border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
                    <option value="High" ${testHumidity === 'High' ? 'selected' : ''}>High</option>
                    <option value="Normal" ${testHumidity === 'Normal' ? 'selected' : ''}>Normal</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Wind</label>
                  <select id="sel-nb-wind" class="form-control" style="width: 100%; margin-top: 4px; padding: 8px; background: #0c1220; border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
                    <option value="Strong" ${testWind === 'Strong' ? 'selected' : ''}>Strong</option>
                    <option value="Weak" ${testWind === 'Weak' ? 'selected' : ''}>Weak</option>
                  </select>
                </div>
              </div>

              <!-- Computed Products Comparison -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px;">
                <!-- Class Yes Box -->
                <div style="background: rgba(0, 255, 136, 0.05); border: 2px solid ${postYes >= postNo ? 'var(--accent-green)' : 'rgba(0, 255, 136, 0.2)'}; border-radius: var(--radius-md); padding: 18px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color: var(--accent-green); font-size: 16px;">Class: Play = YES</strong>
                    <span style="font-size: 18px; font-weight: 800; color: var(--accent-green);">${(postYes * 100).toFixed(1)}%</span>
                  </div>
                  <div class="formula-block" style="font-size: 11px; margin: 10px 0; line-height: 1.6;">
                    P(Yes) · ∏ P(x_i | Yes)<br>
                    = (9/14) · (${pOutlookYes.toFixed(3)}) · (${pTempYes.toFixed(3)}) · (${pHumidityYes.toFixed(3)}) · (${pWindYes.toFixed(3)})<br>
                    = <strong>${unnormYes.toFixed(6)}</strong>
                  </div>
                </div>

                <!-- Class No Box -->
                <div style="background: rgba(255, 51, 68, 0.05); border: 2px solid ${postNo > postYes ? 'var(--accent-red)' : 'rgba(255, 51, 68, 0.2)'}; border-radius: var(--radius-md); padding: 18px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color: var(--accent-red); font-size: 16px;">Class: Play = NO</strong>
                    <span style="font-size: 18px; font-weight: 800; color: var(--accent-red);">${(postNo * 100).toFixed(1)}%</span>
                  </div>
                  <div class="formula-block" style="font-size: 11px; margin: 10px 0; line-height: 1.6;">
                    P(No) · ∏ P(x_i | No)<br>
                    = (5/14) · (${pOutlookNo.toFixed(3)}) · (${pTempNo.toFixed(3)}) · (${pHumidityNo.toFixed(3)}) · (${pWindNo.toFixed(3)})<br>
                    = <strong>${unnormNo.toFixed(6)}</strong>
                  </div>
                </div>
              </div>

              <!-- Final Classification Decision Banner -->
              <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--accent-cyan); border-radius: 8px; padding: 14px 18px; text-align: center;">
                <span style="font-size: 13px; color: #fff;">
                  Naive Bayes Classification Decision:
                  <strong style="font-size: 16px; color: ${postYes >= postNo ? 'var(--accent-green)' : 'var(--accent-red)'}; margin-left: 8px;">
                    PREDICT PLAY = ${postYes >= postNo ? 'YES' : 'NO'} (${Math.max(postYes, postNo) > 0 ? (Math.max(postYes, postNo) * 100).toFixed(1) : 50}%)
                  </strong>
                </span>
              </div>
            </div>
          </div>
        `}

        <!-- Verify Mastery Check -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <div id="bayes-cert-feedback" style="font-size: 13px;"></div>
          <button id="btn-certify-bayes" class="btn btn-primary">Verify Tabular Probability Mastery</button>
        </div>

        <!-- Academic Explainer Card -->
        <details class="math-explainer">
          <summary>💡 Course Slide Takeaway: Contingency Tables & Bayes Rules (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Sum Rule:</strong> \\( P(X = x) = \\sum_{y} P(X = x, Y = y) \\) computes the marginal distribution by summing across all columns of a joint probability contingency matrix.</p>
            <p><strong>Product Rule:</strong> \\( P(X = x, Y = y) = P(X = x \\mid Y = y) \\cdot P(Y = y) \\).</p>
            <p><strong>Bayes Rule:</strong> \\( P(Y = y \\mid X = x) = \\frac{P(X = x \\mid Y = y) \\cdot P(Y = y)}{P(X = x)} \\).</p>
            <p><strong>Zero Frequency Problem & Laplace Smoothing:</strong> If an attribute value never appears with a class, \\( P(X_i \\mid Y) = 0 \\), wiping out the whole product! Additive Laplace smoothing resolves this: \\( \\hat{P}(X_i = v \\mid Y = c) = \\frac{\\text{Count} + 1}{\\text{Total} + |V|} \\).</p>
          </div>
        </details>
      </div>
    `;

    // Tab Listeners
    container.querySelector('#tab-table')?.addEventListener('click', () => { sound.playClick(); activeTab = 'table'; render(); });
    container.querySelector('#tab-contingency')?.addEventListener('click', () => { sound.playClick(); activeTab = 'contingency'; render(); });
    container.querySelector('#tab-practice')?.addEventListener('click', () => { sound.playClick(); activeTab = 'practice'; render(); });
    container.querySelector('#tab-naive')?.addEventListener('click', () => { sound.playClick(); activeTab = 'naive_bayes'; render(); });

    // Table filter buttons
    container.querySelectorAll('.btn-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const v = (e.currentTarget as HTMLElement).dataset.val;
        filterVal = v === 'all' ? null : v || null;
        render();
      });
    });

    // Contingency feature buttons
    container.querySelectorAll('.btn-sel-feat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        selectedFeature = (e.currentTarget as HTMLElement).dataset.f as any;
        render();
      });
    });

    // Practice choices
    container.querySelectorAll('.btn-q-choice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choiceIdx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0');
        const q = PRACTICE_QUESTIONS[currentQuestionIdx]!;
        practiceTotal++;
        if (choiceIdx === q.correct) {
          sound.playCorrect();
          practiceCorrect++;
          gameManager.addScore(50, 25);
          practiceFeedback = `
            <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px; color: #a7f3d0;">
              <strong>✓ Correct! (+50 Score)</strong> ${q.expl}
            </div>
          `;
        } else {
          sound.playWrong();
          practiceFeedback = `
            <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px; color: #fca5a5;">
              <strong>✗ Incorrect!</strong> ${q.expl}
            </div>
          `;
        }
        render();
      });
    });

    container.querySelector('#btn-prev-q')?.addEventListener('click', () => {
      if (currentQuestionIdx > 0) {
        sound.playClick();
        currentQuestionIdx--;
        practiceFeedback = '';
        render();
      }
    });

    container.querySelector('#btn-next-q')?.addEventListener('click', () => {
      if (currentQuestionIdx < PRACTICE_QUESTIONS.length - 1) {
        sound.playClick();
        currentQuestionIdx++;
        practiceFeedback = '';
        render();
      }
    });

    // Naive Bayes select change listeners
    container.querySelector('#sel-nb-outlook')?.addEventListener('change', (e) => {
      testOutlook = (e.target as HTMLSelectElement).value as any;
      render();
    });
    container.querySelector('#sel-nb-temp')?.addEventListener('change', (e) => {
      testTemp = (e.target as HTMLSelectElement).value as any;
      render();
    });
    container.querySelector('#sel-nb-humidity')?.addEventListener('change', (e) => {
      testHumidity = (e.target as HTMLSelectElement).value as any;
      render();
    });
    container.querySelector('#sel-nb-wind')?.addEventListener('change', (e) => {
      testWind = (e.target as HTMLSelectElement).value as any;
      render();
    });

    // Certification button
    container.querySelector('#btn-certify-bayes')?.addEventListener('click', () => {
      const fb = container.querySelector('#bayes-cert-feedback');
      if (practiceCorrect >= 2 || activeTab === 'naive_bayes') {
        sound.playVictory();
        confetti({ particleCount: 75, spread: 65 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week1_bayes');

        if (fb) {
          fb.innerHTML = `
            <span style="color: var(--accent-green); font-weight: bold;">
              🎉 Tabular Probability & Bayes Mastery Certified! (+150 Score)
            </span>
          `;
        }
      } else {
        sound.playWrong();
        if (fb) {
          fb.innerHTML = `
            <span style="color: var(--accent-amber); font-weight: bold;">
              ⚠️ Answer at least 2 questions in Tab 3 (Practice Drill) to earn certification!
            </span>
          `;
        }
      }
    });
  }

  render();
}
