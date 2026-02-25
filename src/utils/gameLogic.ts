import type {
  Pet,
  PetSpecies,
  PetStats,
  GrowthStage,
  Mood,
  ActionType,
  GameEvent,
} from '../types';
import {
  INITIAL_STATS,
  SPECIES_CONFIGS,
  ACTIONS,
  STAT_MIN,
  STAT_MAX,
  STAT_DANGER_THRESHOLD,
  RANDOM_EVENTS,
  ACTION_EXP_REWARD,
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
// 펫 생성
// ============================================

/** 새 반려동물 생성 */
export function createPet(name: string, species: PetSpecies): Pet {
  return {
    id: crypto.randomUUID(),
    name,
    species,
    stage: 'baby',
    stats: { ...INITIAL_STATS },
    mood: 'happy',
    age: 0,
    exp: 0,
    lastInteraction: Date.now(),
    bornAt: Date.now(),
    isAlive: true,
  };
}

// ============================================
// 기분 계산
// ============================================

/** 스탯 평균으로 기분 결정 */
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
// 성장 로직
// ============================================

/** 다음 성장 단계 반환 (이미 adult면 null) */
export function getNextStage(current: GrowthStage): GrowthStage | null {
  if (current === 'baby') return 'teen';
  if (current === 'teen') return 'adult';
  return null;
}

/** 성장 가능 여부 확인 및 진화 처리 */
export function checkEvolution(pet: Pet): Pet {
  const config = SPECIES_CONFIGS[pet.species];
  const nextStage = getNextStage(pet.stage);
  if (!nextStage) return pet;

  const thresholdIndex = pet.stage === 'baby' ? 0 : 1;
  const threshold = config.expThresholds[thresholdIndex];

  if (pet.exp >= threshold) {
    return {
      ...pet,
      stage: nextStage,
      exp: pet.exp - threshold,
    };
  }

  return pet;
}

// ============================================
// 틱 처리 (시간 경과에 따른 스탯 감소)
// ============================================

/** 매 틱마다 호출 — 스탯 자연 감소 + 건강 체크 */
export function processTick(pet: Pet): Pet {
  if (!pet.isAlive) return pet;

  const config = SPECIES_CONFIGS[pet.species];

  // 종별 감소 속도에 따라 스탯 감소
  const decayedStats: PetStats = {
    hunger: clampStat(pet.stats.hunger - config.decayRates.hunger),
    happiness: clampStat(pet.stats.happiness - config.decayRates.happiness),
    energy: clampStat(pet.stats.energy - config.decayRates.energy),
    cleanliness: clampStat(
      pet.stats.cleanliness - config.decayRates.cleanliness
    ),
    health: clampStat(pet.stats.health - config.decayRates.health),
  };

  // 스탯이 위험 수준이면 건강 추가 감소
  const dangerCount = Object.values(decayedStats).filter(
    (v) => v < STAT_DANGER_THRESHOLD
  ).length;
  if (dangerCount > 0) {
    decayedStats.health = clampStat(decayedStats.health - dangerCount * 2);
  }

  const isAlive = decayedStats.health > 0;

  return {
    ...pet,
    stats: decayedStats,
    mood: calculateMood(decayedStats),
    age: pet.age + 1,
    isAlive,
  };
}

// ============================================
// 액션 처리
// ============================================

/** 액션 수행 */
export function performAction(pet: Pet, actionType: ActionType): Pet {
  if (!pet.isAlive) return pet;

  const action = ACTIONS[actionType];
  if (!action) return pet;

  const newStats = applyEffects(pet.stats, action.effects);
  const expGain = ACTION_EXP_REWARD[actionType] ?? 0;

  let updatedPet: Pet = {
    ...pet,
    stats: newStats,
    mood: calculateMood(newStats),
    exp: pet.exp + expGain,
    lastInteraction: Date.now(),
  };

  // 성장 체크
  updatedPet = checkEvolution(updatedPet);

  return updatedPet;
}

// ============================================
// 랜덤 이벤트
// ============================================

/** 랜덤 이벤트 발생 여부 체크 및 적용 */
export function rollRandomEvent(
  pet: Pet
): { pet: Pet; event: GameEvent } | null {
  // 해당 종에 해당하는 이벤트만 필터링
  const eligibleEvents = RANDOM_EVENTS.filter(
    (e) => !e.speciesOnly || e.speciesOnly.includes(pet.species)
  );

  for (const event of eligibleEvents) {
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
