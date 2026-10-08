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
  let dendroCut = 1.6; // cut threshold
  let linkType: 'single' | 'complete' | 'average' = 'average';
  let hasConverged = false;

  // Synthetic 3 clusters
  const points: ClusterPoint[] = [];
  const centers = [
    { x: -2.5, z: -1.5 },
    { x: 2.5, z: -1.0 },
    { x: 0.0, z: 2.5 }
  ];

  // 15 points per cluster = 45 points
  centers.forEach((c) => {
    for (let i = 0; i < 15; i++) {
      const rx = c.x + (((i * 13) % 10) / 10 - 0.5) * 1.5;
      const rz = c.z + (((i * 29) % 10) / 10 - 0.5) * 1.5;
      // Start unassigned (cluster = -1) so player MUST run k-means or cut dendrogram to achieve mastery!
      points.push({ x: rx, z: rz, cluster: -1 });
    }
  });

  // Always pre-allocate 5 centroids to prevent undefined access when k=4 or 5
  let centroids = [
    { x: -1.0, z: 0.0 },
    { x: 1.0, z: 1.0 },
    { x: 0.0, z: -2.0 },
    { x: -2.0, z: 2.0 },
    { x: 2.0, z: 2.0 }
  ];

  // -------------------------------------------------------------
  // Agglomerative Hierarchical Linkage Engine
  // -------------------------------------------------------------
  function runHierarchicalLinkage() {
    const n = points.length;
    // Pairwise distance matrix
    const distMatrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      distMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        distMatrix[i][j] = Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z);
      }
    }

    // Cluster map
    let clusters: { id: number; members: number[] }[] = points.map((_, idx) => ({ id: idx, members: [idx] }));

    while (clusters.length > 1) {
      let minLinkDist = Infinity;
      let pair: [number, number] = [0, 1];

      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const m1 = clusters[i].members;
          const m2 = clusters[j].members;
          const dists: number[] = [];
          for (const p1 of m1) {
            for (const p2 of m2) {
              dists.push(distMatrix[p1][p2]);
            }
          }

          let d = 0;
          if (linkType === 'single') d = Math.min(...dists);
          else if (linkType === 'complete') d = Math.max(...dists);
          else d = dists.reduce((a, b) => a + b, 0) / dists.length;

          if (d < minLinkDist) {
            minLinkDist = d;
            pair = [i, j];
          }
        }
      }

      // If smallest distance exceeds dendrogram cut threshold, stop merging!
      if (minLinkDist > dendroCut) {
        break;
      }

      // Merge pair
      const [c1, c2] = pair;
      const mergedMembers = [...clusters[c1].members, ...clusters[c2].members];
      clusters.splice(Math.max(c1, c2), 1);
      clusters.splice(Math.min(c1, c2), 1);
      clusters.push({ id: Date.now() + Math.random(), members: mergedMembers });
    }

    // Assign cluster IDs to points based on final remaining clusters
    clusters.forEach((cl, cIdx) => {
      cl.members.forEach(mIdx => {
        points[mIdx].cluster = cIdx;
      });
    });
  }

  function runKMeansStep() {
    sound.playClick();
    // 1. Assign each point to closest centroid strictly considering only active kVal centroids
    points.forEach(p => {
      let minDist = Infinity;
      let closestC = 0;
      for (let c = 0; c < kVal; c++) {
        const d = Math.hypot(p.x - centroids[c].x, p.z - centroids[c].z);
        if (d < minDist) {
          minDist = d;
          closestC = c;
        }
      }
      p.cluster = closestC;
    });

    // 2. Recompute centroids for active kVal
    for (let c = 0; c < kVal; c++) {
      const clusterPts = points.filter(p => p.cluster === c);
      if (clusterPts.length > 0) {
        const avgX = clusterPts.reduce((sum, p) => sum + p.x, 0) / clusterPts.length;
        const avgZ = clusterPts.reduce((sum, p) => sum + p.z, 0) / clusterPts.length;
        centroids[c] = { x: avgX, z: avgZ };
      }
    }
  }

  function computeSilhouette(): number {
    const assignedPts = points.filter(p => p.cluster >= 0);
    if (assignedPts.length === 0) return 0;

    let totalScore = 0;
    assignedPts.forEach(p => {
      const sameCluster = assignedPts.filter(o => o.cluster === p.cluster && o !== p);
      let a_i = 0;
      if (sameCluster.length > 0) {
        a_i = sameCluster.reduce((sum, o) => sum + Math.hypot(p.x - o.x, p.z - o.z), 0) / sameCluster.length;
      }

      let b_i = Infinity;
      const numC = mode === 'kmeans' ? kVal : Math.max(...points.map(pt => pt.cluster)) + 1;
      for (let c = 0; c < numC; c++) {
        if (c === p.cluster) continue;
        const otherPts = assignedPts.filter(o => o.cluster === c);
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
    return totalScore / assignedPts.length;
  }

  function renderUI() {
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
              <input type="range" id="dendro-slider" min="0.4" max="3.5" step="0.1" value="${dendroCut}">
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
            <p><strong>1. Single Link (Nearest Neighbors):</strong> Distance between clusters $G$ and $H$ is the distance between their <em>two closest members</em>: $d_{SL}(G, H) = \\min_{i \\in G, i' \\in H} d_{i, i'}$. Vulnerable to chaining!</p>
            <p><strong>2. Complete Link (Furthest Neighbors):</strong> Distance between clusters is defined by their <em>two most distant members</em>: $d_{CL}(G, H) = \\max_{i \\in G, i' \\in H} d_{i, i'}$. Produces compact clusters.</p>
            <p><strong>3. Average Link:</strong> Average distance across all pairwise points: $d_{avg}(G, H) = \\frac{1}{n_G n_H} \\sum \\sum d_{i, i'}$.</p>
            <div class="formula-block">
              Silhouette Score: s_i = (b_i - a_i) / max(a_i, b_i)<br>
              where a_i = intra-cluster distance, b_i = distance to nearest foreign cluster
            </div>
          </div>
        </details>
      </div>
    `;

    setupThreeScene();
    attachListeners();
  }

  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  const clusterColors = [0x00f0ff, 0xff3366, 0x00ff88, 0xffaa00, 0x9d4edd];
  const unassignedColor = 0x64748b;
  let centroidMeshes: THREE.Mesh[] = [];

  function setupThreeScene() {
    const canvasBox = container.querySelector('#cluster-canvas-container') as HTMLElement;
    if (!canvasBox) return;
    const width = canvasBox.clientWidth || 800;
    const height = 420;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 9, 8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    canvasBox.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(10, 10, 0x00f0ff, 0x1f293d);
    scene.add(grid);

    // Point meshes
    const ptGeom = new THREE.SphereGeometry(0.14, 16, 16);
    points.forEach(p => {
      const color = p.cluster >= 0 ? clusterColors[p.cluster % clusterColors.length] : unassignedColor;
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(ptGeom, mat);
      mesh.position.set(p.x, 0.15, p.z);
      scene.add(mesh);
      p.mesh = mesh;
    });

    // Centroid meshes (tall pyramids / cones)
    centroidMeshes = [];
    const coneGeom = new THREE.ConeGeometry(0.3, 0.8, 16);
    coneGeom.rotateX(Math.PI);
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

    updateVisuals();

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

  function updateVisuals() {
    points.forEach(p => {
      if (p.mesh) {
        const color = p.cluster >= 0 ? clusterColors[p.cluster % clusterColors.length] : unassignedColor;
        (p.mesh.material as THREE.MeshStandardMaterial).color.setHex(color);
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

  function attachListeners() {
    container.querySelector('#btn-view-kmeans')?.addEventListener('click', () => {
      sound.playClick();
      mode = 'kmeans';
      renderUI();
    });

    container.querySelector('#btn-view-hier')?.addEventListener('click', () => {
      sound.playClick();
      mode = 'hierarchical';
      runHierarchicalLinkage();
      renderUI();
    });

    container.querySelector('#btn-kmeans-step')?.addEventListener('click', () => {
      runKMeansStep();
      hasConverged = true;
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

    container.querySelector('#linkage-select')?.addEventListener('change', (e) => {
      linkType = (e.target as HTMLSelectElement).value as any;
      sound.playClick();
      runHierarchicalLinkage();
      updateVisuals();
    });

    container.querySelector('#dendro-slider')?.addEventListener('input', (e) => {
      dendroCut = parseFloat((e.target as HTMLInputElement).value);
      const lbl = container.querySelector('#cut-label');
      if (lbl) lbl.textContent = dendroCut.toFixed(2);
      runHierarchicalLinkage();
      updateVisuals();
    });

    container.querySelector('#btn-cluster-certify')?.addEventListener('click', () => {
      const sil = computeSilhouette();
      const fb = container.querySelector('#cluster-feedback') as HTMLElement;
      if (sil >= 0.55 && (hasConverged || mode === 'hierarchical')) {
        sound.playVictory();
        confetti({ particleCount: 75, spread: 65 });
        gameManager.addScore(150, 75);
        gameManager.markGameComplete('week5_cluster');
        fb.innerHTML = `
          <div style="background: rgba(0, 255, 136, 0.15); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 14px; color: #a7f3d0;">
            <strong>🎉 High Silhouette Score Verified (${sil.toFixed(3)})!</strong> You converged clusters with high cohesion (low intra-cluster distance a_i) and strong separation (high nearest-cluster distance b_i)!
          </div>
        `;
      } else {
        sound.playWrong();
        fb.innerHTML = `
          <div style="background: rgba(255, 170, 0, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); padding: 14px; color: #fef08a;">
            <strong>Silhouette Score: ${sil.toFixed(3)}</strong> You must run the clustering algorithm (Click "Iterate Step" or adjust Dendrogram Cut) until points converge into well-separated clusters before certifying!
          </div>
        `;
      }
    });
  }

  renderUI();
}
