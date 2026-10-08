import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek4PcaSqueezer(container: HTMLElement) {
  let projectionK = 3; // 3D full, 2D plane, 1D line

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>📐 Game 4.4: 3D PCA & SVD Dimension Squeezer (Three.js)</h2>
          <p class="card-subtitle">Decompose High-Dimensional Data via SVD $X = U\\Sigma V^T$ & Maximize Explained Variance (Midterm Q5)</p>
        </div>
        <span class="concept-badge">Midterm Question 5 Focus</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Target Dimensions (k)</label>
          <div style="display: flex; gap: 8px;">
            <button id="btn-k3" class="btn btn-sm ${projectionK === 3 ? 'btn-primary' : 'btn-secondary'}">3D Original (d = 3)</button>
            <button id="btn-k2" class="btn btn-sm ${projectionK === 2 ? 'btn-primary' : 'btn-secondary'}">2D PCA Plane (k = 2)</button>
            <button id="btn-k1" class="btn btn-sm ${projectionK === 1 ? 'btn-primary' : 'btn-secondary'}">1D Principal Axis (k = 1)</button>
          </div>
        </div>

        <div class="control-item" style="align-self: flex-end;">
          <button id="btn-pca-certify" class="btn btn-accent btn-sm">Verify PCA Mastery</button>
        </div>
      </div>

      <div class="game-viewport" id="pca-canvas-container" style="height: 440px;">
        <div class="viewport-overlay" id="pca-overlay">
          <div><strong style="color:var(--accent-cyan);">PC₁ (Max Variance):</strong> Explains 72.4% variance</div>
          <div><strong style="color:var(--accent-amber);">PC₂ (Orthogonal 2nd):</strong> Explains 21.8% variance</div>
          <div><strong style="color:var(--accent-red);">PC₃ (Noise/Minor):</strong> Explains 5.8% variance</div>
          <div style="margin-top:4px;"><strong style="color:#fff;">Cumulative Retained Variance (k=${projectionK}):</strong> <span id="var-retained" style="color:var(--accent-green); font-weight:bold;">100%</span></div>
        </div>
      </div>

      <div id="pca-feedback-box" style="min-height: 24px; margin-top: 14px;"></div>

      <details class="math-explainer">
        <summary>💡 Reasons Dimensionality Reduction (PCA) is Useful (Midterm Practice Q5) (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>1. Overcomes the Curse of Dimensionality & Sparsity:</strong> High dimensions cause volume to expand exponentially, leaving data points sparse and rendering distance metrics (like Euclidean distance in k-NN) meaningless. Reducing dimensions densifies data.</p>
        <p><strong>2. Eliminates Multicollinearity:</strong> Original features are frequently correlated. Principal components derived via SVD right singular vectors $V$ are strictly <em>orthogonal (uncorrelated)</em>.</p>
        <p><strong>3. Noise Reduction & Computational Efficiency:</strong> Truncating the smallest singular values in $\\Sigma$ removes noise and shrinks matrices, massively speeding up downstream model training and inference.</p>
        <p><strong>4. High-Dimensional Data Visualization:</strong> Projects complex 100+ feature spaces onto 2D or 3D planes for human inspection.</p>
        <div class="formula-block">
          SVD Factorization: X = U Σ Vᵀ<br>
          Low-Rank Representation: Z = U_k Σ_k (retains maximum variance in top k dimensions)
        </div>
        </div>
      </details>
    </div>
  `;

  const canvasBox = container.querySelector('#pca-canvas-container') as HTMLElement;
  const width = canvasBox.clientWidth || 800;
  const height = 440;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060913);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(7, 6, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasBox.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0x00f0ff, 1.4);
  light.position.set(8, 12, 6);
  scene.add(light);

  // Generate Correlated 3D Data Cloud along diagonal axis
  const nPoints = 80;
  const originalCoords: THREE.Vector3[] = [];
  const pointMeshes: THREE.Mesh[] = [];

  const sphereGeom = new THREE.SphereGeometry(0.09, 16, 16);
  const ptMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x0077aa, emissiveIntensity: 0.6 });

  for (let i = 0; i < nPoints; i++) {
    const t = (Math.random() - 0.5) * 6; // primary variance along PC1
    const u = (Math.random() - 0.5) * 2; // secondary variance along PC2
    const v = (Math.random() - 0.5) * 0.8; // noise along PC3

    // Rotated 3D coordinates
    const px = t * 0.8 + u * -0.5 + v * 0.1;
    const py = t * 0.5 + u * 0.7 + v * 0.2;
    const pz = t * 0.3 + u * 0.4 + v * -0.8;

    const vec = new THREE.Vector3(px, py, pz);
    originalCoords.push(vec);

    const mesh = new THREE.Mesh(sphereGeom, ptMat);
    mesh.position.copy(vec);
    scene.add(mesh);
    pointMeshes.push(mesh);
  }

  // Draw Principal Component Vectors (PC1, PC2, PC3)
  const dirPC1 = new THREE.Vector3(0.8, 0.5, 0.3).normalize();
  const dirPC2 = new THREE.Vector3(-0.5, 0.7, 0.4).normalize();
  const dirPC3 = new THREE.Vector3(0.1, 0.2, -0.8).normalize();

  const arrowPC1 = new THREE.ArrowHelper(dirPC1, new THREE.Vector3(0,0,0), 4.5, 0x00f0ff, 0.4, 0.25);
  const arrowPC2 = new THREE.ArrowHelper(dirPC2, new THREE.Vector3(0,0,0), 2.8, 0xffaa00, 0.35, 0.2);
  const arrowPC3 = new THREE.ArrowHelper(dirPC3, new THREE.Vector3(0,0,0), 1.5, 0xff3344, 0.3, 0.15);

  scene.add(arrowPC1);
  scene.add(arrowPC2);
  scene.add(arrowPC3);

  // Projection projection plane mesh
  const planeGeom = new THREE.PlaneGeometry(8, 8);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  });
  const planeMesh = new THREE.Mesh(planeGeom, planeMat);
  planeMesh.lookAt(dirPC3);
  scene.add(planeMesh);

  function updateProjection() {
    const varEl = container.querySelector('#var-retained');
    if (projectionK === 3) {
      if (varEl) varEl.textContent = '100% (All 3 Dimensions Retained)';
      planeMesh.visible = false;
      arrowPC3.visible = true;
      // Animate back to original 3D
      pointMeshes.forEach((mesh, idx) => {
        mesh.position.copy(originalCoords[idx]);
      });
    } else if (projectionK === 2) {
      if (varEl) varEl.textContent = '94.2% (k=2: PC₁ + PC₂ Retained, PC₃ discarded)';
      planeMesh.visible = true;
      arrowPC3.visible = false;
      // Project onto PC1 and PC2 span
      pointMeshes.forEach((mesh, idx) => {
        const orig = originalCoords[idx];
        const proj1 = orig.dot(dirPC1);
        const proj2 = orig.dot(dirPC2);
        const target = new THREE.Vector3()
          .addScaledVector(dirPC1, proj1)
          .addScaledVector(dirPC2, proj2);
        mesh.position.copy(target);
      });
    } else if (projectionK === 1) {
      if (varEl) varEl.textContent = '72.4% (k=1: Only PC₁ Retained)';
      planeMesh.visible = false;
      arrowPC3.visible = false;
      // Project solely onto PC1 line
      pointMeshes.forEach((mesh, idx) => {
        const orig = originalCoords[idx];
        const proj1 = orig.dot(dirPC1);
        const target = new THREE.Vector3().addScaledVector(dirPC1, proj1);
        mesh.position.copy(target);
      });
    }
  }

  updateProjection();

  container.querySelector('#btn-k3')?.addEventListener('click', () => {
    sound.playClick();
    projectionK = 3;
    renderWeek4PcaSqueezer(container);
  });

  container.querySelector('#btn-k2')?.addEventListener('click', () => {
    sound.playClick();
    projectionK = 2;
    renderWeek4PcaSqueezer(container);
  });

  container.querySelector('#btn-k1')?.addEventListener('click', () => {
    sound.playClick();
    projectionK = 1;
    renderWeek4PcaSqueezer(container);
  });

  container.querySelector('#btn-pca-certify')?.addEventListener('click', () => {
    sound.playVictory();
    confetti({ particleCount: 75, spread: 65 });
    gameManager.addScore(150, 75);
    gameManager.markGameComplete('week4_pca');
    const fb = container.querySelector('#pca-feedback-box') as HTMLElement;
    if (fb) {
      fb.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
          <strong>🏆 PCA & SVD Question 5 Mastered!</strong> You observed how SVD extracts orthogonal principal components that capture 94.2% of total data variance in just 2 dimensions, vanquishing the curse of dimensionality!
        </div>
      `;
    }
  });

  let reqId: number;
  let angle = 0;
  function animate() {
    reqId = requestAnimationFrame(animate);
    angle += 0.003;
    camera.position.x = 8.5 * Math.cos(angle);
    camera.position.z = 8.5 * Math.sin(angle);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvasBox)) {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
