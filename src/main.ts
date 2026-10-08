import { gameManager } from './state';
import { sound } from './audio/sound';

// Week 1 Games
import { renderWeek1ParadigmSorter } from './games/week1_paradigm_sorter';
import { renderWeek1MitchellBuilder } from './games/week1_mitchell_builder';
import { renderWeek1VectorArena } from './games/week1_vector_arena';

// Week 2 Games
import { renderWeek2GradientDescent } from './games/week2_gradient_descent';
import { renderWeek2Regularization } from './games/week2_regularization';
import { renderWeek2LogisticSigmoid } from './games/week2_logistic_sigmoid';
import { renderWeek2SvmKernel } from './games/week2_svm_kernel';

// Week 3 Games
import { renderWeek3DecisionTree } from './games/week3_decision_tree';
import { renderWeek3KnnGalaxy } from './games/week3_knn_galaxy';
import { renderWeek3MissingData } from './games/week3_missing_data';
import { renderWeek3ClassImbalance } from './games/week3_class_imbalance';

// Week 4 Games
import { renderWeek4ConfusionDefense } from './games/week4_confusion_defense';
import { renderWeek4FeatureSelection } from './games/week4_feature_selection';
import { renderWeek4SplitLeakage } from './games/week4_split_leakage';
import { renderWeek4PcaSqueezer } from './games/week4_pca_squeezer';

// Week 5 Games (dynamically imported or direct)
let renderWeek5ClusteringModule: any = null;
let renderWeek5SslModule: any = null;
let renderWeek5EnsembleModule: any = null;
let renderMidtermExamModule: any = null;

// Dynamic imports with fallbacks
async function loadModules() {
  try {
    const mod5A = await import('./games/week5_kmeans_hierarchical');
    renderWeek5ClusteringModule = mod5A.renderWeek5Clustering;
  } catch (e) { console.warn('Loading 5A', e); }

  try {
    const mod5B = await import('./games/week5_ssl_active_learning');
    renderWeek5SslModule = mod5B.renderWeek5SslActiveLearning;
  } catch (e) { console.warn('Loading 5B', e); }

  try {
    const mod5C = await import('./games/week5_ensemble_clash');
    renderWeek5EnsembleModule = mod5C.renderWeek5EnsembleClash;
  } catch (e) { console.warn('Loading 5C', e); }

  try {
    const modExam = await import('./quiz/midterm_master_exam');
    renderMidtermExamModule = modExam.renderMidtermMasterExam;
  } catch (e) { console.warn('Loading exam', e); }
}

// Navigation structure
const NAV_CONFIG: Record<string, { title: string; games: { id: string; label: string; render: (c: HTMLElement) => void }[] }> = {
  week1: {
    title: 'Week 1: Foundations & Paradigms',
    games: [
      { id: 'paradigms', label: '1.1 Paradigm Rush (Midterm Q1)', render: renderWeek1ParadigmSorter },
      { id: 'mitchell', label: '1.2 Mitchell E/T/P Control', render: renderWeek1MitchellBuilder },
      { id: 'vector', label: '1.3 3D Vector Arena', render: renderWeek1VectorArena }
    ]
  },
  week2: {
    title: 'Week 2: Regression, Loss & SVM',
    games: [
      { id: 'gd', label: '2.1 3D Gradient Descent (Midterm Q2)', render: renderWeek2GradientDescent },
      { id: 'reg', label: '2.2 Regularization L1 vs L2 (Midterm Q4)', render: renderWeek2Regularization },
      { id: 'logistic', label: '2.3 Sigmoid Triage (MLE & Cross-Entropy)', render: renderWeek2LogisticSigmoid },
      { id: 'svm', label: '2.4 3D SVM Kernel Slicer (Midterm Q7)', render: renderWeek2SvmKernel }
    ]
  },
  week3: {
    title: 'Week 3: Trees, k-NN & Preprocessing',
    games: [
      { id: 'tree', label: '3.1 Entropy Guillotine (Midterm Q14)', render: renderWeek3DecisionTree },
      { id: 'knn', label: '3.2 3D k-NN Cosmic Radar (Midterm Q12)', render: renderWeek3KnnGalaxy },
      { id: 'missing', label: '3.3 Missing Data & Leakage (Midterm Q13)', render: renderWeek3MissingData },
      { id: 'imbalance', label: '3.4 Class Balancer SMOTE (Midterm Q10)', render: renderWeek3ClassImbalance }
    ]
  },
  week4: {
    title: 'Week 4: ML Pipeline & Feature Selection',
    games: [
      { id: 'confusion', label: '4.1 Confusion Matrix Defense', render: renderWeek4ConfusionDefense },
      { id: 'featsel', label: '4.2 Feature Selection Tournament (Midterm Q6)', render: renderWeek4FeatureSelection },
      { id: 'split', label: '4.3 3-Way Partition & Leakage (Midterm Q9)', render: renderWeek4SplitLeakage },
      { id: 'pca', label: '4.4 3D PCA Dimension Squeezer (Midterm Q5)', render: renderWeek4PcaSqueezer }
    ]
  },
  week5: {
    title: 'Week 5: Clustering & Ensembles',
    games: [
      { id: 'cluster', label: '5.1 3D K-Means & Dendrogram (Midterm Q1)', render: (c) => renderWeek5ClusteringModule?.(c) },
      { id: 'ssl', label: '5.2 SSL & Active Learning Oracle', render: (c) => renderWeek5SslModule?.(c) },
      { id: 'ensemble', label: '5.3 Ensemble Clash: Bagging vs Boosting (Midterm Q11)', render: (c) => renderWeek5EnsembleModule?.(c) }
    ]
  }
};

