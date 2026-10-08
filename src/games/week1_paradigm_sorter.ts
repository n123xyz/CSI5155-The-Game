import { gameManager } from '../state';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

interface Item {
  id: string;
  title: string;
  description: string;
  category: 'supervised' | 'unsupervised' | 'reinforcement';
  explanation: string;
  source: string;
  icon: string;
}

const ITEMS: Item[] = [
  {
    id: 'p1',
    title: 'Linear Regression for Home Prices',
    description: 'Determining optimal parameters θ to predict home prices from square footage.',
    category: 'supervised',
    explanation: 'Supervised Learning: We are given labeled training pairs (x_n, y_n) where y is the real-valued house price.',
    source: 'Midterm Practice Q1.1 & Week 2 Slides',
    icon: '🏠'
  },
  {
    id: 'p2',
    title: 'K-Means Data Grouping',
    description: 'Applying k-means to group customer transactions without any pre-existing labels.',
    category: 'unsupervised',
    explanation: 'Unsupervised Learning: We only have inputs x with no target labels y. The algorithm models p(x) by finding centroid clusters.',
    source: 'Midterm Practice Q1.2 & Week 5 Slides',
    icon: '🌌'
  },
  {
    id: 'p3',
    title: 'Hierarchical Agglomerative Clustering',
    description: 'Building a bottom-up dendrogram by iteratively merging closest clusters.',
    category: 'unsupervised',
    explanation: 'Unsupervised Learning: Discovers tree hierarchies among unlabeled data points without supervisor supervision.',
    source: 'Midterm Practice Q1.3 & Week 5 Slides',
    icon: '🌳'
  },
  {
    id: 'p4',
    title: 'Support Vector Machine (SVM)',
    description: 'Training a maximum-margin hyperplane to classify emails as spam or ham.',
    category: 'supervised',
    explanation: 'Supervised Learning: Relies on ground truth labels y ∈ {-1, +1} to position the decision boundary.',
    source: 'Midterm Practice Q1.4 & Week 2 Slides',
    icon: '✉️'
  },
  {
    id: 'p5',
    title: 'Space Invaders Game Agent',
    description: 'An AI learns which moves to make to maximize score via trial and error rewards.',
    category: 'reinforcement',
    explanation: 'Reinforcement Learning: An agent learns a policy π(x) → a by interacting with an environment through rewards and punishments.',
    source: 'Week 1 Slides (Figure 1.10)',
    icon: '👾'
  },
  {
    id: 'p6',
    title: 'Crop Yield Estimation',
    description: 'Predicting metric tonnes of harvest from soil chemistry and rainfall metrics.',
    category: 'supervised',
    explanation: 'Supervised Learning: Regression mapping continuous inputs x to continuous observed yields y.',
    source: 'Week 1 Slides (Slide 40)',
    icon: '🌽'
  },
  {
    id: 'p7',
    title: 'Dimensionality Reduction (PCA)',
    description: 'Compressing a 100-dimensional gene dataset to 2 principal components.',
    category: 'unsupervised',
    explanation: 'Unsupervised Learning: Discovers latent lower-dimensional manifolds p(x) using SVD without target labels.',
    source: 'Week 1 & Week 3 Slides',
    icon: '📉'
  },
  {
    id: 'p8',
    title: 'Robot Bipedal Walking Simulator',
    description: 'Humanoid robot in MuJuCo learning to run as fast as possible without falling over.',
    category: 'reinforcement',
    explanation: 'Reinforcement Learning: Balances forward velocity rewards against falling penalty.',
    source: 'Week 1 Slides (Slide 45)',
    icon: '🤖'
  }
];

