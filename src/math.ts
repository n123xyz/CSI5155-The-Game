import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';

const delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
];

function formulaLines(element: HTMLElement): string[] {
  const source = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
  const text = document.createElement('div');
  text.innerHTML = source;
  return (text.textContent ?? '').split('\n').map(line => line.trim()).filter(Boolean);
}

function asTex(line: string): string {
  const colon = line.indexOf(':');
  if (colon > 0) {
    const label = line.slice(0, colon).trim();
    const expression = line.slice(colon + 1).trim();
    if (expression) {
      const subscriptLabel = label.match(/^([A-Za-z]+)([₀₁₂₃₄₅₆₇₈₉]+)$/u);
      const texLabel = subscriptLabel
        ? `\\text{${subscriptLabel[1]}}_{${[...subscriptLabel[2]!].map(digit => '₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)).join('')}}`
        : `\\text{${label}}`;
      return `${texLabel}:\\quad ${expression}`;
    }
  }

  const namedEquation = line.match(/^([A-Za-z][A-Za-z0-9 /&-]*?)\s*=\s*(.+)$/);
  if (namedEquation?.[1] && namedEquation[2]) {
    return `\\text{${namedEquation[1].trim()}} = ${namedEquation[2]}`;
  }
  if (/^where\b/i.test(line)) {
    return `\\text{where}\\quad ${line.replace(/^where\s*/i, '')}`;
  }
  return line;
}

function isEquation(line: string): boolean {
  return /[=≤≥≠∑√Σ∏∫πθμσ∈]|argmax|argmin|\\frac|[_^]/u.test(line);
}

function normalizeTex(line: string): string {
  return line
    .replace(/∑/g, '\\sum ')
    .replace(/∏/g, '\\prod ')
    .replace(/√\(((?:[^()]|\([^()]*\))*)\)/g, '\\sqrt{$1}')
    .replace(/([A-Za-z0-9])²/g, '$1^{2}')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]+/gu, digits => `_{${[...digits].map(digit => '₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)).join('')}}`)
    .replace(/θ/g, '\\theta ').replace(/μ/g, '\\mu ').replace(/σ/g, '\\sigma ')
    .replace(/·/g, '\\cdot ').replace(/≤/g, '\\le ').replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ').replace(/→/g, '\\to ').replace(/ϕ/g, '\\phi ')
    .replace(/⌈/g, '\\lceil ').replace(/⌉/g, '\\rceil ')
    .replace(/x̄/g, '\\bar{x}').replace(/ȳ/g, '\\bar{y}')
    .replace(/f̂/g, '\\hat{f}');
}

function renderFormulaBlocks(root: ParentNode) {
  const blocks: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.matches('.formula-block')) blocks.push(root);
  blocks.push(...root.querySelectorAll<HTMLElement>('.formula-block'));

  for (const block of blocks) {
    if (block.querySelector('.katex') || /\\\[|\\\(|\$\$?/.test(block.textContent ?? '')) continue;
    const lines = formulaLines(block);
    if (!lines.some(isEquation)) continue;
    block.replaceChildren(...lines.map(line => {
      const rendered = document.createElement('div');
      if (isEquation(line)) {
        rendered.className = 'formula-math-line';
        rendered.innerHTML = katex.renderToString(normalizeTex(asTex(line)), {
          displayMode: true,
          throwOnError: false,
          strict: 'ignore',
        });
      } else {
        rendered.className = 'formula-text-line';
        rendered.textContent = line;
      }
      return rendered;
    }));
  }
}

export function renderMath(root: HTMLElement) {
  if (root.closest('.katex')) return;
  renderFormulaBlocks(root);
  renderMathInElement(root, {
    delimiters,
    throwOnError: false,
    strict: 'ignore',
  });
}
