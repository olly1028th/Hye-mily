import type {
  SpeciesConfig,
  BreedConfig,
  GameAction,
  GameEvent,
} from '../types';

// ============================================
// 게임 기본 상수
// ============================================

/** 게임 틱 간격 (ms) — 5초마다 스탯 변화 */
export const DEFAULT_TICK_INTERVAL = 5000;

/** 스탯 최솟값 */
export const STAT_MIN = 0;
/** 스탯 최댓값 */
export const STAT_MAX = 100;
/** 위험 수준 임계값 */
export const STAT_DANGER_THRESHOLD = 20;
/** 건강이 0이 되면 게임오버 */
export const GAMEOVER_HEALTH = 0;
/** 오버케어 시 효과 감소 배율 */
export const OVERCARE_PENALTY_RATE = 0.3;
/** 싫어하는 액션 happiness 추가 감소량 */
export const DISLIKE_HAPPINESS_PENALTY = -8;
/** 이벤트 로그 최대 보관 수 */
export const MAX_EVENT_LOG = 20;
/** 오프라인 최대 계산 틱 수 (과도한 계산 방지) */
export const MAX_OFFLINE_TICKS = 360;
/** 세이브 데이터 버전 */
export const SAVE_VERSION = 1;
/** localStorage 키 */
export const SAVE_KEY = 'hyemily_save';

// ============================================
// 종별 상세 설정 — 4종 고유 특성
// ============================================
//
//  설계 원칙
//  ─────────────────────────────────────────
//  1) 초기 스탯: 종마다 장단점이 뚜렷하게
//  2) decayRates: 틱당 기본 감소량 (stageMultiplier와 곱해짐)
//  3) stageMultipliers: 아기는 감소 빠르고 액션 효율↑,
//     성인은 감소 느리지만 액션 효율↓ → 초중반 케어가 중요
//  4) evolution: EXP + 최소 스탯 조건으로 진화 난이도 조절
//  5) favoriteAction / dislikedAction: 종별 플레이 스타일 차별화
//  6) vulnerableStat: 이 스탯이 위험 수준이면 건강 추가 감소
//  7) overcareThreshold: 이미 높은 스탯에 액션 → 효과 반감
//

