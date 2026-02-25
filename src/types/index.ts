// ============================================
// 반려동물 타마고치 게임 - 핵심 타입 정의
// ============================================

/** 반려동물 종류 */
export type PetSpecies = 'cat' | 'dog' | 'lizard' | 'hedgehog';

/** 성장 단계: 아기 → 청소년 → 성인 */
export type GrowthStage = 'baby' | 'teen' | 'adult';

/** 반려동물 기분 상태 */
export type Mood = 'happy' | 'neutral' | 'sad' | 'angry' | 'sick';

/** 게임 화면 상태 */
export type GameView = 'start' | 'playing' | 'gameover';

// ============================================
// 상태(Stat) 관련 타입
// ============================================

/** 반려동물의 핵심 스탯 (0~100 범위) */
export interface PetStats {
  /** 배고픔: 0이면 굶주림, 100이면 배부름 */
  hunger: number;
  /** 행복도: 0이면 우울, 100이면 매우 행복 */
  happiness: number;
  /** 에너지: 0이면 기절, 100이면 활력 넘침 */
  energy: number;
  /** 청결도: 0이면 매우 더러움, 100이면 깨끗 */
  cleanliness: number;
  /** 건강: 0이면 위독, 100이면 매우 건강 */
  health: number;
}

// ============================================
// 반려동물 메인 상태
// ============================================

/** 반려동물 전체 상태 */
export interface Pet {
  /** 고유 ID */
  id: string;
  /** 사용자가 지어준 이름 */
  name: string;
  /** 종류 */
  species: PetSpecies;
  /** 현재 성장 단계 */
  stage: GrowthStage;
  /** 핵심 스탯 */
  stats: PetStats;
  /** 현재 기분 */
  mood: Mood;
  /** 나이 (게임 내 틱 단위) */
  age: number;
  /** 현재 성장 경험치 (다음 단계까지) */
  exp: number;
  /** 마지막 상호작용 시각 (timestamp) */
  lastInteraction: number;
  /** 태어난 시각 (timestamp) */
  bornAt: number;
  /** 살아있는지 여부 */
  isAlive: boolean;
}

// ============================================
// 액션 관련 타입
// ============================================

/** 플레이어가 수행 가능한 액션 */
export type ActionType = 'feed' | 'play' | 'clean' | 'sleep' | 'heal';

/** 액션 정의 */
export interface GameAction {
  type: ActionType;
  label: string;
  icon: string;
  /** 각 스탯에 미치는 영향 (양수=증가, 음수=감소) */
  effects: Partial<PetStats>;
  /** 쿨다운 (ms) */
  cooldown: number;
}

// ============================================
// 종별 특성 타입
// ============================================

/** 종별 고유 특성 */
export interface SpeciesConfig {
  species: PetSpecies;
  displayName: string;
  /** 스탯 감소 속도 배율 (1.0 = 기본) */
  decayRates: PetStats;
  /** 성장에 필요한 경험치 [baby→teen, teen→adult] */
  expThresholds: [number, number];
  /** 종별 특수 설명 */
  description: string;
}

// ============================================
// 게임 전체 상태
// ============================================

/** 게임 전체 상태 */
export interface GameState {
  /** 현재 화면 */
  view: GameView;
  /** 현재 키우는 반려동물 */
  pet: Pet | null;
  /** 게임 시작 시각 */
  startedAt: number | null;
  /** 게임 틱 간격 (ms) */
  tickInterval: number;
  /** 액션별 마지막 사용 시각 */
  cooldowns: Record<ActionType, number>;
  /** 일시정지 여부 */
  isPaused: boolean;
}

// ============================================
// 이벤트 타입
// ============================================

/** 게임 내 랜덤 이벤트 */
export interface GameEvent {
  id: string;
  message: string;
  effects: Partial<PetStats>;
  /** 발생 확률 (0~1) */
  probability: number;
  /** 특정 종에만 발생하는 이벤트인 경우 */
  speciesOnly?: PetSpecies[];
}