let currentTab = 'hub';
let currentSubGame: Record<string, string> = {
  week1: 'paradigms',
  week2: 'gd',
  week3: 'tree',
  week4: 'confusion',
  week5: 'cluster'
};

function updateHUD() {
  const s = gameManager.getState();
  const scoreEl = document.getElementById('hud-score');
  const xpEl = document.getElementById('hud-xp');
  const streakEl = document.getElementById('hud-streak');
  if (scoreEl) scoreEl.textContent = s.score.toLocaleString();
  if (xpEl) xpEl.textContent = s.xp.toLocaleString();
  if (streakEl) streakEl.textContent = `${s.streak}🔥`;
}

function renderHub(mainContent: HTMLElement) {
  const s = gameManager.getState();
  const completedCount = Object.keys(s.completedGames).length;
  const totalGames = 18;
  const progressPct = Math.min(100, Math.round((completedCount / totalGames) * 100));

  mainContent.innerHTML = `
    <div class="hub-hero">
      <div class="hub-hero-text">
        <h2>⚡ Welcome to the CSI 5155 ML Gauntlet</h2>
        <p>
          Master every single foundational machine learning concept from Weeks 1 through 5 of <strong>uOttawa CSI 5155</strong>. Experience interactive 3D Three.js physics visualizers, real-time formula breakdowns, and simulation games designed directly to ace the Fall 2026 Midterm Practice Exam!
        </p>
      </div>

      <div class="hub-metrics">
        <div class="hub-metric-card">
          <div class="val">${progressPct}%</div>
          <div class="lbl">EXAM READINESS</div>
        </div>
        <div class="hub-metric-card">
          <div class="val">${completedCount} / ${totalGames}</div>
          <div class="lbl">GAMES COMPLETED</div>
        </div>
      </div>
    </div>

    <!-- Weeks Overview Grid -->
    <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 16px; color: #fff;">Interactive Course Modules</h3>
    <div class="grid-2" style="margin-bottom: 28px;">
      <!-- Week 1 Card -->
      <div class="game-card hub-week-card" data-week="week1" style="cursor: pointer;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-cyan); font-weight: bold;">Week 1 • Foundations</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">ML Paradigms & Linear Algebra</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          Supervised vs Unsupervised vs RL conveyor rush (Midterm Q1), Mitchell's E/T/P architect, and 3D Vector transformation arena.
        </p>
        <button class="btn btn-sm btn-secondary">Launch Week 1 (3 Games) →</button>
      </div>

      <!-- Week 2 Card -->
      <div class="game-card hub-week-card" data-week="week2" style="cursor: pointer;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-purple); font-weight: bold;">Week 2 • Regression & SVM</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">Gradient Descent, L1/L2 & SVM Kernels</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          3D Paraboloid Loss Marble Run (Batch vs SGD, Q2), Regularization Gauntlet (L1 Lasso vs L2 Ridge, Q4), Clinical Sigmoid Triage, and 3D SVM Kernel Warp (Q7).
        </p>
        <button class="btn btn-sm btn-secondary">Launch Week 2 (4 Games) →</button>
      </div>

      <!-- Week 3 Card -->
      <div class="game-card hub-week-card" data-week="week3" style="cursor: pointer;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-green); font-weight: bold;">Week 3 • Trees & Preprocessing</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">Decision Trees, k-NN, Missing Data & Imbalance</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          Entropy & Information Gain Guillotine (Sensor Q14), 3D k-NN Cosmic Radar (Q12), Missing Data Detective (Q13), and Class Balancer SMOTE (Q10).
        </p>
        <button class="btn btn-sm btn-secondary">Launch Week 3 (4 Games) →</button>
      </div>

      <!-- Week 4 Card -->
      <div class="game-card hub-week-card" data-week="week4" style="cursor: pointer;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-amber); font-weight: bold;">Week 4 • Pipeline & Metrics</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">Evaluation, Feature Selection & 3D PCA</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          Confusion Matrix Air Defense (Precision vs Recall vs F1), Forward Selection vs Backward Elimination (Q6), 3-Way Split Gauntlet (Q9), and 3D PCA SVD Squeezer (Q5).
        </p>
        <button class="btn btn-sm btn-secondary">Launch Week 4 (4 Games) →</button>
      </div>

      <!-- Week 5 Card -->
      <div class="game-card hub-week-card" data-week="week5" style="cursor: pointer;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-pink); font-weight: bold;">Week 5 • Clustering & Ensembles</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">K-Means, Dendrograms, SSL & Bagging vs Boosting</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          3D K-Means & Dendrogram Linkage Chopper (Q1), Semi-Supervised & Active Learning Oracle, and Ensemble Clash (Bagging vs Boosting, Q11).
        </p>
        <button class="btn btn-sm btn-secondary">Launch Week 5 (3 Games) →</button>
      </div>

      <!-- Grand Midterm Card -->
      <div class="game-card hub-week-card" data-week="midterm" style="cursor: pointer; border-color: rgba(255, 170, 0, 0.4); background: linear-gradient(135deg, rgba(255,170,0,0.1), rgba(255,42,133,0.1));">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-amber); font-weight: bold;">Grand Exam Simulation</div>
        <h4 style="font-size: 18px; margin: 4px 0 8px 0; color: #fff;">📝 Full 14-Question Midterm Practice Exam</h4>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          The complete interactive examination mirroring the University of Ottawa CSI 5155 Fall 2026 practice paper with instant grading, step-by-step math derivations, and score certificates.
        </p>
        <button class="btn btn-sm btn-accent">Take Practice Midterm Exam →</button>
      </div>
    </div>
  `;

  mainContent.querySelectorAll('.hub-week-card').forEach(card => {
    card.addEventListener('click', () => {
      sound.playClick();
      const week = (card as HTMLElement).dataset.week!;
      switchTab(week);
    });
  });
}

