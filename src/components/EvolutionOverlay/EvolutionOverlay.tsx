import { useEffect, useState } from 'react';
import { STAGE_LABELS } from '../../constants';
import './EvolutionOverlay.css';

interface EvolutionOverlayProps {
  petName: string;
  from: string;
  to: string;
  onClose: () => void;
}

export default function EvolutionOverlay({
  petName,
  from,
  to,
  onClose,
}: EvolutionOverlayProps) {
  const [phase, setPhase] = useState<'glow' | 'reveal' | 'done'>('glow');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1200);
    const t2 = setTimeout(() => setPhase('done'), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="evolution-overlay" onClick={phase === 'done' ? onClose : undefined}>
      <div className={`evolution-content phase-${phase}`}>
        {phase === 'glow' && (
          <>
            <div className="evolution-sparkle">✨</div>
            <p className="evolution-text">무언가 일어나고 있어요...</p>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <div className="evolution-icon">🎉</div>
            <h2 className="evolution-title">진화 성공!</h2>
            <p className="evolution-detail">
              {petName}(이)가{' '}
              <strong>{STAGE_LABELS[from] ?? from}</strong>에서{' '}
              <strong>{STAGE_LABELS[to] ?? to}</strong>(으)로 성장했어요!
            </p>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="evolution-icon">🎉</div>
            <h2 className="evolution-title">진화 성공!</h2>
            <p className="evolution-detail">
              {petName}(이)가{' '}
              <strong>{STAGE_LABELS[from] ?? from}</strong>에서{' '}
              <strong>{STAGE_LABELS[to] ?? to}</strong>(으)로 성장했어요!
            </p>
            <button className="evolution-close-btn" onClick={onClose}>
              확인
            </button>
          </>
        )}
      </div>
    </div>
  );
}
