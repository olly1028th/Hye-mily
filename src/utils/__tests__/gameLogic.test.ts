import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  clampStat,
  applyEffects,
  createPet,
  calculateMood,
  getNextStage,
  checkEvolution,
  processTick,
  performAction,
  rollRandomEvent,
  processOfflineTicks,
} from '../gameLogic';
import type { Pet, PetStats } from '../../types';

// ============================================
// 헬퍼: 테스트용 펫 생성
// ============================================

function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 'test-id',
    name: '테스트',
    species: 'cat',
    breed: 'korean_shorthair',
    stage: 'baby',
    stats: {
      hunger: 75,
      happiness: 85,
      energy: 70,
      cleanliness: 95,
      health: 90,
    },
    mood: 'happy',
    age: 0,
    exp: 0,
    totalExp: 0,
    lastInteraction: Date.now(),
    lastTickAt: Date.now(),
    bornAt: Date.now(),
    isAlive: true,
    ...overrides,
  };
}

function makeStats(overrides: Partial<PetStats> = {}): PetStats {
  return {
    hunger: 50,
    happiness: 50,
    energy: 50,
    cleanliness: 50,
    health: 50,
    ...overrides,
  };
}

// ============================================
// clampStat
// ============================================

describe('clampStat', () => {
  it('값이 범위 내이면 그대로 반환', () => {
    expect(clampStat(50)).toBe(50);
  });

  it('0 미만이면 0으로 클램핑', () => {
    expect(clampStat(-10)).toBe(0);
  });

  it('100 초과이면 100으로 클램핑', () => {
    expect(clampStat(120)).toBe(100);
  });

  it('경계값 0과 100 정상 처리', () => {
    expect(clampStat(0)).toBe(0);
    expect(clampStat(100)).toBe(100);
  });
});

// ============================================
// applyEffects
// ============================================

describe('applyEffects', () => {
  it('양수 효과를 올바르게 적용', () => {
    const result = applyEffects(makeStats(), { hunger: 10 });
    expect(result.hunger).toBe(60);
    expect(result.happiness).toBe(50); // 변경 없는 스탯은 유지
  });

  it('음수 효과를 올바르게 적용', () => {
    const result = applyEffects(makeStats(), { energy: -20 });
    expect(result.energy).toBe(30);
  });

  it('0~100 범위로 클램핑됨', () => {
    const result = applyEffects(makeStats({ health: 5 }), { health: -20 });
    expect(result.health).toBe(0);
  });

  it('여러 스탯 동시 변경', () => {
    const result = applyEffects(makeStats(), {
      hunger: 20,
      happiness: -10,
      energy: 30,
    });
    expect(result.hunger).toBe(70);
    expect(result.happiness).toBe(40);
    expect(result.energy).toBe(80);
  });

  it('빈 효과는 원본 스탯 그대로', () => {
    const original = makeStats();
    const result = applyEffects(original, {});
    expect(result).toEqual(original);
  });
});

// ============================================
// createPet
// ============================================

describe('createPet', () => {
  it('기본 필드가 올바르게 설정됨', () => {
    const pet = createPet('나비', 'cat', 'korean_shorthair');
    expect(pet.name).toBe('나비');
    expect(pet.species).toBe('cat');
    expect(pet.breed).toBe('korean_shorthair');
    expect(pet.stage).toBe('baby');
    expect(pet.age).toBe(0);
    expect(pet.exp).toBe(0);
    expect(pet.isAlive).toBe(true);
  });

  it('고유 ID가 생성됨', () => {
    const pet1 = createPet('나비', 'cat', 'korean_shorthair');
    const pet2 = createPet('초코', 'dog', 'jindo');
    expect(pet1.id).toBeTruthy();
    expect(pet1.id).not.toBe(pet2.id);
  });

  it('종별 초기 스탯에 품종 보정이 적용됨', () => {
    // korean_shorthair: statModifiers = { health: 10, energy: 5 }
    // cat 기본: health: 90, energy: 70
    const pet = createPet('나비', 'cat', 'korean_shorthair');
    expect(pet.stats.health).toBe(100); // 90 + 10 = 100 (clamped)
    expect(pet.stats.energy).toBe(75);  // 70 + 5
  });

  it('다른 종도 정상 생성됨', () => {
    const dog = createPet('뽀삐', 'dog', 'jindo');
    expect(dog.species).toBe('dog');
    expect(dog.breed).toBe('jindo');

    const lizard = createPet('렉스', 'lizard', 'leopard_gecko');
    expect(lizard.species).toBe('lizard');

    const hedgehog = createPet('가시', 'hedgehog', 'four_toed');
    expect(hedgehog.species).toBe('hedgehog');
  });
});

