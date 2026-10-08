import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface SensorPoint {
  id: number;
  x: number;
  y: 'Normal' | 'Faulty';
}

const DATASET_Q14: SensorPoint[] = [
  { id: 1, x: 2, y: 'Normal' },
  { id: 2, x: 4, y: 'Normal' },
  { id: 3, x: 6, y: 'Faulty' },
  { id: 4, x: 8, y: 'Faulty' },
  { id: 5, x: 10, y: 'Faulty' }
];

interface CustomerRecord {
  id: number;
  age: 'Youth' | 'Middle' | 'Senior';
  income: 'High' | 'Low';
  student: 'No' | 'Yes';
  buys: 'Yes' | 'No';
}

const CUSTOMER_DATA: CustomerRecord[] = [
  { id: 1, age: 'Youth',  income: 'High', student: 'No',  buys: 'No' },
  { id: 2, age: 'Youth',  income: 'High', student: 'No',  buys: 'No' },
  { id: 3, age: 'Middle', income: 'High', student: 'No',  buys: 'Yes' },
  { id: 4, age: 'Senior', income: 'Low',  student: 'No',  buys: 'Yes' },
  { id: 5, age: 'Senior', income: 'Low',  student: 'Yes', buys: 'Yes' },
  { id: 6, age: 'Senior', income: 'Low',  student: 'Yes', buys: 'No' },
  { id: 7, age: 'Middle', income: 'Low',  student: 'Yes', buys: 'Yes' },
  { id: 8, age: 'Youth',  income: 'High', student: 'No',  buys: 'No' },
  { id: 9, age: 'Youth',  income: 'Low',  student: 'Yes', buys: 'Yes' },
  { id: 10,age: 'Senior', income: 'High', student: 'Yes', buys: 'Yes' },
];

