// ============================================
// 반려동물 타마고치 게임 - 핵심 타입 정의
// ============================================

/** 반려동물 종류 (대분류) */
export type PetSpecies = 'cat' | 'dog' | 'lizard' | 'hedgehog';

/** 하위 품종 ID */
export type BreedId =
  // 고양이
  | 'korean_shorthair' | 'persian' | 'siamese' | 'russian_blue'
  // 강아지
  | 'jindo' | 'golden_retriever' | 'pomeranian' | 'shiba_inu'
  // 도마뱀
  | 'leopard_gecko' | 'bearded_dragon' | 'crested_gecko' | 'chameleon'
  // 고슴도치
  | 'four_toed' | 'algerian' | 'egyptian_eared' | 'daurian';

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

/** PetStats의 키 타입 */
export type StatKey = keyof PetStats;

// ============================================
// 반려동물 메인 상태
// ============================================

/** 반려동물 전체 상태 */
export interface Pet {
  /** 고유 ID */
  id: string;
  /** 사용자가 지어준 이름 */
  name: string;
  /** 대분류 종류 */
  species: PetSpecies;
  /** 하위 품종 */
  breed: BreedId;
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
  /** 총 누적 경험치 (통계용) */
  totalExp: number;
  /** 마지막 상호작용 시각 (timestamp) */
  lastInteraction: number;
  /** 마지막 틱 처리 시각 (오프라인 계산용, timestamp) */
  lastTickAt: number;
  /** 태어난 시각 (timestamp) */
  bornAt: number;
  /** 보유 코인 (미니게임 & 액션으로 획득) */
  coins: number;
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

/** 성장 단계별 배율 */
export interface StageMultipliers {
  /** 스탯 감소 속도 배율 (baby는 빠름, adult는 안정) */
  decayRate: number;
  /** 액션 효과 배율 */
  actionEfficiency: number;
  /** 경험치 획득 배율 */
  expRate: number;
}

/** 진화 조건 */
export interface EvolutionRequirement {
  /** 필요 경험치 */
  exp: number;
  /** 진화 시 모든 스탯이 이 값 이상이어야 함 */
  minStats?: Partial<PetStats>;
  /** 진화 시 최소 나이(틱) */
  minAge?: number;
}

/** 종별 액션 보너스 */
export interface ActionBonus {
  bonusStat: StatKey;
  bonusAmount: number;
}

/** 종별 고유 특성 (확장) */
export interface SpeciesConfig {
  species: PetSpecies;
  displayName: string;
  description: string;
  /** 종별 초기 스탯 */
  initialStats: PetStats;
  /** 스탯 감소 기본 속도 (틱당) */
  decayRates: PetStats;
  /** 성장 단계별 배율 */
  stageMultipliers: Record<GrowthStage, StageMultipliers>;
  /** 진화 조건 [baby→teen, teen→adult] */
  evolution: [EvolutionRequirement, EvolutionRequirement];
  /** 좋아하는 액션 — 보너스 효과 */
  favoriteAction: ActionType;
  /** 싫어하는 액션 — happiness 추가 감소 */
  dislikedAction: ActionType;
  /** 종별 고유 액션 보너스 */
  actionBonuses: Partial<Record<ActionType, ActionBonus>>;
  /** 취약 스탯 — 위험 시 건강 감소 가중 */
  vulnerableStat: StatKey;
  /** 취약 스탯 건강 감소 추가량 */
  vulnerabilityPenalty: number;
  /** 오버케어 임계값 (이 이상이면 효과 반감) */
  overcareThreshold: number;
}

// ============================================
// 하위 품종 특성 타입
// ============================================

/** 품종별 스탯 보정 (종 기본값에 더해짐) */
export interface BreedConfig {
  breedId: BreedId;
  species: PetSpecies;
  displayName: string;
  description: string;
  emoji: string;
  /** 종 기본 초기스탯에 더해지는 보정치 */
  statModifiers: Partial<PetStats>;
  /** 종 기본 decayRates에 곱해지는 배율 (1.0 = 변화없음) */
  decayModifiers: Partial<PetStats>;
  /** 난이도 라벨 */
  difficulty: 'easy' | 'normal' | 'hard';
}

// ============================================
// 게임 전체 상태
// ============================================

/** 이벤트 로그 항목 */
export interface EventLogEntry {
  message: string;
  timestamp: number;
}

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
  /** 이벤트 로그 (최근 N개) */
  eventLog: EventLogEntry[];
}

// ============================================
// 상점 아이템 타입
// ============================================

/** 상점에서 구매 가능한 아이템 */
export interface ShopItemDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  /** 아이템 사용 시 스탯 효과 */
  effects: Partial<PetStats>;
  /** 카테고리 */
  category: 'snack' | 'toy' | 'care';
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
  /** 특정 성장 단계에만 발생 */
  stageOnly?: GrowthStage[];
}

// ============================================
// 세이브 데이터 타입
// ============================================

/** localStorage에 저장되는 세이브 데이터 */
export interface SaveData {
  version: number;
  pet: Pet;
  startedAt: number;
  savedAt: number;
}

// ============================================
// 도감 타입
// ============================================

/** 도감에 기록되는 개별 펫 기록 */
export interface PetRecord {
  name: string;
  species: PetSpecies;
  breed: BreedId;
  maxAge: number;
  maxStage: GrowthStage;
  bornAt: number;
  diedAt: number | null;
}

// ============================================
// 업적 타입
// ============================================

/** 업적 정의 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/** 유저 전체 진행 데이터 (도감 + 업적) */
export interface UserProgress {
  petRecords: PetRecord[];
  unlockedAchievements: string[];
  totalPetsRaised: number;
  totalActionsPerformed: number;
  totalEvolutions: number;
  totalMiniGamesPlayed: number;
}
