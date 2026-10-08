import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface PointData {
  id: string;
  name: string;
  f1: number;
  f2: number;
  label: 'A' | 'B';
}

// Exact dataset from Midterm Practice Question 12
const TRAINING_POINTS: PointData[] = [
  { id: 'x1', name: 'x₁', f1: 0, f2: 0, label: 'A' },
  { id: 'x2', name: 'x₂', f1: 2, f2: 0, label: 'A' },
  { id: 'x3', name: 'x₃', f1: 2, f2: 3, label: 'B' },
  { id: 'x4', name: 'x₄', f1: 1, f2: 3, label: 'B' },
  { id: 'x5', name: 'x₅', f1: 4, f2: 1, label: 'B' },
];

export function renderWeek3KnnGalaxy(container: HTMLElement) {
  let k = 1;
  let testPoint = { f1: 2.0, f2: 1.0 }; // exact Midterm Q12 test point x*
  let metric: 'euclidean' | 'manhattan' | 'cosine' = 'euclidean';

  function calcDistance(p: PointData, tp: { f1: number; f2: number }, currentMetric: string) {
    if (currentMetric === 'manhattan') {
      return Math.abs(p.f1 - tp.f1) + Math.abs(p.f2 - tp.f2);
    } else if (currentMetric === 'cosine') {
      const dot = p.f1 * tp.f1 + p.f2 * tp.f2;
      const magP = Math.hypot(p.f1, p.f2) || 1;
      const magT = Math.hypot(tp.f1, tp.f2) || 1;
      const sim = dot / (magP * magT);
      return 1 - sim;
    } else {
      // Euclidean
      return Math.sqrt(Math.pow(p.f1 - tp.f1, 2) + Math.pow(p.f2 - tp.f2, 2));
    }
  }

  function getRankedNeighbors() {
    return TRAINING_POINTS.map(p => ({
      ...p,
      dist: calcDistance(p, testPoint, metric)
    })).sort((a, b) => a.dist - b.dist);
  }

  function renderUI() {
    const ranked = getRankedNeighbors();
    const nearestK = ranked.slice(0, k);

    const votesA = nearestK.filter(p => p.label === 'A').length;
    const votesB = nearestK.filter(p => p.label === 'B').length;
    const winningLabel = votesA > votesB ? 'A' : votesB > votesA ? 'B' : 'Tie (A/B)';

    container.innerHTML = `
      <div class="game-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>🛸 Game 3.2: 3D k-NN Cosmic Radar (Three.js)</h2>
            <p class="card-subtitle">Classify Unseen Test Probe x* = (2, 1) across Distance Metrics (Midterm Q12)</p>
          </div>
          <span class="concept-badge">Midterm Question 12 Focus</span>
        </div>

        <div class="controls-panel">
          <div class="control-item">
            <label>Value of k</label>
            <div style="display: flex; gap: 8px;">
              <button id="btn-k-1" class="btn btn-sm ${k === 1 ? 'btn-primary' : 'btn-secondary'}">k = 1 (Part a)</button>
              <button id="btn-k-3" class="btn btn-sm ${k === 3 ? 'btn-primary' : 'btn-secondary'}">k = 3 (Part b)</button>
              <button id="btn-k-5" class="btn btn-sm ${k === 5 ? 'btn-primary' : 'btn-secondary'}">k = 5</button>
            </div>
          </div>

          <div class="control-item">
            <label>Distance Metric</label>
            <select id="dist-metric-select">
              <option value="euclidean" ${metric === 'euclidean' ? 'selected' : ''}>Euclidean (L2 Norm) [Midterm Q12]</option>
              <option value="manhattan" ${metric === 'manhattan' ? 'selected' : ''}>Manhattan (L1 City Block)</option>
              <option value="cosine" ${metric === 'cosine' ? 'selected' : ''}>Cosine Distance (1 - sim)</option>
            </select>
          </div>

          <div class="control-item">
            <label>Probe Position x*</label>
            <button id="btn-reset-probe" class="btn btn-secondary btn-sm">Reset x* = (2, 1)</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div class="game-viewport" id="knn-3d-box" style="height: 420px;">
            <div class="viewport-overlay" id="knn-overlay">
              <div><strong style="color: #fef08a;">Unseen Probe x*:</strong> (${testPoint.f1.toFixed(1)}, ${testPoint.f2.toFixed(1)})</div>
              <div><strong style="color: var(--accent-cyan);">k = ${k}:</strong> Plurality Vote → <strong style="font-size:15px; color:${winningLabel === 'A' ? 'var(--accent-cyan)' : '#f87171'};">Class ${winningLabel}</strong></div>
              <div>Votes: Class A: ${votesA} | Class B: ${votesB}</div>
            </div>
          </div>

          <!-- Neighbor Distance Leaderboard -->
          <div style="background: rgba(10, 16, 28, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <h4 style="font-size: 13px; color: var(--accent-cyan); margin-bottom: 10px;">Nearest Neighbors to x* = (2, 1)</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${ranked.map((p, idx) => {
                const isSelected = idx < k;
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:6px; background:${isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${isSelected ? 'var(--accent-cyan)' : 'transparent'};">
                    <div>
                      <span style="font-family:'Fira Code'; font-weight:bold; color:${p.label === 'A' ? 'var(--accent-cyan)' : '#f87171'};">${p.name} (${p.f1}, ${p.f2})</span>
                      <span class="badge-pill" style="margin-left:6px;">Class ${p.label}</span>
                    </div>
                    <div style="font-family:'Fira Code'; font-size:12px;">
                      dist = <strong>${p.dist.toFixed(3)}</strong>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top: 18px;">
              <button id="btn-submit-exam-k" class="btn btn-primary" style="width: 100%;">
                Verify Midterm Q12 Choice
              </button>
            </div>
          </div>
        </div>

        <div id="knn-feedback-box" style="min-height: 20px;"></div>

        <details class="math-explainer">
          <summary>💡 Deep Dive & Formula Breakdown (Click to expand)</summary>
          <div class="explainer-content">
            <p><strong>Calculated Euclidean Distances to x* = (2, 1):</strong></p>
            <div class="formula-block">
              d(x₁, x*) = √((0-2)² + (0-1)²) = √(4 + 1) = √5 ≈ 2.236 [Label A]<br>
              d(x₂, x*) = √((2-2)² + (0-1)²) = √(0 + 1) = 1.000      [Label A] (Rank 1)<br>
              d(x₃, x*) = √((2-2)² + (3-1)²) = √(0 + 4) = 2.000      [Label B] (Rank 2)<br>
              d(x₄, x*) = √((1-2)² + (3-1)²) = √(1 + 4) = √5 ≈ 2.236 [Label B]<br>
              d(x₅, x*) = √((4-2)² + (1-1)²) = √(4 + 0) = 2.000      [Label B] (Rank 3)
            </div>
            <p><strong>(a) For k = 1:</strong> The single closest neighbor is x₂ at distance 1.0. Therefore, x* is classified as <strong>Label A</strong>.</p>
            <p><strong>(b) For k = 3:</strong> The three closest neighbors are x₂ (dist 1, A), x₃ (dist 2, B), and x₅ (dist 2, B). By plurality vote: 2 votes for B vs 1 vote for A → x* is classified as <strong>Label B</strong>!</p>
          </div>
        </details>
    </div>
  `;

    setup3DView(nearestK);

    container.querySelector('#btn-k-1')?.addEventListener('click', () => {
      sound.playClick();
      k = 1;
      renderUI();
    });

    container.querySelector('#btn-k-3')?.addEventListener('click', () => {
      sound.playClick();
      k = 3;
      renderUI();
    });

    container.querySelector('#btn-k-5')?.addEventListener('click', () => {
      sound.playClick();
      k = 5;
      renderUI();
    });

    container.querySelector('#dist-metric-select')?.addEventListener('change', (e) => {
      sound.playClick();
      metric = (e.target as HTMLSelectElement).value as any;
      renderUI();
    });

    container.querySelector('#btn-reset-probe')?.addEventListener('click', () => {
      sound.playClick();
      testPoint = { f1: 2.0, f2: 1.0 };
      renderUI();
    });

    container.querySelector('#btn-submit-exam-k')?.addEventListener('click', () => {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 60 });
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week3_knn');

      const fb = container.querySelector('#knn-feedback-box') as HTMLElement;
      if (fb) {
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 16px; color: #a7f3d0; margin-bottom: 16px;">
            <h3 style="font-size: 15px; margin-bottom: 6px;">🎉 Midterm Question 12 Mastery Verified!</h3>
            <p>You proved why <strong>k=1 selects Label A</strong> (via x₂), and <strong>k=3 flips to Label B</strong> (via majority vote of x₂, x₃, x₅)!</p>
          </div>
        `;
      }
    });
  }

  function setup3DView(nearestPoints: PointData[]) {
    const box = container.querySelector('#knn-3d-box') as HTMLElement;
    if (!box) return;
    const w = box.clientWidth || 550;
    const h = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(2, 8, 7);
    camera.lookAt(2, 0, 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    box.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Grid on XZ plane
    const grid = new THREE.GridHelper(8, 8, 0x00f0ff, 0x1f293d);
    grid.position.set(2, 0, 1.5);
    scene.add(grid);

    // Plot Training Points
    TRAINING_POINTS.forEach(p => {
      const isNear = nearestPoints.some(np => np.id === p.id);
      const geom = new THREE.SphereGeometry(isNear ? 0.28 : 0.2, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: p.label === 'A' ? 0x00f0ff : 0xff3366,
        emissive: p.label === 'A' ? 0x0088cc : 0xaa1133,
        emissiveIntensity: isNear ? 0.8 : 0.3
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(p.f1, 0.2, p.f2);
      scene.add(mesh);

      // Connecting laser beam to test probe if in k nearest
      if (isNear) {
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(testPoint.f1, 0.3, testPoint.f2),
          new THREE.Vector3(p.f1, 0.2, p.f2)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xffaa00,
          linewidth: 2
        });
        scene.add(new THREE.Line(lineGeom, lineMat));
      }
    });

    // Plot Unseen Probe x* (Glowing golden octahedron)
    const probeGeom = new THREE.OctahedronGeometry(0.32);
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 0.9,
      wireframe: false
    });
    const probeMesh = new THREE.Mesh(probeGeom, probeMat);
    probeMesh.position.set(testPoint.f1, 0.4, testPoint.f2);
    scene.add(probeMesh);

    // Circle showing k-NN radius
    if (nearestPoints.length > 0) {
      const maxRadius = (nearestPoints[nearestPoints.length - 1] as any).dist;
      const ringGeom = new THREE.RingGeometry(maxRadius - 0.04, maxRadius + 0.04, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(testPoint.f1, 0.05, testPoint.f2);
      scene.add(ring);
    }

    let reqId: number;
    function animate() {
      reqId = requestAnimationFrame(animate);
      probeMesh.rotation.y += 0.02;
      renderer.render(scene, camera);
    }
    animate();

    const observer = new MutationObserver(() => {
      if (!document.body.contains(box)) {
        cancelAnimationFrame(reqId);
        renderer.dispose();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  renderUI();
}
