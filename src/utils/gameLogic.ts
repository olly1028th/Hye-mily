import type {
  Pet,
  PetSpecies,
  PetStats,
  GrowthStage,
  Mood,
  ActionType,
  GameEvent,
  StatKey,
  BreedId,
} from '../types';
import {
  SPECIES_CONFIGS,
  BREED_CONFIGS,
  ACTIONS,
  STAT_MIN,
  STAT_MAX,
  STAT_DANGER_THRESHOLD,
  RANDOM_EVENTS,
  ACTION_EXP_REWARD,
  OVERCARE_PENALTY_RATE,
  DISLIKE_HAPPINESS_PENALTY,
} from '../constants';

// ============================================
// 스탯 유틸리티
// ============================================

/** 스탯 값을 0~100 범위로 클램핑 */
export function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}

/** 부분 스탯 변화를 현재 스탯에 적용 */
export function applyEffects(
  current: PetStats,
  effects: Partial<PetStats>
): PetStats {
  return {
    hunger: clampStat(current.hunger + (effects.hunger ?? 0)),
    happiness: clampStat(current.happiness + (effects.happiness ?? 0)),
    energy: clampStat(current.energy + (effects.energy ?? 0)),
    cleanliness: clampStat(current.cleanliness + (effects.cleanliness ?? 0)),
    health: clampStat(current.health + (effects.health ?? 0)),
  };
}

// ============================================
// 펫 생성 — 종 기본 + 품종 보정 적용
// ============================================

/** 종 기본 스탯에 품종 보정치를 적용한 초기 스탯 계산 */
function computeInitialStats(species: PetSpecies, breed: BreedId): PetStats {
  const base = SPECIES_CONFIGS[species].initialStats;
  const breedCfg = BREED_CONFIGS[breed];
  const mods = breedCfg?.statModifiers ?? {};

  return {
    hunger: clampStat(base.hunger + (mods.hunger ?? 0)),
    happiness: clampStat(base.happiness + (mods.happiness ?? 0)),
    energy: clampStat(base.energy + (mods.energy ?? 0)),
    cleanliness: clampStat(base.cleanliness + (mods.cleanliness ?? 0)),
    health: clampStat(base.health + (mods.health ?? 0)),
  };
}

export function createPet(name: string, species: PetSpecies, breed: BreedId): Pet {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    name,
    species,
    breed,
    stage: 'baby',
    stats: computeInitialStats(species, breed),
    mood: 'happy',
    age: 0,
    exp: 0,
    totalExp: 0,
    lastInteraction: now,
    lastTickAt: now,
    bornAt: now,
    isAlive: true,
  };
}

/** 종 기본 decay에 품종 decayModifiers 배율을 적용 */
function getEffectiveDecayRate(pet: Pet, statKey: StatKey): number {
  const baseRate = SPECIES_CONFIGS[pet.species].decayRates[statKey];
  const breedCfg = BREED_CONFIGS[pet.breed];
  const modifier = breedCfg?.decayModifiers?.[statKey] ?? 1.0;
  return baseRate * modifier;
}

// ============================================
// 기분 계산
// ============================================

export function calculateMood(stats: PetStats): Mood {
  if (stats.health < STAT_DANGER_THRESHOLD) return 'sick';

  const avg =
    (stats.hunger + stats.happiness + stats.energy + stats.cleanliness) / 4;

  if (avg >= 70) return 'happy';
  if (avg >= 40) return 'neutral';
  if (avg >= 20) return 'sad';
  return 'angry';
}

// ============================================
// 성장 로직 — 진화 조건 강화
// ============================================

export function getNextStage(current: GrowthStage): GrowthStage | null {
  if (current === 'baby') return 'teen';
  if (current === 'teen') return 'adult';
  return null;
}

/** 진화 조건(EXP + 최소스탯 + 최소나이)을 모두 만족하는지 확인 */
export function checkEvolution(pet: Pet): Pet {
  const config = SPECIES_CONFIGS[pet.species];
  const nextStage = getNextStage(pet.stage);
  if (!nextStage) return pet;

  const reqIndex = pet.stage === 'baby' ? 0 : 1;
  const req = config.evolution[reqIndex];

  // EXP 부족
  if (pet.exp < req.exp) return pet;

  // 최소 나이 확인
  if (req.minAge && pet.age < req.minAge) return pet;

  // 최소 스탯 확인
  if (req.minStats) {
    for (const [key, minVal] of Object.entries(req.minStats)) {
      if (pet.stats[key as StatKey] < minVal) return pet;
    }
  }

  // 진화 성공
  return {
    ...pet,
    stage: nextStage,
    exp: pet.exp - req.exp,
  };
}

// ============================================
// 틱 처리 — 단계별 배율 + 취약 스탯 적용
// ============================================

