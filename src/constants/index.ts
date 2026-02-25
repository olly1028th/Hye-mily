import type {
  SpeciesConfig,
  GameAction,
  GameEvent,
  PetStats,
} from '../types';

// ============================================
// 게임 기본 상수
// ============================================

/** 게임 틱 간격 (ms) — 5초마다 스탯 감소 */
export const DEFAULT_TICK_INTERVAL = 5000;

/** 스탯 최솟값 */
export const STAT_MIN = 0;

/** 스탯 최댓값 */
export const STAT_MAX = 100;

/** 스탯이 이 값 이하로 떨어지면 위험 상태 */
export const STAT_DANGER_THRESHOLD = 20;

/** 건강이 0이 되면 게임오버 */
export const GAMEOVER_HEALTH = 0;

// ============================================
// 초기 스탯 (모든 종 공통)
// ============================================

export const INITIAL_STATS: PetStats = {
  hunger: 80,
  happiness: 80,
  energy: 100,
  cleanliness: 90,
  health: 100,
};

// ============================================
// 종별 설정
// ============================================

export const SPECIES_CONFIGS: Record<string, SpeciesConfig> = {
  cat: {
    species: 'cat',
    displayName: '고양이',
    description: '도도하지만 사랑스러운 고양이. 청결에 민감해요.',
    decayRates: {
      hunger: 1.0,
      happiness: 1.2,
      energy: 0.8,
      cleanliness: 1.5, // 청결 감소가 빠름
      health: 0.5,
    },
    expThresholds: [100, 300],
  },
  dog: {
    species: 'dog',
    displayName: '강아지',
    description: '충성스럽고 활발한 강아지. 놀아주지 않으면 슬퍼해요.',
    decayRates: {
      hunger: 1.3, // 배고픔 감소가 빠름
      happiness: 1.5, // 행복도 감소가 빠름
      energy: 1.2,
      cleanliness: 1.0,
      health: 0.5,
    },
    expThresholds: [100, 300],
  },
  lizard: {
    species: 'lizard',
    displayName: '도마뱀',
    description: '차분하고 독특한 도마뱀. 에너지 관리가 중요해요.',
    decayRates: {
      hunger: 0.8,
      happiness: 0.7,
      energy: 1.5, // 에너지 감소가 빠름
      cleanliness: 0.6,
      health: 0.8,
    },
    expThresholds: [120, 350],
  },
  hedgehog: {
    species: 'hedgehog',
    displayName: '고슴도치',
    description: '소심하지만 귀여운 고슴도치. 건강 관리에 신경 써야 해요.',
    decayRates: {
      hunger: 1.0,
      happiness: 1.0,
      energy: 1.0,
      cleanliness: 1.0,
      health: 1.2, // 건강 감소가 빠름
    },
    expThresholds: [110, 320],
  },
};

// ============================================
// 액션 정의
// ============================================

export const ACTIONS: Record<string, GameAction> = {
  feed: {
    type: 'feed',
    label: '밥 주기',
    icon: '🍖',
    effects: { hunger: 25, energy: 5, health: 5 },
    cooldown: 3000,
  },
  play: {
    type: 'play',
    label: '놀아주기',
    icon: '🎾',
    effects: { happiness: 20, energy: -15, hunger: -10 },
    cooldown: 5000,
  },
  clean: {
    type: 'clean',
    label: '씻기기',
    icon: '🛁',
    effects: { cleanliness: 30, happiness: -5 },
    cooldown: 8000,
  },
  sleep: {
    type: 'sleep',
    label: '재우기',
    icon: '💤',
    effects: { energy: 40, hunger: -10, health: 10 },
    cooldown: 10000,
  },
  heal: {
    type: 'heal',
    label: '치료하기',
    icon: '💊',
    effects: { health: 30, happiness: -10 },
    cooldown: 15000,
  },
};

// ============================================
// 랜덤 이벤트
// ============================================

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'find_treat',
    message: '간식을 발견했어요!',
    effects: { hunger: 10, happiness: 10 },
    probability: 0.1,
  },
  {
    id: 'rain',
    message: '비가 와서 젖었어요...',
    effects: { cleanliness: -15, happiness: -5 },
    probability: 0.05,
  },
  {
    id: 'sunny_day',
    message: '화창한 날이에요! 기분이 좋아졌어요.',
    effects: { happiness: 15, energy: 5 },
    probability: 0.08,
  },
  {
    id: 'cold',
    message: '감기에 걸렸어요...',
    effects: { health: -20, energy: -10 },
    probability: 0.03,
  },
  {
    id: 'cat_nap',
    message: '고양이가 아늑한 곳에서 낮잠을 잤어요.',
    effects: { energy: 20, happiness: 10 },
    probability: 0.07,
    speciesOnly: ['cat'],
  },
  {
    id: 'dog_fetch',
    message: '강아지가 공놀이를 하고 싶어해요!',
    effects: { happiness: 15, energy: -10 },
    probability: 0.08,
    speciesOnly: ['dog'],
  },
  {
    id: 'lizard_sunbathe',
    message: '도마뱀이 일광욕을 즐기고 있어요.',
    effects: { energy: 15, health: 5 },
    probability: 0.1,
    speciesOnly: ['lizard'],
  },
  {
    id: 'hedgehog_curl',
    message: '고슴도치가 동그랗게 말아 쉬고 있어요.',
    effects: { energy: 10, health: 5 },
    probability: 0.08,
    speciesOnly: ['hedgehog'],
  },
];

// ============================================
// 성장 단계별 경험치 보상
// ============================================

/** 액션 수행 시 획득하는 경험치 */
export const ACTION_EXP_REWARD: Record<string, number> = {
  feed: 5,
  play: 8,
  clean: 4,
  sleep: 3,
  heal: 2,
};

/** 성장 단계별 스프라이트 접미사 */
export const STAGE_LABELS: Record<string, string> = {
  baby: '아기',
  teen: '청소년',
  adult: '성인',
};
