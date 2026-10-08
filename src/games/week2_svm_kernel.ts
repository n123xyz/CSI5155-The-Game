import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

export function renderWeek2SvmKernel(container: HTMLElement) {
  let kernelLifting = 0.0; // 0 (2D flat) to 1.0 (fully elevated in 3D)
  let cParam = 1.0; // Soft-margin C
  let planeHeight = 2.0;

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🔮 Game 2.4: 3D SVM Kernel Trick & Slicer (Three.js)</h2>
          <p class="card-subtitle">Project non-linearly separable data into 3D Hilbert space and slice with a maximum margin plane (Midterm Q7)</p>
        </div>
        <span class="concept-badge">Kernel Trick & QP</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Kernel Elevation (z = x₁² + x₂²)</label>
          <input type="range" id="svm-warp" min="0" max="1" step="0.05" value="${kernelLifting}">
        </div>

        <div class="control-item">
          <label>Hyperplane Height (z)</label>
          <input type="range" id="svm-plane-h" min="0.5" max="4.5" step="0.1" value="${planeHeight}">
        </div>

        <div class="control-item">
          <label>Complexity Parameter C: <span id="c-val">${cParam.toFixed(1)}</span></label>
          <input type="range" id="svm-c" min="0.1" max="10" step="0.5" value="${cParam}">
        </div>

        <div class="control-item" style="align-self: flex-end;">
          <button id="btn-svm-slice" class="btn btn-primary btn-sm">Slice & Classify</button>
        </div>
      </div>

      <div class="game-viewport" id="svm-canvas-container">
        <div class="viewport-overlay" id="svm-stats-overlay">
          <div><strong style="color: #60a5fa;">Inner Class (y = -1):</strong> Blue points (radius r &lt; 1.4)</div>
          <div><strong style="color: #f87171;">Outer Class (y = +1):</strong> Red points (radius r &gt; 2.0)</div>
          <div><strong>Kernel Dimension:</strong> <span id="dim-label">2D (Linearly Inseparable!)</span></div>
          <div><strong>Margin Status:</strong> <span id="margin-status">Awaiting Kernel Lift</span></div>
        </div>
      </div>

      <div id="svm-feedback" style="min-height: 32px; margin-top: 14px;"></div>

      <details class="math-explainer">
        <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>Kernel Function Role:</strong> A kernel K(x, x') = ⟨ϕ(x), ϕ(x')⟩ acts as an implicit similarity measure that maps inputs into a higher-dimensional feature space where non-linear patterns become linearly separable!</p>
          <p><strong>Why particularly useful:</strong> Thanks to the <em>"Kernel Trick"</em>, we can compute inner products in infinite- or high-dimensional spaces without ever explicitly computing or storing high-dimensional transformation coordinates ϕ(x), preventing computational blowup.</p>
          <div class="formula-block">
            Quadratic Optimization: min_{w, b} ½||w||² + C ∑ max(0, 1 - yᵢ(wᵀxᵢ + b))<br>
            RBF Kernel: K(x, x') = exp(-γ ||x - x'||²)<br>
            Polynomial Kernel: K(x, x') = (xᵀx' + c)ᵈ
          </div>
        </div>
      </details>
    </div>
  `;

  const canvasBox = container.querySelector('#svm-canvas-container') as HTMLElement;
  const width = canvasBox.clientWidth || 800;
  const height = 480;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c18);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(7, 6, 7);
  camera.lookAt(0, 1.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasBox.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0x00f0ff, 1.5);
  light.position.set(5, 12, 8);
  scene.add(light);

  // 2D Ground grid
  const grid = new THREE.GridHelper(8, 8, 0x3b82f6, 0x1e293b);
  scene.add(grid);

  // Generate Concentric Circles
  const numInner = 24;
  const numOuter = 36;
  const innerPoints: { mesh: THREE.Mesh; x: number; y: number; r: number }[] = [];
  const outerPoints: { mesh: THREE.Mesh; x: number; y: number; r: number }[] = [];

  const innerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
  const outerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.5 });
  const ptGeom = new THREE.SphereGeometry(0.12, 16, 16);

  // Inner ring
  for (let i = 0; i < numInner; i++) {
    const angle = (i / numInner) * Math.PI * 2;
    const r = 0.5 + Math.random() * 0.7;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    const mesh = new THREE.Mesh(ptGeom, innerMat);
    scene.add(mesh);
    innerPoints.push({ mesh, x: px, y: py, r });
  }

  // Outer ring
  for (let i = 0; i < numOuter; i++) {
    const angle = (i / numOuter) * Math.PI * 2;
    const r = 2.0 + Math.random() * 0.8;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    const mesh = new THREE.Mesh(ptGeom, outerMat);
    scene.add(mesh);
    outerPoints.push({ mesh, x: px, y: py, r });
  }

  // Slicing Hyperplane
  const planeGeom = new THREE.PlaneGeometry(7, 7);
  planeGeom.rotateX(-Math.PI / 2);
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const planeMesh = new THREE.Mesh(planeGeom, planeMat);
  scene.add(planeMesh);

  // Margin boundary slabs
  const marginGeom = new THREE.PlaneGeometry(7, 7);
  marginGeom.rotateX(-Math.PI / 2);
  const marginMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const marginUpper = new THREE.Mesh(marginGeom, marginMat);
  const marginLower = new THREE.Mesh(marginGeom, marginMat);
  scene.add(marginUpper);
  scene.add(marginLower);

  function updateVisuals() {
    // Lift points along Y axis based on r^2
    innerPoints.forEach(p => {
      const targetZ = (p.r * p.r) * 0.6; // lower z
      const curY = targetZ * kernelLifting;
      p.mesh.position.set(p.x, curY, p.y);
    });

    outerPoints.forEach(p => {
      const targetZ = (p.r * p.r) * 0.6; // higher z (4.0 ~ 7.0)
      const curY = targetZ * kernelLifting;
      p.mesh.position.set(p.x, curY, p.y);
    });

    // Update plane position
    planeMesh.position.y = planeHeight;

    // Margin width inversely proportional to C
    const marginGap = Math.max(0.1, 1.2 / Math.sqrt(cParam));
    marginUpper.position.y = planeHeight + marginGap;
    marginLower.position.y = planeHeight - marginGap;

    const dimLabel = container.querySelector('#dim-label');
    const marginStatus = container.querySelector('#margin-status');

    if (kernelLifting < 0.2) {
      if (dimLabel) dimLabel.innerHTML = `<span style="color:var(--accent-red);">2D (Linearly Inseparable!)</span>`;
      if (marginStatus) marginStatus.textContent = 'Impossible to separate in 2D';
    } else {
      if (dimLabel) dimLabel.innerHTML = `<span style="color:var(--accent-green);">3D Feature Space (z = ||x||²)</span>`;
      if (planeHeight > 1.0 && planeHeight < 2.5) {
        if (marginStatus) marginStatus.innerHTML = `<span style="color:var(--accent-green); font-weight:bold;">Perfect Linear Separation Achieved!</span>`;
      } else {
        if (marginStatus) marginStatus.innerHTML = `<span style="color:var(--accent-amber);">Plane misaligned - adjust height!</span>`;
      }
    }
  }

  updateVisuals();

  container.querySelector('#svm-warp')?.addEventListener('input', (e) => {
    kernelLifting = parseFloat((e.target as HTMLInputElement).value);
    sound.playSlice();
    updateVisuals();
  });

  container.querySelector('#svm-plane-h')?.addEventListener('input', (e) => {
    planeHeight = parseFloat((e.target as HTMLInputElement).value);
    updateVisuals();
  });

  container.querySelector('#svm-c')?.addEventListener('input', (e) => {
    cParam = parseFloat((e.target as HTMLInputElement).value);
    (container.querySelector('#c-val') as HTMLElement).textContent = cParam.toFixed(1);
    updateVisuals();
  });

  container.querySelector('#btn-svm-slice')?.addEventListener('click', () => {
    const fb = container.querySelector('#svm-feedback') as HTMLElement;
    if (kernelLifting > 0.6 && planeHeight >= 1.0 && planeHeight <= 2.8) {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 60 });
      gameManager.addScore(100, 50);
      gameManager.markGameComplete('week2_svm');
      fb.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 12px 16px; color: #a7f3d0;">
          <strong>🎉 Flawless Separation! (+100 pts)</strong> By projecting the 2D concentric data into 3D via the kernel transformation, the non-linear dataset became cleanly separable by a flat hyperplane!
        </div>
      `;
    } else if (kernelLifting < 0.3) {
      sound.playWrong();
      fb.innerHTML = `
        <div style="background: rgba(255, 51, 68, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-md); padding: 12px 16px; color: #fca5a5;">
          <strong>Cannot separate in 2D!</strong> Drag the <em>Kernel Elevation</em> slider to lift points into 3D Hilbert space first!
        </div>
      `;
    } else {
      sound.playWrong();
      fb.innerHTML = `
        <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 12px 16px; color: #fef08a;">
          <strong>Adjust Hyperplane Height:</strong> Move the plane between the inner cluster and the outer ring!
        </div>
      `;
    }
  });

  let reqId: number;
  let angle = 0;
  function animate() {
    reqId = requestAnimationFrame(animate);
    angle += 0.004;
    camera.position.x = 8 * Math.cos(angle);
    camera.position.z = 8 * Math.sin(angle);
    camera.lookAt(0, 1.5, 0);
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
