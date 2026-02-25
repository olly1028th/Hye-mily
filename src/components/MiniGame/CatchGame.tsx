import { useState, useEffect, useCallback, useRef } from 'react';
import './MiniGame.css';

interface CatchGameProps {
  /** 게임 종료 시 점수를 받아서 보상으로 변환 */
  onComplete: (score: number) => void;
  onCancel: () => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  isGood: boolean;
}

const GOOD_ITEMS = ['🍖', '🎾', '🍎', '🧀', '🥕', '🍗'];
const BAD_ITEMS = ['💀', '🗑️'];
const GAME_DURATION = 10; // 초
const SPAWN_INTERVAL = 700; // ms

export default function CatchGame({ onComplete, onCancel }: CatchGameProps) {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(true);
  const nextIdRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  // 타이머
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 아이템 스폰
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      const isGood = Math.random() > 0.2; // 80% 좋은 아이템
      const pool = isGood ? GOOD_ITEMS : BAD_ITEMS;
      const newItem: FallingItem = {
        id: nextIdRef.current++,
        x: Math.random() * 80 + 10, // 10%~90% 범위
        y: -5,
        emoji: pool[Math.floor(Math.random() * pool.length)],
        speed: 1.5 + Math.random() * 1.5,
        isGood,
      };
      setItems((prev) => [...prev, newItem]);
    }, SPAWN_INTERVAL);
    return () => clearInterval(spawner);
  }, [isPlaying]);

  // 아이템 낙하 애니메이션
  useEffect(() => {
    if (!isPlaying) return;
    const frame = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => item.y < 105) // 화면 밖 제거
      );
    }, 50);
    return () => clearInterval(frame);
  }, [isPlaying]);

  // 아이템 클릭/탭
  const handleCatch = useCallback((item: FallingItem) => {
    if (!isPlaying) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (item.isGood) {
      setScore((s) => s + 1);
    } else {
      setScore((s) => Math.max(0, s - 2));
    }
  }, [isPlaying]);

  // 게임 종료 후 결과 표시
  if (!isPlaying) {
    return (
      <div className="minigame-overlay">
        <div className="minigame-result">
          <div className="minigame-result-icon">
            {score >= 8 ? '🏆' : score >= 5 ? '⭐' : '👍'}
          </div>
          <h3 className="minigame-result-title">게임 끝!</h3>
          <p className="minigame-result-score">
            잡은 개수: <strong>{score}</strong>
          </p>
          <p className="minigame-result-coins">
            💰 {score * 10} 코인 획득!
          </p>
          <p className="minigame-result-bonus">
            {score >= 8
              ? '대단해요! 최고 보너스!'
              : score >= 5
                ? '잘했어요! 추가 보너스!'
                : '좋아요!'}
          </p>
          <button
            className="minigame-btn"
            onClick={() => onComplete(score)}
          >
            보상 받기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="minigame-overlay">
      <div className="minigame-header">
        <span className="minigame-score">점수: {score}</span>
        <span className="minigame-timer">{timeLeft}초</span>
        <button className="minigame-cancel" onClick={onCancel}>
          ✕
        </button>
      </div>
      <div className="minigame-area" ref={areaRef}>
        <p className="minigame-instruction">간식을 잡아주세요!</p>
        {items.map((item) => (
          <button
            key={item.id}
            className={`falling-item ${item.isGood ? '' : 'bad-item'}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
            onClick={() => handleCatch(item)}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