function renderCurrentView() {
  const mainContent = document.getElementById('main-content')!;
  const subNavBar = document.getElementById('sub-nav-bar')!;

  // Update tabs active state
  document.querySelectorAll('.nav-tab').forEach(tab => {
    if ((tab as HTMLElement).dataset.tab === currentTab) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (currentTab === 'hub') {
    subNavBar.style.display = 'none';
    renderHub(mainContent);
  } else if (currentTab === 'midterm') {
    subNavBar.style.display = 'none';
    if (renderMidtermExamModule) {
      renderMidtermExamModule(mainContent);
    } else {
      mainContent.innerHTML = `<div class="game-card"><h2>Loading Midterm Practice Exam...</h2></div>`;
      loadModules().then(() => renderMidtermExamModule?.(mainContent));
    }
  } else if (NAV_CONFIG[currentTab]) {
    const weekConfig = NAV_CONFIG[currentTab];
    subNavBar.style.display = 'flex';

    // Populate sub nav bar
    subNavBar.innerHTML = weekConfig.games.map(g => `
      <button class="sub-nav-btn ${currentSubGame[currentTab] === g.id ? 'active' : ''}" data-gameid="${g.id}">
        ${g.label}
      </button>
    `).join('');

    subNavBar.querySelectorAll('.sub-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        currentSubGame[currentTab] = (btn as HTMLElement).dataset.gameid!;
        renderCurrentView();
      });
    });

    // Render active game
    const activeGame = weekConfig.games.find(g => g.id === currentSubGame[currentTab]) || weekConfig.games[0];
    if (activeGame) {
      mainContent.innerHTML = '';
      activeGame.render(mainContent);
    }
  }
}

function switchTab(tabName: string) {
  currentTab = tabName;
  window.location.hash = tabName;
  renderCurrentView();
}

// Initial bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  await loadModules();

  function parseHash() {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash.includes(':')) {
        const [t, g] = hash.split(':');
        if (t) currentTab = t;
        if (g) currentSubGame[t] = g;
      } else {
        currentTab = hash;
      }
    }
  }

  // URL Hash handling
  parseHash();
  window.addEventListener('hashchange', () => {
    parseHash();
    renderCurrentView();
  });

  // Setup tab click listeners
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const tab = (btn as HTMLElement).dataset.tab!;
      switchTab(tab);
    });
  });

  // Sound toggle button
  document.getElementById('btn-sound-toggle')?.addEventListener('click', (e) => {
    sound.enabled = !sound.enabled;
    (e.target as HTMLElement).textContent = sound.enabled ? '🔊' : '🔇';
    sound.playClick();
  });

  gameManager.subscribe(updateHUD);
  updateHUD();
  renderCurrentView();
});