export function renderWeek1ParadigmSorter(container: HTMLElement) {
  let currentIndex = 0;
  let correctCount = 0;
  let score = 0;
  let streak = 0;

  function renderCard() {
    if (currentIndex >= ITEMS.length) {
      sound.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      gameManager.markGameComplete('week1_paradigms');

      container.innerHTML = `
        <div class="game-card">
          <div class="card-header">
            <div class="card-title-group">
              <h2>🎉 Paradigm Rush Completed!</h2>
              <p class="card-subtitle">Mastery over Supervised, Unsupervised, and Reinforcement Learning</p>
            </div>
            <span class="concept-badge">Score: ${score}</span>
          </div>
          <div style="text-align: center; padding: 24px;">
            <p style="font-size: 18px; margin-bottom: 16px;">You correctly classified <strong>${correctCount} / ${ITEMS.length}</strong> machine learning systems!</p>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">You have directly mastered <strong>Question 1 of the CSI 5155 Midterm</strong>.</p>
            <button id="btn-replay-sorter" class="btn btn-primary">Play Again</button>
          </div>
        </div>
      `;

      container.querySelector('#btn-replay-sorter')?.addEventListener('click', () => {
        currentIndex = 0;
        correctCount = 0;
        score = 0;
        streak = 0;
        renderCard();
      });
      return;
    }

    const item = ITEMS[currentIndex];

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>⚡ Game 1.1: Paradigm Conveyor Rush</h2>
            <p class="card-subtitle">Visual Intuition: Direct problem flow into Supervised, Unsupervised, or RL (Midterm Q1)</p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span class="concept-badge">Task ${currentIndex + 1} / ${ITEMS.length}</span>
            <span class="concept-badge" style="color: var(--accent-amber);">Streak: ${streak}🔥</span>
          </div>
        </div>

        <!-- Animated Visual Conveyor Canvas -->
        <div class="game-viewport" style="height: 180px; margin-bottom: 20px;">
          <canvas id="conveyor-canvas" width="800" height="180" style="width: 100%; height: 100%;"></canvas>
          <div class="viewport-overlay">
            <span style="color: var(--accent-cyan);">Data Packet in Transit:</span> ${item.icon} ${item.title}
          </div>
        </div>

        <!-- Conveyor Item Display -->
        <div style="background: rgba(8, 12, 20, 0.9); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-align: center; margin-bottom: 20px; position: relative;">
          <div style="font-size: 36px; margin-bottom: 8px;">${item.icon}</div>
          <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 8px;">${item.title}</h3>
          <p style="font-size: 14px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 10px auto;">${item.description}</p>
          <div style="font-family: 'Fira Code', monospace; font-size: 11px; color: var(--text-muted);">${item.source}</div>
        </div>

        <!-- Feedback Box -->
        <div id="sorter-feedback" style="min-height: 48px; margin-bottom: 20px; transition: var(--transition);"></div>

        <!-- 3 Categorization Buckets -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <button class="btn btn-secondary bucket-btn" data-choice="supervised" style="padding: 18px; display: flex; flex-direction: column; gap: 8px; border-color: rgba(0, 240, 255, 0.4); background: rgba(0, 240, 255, 0.05);">
            <span style="font-size: 26px;">🎯</span>
            <strong style="color: var(--accent-cyan); font-size: 15px;">Supervised Learning</strong>
            <span style="font-size: 11px; color: var(--text-secondary);">Given Labels (x, y) • Targets Known</span>
            <div style="font-family:'Fira Code'; font-size:10px; color:#7dd3fc; margin-top:4px;">f(x) → ŷ vs y</div>
          </button>

          <button class="btn btn-secondary bucket-btn" data-choice="unsupervised" style="padding: 18px; display: flex; flex-direction: column; gap: 8px; border-color: rgba(157, 78, 221, 0.4); background: rgba(157, 78, 221, 0.05);">
            <span style="font-size: 26px;">🌌</span>
            <strong style="color: #c084fc; font-size: 15px;">Unsupervised Learning</strong>
            <span style="font-size: 11px; color: var(--text-secondary);">Unlabeled Data • Density p(x)</span>
            <div style="font-family:'Fira Code'; font-size:10px; color:#d8b4fe; margin-top:4px;">Clusters / Manifolds</div>
          </button>

          <button class="btn btn-secondary bucket-btn" data-choice="reinforcement" style="padding: 18px; display: flex; flex-direction: column; gap: 8px; border-color: rgba(255, 170, 0, 0.4); background: rgba(255, 170, 0, 0.05);">
            <span style="font-size: 26px;">🕹️</span>
            <strong style="color: var(--accent-amber); font-size: 15px;">Reinforcement Learning</strong>
            <span style="font-size: 11px; color: var(--text-secondary);">Policy π(s) → a • Rewards/Penalties</span>
            <div style="font-family:'Fira Code'; font-size:10px; color:#fde047; margin-top:4px;">Agent ⇄ Environment</div>
          </button>
        </div>

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <h4>💡 Visual Intuition: How to Instantly Recognize the Paradigm (Midterm Q1)</h4>
            <ul>
              <li><strong>Supervised (S):</strong> There is a teacher giving ground-truth answers y (e.g. house price in dollars, disease diagnosis label, spam flag). Optimization adjusts parameters to minimize prediction loss on labels.</li>
              <li><strong>Unsupervised (U):</strong> There are NO target labels y anywhere! The algorithm groups similar points together (K-means, Hierarchical clustering) or models input distribution p(x) (PCA, density estimation).</li>
              <li><strong>Reinforcement Learning (RL):</strong> The system is an agent that takes actions in a dynamic environment, receiving scalar feedback (rewards/punishments) to learn an optimal policy π(s).</li>
            </ul>
          </div>
        </details>
      </div>
    `;

    // Draw conveyor animation
    const canvas = container.querySelector('#conveyor-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      let offset = 0;
      function drawConveyor() {
        if (!document.body.contains(canvas)) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        offset = (offset + 2) % 40;

        // Rollers
        const cy = 130;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, cy - 4, canvas.width - 80, 8);

        for (let x = 40 + offset; x < canvas.width - 40; x += 40) {
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(x, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3 Destination chutes at bottom
        const w3 = (canvas.width - 80) / 3;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.strokeRect(40, cy + 12, w3, 30);
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
        ctx.strokeRect(40 + w3, cy + 12, w3, 30);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
        ctx.strokeRect(40 + w3 * 2, cy + 12, w3, 30);

        // Moving cargo box
        const boxX = canvas.width / 2;
        const boxY = 60;
        ctx.fillStyle = 'rgba(20, 28, 45, 0.9)';
        ctx.strokeStyle = 'var(--accent-cyan)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX - 90, boxY - 35, 180, 70, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.fillText(item.icon, boxX - 70, boxY + 8);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Outfit';
        ctx.fillText(item.title.substring(0, 16) + '...', boxX - 35, boxY + 5);

        requestAnimationFrame(drawConveyor);
      }
      drawConveyor();
    }

    container.querySelectorAll('.bucket-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = (btn as HTMLElement).dataset.choice;
        handleChoice(choice as any);
      });
    });
  }

  function handleChoice(choice: 'supervised' | 'unsupervised' | 'reinforcement') {
    const item = ITEMS[currentIndex];
    const feedbackEl = container.querySelector('#sorter-feedback') as HTMLElement;
    if (!feedbackEl) return;

    if (choice === item.category) {
      sound.playCorrect();
      correctCount++;
      streak++;
      const earned = 50 * streak;
      score += earned;
      gameManager.addScore(earned, 25);

      feedbackEl.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px 18px; color: #a7f3d0;">
          <strong>✓ Correct! (+${earned} pts)</strong> — ${item.explanation}
        </div>
      `;
    } else {
      sound.playWrong();
      streak = 0;
      gameManager.resetStreak();

      feedbackEl.innerHTML = `
        <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px 18px; color: #fca5a5;">
          <strong>✗ Incorrect!</strong> Expected <em>${item.category.toUpperCase()}</em>. ${item.explanation}
        </div>
      `;
    }

    container.querySelectorAll('.bucket-btn').forEach(b => (b as HTMLButtonElement).disabled = true);
    setTimeout(() => {
      currentIndex++;
      renderCard();
    }, 1200);
  }

  renderCard();
}
