import * as THREE from 'three';
import { sound } from '../audio/sound';
import { gameManager } from '../state';
import confetti from 'canvas-confetti';

interface ClusterPoint {
  x: number;
  z: number;
  cluster: number;
  mesh?: THREE.Mesh;
}

export function renderWeek5Clustering(container: HTMLElement) {
  let mode: 'kmeans' | 'hierarchical' = 'kmeans';
  let kVal = 3;
  let dendroCut = 1.4; // cut threshold
  let linkType: 'single' | 'complete' | 'average' = 'average';

  // Synthetic 3 clusters
  const points: ClusterPoint[] = [];
  const centers = [
    { x: -2.5, z: -1.5 },
    { x: 2.5, z: -1.0 },
    { x: 0.0, z: 2.5 }
  ];

  centers.forEach((c, cIdx) => {
    for (let i = 0; i < 15; i++) {
      const rx = c.x + (Math.random() - 0.5) * 1.6;
      const rz = c.z + (Math.random() - 0.5) * 1.6;
      points.push({ x: rx, z: rz, cluster: cIdx });
    }
  });

  // Centroids for k-means
  let centroids = [
    { x: -1.0, z: 0.0 },
    { x: 1.0, z: 1.0 },
    { x: 0.0, z: -2.0 }
  ];

  function runKMeansStep() {
    sound.playClick();
    // 1. Assign each point to closest centroid
    points.forEach(p => {
      let minDist = Infinity;
      let closestC = 0;
      centroids.forEach((c, idx) => {
        const d = Math.hypot(p.x - c.x, p.z - c.z);
        if (d < minDist) {
          minDist = d;
          closestC = idx;
        }
      });
      p.cluster = closestC;
    });

    // 2. Recompute centroids
    for (let c = 0; c < kVal; c++) {
      const clusterPts = points.filter(p => p.cluster === c);
      if (clusterPts.length > 0) {
        const avgX = clusterPts.reduce((sum, p) => sum + p.x, 0) / clusterPts.length;
        const avgZ = clusterPts.reduce((sum, p) => sum + p.z, 0) / clusterPts.length;
        centroids[c] = { x: avgX, z: avgZ };
      }
    }
  }

  function computeSilhouette() {
    let totalScore = 0;
    points.forEach(p => {
      // a(i): intra-cluster average distance
      const sameCluster = points.filter(o => o.cluster === p.cluster && o !== p);
      let a_i = 0;
      if (sameCluster.length > 0) {
        a_i = sameCluster.reduce((sum, o) => sum + Math.hypot(p.x - o.x, p.z - o.z), 0) / sameCluster.length;
      }

      // b(i): nearest cluster average distance
      let b_i = Infinity;
      for (let c = 0; c < kVal; c++) {
        if (c === p.cluster) continue;
        const otherPts = points.filter(o => o.cluster === c);
        if (otherPts.length > 0) {
          const avgD = otherPts.reduce((sum, o) => sum + Math.hypot(p.x - o.x, p.z - o.z), 0) / otherPts.length;
          if (avgD < b_i) b_i = avgD;
        }
      }
      if (b_i === Infinity) b_i = 0;

      const denom = Math.max(a_i, b_i);
      const s_i = denom > 0 ? (b_i - a_i) / denom : 0;
      totalScore += s_i;
    });
    return totalScore / points.length;
  }

  container.innerHTML = `
    <div class="game-card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>🌌 Game 5.1: 3D K-Means & Dendrogram Chopper (Three.js)</h2>
          <p class="card-subtitle">Master Unsupervised Clustering, Linkage Variations, and Silhouette Validation (Midterm Q1)</p>
        </div>
        <span class="concept-badge">Unsupervised Learning</span>
      </div>

      <div class="controls-panel">
        <div class="control-item">
          <label>Algorithm View</label>
          <div style="display:flex; gap:8px;">
            <button id="btn-view-kmeans" class="btn btn-sm ${mode === 'kmeans' ? 'btn-primary' : 'btn-secondary'}">K-Means Centroid Dynamics</button>
            <button id="btn-view-hier" class="btn btn-sm ${mode === 'hierarchical' ? 'btn-primary' : 'btn-secondary'}">Hierarchical Dendrogram Chopper</button>
          </div>
        </div>

        ${mode === 'kmeans' ? `
          <div class="control-item">
            <label>Number of Clusters (k): <span id="k-label">${kVal}</span></label>
            <input type="range" id="kmeans-k" min="2" max="5" step="1" value="${kVal}">
          </div>

          <div class="control-item" style="flex-direction:row; gap:8px; align-items:flex-end;">
            <button id="btn-kmeans-step" class="btn btn-primary btn-sm">Iterate Step (Assign & Move)</button>
            <button id="btn-kmeans-reinit" class="btn btn-secondary btn-sm">Randomize Centroids</button>
          </div>
        ` : `
          <div class="control-item">
            <label>Linkage Variation (Slides 11-13)</label>
            <select id="linkage-select">
              <option value="single" ${linkType === 'single' ? 'selected' : ''}>Single Link (Nearest Neighbors - min)</option>
              <option value="complete" ${linkType === 'complete' ? 'selected' : ''}>Complete Link (Furthest Neighbors - max)</option>
              <option value="average" ${linkType === 'average' ? 'selected' : ''}>Average Link (All Pairs Mean)</option>
            </select>
          </div>

          <div class="control-item">
            <label>Dendrogram Cut Threshold: <span id="cut-label">${dendroCut.toFixed(2)}</span></label>
            <input type="range" id="dendro-slider" min="0.4" max="2.5" step="0.1" value="${dendroCut}">
          </div>
        `}
      </div>

      <div class="game-viewport" id="cluster-canvas-container" style="height: 420px;">
        <div class="viewport-overlay" id="cluster-overlay">
          <div><strong style="color:var(--accent-cyan);">Algorithm:</strong> ${mode.toUpperCase()}</div>
          <div><strong style="color:var(--accent-amber);">Mean Silhouette Score:</strong> <span id="sil-val" style="color:var(--accent-green); font-weight:bold;">0.00</span> (Scale: -1 to +1)</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">+1 = Dense cluster & far apart; 0 = Overlapping; -1 = Misclustered</div>
        </div>
      </div>

      <div style="text-align: right; margin-top: 14px;">
        <button id="btn-cluster-certify" class="btn btn-accent">Verify Unsupervised Clustering Mastery</button>
      </div>

      <div id="cluster-feedback" style="min-height: 24px; margin-top: 14px;"></div>

      <details class="math-explainer">
        <summary>💡 Hierarchical Linkage Variations & Silhouette Score (Week 5 Slides) (Click to expand)</summary>
        <div class="explainer-content">
          <p><strong>1. Single Link (Nearest Neighbors):</strong> Distance between clusters $G$ and $H$ is the distance between their <em>two closest members</em>: $d_{SL}(G, H) = \\min_{i \\in G, i' \\in H} d_{i, i'}$.</p>
        <p><strong>2. Complete Link (Furthest Neighbors):</strong> Distance between clusters is defined by their <em>two most distant members</em>: $d_{CL}(G, H) = \\max_{i \\in G, i' \\in H} d_{i, i'}$.</p>
        <p><strong>3. Average Link:</strong> Average distance across all pairwise points: $d_{avg}(G, H) = \\frac{1}{n_G n_H} \\sum \\sum d_{i, i'}$.</p>
        <div class="formula-block">
          Silhouette Score: s_i = (b_i - a_i) / max(a_i, b_i)<br>
          where a_i = intra-cluster distance, b_i = distance to nearest foreign cluster
        </div>
        </div>
      </details>
    </div>
  `;

  const canvasBox = container.querySelector('#cluster-canvas-container') as HTMLElement;
  const width = canvasBox.clientWidth || 800;
  const height = 420;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060914);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 9, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasBox.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  const grid = new THREE.GridHelper(10, 10, 0x00f0ff, 0x1f293d);
  scene.add(grid);

  // Colors for clusters
  const clusterColors = [0x00f0ff, 0xff3366, 0x00ff88, 0xffaa00, 0x9d4edd];

  // Point meshes
  const ptGeom = new THREE.SphereGeometry(0.14, 16, 16);
  points.forEach(p => {
    const mat = new THREE.MeshStandardMaterial({ color: clusterColors[p.cluster % clusterColors.length] });
    const mesh = new THREE.Mesh(ptGeom, mat);
    mesh.position.set(p.x, 0.15, p.z);
    scene.add(mesh);
    p.mesh = mesh;
  });

  // Centroid meshes (tall pyramids / cones)
  const centroidMeshes: THREE.Mesh[] = [];
  const coneGeom = new THREE.ConeGeometry(0.3, 0.8, 16);
  coneGeom.rotateX(Math.PI); // upside down pointing down
  for (let c = 0; c < 5; c++) {
    const cMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: clusterColors[c % clusterColors.length],
      emissiveIntensity: 0.8
    });
    const cMesh = new THREE.Mesh(coneGeom, cMat);
    scene.add(cMesh);
    centroidMeshes.push(cMesh);
  }

  function updateVisuals() {
    points.forEach(p => {
      if (p.mesh) {
        (p.mesh.material as THREE.MeshStandardMaterial).color.setHex(clusterColors[p.cluster % clusterColors.length]);
      }
    });

    centroidMeshes.forEach((cm, idx) => {
      if (mode === 'kmeans' && idx < kVal) {
        cm.visible = true;
        cm.position.set(centroids[idx].x, 0.5, centroids[idx].z);
      } else {
        cm.visible = false;
      }
    });

    const sil = computeSilhouette();
    const silEl = container.querySelector('#sil-val');
    if (silEl) silEl.textContent = sil.toFixed(3);
  }

  updateVisuals();

  container.querySelector('#btn-view-kmeans')?.addEventListener('click', () => {
    sound.playClick();
    mode = 'kmeans';
    renderWeek5Clustering(container);
  });

  container.querySelector('#btn-view-hier')?.addEventListener('click', () => {
    sound.playClick();
    mode = 'hierarchical';
    renderWeek5Clustering(container);
  });

  container.querySelector('#btn-kmeans-step')?.addEventListener('click', () => {
    runKMeansStep();
    updateVisuals();
  });

  container.querySelector('#btn-kmeans-reinit')?.addEventListener('click', () => {
    sound.playClick();
    centroids = [
      { x: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
      { x: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
      { x: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
      { x: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
      { x: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
    ];
    runKMeansStep();
    updateVisuals();
  });

  container.querySelector('#kmeans-k')?.addEventListener('input', (e) => {
    kVal = parseInt((e.target as HTMLInputElement).value);
    const lbl = container.querySelector('#k-label');
    if (lbl) lbl.textContent = kVal.toString();
    runKMeansStep();
    updateVisuals();
  });

  container.querySelector('#btn-cluster-certify')?.addEventListener('click', () => {
    const sil = computeSilhouette();
    const fb = container.querySelector('#cluster-feedback') as HTMLElement;
    if (sil >= 0.55) {
      sound.playVictory();
      confetti({ particleCount: 75, spread: 65 });
      gameManager.addScore(150, 75);
      gameManager.markGameComplete('week5_cluster');
      fb.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
          <strong>🎉 High Silhouette Score Verified (${sil.toFixed(3)})!</strong> Your clustering has low intra-cluster distance a_i and high inter-cluster distance b_i!
        </div>
      `;
    } else {
      sound.playWrong();
      fb.innerHTML = `
        <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 14px; color: #fef08a;">
          <strong>Current Silhouette Score: ${sil.toFixed(3)}</strong> Click "Iterate Step" multiple times until centroids converge on the true 3 clusters!
        </div>
      `;
    }
  });

  let reqId: number;
  let angle = 0;
  function animate() {
    reqId = requestAnimationFrame(animate);
    angle += 0.003;
    camera.position.x = 9 * Math.cos(angle);
    camera.position.z = 9 * Math.sin(angle);
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