// ============================================
// calculateMood
// ============================================

describe('calculateMood', () => {
  it('health < 20이면 sick 반환', () => {
    expect(calculateMood(makeStats({ health: 10 }))).toBe('sick');
  });

  it('평균 >= 70이면 happy', () => {
    expect(calculateMood(makeStats({
      hunger: 80, happiness: 80, energy: 80, cleanliness: 80, health: 90,
    }))).toBe('happy');
  });

  it('평균 40~69이면 neutral', () => {
    expect(calculateMood(makeStats({
      hunger: 50, happiness: 50, energy: 50, cleanliness: 50, health: 90,
    }))).toBe('neutral');
  });

  it('평균 20~39이면 sad', () => {
    expect(calculateMood(makeStats({
      hunger: 30, happiness: 30, energy: 30, cleanliness: 30, health: 90,
    }))).toBe('sad');
  });

  it('평균 < 20이면 angry', () => {
    expect(calculateMood(makeStats({
      hunger: 10, happiness: 10, energy: 10, cleanliness: 10, health: 90,
    }))).toBe('angry');
  });

  it('health < 20이 sick을 우선 (다른 스탯 높아도)', () => {
    expect(calculateMood(makeStats({
      hunger: 100, happiness: 100, energy: 100, cleanliness: 100, health: 15,
    }))).toBe('sick');
  });
});

// ============================================
// getNextStage
// ============================================

describe('getNextStage', () => {
  it('baby → teen', () => {
    expect(getNextStage('baby')).toBe('teen');
  });

  it('teen → adult', () => {
    expect(getNextStage('teen')).toBe('adult');
  });

  it('adult → null', () => {
    expect(getNextStage('adult')).toBeNull();
  });
});

// ============================================
// checkEvolution
// ============================================

describe('checkEvolution', () => {
  it('EXP 부족하면 진화 안 함', () => {
    const pet = makePet({ exp: 10 });
    const result = checkEvolution(pet);
    expect(result.stage).toBe('baby');
  });

  it('조건 충족 시 baby → teen 진화', () => {
    // cat baby→teen: exp: 100, minStats: { cleanliness: 40 }, minAge: 30
    const pet = makePet({
      exp: 150,
      age: 35,
      stats: makeStats({ cleanliness: 50, health: 90 }),
    });
    const result = checkEvolution(pet);
    expect(result.stage).toBe('teen');
    expect(result.exp).toBe(50); // 150 - 100
  });

  it('최소 나이 미달 시 진화 안 함', () => {
    const pet = makePet({ exp: 150, age: 10 }); // minAge: 30
    const result = checkEvolution(pet);
    expect(result.stage).toBe('baby');
  });

  it('최소 스탯 미달 시 진화 안 함', () => {
    // cat baby→teen: minStats: { cleanliness: 40 }
    const pet = makePet({
      exp: 150,
      age: 35,
      stats: makeStats({ cleanliness: 30 }),
    });
    const result = checkEvolution(pet);
    expect(result.stage).toBe('baby');
  });

  it('adult는 더 이상 진화 안 함', () => {
    const pet = makePet({ stage: 'adult', exp: 9999, age: 9999 });
    const result = checkEvolution(pet);
    expect(result.stage).toBe('adult');
  });

  it('teen → adult 진화', () => {
    // cat teen→adult: exp: 280, minStats: { cleanliness: 50, happiness: 40 }, minAge: 120
    const pet = makePet({
      stage: 'teen',
      exp: 300,
      age: 130,
      stats: makeStats({ cleanliness: 60, happiness: 50, health: 90 }),
    });
    const result = checkEvolution(pet);
    expect(result.stage).toBe('adult');
    expect(result.exp).toBe(20); // 300 - 280
  });
});

// ============================================
// processTick
// ============================================

