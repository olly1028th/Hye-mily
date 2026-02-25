import type { Pet, SaveData } from '../types';
import { SAVE_VERSION, SAVE_KEY } from '../constants';

/** 현재 상태를 localStorage에 저장 */
export function saveGame(pet: Pet, startedAt: number): void {
  const data: SaveData = {
    version: SAVE_VERSION,
    pet,
    startedAt,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // 용량 초과 등 — 조용히 실패
  }
}

/** localStorage에서 세이브 데이터 불러오기 */
export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data: SaveData = JSON.parse(raw);

    // 버전 호환성 체크
    if (data.version !== SAVE_VERSION) return null;

    // 기본 구조 검증
    if (!data.pet || !data.pet.id || !data.pet.species) return null;

    return data;
  } catch {
    return null;
  }
}

/** 세이브 데이터 삭제 */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
