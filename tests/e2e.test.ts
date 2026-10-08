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
      const bundle = buildResult.outputs[0];
      if (!bundle) return new Response('Build produced no bundle output', { status: 500 });
      return new Response(await bundle.arrayBuffer(), {
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
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      (this as HTMLMediaElement).dataset.playAttempts = String(Number(this.dataset.playAttempts ?? 0) + 1);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      (this as HTMLMediaElement).dataset.pauseCalls = String(Number(this.dataset.pauseCalls ?? 0) + 1);
    };
  });

  try {
    console.log('Navigating to game...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    const backgroundMusic = page.locator('#background-music');
    if (!(await backgroundMusic.evaluate(audio => (audio as HTMLAudioElement).loop && (audio as HTMLAudioElement).volume >= 0.65))
      || !(await backgroundMusic.getAttribute('src'))?.includes('background-music.mp3')) {
      throw new Error('Background music should use the provided track, loop, and play at an audible level.');
    }
    await page.click('button[data-tab="week1"]');
    if (!(await backgroundMusic.evaluate(audio => (audio as HTMLAudioElement).dataset.playAttempts !== undefined))) {
      throw new Error('Background music did not attempt playback after user interaction.');
    }
    await page.click('#btn-sound-toggle');
    if (!(await backgroundMusic.evaluate(audio => (audio as HTMLAudioElement).dataset.pauseCalls !== undefined))) {
      throw new Error('Muting the game did not pause background music.');
    }

    console.log('Checking the weekly before-and-after flashcard flow...');
    await page.waitForSelector('.flashcard-deck');
    if (!(await page.locator('.flashcard-card-number').textContent())?.includes('CARD 001')) {
      throw new Error('Week 1 did not begin with CARD 001.');
    }
    if (!(await page.locator('.flashcard-content').first().textContent())?.includes('What is Tom Mitchell’s formal operational definition')) {
      throw new Error('CARD 001 front does not match the source deck.');
    }
    if (await page.locator('.flashcard-answer').isVisible()) {
      throw new Error('Flashcard answer was visible before it was revealed.');
    }
    const mathPage = await browser.newPage();
    await mathPage.goto(`http://localhost:${PORT}/#week2`, { waitUntil: 'networkidle' });
    await mathPage.click('button[data-tab="week2"]');
    await mathPage.click('[data-reveal]');
    await mathPage.click('[data-rate="known"]');
    await mathPage.click('[data-reveal]');
    if (!(await mathPage.locator('.flashcard-display-math .katex-display').count())) {
      throw new Error('Display math was not rendered with KaTeX.');
    }
    await mathPage.close();
    if (!(await page.locator('.sub-nav-btn[data-gameid="paradigms"]').isDisabled())) {
      throw new Error('Week content should remain locked during the before-week deck.');
    }

    for (let i = 0; i < 11; i++) {
      await page.click('[data-reveal]');
      await page.waitForSelector('[data-rate="known"]');
      if (i === 0) {
        const inlineMath = page.locator('.flashcard-answer .katex').first();
        if (!(await inlineMath.count()) || !(await inlineMath.evaluate(el => getComputedStyle(el).fontFamily.includes('KaTeX_Main')))) {
          throw new Error('Inline math was not rendered with KaTeX styles.');
        }
      }
      await page.click('[data-rate="known"]');
    }
    await page.waitForSelector('.flashcard-complete');
    if (!(await page.locator('.flashcard-complete').textContent())?.includes('Your week content is now unlocked.')) {
      throw new Error('Completing the first deck did not unlock week content.');
    }
    await page.click('[data-start-week]');
    await page.waitForFunction(() => !document.querySelector('.sub-nav-btn[data-gameid="paradigms"]')?.hasAttribute('disabled'));
    await page.click('.sub-nav-btn[data-gameid="datasaurus"]');
    await page.locator('.formula-block .katex-display').first().waitFor({ state: 'attached' });
    if (await page.locator('.formula-block .katex-error').count()) {
      throw new Error('A Datasaurus formula failed to render with KaTeX.');
    }
    await page.click('.step-dot[data-step="2"]');
    await page.waitForFunction(() => document.querySelectorAll('.formula-block .katex-display').length >= 2);
    if (await page.locator('.formula-block .katex-error').count()) {
      throw new Error('The sum-rule or product-rule formula failed to render with KaTeX.');
    }
    if (!(await page.locator('.formula-block .katex annotation[encoding="application/x-tex"]').first().textContent())?.includes('\\sum')) {
      throw new Error('The sum-rule equation did not preserve its summation in rendered math.');
    }
    await page.click('.step-dot[data-step="1"]');
    await page.waitForFunction(() => document.querySelectorAll('.formula-block .katex-display').length >= 1);
    if (await page.locator('.math-explainer li .katex').count() < 3) {
      throw new Error('Inline equations in the Datasaurus deep dive were not typeset.');
    }
    const datasaurusInlineMath = await page.locator('.math-explainer li .katex annotation[encoding="application/x-tex"]').allTextContents();
    if (!datasaurusInlineMath.some(tex => tex.includes('\\bar{x}'))) {
      throw new Error('The Datasaurus mean equation did not preserve its overbar notation.');
    }
    const afterDeckButton = page.locator('.sub-nav-btn[data-gameid="flashcards-after"]');
    if (await afterDeckButton.isDisabled()) {
      throw new Error('The after-week deck should be accessible without completing lesson subtasks.');
    }
    await afterDeckButton.click();
    await page.waitForSelector('.flashcard-deck');
    if (!(await afterDeckButton.evaluate(button => button.classList.contains('active')))) {
      throw new Error('Selecting the after-week deck did not open it.');
    }
    if (!(await page.locator('.flashcard-card-number').textContent())?.includes('CARD 001')) {
      throw new Error('The after-week deck did not repeat the source cards.');
    }
    for (let i = 0; i < 11; i++) {
      await page.click('[data-reveal]');
      await page.waitForSelector('[data-rate="known"]');
      await page.click('[data-rate="known"]');
    }
    await page.waitForSelector('.flashcard-complete');
    if (!(await page.locator('.flashcard-complete').textContent())?.includes('before-and-after flashcard rounds are complete')) {
      throw new Error('Completing the second deck did not finish the weekly flashcard flow.');
    }
    for (const [week, count, firstCard] of [
      ['week2', '14', 'CARD 012'],
      ['week3', '15', 'CARD 026'],
      ['week4', '10', 'CARD 041'],
      ['week5', '14', 'CARD 051'],
    ]) {
      await page.click(`button[data-tab="${week}"]`);
      await page.waitForSelector('.flashcard-deck');
      if (await page.locator('.flashcard-card-number').textContent() !== firstCard) {
        throw new Error(`${week} did not load its first source-deck card.`);
      }
      if (await page.locator('[role="progressbar"]').getAttribute('aria-valuemax') !== count) {
        throw new Error(`${week} loaded an unexpected number of flashcards.`);
      }
    }
    const bayesPage = await browser.newPage();
    await bayesPage.addInitScript(() => {
      const weekProgress = Object.fromEntries(
        ['week1', 'week2', 'week3', 'week4', 'week5'].map(week => [
          week,
          { beforeComplete: true, afterComplete: false, visitedGames: [], completedGames: [] },
        ]),
      );
      localStorage.setItem('csi5155_ml_game_state_v1', JSON.stringify({ weekProgress }));
    });
    await bayesPage.goto(`http://localhost:${PORT}/#week1`, { waitUntil: 'networkidle' });
    await bayesPage.click('.sub-nav-btn[data-gameid="bayes"]');
    await bayesPage.click('#tab-practice');
    const correctBayesAnswers = ['9 / 14', '5 / 14', '2 / 9', '3 / 5', '2 / 5', '4 / 5'];
    for (let question = 0; question < correctBayesAnswers.length; question++) {
      const firstChoiceIndex = await bayesPage.locator('.btn-q-choice').first().getAttribute('data-idx');
      if (firstChoiceIndex === '0') {
        throw new Error(`Week 1 tabular probability question ${question + 1} still puts the correct answer first.`);
      }
      const correctChoice = bayesPage.locator('.btn-q-choice').filter({ hasText: correctBayesAnswers[question]! });
      if (!(await correctChoice.count())) {
        throw new Error(`Week 1 tabular probability question ${question + 1} is missing its correct answer.`);
      }
      await correctChoice.click();
      if (!(await bayesPage.locator('#practice-feedback').textContent())?.includes('Correct!')) {
        throw new Error(`Week 1 tabular probability question ${question + 1} did not grade the shuffled correct answer.`);
      }
      if (question < correctBayesAnswers.length - 1) {
        await bayesPage.click('#btn-next-q');
      }
    }
    await bayesPage.close();

    const diagnosticsPage = await browser.newPage();
    await diagnosticsPage.addInitScript(() => {
      if (localStorage.getItem('csi5155_ml_game_state_v1')) return;
      localStorage.setItem('csi5155_ml_game_state_v1', JSON.stringify({
        score: 0,
        xp: 0,
        streak: 0,
        completedGames: {},
        quizScores: {},
        flashcardRuns: {},
        weekProgress: {
          week4: { beforeComplete: true, afterComplete: false, visitedGames: [], completedGames: [] },
        },
        currentWeek: 'hub',
        soundEnabled: true,
      }));
    });
    const pageErrors: string[] = [];
    diagnosticsPage.on('pageerror', error => pageErrors.push(error.message));
    await diagnosticsPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    if (await diagnosticsPage.locator('.hub-metrics .hub-metric-card').nth(1).locator('.val').textContent() !== '0 / 28') {
      throw new Error('Hub game total should match the 28 available weekly lessons.');
    }
    for (const [weekIndex, count] of [5, 6, 6, 8, 3].entries()) {
      if (!(await diagnosticsPage.locator('.hub-week-card').nth(weekIndex).textContent())?.includes(`(${count} Games)`)) {
        throw new Error(`Week ${weekIndex + 1} hub card should show ${count} games.`);
      }
    }

    await diagnosticsPage.click('#btn-sound-toggle');
    if (await diagnosticsPage.locator('#btn-sound-toggle').textContent() !== '🔇') {
      throw new Error('Sound toggle did not switch to muted.');
    }
    const savedSoundPreference = await diagnosticsPage.evaluate(() =>
      JSON.parse(localStorage.getItem('csi5155_ml_game_state_v1') ?? '{}').soundEnabled,
    );
    if (savedSoundPreference !== false) {
      throw new Error('Muted sound preference was not persisted.');
    }
    await diagnosticsPage.reload({ waitUntil: 'networkidle' });
    if (await diagnosticsPage.locator('#btn-sound-toggle').textContent() !== '🔇') {
      const soundState = await diagnosticsPage.evaluate(() => ({
        icon: document.querySelector('#btn-sound-toggle')?.textContent,
        saved: JSON.parse(localStorage.getItem('csi5155_ml_game_state_v1') ?? '{}').soundEnabled,
      }));
      throw new Error(`Muted sound preference was not restored after reload: ${JSON.stringify(soundState)}.`);
    }

    await diagnosticsPage.click('button[data-tab="week4"]');
    await diagnosticsPage.click('.sub-nav-btn[data-gameid="roc"]');
    if (pageErrors.some(error => error.includes('auroc is not defined'))) {
      throw new Error('The ROC/AUROC lesson threw an undefined-auroc error.');
    }
    const aurocLabel = await diagnosticsPage.locator('.viewport-overlay').first().textContent();
    if (!aurocLabel?.includes('AUROC: 0.88')) {
      throw new Error(`ROC/AUROC lesson did not render its empirical AUC: ${aurocLabel}`);
    }

    await diagnosticsPage.click('.sub-nav-btn[data-gameid="regression"]');
    await diagnosticsPage.click('.step-dot[data-step="3"]');
    await diagnosticsPage.click('.q-opt-reg[data-val="correct"]');
    await diagnosticsPage.waitForFunction(() => document.querySelector('#hud-score')?.textContent === '200');
    await diagnosticsPage.click('.q-opt-reg[data-val="correct"]');
    if (await diagnosticsPage.locator('#hud-score').textContent() !== '200') {
      throw new Error('Repeated correct regression answers awarded score more than once.');
    }
    await diagnosticsPage.reload({ waitUntil: 'networkidle' });
    await diagnosticsPage.click('button[data-tab="week4"]');
    await diagnosticsPage.click('.sub-nav-btn[data-gameid="regression"]');
    await diagnosticsPage.click('.step-dot[data-step="3"]');
    await diagnosticsPage.click('.q-opt-reg[data-val="correct"]');
    if (await diagnosticsPage.locator('#hud-score').textContent() !== '200') {
      throw new Error('Regression mastery score was awarded again after reload.');
    }
    if (pageErrors.length) {
      throw new Error(`Diagnostic browser page errors: ${pageErrors.join(' | ')}`);
    }
    await diagnosticsPage.close();

    const auditPage = await browser.newPage();
    await auditPage.addInitScript(() => {
      const weekProgress = Object.fromEntries(
        ['week1', 'week2', 'week3', 'week4', 'week5'].map(week => [
          week,
          { beforeComplete: true, afterComplete: false, visitedGames: [], completedGames: [] },
        ]),
      );
      localStorage.setItem('csi5155_ml_game_state_v1', JSON.stringify({ weekProgress }));
    });
    await auditPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    for (const week of ['week1', 'week2', 'week3', 'week4', 'week5']) {
      await auditPage.click(`button[data-tab="${week}"]`);
      const gameIds = await auditPage.locator('.sub-nav-btn').evaluateAll(buttons =>
        buttons.map(button => (button as HTMLElement).dataset.gameid)
          .filter((id): id is string => Boolean(id && !id.startsWith('flashcards-'))),
      );
      for (const gameId of gameIds) {
        await auditPage.click(`.sub-nav-btn[data-gameid="${gameId}"]`);
        await auditPage.waitForTimeout(40);
        const assertCorrectAnswersAreNotFirst = async () => {
          const correctlyOrdered = await auditPage.locator('.quiz-options').evaluateAll(groups =>
            groups.every(group => {
              const firstOption = group.querySelector<HTMLElement>(':scope > .quiz-option-btn');
              if (!firstOption) return true;
              const value = firstOption.dataset.val ?? '';
              return firstOption.dataset.correct !== 'true' && value !== 'correct' && !value.endsWith('_correct');
            }),
          );
          if (!correctlyOrdered) {
            throw new Error(`${week}/${gameId} displays a marked correct answer first.`);
          }
        };
        await assertCorrectAnswersAreNotFirst();
        const assertMathRendered = async () => {
          const mathIssues = await auditPage.locator('.formula-block').evaluateAll(blocks =>
            blocks.flatMap((block, index) => {
              const text = block.textContent ?? '';
              const hasMath = /[=≤≥≠∑√Σ∏∫πθμσ∈]|argmax|argmin|[_^]/u.test(text);
              return hasMath && !block.querySelector('.katex') ? [`${index}: ${text}`] : [];
            }),
          );
          const errors = await auditPage.locator('.katex-error').allTextContents();
          if (mathIssues.length || errors.length) {
            throw new Error(`${week}/${gameId} contains formulas that failed KaTeX rendering: ${mathIssues.join(' | ')} ${errors.join(' | ')}`);
          }
        };
        await assertMathRendered();
        const stepCount = await auditPage.locator('.step-dot').count();
        for (let step = 1; step <= stepCount; step++) {
          const stepButton = auditPage.locator(`.step-dot[data-step="${step}"]`);
          if (await stepButton.count()) {
            await stepButton.click();
            await auditPage.waitForTimeout(20);
            await assertCorrectAnswersAreNotFirst();
            await assertMathRendered();
          }
        }
      }
    }
    await auditPage.close();
    console.log('✓ All five weekly decks and the complete Week 1 flow verified.');

    console.log('Clicking Midterm Practice Exam tab...');
    await page.click('button[data-tab="midterm"]');
    await page.waitForTimeout(500);

    // Verify all 14 questions are present
    console.log('Checking presence of all 14 questions...');
    for (let i = 1; i <= 14; i++) {
      const qCard = await page.$(`#question-${i}`);
      if (!qCard) throw new Error(`Question ${i} card not found!`);
    }
    const midtermAnswersAreNotFirst = await page.locator('.quiz-options').evaluateAll(groups =>
      groups.every(group => {
        const firstOption = group.querySelector<HTMLElement>(':scope > .quiz-option-btn');
        if (!firstOption) return true;
        const value = firstOption.dataset.val ?? '';
        return firstOption.dataset.correct !== 'true' && value !== 'correct' && !value.endsWith('_correct');
      }),
    );
    if (!midtermAnswersAreNotFirst) {
      throw new Error('The midterm displays a marked correct answer first.');
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
    if (await page.locator('.katex-error').count()) {
      throw new Error('A midterm equation failed to render with KaTeX.');
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
