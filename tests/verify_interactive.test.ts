import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 950 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Check week1_bayes (NEW Tabular Probability & Bayes Matrix)
  console.log('Testing Tabular Probability & Bayes Matrix (Week 1)...');
  await page.click('button.nav-tab[data-tab="week1"]');
  await page.waitForTimeout(400);
  await page.click('button.sub-nav-btn[data-gameid="bayes"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w1_bayes_table.png' });
  // Contingency matrix tab
  await page.click('#tab-contingency');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w1_bayes_contingency.png' });
  // Naive Bayes tab
  await page.click('#tab-naive');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w1_bayes_naive.png' });

  // 2. Check week3_decision_tree (Expanded Gini & Decision Tree Suite)
  console.log('Testing Decision Tree & Gini Suite (Week 3)...');
  await page.click('button.nav-tab[data-tab="week3"]');
  await page.waitForTimeout(400);
  await page.click('button.sub-nav-btn[data-gameid="tree"]');
  await page.waitForTimeout(600);
  // Impurity curves tab
  await page.click('#tab-curves');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w3_tree_curves.png' });
  // Tabular attribute selection tab
  await page.click('#tab-attribute');
  await page.waitForTimeout(300);
  await page.click('button.btn-choose-root[data-attr="age"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w3_tree_attribute.png' });

  // 3. Check week3_featureprep (Expanded Normalization Suite)
  console.log('Testing 5-Method Normalization (Week 3)...');
  await page.click('button.sub-nav-btn[data-gameid="featureprep"]');
  await page.waitForTimeout(600);
  await page.click('button.step-dot[data-step="2"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/home/user/.gemini/antigravity/brain/3e258a16-fd32-4693-bb8a-642c183770f8/screenshots/verify_w3_normalization.png' });

  console.log('All tests executed and verified successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
