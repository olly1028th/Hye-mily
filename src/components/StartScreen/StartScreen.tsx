import { useState } from 'react';
import type { PetSpecies } from '../../types';
import { SPECIES_CONFIGS } from '../../constants';
import { useGameContext } from '../../context/GameContext';
import './StartScreen.css';

const speciesList = Object.values(SPECIES_CONFIGS);

export default function StartScreen() {
  const { dispatch } = useGameContext();
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(
    null
  );

  const handleStart = () => {
    if (!name.trim() || !selectedSpecies) return;
    dispatch({ type: 'START_GAME', name: name.trim(), species: selectedSpecies });
  };

  return (
    <div className="start-screen">
      <h1 className="start-title">Hye-mily</h1>
      <p className="start-subtitle">나만의 반려동물을 키워보세요!</p>

      <div className="name-input-group">
        <label htmlFor="pet-name">이름을 지어주세요</label>
        <input
          id="pet-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="반려동물 이름"
          maxLength={10}
        />
      </div>

      <div className="species-select">
        <p>어떤 친구를 키울까요?</p>
        <div className="species-grid">
          {speciesList.map((config) => (
            <button
              key={config.species}
              className={`species-card ${
                selectedSpecies === config.species ? 'selected' : ''
              }`}
              onClick={() => setSelectedSpecies(config.species)}
            >
              <span className="species-emoji">
                {config.species === 'cat' && '🐱'}
                {config.species === 'dog' && '🐶'}
                {config.species === 'lizard' && '🦎'}
                {config.species === 'hedgehog' && '🦔'}
              </span>
              <span className="species-name">{config.displayName}</span>
              <span className="species-desc">{config.description}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="start-button"
        onClick={handleStart}
        disabled={!name.trim() || !selectedSpecies}
      >
        시작하기
      </button>
    </div>
  );
}
