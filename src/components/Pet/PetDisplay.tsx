import { useGameContext } from '../../context/GameContext';
import { SPECIES_CONFIGS, BREED_CONFIGS, STAGE_LABELS } from '../../constants';
import { getPetImageUrl } from '../../utils/petImages';
import './PetDisplay.css';

/** 기분에 따른 말풍선 */
function getMoodBubble(mood: string): string {
  switch (mood) {
    case 'happy': return '♪ 기분 좋아~';
    case 'neutral': return '...';
    case 'sad': return '흑흑...';
    case 'angry': return '으르르!!';
    case 'sick': return '아파요...';
    default: return '';
  }
}

export default function PetDisplay() {
  const { state } = useGameContext();
  const pet = state.pet;
  if (!pet) return null;

  const config = SPECIES_CONFIGS[pet.species];
  const breedConfig = BREED_CONFIGS[pet.breed];
  const stageLabel = STAGE_LABELS[pet.stage];

  // 실사 이미지 시도 → 없으면 이모지 fallback
  const imageUrl = getPetImageUrl(pet.breed, pet.stage, pet.mood);
  const fallbackEmoji = breedConfig?.emoji ?? '❓';

  return (
    <div className={`pet-display mood-${pet.mood}`}>
      <div className="pet-info-bar">
        <span className="pet-name">{pet.name}</span>
        <span className="pet-species">{breedConfig?.displayName ?? config.displayName}</span>
        <span className="pet-stage">{stageLabel}</span>
      </div>

      <div className="pet-sprite-area">
        <div className="mood-bubble">{getMoodBubble(pet.mood)}</div>

        {imageUrl ? (
          /* ── 실사 이미지 모드 ── */
          <div className={`pet-image-wrapper stage-${pet.stage} mood-filter-${pet.mood}`}>
            <img
              src={imageUrl}
              alt={`${breedConfig?.displayName ?? pet.species} ${stageLabel}`}
              className="pet-image"
              draggable={false}
            />
            {/* 기분별 CSS 오버레이 */}
            <div className={`mood-overlay mood-overlay-${pet.mood}`} />
          </div>
        ) : (
          /* ── 이모지 fallback ── */
          <div className={`pet-sprite stage-${pet.stage}`}>{fallbackEmoji}</div>
        )}
      </div>

      <div className="pet-exp-bar">
        <div className="exp-label">EXP</div>
        <div className="exp-track">
          <div
            className="exp-fill"
            style={{
              width: `${Math.min(
                (pet.exp /
                  (config.evolution[pet.stage === 'baby' ? 0 : 1]?.exp || 1)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