describe('processTick', () => {
  it('죽은 펫은 변경 없이 반환', () => {
    const pet = makePet({ isAlive: false });
    const result = processTick(pet);
    expect(result).toBe(pet);
  });

  it('스탯이 감소함', () => {
    const pet = makePet();
    const result = processTick(pet);

    expect(result.stats.hunger).toBeLessThan(pet.stats.hunger);
    expect(result.stats.happiness).toBeLessThan(pet.stats.happiness);
    expect(result.stats.cleanliness).toBeLessThan(pet.stats.cleanliness);
  });

  it('나이가 1 증가함', () => {
    const pet = makePet({ age: 10 });
    const result = processTick(pet);
    expect(result.age).toBe(11);
  });

  it('기분이 재계산됨', () => {
    const pet = makePet({
      stats: makeStats({
        hunger: 10, happiness: 10, energy: 10, cleanliness: 10, health: 50,
      }),
    });
    const result = processTick(pet);
    // 스탯이 매우 낮으므로 기분이 좋지 않을 것
    expect(['angry', 'sad', 'sick']).toContain(result.mood);
  });

  it('위험 스탯이 있으면 건강이 추가 감소', () => {
    const pet = makePet({
      stats: makeStats({
        hunger: 10,      // danger
        happiness: 10,   // danger
        energy: 10,      // danger
        cleanliness: 10, // danger
        health: 80,
      }),
    });
    const result = processTick(pet);
    // 4개 스탯 위험 × 2 = -8 추가 + 일반 decay + vulnerable penalty
    expect(result.stats.health).toBeLessThan(70);
  });

  it('건강이 0이면 사망', () => {
    const pet = makePet({
      stats: makeStats({
        hunger: 0,
        happiness: 0,
        energy: 0,
        cleanliness: 0,
        health: 1,
      }),
    });
    const result = processTick(pet);
    expect(result.isAlive).toBe(false);
  });

  it('스탯은 0 미만으로 내려가지 않음', () => {
    const pet = makePet({
      stats: makeStats({
        hunger: 0, happiness: 0, energy: 0, cleanliness: 0, health: 50,
      }),
    });
    const result = processTick(pet);
    expect(result.stats.hunger).toBe(0);
    expect(result.stats.happiness).toBe(0);
    expect(result.stats.energy).toBe(0);
    expect(result.stats.cleanliness).toBe(0);
  });
});

// ============================================
// performAction
// ============================================

describe('performAction', () => {
  it('죽은 펫에 액션하면 변경 없이 반환', () => {
    const pet = makePet({ isAlive: false });
    const result = performAction(pet, 'feed');
    expect(result).toBe(pet);
  });

  it('feed 액션으로 hunger 증가', () => {
    const pet = makePet({ stats: makeStats({ hunger: 50 }) });
    const result = performAction(pet, 'feed');
    expect(result.stats.hunger).toBeGreaterThan(50);
  });

  it('play 액션으로 happiness 증가, energy 감소', () => {
    const pet = makePet({
      species: 'dog',
      breed: 'jindo',
      stats: makeStats({ happiness: 50, energy: 80 }),
    });
    const result = performAction(pet, 'play');
    expect(result.stats.happiness).toBeGreaterThan(50);
    expect(result.stats.energy).toBeLessThan(80);
  });

  it('경험치가 증가함', () => {
    const pet = makePet({ exp: 0, totalExp: 0 });
    const result = performAction(pet, 'feed');
    expect(result.exp).toBeGreaterThan(0);
    expect(result.totalExp).toBeGreaterThan(0);
  });

  it('좋아하는 액션이면 보너스 적용 (고양이 clean)', () => {
    const petClean = makePet({
      stats: makeStats({ cleanliness: 50, happiness: 50 }),
    });
    const result = performAction(petClean, 'clean');
    // cat favoriteAction = clean → happiness 보너스 +8
    // clean 기본: happiness -5, 하지만 favorite 보너스 +8 → 순수 +3
    expect(result.stats.happiness).toBeGreaterThanOrEqual(50);
  });

  it('싫어하는 액션이면 happiness 페널티 (고양이 play)', () => {
    const pet = makePet({
      stats: makeStats({ happiness: 50, energy: 80, hunger: 80 }),
    });
    const result = performAction(pet, 'play');
    // cat dislikedAction = play → happiness -8 추가
    // play 기본 happiness: +20 이지만 -8 페널티
    // 최종 행복도 변화량: 20 * stageMultiplier - 8
    expect(result.stats.happiness).toBeLessThan(50 + 20); // 보너스가 감소됨
  });

  it('오버케어: 스탯이 이미 높으면 효과 감소', () => {
    // cat overcareThreshold = 90
    const pet = makePet({
      stats: makeStats({ hunger: 95 }),
    });
    const result = performAction(pet, 'feed');
    // 오버케어 적용: hunger 증가량이 25 * 1.2(baby) * 0.3 = 9
    expect(result.stats.hunger).toBeLessThanOrEqual(100);
    expect(result.stats.hunger - 95).toBeLessThan(25); // 원래 25보다 적게 증가
  });

  it('기분이 재계산됨', () => {
    const pet = makePet();
    const result = performAction(pet, 'feed');
    expect(['happy', 'neutral', 'sad', 'angry', 'sick']).toContain(result.mood);
  });

  it('조건 충족 시 액션 후 진화', () => {
    // cat baby→teen: exp: 100, cleanliness >= 40, age >= 30
    const pet = makePet({
      exp: 96, // feed gives ~6 exp (5 * 1.2 baby expRate ≈ 6)
      age: 35,
      stats: makeStats({ cleanliness: 50, hunger: 50, health: 90 }),
    });
    const result = performAction(pet, 'feed');
    expect(result.stage).toBe('teen');
  });
});

