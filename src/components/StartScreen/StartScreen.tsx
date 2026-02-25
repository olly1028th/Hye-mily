import { useState } from 'react';
import type { PetSpecies, BreedId, BreedConfig } from '../../types';
import { SPECIES_CONFIGS, BREED_CONFIGS, getBreedsBySpecies } from '../../constants';
import { useGameContext } from '../../context/GameContext';
import './StartScreen.css';

const speciesList = Object.values(SPECIES_CONFIGS);

const SPECIES_EMOJI: Record<PetSpecies, string> = {
  cat: '🐱',
  dog: '🐶',
  lizard: '🦎',
  hedgehog: '🦔',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#00b894',
  normal: '#fdcb6e',
  hard: '#d63031',
};

type Step = 'species' | 'breed' | 'name';

export default function StartScreen() {
  const { dispatch } = useGameContext();
  const [step, setStep] = useState<Step>('species');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<BreedId | null>(null);
  const [name, setName] = useState('');

  const breeds: BreedConfig[] = selectedSpecies
    ? getBreedsBySpecies(selectedSpecies)
    : [];

  const selectedBreedConfig = selectedBreed ? BREED_CONFIGS[selectedBreed] : null;

  const handleSpeciesSelect = (species: PetSpecies) => {
    setSelectedSpecies(species);
    setSelectedBreed(null);
    setStep('breed');
  };

  const handleBreedSelect = (breedId: BreedId) => {
    setSelectedBreed(breedId);
    setStep('name');
  };

  const handleBack = () => {
    if (step === 'name') {
      setStep('breed');
      setName('');
    } else if (step === 'breed') {
      setStep('species');
      setSelectedSpecies(null);
      setSelectedBreed(null);
    }
  };

  const handleStart = () => {
    if (!name.trim() || !selectedSpecies || !selectedBreed) return;
    dispatch({
      type: 'START_GAME',
      name: name.trim(),
      species: selectedSpecies,
      breed: selectedBreed,
    });
  };

  return (
    <div className="start-screen">
      <h1 className="start-title">Hye-mily</h1>
      <p className="start-subtitle">나만의 반려동물을 키워보세요!</p>

      {/* 스텝 인디케이터 */}
      <div className="step-indicator">
        <span className={`step-dot ${step === 'species' ? 'active' : ''} ${step !== 'species' ? 'done' : ''}`}>1</span>
        <span className="step-line" />
        <span className={`step-dot ${step === 'breed' ? 'active' : ''} ${step === 'name' ? 'done' : ''}`}>2</span>
        <span className="step-line" />
        <span className={`step-dot ${step === 'name' ? 'active' : ''}`}>3</span>
      </div>

      {/* ── STEP 1: 종 선택 ── */}
      {step === 'species' && (
        <div className="step-content">
          <h2 className="step-title">어떤 동물을 키울까요?</h2>
          <div className="species-grid">
            {speciesList.map((config) => (
              <button
                key={config.species}
                className="species-card"
                onClick={() => handleSpeciesSelect(config.species)}
              >
                <span className="species-emoji">{SPECIES_EMOJI[config.species]}</span>
                <span className="species-name">{config.displayName}</span>
                <span className="species-desc">{config.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: 품종 선택 ── */}
      {step === 'breed' && selectedSpecies && (
        <div className="step-content">
          <button className="back-button" onClick={handleBack}>← 돌아가기</button>
          <h2 className="step-title">
            {SPECIES_EMOJI[selectedSpecies]} 어떤 품종으로 할까요?
          </h2>
          <div className="breed-grid">
            {breeds.map((breed) => (
              <button
                key={breed.breedId}
                className="breed-card"
                onClick={() => handleBreedSelect(breed.breedId)}
              >
                <div className="breed-header">
                  <span className="breed-emoji">{breed.emoji}</span>
                  <span
                    className="breed-difficulty"
                    style={{ background: DIFFICULTY_COLOR[breed.difficulty] }}
                  >
                    {DIFFICULTY_LABEL[breed.difficulty]}
                  </span>
                </div>
                <span className="breed-name">{breed.displayName}</span>
                <span className="breed-desc">{breed.description}</span>
                <div className="breed-modifiers">
                  {Object.entries(breed.statModifiers).map(([key, val]) => (
                    <span
                      key={key}
                      className={`modifier-tag ${val > 0 ? 'positive' : 'negative'}`}
                    >
                      {statLabel(key)} {val > 0 ? `+${val}` : val}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: 이름 입력 ── */}
      {step === 'name' && selectedBreedConfig && (
        <div className="step-content">
          <button className="back-button" onClick={handleBack}>← 돌아가기</button>
          <h2 className="step-title">이름을 지어주세요!</h2>

          <div className="name-preview">
            <span className="preview-emoji">{selectedBreedConfig.emoji}</span>
            <span className="preview-breed">{selectedBreedConfig.displayName}</span>
          </div>

          <div className="name-input-group">
            <input
              id="pet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="반려동물 이름 (최대 10자)"
              maxLength={10}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
          </div>

          <button
            className="start-button"
            onClick={handleStart}
            disabled={!name.trim()}
          >
            시작하기
          </button>
        </div>
      )}
    </div>
  );
}

/** 스탯 키를 한글 라벨로 변환 */
function statLabel(key: string): string {
  const map: Record<string, string> = {
    hunger: '배고픔',
    happiness: '행복',
    energy: '에너지',
    cleanliness: '청결',
    health: '건강',
  };
  return map[key] ?? key;
}
