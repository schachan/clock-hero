import { useCallback, useMemo, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { DEFAULT_AGE, MAX_AGE } from "./constants/scoring";
import { LEVELS } from "./constants/levels";
import { Game } from "./components/Game";
import { LevelCompleteScreen } from "./components/LevelCompleteScreen";
import { LevelMapScreen } from "./components/LevelMapScreen";
import { StartScreen } from "./components/StartScreen";
import { WinScreen } from "./components/WinScreen";
import {
  paths,
  type LevelCompleteLocationState,
  type WinLocationState,
} from "./routes/paths";
import type { HistoryEntry, LevelProgressMap, PlayerProgress } from "./types";
import { initAudio } from "./utils/audio";
import {
  defaultLevelProgress,
  defaultPlayerProgress,
  ensureAgeTier,
  loadPlayerProgress,
  loadPlayerAge,
  loadPlayerName,
  resetAllStorage,
  savePlayerProgress,
  savePlayerAge,
  savePlayerName,
  syncPlayerProgress,
} from "./utils/storage";
import "./App.css";

function parseLevelIndex(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const levelIndex = Number.parseInt(raw, 10);
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= LEVELS.length) {
    return null;
  }
  return levelIndex;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelIndex: levelIndexParam } = useParams<{ levelIndex: string }>();

  const [playerName, setPlayerName] = useState(loadPlayerName);
  const [playerAge, setPlayerAge] = useState(loadPlayerAge);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(() =>
    loadPlayerProgress(loadPlayerName(), loadPlayerAge()),
  );
  const [gameKey, setGameKey] = useState(0);

  const appRef = useRef<HTMLDivElement>(null);
  const playerProgressRef = useRef(playerProgress);
  playerProgressRef.current = playerProgress;

  const trimmedName = playerName.trim().slice(0, 14);
  const challengeAge = playerProgress.activeChallengeAge;
  const selectedLevel = parseLevelIndex(levelIndexParam);

  const activeLevelProgress = useMemo(
    () => playerProgress.byAge[challengeAge] ?? defaultLevelProgress(),
    [playerProgress, challengeAge],
  );

  const levelCompleteState = location.state as LevelCompleteLocationState | null;
  const winState = location.state as WinLocationState | null;

  const isStart = location.pathname === paths.start;
  const isGame = location.pathname.startsWith("/game/");

  const persistPlayerProgress = useCallback(
    (progress: PlayerProgress) => {
      setPlayerProgress(progress);
      savePlayerProgress(trimmedName, progress);
    },
    [trimmedName],
  );

  const updateActiveTierProgress = useCallback(
    (levelMap: LevelProgressMap) => {
      const current = playerProgressRef.current;
      const age = current.activeChallengeAge;
      persistPlayerProgress({
        ...current,
        byAge: { ...current.byAge, [age]: levelMap },
      });
    },
    [persistPlayerProgress],
  );

  const startGame = useCallback(() => {
    const name = trimmedName;
    setPlayerName(name);
    savePlayerName(name);
    savePlayerAge(playerAge);
    const loaded = loadPlayerProgress(name, playerAge);
    const synced = syncPlayerProgress(loaded, playerAge);
    persistPlayerProgress(synced);
    initAudio();
    navigate(paths.levels);
  }, [navigate, persistPlayerProgress, playerAge, trimmedName]);

  const selectChallengeAge = useCallback(
    (age: number) => {
      const current = playerProgressRef.current;
      if (age < current.registeredAge || age > current.maxUnlockedAge) return;
      const next: PlayerProgress = {
        ...current,
        activeChallengeAge: age,
      };
      ensureAgeTier(next, age);
      persistPlayerProgress(next);
    },
    [persistPlayerProgress],
  );

  const selectLevel = useCallback(
    (levelIndex: number) => {
      const current = playerProgressRef.current;
      const age = current.activeChallengeAge;
      const tier = { ...(current.byAge[age] ?? ensureAgeTier(current, age)) };
      tier[levelIndex] = {
        ...tier[levelIndex],
        correct: 0,
        wrong: 0,
        score: 0,
      };
      persistPlayerProgress({
        ...current,
        byAge: { ...current.byAge, [age]: tier },
      });
      setGameKey((k) => k + 1);
      navigate(paths.game(levelIndex));
    },
    [navigate, persistPlayerProgress],
  );

  const handleProgressChange = useCallback(
    (stats: { correct: number; wrong: number; score: number; levelIndex: number }) => {
      const current = playerProgressRef.current;
      const age = current.activeChallengeAge;
      const tier = { ...(current.byAge[age] ?? ensureAgeTier(current, age)) };
      tier[stats.levelIndex] = {
        ...tier[stats.levelIndex],
        correct: stats.correct,
        wrong: stats.wrong,
        score: stats.score,
      };
      updateActiveTierProgress(tier);
    },
    [updateActiveTierProgress],
  );

  const handleLevelComplete = useCallback(
    (stats: { correct: number; wrong: number; levelIndex: number }) => {
      const current = playerProgressRef.current;
      const age = current.activeChallengeAge;
      const tier = { ...(current.byAge[age] ?? ensureAgeTier(current, age)) };
      tier[stats.levelIndex] = {
        ...tier[stats.levelIndex],
        correct: stats.correct,
        wrong: stats.wrong,
        completed: true,
      };
      const nextIndex = stats.levelIndex + 1;
      if (nextIndex < LEVELS.length && tier[nextIndex]) {
        tier[nextIndex] = { ...tier[nextIndex], unlocked: true };
      }
      persistPlayerProgress({
        ...current,
        byAge: { ...current.byAge, [age]: tier },
      });
      navigate(paths.levelComplete, { state: stats });
    },
    [navigate, persistPlayerProgress],
  );

  const handleWin = useCallback(
    (stats: {
      accuracy: number;
      avgSpeed: number;
      totalQuestions: number;
      correct: number;
      wrong: number;
      levelIndex: number;
    }) => {
      const current = playerProgressRef.current;
      const age = current.activeChallengeAge;
      const tier = { ...(current.byAge[age] ?? ensureAgeTier(current, age)) };
      tier[stats.levelIndex] = {
        ...tier[stats.levelIndex],
        completed: true,
        correct: stats.correct,
        wrong: stats.wrong,
      };

      let nextProgress: PlayerProgress = {
        ...current,
        byAge: { ...current.byAge, [age]: tier },
      };
      let unlockedNextAge = false;
      let nextAge = 0;

      if (age < MAX_AGE) {
        nextAge = age + 1;
        const isNewUnlock = nextAge > current.maxUnlockedAge;
        nextProgress = {
          ...nextProgress,
          maxUnlockedAge: Math.max(nextProgress.maxUnlockedAge, nextAge),
        };
        ensureAgeTier(nextProgress, nextAge);
        if (isNewUnlock) {
          unlockedNextAge = true;
          nextProgress.activeChallengeAge = nextAge;
        }
      }

      persistPlayerProgress(nextProgress);
      navigate(paths.win, {
        state: {
          accuracy: stats.accuracy,
          avgSpeed: stats.avgSpeed,
          totalQuestions: stats.totalQuestions,
          unlockedNextAge,
          nextAge,
        },
      });
    },
    [navigate, persistPlayerProgress],
  );

  const backToMap = useCallback(() => {
    navigate(paths.levels);
  }, [navigate]);

  const playAgain = useCallback(() => {
    const loaded = loadPlayerProgress(trimmedName, playerAge);
    setPlayerProgress(syncPlayerProgress(loaded, playerAge));
    navigate(paths.levels);
  }, [navigate, trimmedName, playerAge]);

  const resetProgress = useCallback(() => {
    const confirmed = window.confirm(
      "Reset all saved progress? This clears your name, age, level progress, and history.",
    );
    if (!confirmed) return;

    resetAllStorage();
    setPlayerName("");
    setPlayerAge(DEFAULT_AGE);
    setHistory([]);
    setPlayerProgress(defaultPlayerProgress(DEFAULT_AGE));
    navigate(paths.start);
  }, [navigate]);

  const isLevelUnlocked =
    selectedLevel !== null &&
    (activeLevelProgress[selectedLevel]?.unlocked ?? selectedLevel === 0);

  return (
    <div
      className={`app${isStart ? " app--start" : " app--fill"}${isGame ? " app--game" : ""}`}
      ref={appRef}
    >
      <Routes>
        <Route
          path={paths.start}
          element={
            <StartScreen
              name={playerName}
              age={playerAge}
              onNameChange={setPlayerName}
              onAgeChange={setPlayerAge}
              onStart={startGame}
              onReset={resetProgress}
            />
          }
        />

        <Route
          path={paths.levels}
          element={
            <LevelMapScreen
              playerName={trimmedName}
              registeredAge={playerProgress.registeredAge}
              challengeAge={challengeAge}
              maxUnlockedAge={playerProgress.maxUnlockedAge}
              levelProgress={activeLevelProgress}
              onSelectChallengeAge={selectChallengeAge}
              onSelectLevel={selectLevel}
              onReset={resetProgress}
            />
          }
        />

        <Route
          path={paths.gamePattern}
          element={
            selectedLevel === null || !isLevelUnlocked ? (
              <Navigate to={paths.levels} replace />
            ) : (
              <Game
                key={gameKey}
                playerName={trimmedName}
                playerAge={challengeAge}
                levelIndex={selectedLevel}
                history={history}
                onHistoryChange={setHistory}
                onLevelComplete={handleLevelComplete}
                onWin={handleWin}
                onProgressChange={handleProgressChange}
                onBackToMap={backToMap}
                appRef={appRef}
              />
            )
          }
        />

        <Route
          path={paths.levelComplete}
          element={
            levelCompleteState ? (
              <LevelCompleteScreen
                playerName={trimmedName}
                levelIndex={levelCompleteState.levelIndex}
                correct={levelCompleteState.correct}
                wrong={levelCompleteState.wrong}
                onBackToMap={backToMap}
              />
            ) : (
              <Navigate to={paths.levels} replace />
            )
          }
        />

        <Route
          path={paths.win}
          element={
            winState ? (
              <WinScreen
                playerName={trimmedName}
                accuracy={winState.accuracy}
                avgSpeed={winState.avgSpeed}
                totalQuestions={winState.totalQuestions}
                unlockedNextAge={winState.unlockedNextAge}
                nextAge={winState.nextAge}
                onPlayAgain={playAgain}
              />
            ) : (
              <Navigate to={paths.levels} replace />
            )
          }
        />

        <Route path="*" element={<Navigate to={paths.start} replace />} />
      </Routes>
    </div>
  );
}
