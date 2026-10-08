function isCorrectOption(option: HTMLElement): boolean {
  const value = option.dataset.val ?? '';
  return option.dataset.correct === 'true' || value === 'correct' || value.endsWith('_correct');
}

function shuffleGroup(group: HTMLElement) {
  if (group.dataset.optionsShuffled === 'true') return;
  group.dataset.optionsShuffled = 'true';

  const options = [...group.children].filter((element): element is HTMLElement =>
    element instanceof HTMLElement && element.matches('.quiz-option-btn'),
  );
  if (options.length < 2) return;

  for (let index = options.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex]!, options[index]!];
  }

  if (isCorrectOption(options[0]!)) {
    const firstIncorrectIndex = options.findIndex(option => !isCorrectOption(option));
    if (firstIncorrectIndex > 0) {
      [options[0], options[firstIncorrectIndex]] = [options[firstIncorrectIndex]!, options[0]!];
    }
  }

  options.forEach(option => group.appendChild(option));
}

export function shuffleQuizOptions(root: HTMLElement) {
  const group = root.matches('.quiz-options')
    ? root
    : root.closest<HTMLElement>('.quiz-options');
  if (group) shuffleGroup(group);

  root.querySelectorAll<HTMLElement>('.quiz-options').forEach(shuffleGroup);
}