export const SPECIES_CONFIGS: Record<string, SpeciesConfig> = {

  // ──────────────────────────────────────
  // 🐱 고양이 — 도도한 청결 마니아
  // ──────────────────────────────────────
  cat: {
    species: 'cat',
    displayName: '고양이',
    description: '도도하지만 사랑스러운 고양이. 청결에 매우 민감하고, 혼자만의 시간을 좋아해요.',

    initialStats: {
      hunger: 75,      // 소식가
      happiness: 85,    // 도도해서 기본 만족도 높음
      energy: 70,       // 낮잠을 좋아하지만 순발력 있음
      cleanliness: 95,  // ★ 천성적으로 깔끔
      health: 90,
    },

    decayRates: {
      hunger: 0.9,
      happiness: 1.1,
      energy: 0.7,
      cleanliness: 1.6,   // ★ 청결 감소 매우 빠름 → 자주 씻겨야
      health: 0.4,
    },

    stageMultipliers: {
      baby:  { decayRate: 1.3, actionEfficiency: 1.2, expRate: 1.0 },
      teen:  { decayRate: 1.0, actionEfficiency: 1.0, expRate: 1.1 },
      adult: { decayRate: 0.8, actionEfficiency: 0.85, expRate: 0.9 },
    },

    evolution: [
      { exp: 100, minStats: { cleanliness: 40 }, minAge: 30 },
      { exp: 280, minStats: { cleanliness: 50, happiness: 40 }, minAge: 120 },
    ],

    favoriteAction: 'clean',     // 씻기기 → 보너스
    dislikedAction: 'play',      // 놀아주기 → 피곤해함

    actionBonuses: {
      clean: { bonusStat: 'happiness', bonusAmount: 8 },  // 씻으면 기분까지 좋아짐
      sleep: { bonusStat: 'health', bonusAmount: 5 },      // 잠 잘 때 건강 회복
    },

    vulnerableStat: 'cleanliness',
    vulnerabilityPenalty: 3,
    overcareThreshold: 90,
  },

  // ──────────────────────────────────────
  // 🐶 강아지 — 활발한 관심쟁이
  // ──────────────────────────────────────
  dog: {
    species: 'dog',
    displayName: '강아지',
    description: '충성스럽고 활발한 강아지. 함께 놀아주지 않으면 금방 슬퍼하고, 밥도 잘 먹어요.',

    initialStats: {
      hunger: 70,       // ★ 식욕 왕성 → 금방 배고파짐
      happiness: 90,     // 주인만 보면 행복
      energy: 95,        // ★ 에너지 넘침
      cleanliness: 75,   // 밖에서 놀아서 약간 지저분
      health: 95,
    },

    decayRates: {
      hunger: 1.4,       // ★ 배고픔 감소 가장 빠름
      happiness: 1.6,    // ★ 외로우면 급속 하락
      energy: 1.1,
      cleanliness: 1.0,
      health: 0.4,
    },

    stageMultipliers: {
      baby:  { decayRate: 1.4, actionEfficiency: 1.3, expRate: 1.0 },
      teen:  { decayRate: 1.1, actionEfficiency: 1.0, expRate: 1.2 },  // 청소년기 학습력 ↑
      adult: { decayRate: 0.85, actionEfficiency: 0.9, expRate: 0.85 },
    },

    evolution: [
      { exp: 90, minStats: { happiness: 45 }, minAge: 25 },
      { exp: 260, minStats: { happiness: 50, hunger: 40 }, minAge: 100 },
    ],

    favoriteAction: 'play',      // 놀아주기 → 보너스
    dislikedAction: 'clean',     // 목욕 싫어!

    actionBonuses: {
      play: { bonusStat: 'health', bonusAmount: 5 },   // 운동 효과
      feed: { bonusStat: 'happiness', bonusAmount: 6 }, // 밥 먹으면 꼬리 흔듬
    },

    vulnerableStat: 'happiness',
    vulnerabilityPenalty: 4,     // 외로우면 건강까지 급격히 악화
    overcareThreshold: 85,
  },

  // ──────────────────────────────────────
  // 🦎 도마뱀 — 느긋한 에너지 관리자
  // ──────────────────────────────────────
  lizard: {
    species: 'lizard',
    displayName: '도마뱀',
    description: '차분하고 독특한 도마뱀. 체온 유지를 위한 에너지 관리가 핵심이에요.',

    initialStats: {
      hunger: 85,       // 적게 먹어도 버팀
      happiness: 65,     // 감정 표현이 적음
      energy: 60,        // ★ 기본 에너지 낮음 (변온동물)
      cleanliness: 80,   // 깔끔한 편
      health: 85,
    },

    decayRates: {
      hunger: 0.7,       // 신진대사 느림 → 배고픔 천천히 감소
      happiness: 0.6,    // 감정 변화 적음
      energy: 1.5,       // ★ 에너지 감소 가장 빠름 (체온 유지 비용)
      cleanliness: 0.5,
      health: 0.7,
    },

    stageMultipliers: {
      baby:  { decayRate: 1.2, actionEfficiency: 1.1, expRate: 0.9 },  // 느린 성장
      teen:  { decayRate: 1.0, actionEfficiency: 1.0, expRate: 1.0 },
      adult: { decayRate: 0.75, actionEfficiency: 0.9, expRate: 0.8 },
    },

    evolution: [
      { exp: 120, minStats: { energy: 35 }, minAge: 40 },             // 느린 성장
      { exp: 350, minStats: { energy: 40, health: 45 }, minAge: 150 },
    ],

    favoriteAction: 'sleep',     // 일광욕 = 잠자기 → 보너스
    dislikedAction: 'play',      // 활동적인 놀이 싫어함

    actionBonuses: {
      sleep: { bonusStat: 'health', bonusAmount: 8 },    // 잘 자면 건강 크게 회복
      feed:  { bonusStat: 'energy', bonusAmount: 5 },     // 먹으면 에너지 추가 보충
    },

    vulnerableStat: 'energy',
    vulnerabilityPenalty: 4,      // 에너지 부족 → 체온 유지 실패 → 건강 급락
    overcareThreshold: 85,
  },

  // ──────────────────────────────────────
  // 🦔 고슴도치 — 소심한 건강 관리 대상
  // ──────────────────────────────────────
  hedgehog: {
    species: 'hedgehog',
    displayName: '고슴도치',
    description: '소심하지만 귀여운 고슴도치. 스트레스에 약하고 건강 관리가 가장 중요해요.',

    initialStats: {
      hunger: 80,
      happiness: 70,     // 소심해서 기본 행복도 낮음
      energy: 80,
      cleanliness: 85,
      health: 75,        // ★ 기본 건강 낮음
    },

    decayRates: {
      hunger: 1.0,
      happiness: 1.1,
      energy: 0.9,
      cleanliness: 0.9,
      health: 1.3,       // ★ 건강 감소 가장 빠름
    },

    stageMultipliers: {
      baby:  { decayRate: 1.3, actionEfficiency: 1.2, expRate: 1.0 },
      teen:  { decayRate: 1.0, actionEfficiency: 1.1, expRate: 1.15 }, // 청소년기 성장↑
      adult: { decayRate: 0.8, actionEfficiency: 0.9, expRate: 0.85 },
    },

    evolution: [
      { exp: 110, minStats: { health: 40 }, minAge: 35 },
      { exp: 320, minStats: { health: 50, happiness: 40 }, minAge: 130 },
    ],

    favoriteAction: 'heal',      // 치료 → 보너스
    dislikedAction: 'clean',     // 물 싫어! 스트레스

    actionBonuses: {
      heal: { bonusStat: 'happiness', bonusAmount: 5 },  // 치료받으면 안심
      feed: { bonusStat: 'health', bonusAmount: 4 },      // 영양 섭취 → 건강 보조
    },

    vulnerableStat: 'health',
    vulnerabilityPenalty: 5,      // 건강 위험 시 가장 큰 페널티
    overcareThreshold: 88,
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
    effects: { hunger: 25, energy: 5, health: 3 },
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
    effects: { energy: 40, hunger: -10, health: 8 },
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
// 경험치 보상
// ============================================

/** 액션 수행 시 기본 경험치 (stageMultipliers.expRate와 곱해짐) */
export const ACTION_EXP_REWARD: Record<string, number> = {
  feed: 5,
  play: 8,
  clean: 4,
  sleep: 3,
  heal: 2,
};

// ============================================
// 랜덤 이벤트
// ============================================

export const RANDOM_EVENTS: GameEvent[] = [
  // --- 공통 이벤트 ---
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
    id: 'good_sleep',
    message: '포근하게 잠들었어요!',
    effects: { energy: 15, health: 5 },
    probability: 0.06,
    stageOnly: ['baby'],
  },

  // --- 고양이 전용 ---
  {
    id: 'cat_nap',
    message: '아늑한 곳에서 낮잠을 잤어요. 😺',
    effects: { energy: 20, happiness: 10 },
    probability: 0.08,
    speciesOnly: ['cat'],
  },
  {
    id: 'cat_grooming',
    message: '고양이가 스스로 그루밍했어요!',
    effects: { cleanliness: 12 },
    probability: 0.1,
    speciesOnly: ['cat'],
  },
  {
    id: 'cat_hairball',
    message: '헤어볼을 토했어요... 🤢',
    effects: { cleanliness: -10, health: -5 },
    probability: 0.04,
    speciesOnly: ['cat'],
    stageOnly: ['teen', 'adult'],
  },

  // --- 강아지 전용 ---
  {
    id: 'dog_fetch',
    message: '공놀이를 하고 싶어해요! 🎾',
    effects: { happiness: 15, energy: -10 },
    probability: 0.09,
    speciesOnly: ['dog'],
  },
  {
    id: 'dog_tail_wag',
    message: '꼬리를 흔들며 반겨줘요!',
    effects: { happiness: 10 },
    probability: 0.12,
    speciesOnly: ['dog'],
  },
  {
    id: 'dog_mud',
    message: '진흙에서 뒹굴었어요! 🐾',
    effects: { happiness: 10, cleanliness: -20 },
    probability: 0.05,
    speciesOnly: ['dog'],
  },

  // --- 도마뱀 전용 ---
  {
    id: 'lizard_sunbathe',
    message: '일광욕을 즐기고 있어요. ☀️',
    effects: { energy: 18, health: 5 },
    probability: 0.1,
    speciesOnly: ['lizard'],
  },
  {
    id: 'lizard_shed',
    message: '허물을 벗었어요! 성장의 증거!',
    effects: { cleanliness: -8, health: 8 },
    probability: 0.04,
    speciesOnly: ['lizard'],
    stageOnly: ['baby', 'teen'],
  },
  {
    id: 'lizard_cold_snap',
    message: '갑자기 추워져서 움직이지 못해요... 🥶',
    effects: { energy: -20, health: -8 },
    probability: 0.03,
    speciesOnly: ['lizard'],
  },

  // --- 고슴도치 전용 ---
  {
    id: 'hedgehog_curl',
    message: '동그랗게 말아 쉬고 있어요. 🦔',
    effects: { energy: 10, health: 5 },
    probability: 0.09,
    speciesOnly: ['hedgehog'],
  },
  {
    id: 'hedgehog_explore',
    message: '용기를 내서 탐험했어요!',
    effects: { happiness: 15, energy: -8 },
    probability: 0.06,
    speciesOnly: ['hedgehog'],
    stageOnly: ['teen', 'adult'],
  },
  {
    id: 'hedgehog_stress',
    message: '큰 소리에 놀라서 스트레스를 받았어요...',
    effects: { happiness: -12, health: -8 },
    probability: 0.04,
    speciesOnly: ['hedgehog'],
  },
];

// ============================================
// UI 라벨
// ============================================

export const STAGE_LABELS: Record<string, string> = {
  baby: '아기',
  teen: '청소년',
  adult: '성인',
};

// ============================================
// 하위 품종 설정 — 종당 4품종, 총 16종
// ============================================
//
//  설계 원칙
//  ─────────────────────────────────────────
//  · statModifiers: 종 기본 initialStats에 더해짐 (양수/음수)
//  · decayModifiers: 종 기본 decayRates에 곱해짐 (1.0=동일)
//    → 품종 차이는 ±5~15 범위의 미세 조정으로,
//      대분류(종)의 큰 특성은 유지하면서 플레이 느낌을 차별화
//

export const BREED_CONFIGS: Record<string, BreedConfig> = {

  // ──────────────────────────────────────
  //  🐱 고양이 품종
  // ──────────────────────────────────────

  korean_shorthair: {
    breedId: 'korean_shorthair',
    species: 'cat',
    displayName: '코리안 숏헤어',
    description: '한국 토종 고양이. 영리하고 적응력이 뛰어나 초보자에게 딱이에요.',
    emoji: '🐱',
    statModifiers: { health: 10, energy: 5 },
    decayModifiers: {},
    difficulty: 'easy',
  },

  persian: {
    breedId: 'persian',
    species: 'cat',
    displayName: '페르시안',
    description: '풍성한 장모가 매력적인 페르시안. 털 관리를 안 하면 금방 엉켜요.',
    emoji: '😺',
    statModifiers: { happiness: 5, cleanliness: -10 },
    decayModifiers: { cleanliness: 1.3 },  // 털 때문에 청결 감소 빠름
    difficulty: 'hard',
  },

  siamese: {
    breedId: 'siamese',
    species: 'cat',
    displayName: '샴',
    description: '수다쟁이 샴 고양이. 사교적이라 외로움을 잘 타요.',
    emoji: '😼',
    statModifiers: { happiness: -10, energy: 10 },
    decayModifiers: { happiness: 1.3 },  // 외로움 타서 행복도 빨리 감소
    difficulty: 'normal',
  },

  russian_blue: {
    breedId: 'russian_blue',
    species: 'cat',
    displayName: '러시안 블루',
    description: '은빛 털이 우아한 러시안 블루. 조용하고 건강한 편이에요.',
    emoji: '🐈',
    statModifiers: { health: 5, happiness: 5, hunger: -5 },
    decayModifiers: { health: 0.8 },  // 건강 감소 느림
    difficulty: 'normal',
  },

  // ──────────────────────────────────────
  //  🐶 강아지 품종
  // ──────────────────────────────────────

  jindo: {
    breedId: 'jindo',
    species: 'dog',
    displayName: '진돗개',
    description: '충성심 최강 한국 대표견. 체력이 좋지만 고집이 세서 씻기기가 힘들어요.',
    emoji: '🐕',
    statModifiers: { health: 10, energy: 5, cleanliness: -5 },
    decayModifiers: { happiness: 0.85, cleanliness: 1.2 },  // 충성심↑ 행복감소↓, 청결감소↑
    difficulty: 'normal',
  },

  golden_retriever: {
    breedId: 'golden_retriever',
    species: 'dog',
    displayName: '골든 리트리버',
    description: '모두의 친구! 밥을 엄청 좋아하고 놀아줄수록 신나요.',
    emoji: '🦮',
    statModifiers: { happiness: 5, hunger: -10 },
    decayModifiers: { hunger: 1.2 },  // 식욕 왕성
    difficulty: 'easy',
  },

  pomeranian: {
    breedId: 'pomeranian',
    species: 'dog',
    displayName: '포메라니안',
    description: '작지만 에너지 넘치는 솜뭉치. 털 관리에 신경 써야 해요.',
    emoji: '🐶',
    statModifiers: { energy: 10, cleanliness: -10 },
    decayModifiers: { energy: 1.2, cleanliness: 1.3 },
    difficulty: 'hard',
  },

  shiba_inu: {
    breedId: 'shiba_inu',
    species: 'dog',
    displayName: '시바 이누',
    description: '독립적이고 고집 센 시바견. 마이페이스라 행복도 관리가 쉬운 편이에요.',
    emoji: '🐕‍🦺',
    statModifiers: { happiness: 10, hunger: 5 },
    decayModifiers: { happiness: 0.8 },  // 도도해서 행복 감소 느림
    difficulty: 'easy',
  },

  // ──────────────────────────────────────
  //  🦎 도마뱀 품종
  // ──────────────────────────────────────

  leopard_gecko: {
    breedId: 'leopard_gecko',
    species: 'lizard',
    displayName: '레오파드 게코',
    description: '입문자용 도마뱀의 대명사. 온순하고 키우기 쉬워요.',
    emoji: '🦎',
    statModifiers: { energy: 10, health: 5 },
    decayModifiers: { energy: 0.85 },  // 에너지 감소 느림
    difficulty: 'easy',
  },

  bearded_dragon: {
    breedId: 'bearded_dragon',
    species: 'lizard',
    displayName: '비어디 드래곤',
    description: '파충류치고 사교적! 밥을 잘 먹지만 에너지를 많이 써요.',
    emoji: '🐉',
    statModifiers: { happiness: 10, hunger: -5 },
    decayModifiers: { hunger: 1.2, energy: 1.1 },
    difficulty: 'normal',
  },

  crested_gecko: {
    breedId: 'crested_gecko',
    species: 'lizard',
    displayName: '크레스티드 게코',
    description: '속눈썹이 매력적인 나무 도마뱀. 야행성이라 에너지 패턴이 독특해요.',
    emoji: '🌿',
    statModifiers: { energy: -5, cleanliness: 5 },
    decayModifiers: { energy: 1.15 },
    difficulty: 'normal',
  },

  chameleon: {
    breedId: 'chameleon',
    species: 'lizard',
    displayName: '카멜레온',
    description: '색이 변하는 신비한 도마뱀. 환경에 예민해서 관리가 까다로워요.',
    emoji: '🌈',
    statModifiers: { health: -10, happiness: -5, energy: -5 },
    decayModifiers: { health: 1.2, energy: 1.2 },
    difficulty: 'hard',
  },

  // ──────────────────────────────────────
  //  🦔 고슴도치 품종
  // ──────────────────────────────────────

  four_toed: {
    breedId: 'four_toed',
    species: 'hedgehog',
    displayName: '네발가락 고슴도치',
    description: '가장 대중적인 애완 고슴도치. 균형 잡힌 성격으로 입문용이에요.',
    emoji: '🦔',
    statModifiers: { health: 5, happiness: 5 },
    decayModifiers: {},
    difficulty: 'easy',
  },

  algerian: {
    breedId: 'algerian',
    species: 'hedgehog',
    displayName: '알제리안 고슴도치',
    description: '덩치가 좀 더 크고 활발해요. 밥을 많이 먹고 에너지도 넘쳐요.',
    emoji: '🦔',
    statModifiers: { energy: 10, hunger: -10 },
    decayModifiers: { hunger: 1.2, energy: 0.9 },
    difficulty: 'normal',
  },

  egyptian_eared: {
    breedId: 'egyptian_eared',
    species: 'hedgehog',
    displayName: '이집트 귀큰 고슴도치',
    description: '큰 귀가 매력적! 호기심 많지만 스트레스에 극도로 민감해요.',
    emoji: '👂',
    statModifiers: { happiness: -10, health: -5 },
    decayModifiers: { happiness: 1.3, health: 1.15 },
    difficulty: 'hard',
  },

  daurian: {
    breedId: 'daurian',
    species: 'hedgehog',
    displayName: '다우리안 고슴도치',
    description: '추위에 강한 북방 종. 건강하지만 겨울잠을 좋아해서 에너지가 낮아요.',
    emoji: '❄️',
    statModifiers: { health: 10, energy: -10 },
    decayModifiers: { health: 0.85, energy: 1.15 },
    difficulty: 'normal',
  },
};

/** 특정 종에 속하는 품종 목록 가져오기 */
export function getBreedsBySpecies(species: string): BreedConfig[] {
  return Object.values(BREED_CONFIGS).filter((b) => b.species === species);
}