export function processTick(pet: Pet): Pet {
  if (!pet.isAlive) return pet;

  const config = SPECIES_CONFIGS[pet.species];
  const stageMul = config.stageMultipliers[pet.stage];
  const dr = stageMul.decayRate;

  // (종 기본 × 품종 배율) × 단계 배율
  const decayedStats: PetStats = {
    hunger: clampStat(pet.stats.hunger - getEffectiveDecayRate(pet, 'hunger') * dr),
    happiness: clampStat(pet.stats.happiness - getEffectiveDecayRate(pet, 'happiness') * dr),
    energy: clampStat(pet.stats.energy - getEffectiveDecayRate(pet, 'energy') * dr),
    cleanliness: clampStat(pet.stats.cleanliness - getEffectiveDecayRate(pet, 'cleanliness') * dr),
    health: clampStat(pet.stats.health - getEffectiveDecayRate(pet, 'health') * dr),
  };

  // 일반 위험 스탯 → 건강 추가 감소
  const statKeys: StatKey[] = ['hunger', 'happiness', 'energy', 'cleanliness'];
  const dangerCount = statKeys.filter(
    (k) => decayedStats[k] < STAT_DANGER_THRESHOLD
  ).length;
  if (dangerCount > 0) {
    decayedStats.health = clampStat(decayedStats.health - dangerCount * 2);
  }

  // 취약 스탯 위험 시 추가 건강 감소
  if (decayedStats[config.vulnerableStat] < STAT_DANGER_THRESHOLD) {
    decayedStats.health = clampStat(
      decayedStats.health - config.vulnerabilityPenalty
    );
  }

  const isAlive = decayedStats.health > 0;

  return {
    ...pet,
    stats: decayedStats,
    mood: calculateMood(decayedStats),
    age: pet.age + 1,
    lastTickAt: Date.now(),
    isAlive,
  };
}

// ============================================
// 액션 처리 — 보너스/페널티/오버케어/단계배율
// ============================================

export function performAction(pet: Pet, actionType: ActionType): Pet {
  if (!pet.isAlive) return pet;

  const action = ACTIONS[actionType];
  if (!action) return pet;

  const config = SPECIES_CONFIGS[pet.species];
  const stageMul = config.stageMultipliers[pet.stage];

  // 1) 기본 효과에 단계별 액션효율 배율 적용
  const scaledEffects: Partial<PetStats> = {};
  for (const [key, val] of Object.entries(action.effects)) {
    const statKey = key as StatKey;
    let adjusted = val * stageMul.actionEfficiency;

    // 2) 오버케어: 스탯이 이미 높은데 양수 효과 → 반감
    if (adjusted > 0 && pet.stats[statKey] >= config.overcareThreshold) {
      adjusted *= OVERCARE_PENALTY_RATE;
    }

    scaledEffects[statKey] = adjusted;
  }

  // 3) 좋아하는 액션 보너스
  if (actionType === config.favoriteAction) {
    const bonus = config.actionBonuses[actionType];
    if (bonus) {
      scaledEffects[bonus.bonusStat] =
        (scaledEffects[bonus.bonusStat] ?? 0) + bonus.bonusAmount;
    }
  }

  // 4) 싫어하는 액션 페널티
  if (actionType === config.dislikedAction) {
    scaledEffects.happiness =
      (scaledEffects.happiness ?? 0) + DISLIKE_HAPPINESS_PENALTY;
  }

  const newStats = applyEffects(pet.stats, scaledEffects);

  // 5) 경험치: 기본 보상 × 단계별 expRate
  const baseExp = ACTION_EXP_REWARD[actionType] ?? 0;
  const expGain = Math.round(baseExp * stageMul.expRate);

  let updatedPet: Pet = {
    ...pet,
    stats: newStats,
    mood: calculateMood(newStats),
    exp: pet.exp + expGain,
    totalExp: pet.totalExp + expGain,
    lastInteraction: Date.now(),
  };

  // 6) 성장 체크
  updatedPet = checkEvolution(updatedPet);

  return updatedPet;
}

// ============================================
// 랜덤 이벤트 — 단계 필터 추가
// ============================================

export function rollRandomEvent(
  pet: Pet
): { pet: Pet; event: GameEvent } | null {
  const eligible = RANDOM_EVENTS.filter((e) => {
    if (e.speciesOnly && !e.speciesOnly.includes(pet.species)) return false;
    if (e.stageOnly && !e.stageOnly.includes(pet.stage)) return false;
    return true;
  });

  for (const event of eligible) {
    if (Math.random() < event.probability) {
      const newStats = applyEffects(pet.stats, event.effects);
      return {
        pet: {
          ...pet,
          stats: newStats,
          mood: calculateMood(newStats),
        },
        event,
      };
    }
  }

  return null;
}

// ============================================
// 오프라인 시간 계산
// ============================================

/**
 * 오프라인 동안 경과한 틱 수만큼 processTick을 시뮬레이션.
 * maxTicks로 과도한 계산을 방지합니다.
 */
export function processOfflineTicks(
  pet: Pet,
  tickInterval: number,
  maxTicks: number
): { pet: Pet; ticksProcessed: number } {
  const elapsed = Date.now() - pet.lastTickAt;
  const ticksToProcess = Math.min(
    Math.floor(elapsed / tickInterval),
    maxTicks
  );

  let current = pet;
  for (let i = 0; i < ticksToProcess; i++) {
    current = processTick(current);
    if (!current.isAlive) break;
  }

  return { pet: current, ticksProcessed: ticksToProcess };
}
