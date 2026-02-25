import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useGameTick } from '../../hooks/useGameTick';
import { useSound } from '../../hooks/useSound';
import {
  loadProgress,
  saveProgress,
  checkAchievements,
  addPetRecord,
} from '../../utils/progress';
import type { UserProgress } from '../../types';
import PetDisplay from '../Pet/PetDisplay';
import StatusBar from '../StatusBar/StatusBar';
import ActionPanel from '../ActionPanel/ActionPanel';
import EventLog from '../EventLog/EventLog';
import EvolutionOverlay from '../EvolutionOverlay/EvolutionOverlay';
import CatchGame from '../MiniGame/CatchGame';
import Collection from '../Collection/Collection';
import './GameScreen.css';

export default function GameScreen() {
  const { state, dispatch } = useGameContext();
  const { play, toggle } = useSound();
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showEventLog, setShowEventLog] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

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
      // 진화 카운트 증가
      setProgress((prev) => {
        const updated = { ...prev, totalEvolutions: prev.totalEvolutions + 1 };
        saveProgress(updated);
        return updated;
      });
    }
    prevStageRef.current = curStage;
  }, [state.pet?.stage, play]);

  // 업적 체크 (주기적)
  useEffect(() => {
    const newlyUnlocked = checkAchievements(progress, state.pet);
    if (newlyUnlocked.length > 0) {
      const updated = {
        ...progress,
        unlockedAchievements: [...progress.unlockedAchievements, ...newlyUnlocked],
      };
      setProgress(updated);
      saveProgress(updated);
      // 첫 번째 새 업적 알림
      dispatch({ type: 'ADD_EVENT', message: `업적 해금: ${newlyUnlocked[0]}!` });
      play('event');
    }
  }, [progress.totalActionsPerformed, progress.totalEvolutions, progress.totalPetsRaised, state.pet?.age]);

  // 게임오버 시 도감에 기록
  const gameoverRecordedRef = useRef(false);
  useEffect(() => {
    if (state.view === 'gameover' && state.pet && !gameoverRecordedRef.current) {
      gameoverRecordedRef.current = true;
      setProgress((prev) => {
        const updated = addPetRecord(prev, state.pet!);
        saveProgress(updated);
        return updated;
      });
    }
    if (state.view !== 'gameover') {
      gameoverRecordedRef.current = false;
    }
  }, [state.view, state.pet]);

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

  // 미니게임 완료
  const handleMiniGameComplete = useCallback((score: number) => {
    setShowMiniGame(false);
    dispatch({ type: 'PERFORM_ACTION', actionType: 'play' });
    play('play');
    setProgress((prev) => {
      const updated = {
        ...prev,
        totalMiniGamesPlayed: prev.totalMiniGamesPlayed + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
      };
      saveProgress(updated);
      return updated;
    });
    if (score >= 5) {
      dispatch({ type: 'ADD_EVENT', message: `미니게임에서 ${score}개를 잡아 추가 보상!` });
    }
  }, [dispatch, play]);

  // 액션 수행 시 카운트
  const handleActionSound = useCallback((sound: string) => {
    play(sound as Parameters<typeof play>[0]);
    setProgress((prev) => {
      const updated = { ...prev, totalActionsPerformed: prev.totalActionsPerformed + 1 };
      saveProgress(updated);
      return updated;
    });
  }, [play]);

  if (!state.pet) return null;

  const handleSoundToggle = () => {
    const enabled = toggle();
    setSoundOn(enabled);
  };

  const handlePlayAction = useCallback(() => {
    setShowMiniGame(true);
  }, []);

  // 첫 펫 기록 (START_GAME 시점)
  useEffect(() => {
    if (state.pet && progress.totalPetsRaised === 0) {
      setProgress((prev) => {
        const updated = { ...prev, totalPetsRaised: 1 };
        saveProgress(updated);
        return updated;
      });
    }
  }, [state.pet]);

  // 게임오버 화면
  if (state.view === 'gameover') {
    return (
      <div className="game-screen gameover">
        <h2>게임 오버</h2>
        <p>{state.pet.name}(이)가 더 이상 함께할 수 없어요...</p>
        <p className="gameover-age">
          함께한 시간: {state.pet.age} 틱
        </p>
        <div className="gameover-buttons">
          <button
            className="restart-button"
            onClick={() => dispatch({ type: 'RESET' })}
          >
            다시 시작하기
          </button>
          <button
            className="collection-button"
            onClick={() => setShowCollection(true)}
          >
            도감 보기
          </button>
        </div>
        {showCollection && (
          <Collection progress={progress} onClose={() => setShowCollection(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="game-screen">
      {eventMessage && (
        <div className="event-toast">{eventMessage}</div>
      )}

      {evolutionInfo && (
        <EvolutionOverlay
          petName={state.pet.name}
          from={evolutionInfo.from}
          to={evolutionInfo.to}
          onClose={() => setEvolutionInfo(null)}
        />
      )}

      {showMiniGame && (
        <CatchGame
          onComplete={handleMiniGameComplete}
          onCancel={() => setShowMiniGame(false)}
        />
      )}

      {showCollection && (
        <Collection progress={progress} onClose={() => setShowCollection(false)} />
      )}

      <div className="top-bar">
        <button
          className="icon-button"
          onClick={() => setShowCollection(true)}
          title="도감 & 업적"
        >
          📖
        </button>
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

      {showEventLog && (
        <EventLog
          entries={state.eventLog}
          onClose={() => setShowEventLog(false)}
        />
      )}

      <PetDisplay />
      <StatusBar />
      <ActionPanel onActionSound={handleActionSound} onPlayAction={handlePlayAction} />
    </div>
  );
}
