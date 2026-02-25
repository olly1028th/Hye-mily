import { GameProvider, useGameContext } from './context/GameContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import StartScreen from './components/StartScreen/StartScreen';
import GameScreen from './components/GameScreen/GameScreen';

function AppContent() {
  const { state } = useGameContext();

  if (state.view === 'start') {
    return <StartScreen />;
  }

  return <GameScreen />;
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
