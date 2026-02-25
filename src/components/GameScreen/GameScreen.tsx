import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useGameTick } from '../../hooks/useGameTick';
import { useSound } from '../../hooks/useSound';
import PetDisplay from '../Pet/PetDisplay';
import StatusBar from '../StatusBar/StatusBar';
import ActionPanel from '../ActionPanel/ActionPanel';
import EventLog from '../EventLog/EventLog';
import EvolutionOverlay from '../EvolutionOverlay/EvolutionOverlay';
import './GameScreen.css';

export default function GameScreen() {
  const { state, dispatch } = useGameContext();
  const { play, toggle, isEnabled } = useSound();
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showEventLog, setShowEventLog] = useState(false);

  // 진화 감지
  const [evolutionInfo, setEvolutionInfo] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const prevStageRef = useRef(state.pet?.stage);

  useEffect(() => {
    if (!state.pet) return;
    const prevStage = prevStageRef.current;
    const curStage = state.pet.stage;

    if (prevStage && prevStage !== curStage) {
      setEvolutionInfo({ from: prevStage, to: curStage });
      play('evolution');
    }
    prevStageRef.current = curStage;
  }, [state.pet?.stage, play]);

  const handleEvent = useCallback((message: string) => {
    setEventMessage(message);
    play('event');
    dispatch({ type: 'ADD_EVENT', message });
    setTimeout(() => setEventMessage(null), 3000);
  }, [play, dispatch]);

  useGameTick(handleEvent);

  // 게임오버 사운드
  const gameoverPlayedRef = useRef(false);
  useEffect(() => {
    if (state.view === 'gameover' && !gameoverPlayedRef.current) {
      play('gameover');
      gameoverPlayedRef.current = true;
    }
    if (state.view !== 'gameover') {
      gameoverPlayedRef.current = false;
    }
  }, [state.view, play]);

  if (!state.pet) return null;

  const handleSoundToggle = () => {
    const enabled = toggle();
    setSoundOn(enabled);
  };

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
      {/* 이벤트 알림 토스트 */}
      {eventMessage && (
        <div className="event-toast">{eventMessage}</div>
      )}

      {/* 진화 연출 오버레이 */}
      {evolutionInfo && (
        <EvolutionOverlay
          petName={state.pet.name}
          from={evolutionInfo.from}
          to={evolutionInfo.to}
          onClose={() => setEvolutionInfo(null)}
        />
      )}

      {/* 상단 버튼 바 */}
      <div className="top-bar">
        <button
          className="icon-button"
          onClick={() => setShowEventLog(!showEventLog)}
          title="이벤트 로그"
        >
          {showEventLog ? '✕' : '📜'}
        </button>
        <button
          className="icon-button"
          onClick={handleSoundToggle}
          title={soundOn ? '소리 끄기' : '소리 켜기'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          className="icon-button"
          onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          title={state.isPaused ? '계속' : '일시정지'}
        >
          {state.isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* 이벤트 로그 패널 */}
      {showEventLog && (
        <EventLog
          entries={state.eventLog}
          onClose={() => setShowEventLog(false)}
        />
      )}

      <PetDisplay />
      <StatusBar />
      <ActionPanel onActionSound={play} />
    </div>
  );
}
