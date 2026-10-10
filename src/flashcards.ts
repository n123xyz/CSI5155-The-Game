import { gameManager } from './state';
import katex from 'katex';

type Phase = 'before' | 'after';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface WeeklyDeck {
  title: string;
  cards: Flashcard[];
}

const decks = new Map<string, Promise<WeeklyDeck>>();
let renderToken = 0;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface MathExpression {
  html: string;
  display: boolean;
}

function renderInline(markdown: string, expressions: MathExpression[]): string {
  let text = escapeHtml(markdown);
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\u0000MATH_(\d+)\u0000/g, (token, index: string) => {
    const expression = expressions[Number(index)];
    return expression?.html ?? token;
  });
  return text;
}

function renderMarkdown(markdown: string): string {
  const expressions: MathExpression[] = [];
  const createMathToken = (latex: string, display: boolean) => {
    const index = expressions.push({
      html: katex.renderToString(latex.trim(), { displayMode: display, throwOnError: false }),
      display,
    }) - 1;
    return `\u0000MATH_${index}\u0000`;
  };
  const tokenizedMarkdown = markdown
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, latex: string) => createMathToken(latex, true))
    .replace(/(?<!\\)\$([^$\n]+?)\$/g, (_, latex: string) => createMathToken(latex, false));

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: Array<{ ordered: boolean; text: string }> = [];
  const mathTokenPattern = /^\u0000MATH_(\d+)\u0000$/;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(line => renderInline(line, expressions)).join('<br>')}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      const firstItem = listItems[0];
      if (!firstItem) return;
      const ordered = firstItem.ordered;
      const tag = ordered ? 'ol' : 'ul';
      blocks.push(`<${tag}>${listItems.map(item => `<li>${renderInline(item.text, expressions)}</li>`).join('')}</${tag}>`);
      listItems = [];
    }
  };

  for (const line of tokenizedMarkdown.split(/\r?\n/)) {
    const mathToken = line.trim().match(mathTokenPattern);
    if (mathToken?.[1] !== undefined) {
      const expression = expressions[Number(mathToken[1])];
      if (expression?.display) {
        flushParagraph();
        flushList();
        blocks.push(`<div class="flashcard-display-math">${expression.html}</div>`);
        continue;
      }
    }

    const listItem = line.match(/^\s*(?:([-*])|(\d+\.))\s+(.+)$/);
    if (listItem?.[3] !== undefined) {
      flushParagraph();
      listItems.push({ ordered: Boolean(listItem[2]), text: listItem[3] });
    } else if (line.trim()) {
      flushList();
      paragraph.push(line.trim());
    } else {
      flushParagraph();
      flushList();
    }
  }
  flushParagraph();
  flushList();
  return blocks.join('');
}

function parseField(block: string, field: 'Front' | 'Back'): string {
  const marker = `* **${field}:**`;
  const start = block.indexOf(marker);
  if (start < 0) throw new Error(`Flashcard is missing its ${field.toLowerCase()}.`);

  const valueStart = start + marker.length;
  let valueEnd = block.length;
  if (field === 'Front') {
    valueEnd = block.indexOf('* **Back:**', valueStart);
    if (valueEnd < 0) throw new Error('Flashcard is missing its back.');
  }
  return block.slice(valueStart, valueEnd).trim();
}

