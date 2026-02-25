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

/** 성장 단계를 레벨로 변환 */
function stageToLevel(stage: string): number {
  switch (stage) {
    case 'baby': return 1;
    case 'teen': return 5;
    case 'adult': return 10;
    default: return 1;
  }
}

export default function PetDisplay() {
  const { state } = useGameContext();
  const pet = state.pet;
  if (!pet) return null;

  const config = SPECIES_CONFIGS[pet.species];
  const breedConfig = BREED_CONFIGS[pet.breed];
  const stageLabel = STAGE_LABELS[pet.stage];

  const imageUrl = getPetImageUrl(pet.breed, pet.stage, pet.mood);
  const fallbackEmoji = breedConfig?.emoji ?? '❓';

  return (
    <div className="pet-display">
      {/* Cloud decorations */}
      <div className="pet-clouds">
        <div className="pet-cloud pet-cloud-1" />
        <div className="pet-cloud pet-cloud-2" />
        <div className="pet-cloud pet-cloud-3" />
      </div>

      <div className="pet-sprite-area">
        <div className="mood-bubble">{getMoodBubble(pet.mood)}</div>

        <div className="pet-glow" />

        {imageUrl ? (
          <div className={`pet-image-wrapper stage-${pet.stage} mood-filter-${pet.mood}`}>
            <img
              src={imageUrl}
              alt={`${breedConfig?.displayName ?? pet.species} ${stageLabel}`}
              className="pet-image"
              draggable={false}
            />
            <div className={`mood-overlay mood-overlay-${pet.mood}`} />
          </div>
        ) : (
          <div className={`pet-sprite stage-${pet.stage}`}>{fallbackEmoji}</div>
        )}

        <div className="pet-level-badge">
          <span className="pet-level-text">Level {stageToLevel(pet.stage)}</span>
        </div>
      </div>

      <div className="pet-info-center">
        <div className="pet-name">{pet.name}</div>
        <div className="pet-breed-label">{breedConfig?.displayName ?? config.displayName}</div>
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
