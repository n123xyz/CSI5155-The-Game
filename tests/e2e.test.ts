import { chromium } from 'playwright';
import { serve } from 'bun';
import { join } from 'path';

const PORT = 3456;

// Start server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    if (pathname === '/bundle.js') {
      const buildResult = await Bun.build({
        entrypoints: ['./src/main.ts'],
        target: 'browser',
        minify: false,
      });
      if (!buildResult.success) {
        return new Response('Build failed: ' + JSON.stringify(buildResult.logs), { status: 500 });
      }
      return new Response(await buildResult.outputs[0].arrayBuffer(), {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }

    const filePath = join('./public', pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response('Not found: ' + pathname, { status: 404 });
  }
});

console.log(`Test server running at http://localhost:${PORT}`);

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to game...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

    console.log('Clicking Midterm Practice Exam tab...');
    await page.click('button[data-tab="midterm"]');
    await page.waitForTimeout(500);

    // Verify all 14 questions are present
    console.log('Checking presence of all 14 questions...');
    for (let i = 1; i <= 14; i++) {
      const qCard = await page.$(`#question-${i}`);
      if (!qCard) throw new Error(`Question ${i} card not found!`);
    }
    console.log('All 14 questions found in DOM!');

    // Answer Question 1: S, U, U, S
    console.log('Answering Question 1...');
    await page.click('#question-1 button[data-task="q1_1"][data-val="S"]');
    await page.click('#question-1 button[data-task="q1_2"][data-val="U"]');
    await page.click('#question-1 button[data-task="q1_3"][data-val="U"]');
    await page.click('#question-1 button[data-task="q1_4"][data-val="S"]');

    // Answer Question 2: Batch vs SGD
    console.log('Answering Question 2...');
    await page.click('button[data-jump-q="2"]');
    await page.click('#question-2 button[data-val="opt_bgd_sgd_correct"]');

    // Answer Question 3: Parametric vs Non-parametric
    console.log('Answering Question 3...');
    await page.click('button[data-jump-q="3"]');
    await page.click('#question-3 button[data-val="opt_def_correct"]');
    await page.click('#question-3 button.q3-dt-opt[data-val="non_parametric"]');
    await page.click('#question-3 button.q3-lr-opt[data-val="parametric"]');

    // Answer Question 4: L1 vs L2
    console.log('Answering Question 4...');
    await page.click('button[data-jump-q="4"]');
    await page.click('#question-4 button[data-val="opt_l1_l2_correct"]');

    // Answer Question 5: PCA
    console.log('Answering Question 5...');
    await page.click('button[data-jump-q="5"]');
    await page.check('#question-5 input[value="curse_of_dim"]');
    await page.check('#question-5 input[value="multicollinearity"]');

    // Answer Question 6: Forward vs Backward
    console.log('Answering Question 6...');
    await page.click('button[data-jump-q="6"]');
    await page.click('#question-6 button[data-val="opt_fwd_bwd_correct"]');

    // Answer Question 7: SVM Kernel
    console.log('Answering Question 7...');
    await page.click('button[data-jump-q="7"]');
    await page.click('#question-7 button[data-val="opt_kernel_correct"]');

    // Answer Question 8: Decision Tree Pruning
    console.log('Answering Question 8...');
    await page.click('button[data-jump-q="8"]');
    await page.click('#question-8 button[data-val="opt_pruning_correct"]');

    // Answer Question 9: Train / Val / Test
    console.log('Answering Question 9...');
    await page.click('button[data-jump-q="9"]');
    await page.click('#question-9 button.q9-train-opt[data-val="fit_params"]');
    await page.click('#question-9 button.q9-val-opt[data-val="tune_hyperparams"]');
    await page.click('#question-9 button.q9-test-opt[data-val="unbiased_eval"]');

    // Answer Question 10: Class Imbalance
    console.log('Answering Question 10...');
    await page.click('button[data-jump-q="10"]');
    await page.click('#question-10 button[data-val="opt_imbalance_correct"]');

    // Answer Question 11: High Bias Ensemble
    console.log('Answering Question 11...');
    await page.click('button[data-jump-q="11"]');
    await page.click('#question-11 button.q11-choice-opt[data-val="boosting"]');
    await page.click('#question-11 button.q11-reason-opt[data-val="bias_reduction"]');

    // Answer Question 12: k-NN
    console.log('Answering Question 12...');
    await page.click('button[data-jump-q="12"]');
    await page.fill('#inp-q12-d2', '1.0');
    await page.fill('#inp-q12-d3', '2.0');
    await page.click('#question-12 button.q12-k1-opt[data-val="A"]');
    await page.click('#question-12 button.q12-k3-opt[data-val="B"]');

    // Answer Question 13: Missing Data
    console.log('Answering Question 13...');
    await page.click('button[data-jump-q="13"]');
    await page.fill('#inp-q13-global', '26.4');
    await page.fill('#inp-q13-classA', '21.0');
    await page.click('#question-13 button.q13-strategy-opt[data-val="global_no_leakage"]');

    // Answer Question 14: Entropy & Info Gain
    console.log('Answering Question 14...');
    await page.click('button[data-jump-q="14"]');
    await page.fill('#inp-q14-h', '0.971');
    await page.fill('#inp-q14-ig1', '0.971');
    await page.fill('#inp-q14-ig2', '0.420');
    await page.click('#question-14 button.q14-choice-opt[data-val="t1_maximizes_ig"]');

    // Click Submit Exam
    console.log('Submitting Exam...');
    await page.click('#btn-submit-exam');
    await page.waitForTimeout(500);

    // Verify Grade displays 100%
    const gradeText = await page.textContent('.exam-simulator-wrap');
    console.log('Exam submitted. Checking score...');
    if (!gradeText?.includes('100%')) {
      throw new Error(`Expected 100% grade text, but got: ${gradeText?.substring(0, 500)}`);
    }
    console.log('✓ Grade verified: 100% (100 / 100 points)!');

    // Verify solutions are revealed
    const solutionCount = await page.$$eval('.math-explainer', els => els.length);
    console.log(`Solutions revealed count: ${solutionCount}`);
    if (solutionCount < 14) {
      throw new Error(`Expected 14 solution explainers, found ${solutionCount}`);
    }
    console.log('✓ All 14 solution derivations successfully rendered!');

    // Take screenshot of exam simulator
    await page.screenshot({ path: 'screenshots/midterm_exam_simulator.png', fullPage: false });
    console.log('✓ Screenshot saved to screenshots/midterm_exam_simulator.png');

    console.log('ALL E2E CHECKS PASSED SUCCESSFULLY! 🎉');
  } finally {
    await browser.close();
    server.stop();
  }
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