function parseDeck(source: string, week: string): WeeklyDeck {
  const sectionPattern = new RegExp(`^## SECTION [1-5]: (Week ${week.slice(-1)} — .+)$`, 'm');
  const sectionMatch = source.match(sectionPattern);
  const sectionTitle = sectionMatch?.[1];
  if (!sectionMatch || sectionMatch.index === undefined || !sectionTitle) {
    throw new Error(`The source deck has no flashcard section for ${week}.`);
  }

  const sectionStart = sectionMatch.index + sectionMatch[0].length;
  const nextSection = source.indexOf('\n## SECTION ', sectionStart);
  const section = source.slice(sectionStart, nextSection < 0 ? undefined : nextSection);
  const cardBlocks = [...section.matchAll(/^### CARD (\d+)\s*$/gm)];
  const cards = cardBlocks.map((match, index) => {
    const start = match.index! + match[0].length;
    const end = cardBlocks[index + 1]?.index ?? section.length;
    const block = section.slice(start, end);
    const id = match[1];
    if (!id) throw new Error('A flashcard in the source deck is missing its card number.');
    return {
      id,
      front: parseField(block, 'Front'),
      back: parseField(block, 'Back'),
    };
  });

  if (!cards.length) throw new Error(`The source deck contains no cards for ${week}.`);
  return { title: sectionTitle, cards };
}

function loadDeck(week: string): Promise<WeeklyDeck> {
  let deck = decks.get(week);
  if (!deck) {
    deck = fetch('/flashcards.md')
      .then(response => {
        if (!response.ok) throw new Error(`Could not load the flashcard deck (${response.status}).`);
        return response.text();
      })
      .then(source => parseDeck(source, week));
    decks.set(week, deck);
  }
  return deck;
}

function renderError(container: HTMLElement, message: string) {
  container.innerHTML = `
    <section class="game-card flashcard-error" role="alert">
      <h2>Flashcards could not be loaded</h2>
      <p>${escapeHtml(message)}</p>
      <button class="btn btn-secondary" type="button" data-flashcard-retry>Retry</button>
    </section>
  `;
  container.querySelector('[data-flashcard-retry]')?.addEventListener('click', () => {
    decks.clear();
    renderWeekFlashcards(container, container.dataset.week!, container.dataset.phase as Phase);
  });
}

function renderCard(
  container: HTMLElement,
  week: string,
  phase: Phase,
  deck: WeeklyDeck,
  token: number,
  onBeforeComplete?: () => void,
) {
  const run = gameManager.getFlashcardRun(week, phase);
  const rated = run.ratedCards;
  const reviewQueue = run.reviewQueue;
  const reviewedCardIds = reviewQueue?.reviewedCardIds ?? [];
  const reviewCardId = reviewQueue?.cardIds.find(cardId =>
    rated[cardId] === false && !reviewedCardIds.includes(cardId),
  );
  const card = reviewQueue
    ? deck.cards.find(item => item.id === reviewCardId)
    : deck.cards.find(item => !(item.id in rated));
  const finished = !card;
  const reviewCount = Object.values(rated).filter(knewIt => !knewIt).length;
  const phaseLabel = phase === 'before' ? 'Before the week' : 'After the week';

  if (finished) {
    gameManager.markWeekFlashcardsComplete(week, phase);
    container.innerHTML = `
      <section class="game-card flashcard-deck" aria-live="polite">
        <div class="card-header">
          <div class="card-title-group">
            <h2>${escapeHtml(phaseLabel)} flashcards complete</h2>
            <p class="card-subtitle">${escapeHtml(deck.title)}</p>
          </div>
          <span class="concept-badge">Week ${week.slice(-1)} • ${deck.cards.length} cards</span>
        </div>
        <div class="flashcard-complete">
          <h3>${reviewQueue ? 'Review pass complete' : 'Deck complete'}</h3>
          <p>${reviewQueue ? 'You finished this review pass.' : 'You marked every card in the deck.'} ${reviewCount} ${reviewCount === 1 ? 'card remains' : 'cards remain'} flagged for review.</p>
          ${reviewCount ? `<button class="btn btn-secondary" type="button" data-start-review>Review flagged cards (${reviewCount})</button>` : ''}
          ${phase === 'after' && reviewCount === 0 ? '<p>This week’s before-and-after flashcard rounds are complete.</p>' : ''}
          ${phase === 'before' ? '<p>Your week content is now unlocked.</p><button class="btn btn-primary" type="button" data-start-week>Start week content</button>' : ''}
        </div>
      </section>
    `;
    container.querySelector('[data-start-review]')?.addEventListener('click', () => {
      gameManager.startFlashcardReview(week, phase);
      container.dataset.revealed = 'false';
      renderCard(container, week, phase, deck, token, onBeforeComplete);
    });
    container.querySelector('[data-start-week]')?.addEventListener('click', () => onBeforeComplete?.());
    return;
  }

  const position = reviewQueue ? reviewedCardIds.length + 1 : Object.keys(rated).length + 1;
  const progressMax = reviewQueue ? reviewQueue.cardIds.length : deck.cards.length;
  const progressValue = reviewQueue ? reviewedCardIds.length : Object.keys(rated).length;
  container.innerHTML = `
    <section class="game-card flashcard-deck">
      <div class="card-header">
        <div class="card-title-group">
          <h2>${reviewQueue ? `${escapeHtml(phaseLabel)} review` : `${escapeHtml(phaseLabel)} flashcards`}</h2>
          <p class="card-subtitle">${escapeHtml(deck.title)}</p>
        </div>
        <span class="concept-badge">Week ${week.slice(-1)} • ${deck.cards.length} cards</span>
      </div>

      <div class="flashcard-progress-row">
        <span>${reviewQueue ? 'Review card' : 'Card'} ${position} of ${progressMax}</span>
        <span>${reviewCount} flagged to review</span>
      </div>
      <div class="flashcard-progress-track" role="progressbar" aria-label="${reviewQueue ? 'Review cards completed' : 'Flashcards completed'}" aria-valuemin="0" aria-valuemax="${progressMax}" aria-valuenow="${progressValue}">
        <span style="width: ${(progressValue / progressMax) * 100}%"></span>
      </div>

      <article class="flashcard" aria-labelledby="flashcard-front-label">
        <div class="flashcard-card-number">CARD ${escapeHtml(card.id)}</div>
        <h3 id="flashcard-front-label">Front</h3>
        <div class="flashcard-content">${renderMarkdown(card.front)}</div>
        <div class="flashcard-answer" ${container.dataset.revealed === 'true' ? '' : 'hidden'}>
          <h3>Back</h3>
          <div class="flashcard-content">${renderMarkdown(card.back)}</div>
        </div>
      </article>

      <div class="flashcard-actions">
        ${container.dataset.revealed === 'true' ? `
          <button class="btn btn-primary" type="button" data-rate="known">${reviewQueue ? 'I know this now' : 'I knew this'}</button>
          <button class="btn btn-secondary" type="button" data-rate="review">${reviewQueue ? 'Keep flagged' : 'Review again'}</button>
        ` : '<button class="btn btn-primary" type="button" data-reveal>Reveal answer</button>'}
      </div>
    </section>
  `;

  container.querySelector('[data-reveal]')?.addEventListener('click', () => {
    if (container.dataset.flashcardRenderToken !== String(token)) return;
    container.dataset.revealed = 'true';
    renderCard(container, week, phase, deck, token, onBeforeComplete);
  });
  container.querySelectorAll<HTMLButtonElement>('[data-rate]').forEach(button => {
    button.addEventListener('click', () => {
      if (container.dataset.flashcardRenderToken !== String(token)) return;
      gameManager.rateFlashcard(week, phase, card.id, button.dataset.rate === 'known');
      if (reviewQueue) gameManager.markFlashcardReviewed(week, phase, card.id);
      container.dataset.revealed = 'false';
      renderCard(container, week, phase, deck, token, onBeforeComplete);
    });
  });
}

export function renderWeekFlashcards(
  container: HTMLElement,
  week: string,
  phase: Phase,
  onBeforeComplete?: () => void,
) {
  const token = ++renderToken;
  container.dataset.flashcardRenderToken = String(token);
  container.dataset.week = week;
  container.dataset.phase = phase;
  container.dataset.revealed = 'false';
  container.innerHTML = '<section class="game-card"><p>Loading flashcards…</p></section>';

  loadDeck(week)
    .then(deck => {
      if (container.dataset.flashcardRenderToken !== String(token)) return;
      renderCard(container, week, phase, deck, token, onBeforeComplete);
    })
    .catch(error => {
      console.error('Flashcard deck loading failed:', error);
      if (container.dataset.flashcardRenderToken === String(token)) {
        renderError(container, error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    });
}
