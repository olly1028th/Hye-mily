import { useCallback, useRef } from 'react';

/**
 * Web Audio API 기반 효과음 시스템.
 * 외부 오디오 파일 없이 프로그래밍 방식으로 사운드를 생성합니다.
 */

type SoundType =
  | 'feed'
  | 'play'
  | 'clean'
  | 'sleep'
  | 'heal'
  | 'evolution'
  | 'event'
  | 'gameover'
  | 'click';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** 간단한 톤 재생 헬퍼 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;

  // 페이드 아웃
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** 사운드 타입별 생성 함수 */
const SOUND_GENERATORS: Record<SoundType, (ctx: AudioContext) => void> = {
  feed(ctx) {
    // 먹는 소리: 짧고 귀여운 2연타
    playTone(ctx, 440, 0.1, 'square', 0.1);
    playTone(ctx, 520, 0.1, 'square', 0.1, 0.12);
  },
  play(ctx) {
    // 놀기: 경쾌한 상승 음계
    playTone(ctx, 523, 0.1, 'triangle', 0.12);
    playTone(ctx, 659, 0.1, 'triangle', 0.12, 0.1);
    playTone(ctx, 784, 0.15, 'triangle', 0.12, 0.2);
  },
  clean(ctx) {
    // 물 소리: 부드러운 하이 피치
    playTone(ctx, 800, 0.15, 'sine', 0.08);
    playTone(ctx, 1000, 0.12, 'sine', 0.06, 0.1);
    playTone(ctx, 700, 0.1, 'sine', 0.06, 0.2);
  },
  sleep(ctx) {
    // 잠자기: 느린 하강
    playTone(ctx, 392, 0.3, 'sine', 0.08);
    playTone(ctx, 330, 0.3, 'sine', 0.06, 0.3);
    playTone(ctx, 262, 0.5, 'sine', 0.04, 0.6);
  },
  heal(ctx) {
    // 치료: 반짝이는 효과
    playTone(ctx, 660, 0.15, 'sine', 0.1);
    playTone(ctx, 880, 0.15, 'sine', 0.1, 0.15);
    playTone(ctx, 1100, 0.2, 'sine', 0.08, 0.3);
  },
  evolution(ctx) {
    // 진화: 화려한 팡파르
    playTone(ctx, 523, 0.15, 'triangle', 0.12);
    playTone(ctx, 659, 0.15, 'triangle', 0.12, 0.15);
    playTone(ctx, 784, 0.15, 'triangle', 0.12, 0.3);
    playTone(ctx, 1047, 0.4, 'triangle', 0.15, 0.45);
  },
  event(ctx) {
    // 이벤트 알림: 짧은 벨
    playTone(ctx, 880, 0.1, 'sine', 0.1);
    playTone(ctx, 1100, 0.15, 'sine', 0.08, 0.1);
  },
  gameover(ctx) {
    // 게임오버: 무거운 하강
    playTone(ctx, 330, 0.3, 'sawtooth', 0.08);
    playTone(ctx, 262, 0.3, 'sawtooth', 0.06, 0.3);
    playTone(ctx, 196, 0.5, 'sawtooth', 0.05, 0.6);
  },
  click(ctx) {
    // UI 클릭: 아주 짧은 틱
    playTone(ctx, 600, 0.05, 'square', 0.06);
  },
};

export function useSound() {
  const enabledRef = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      SOUND_GENERATORS[sound](ctx);
    } catch {
      // AudioContext 미지원 환경 — 조용히 무시
    }
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return { play, toggle, isEnabled };
}
