import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';

export function renderWeek1VectorArena(container: HTMLElement) {
  let w = [1.5, 1.0, 0.5];
  let x = [1.0, 2.0, -1.0];

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🌌 Game 1.3: 3D Vector & Matrix Arena (Three.js)</h2>
          <p class="card-subtitle">Visualize feature vectors x, weights w, dot products wᵀx, and linear algebra projections</p>
        </div>
        <span class="concept-badge">Linear Algebra & GPUs</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Weight w₁</label>
          <input type="range" id="w1" min="-3" max="3" step="0.2" value="${w[0]}">
        </div>
        <div class="control-item">
          <label>Weight w₂</label>
          <input type="range" id="w2" min="-3" max="3" step="0.2" value="${w[1]}">
        </div>
        <div class="control-item">
          <label>Weight w₃</label>
          <input type="range" id="w3" min="-3" max="3" step="0.2" value="${w[2]}">
        </div>
        <div class="control-item">
          <label>Target Dot Product Challenge</label>
          <button id="btn-challenge-ortho" class="btn btn-secondary btn-sm">Goal: Make Orthogonal (wᵀx = 0)</button>
        </div>
        <div class="control-item">
          <button id="btn-challenge-align" class="btn btn-secondary btn-sm">Goal: Maximize Dot Product</button>
        </div>
      </div>

      <div class="game-viewport" id="vector-canvas-container">
        <div class="viewport-overlay" id="vector-stats-overlay">
          <div><strong style="color: var(--accent-cyan);">x (Features):</strong> [${x.join(', ')}]</div>
          <div><strong style="color: var(--accent-amber);">w (Weights):</strong> [${w.join(', ')}]</div>
          <div style="margin-top: 4px; font-size: 14px;"><strong style="color: #fff;">wᵀx (Dot Product):</strong> <span id="dot-val">0.00</span></div>
          <div><strong>Angle θ:</strong> <span id="angle-val">0°</span></div>
        </div>
      </div>

      <div id="vector-challenge-msg" style="margin-top: 14px; min-height: 24px;"></div>

      <details class="math-explainer">
        <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p>In Week 1 slides, we learn that GPUs revolutionized deep learning because operations like linear prediction y = wᵀx = ∑ wᵢxᵢ and batch prediction y = Xw are highly parallelizable matrix multiplications!</p>
          <div class="formula-block">
            Linear Combination: y = w₁x₁ + w₂x₂ + ... + w_d x_d = wᵀx<br>
            Cosine Similarity: cos(θ) = (w · x) / (||w|| ||x||)
          </div>
        </div>
      </details>
    </div>
  `;

  const canvasBox = container.querySelector('#vector-canvas-container') as HTMLElement;
  const width = canvasBox.clientWidth || 800;
  const height = 480;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b14);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(6, 5, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasBox.appendChild(renderer.domElement);

  // Grid helper & Axes
  const gridHelper = new THREE.GridHelper(10, 10, 0x00f0ff, 0x1f293d);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(4);
  scene.add(axesHelper);

  // Ambient & directional light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Vector arrows
  let arrowX: THREE.ArrowHelper;
  let arrowW: THREE.ArrowHelper;

  function createArrows() {
    if (arrowX) scene.remove(arrowX);
    if (arrowW) scene.remove(arrowW);

    const dirX = new THREE.Vector3(x[0], x[1], x[2]);
    const lenX = dirX.length();
    dirX.normalize();
    arrowX = new THREE.ArrowHelper(dirX, new THREE.Vector3(0, 0, 0), lenX, 0x00f0ff, 0.3, 0.2);

    const dirW = new THREE.Vector3(w[0], w[1], w[2]);
    const lenW = dirW.length();
    dirW.normalize();
    arrowW = new THREE.ArrowHelper(dirW, new THREE.Vector3(0, 0, 0), lenW, 0xffaa00, 0.3, 0.2);

    scene.add(arrowX);
    scene.add(arrowW);
  }

  createArrows();

  function updateMath() {
    const dot = w[0] * x[0] + w[1] * x[1] + w[2] * x[2];
    const normW = Math.hypot(w[0], w[1], w[2]);
    const normX = Math.hypot(x[0], x[1], x[2]);
    const cosTheta = Math.max(-1, Math.min(1, dot / (normW * normX || 1)));
    const angleDeg = (Math.acos(cosTheta) * (180 / Math.PI)).toFixed(1);

    const dotEl = container.querySelector('#dot-val');
    const angleEl = container.querySelector('#angle-val');
    if (dotEl) dotEl.textContent = dot.toFixed(2);
    if (angleEl) angleEl.textContent = `${angleDeg}°`;

    const overlay = container.querySelector('#vector-stats-overlay');
    if (overlay) {
      overlay.innerHTML = `
        <div><strong style="color: var(--accent-cyan);">x (Features):</strong> [${x.map(v => v.toFixed(1)).join(', ')}]</div>
        <div><strong style="color: var(--accent-amber);">w (Weights):</strong> [${w.map(v => v.toFixed(1)).join(', ')}]</div>
        <div style="margin-top: 4px; font-size: 14px;"><strong style="color: #fff;">wᵀx (Dot Product):</strong> <span id="dot-val" style="color: ${dot > 0 ? 'var(--accent-green)' : dot < 0 ? 'var(--accent-red)' : 'var(--accent-cyan)'}; font-weight: bold;">${dot.toFixed(2)}</span></div>
        <div><strong>Angle θ:</strong> <span>${angleDeg}°</span></div>
      `;
    }

    createArrows();

    // Check challenge
    const msgEl = container.querySelector('#vector-challenge-msg');
    if (msgEl) {
      if (Math.abs(dot) < 0.05) {
        msgEl.innerHTML = `<span style="color: var(--accent-green); font-weight: 700;">🎯 PERFECT! The weight vector w is ORTHOGONAL to feature vector x (wᵀx = 0). This defines the decision boundary!</span>`;
      } else if (cosTheta > 0.99) {
        msgEl.innerHTML = `<span style="color: var(--accent-green); font-weight: 700;">🌟 PERFECT! The weight vector w is directly ALIGNED with feature vector x (Maximum Cosine Similarity = 1.0)!</span>`;
      } else {
        msgEl.innerHTML = ``;
      }
    }
  }

  updateMath();

  ['w1', 'w2', 'w3'].forEach((id, idx) => {
    container.querySelector(`#${id}`)?.addEventListener('input', (e) => {
      w[idx] = parseFloat((e.target as HTMLInputElement).value);
      updateMath();
    });
  });

  container.querySelector('#btn-challenge-ortho')?.addEventListener('click', () => {
    sound.playClick();
    // For x = [1, 2, -1], setting w = [1, -0.5, 0] gives 1*1 + 2*(-0.5) + 0 = 0
    w = [1.0, -0.5, 0.0];
    (container.querySelector('#w1') as HTMLInputElement).value = '1.0';
    (container.querySelector('#w2') as HTMLInputElement).value = '-0.5';
    (container.querySelector('#w3') as HTMLInputElement).value = '0.0';
    updateMath();
    sound.playCorrect();
    gameManager.addScore(50, 25);
  });

  container.querySelector('#btn-challenge-align')?.addEventListener('click', () => {
    sound.playClick();
    // Normalize x direction for w
    w = [1.0, 2.0, -1.0];
    (container.querySelector('#w1') as HTMLInputElement).value = '1.0';
    (container.querySelector('#w2') as HTMLInputElement).value = '2.0';
    (container.querySelector('#w3') as HTMLInputElement).value = '-1.0';
    updateMath();
    sound.playCorrect();
    gameManager.addScore(50, 25);
  });

  // Animation loop with mouse rotation
  let reqId: number;
  let angle = 0;
  function animate() {
    reqId = requestAnimationFrame(animate);
    angle += 0.005;
    camera.position.x = 8 * Math.cos(angle);
    camera.position.z = 8 * Math.sin(angle);
    camera.lookAt(0, 0.5, 0);
    renderer.render(scene, camera);
  }
  animate();

  // Cleanup on remove
  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvasBox)) {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
