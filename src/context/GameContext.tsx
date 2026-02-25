import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { GameState, Pet, ActionType, PetSpecies } from '../types';
import { DEFAULT_TICK_INTERVAL } from '../constants';
import { createPet, performAction } from '../utils/gameLogic';

// ============================================
// 액션 정의
// ============================================

type GameActionPayload =
  | { type: 'START_GAME'; name: string; species: PetSpecies }
  | { type: 'PERFORM_ACTION'; actionType: ActionType }
  | { type: 'TICK'; pet: Pet }
  | { type: 'SET_PET'; pet: Pet }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' }
  | { type: 'SET_COOLDOWN'; actionType: ActionType; time: number };

// ============================================
// 초기 상태
// ============================================

const initialState: GameState = {
  view: 'start',
  pet: null,
  startedAt: null,
  tickInterval: DEFAULT_TICK_INTERVAL,
  cooldowns: {
    feed: 0,
    play: 0,
    clean: 0,
    sleep: 0,
    heal: 0,
  },
  isPaused: false,
};

// ============================================
// 리듀서
// ============================================

function gameReducer(state: GameState, action: GameActionPayload): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const pet = createPet(action.name, action.species);
      return {
        ...state,
        view: 'playing',
        pet,
        startedAt: Date.now(),
        cooldowns: { feed: 0, play: 0, clean: 0, sleep: 0, heal: 0 },
      };
    }
    case 'PERFORM_ACTION': {
      if (!state.pet) return state;
      const updatedPet = performAction(state.pet, action.actionType);
      return {
        ...state,
        pet: updatedPet,
        view: updatedPet.isAlive ? 'playing' : 'gameover',
      };
    }
    case 'TICK': {
      return {
        ...state,
        pet: action.pet,
        view: action.pet.isAlive ? state.view : 'gameover',
      };
    }
    case 'SET_PET': {
      return { ...state, pet: action.pet };
    }
    case 'TOGGLE_PAUSE': {
      return { ...state, isPaused: !state.isPaused };
    }
    case 'GAME_OVER': {
      return { ...state, view: 'gameover' };
    }
    case 'RESET': {
      return { ...initialState };
    }
    case 'SET_COOLDOWN': {
      return {
        ...state,
        cooldowns: {
          ...state.cooldowns,
          [action.actionType]: action.time,
        },
      };
    }
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameActionPayload>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
}
