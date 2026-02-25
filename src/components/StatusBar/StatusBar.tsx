import { useGameContext } from '../../context/GameContext';
import './StatusBar.css';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

function StatBar({ label, value, color }: StatBarProps) {
  const isDanger = value < 20;

  return (
    <div className={`stat-bar ${isDanger ? 'danger' : ''}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{Math.round(value)}</span>
      </div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function StatusBar() {
  const { state } = useGameContext();
  const pet = state.pet;
  if (!pet) return null;

  return (
    <div className="status-bar">
      <StatBar label="배고픔" value={pet.stats.hunger} color="#e17055" />
      <StatBar label="행복도" value={pet.stats.happiness} color="#fdcb6e" />
      <StatBar label="에너지" value={pet.stats.energy} color="#00b894" />
      <StatBar label="청결도" value={pet.stats.cleanliness} color="#0984e3" />
      <StatBar label="건강" value={pet.stats.health} color="#d63031" />
    </div>
  );
}
