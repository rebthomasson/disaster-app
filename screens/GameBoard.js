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
//Game entity imports
import Player from '../entities/Player';
import TilePath from '../entities/TilePath';
import InventoryItem from '../entities/InventoryItem';
//Level data and goal tracker
import { levels } from '../systems/levels';
import { completeGoal } from '../entities/preparednessTracker';
//Modals for the Game
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
//Prevents excessive writes to AsyncStorage and app delays
//Saves 500ms after the last change
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

  //Hide the tab bar while on game screen
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

  //Board and tile sizing based on the screen dimensions
  const boardHeight = Math.min(height * 0.45, 1000);
  const tile_size = Math.min(width * 0.18, 70);

  // Modal manager - only opens and mounts one modal at a time
  const [activeModal, setActiveModal] = useState(null);

  // Level and Core game state
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = levels[levelIndex];

  //Early return if level data missing
  if (!currentLevel || !currentLevel.background || !currentLevel.tintColor) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading level...</Text>
      </SafeAreaView>
    );
  }

  //TImer and game pause state
  const [timeLeft, setTimeLeft] = useState(currentLevel.timeLimit);
  const [timerActive, setTimerActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  //Task and movement state
  const [completedTasks, setCompletedTasks] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(0);
  //Active interactions (task and quiz)
  const [activeTask, setActiveTask] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  //Level end states
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  //Inventory and item pick up
  const [inventory, setInventory] = useState([]);
  const [foundItem, setFoundItem] = useState(null);
  //Path tiles for movement
  const [pathTiles, setPathTiles] = useState(currentLevel.pathTiles);
  //Early return if map is missing
  if (!pathTiles || pathTiles.length === 0) {
    return (
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerText}>Loading map...</Text>
      </SafeAreaView>
    );
  }
  //State to store XP, leveling and scoring 
  const [score, setScore] = useState(0);
  const [xp, setXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  //Alerts in UI for leveling and blockers
  const [alertMessage, setAlertMessage] = useState(null);
  const [levelingMessage, setLevelingMessage] = useState(null);
  //Victory modal
  const [showVictory, setShowVictory] = useState(false);
  //Rain animation overlay for flood level
  const rainOpacity = useRef(new Animated.Value(0.3)).current;
  //Manages dice roll animation and state
  const [diceRoll, setDiceRoll] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  //Precomputed values for total tasks and viewbox for SVG
  const totalTasks = pathTiles.filter((tile) => tile.task).length;
  const maxX = Math.max(...pathTiles.map((t) => t.x)) + tile_size;
  const maxY = Math.max(...pathTiles.map((t) => t.y)) + tile_size;
  const lastTile = pathTiles.length - 1;
  //Controls when game is paused if a modal is open or manually paused
  const gamePaused = !!activeModal || isPaused;

  // Focus effect to pause game when navigating away
  //Saves the state on screen blur
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

  // Load saved game on mount
  useEffect(() => {
    async function loadGame() {
      try {
        const saved = await AsyncStorage.getItem('GAME_STATE');
        if (saved) {
          const state = JSON.parse(saved);
          //Restore all state values
          setLevelIndex(state.levelIndex);
          setPlayerPosition(state.playerPosition);
          setInventory(state.inventory);
          setCompletedTasks(state.completedTasks);
          setScore(state.score);
          setXP(state.xp);
          setPlayerLevel(state.playerLevel);
          setTimeLeft(state.timeLeft);
          setPathTiles(state.pathTiles);

          setActiveModal(null); // resume without intro (skips instructions if returning)
        } else {
          // If it's the first time, show instructions
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

  // AppState save when the app goes to the background
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

    useEffect(() => {
      AsyncStorage.setItem('levelIndex', levelIndex.toString());
    }, [levelIndex]);

  // Temporary alerts that appear in the UI, disappear after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  //Temporary alerts that appear in the UI, disappear after 3 seconds
  useEffect(() => {
    if (levelingMessage) {
      const timer = setTimeout(() => setLevelingMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelingMessage]);

  // Controls the rain animation loop
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

  // XP leveling system
  //Each level requires the playerLevel * 100 XP
  //Shows the temporary alert for leveling up
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

  // Manages the countdown timer effect
  //Pauses when the game is paused
  //Ends the level when the time reaches 0
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

  //Handles timer reaching zero
  function handleTimeUp() {
    setTimerActive(false);
    setShowGameOver(true);
    setActiveModal('gameOver');
  }
  //Resets the game state (clears saved game)
  async function resetGame() {
    try {
      await AsyncStorage.removeItem('GAME_STATE');
    } catch (e) {
      console.log('Error resetting game state: ', e);
    }
  }

  //Mark a task as completed
  //Adds score and XP
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

  //Dice roll animation to shuffle numbers visually, applies the final roll
  //to the movement
  function animateDiceRoll() {
    if (isRolling || isPaused || activeModal) return;
    setIsRolling(true);

    //Shuffle animation
    let numberShuffle = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
    }, 100);

    //Final roll
    setTimeout(() => {
      clearInterval(numberShuffle);

      const finalRoll = Math.floor(Math.random() * 6) + 1;
      const actualTilesMoved = rollDice(finalRoll);

      setDiceRoll(actualTilesMoved);
      setIsRolling(false);
    }, 1000);
  }

  //Apply the dice roll movement to player position to advance them on the board
  //Moves tile-by-tile and triggers tasks, items and events
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

      //Handles if the player runs into a task tile
      if (tile.task) {
        setActiveTask(tile.task);
        setActiveModal('task');
        triggered = true;
        continue;
      }
      //Handles if the player runs into a item tile
      if (tile.item) {
        collectItem(tile.item, tile.id);
        triggered = true;
        continue;
      }
      //Handles if the player runs into a event tile
      if (tile.eventType && Math.random() < tile.eventChance) {
        triggerEvent(tile);
        triggered = true;
        break;
      }
    }

    setPlayerPosition(newPosition);
    //Check if the level is complete
    if (newPosition === lastTile && completedTasks.length >= totalTasks) {
      setShowLevelComplete(true);
      setActiveModal('levelComplete');
      setScore((prev) => prev + currentLevel.scoring.finishReached);

      //Check off the preparedness goal trackers once the end of the level has been reached
      if (currentLevel.id === 'flood') completeGoal('floodTraining');
      if (currentLevel.id === 'wildfire') completeGoal('fireTraining');
      if (currentLevel.id === 'earthquake') completeGoal('earthquakeTraining');
    }

    return tilesMoved;
  }

  //Triggers a random event title, show alert message, add score and XP
  // applies movement penalty if there is one
  function triggerEvent(tile) {
    setAlertMessage(tile.message);
    setScore((prev) => prev + currentLevel.scoring.eventTriggered);
    setXP((prev) => prev + 25);

    if (tile.movementPenalty) {
      setPlayerPosition((prev) => Math.max(prev - tile.movementPenalty, 0));
    }
  }
  //Move to the next level, resets state, shows victory modal if last level
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
  }
  //Handle collecting a item from an item tile
  //Adds it to the inventory, removes it from the tile, shows item modal
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
  //Render the Game Board UI
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/**Temporary alert message */}
        {alertMessage && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>⚠️ Alert </Text>
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        )}
        {/** Temporary leveling message*/}
        {levelingMessage && (
          <View style={styles.levelingContainer}>
            <Text style={styles.levelingText}>🎉 Congratulations </Text>
            <Text style={styles.levelingText}>{levelingMessage}</Text>
          </View>
        )}
        {/** Image background and overlay for each screen*/}
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
          {/**Create the header for the Game Board */}
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
          {/** Stats for the level (timer, score, xp, player level*/}
          <View style={styles.header}>
            <Text style={styles.headerItem}>⏳ {timeLeft} seconds</Text>
            <Text style={styles.headerItem}>Score: {score} </Text>
            <Text style={styles.headerItem}>XP: {xp} </Text>
            <Text style={styles.headerItem}>Danger Level: {playerLevel}</Text>
          </View>
          {/** Game Board uses an SVG component to render path/tiles/player, etc.*/}
          <View style={styles.boardContainer}>
            <Svg
              width={width}
              height={boardHeight}
              viewBox={`0 0 ${maxX} ${maxY}`}
              pointerEvents="box-none"
              style={{ position: 'relative' }}
            >
              {/**Background tint for each level */}
              <Rect x={0} y={0} width={maxX} height={maxY} fill={currentLevel.tintColor} />
              {/**Render the path tiles for the board */}
              <TilePath tile_size={tile_size} pathTiles={pathTiles} playerPosition={playerPosition} />
              {/**Create the player avatar and use playerPosition for movement */}
              <Player
                x={pathTiles[playerPosition].x}
                y={pathTiles[playerPosition].y}
                tile_size={tile_size}
                style={{ zIndex: 999 }}
              />
              {/** Create the item tiles*/}
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
          {/** Inventory and dice roll section*/}
          <View style={styles.bottomContainer}>
            <Text style={styles.inventoryHeaderText}>Inventory</Text>
            {/** List of inventory items once collected*/}
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
                color: theme.colors.text, 
              }}>
                {isRolling ? `🎲 🎲 🎲 ${diceRoll}` : `🎲 ${diceRoll}`}
              </Text>
              <Button title="🎲 Roll" onPress={animateDiceRoll} disabled={isRolling} />
            </View>
          </View>
          {/**Display the menu button for pausing game, and controlling navigation */}
          <IconButton
            icon="menu"
            size={25}
            mode="contained"
            style={{
                position: 'absolute',
                top: theme.spacing.s,
                right: theme.spacing.s,
                backgroundColor: theme.colors.text,
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
            //Instructions modal
            <InstructionsModal visible={true} onClose={() => setActiveModal('goal')} />
          )}
          {/** Task modal*/}
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
              setActiveModal={setActiveModal}
            />
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

//Styling for the UI components
//Uses react-native StyleSheet instead of in-line
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
    backgroundColor: theme.colors.text,
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
    backgroundColor: theme.colors.text,
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
    backgroundColor: theme.colors.text,
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