// ============================================
// rollRandomEvent
// ============================================

describe('rollRandomEvent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('확률 0이면 이벤트 발생 안 함', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const pet = makePet();
    const result = rollRandomEvent(pet);
    expect(result).toBeNull();
  });

  it('확률 충족 시 이벤트 발생', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // 거의 항상 트리거
    const pet = makePet();
    const result = rollRandomEvent(pet);
    expect(result).not.toBeNull();
    expect(result!.event.message).toBeTruthy();
  });

  it('종 전용 이벤트는 다른 종에게 발생하지 않음', () => {
    // Math.random을 0.01로 고정해도 dog 전용 이벤트는 cat에게 안 발생
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const catPet = makePet({ species: 'cat', breed: 'korean_shorthair' });
    const result = rollRandomEvent(catPet);
    if (result) {
      // 발생한 이벤트가 종 전용이라면 cat이어야 함
      if (result.event.speciesOnly) {
        expect(result.event.speciesOnly).toContain('cat');
      }
    }
  });

  it('성장 단계 전용 이벤트 필터링', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const adultPet = makePet({ stage: 'adult' });
    const result = rollRandomEvent(adultPet);
    if (result && result.event.stageOnly) {
      expect(result.event.stageOnly).toContain('adult');
    }
  });

  it('이벤트 발생 시 스탯이 변경됨', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const pet = makePet();
    const result = rollRandomEvent(pet);
    if (result) {
      // 이벤트 효과가 적용된 새 pet 반환
      expect(result.pet).not.toBe(pet);
    }
  });
});

// ============================================
// processOfflineTicks
// ============================================

describe('processOfflineTicks', () => {
  it('경과 시간에 비례한 틱 수를 처리', () => {
    const now = Date.now();
    const pet = makePet({ lastTickAt: now - 50000 }); // 50초 전
    const result = processOfflineTicks(pet, 5000, 360);
    expect(result.ticksProcessed).toBe(10); // 50000 / 5000 = 10
  });

  it('maxTicks를 초과하지 않음', () => {
    const now = Date.now();
    const pet = makePet({ lastTickAt: now - 10000000 }); // 매우 오래 전
    const result = processOfflineTicks(pet, 5000, 10);
    expect(result.ticksProcessed).toBeLessThanOrEqual(10);
  });

  it('펫이 죽으면 즉시 중단', () => {
    const now = Date.now();
    const pet = makePet({
      lastTickAt: now - 5000000,
      stats: makeStats({
        hunger: 0, happiness: 0, energy: 0, cleanliness: 0, health: 2,
      }),
    });
    const result = processOfflineTicks(pet, 5000, 100);
    // 루프가 조기 중단되어 펫이 사망 상태
    expect(result.pet.isAlive).toBe(false);
    expect(result.pet.stats.health).toBe(0);
  });

  it('경과 시간 없으면 0틱 처리', () => {
    const pet = makePet({ lastTickAt: Date.now() });
    const result = processOfflineTicks(pet, 5000, 360);
    expect(result.ticksProcessed).toBe(0);
    expect(result.pet).toBe(pet); // 변경 없음
  });

  it('각 틱마다 스탯이 감소', () => {
    const now = Date.now();
    const pet = makePet({ lastTickAt: now - 25000 }); // 5틱
    const result = processOfflineTicks(pet, 5000, 360);
    expect(result.pet.stats.hunger).toBeLessThan(pet.stats.hunger);
    expect(result.pet.age).toBe(pet.age + result.ticksProcessed);
  });
});
