import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, deleteSave } from '../saveLoad';
import { SAVE_KEY, SAVE_VERSION } from '../../constants';
import type { Pet } from '../../types';

// ============================================
// 헬퍼
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

// ============================================
// 테스트
// ============================================

describe('saveLoad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveGame', () => {
    it('localStorage에 데이터를 저장', () => {
      const pet = makePet();
      saveGame(pet, Date.now());

      const raw = localStorage.getItem(SAVE_KEY);
      expect(raw).not.toBeNull();

      const data = JSON.parse(raw!);
      expect(data.version).toBe(SAVE_VERSION);
      expect(data.pet.name).toBe('테스트');
    });

    it('저장 시 savedAt 타임스탬프가 포함됨', () => {
      const pet = makePet();
      const before = Date.now();
      saveGame(pet, before);

      const data = JSON.parse(localStorage.getItem(SAVE_KEY)!);
      expect(data.savedAt).toBeGreaterThanOrEqual(before);
      expect(data.startedAt).toBe(before);
    });

    it('localStorage 에러 시 조용히 실패', () => {
      const pet = makePet();
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => saveGame(pet, Date.now())).not.toThrow();
      vi.restoreAllMocks();
    });
  });

  describe('loadGame', () => {
    it('저장된 데이터를 올바르게 로드', () => {
      const pet = makePet();
      const startedAt = Date.now();
      saveGame(pet, startedAt);

      const result = loadGame();
      expect(result).not.toBeNull();
      expect(result!.pet.name).toBe('테스트');
      expect(result!.startedAt).toBe(startedAt);
    });

    it('저장 데이터가 없으면 null 반환', () => {
      expect(loadGame()).toBeNull();
    });

    it('버전 불일치 시 null 반환', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 999,
        pet: makePet(),
        startedAt: Date.now(),
        savedAt: Date.now(),
      }));

      expect(loadGame()).toBeNull();
    });

    it('잘못된 JSON 시 null 반환', () => {
      localStorage.setItem(SAVE_KEY, 'not-json');
      expect(loadGame()).toBeNull();
    });

    it('pet 구조가 불완전하면 null 반환', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: SAVE_VERSION,
        pet: { id: 'test' }, // species 없음
        startedAt: Date.now(),
        savedAt: Date.now(),
      }));

      expect(loadGame()).toBeNull();
    });

    it('pet이 null이면 null 반환', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: SAVE_VERSION,
        pet: null,
        startedAt: Date.now(),
        savedAt: Date.now(),
      }));

      expect(loadGame()).toBeNull();
    });
  });

  describe('deleteSave', () => {
    it('저장된 데이터를 삭제', () => {
      saveGame(makePet(), Date.now());
      expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();

      deleteSave();
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });

    it('데이터가 없어도 에러 안 남', () => {
      expect(() => deleteSave()).not.toThrow();
    });
  });
});
