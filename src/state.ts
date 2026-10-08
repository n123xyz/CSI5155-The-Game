export interface PlayerState {
  score: number;
  xp: number;
  streak: number;
  completedGames: Record<string, boolean>;
  quizScores: Record<string, { score: number; maxScore: number; date: string }>;
  flashcardRuns: Record<string, { ratedCards: Record<string, boolean> }>;
  weekProgress: Record<string, { beforeComplete: boolean; afterComplete: boolean; visitedGames: string[]; completedGames: string[] }>;
  currentWeek: string;
  soundEnabled: boolean;
}

const STORAGE_KEY = 'csi5155_ml_game_state_v1';

class StateManager {
  private state: PlayerState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): PlayerState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const saved = JSON.parse(data) as Partial<PlayerState>;
        return {
          score: saved.score ?? 0,
          xp: saved.xp ?? 0,
          streak: saved.streak ?? 0,
          completedGames: saved.completedGames ?? {},
          quizScores: saved.quizScores ?? {},
          flashcardRuns: saved.flashcardRuns ?? {},
          weekProgress: saved.weekProgress ?? {},
          currentWeek: saved.currentWeek ?? 'hub',
          soundEnabled: saved.soundEnabled ?? true,
        };
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return {
      score: 0,
      xp: 0,
      streak: 0,
      completedGames: {},
      quizScores: {},
      flashcardRuns: {},
      weekProgress: {},
      currentWeek: 'hub',
      soundEnabled: true,
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    this.notify();
  }

  getState(): PlayerState {
    return this.state;
  }

  addScore(points: number, xpPoints: number = points / 2) {
    this.state.score += points;
    this.state.xp += Math.round(xpPoints);
    this.state.streak += 1;
    this.save();
  }

  resetStreak() {
    this.state.streak = 0;
    this.save();
  }

  markGameComplete(gameId: string) {
    if (!this.state.completedGames[gameId]) {
      this.state.completedGames[gameId] = true;
      this.addScore(100, 50);
    }
  }

  recordQuizScore(quizId: string, score: number, maxScore: number) {
    this.state.quizScores[quizId] = {
      score,
      maxScore,
      date: new Date().toISOString(),
    };
    this.save();
  }

  setSoundEnabled(enabled: boolean) {
    this.state.soundEnabled = enabled;
    this.save();
  }

  getWeekProgress(weekId: string) {
    const progress = this.state.weekProgress[weekId];
    return {
      beforeComplete: progress?.beforeComplete ?? false,
      afterComplete: progress?.afterComplete ?? false,
      visitedGames: progress?.visitedGames ?? [],
      completedGames: progress?.completedGames ?? [],
    };
  }

  markWeekFlashcardsComplete(weekId: string, phase: 'before' | 'after') {
    const progress = this.getWeekProgress(weekId);
    this.state.weekProgress[weekId] = {
      ...progress,
      [phase === 'before' ? 'beforeComplete' : 'afterComplete']: true,
    };
    this.save();
  }

  markWeekGameVisited(weekId: string, gameId: string) {
    const progress = this.getWeekProgress(weekId);
    if (progress.visitedGames.includes(gameId)) return;
    this.state.weekProgress[weekId] = {
      ...progress,
      visitedGames: [...progress.visitedGames, gameId],
    };
    this.save();
  }

  markWeekGameComplete(weekId: string, gameId: string) {
    const progress = this.getWeekProgress(weekId);
    if (progress.completedGames.includes(gameId)) return;
    this.state.weekProgress[weekId] = {
      ...progress,
      completedGames: [...progress.completedGames, gameId],
    };
    this.save();
  }

  getFlashcardRun(weekId: string, phase: 'before' | 'after') {
    return this.state.flashcardRuns[`${weekId}:${phase}`] ?? { ratedCards: {} };
  }

  rateFlashcard(weekId: string, phase: 'before' | 'after', cardId: string, knewIt: boolean) {
    const key = `${weekId}:${phase}`;
    const run = this.getFlashcardRun(weekId, phase);
    this.state.flashcardRuns[key] = {
      ...run,
      ratedCards: { ...run.ratedCards, [cardId]: knewIt },
    };
    this.save();
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }
}

export const gameManager = new StateManager();
