import type { Achievement, UserProgress, PetRecord, Pet } from '../types';

const PROGRESS_KEY = 'hyemily_progress';

// ============================================
// 업적 정의
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_pet', title: '첫 만남', description: '처음으로 펫을 키우기 시작했어요', icon: '🐣' },
  { id: 'first_evolution', title: '첫 진화', description: '펫을 처음으로 진화시켰어요', icon: '⭐' },
  { id: 'adult_reached', title: '완전 성장', description: '펫을 성인까지 키웠어요', icon: '👑' },
  { id: 'survive_100', title: '100틱 생존', description: '펫이 100틱 이상 살았어요', icon: '💪' },
  { id: 'survive_500', title: '500틱 생존', description: '펫이 500틱 이상 살았어요', icon: '🏅' },
  { id: 'all_species', title: '동물 박사', description: '4종을 모두 키워봤어요', icon: '📚' },
  { id: 'minigame_master', title: '미니게임 달인', description: '미니게임을 10번 플레이했어요', icon: '🎮' },
  { id: 'actions_50', title: '헌신적인 보호자', description: '총 50번 액션을 수행했어요', icon: '🤲' },
  { id: 'actions_200', title: '프로 사육사', description: '총 200번 액션을 수행했어요', icon: '🏆' },
  { id: 'five_pets', title: '다둥이 집사', description: '5마리 이상의 펫을 키워봤어요', icon: '🏠' },
];

// ============================================
// 진행 데이터 관리
// ============================================

const defaultProgress: UserProgress = {
  petRecords: [],
  unlockedAchievements: [],
  totalPetsRaised: 0,
  totalActionsPerformed: 0,
  totalEvolutions: 0,
  totalMiniGamesPlayed: 0,
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // 조용히 실패
  }
}

/** 펫 기록 추가 */
export function addPetRecord(progress: UserProgress, pet: Pet): UserProgress {
  const record: PetRecord = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    maxAge: pet.age,
    maxStage: pet.stage,
    bornAt: pet.bornAt,
    diedAt: pet.isAlive ? null : Date.now(),
  };

  return {
    ...progress,
    petRecords: [...progress.petRecords, record],
    totalPetsRaised: progress.totalPetsRaised + 1,
  };
}

/** 업적 자동 체크 — 새로 해금된 업적 ID 배열 반환 */
export function checkAchievements(progress: UserProgress, currentPet: Pet | null): string[] {
  const newlyUnlocked: string[] = [];
  const already = new Set(progress.unlockedAchievements);

  function check(id: string, condition: boolean) {
    if (!already.has(id) && condition) {
      newlyUnlocked.push(id);
    }
  }

  check('first_pet', progress.totalPetsRaised >= 1);
  check('first_evolution', progress.totalEvolutions >= 1);
  check('adult_reached', currentPet?.stage === 'adult' ||
    progress.petRecords.some((r) => r.maxStage === 'adult'));
  check('survive_100', (currentPet?.age ?? 0) >= 100 ||
    progress.petRecords.some((r) => r.maxAge >= 100));
  check('survive_500', (currentPet?.age ?? 0) >= 500 ||
    progress.petRecords.some((r) => r.maxAge >= 500));

  const speciesSet = new Set(progress.petRecords.map((r) => r.species));
  if (currentPet) speciesSet.add(currentPet.species);
  check('all_species', speciesSet.size >= 4);

  check('minigame_master', progress.totalMiniGamesPlayed >= 10);
  check('actions_50', progress.totalActionsPerformed >= 50);
  check('actions_200', progress.totalActionsPerformed >= 200);
  check('five_pets', progress.totalPetsRaised >= 5);

  return newlyUnlocked;
}
