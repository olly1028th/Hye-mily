import { useGameContext } from '../../context/GameContext';
import { SPECIES_CONFIGS, BREED_CONFIGS, STAGE_LABELS } from '../../constants';
import { getPetImageUrl, getBreedThumbnail } from '../../utils/petImages';
import './StatsScreen.css';

export default function StatsScreen() {
  const { state } = useGameContext();
  const pet = state.pet;
  if (!pet) return null;

  const config = SPECIES_CONFIGS[pet.species];
  const breedConfig = BREED_CONFIGS[pet.breed];
  const stageLabel = STAGE_LABELS[pet.stage];

  const imageUrl = getPetImageUrl(pet.breed, pet.stage, pet.mood) || getBreedThumbnail(pet.breed);
  const fallbackEmoji = breedConfig?.emoji ?? '❓';

  const bornDate = new Date(pet.bornAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Hearts = totalExp, Items = age, Happy = average happiness approx
  const avgHappy = Math.round(
    (pet.stats.hunger + pet.stats.happiness + pet.stats.energy + pet.stats.cleanliness + pet.stats.health) / 5
  );

  // Friendship based on age
  const friendshipPercent = Math.min(Math.round((pet.age / 500) * 100), 100);

  return (
    <div className="stats-screen">
      {/* Header */}
      <div className="stats-header">
        <h2 className="stats-title">Sweet Candy Stats</h2>
      </div>

      {/* Main Jelly Container */}
      <div className="stats-glass-card">
        {/* Background decorative shapes */}
        <div className="stats-deco stats-deco-top" />
        <div className="stats-deco stats-deco-bottom" />

        {/* Pet Profile */}
        <div className="stats-profile">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={breedConfig?.displayName ?? pet.species}
              className="stats-profile-img"
              draggable={false}
            />
          ) : (
            <div className="stats-profile-emoji">{fallbackEmoji}</div>
          )}
          {/* Floating hearts */}
          <div className="stats-heart stats-heart-right">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--primary)' }}>favorite</span>
          </div>
          <div className="stats-heart stats-heart-left">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--primary)', fontSize: '16px' }}>favorite</span>
          </div>
        </div>

        <div className="stats-name-section">
          <p className="stats-pet-name">{pet.name}</p>
          <div className="stats-level-badge">
            <p className="stats-level-text">Lv. {pet.stage === 'baby' ? 1 : pet.stage === 'teen' ? 5 : 10} {stageLabel}</p>
          </div>
          <p className="stats-adopted">{bornDate} 입양</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stats-grid-item stats-grid-pink">
            <p className="stats-grid-value">{pet.totalExp}</p>
            <p className="stats-grid-label">Hearts</p>
          </div>
          <div className="stats-grid-item stats-grid-blue">
            <p className="stats-grid-value">{pet.age}</p>
            <p className="stats-grid-label">Age</p>
          </div>
          <div className="stats-grid-item stats-grid-yellow">
            <p className="stats-grid-value">{avgHappy}%</p>
            <p className="stats-grid-label">Happy</p>
          </div>
        </div>

        {/* Friendship Bar */}
        <div className="stats-friendship">
          <div className="stats-friendship-header">
            <h4>Friendship Level</h4>
            <span className="stats-friendship-label">
              {friendshipPercent >= 90 ? 'Max Bond!' : `${friendshipPercent}%`}
            </span>
          </div>
          <div className="stats-friendship-track">
            <div className="stats-friendship-fill" style={{ width: `${friendshipPercent}%` }}>
              <div className="stats-friendship-knob" />
            </div>
          </div>
        </div>

        {/* Sticker Badges */}
        <div className="stats-traits">
          <h4 className="stats-traits-title">Traits &amp; Talents</h4>
          <div className="stats-badges">
            <span className="stats-badge stats-badge-pink" style={{ transform: 'rotate(-2deg)' }}>
              {config.favoriteAction === 'play' ? 'BOUNCY' : config.favoriteAction === 'feed' ? 'FOODIE' : config.favoriteAction === 'clean' ? 'SHINY' : config.favoriteAction === 'sleep' ? 'DREAMER' : 'TOUGH'}
            </span>
            <span className="stats-badge stats-badge-blue" style={{ transform: 'rotate(3deg)' }}>
              {breedConfig?.difficulty === 'easy' ? 'CHILL' : breedConfig?.difficulty === 'hard' ? 'REBEL' : 'SWEET'}
            </span>
            <span className="stats-badge stats-badge-purple" style={{ transform: 'rotate(-1deg)' }}>
              {pet.mood === 'happy' ? 'HAPPY' : pet.mood === 'neutral' ? 'ZEN' : pet.mood === 'sad' ? 'SOFT' : pet.mood === 'angry' ? 'FIERCE' : 'BRAVE'}
            </span>
            <span className="stats-badge stats-badge-yellow" style={{ transform: 'rotate(2deg)' }}>
              {stageLabel === '아기' ? 'TINY' : stageLabel === '청소년' ? 'GROWING' : 'MAJESTIC'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
