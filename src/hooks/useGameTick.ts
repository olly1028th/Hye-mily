import { useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { processTick, rollRandomEvent } from '../utils/gameLogic';
import type { Pet } from '../types';

/**
 * 게임 틱을 관리하는 커스텀 훅.
 * 일정 간격마다 스탯을 감소시키고 랜덤 이벤트를 체크합니다.
 *
 * useRef로 최신 pet/onEvent를 참조하여 stale closure 문제를 방지하고,
 * interval 재생성을 view/isPaused/tickInterval 변경 시에만 한정합니다.
 */
export function useGameTick(onEvent?: (message: string) => void) {
  const { state, dispatch } = useGameContext();

  // 최신 값을 ref로 보관 — interval 콜백에서 항상 최신 상태를 읽음
  const petRef = useRef<Pet | null>(state.pet);
  const onEventRef = useRef(onEvent);

  // effect 안에서 ref 갱신 (렌더 중 ref 접근 방지)
  useEffect(() => {
    petRef.current = state.pet;
  }, [state.pet]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // 안정적인 tick 핸들러 — deps 없이 ref만 참조
  const tick = useCallback(() => {
    const pet = petRef.current;
    if (!pet || !pet.isAlive) return;

    // 스탯 자연 감소
    let updatedPet = processTick(pet);

    // 랜덤 이벤트 (10틱마다 체크)
    if (updatedPet.age % 10 === 0) {
      const eventResult = rollRandomEvent(updatedPet);
      if (eventResult) {
        updatedPet = eventResult.pet;
        onEventRef.current?.(eventResult.event.message);
      }
    }

    dispatch({ type: 'TICK', pet: updatedPet });
  }, [dispatch]);

  useEffect(() => {
    // 게임 중이 아니거나 일시정지면 interval 해제
    if (state.view !== 'playing' || state.isPaused || !state.pet) {
      return;
    }

    const id = window.setInterval(tick, state.tickInterval);

    return () => {
      window.clearInterval(id);
    };
  }, [state.view, state.isPaused, state.tickInterval, tick, state.pet]);
}
