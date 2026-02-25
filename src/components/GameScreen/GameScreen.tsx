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
import StatsScreen from '../StatsScreen/StatsScreen';
import ShopScreen from '../ShopScreen/ShopScreen';
import GuideScreen from '../GuideScreen/GuideScreen';
import { ACTION_COIN_REWARD, MINIGAME_COIN_MULTIPLIER } from '../../constants';
import './GameScreen.css';

type TabId = 'home' | 'stats' | 'shop' | 'guide';

/** progress state를 갱신하고 localStorage에도 동기화 */
function updateAndSave(
  setter: React.Dispatch<React.SetStateAction<UserProgress>>,
  updater: (prev: UserProgress) => UserProgress,
) {
  setter((prev) => {
    const next = updater(prev);
    saveProgress(next);
    return next;
  });
}

export default function GameScreen() {
  const { state, dispatch } = useGameContext();
  const { play, toggle } = useSound();
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showEventLog, setShowEventLog] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // 초기 로드 시 첫 펫 카운트 보정
  const [progress, setProgress] = useState<UserProgress>(() => {
    const loaded = loadProgress();
    if (loaded.totalPetsRaised === 0) {
      const updated = { ...loaded, totalPetsRaised: 1 };
      saveProgress(updated);
      return updated;
    }
    return loaded;
  });

  // 진화 감지
  const [evolutionInfo, setEvolutionInfo] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const prevStageRef = useRef(state.pet?.stage);
  const gameoverRecordedRef = useRef(false);
  const gameoverPlayedRef = useRef(false);

  useEffect(() => {
    if (!state.pet) return;
    const prevStage = prevStageRef.current;
    const curStage = state.pet.stage;

    if (prevStage && prevStage !== curStage) {
      setEvolutionInfo({ from: prevStage, to: curStage });
      play('evolution');
      updateAndSave(setProgress, (prev) => ({
        ...prev,
        totalEvolutions: prev.totalEvolutions + 1,
      }));
    }
    prevStageRef.current = curStage;
  }, [state.pet, play]);

  // 업적 체크
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const cur = progressRef.current;
    const newlyUnlocked = checkAchievements(cur, state.pet);
    if (newlyUnlocked.length > 0) {
      const updated = {
        ...cur,
        unlockedAchievements: [...cur.unlockedAchievements, ...newlyUnlocked],
      };
      setProgress(updated);
      saveProgress(updated);
      dispatch({ type: 'ADD_EVENT', message: `업적 해금: ${newlyUnlocked[0]}!` });
      play('event');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.totalActionsPerformed, progress.totalEvolutions, progress.totalPetsRaised, state.pet?.age, dispatch, play]);

  // 게임오버 시 도감에 기록 (localStorage 동기화 only — setState 없음)
  useEffect(() => {
    if (state.view === 'gameover' && state.pet && !gameoverRecordedRef.current) {
      gameoverRecordedRef.current = true;
      const updated = addPetRecord(progressRef.current, state.pet);
      saveProgress(updated);
      // ref만 갱신하여 다음 렌더 시 반영 (재렌더 트리거 X)
      progressRef.current = updated;
    }
    if (state.view !== 'gameover') {
      gameoverRecordedRef.current = false;
    }
  }, [state.view, state.pet]);

  // 게임오버 → 도감 열 때 최신 progress를 state에 반영
  const openCollectionWithLatest = useCallback(() => {
    setProgress(progressRef.current);
    setShowCollection(true);
  }, []);

  const handleEvent = useCallback((message: string) => {
    setEventMessage(message);
    play('event');
    dispatch({ type: 'ADD_EVENT', message });
    setTimeout(() => setEventMessage(null), 3000);
  }, [play, dispatch]);

  useGameTick(handleEvent);

  // 게임오버 사운드
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

    // 코인 보상: 점수 × 배율
    const coinsEarned = score * MINIGAME_COIN_MULTIPLIER;
    if (coinsEarned > 0) {
      dispatch({ type: 'ADD_COINS', amount: coinsEarned });
    }

    updateAndSave(setProgress, (prev) => ({
      ...prev,
      totalMiniGamesPlayed: prev.totalMiniGamesPlayed + 1,
      totalActionsPerformed: prev.totalActionsPerformed + 1,
    }));

    dispatch({
      type: 'ADD_EVENT',
      message: `미니게임에서 ${score}개를 잡아 ${coinsEarned}코인 획득!`,
    });
  }, [dispatch, play]);

  // 액션 수행 시 카운트 + 코인 보상
  const handleActionSound = useCallback((sound: string) => {
    play(sound as Parameters<typeof play>[0]);
    updateAndSave(setProgress, (prev) => ({
      ...prev,
      totalActionsPerformed: prev.totalActionsPerformed + 1,
    }));
    // 액션 코인 보상
    const coinReward = ACTION_COIN_REWARD[sound] ?? 0;
    if (coinReward > 0) {
      dispatch({ type: 'ADD_COINS', amount: coinReward });
    }
  }, [play, dispatch]);

  const handleSoundToggle = useCallback(() => {
    const enabled = toggle();
    setSoundOn(enabled);
  }, [toggle]);

  const handlePlayAction = useCallback(() => {
    setShowMiniGame(true);
  }, []);

  // === 모든 훅이 위에서 선언된 뒤 early return ===
  if (!state.pet) return null;

  // 게임오버 화면 — 부드러운 이별
  if (state.view === 'gameover') {
    return (
      <div className="game-screen gameover">
        <div className="gameover-emoji">💫</div>
        <h2 className="gameover-title">{state.pet.name}(이)가 먼 여행을 떠났어요</h2>
        <p className="gameover-desc">
          건강이 0이 되면 반려동물은 새로운 모험을 찾아 떠나요.<br />
          하지만 함께한 추억은 영원히 남아있어요!
        </p>
        <p className="gameover-age">
          함께한 시간: {state.pet.age} 틱 · 모은 코인: {state.pet.coins}
        </p>
        <div className="gameover-buttons">
          <button
            className="restart-button"
            onClick={() => dispatch({ type: 'RESET' })}
          >
            새 친구 만나기
          </button>
          <button
            className="collection-button"
            onClick={openCollectionWithLatest}
          >
            추억 앨범
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

      {/* ── Stitch-style Header ── */}
      <header className="game-header">
        <div className="game-header-avatar">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>pets</span>
        </div>
        <div className="game-header-center">
          <h1 className="game-header-title">Hye-mily</h1>
          <div className="game-header-subtitle">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            <span>Cozy Mode</span>
          </div>
        </div>
        <button className="game-header-settings" onClick={handleSoundToggle} title={soundOn ? '소리 끄기' : '소리 켜기'}>
          <span className="material-symbols-outlined">{soundOn ? 'volume_up' : 'volume_off'}</span>
        </button>
      </header>

      {/* ── Top bar icons ── */}
      <div className="top-bar">
        <button className="icon-button" onClick={openCollectionWithLatest} title="도감 & 업적">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_stories</span>
        </button>
        <button className="icon-button" onClick={() => setShowEventLog(!showEventLog)} title="이벤트 로그">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{showEventLog ? 'close' : 'history'}</span>
        </button>
        <button className="icon-button" onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} title={state.isPaused ? '계속' : '일시정지'}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{state.isPaused ? 'play_arrow' : 'pause'}</span>
        </button>
      </div>

      {showEventLog && (
        <EventLog
          entries={state.eventLog}
          onClose={() => setShowEventLog(false)}
        />
      )}

      {/* ── Main content (tab-based) ── */}
      <div className="game-main">
        {activeTab === 'home' && (
          <>
            <PetDisplay />
            <StatusBar />
            <ActionPanel onActionSound={handleActionSound} onPlayAction={handlePlayAction} />
          </>
        )}

        {activeTab === 'stats' && <StatsScreen />}
        {activeTab === 'shop' && <ShopScreen />}
        {activeTab === 'guide' && <GuideScreen />}
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {([
            { id: 'home' as TabId, icon: 'home', label: 'Home' },
            { id: 'stats' as TabId, icon: 'bar_chart', label: 'Stats' },
            { id: 'shop' as TabId, icon: 'shopping_bag', label: 'Shop' },
            { id: 'guide' as TabId, icon: 'menu_book', label: 'Guide' },
          ]).map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
