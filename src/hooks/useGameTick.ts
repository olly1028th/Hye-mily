import { useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { processTick, rollRandomEvent } from '../utils/gameLogic';

/**
 * 게임 틱을 관리하는 커스텀 훅.
 * 일정 간격마다 스탯을 감소시키고 랜덤 이벤트를 체크합니다.
 */
export function useGameTick(onEvent?: (message: string) => void) {
  const { state, dispatch } = useGameContext();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.view !== 'playing' || state.isPaused || !state.pet) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      if (!state.pet || !state.pet.isAlive) return;

      // 스탯 자연 감소
      let updatedPet = processTick(state.pet);

      // 랜덤 이벤트 (10틱마다 체크)
      if (updatedPet.age % 10 === 0) {
        const eventResult = rollRandomEvent(updatedPet);
        if (eventResult) {
          updatedPet = eventResult.pet;
          onEvent?.(eventResult.event.message);
        }
      }

      dispatch({ type: 'TICK', pet: updatedPet });
    }, state.tickInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.view, state.isPaused, state.pet, state.tickInterval, dispatch, onEvent]);
}
