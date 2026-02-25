import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { GameState, Pet, ActionType, PetSpecies, BreedId, EventLogEntry } from '../types';
import { DEFAULT_TICK_INTERVAL, MAX_EVENT_LOG, MAX_OFFLINE_TICKS } from '../constants';
import { createPet, performAction, processOfflineTicks } from '../utils/gameLogic';
import { saveGame, loadGame, deleteSave } from '../utils/saveLoad';

// ============================================
// 액션 정의
// ============================================

type GameActionPayload =
  | { type: 'START_GAME'; name: string; species: PetSpecies; breed: BreedId }
  | { type: 'PERFORM_ACTION'; actionType: ActionType }
  | { type: 'TICK'; pet: Pet }
  | { type: 'SET_PET'; pet: Pet }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' }
  | { type: 'SET_COOLDOWN'; actionType: ActionType; time: number }
  | { type: 'LOAD_SAVE'; pet: Pet; startedAt: number }
  | { type: 'ADD_EVENT'; message: string };

// ============================================
// 초기 상태
// ============================================

const initialState: GameState = {
  view: 'start',
  pet: null,
  startedAt: null,
  tickInterval: DEFAULT_TICK_INTERVAL,
  cooldowns: { feed: 0, play: 0, clean: 0, sleep: 0, heal: 0 },
  isPaused: false,
  eventLog: [],
};

// ============================================
// 리듀서
// ============================================

function gameReducer(state: GameState, action: GameActionPayload): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const pet = createPet(action.name, action.species, action.breed);
      return {
        ...state,
        view: 'playing',
        pet,
        startedAt: Date.now(),
        cooldowns: { feed: 0, play: 0, clean: 0, sleep: 0, heal: 0 },
        eventLog: [],
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
      deleteSave();
      return { ...initialState };
    }
    case 'SET_COOLDOWN': {
      return {
        ...state,
        cooldowns: { ...state.cooldowns, [action.actionType]: action.time },
      };
    }
    case 'LOAD_SAVE': {
      return {
        ...state,
        view: action.pet.isAlive ? 'playing' : 'gameover',
        pet: action.pet,
        startedAt: action.startedAt,
        eventLog: [],
      };
    }
    case 'ADD_EVENT': {
      const entry: EventLogEntry = { message: action.message, timestamp: Date.now() };
      const log = [entry, ...state.eventLog].slice(0, MAX_EVENT_LOG);
      return { ...state, eventLog: log };
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

  // 앱 시작 시 세이브 데이터 복원 + 오프라인 틱 처리
  useEffect(() => {
    const save = loadGame();
    if (!save) return;

    let pet = save.pet;

    // 오프라인 동안 경과한 시간 계산
    if (pet.isAlive) {
      const result = processOfflineTicks(
        pet,
        DEFAULT_TICK_INTERVAL,
        MAX_OFFLINE_TICKS
      );
      pet = result.pet;

      if (result.ticksProcessed > 0) {
        dispatch({
          type: 'ADD_EVENT',
          message: `자리를 비운 사이 ${result.ticksProcessed}틱이 경과했어요.`,
        });
      }
    }

    dispatch({ type: 'LOAD_SAVE', pet, startedAt: save.startedAt });
  }, []);

  // 상태가 바뀔 때마다 자동 저장
  useEffect(() => {
    if (state.pet && state.startedAt) {
      saveGame(state.pet, state.startedAt);
    }
  }, [state.pet, state.startedAt]);

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
