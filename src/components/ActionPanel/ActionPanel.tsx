import { useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import { ACTIONS } from '../../constants';
import type { ActionType } from '../../types';
import './ActionPanel.css';

interface ActionPanelProps {
  onActionSound?: (sound: string) => void;
  /** "놀기" 버튼 클릭 시 미니게임 실행 */
  onPlayAction?: () => void;
}

export default function ActionPanel({ onActionSound, onPlayAction }: ActionPanelProps) {
  const { state, dispatch } = useGameContext();
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = useCallback(
    (actionType: ActionType) => {
      if (cooldowns[actionType]) return;

      // "놀기"는 미니게임으로 대체
      if (actionType === 'play' && onPlayAction) {
        onPlayAction();
        return;
      }

      dispatch({ type: 'PERFORM_ACTION', actionType });
      onActionSound?.(actionType);

      // 액션 애니메이션 트리거
      setActiveAction(actionType);
      setTimeout(() => setActiveAction(null), 400);

      // 쿨다운 시작
      const action = ACTIONS[actionType];
      setCooldowns((prev) => ({ ...prev, [actionType]: true }));
      setTimeout(() => {
        setCooldowns((prev) => ({ ...prev, [actionType]: false }));
      }, action.cooldown);
    },
    [cooldowns, dispatch, onActionSound, onPlayAction]
  );

  if (!state.pet || !state.pet.isAlive) return null;

  return (
    <div className="action-panel">
      {Object.values(ACTIONS).map((action) => (
        <button
          key={action.type}
          className={`action-button ${cooldowns[action.type] ? 'on-cooldown' : ''} ${activeAction === action.type ? 'action-pop' : ''}`}
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
