import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

async function run() {
  console.log('🚀 Running Full E2E Visual Verification with Playwright across ALL 5 Weeks + Exam...');

  if (!existsSync('screenshots')) {
    mkdirSync('screenshots', { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console Error:', msg.text());
    }
  });

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. Hub Overview
    console.log('📸 1. Hub Overview...');
    await page.goto(`${baseUrl}/#hub`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/01_hub_overview.png' });

    // 2. Week 1: Paradigms
    console.log('📸 2. Week 1: Paradigm Rush...');
    await page.goto(`${baseUrl}/#week1:paradigms`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/02_week1_paradigms.png' });

    // 3. Week 1: Mitchell
    console.log('📸 3. Week 1: Mitchell ML Control...');
    await page.goto(`${baseUrl}/#week1:mitchell`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/03_week1_mitchell.png' });

    // 4. Week 1: 3D Vector Arena
    console.log('📸 4. Week 1: 3D Vector Arena...');
    await page.goto(`${baseUrl}/#week1:vector`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/04_week1_vector_3d.png' });

    // 4b. Week 1: Datasaurus Dozen
    console.log('📸 4b. Week 1: Datasaurus Dozen...');
    await page.goto(`${baseUrl}/#week1:datasaurus`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const starBtn = page.locator('button[data-shape="star"]');
    if (await starBtn.isVisible()) {
      await starBtn.click();
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: 'screenshots/04b_week1_datasaurus.png' });

    // 5. Week 2: 3D Gradient Descent
    console.log('📸 5. Week 2: 3D Gradient Descent Marble Run...');
    await page.goto(`${baseUrl}/#week2:gd`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const gdStep = page.locator('#btn-gd-step');
    if (await gdStep.isVisible()) {
      await gdStep.click();
      await page.waitForTimeout(300);
      await gdStep.click();
    }
    await page.screenshot({ path: 'screenshots/05_week2_gd_3d.png' });

    // 5b. Week 2: Bias-Variance Decomposition
    console.log('📸 5b. Week 2: Bias-Variance Decomposition...');
    await page.goto(`${baseUrl}/#week2:biasvar`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const step2Btn = page.locator('.step-dot[data-step="2"]');
    if (await step2Btn.isVisible()) {
      await step2Btn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/05b_week2_bias_variance.png' });

    // 6. Week 2: Regularization L1 vs L2
    console.log('📸 6. Week 2: Regularization Gauntlet...');
    await page.goto(`${baseUrl}/#week2:reg`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const regType = page.locator('#reg-type');
    if (await regType.isVisible()) {
      await regType.selectOption('l1');
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/06_week2_regularization.png' });

    // 7. Week 2: Sigmoid Triage
    console.log('📸 7. Week 2: Clinical Sigmoid Triage...');
    await page.goto(`${baseUrl}/#week2:logistic`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const cautiousBtn = page.locator('#btn-proto-cautious');
    if (await cautiousBtn.isVisible()) {
      await cautiousBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/07_week2_sigmoid_triage.png' });

    // 8. Week 2: 3D SVM Kernel Warp
    console.log('📸 8. Week 2: 3D SVM Kernel Warp...');
    await page.goto(`${baseUrl}/#week2:svm`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/08_week2_svm_3d.png' });

    // 8b. Week 2: Multi-Class Showdown
    console.log('📸 8b. Week 2: Multi-Class Showdown...');
    await page.goto(`${baseUrl}/#week2:multiclass`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/08b_week2_multiclass.png' });

    // 9. Week 3: Decision Tree Entropy Slicer
    console.log('📸 9. Week 3: Decision Tree Entropy Guillotine...');
    await page.goto(`${baseUrl}/#week3:tree`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const t5Btn = page.locator('#btn-t-5');
    if (await t5Btn.isVisible()) {
      await t5Btn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/09_week3_decision_tree.png' });

    // 9b. Week 3: Minkowski Metric Spaces
    console.log('📸 9b. Week 3: Minkowski Metric Spaces...');
    await page.goto(`${baseUrl}/#week3:minkowski`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/09b_week3_minkowski.png' });

    // 10. Week 3: 3D k-NN Cosmic Radar
    console.log('📸 10. Week 3: 3D k-NN Cosmic Radar...');
    await page.goto(`${baseUrl}/#week3:knn`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const k3Btn = page.locator('#btn-k-3');
    if (await k3Btn.isVisible()) {
      await k3Btn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/10_week3_knn_3d.png' });

    // 11. Week 3: Missing Data Imputation
    console.log('📸 11. Week 3: Missing Data Detective...');
    await page.goto(`${baseUrl}/#week3:missing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const globalBtn = page.locator('#btn-imp-global');
    if (await globalBtn.isVisible()) {
      await globalBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/11_week3_missing_data.png' });

    // 11b. Week 3: Feature Prep & Ethics
    console.log('📸 11b. Week 3: Feature Prep & Ethics...');
    await page.goto(`${baseUrl}/#week3:featureprep`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/11b_week3_featureprep.png' });

    // 12. Week 3: Class Imbalance
    console.log('📸 12. Week 3: Class Balancer SMOTE...');
    await page.goto(`${baseUrl}/#week3:imbalance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const smoteBtn = page.locator('#btn-mode-smote');
    if (await smoteBtn.isVisible()) {
      await smoteBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/12_week3_class_imbalance.png' });

    // 13. Week 4: ML Pipeline Lifecycle
    console.log('📸 13. Week 4: ML Pipeline Lifecycle...');
    await page.goto(`${baseUrl}/#week4:pipeline`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/13_week4_pipeline.png' });

    // 13b. Week 4: Confusion Matrix Defense
    console.log('📸 13b. Week 4: Confusion Matrix Defense...');
    await page.goto(`${baseUrl}/#week4:confusion`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/13b_week4_confusion_defense.png' });

    // 13c. Week 4: ROC & AUROC Sweeper
    console.log('📸 13c. Week 4: ROC & AUROC Sweeper...');
    await page.goto(`${baseUrl}/#week4:roc`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/13c_week4_roc.png' });

    // 14. Week 4: Feature Selection
    console.log('📸 14. Week 4: Feature Selection Tournament...');
    await page.goto(`${baseUrl}/#week4:featsel`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/14_week4_feature_selection.png' });

    // 14b. Week 4: Regression Metrics Lab
    console.log('📸 14b. Week 4: Regression Metrics Lab...');
    await page.goto(`${baseUrl}/#week4:regression`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/14b_week4_regression.png' });

    // 14c. Week 4: Hyperparameter Tuning Race
    console.log('📸 14c. Week 4: Hyperparameter Tuning Race...');
    await page.goto(`${baseUrl}/#week4:hyperparam`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const randBtn = page.locator('button[data-mode="random"]');
    if (await randBtn.isVisible()) {
      await randBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/14c_week4_hyperparam.png' });

    // 15. Week 4: Split & Leakage
    console.log('📸 15. Week 4: 3-Way Split & Leakage Gauntlet...');
    await page.goto(`${baseUrl}/#week4:split`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/15_week4_split_leakage.png' });

    // 16. Week 4: 3D PCA Dimension Squeezer
    console.log('📸 16. Week 4: 3D PCA Dimension Squeezer...');
    await page.goto(`${baseUrl}/#week4:pca`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/16_week4_pca_3d.png' });

    // 17. Week 5: 3D K-Means & Dendrogram
    console.log('📸 17. Week 5: 3D K-Means & Dendrogram...');
    await page.goto(`${baseUrl}/#week5:cluster`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const kStep = page.locator('#btn-kmeans-step');
    if (await kStep.isVisible()) {
      await kStep.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'screenshots/17_week5_clustering_3d.png' });

    // 18. Week 5: SSL & Active Learning
    console.log('📸 18. Week 5: SSL & Active Learning Oracle...');
    await page.goto(`${baseUrl}/#week5:ssl`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/18_week5_ssl_oracle.png' });

    // 19. Week 5: Ensemble Clash
    console.log('📸 19. Week 5: Ensemble Clash (Bagging vs Boosting)...');
    await page.goto(`${baseUrl}/#week5:ensemble`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/19_week5_ensemble_clash.png' });

    // 20. Grand Midterm Practice Exam Simulator (Single Question Mode)
    console.log('📸 20. Grand Midterm Practice Exam Simulator (Q1)...');
    await page.goto(`${baseUrl}/#midterm`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/20_midterm_exam_overview.png' });

    // 21. Exam Question 12 Navigation (Numerical Calculation)
    console.log('📸 21. Exam Question 12 (k-NN Numerical Calculation)...');
    const q12Btn = page.locator('button[data-jump-q="12"]');
    if (await q12Btn.isVisible()) {
      await q12Btn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'screenshots/21_midterm_exam_q12_single.png' });

      // Click to expand solution derivation
      const toggleSolBtn = page.locator('#question-12 .btn-toggle-sol');
      if (await toggleSolBtn.isVisible()) {
        await toggleSolBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'screenshots/22_midterm_exam_q12_solution_expanded.png' });
      }
    }

    console.log('🎉 ALL COMPREHENSIVE PLAYWRIGHT SCREENSHOTS CAPTURED CLEANLY!');
  } catch (e) {
    console.error('Error during visual verification:', e);
    throw e;
  } finally {
    await browser.close();
  }
}

run();
