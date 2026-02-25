import { useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useGameTick } from '../../hooks/useGameTick';
import PetDisplay from '../Pet/PetDisplay';
import StatusBar from '../StatusBar/StatusBar';
import ActionPanel from '../ActionPanel/ActionPanel';
import './GameScreen.css';

export default function GameScreen() {
  const { state, dispatch } = useGameContext();
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  const handleEvent = useCallback((message: string) => {
    setEventMessage(message);
    setTimeout(() => setEventMessage(null), 3000);
  }, []);

  useGameTick(handleEvent);

  if (!state.pet) return null;

  // 게임오버 화면
  if (state.view === 'gameover') {
    return (
      <div className="game-screen gameover">
        <h2>게임 오버</h2>
        <p>{state.pet.name}(이)가 더 이상 함께할 수 없어요...</p>
        <p className="gameover-age">
          함께한 시간: {state.pet.age} 틱
        </p>
        <button
          className="restart-button"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          다시 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      {/* 이벤트 알림 */}
      {eventMessage && (
        <div className="event-toast">{eventMessage}</div>
      )}

      {/* 일시정지 버튼 */}
      <button
        className="pause-button"
        onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
      >
        {state.isPaused ? '▶ 계속' : '⏸ 일시정지'}
      </button>

      <PetDisplay />
      <StatusBar />
      <ActionPanel />
    </div>
  );
}
