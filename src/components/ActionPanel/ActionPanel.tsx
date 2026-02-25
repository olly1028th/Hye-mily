import { useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import { ACTIONS } from '../../constants';
import type { ActionType } from '../../types';
import './ActionPanel.css';

export default function ActionPanel() {
  const { state, dispatch } = useGameContext();
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});

  const handleAction = useCallback(
    (actionType: ActionType) => {
      if (cooldowns[actionType]) return;

      dispatch({ type: 'PERFORM_ACTION', actionType });

      // 쿨다운 시작
      const action = ACTIONS[actionType];
      setCooldowns((prev) => ({ ...prev, [actionType]: true }));
      setTimeout(() => {
        setCooldowns((prev) => ({ ...prev, [actionType]: false }));
      }, action.cooldown);
    },
    [cooldowns, dispatch]
  );

  if (!state.pet || !state.pet.isAlive) return null;

  return (
    <div className="action-panel">
      {Object.values(ACTIONS).map((action) => (
        <button
          key={action.type}
          className={`action-button ${cooldowns[action.type] ? 'on-cooldown' : ''}`}
          onClick={() => handleAction(action.type)}
          disabled={cooldowns[action.type] || state.isPaused}
        >
          <span className="action-icon">{action.icon}</span>
          <span className="action-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
