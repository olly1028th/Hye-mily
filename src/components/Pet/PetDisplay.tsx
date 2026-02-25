import { useGameContext } from '../../context/GameContext';
import { SPECIES_CONFIGS, STAGE_LABELS } from '../../constants';
import './PetDisplay.css';

/** 종 + 단계에 따른 이모지 반환 (스프라이트 대용) */
function getPetEmoji(species: string, stage: string): string {
  const emojis: Record<string, Record<string, string>> = {
    cat: { baby: '🐱', teen: '😺', adult: '😸' },
    dog: { baby: '🐶', teen: '🐕', adult: '🦮' },
    lizard: { baby: '🦎', teen: '🦎', adult: '🐊' },
    hedgehog: { baby: '🦔', teen: '🦔', adult: '🦔' },
  };
  return emojis[species]?.[stage] ?? '❓';
}

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
  const emoji = getPetEmoji(pet.species, pet.stage);
  const stageLabel = STAGE_LABELS[pet.stage];

  return (
    <div className={`pet-display mood-${pet.mood}`}>
      <div className="pet-info-bar">
        <span className="pet-name">{pet.name}</span>
        <span className="pet-species">{config.displayName}</span>
        <span className="pet-stage">{stageLabel}</span>
      </div>

      <div className="pet-sprite-area">
        <div className="mood-bubble">{getMoodBubble(pet.mood)}</div>
        <div className={`pet-sprite stage-${pet.stage}`}>{emoji}</div>
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
