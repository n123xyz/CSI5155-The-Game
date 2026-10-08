import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek2GradientDescent(container: HTMLElement) {
  let lr = 0.15;
  let mode: 'batch' | 'sgd' | 'minibatch' = 'batch';
  let pos = { w: 3.5, b: 2.8 }; // initial weights
  let history: Array<{ w: number; b: number; loss: number }> = [];
  let isRunning = false;
  let timer: any = null;

  function calcLoss(w: number, b: number) {
    return 0.5 * (w * w + 2 * b * b);
  }

  function getGradient(w: number, b: number, currentMode: 'batch' | 'sgd' | 'minibatch') {
    let gradW = w;
    let gradB = 2 * b;

    if (currentMode === 'sgd') {
      // Add random noisy sample variation
      const noiseW = (Math.random() - 0.5) * 2.5;
      const noiseB = (Math.random() - 0.5) * 2.5;
      gradW += noiseW;
      gradB += noiseB;
    } else if (currentMode === 'minibatch') {
      const noiseW = (Math.random() - 0.5) * 0.8;
      const noiseB = (Math.random() - 0.5) * 0.8;
      gradW += noiseW;
      gradB += noiseB;
    }
    return { gradW, gradB };
  }

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🏔️ Game 2.1: 3D Gradient Descent Marble Run</h2>
          <p class="card-subtitle">Navigate the 3D Convex Cost Surface J(w, b) to the Global Minimum (Midterm Q2)</p>
        </div>
        <span class="concept-badge">Optimization & Loss</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Algorithm Mode (Midterm Q2)</label>
          <select id="gd-mode">
            <option value="batch" ${mode === 'batch' ? 'selected' : ''}>Batch GD (Full Dataset Sum)</option>
            <option value="sgd" ${mode === 'sgd' ? 'selected' : ''}>Stochastic GD (1 Point per Step - Noisy)</option>
            <option value="minibatch" ${mode === 'minibatch' ? 'selected' : ''}>Mini-Batch GD (Subset Batch)</option>
          </select>
        </div>

        <div class="control-item">
          <label>Learning Rate α: <span id="lr-val">${lr.toFixed(2)}</span></label>
          <input type="range" id="gd-lr" min="0.02" max="1.15" step="0.02" value="${lr}">
        </div>

        <div class="control-item" style="flex-direction: row; gap: 8px; align-items: flex-end;">
          <button id="btn-gd-step" class="btn btn-secondary btn-sm">Take 1 Step</button>
          <button id="btn-gd-auto" class="btn btn-primary btn-sm">Run Auto Epochs</button>
          <button id="btn-gd-reset" class="btn btn-secondary btn-sm">Reset Marble</button>
        </div>
      </div>

      <div class="game-viewport" id="gd-canvas-container">
        <div class="viewport-overlay" id="gd-stats-overlay">
          <div><strong>Position:</strong> w = <span id="stat-w">${pos.w.toFixed(2)}</span>, b = <span id="stat-b">${pos.b.toFixed(2)}</span></div>
          <div><strong>Loss J(w, b):</strong> <span id="stat-loss" style="color: var(--accent-amber); font-weight: bold;">${calcLoss(pos.w, pos.b).toFixed(3)}</span></div>
          <div><strong>Epochs:</strong> <span id="stat-epochs">0</span></div>
          <div id="gd-status-banner" style="margin-top: 4px; font-weight: 700;"></div>
        </div>
      </div>

      <details class="math-explainer">
        <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>Batch Gradient Descent:</strong> Sums gradients over <em>every example</em> in the entire training set before updating θ. It produces smooth, deterministic steps directly along the negative gradient, but can be slow on huge datasets.</p>
          <p><strong>Stochastic Gradient Descent (SGD):</strong> Updates θ according to the gradient of the error at <em>each individual training point</em>. It is fast and can escape local plateaus, but exhibits noisy zigzag trajectories.</p>
          <div class="formula-block">
            Batch Update: θ ← θ - α (1/N) ∑ -2xᵢ (yᵢ - (θ₀ + θ₁ xᵢ))<br>
            SGD Update: θ ← θ - α [ -2xᵢ (yᵢ - (θ₀ + θ₁ xᵢ)) ] (single sample estimate)
          </div>
        </div>
      </details>
    </div>
  `;

  const canvasBox = container.querySelector('#gd-canvas-container') as HTMLElement;
  const width = canvasBox.clientWidth || 800;
  const height = 480;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060911);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(8, 8, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasBox.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);

  // Build Paraboloid Surface Mesh J(w, b) = 0.5 * (w^2 + 2b^2)
  const size = 5;
  const segments = 40;
  const geom = new THREE.PlaneGeometry(size * 2, size * 2, segments, segments);
  geom.rotateX(-Math.PI / 2);

  const posAttr = geom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const wx = posAttr.getX(i);
    const bz = posAttr.getZ(i);
    const yVal = 0.2 * (wx * wx + 2 * bz * bz);
    posAttr.setY(i, yVal);
  }
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  });
  const surfaceMesh = new THREE.Mesh(geom, mat);
  scene.add(surfaceMesh);

  // Global minimum glowing marker at (0, 0, 0)
  const minMarkerGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
  const minMarkerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const minMarker = new THREE.Mesh(minMarkerGeom, minMarkerMat);
  minMarker.position.set(0, 0.02, 0);
  scene.add(minMarker);

  // Marble Sphere representing current (w, b)
  const marbleGeom = new THREE.SphereGeometry(0.28, 24, 24);
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.2
  });
  const marble = new THREE.Mesh(marbleGeom, marbleMat);
  scene.add(marble);

  // Trajectory line
  const maxLinePoints = 100;
  const linePositions = new Float32Array(maxLinePoints * 3);
  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
  const trajectoryLine = new THREE.Line(lineGeom, lineMat);
  scene.add(trajectoryLine);

  function updateMarblePosition() {
    const y = 0.2 * (pos.w * pos.w + 2 * pos.b * pos.b) + 0.28;
    marble.position.set(pos.w, y, pos.b);

    // Update trajectory buffer
    const pAttr = trajectoryLine.geometry.attributes.position as THREE.BufferAttribute;
    const count = Math.min(history.length, maxLinePoints);
    for (let i = 0; i < count; i++) {
      const h = history[history.length - 1 - i];
      const hy = 0.2 * (h.w * h.w + 2 * h.b * h.b) + 0.1;
      pAttr.setXYZ(i, h.w, hy, h.b);
    }
    lineGeom.setDrawRange(0, count);
    pAttr.needsUpdate = true;

    // Update overlay text
    const loss = calcLoss(pos.w, pos.b);
    (container.querySelector('#stat-w') as HTMLElement).textContent = pos.w.toFixed(2);
    (container.querySelector('#stat-b') as HTMLElement).textContent = pos.b.toFixed(2);
    (container.querySelector('#stat-loss') as HTMLElement).textContent = loss.toFixed(3);
    (container.querySelector('#stat-epochs') as HTMLElement).textContent = history.length.toString();

    const banner = container.querySelector('#gd-status-banner') as HTMLElement;
    if (loss < 0.05) {
      banner.innerHTML = `<span style="color: var(--accent-green);">🎉 CONVERGED! Loss is minimized near 0!</span>`;
    } else if (loss > 50) {
      banner.innerHTML = `<span style="color: var(--accent-red);">💥 OVERSHOOT / DIVERGENCE! Learning rate α too large!</span>`;
    } else {
      banner.innerHTML = `<span style="color: var(--text-secondary);">Stepping towards global minimum (0, 0)...</span>`;
    }
  }

  function stepGD() {
    sound.playClick();
    const { gradW, gradB } = getGradient(pos.w, pos.b, mode);
    pos.w = pos.w - lr * gradW;
    pos.b = pos.b - lr * gradB;
    const loss = calcLoss(pos.w, pos.b);
    history.push({ w: pos.w, b: pos.b, loss });

    updateMarblePosition();

    if (loss < 0.05 && history.length > 3) {
      sound.playCorrect();
      confetti({ particleCount: 50, spread: 50 });
      gameManager.markGameComplete('week2_gd');
      stopAuto();
    } else if (loss > 60) {
      sound.playWrong();
      stopAuto();
    }
  }

  function startAuto() {
    if (isRunning) return;
    isRunning = true;
    (container.querySelector('#btn-gd-auto') as HTMLElement).textContent = 'Pause Epochs';
    timer = setInterval(() => {
      stepGD();
    }, 150);
  }

  function stopAuto() {
    isRunning = false;
    if (timer) clearInterval(timer);
    const btn = container.querySelector('#btn-gd-auto') as HTMLElement;
    if (btn) btn.textContent = 'Run Auto Epochs';
  }

  function resetMarble() {
    stopAuto();
    pos = { w: 3.5, b: 2.8 };
    history = [];
    updateMarblePosition();
    sound.playClick();
  }

  container.querySelector('#btn-gd-step')?.addEventListener('click', stepGD);
  container.querySelector('#btn-gd-auto')?.addEventListener('click', () => {
    if (isRunning) stopAuto();
    else startAuto();
  });
  container.querySelector('#btn-gd-reset')?.addEventListener('click', resetMarble);

  container.querySelector('#gd-mode')?.addEventListener('change', (e) => {
    mode = (e.target as HTMLSelectElement).value as any;
    sound.playClick();
  });

  container.querySelector('#gd-lr')?.addEventListener('input', (e) => {
    lr = parseFloat((e.target as HTMLInputElement).value);
    (container.querySelector('#lr-val') as HTMLElement).textContent = lr.toFixed(2);
  });

  updateMarblePosition();

  // Three.js animation
  let reqId: number;
  let camAngle = 0.8;
  function animate() {
    reqId = requestAnimationFrame(animate);
    camAngle += 0.003;
    camera.position.x = 9 * Math.cos(camAngle);
    camera.position.z = 9 * Math.sin(camAngle);
    camera.lookAt(0, 1.2, 0);
    renderer.render(scene, camera);
  }
  animate();

  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvasBox)) {
      cancelAnimationFrame(reqId);
      if (timer) clearInterval(timer);
      renderer.dispose();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
