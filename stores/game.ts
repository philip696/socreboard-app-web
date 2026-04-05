/**
 * Pinia Store for Game State Management
 * Manages scoreboard state, team info, timer, and real-time updates
 */

import { defineStore } from "pinia";

export interface Team {
  id: string;
  name: string;
  score: number;
  fouls: number;
  timeouts: number;
  picture?: string;
}

export interface GameState {
  teamA: Team;
  teamB: Team;
  quarter: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isTimeout: boolean;
  timeoutTimeRemaining: number; // in seconds
  eventId: string;
  fieldId: string;
}

export const useGameStore = defineStore("game", () => {
  // State
  const state = reactive<GameState>({
    teamA: {
      id: "team-a",
      name: "Terang",
      score: 0,
      fouls: 0,
      timeouts: 0,
    },
    teamB: {
      id: "team-b",
      name: "Gelap",
      score: 0,
      fouls: 0,
      timeouts: 0,
    },
    quarter: 1,
    timeRemaining: 600, // 10 minutes default
    isRunning: false,
    isTimeout: false,
    timeoutTimeRemaining: 0,
    eventId: "",
    fieldId: "",
  });

  // Timers
  let gameTimer: ReturnType<typeof setInterval> | null = null;
  let timeoutTimer: ReturnType<typeof setInterval> | null = null;

  // Getters
  const getTeamA = computed(() => state.teamA);
  const getTeamB = computed(() => state.teamB);
  const getQuarter = computed(() => state.quarter);
  const getTimeRemaining = computed(() => state.timeRemaining);
  const isGameRunning = computed(() => state.isRunning);
  const isTimeoutRunning = computed(() => state.isTimeout);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Setters
  const setTeamName = (team: "a" | "b", name: string) => {
    if (team === "a") {
      state.teamA.name = name;
    } else {
      state.teamB.name = name;
    }
  };

  const updateTeamScore = (team: "a" | "b", points: number) => {
    const target = team === "a" ? state.teamA : state.teamB;
    target.score = Math.max(0, target.score + points);
  };

  const setTeamScore = (team: "a" | "b", score: number) => {
    const target = team === "a" ? state.teamA : state.teamB;
    target.score = Math.max(0, score);
  };

  const updateTeamFouls = (team: "a" | "b", fouls: number) => {
    const target = team === "a" ? state.teamA : state.teamB;
    target.fouls = Math.max(0, fouls);
  };

  const updateTeamTimeouts = (team: "a" | "b", count: number) => {
    const target = team === "a" ? state.teamA : state.teamB;
    target.timeouts = Math.max(0, Math.min(3, count)); // Max 3 timeouts
  };

  const updateQuarter = (quarter: number) => {
    state.quarter = Math.max(1, quarter);
  };

  const incrementQuarter = () => {
    state.quarter++;
  };

  const decrementQuarter = () => {
    if (state.quarter > 1) {
      state.quarter--;
    }
  };

  // Timer Controls
  const startTimer = (initialSeconds: number = 600) => {
    stopTimer(); // Clear any existing timer
    state.timeRemaining = initialSeconds;
    state.isRunning = true;

    gameTimer = setInterval(() => {
      if (state.timeRemaining > 0) {
        state.timeRemaining--;
      } else {
        stopTimer();
        // Trigger end-of-quarter logic if needed
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
    state.isRunning = false;
  };

  const pauseTimer = () => {
    stopTimer();
  };

  const resumeTimer = () => {
    state.isRunning = true;
    gameTimer = setInterval(() => {
      if (state.timeRemaining > 0) {
        state.timeRemaining--;
      } else {
        stopTimer();
      }
    }, 1000);
  };

  const setTimeRemaining = (seconds: number) => {
    state.timeRemaining = Math.max(0, seconds);
  };

  // Timeout Controls
  const startTimeout = (team: "a" | "b", durationSeconds: number = 60) => {
    stopTimeout();
    state.isTimeout = true;
    state.timeoutTimeRemaining = durationSeconds;

    timeoutTimer = setInterval(() => {
      if (state.timeoutTimeRemaining > 0) {
        state.timeoutTimeRemaining--;
      } else {
        stopTimeout();
      }
    }, 1000);
  };

  const stopTimeout = () => {
    if (timeoutTimer) {
      clearInterval(timeoutTimer);
      timeoutTimer = null;
    }
    state.isTimeout = false;
    state.timeoutTimeRemaining = 0;
  };

  // Reset game
  const resetGame = () => {
    stopTimer();
    stopTimeout();
    state.quarter = 1;
    state.timeRemaining = 600;
    state.teamA.score = 0;
    state.teamA.fouls = 0;
    state.teamA.timeouts = 0;
    state.teamB.score = 0;
    state.teamB.fouls = 0;
    state.teamB.timeouts = 0;
  };

  // Configuration
  const setEventField = (eventId: string, fieldId: string) => {
    state.eventId = eventId;
    state.fieldId = fieldId;
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer();
    stopTimeout();
  });

  return {
    // State
    state: readonly(state),

    // Getters
    getTeamA,
    getTeamB,
    getQuarter,
    getTimeRemaining,
    isGameRunning,
    isTimeoutRunning,
    formatTime,

    // Team setters
    setTeamName,
    updateTeamScore,
    setTeamScore,
    updateTeamFouls,
    updateTeamTimeouts,

    // Quarter controls
    updateQuarter,
    incrementQuarter,
    decrementQuarter,

    // Timer controls
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    setTimeRemaining,

    // Timeout controls
    startTimeout,
    stopTimeout,

    // Configuration
    resetGame,
    setEventField,
  };
});
