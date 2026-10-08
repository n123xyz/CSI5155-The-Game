export interface PlayerState {
  score: number;
  xp: number;
  streak: number;
  completedGames: Record<string, boolean>;
  quizScores: Record<string, { score: number; maxScore: number; date: string }>;
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
        return JSON.parse(data);
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

  subscribe(fn: () => void) {
    this.listeners.push(fn);
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }
}

export const gameManager = new StateManager();
