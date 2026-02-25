import { useGameContext } from '../../context/GameContext';
import './StatusBar.css';

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  bgColor: string;
  barColor: string;
}

function StatBar({ label, value, icon, iconColor, bgColor, barColor }: StatBarProps) {
  const isDanger = value < 20;

  return (
    <div className={`stat-card ${isDanger ? 'danger' : ''}`}>
      <div className="stat-header">
        <div className="stat-icon-group">
          <div className="stat-icon-circle" style={{ background: bgColor }}>
            <span className="material-symbols-outlined stat-icon" style={{ color: iconColor }}>{icon}</span>
          </div>
          <span className="stat-label">{label}</span>
        </div>
        <span className="stat-value">{Math.round(value)} / 100</span>
      </div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ width: `${value}%`, background: barColor }}
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
      <StatBar
        label="배고픔" value={pet.stats.hunger}
        icon="restaurant" iconColor="#ca8a04" bgColor="var(--pastel-yellow)" barColor="var(--pastel-yellow)"
      />
      <StatBar
        label="행복도" value={pet.stats.happiness}
        icon="favorite" iconColor="var(--primary)" bgColor="var(--pastel-pink)" barColor="rgba(245, 61, 107, 0.4)"
      />
      <StatBar
        label="에너지" value={pet.stats.energy}
        icon="auto_awesome" iconColor="#059669" bgColor="var(--pastel-mint)" barColor="var(--pastel-mint)"
      />
      <StatBar
        label="청결도" value={pet.stats.cleanliness}
        icon="water_drop" iconColor="#0284c7" bgColor="#e0f2fe" barColor="#bae6fd"
      />
      <StatBar
        label="건강" value={pet.stats.health}
        icon="ecg_heart" iconColor="#dc2626" bgColor="#fee2e2" barColor="#fca5a5"
      />
    </div>
  );
}
