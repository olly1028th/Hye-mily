import type { BreedId, GrowthStage, Mood } from '../types';

// ============================================
// 이미지 경로 규칙
// ============================================
//
//  src/assets/breeds/{breedId}/
//  ├── baby.webp          ← 아기 기본
//  ├── teen.webp          ← 청소년 기본
//  ├── adult.webp         ← 성인 기본
//  └── (선택) baby_happy.webp, teen_sick.webp 등 mood별
//
//  네이밍: {stage}.webp  또는  {stage}_{mood}.webp
//
//  Vite는 import.meta.glob으로 assets 폴더의 이미지를
//  빌드 시점에 해시 URL로 변환합니다.
//

// Vite glob import: assets/breeds 하위의 모든 이미지를 eager로 로드
const breedImages = import.meta.glob<{ default: string }>(
  '../assets/breeds/**/*.{webp,png,jpg,jpeg}',
  { eager: true }
);

/**
 * glob 결과에서 특정 breed/filename에 해당하는 URL을 찾습니다.
 * 예: breed='jindo', filename='baby' → '../assets/breeds/jindo/baby.webp'
 */
function findImage(breed: string, filename: string): string | null {
  for (const [path, mod] of Object.entries(breedImages)) {
    // path: ../assets/breeds/jindo/baby.webp
    if (path.includes(`/${breed}/`) && path.includes(`/${filename}.`)) {
      return mod.default;
    }
  }
  return null;
}

/**
 * 품종 + 성장단계 + 기분에 맞는 이미지 URL을 반환합니다.
 *
 * 탐색 우선순위:
 *   1) {stage}_{mood}.webp  (예: baby_happy.webp)
 *   2) {stage}.webp         (예: baby.webp)
 *   3) null → 이모지 fallback 사용
 */
export function getPetImageUrl(
  breed: BreedId,
  stage: GrowthStage,
  mood: Mood
): string | null {
  // 1) mood별 이미지 있으면 우선
  const moodSpecific = findImage(breed, `${stage}_${mood}`);
  if (moodSpecific) return moodSpecific;

  // 2) 기본 stage 이미지
  const stageDefault = findImage(breed, stage);
  if (stageDefault) return stageDefault;

  return null;
}

/**
 * 선택 화면용 대표 이미지 (baby 기본 사용)
 */
export function getBreedThumbnail(breed: BreedId): string | null {
  return findImage(breed, 'baby') ?? findImage(breed, 'teen') ?? findImage(breed, 'adult');
}

/**
 * 해당 품종에 이미지가 하나라도 존재하는지 확인
 */
export function hasBreedImages(breed: BreedId): boolean {
  for (const path of Object.keys(breedImages)) {
    if (path.includes(`/${breed}/`)) return true;
  }
  return false;
}