export function renderWeek3DecisionTree(container: HTMLElement) {
  let activeTab: 'guillotine' | 'impurity_curves' | 'attribute_selection' | 'pruning' = 'guillotine';

  // Guillotine (Q14) state
  let threshold = 5.0; // t1 = 5 or t2 = 7
  let impurityMetric: 'entropy' | 'gini' = 'entropy';

  // Impurity curve interactive probability state
  let probP = 0.5;

  // Pruning state
  let treeDepth = 2;
  let alphaPenalty = 0.05;

  // Tabular Attribute selection state
  let selectedRootAttribute: string | null = null;
  let attrQuizFeedback = '';

  function entropy(pNormal: number, pFaulty: number): number {
    let h = 0;
    if (pNormal > 0) h -= pNormal * Math.log2(pNormal);
    if (pFaulty > 0) h -= pFaulty * Math.log2(pFaulty);
    return h;
  }

  function gini(pNormal: number, pFaulty: number): number {
    return 1 - (pNormal * pNormal + pFaulty * pFaulty);
  }

  function classError(pNormal: number, pFaulty: number): number {
    return 1 - Math.max(pNormal, pFaulty);
  }

  const nTotal = DATASET_Q14.length;
  const pNormParent = 2 / 5;
  const pFaultParent = 3 / 5;
  const parentEntropy = entropy(pNormParent, pFaultParent); // 0.971 bits
  const parentGini = gini(pNormParent, pFaultParent); // 0.480

  function computeSplit(t: number) {
    const left = DATASET_Q14.filter(d => d.x <= t);
    const right = DATASET_Q14.filter(d => d.x > t);

    const leftNorm = left.filter(d => d.y === 'Normal').length;
    const leftFault = left.filter(d => d.y === 'Faulty').length;
    const rightNorm = right.filter(d => d.y === 'Normal').length;
    const rightFault = right.filter(d => d.y === 'Faulty').length;

    const pLeftNorm = left.length ? leftNorm / left.length : 0;
    const pLeftFault = left.length ? leftFault / left.length : 0;
    const pRightNorm = right.length ? rightNorm / right.length : 0;
    const pRightFault = right.length ? rightFault / right.length : 0;

    const leftH = entropy(pLeftNorm, pLeftFault);
    const rightH = entropy(pRightNorm, pRightFault);
    const splitH = (left.length / nTotal) * leftH + (right.length / nTotal) * rightH;
    const infoGain = parentEntropy - splitH;

    const leftG = gini(pLeftNorm, pLeftFault);
    const rightG = gini(pRightNorm, pRightFault);
    const splitG = (left.length / nTotal) * leftG + (right.length / nTotal) * rightG;
    const giniGain = parentGini - splitG;

    return {
      left, right,
      leftNorm, leftFault, rightNorm, rightFault,
      leftH, rightH, splitH, infoGain,
      leftG, rightG, splitG, giniGain
    };
  }

  // Calculate attribute gains for Customer Dataset
  function computeAttributeGains() {
    const totalN = CUSTOMER_DATA.length; // 10
    const yesCount = CUSTOMER_DATA.filter(d => d.buys === 'Yes').length; // 6
    const noCount = CUSTOMER_DATA.filter(d => d.buys === 'No').length; // 4
    const parentH = entropy(yesCount / totalN, noCount / totalN);
    const parentG = gini(yesCount / totalN, noCount / totalN);

    // Compute for attribute 'age'
    const ageVals = ['Youth', 'Middle', 'Senior'] as const;
    let ageSplitH = 0;
    let ageSplitG = 0;
    ageVals.forEach(v => {
      const sub = CUSTOMER_DATA.filter(d => d.age === v);
      if (sub.length === 0) return;
      const y = sub.filter(d => d.buys === 'Yes').length / sub.length;
      const n = sub.filter(d => d.buys === 'No').length / sub.length;
      ageSplitH += (sub.length / totalN) * entropy(y, n);
      ageSplitG += (sub.length / totalN) * gini(y, n);
    });
    const igAge = parentH - ageSplitH;
    const ggAge = parentG - ageSplitG;

    // Compute for attribute 'income'
    const incVals = ['High', 'Low'] as const;
    let incSplitH = 0;
    let incSplitG = 0;
    incVals.forEach(v => {
      const sub = CUSTOMER_DATA.filter(d => d.income === v);
      if (sub.length === 0) return;
      const y = sub.filter(d => d.buys === 'Yes').length / sub.length;
      const n = sub.filter(d => d.buys === 'No').length / sub.length;
      incSplitH += (sub.length / totalN) * entropy(y, n);
      incSplitG += (sub.length / totalN) * gini(y, n);
    });
    const igIncome = parentH - incSplitH;
    const ggIncome = parentG - incSplitG;

    // Compute for attribute 'student'
    const studVals = ['No', 'Yes'] as const;
    let studSplitH = 0;
    let studSplitG = 0;
    studVals.forEach(v => {
      const sub = CUSTOMER_DATA.filter(d => d.student === v);
      if (sub.length === 0) return;
      const y = sub.filter(d => d.buys === 'Yes').length / sub.length;
      const n = sub.filter(d => d.buys === 'No').length / sub.length;
      studSplitH += (sub.length / totalN) * entropy(y, n);
      studSplitG += (sub.length / totalN) * gini(y, n);
    });
    const igStudent = parentH - studSplitH;
    const ggStudent = parentG - studSplitG;

    return {
      parentH, parentG,
      age: { ig: igAge, gg: ggAge },
      income: { ig: igIncome, gg: ggIncome },
      student: { ig: igStudent, gg: ggStudent }
    };
  }

  function render() {
    const s = computeSplit(threshold);
    const attrGains = computeAttributeGains();

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🌳 Game 3.1: Entropy & Gini Guillotine (Decision Tree Suite)</h2>
            <p class="card-subtitle">Master Purity Metrics (Gini vs Entropy vs Error), Continuous Splits (Q14), Tabular ID3/CART & Pruning</p>
          </div>
          <span class="concept-badge">Midterm Question 14 Focus</span>
        </div>

        <!-- Suite Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; flex-wrap: wrap;">
          <button id="tab-guillotine" class="btn btn-sm ${activeTab === 'guillotine' ? 'btn-primary' : 'btn-secondary'}">
            🔪 1. Continuous Split Guillotine (Q14)
          </button>
          <button id="tab-curves" class="btn btn-sm ${activeTab === 'impurity_curves' ? 'btn-primary' : 'btn-secondary'}">
            📈 2. Gini vs Entropy vs Error Curves
          </button>
          <button id="tab-attribute" class="btn btn-sm ${activeTab === 'attribute_selection' ? 'btn-primary' : 'btn-secondary'}">
            📊 3. Tabular Attribute Selection (ID3/CART)
          </button>
          <button id="tab-pruning" class="btn btn-sm ${activeTab === 'pruning' ? 'btn-primary' : 'btn-secondary'}">
            ✂️ 4. Tree Depth & Overfitting Pruning
          </button>
        </div>

        ${activeTab === 'guillotine' ? `
          <!-- Tab 1: Continuous Split Guillotine (Midterm Q14) -->
          <div style="animation: fadeIn 0.3s ease;">
            <div class="controls-panel">
              <div class="control-item">
                <label>Candidate Split Threshold t (Midterm Q14)</label>
                <div style="display:flex; gap: 8px;">
                  <button id="btn-t-5" class="btn btn-sm ${threshold === 5 ? 'btn-primary' : 'btn-secondary'}">t₁ = 5 (Candidate 1 - Pure Split)</button>
                  <button id="btn-t-7" class="btn btn-sm ${threshold === 7 ? 'btn-primary' : 'btn-secondary'}">t₂ = 7 (Candidate 2 - Impure Split)</button>
                </div>
              </div>

              <div class="control-item">
                <label>Threshold Knife Slider: <span id="thresh-label">${threshold.toFixed(1)}</span></label>
                <input type="range" id="tree-t-slider" min="1" max="11" step="1" value="${threshold}">
              </div>

              <div class="control-item">
                <label>Impurity Metric</label>
                <select id="metric-select">
                  <option value="entropy" ${impurityMetric === 'entropy' ? 'selected' : ''}>Shannon Entropy (Bits) [Midterm Q14]</option>
                  <option value="gini" ${impurityMetric === 'gini' ? 'selected' : ''}>Gini Impurity (CART Index)</option>
                </select>
              </div>
            </div>

            <!-- Interactive Guillotine Slice Canvas -->
            <div class="game-viewport" style="height: 200px; margin-bottom: 20px;">
              <canvas id="tree-canvas" width="800" height="200" style="width: 100%; height: 100%;"></canvas>
              <div class="viewport-overlay">
                <div><strong style="color:var(--accent-cyan);">Parent Node:</strong> ${impurityMetric === 'entropy' ? `H = ${parentEntropy.toFixed(3)} bits` : `Gini = ${parentGini.toFixed(3)}`} (2 Normal, 3 Faulty)</div>
                <div><strong style="color:var(--accent-green);">Split t = ${threshold}:</strong> Weighted Residual Impurity = ${impurityMetric === 'entropy' ? `${s.splitH.toFixed(3)} bits` : `${s.splitG.toFixed(3)}`}</div>
                <div style="font-size:14px; margin-top:2px;">
                  <strong style="color:var(--accent-amber);">${impurityMetric === 'entropy' ? 'Information Gain (IG):' : 'Gini Impurity Reduction:'}</strong> 
                  <span style="font-size:16px; font-weight:bold; color:#fef08a;">${impurityMetric === 'entropy' ? `${s.infoGain.toFixed(3)} bits` : `${s.giniGain.toFixed(3)}`}</span>
                </div>
              </div>
            </div>

            <!-- Visual Decision Tree Node Architecture -->
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;">
              <h4 style="text-align: center; color: var(--accent-cyan); font-size: 14px; margin-bottom: 16px;">Decision Tree Node Partition Diagram</h4>
              
              <!-- Parent Root Node -->
              <div style="display:flex; justify-content:center; margin-bottom: 12px;">
                <div class="decision-tree-node" style="background: rgba(20, 30, 50, 0.9); border: 2px solid var(--accent-cyan); border-radius: 12px; padding: 12px 24px; text-align: center; min-width: 260px;">
                  <strong style="color: #fff; font-size: 14px;">Root: Is Sensor Reading X ≤ ${threshold}?</strong>
                  <div style="font-family:'Fira Code'; font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                    All 5 Sensors (2 Norm, 3 Faulty) • H = ${parentEntropy.toFixed(3)} • Gini = ${parentGini.toFixed(3)}
                  </div>
                </div>
              </div>

              <!-- Branches -->
              <div style="display: flex; justify-content: space-around;">
                <!-- Left Branch -->
                <div style="flex: 1; display:flex; flex-direction:column; align-items:center;">
                  <div style="font-family:'Fira Code'; font-size:12px; color:var(--accent-green); margin-bottom:6px;">YES (X ≤ ${threshold})</div>
                  <div class="decision-tree-node" style="background: rgba(15, 23, 42, 0.85); border: 1px solid ${s.leftH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'}; border-radius: 12px; padding: 14px; width: 85%; text-align: center;">
                    <div style="font-size: 14px; font-weight: 700; color: #fff;">Left Leaf (${s.left.length} Samples)</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin: 6px 0;">
                      ${s.leftNorm} Normal, ${s.leftFault} Faulty
                    </div>
                    <div style="font-size: 12px; font-weight: bold; color: ${s.leftH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'};">
                      ${s.leftH === 0 ? '★ Pure Node: H = 0.000 (Gini = 0.000)' : `Impure: H = ${s.leftH.toFixed(3)} (Gini = ${s.leftG.toFixed(3)})`}
                    </div>
                  </div>
                </div>

                <!-- Right Branch -->
                <div style="flex: 1; display:flex; flex-direction:column; align-items:center;">
                  <div style="font-family:'Fira Code'; font-size:12px; color:var(--accent-red); margin-bottom:6px;">NO (X > ${threshold})</div>
                  <div class="decision-tree-node" style="background: rgba(15, 23, 42, 0.85); border: 1px solid ${s.rightH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'}; border-radius: 12px; padding: 14px; width: 85%; text-align: center;">
                    <div style="font-size: 14px; font-weight: 700; color: #fff;">Right Leaf (${s.right.length} Samples)</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin: 6px 0;">
                      ${s.rightNorm} Normal, ${s.rightFault} Faulty
                    </div>
                    <div style="font-size: 12px; font-weight: bold; color: ${s.rightH === 0 ? 'var(--accent-green)' : 'var(--accent-amber)'};">
                      ${s.rightH === 0 ? '★ Pure Node: H = 0.000 (Gini = 0.000)' : `Impure: H = ${s.rightH.toFixed(3)} (Gini = ${s.rightG.toFixed(3)})`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : activeTab === 'impurity_curves' ? `
          <!-- Tab 2: Impurity Curves (Gini vs Entropy vs Misclassification Error) -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 6px;">📈 Purity Measures Comparison: Binary Classification</h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
                As the probability \\( p \\in [0, 1] \\) of the positive class changes, observe how Entropy, Gini Impurity, and Misclassification Error behave:
              </p>

              <!-- Interactive Probability Slider -->
              <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.04); padding: 10px 18px; border-radius: 8px; margin-bottom: 16px;">
                <label style="font-size: 13px; color: var(--accent-cyan); font-weight: bold;">
                  Positive Class Probability p: <span id="lbl-prob-p" style="font-family:'Fira Code'; color:#fef08a;">${probP.toFixed(2)}</span>
                </label>
                <input type="range" id="slider-prob-p" min="0" max="1" step="0.01" value="${probP}" style="width: 250px;">
              </div>

              <!-- Purity Curve Canvas -->
              <div class="game-viewport" style="height: 260px; margin-bottom: 18px;">
                <canvas id="curve-canvas" width="800" height="260" style="width: 100%; height: 100%;"></canvas>
              </div>

              <!-- Live Values Card -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
                <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid var(--accent-cyan); border-radius: 8px; padding: 14px;">
                  <strong style="color: var(--accent-cyan); font-size: 14px;">1. Shannon Entropy H(p)</strong>
                  <div class="formula-block" style="font-size: 11px; margin: 6px 0;">-p log₂ p - (1-p) log₂ (1-p)</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fff;">
                    ${entropy(probP, 1 - probP).toFixed(4)} bits
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Scaled H/2: ${(entropy(probP, 1 - probP) / 2).toFixed(4)}</div>
                </div>

                <div style="background: rgba(0, 255, 136, 0.06); border: 1px solid var(--accent-green); border-radius: 8px; padding: 14px;">
                  <strong style="color: var(--accent-green); font-size: 14px;">2. Gini Impurity (CART)</strong>
                  <div class="formula-block" style="font-size: 11px; margin: 6px 0;">2p(1 - p) = 1 - (p² + (1-p)²)</div>
                  <div style="font-size: 16px; font-weight: bold; color: #a7f3d0;">
                    ${gini(probP, 1 - probP).toFixed(4)}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Max = 0.500 at p = 0.50</div>
                </div>

                <div style="background: rgba(255, 170, 0, 0.06); border: 1px solid var(--accent-amber); border-radius: 8px; padding: 14px;">
                  <strong style="color: var(--accent-amber); font-size: 14px;">3. Misclassification Error</strong>
                  <div class="formula-block" style="font-size: 11px; margin: 6px 0;">1 - max(p, 1 - p)</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fef08a;">
                    ${classError(probP, 1 - probP).toFixed(4)}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Piecewise linear / flat derivatives</div>
                </div>
              </div>

              <div style="background: rgba(0, 0, 0, 0.4); border-left: 3px solid var(--accent-cyan); padding: 12px 16px; border-radius: 4px; font-size: 12.5px; color: #7dd3fc; margin-top: 16px; line-height: 1.5;">
                💡 <strong>Why CART & ID3 use Gini and Entropy instead of Classification Error:</strong> Gini and Entropy are strictly concave functions with smooth curvature. They continuously reward splits that produce one purer child node, whereas Classification Error is piecewise linear and often gives 0 gain for valid splits!
              </div>
            </div>
          </div>
        ` : activeTab === 'attribute_selection' ? `
          <!-- Tab 3: Tabular Attribute Selection (ID3 vs CART) -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 6px;">📊 Tabular Root Node Selection (Customer Dataset, N = 10)</h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
                Parent Node Impurity: Entropy = <strong>${attrGains.parentH.toFixed(3)} bits</strong> | Gini = <strong>${attrGains.parentG.toFixed(3)}</strong> (6 Buys=Yes, 4 Buys=No). Which candidate attribute should be selected as the Root Split?
              </p>

              <!-- Attribute Candidates Comparison Table -->
              <div style="overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 18px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                  <thead>
                    <tr style="background: rgba(0, 240, 255, 0.08); border-bottom: 1px solid var(--border-color);">
                      <th style="padding: 10px 14px;">Candidate Attribute</th>
                      <th style="padding: 10px 14px;">Values / Splits</th>
                      <th style="padding: 10px 14px; color: var(--accent-cyan);">Information Gain (ID3)</th>
                      <th style="padding: 10px 14px; color: var(--accent-green);">Gini Gain (CART)</th>
                      <th style="padding: 10px 14px; text-align: center;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                      <td style="padding: 10px 14px; font-weight: bold; color: #fff;">Age</td>
                      <td style="padding: 10px 14px; color: var(--text-secondary);">Youth (4), Middle (2), Senior (4)</td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-cyan); font-weight:bold;">
                        ${attrGains.age.ig.toFixed(3)} bits
                      </td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-green); font-weight:bold;">
                        ${attrGains.age.gg.toFixed(3)}
                      </td>
                      <td style="padding: 10px 14px; text-align: center;">
                        <button class="btn btn-xs btn-primary btn-choose-root" data-attr="age">Select as Root</button>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                      <td style="padding: 10px 14px; font-weight: bold; color: #fff;">Income</td>
                      <td style="padding: 10px 14px; color: var(--text-secondary);">High (5), Low (5)</td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-cyan); font-weight:bold;">
                        ${attrGains.income.ig.toFixed(3)} bits
                      </td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-green); font-weight:bold;">
                        ${attrGains.income.gg.toFixed(3)}
                      </td>
                      <td style="padding: 10px 14px; text-align: center;">
                        <button class="btn btn-xs btn-secondary btn-choose-root" data-attr="income">Select as Root</button>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 14px; font-weight: bold; color: #fff;">Student</td>
                      <td style="padding: 10px 14px; color: var(--text-secondary);">No (5), Yes (5)</td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-cyan); font-weight:bold;">
                        ${attrGains.student.ig.toFixed(3)} bits
                      </td>
                      <td style="padding: 10px 14px; font-family:'Fira Code'; color:var(--accent-green); font-weight:bold;">
                        ${attrGains.student.gg.toFixed(3)}
                      </td>
                      <td style="padding: 10px 14px; text-align: center;">
                        <button class="btn btn-xs btn-secondary btn-choose-root" data-attr="student">Select as Root</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div id="attr-feedback-box" style="min-height: 30px;">
                ${attrQuizFeedback}
              </div>
            </div>
          </div>
        ` : `
          <!-- Tab 4: Tree Depth & Overfitting Pruning -->
          <div style="animation: fadeIn 0.3s ease;">
            <div style="background: rgba(10, 16, 28, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 6px;">✂️ Tree Depth, Overfitting & Cost-Complexity Pruning</h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 18px;">
                Deep decision trees create complex axis-aligned hyper-rectangles that memorize training noise. Adjust tree depth to observe the classic U-shaped validation error:
              </p>

              <!-- Depth slider -->
              <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.04); padding: 10px 18px; border-radius: 8px; margin-bottom: 18px;">
                <label style="font-size: 13px; color: var(--accent-amber); font-weight: bold;">
                  Max Tree Depth: <span id="lbl-tree-depth" style="font-family:'Fira Code'; font-size:15px; color:#fff;">${treeDepth}</span>
                </label>
                <input type="range" id="slider-tree-depth" min="1" max="6" step="1" value="${treeDepth}" style="width: 250px;">
              </div>

              <!-- Depth error metrics -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px;">
                <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid var(--accent-cyan); border-radius: 8px; padding: 14px; text-align:center;">
                  <div style="font-size: 11px; color: var(--text-muted);">TRAINING ERROR</div>
                  <div style="font-size: 20px; font-weight: 800; color: var(--accent-cyan); margin-top: 4px;">
                    ${Math.max(0, 36 - treeDepth * 6.5).toFixed(1)}%
                  </div>
                  <div style="font-size: 11px; color: #a7f3d0; margin-top: 4px;">Monotonically decreases toward 0%</div>
                </div>

                <div style="background: rgba(255, 51, 68, 0.06); border: 1px solid var(--accent-red); border-radius: 8px; padding: 14px; text-align:center;">
                  <div style="font-size: 11px; color: var(--text-muted);">VALIDATION ERROR</div>
                  <div style="font-size: 20px; font-weight: 800; color: ${treeDepth === 2 || treeDepth === 3 ? 'var(--accent-green)' : 'var(--accent-red)'}; margin-top: 4px;">
                    ${(() => {
                      // U curve: optimal at depth 2-3 (14-16%), high at depth 1 (28%) and depth 6 (32%)
                      const val = 14 + Math.pow(treeDepth - 2.5, 2) * 2.8;
                      return val.toFixed(1);
                    })()}%
                  </div>
                  <div style="font-size: 11px; color: ${treeDepth >= 4 ? 'var(--accent-red)' : 'var(--accent-green)'}; margin-top: 4px;">
                    ${treeDepth >= 4 ? '⚠️ Overfitting region!' : treeDepth === 1 ? 'Underfitting' : '★ Optimal Generalization'}
                  </div>
                </div>

                <div style="background: rgba(157, 78, 221, 0.06); border: 1px solid var(--accent-purple); border-radius: 8px; padding: 14px; text-align:center;">
                  <div style="font-size: 11px; color: var(--text-muted);">TOTAL LEAF NODES |T|</div>
                  <div style="font-size: 20px; font-weight: 800; color: #c084fc; margin-top: 4px;">
                    ${Math.pow(2, treeDepth)} Leaves
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Complexity penalizer in CART</div>
                </div>
              </div>

              <!-- Cost-Complexity Formula Explainer -->
              <div class="formula-block" style="font-size: 12px; line-height: 1.6;">
                <strong>CART Cost-Complexity Pruning Objective:</strong><br>
                R_α(T) = R(T) + α · |T|<br>
                where R(T) is misclassification cost on validation set, |T| is number of terminal leaves, and α ≥ 0 controls complexity penalty!
              </div>
            </div>
          </div>
        `}

        <!-- Verify Mastery Check -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 18px; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <div id="tree-feedback" style="min-height: 24px; font-size: 13px;"></div>
          <button id="btn-certify-tree" class="btn btn-primary">Verify Decision Tree Mastery</button>
        </div>

        <details class="math-explainer">
          <summary>💡 Midterm Q14 Official Derivation & Step-by-Step Math (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Candidate 1 (\\(t_1 = 5\\)):</strong> Splits at \\(x=5\\). Left: \\(\\{x_1, x_2\\}\\) (2 Normal, 0 Faulty) → \\(H = 0\\). Right: \\(\\{x_3, x_4, x_5\\}\\) (0 Normal, 3 Faulty) → \\(H = 0\\). Weighted Entropy = 0. Therefore, \\(IG = 0.971 - 0 = 0.971\\) bits.</p>
            <p><strong>Candidate 2 (\\(t_2 = 7\\)):</strong> Splits at \\(x=7\\). Left: \\(\\{x_1, x_2, x_3\\}\\) (2 Normal, 1 Faulty). Right: \\(\\{x_4, x_5\\}\\) (0 Normal, 2 Faulty) → \\(H = 0\\). Left entropy \\(H = -\\frac{2}{3}\\log_2\\frac{2}{3} - \\frac{1}{3}\\log_2\\frac{1}{3} \\approx 0.918\\). Weighted = \\(\\frac{3}{5}(0.918) = 0.551\\) bits. \\(IG = 0.971 - 0.551 = 0.420\\) bits.</p>
          </div>
        </details>
      </div>
    `;

    // Canvas drawing for Guillotine Slice
    if (activeTab === 'guillotine') {
      const cv = container.querySelector('#tree-canvas') as HTMLCanvasElement | null;
      if (cv) drawCanvas(cv, s);
    } else if (activeTab === 'impurity_curves') {
      const cv = container.querySelector('#curve-canvas') as HTMLCanvasElement | null;
      if (cv) drawImpurityCurves(cv, probP);
    }

    // Tab Listeners
    container.querySelector('#tab-guillotine')?.addEventListener('click', () => { sound.playClick(); activeTab = 'guillotine'; render(); });
    container.querySelector('#tab-curves')?.addEventListener('click', () => { sound.playClick(); activeTab = 'impurity_curves'; render(); });
    container.querySelector('#tab-attribute')?.addEventListener('click', () => { sound.playClick(); activeTab = 'attribute_selection'; render(); });
    container.querySelector('#tab-pruning')?.addEventListener('click', () => { sound.playClick(); activeTab = 'pruning'; render(); });

    // Guillotine Listeners
    container.querySelector('#btn-t-5')?.addEventListener('click', () => { sound.playClick(); threshold = 5; render(); });
    container.querySelector('#btn-t-7')?.addEventListener('click', () => { sound.playClick(); threshold = 7; render(); });
    container.querySelector('#tree-t-slider')?.addEventListener('input', (e) => {
      threshold = parseFloat((e.target as HTMLInputElement).value);
      render();
    });
    container.querySelector('#metric-select')?.addEventListener('change', (e) => {
      sound.playClick();
      impurityMetric = (e.target as HTMLSelectElement).value as any;
      render();
    });

    // Impurity Curves Slider
    container.querySelector('#slider-prob-p')?.addEventListener('input', (e) => {
      probP = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#lbl-prob-p');
      if (lbl) lbl.textContent = probP.toFixed(2);
      const cv = container.querySelector('#curve-canvas') as HTMLCanvasElement | null;
      if (cv) drawImpurityCurves(cv, probP);
    });

    // Pruning depth slider
    container.querySelector('#slider-tree-depth')?.addEventListener('input', (e) => {
      treeDepth = parseInt((e.target as HTMLInputElement).value);
      render();
    });

    // Attribute selection choice
    container.querySelectorAll('.btn-choose-root').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const attr = (e.currentTarget as HTMLElement).dataset.attr;
        selectedRootAttribute = attr || null;
        if (attr === 'age') {
          sound.playCorrect();
          attrQuizFeedback = `
            <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px; color: #a7f3d0;">
              <strong>✓ Correct Root Attribute! (Age)</strong> Age achieves the highest Information Gain (${attrGains.age.ig.toFixed(3)} bits) and highest Gini Gain (${attrGains.age.gg.toFixed(3)}), cleanly separating Middle-aged customers into 100% pure buyers!
            </div>
          `;
        } else {
          sound.playWrong();
          attrQuizFeedback = `
            <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px; color: #fca5a5;">
              <strong>✗ Suboptimal Attribute:</strong> ${attr === 'income' ? 'Income' : 'Student'} achieves lower Information Gain (${attr === 'income' ? attrGains.income.ig.toFixed(3) : attrGains.student.ig.toFixed(3)} bits). Look at the table and select the attribute with maximal Information Gain!
            </div>
          `;
        }
        render();
      });
    });

    // Certify Button
    container.querySelector('#btn-certify-tree')?.addEventListener('click', () => {
      const fb = container.querySelector('#tree-feedback') as HTMLElement;
      if (threshold === 5.0 || selectedRootAttribute === 'age' || activeTab === 'impurity_curves') {
        sound.playVictory();
        confetti({ particleCount: 75, spread: 65 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week3_tree');
        if (fb) {
          fb.innerHTML = `
            <span style="color: var(--accent-green); font-weight: bold;">
              🎉 Decision Tree & Gini Mastery Certified! (+150 Score)
            </span>
          `;
        }
      } else {
        sound.playWrong();
        if (fb) {
          fb.innerHTML = `
            <span style="color: var(--accent-amber); font-weight: bold;">
              ⚠️ Set the threshold knife to t = 5.0 (pure split IG = 0.971) or select the optimal root attribute to certify!
            </span>
          `;
        }
      }
    });
  }

  function drawCanvas(canvas: HTMLCanvasElement, split: any) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // Number line axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    ctx.lineTo(w - 40, h / 2);
    ctx.stroke();

    const scaleX = (xVal: number) => 40 + ((xVal - 1) / 10) * (w - 80);

    // Ticks & Labels
    for (let i = 1; i <= 11; i++) {
      const cx = scaleX(i);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, h / 2 - 8);
      ctx.lineTo(cx, h / 2 + 8);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), cx, h / 2 + 22);
    }

    // Draw Points
    DATASET_Q14.forEach(p => {
      const cx = scaleX(p.x);
      const cy = h / 2;
      const isNorm = p.y === 'Normal';

      ctx.fillStyle = isNorm ? '#00f0ff' : '#ff3366';
      ctx.shadowColor = isNorm ? '#00f0ff' : '#ff3366';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNorm ? 'N' : 'F', cx, cy);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(`x=${p.x}`, cx, cy - 24);
    });

    // Guillotine Knife
    const knifeX = scaleX(threshold);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(knifeX, 15);
    ctx.lineTo(knifeX, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Knife t = ${threshold}`, knifeX, 15);
  }

  function drawImpurityCurves(canvas: HTMLCanvasElement, currentP: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // Padding
    const padL = 60;
    const padR = 40;
    const padT = 30;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let p = 0; p <= 1.0; p += 0.2) {
      const cx = padL + p * plotW;
      ctx.beginPath(); ctx.moveTo(cx, padT); ctx.lineTo(cx, h - padB); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Fira Code"';
      ctx.textAlign = 'center';
      ctx.fillText(p.toFixed(1), cx, h - padB + 16);
    }
    for (let yVal = 0; yVal <= 1.0; yVal += 0.25) {
      const cy = h - padB - yVal * plotH;
      ctx.beginPath(); ctx.moveTo(padL, cy); ctx.lineTo(w - padR, cy); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Fira Code"';
      ctx.textAlign = 'right';
      ctx.fillText(yVal.toFixed(2), padL - 8, cy + 4);
    }

    const steps = 100;

    // 1. Scaled Entropy H(p)/2 (Cyan)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const hVal = (entropy(p, 1 - p) / 2);
      const cx = padL + p * plotW;
      const cy = h - padB - hVal * plotH;
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 2. Gini Impurity (Green)
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const gVal = gini(p, 1 - p);
      const cx = padL + p * plotW;
      const cy = h - padB - gVal * plotH;
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 3. Misclassification Error (Amber)
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const errVal = classError(p, 1 - p);
      const cx = padL + p * plotW;
      const cy = h - padB - errVal * plotH;
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical line at currentP
    const curX = padL + currentP * plotW;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curX, padT);
    ctx.lineTo(curX, h - padB);
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('— Scaled Entropy H(p)/2', padL + 20, padT + 15);
    ctx.fillStyle = '#00ff88';
    ctx.fillText('— Gini Impurity', padL + 200, padT + 15);
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('- - Misclassification Error', padL + 340, padT + 15);
  }

  render();
}
