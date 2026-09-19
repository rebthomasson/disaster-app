import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  useWindowDimensions,
  ImageBackground,
  Animated,
  Image,
  AppState,
} from 'react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Rect } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Player from '../entities/Player';
import TilePath from '../entities/TilePath';
import InventoryItem from '../entities/InventoryItem';
import { levels } from '../systems/levels';
import { completeGoal } from '../entities/preparednessTracker';

import TaskModal from '../screens/TaskModal';
import ItemModal from '../screens/ItemModal';
import QuizModal from '../screens/QuizModal';
import LevelComplete from '../screens/LevelComplete';
import GameOver from '../screens/GameOver';
import GoalModal from '../screens/GoalModal';
import MenuModal from '../screens/MenuModal';
import Victory from '../screens/VictoryModal';
import InstructionsModal from '../screens/InstructionsModal';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';

// Debounced autosave (single instance)
const saveGameDebounced = (() => {
  let timeout = null;
  return (state) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('GAME_STATE', JSON.stringify(state));
      } catch (e) {
        console.log('Error saving game state:', e);
      }
    }, 500);
  };
})();

export default function GameBoard() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#fff',
        },
      });
    };
  }, [navigation]);

  const boardHeight = Math.min(height * 0.45, 1000);
  const tile_size = Math.min(width * 0.18, 70);

  // Modal manager: only one modal at a time
  const [activeModal, setActiveModal] = useState(null);

  // Core game state
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = levels[levelIndex];

  if (!currentLevel || !currentLevel.background || !currentLevel.tintColor) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading level...</Text>
      </SafeAreaView>
    );
  }

  const [timeLeft, setTimeLeft] = useState(currentLevel.timeLimit);
  const [timerActive, setTimerActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const [completedTasks, setCompletedTasks] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(0);

  const [activeTask, setActiveTask] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [foundItem, setFoundItem] = useState(null);

  const [pathTiles, setPathTiles] = useState(currentLevel.pathTiles);
  if (!pathTiles || pathTiles.length === 0) {
    return (
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerText}>Loading map...</Text>
      </SafeAreaView>
    );
  }

  const [score, setScore] = useState(0);
  const [xp, setXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);

  const [alertMessage, setAlertMessage] = useState(null);
  const [levelingMessage, setLevelingMessage] = useState(null);

  const [showVictory, setShowVictory] = useState(false);

  const rainOpacity = useRef(new Animated.Value(0.3)).current;
  const [diceRoll, setDiceRoll] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const totalTasks = pathTiles.filter((tile) => tile.task).length;
  const maxX = Math.max(...pathTiles.map((t) => t.x)) + tile_size;
  const maxY = Math.max(...pathTiles.map((t) => t.y)) + tile_size;
  const lastTile = pathTiles.length - 1;

  const gamePaused = !!activeModal || isPaused;

  // Focus effect: pause when leaving
  useFocusEffect(
    useCallback(() => {
      setIsPaused(false);
      return () => {
        setIsPaused(true);
        const state = {
          levelIndex,
          playerPosition,
          inventory,
          completedTasks,
          score,
          xp,
          playerLevel,
          timeLeft,
          pathTiles,
        };
        saveGameDebounced(state);
      };
    }, [levelIndex, playerPosition, inventory, completedTasks, score, xp, playerLevel, timeLeft, pathTiles])
  );

  // Load saved game
  useEffect(() => {
    async function loadGame() {
      try {
        const saved = await AsyncStorage.getItem('GAME_STATE');
        if (saved) {
          const state = JSON.parse(saved);

          setLevelIndex(state.levelIndex);
          setPlayerPosition(state.playerPosition);
          setInventory(state.inventory);
          setCompletedTasks(state.completedTasks);
          setScore(state.score);
          setXP(state.xp);
          setPlayerLevel(state.playerLevel);
          setTimeLeft(state.timeLeft);
          setPathTiles(state.pathTiles);

          setActiveModal(null); // resume without intro
        } else {
          // first time: show instructions
          setActiveModal('instructions');
        }
      } catch (e) {
        console.log('Error loading game state: ', e);
      }
    }

    loadGame();
  }, []);

  // Debounced autosave on state changes
  useEffect(() => {
    const state = {
      levelIndex,
      playerPosition,
      inventory,
      completedTasks,
      score,
      xp,
      playerLevel,
      timeLeft,
      pathTiles,
    };
    saveGameDebounced(state);
  }, [levelIndex, playerPosition, inventory, completedTasks, score, xp, playerLevel, timeLeft, pathTiles]);

  // AppState save
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') {
        const state = {
          levelIndex,
          playerPosition,
          inventory,
          completedTasks,
          score,
          xp,
          playerLevel,
          timeLeft,
          pathTiles,
        };
        saveGameDebounced(state);
      }
    });
    return () => sub.remove();
  }, [levelIndex, playerPosition, inventory, completedTasks, score, xp, playerLevel, timeLeft, pathTiles]);

  // Alerts
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (levelingMessage) {
      const timer = setTimeout(() => setLevelingMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelingMessage]);

  // Rain animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rainOpacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rainOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rainOpacity]);

  // XP leveling
  useEffect(() => {
    const xpLeveling = playerLevel * 100;
    if (xp >= xpLeveling) {
      setPlayerLevel((prev) => {
        const newLevel = prev + 1;
        setLevelingMessage(`You leveled up! You are now a level ${newLevel} player.`);
        return newLevel;
      });
    }
  }, [xp, playerLevel]);

  // Timer
  useEffect(() => {
    if (gamePaused) {
      setTimerActive(false);
      return;
    }

    setTimerActive(true);
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePaused]);

  function handleTimeUp() {
    setTimerActive(false);
    setShowGameOver(true);
    setActiveModal('gameOver');
  }

  async function resetGame() {
    try {
      await AsyncStorage.removeItem('GAME_STATE');
    } catch (e) {
      console.log('Error resetting game state: ', e);
    }
  }

  function completeTask(taskId) {
    if (!completedTasks.includes(taskId)) {
      const updated = [...completedTasks, taskId];
      setCompletedTasks(updated);

      setScore((prev) => prev + currentLevel.scoring.taskCompleted);
      setXP((prev) => prev + 25);

      // if (playerPosition === lastTile && updated.length >= totalTasks) {
      //   setShowLevelComplete(true);
      //   setActiveModal('levelComplete');
      //   setXP((prev) => prev + 25);
      // }
    }
  }

  function animateDiceRoll() {
    if (isRolling || isPaused || activeModal) return;
    setIsRolling(true);

    let numberShuffle = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(numberShuffle);

      const finalRoll = Math.floor(Math.random() * 6) + 1;
      const actualTilesMoved = rollDice(finalRoll);

      setDiceRoll(actualTilesMoved);
      setIsRolling(false);
    }, 1000);
  }

  function rollDice(roll) {
    let newPosition = playerPosition;
    let triggered = false;
    let tilesMoved = 0;

    for (let i = 1; i <= roll; i++) {
      if (triggered) break;

      const nextIndex = newPosition + 1;
      if (nextIndex >= pathTiles.length) break;

      const tile = pathTiles[nextIndex];
      newPosition = nextIndex;
      tilesMoved++;

      if (tile.task) {
        setActiveTask(tile.task);
        setActiveModal('task');
        triggered = true;
        continue;
      }

      if (tile.item) {
        collectItem(tile.item, tile.id);
        triggered = true;
        continue;
      }

      if (tile.eventType && Math.random() < tile.eventChance) {
        triggerEvent(tile);
        triggered = true;
        break;
      }
    }

    setPlayerPosition(newPosition);

    if (newPosition === lastTile && completedTasks.length >= totalTasks) {
      setShowLevelComplete(true);
      setActiveModal('levelComplete');
      setScore((prev) => prev + currentLevel.scoring.finishReached);

      if (currentLevel.id === 'flood') completeGoal('floodTraining');
      if (currentLevel.id === 'wildfire') completeGoal('fireTraining');
      if (currentLevel.id === 'earthquake') completeGoal('earthquakeTraining');
    }

    return tilesMoved;
  }

  function triggerEvent(tile) {
    setAlertMessage(tile.message);
    setScore((prev) => prev + currentLevel.scoring.eventTriggered);
    setXP((prev) => prev + 25);

    if (tile.movementPenalty) {
      setPlayerPosition((prev) => Math.max(prev - tile.movementPenalty, 0));
    }
  }

  function goToNextLevel() {
    if (levelIndex === levels.length - 1) {
      setShowVictory(true);
      setActiveModal('victory');
      return;
    }

    const nextIndex = levelIndex + 1;

    setLevelIndex(nextIndex);
    setCompletedTasks([]);
    setShowLevelComplete(false);
    setPlayerPosition(0);
    setInventory([]);
    setPathTiles(levels[nextIndex].pathTiles);
    setTimeLeft(levels[nextIndex].timeLimit);
    setTimerActive(true);
    setXP((prev) => prev + currentLevel.xpReward);
    setActiveModal('goal');
    navigation.navigate('Home', { levelIndex: levelIndex + 1 });
  }

  function collectItem(item, tileId) {
    setInventory((prev) => [...prev, item]);

    const updatedTiles = pathTiles.map((tile) =>
      tile.id === tileId ? { ...tile, item: null } : tile
    );
    setPathTiles(updatedTiles);

    setFoundItem(item);
    setScore((prev) => prev + currentLevel.scoring.itemCollected);
    setActiveModal('item');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {alertMessage && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>⚠️ Alert </Text>
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        )}
        {levelingMessage && (
          <View style={styles.levelingContainer}>
            <Text style={styles.levelingText}>🎉 Congratulations </Text>
            <Text style={styles.levelingText}>{levelingMessage}</Text>
          </View>
        )}

        <ImageBackground source={currentLevel.background} style={{ flex: 1, backgroundColor: 'transparent' }} resizeMode="cover">
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: rainOpacity,
              pointerEvents: 'none',
            }}
          >
            <Image source={currentLevel.overlay} style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }} />
          </Animated.View>

          <View style={styles.header}>
            <Text style={styles.headerText}>{currentLevel.name}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedTasks.length / totalTasks) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedTasks.length} / {totalTasks} tasks completed{' '}
            </Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.headerItem}>⏳ {timeLeft} seconds</Text>
            <Text style={styles.headerItem}>Score: {score} </Text>
            <Text style={styles.headerItem}>XP: {xp} </Text>
            <Text style={styles.headerItem}>Danger Level: {playerLevel}</Text>
          </View>

          <View style={styles.boardContainer}>
            <Svg
              width={width}
              height={boardHeight}
              viewBox={`0 0 ${maxX} ${maxY}`}
              pointerEvents="box-none"
              style={{ position: 'relative' }}
            >
              <Rect x={0} y={0} width={maxX} height={maxY} fill={currentLevel.tintColor} />
              <TilePath tile_size={tile_size} pathTiles={pathTiles} playerPosition={playerPosition} />
              <Player
                x={pathTiles[playerPosition].x}
                y={pathTiles[playerPosition].y}
                tile_size={tile_size}
                style={{ zIndex: 999 }}
              />
              {pathTiles.map(
                (tile) =>
                  tile.item && (
                    <InventoryItem
                      key={tile.item.id}
                      x={tile.x}
                      y={tile.y}
                      tile_size={tile_size}
                      icon={tile.item.icon}
                      onPress={() => collectItem(tile.item, tile.id)}
                    />
                  )
              )}
            </Svg>
          </View>

          <View style={styles.bottomContainer}>
            <Text style={styles.inventoryHeaderText}>Inventory</Text>
            <View style={styles.inventorySection}>
              {inventory.map((item) => (
                <View key={item.id} style={styles.inventorySlot}>
                  <Text style={styles.inventoryText}>
                    {item.icon} {item.name}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.diceContainer}>
              <Text style={{ 
                fontSize: 40,
                fontFamily: theme.fonts.bold,
                color: theme.colors.surface, 
              }}>
                {isRolling ? `🎲 🎲 🎲 ${diceRoll}` : `🎲 ${diceRoll}`}
              </Text>
              <Button title="🎲 Roll" onPress={animateDiceRoll} disabled={isRolling} />
            </View>
          </View>

          <IconButton
            icon="menu"
            size={25}
            mode="contained"
            style={{
                position: 'absolute',
                top: theme.spacing.s,
                right: theme.spacing.s,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.m,
                elevation: 4,
            }}
            iconColor={theme.colors.primary}
            onPress={() => {
              setActiveModal('menu');
              setIsPaused(true);
            }}
          />

          {/* MODAL MANAGER */}
          {activeModal === 'instructions' && (
            <InstructionsModal visible={true} onClose={() => setActiveModal('goal')} />
          )}

          {activeModal === 'task' && (
            <TaskModal
              visible={true}
              task={activeTask}
              onClose={() => {
                setActiveModal(null);
                if (!activeTask.quiz) {
                  completeTask(activeTask.id);
                }
              }}
              onStartQuiz={(quiz) => {
                setActiveQuiz(quiz);
                setActiveModal('quiz');
              }}
            />
          )}

          {activeModal === 'quiz' && (
            <QuizModal
              visible={true}
              quiz={activeQuiz}
              onClose={() => setActiveModal(null)}
              onDone={(passed) => {
                if (passed) {
                  completeTask(activeTask.id);
                }
                setActiveModal(null);
              }}
            />
          )}

          {activeModal === 'item' && (
            <ItemModal
              item={foundItem}
              onClose={() => {
                setFoundItem(null);
                setActiveModal(null);
              }}
            />
          )}

          {activeModal === 'goal' && (
            <GoalModal
              visible={true}
              level={currentLevel}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'levelComplete' && (
            <LevelComplete
              visible={true}
              goToNextLevel={goToNextLevel}
              levelScore={score}
              xpGained={xp}
              navigation={navigation}
            />
          )}

          {activeModal === 'gameOver' && (
            <GameOver
              visible={true}
              startOver={() => {
                setLevelIndex(0);
                setPlayerPosition(0);
                setInventory([]);
                setCompletedTasks([]);
                setScore(0);
                setXP(0);
                setTimeLeft(levels[0].timeLimit);
                setPathTiles(levels[0].pathTiles);
                setShowGameOver(false);
                setActiveModal('goal');
              }}
              navigation={navigation}
            />
          )}

          {activeModal === 'victory' && (
            <Victory
              visible={true}
              startOver={async () => {
                await resetGame();
                setLevelIndex(0);
                setPlayerPosition(0);
                setInventory([]);
                setCompletedTasks([]);
                setScore(0);
                setXP(0);
                setTimeLeft(levels[0].timeLimit);
                setPathTiles(levels[0].pathTiles);
                setShowVictory(false);
                setActiveModal('instructions');
              }}
              navigation={navigation}
              levelScore={score}
              xpGained={xp}
            />
          )}

          {activeModal === 'menu' && (
            <MenuModal
              visible={true}
              onDismiss={() => {
                setActiveModal(null);
                setIsPaused(false);
              }}
              navigation={navigation}
              setLevelIndex={setLevelIndex}
              setPlayerPosition={setPlayerPosition}
              setInventory={setInventory}
              setCompletedTasks={setCompletedTasks}
              setScore={setScore}
              setXP={setXP}
              setTimeLeft={setTimeLeft}
              setPathTiles={setPathTiles}
              resetPreparedness={async () => {
                await AsyncStorage.removeItem('completedGoals');
              }}
              levels={levels}
            />
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    },
  headerItem: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.accent,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#3D3D3D',
  },
  progressBar: {
    width: '100%',
    height: 15,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.m,
    overflow: 'hidden',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  scoreText: {
    marginTop: 8,
    fontSize: 12,
    color: '#3D3D3D',
  },
  xpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#3D3D3D',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.border
  },
  bottomContainer: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  inventorySection: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTopWidth: 2,
    borderColor: theme.colors.border,
  },
  inventorySlot: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.radius.m,
    margin: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  elevation: 2,
  },
  inventoryText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  inventoryHeaderText: {
    width: '100%',
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    textAlign: 'center',
    color: theme.colors.primary,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  diceContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.s,
    backgroundColor: 'rgba(160, 178, 193, 0.6)',
    padding: theme.spacing.l,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  alertContainer: {
    position: 'absolute',
    top: '30%',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 0, 0.9)',
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  levelingContainer: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(175, 212, 177, 0.9)',
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b7daa1',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  levelingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f5f6f3',
  },
});
