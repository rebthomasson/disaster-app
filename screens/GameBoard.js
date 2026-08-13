import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Button, useWindowDimensions, ImageBackground, Animated, Image } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Player from "../entities/Player";
import Path from "../entities/Path";
import InventoryItem from "../entities/InventoryItem";
import {Svg, Rect} from 'react-native-svg';
import TaskModal from "../screens/TaskModal"; 
import ItemModal from "../screens/ItemModal"; 
import QuizModal from "../screens/QuizModal";
import {levels} from "../systems/levels";
import LevelComplete from './LevelComplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameOver from '../screens/GameOver';
import GoalModal from '../screens/GoalModal';

//Configure tile size for the grid
const tile_size = 70;

export default function GameBoard() {
    const { width, height } = useWindowDimensions();

    //Configure tile size for the grid
    const tile_size = 70;

    //Configuring state
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

    const [completedTasks, setCompletedTasks] = useState([]);

    const [playerPosition, setPlayerPosition] = useState(0);
    const [activeTask, setActiveTask] = useState(null);
    const [taskVisible, setTaskVisible] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);

    const [inventory, setInventory] = useState([]);

    const [foundItem, setFoundItem] = useState(null);

    const [quizVisible, setQuizVisible] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);

    const [pathTiles, setPathTiles] = useState(currentLevel.pathTiles);

    if (!pathTiles || pathTiles.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading map...</Text>
            </SafeAreaView>
        );
    }


    const [showGoal, setShowGoal] = useState(true);

    const [score, setScore] = useState(0);
    const [xp, setXP] = useState(0);

    const [playerLevel, setPlayerLevel] = useState(1);

    const rainOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(rainOpacity, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(rainOpacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    const [diceRoll, setDiceRoll] = useState(1);
    const [isRolling, setIsRolling] = useState(false);

    useEffect(() => {
        const xpLeveling = playerLevel * 100;

        if (xp >= xpLeveling) {
            setPlayerLevel(prev => {
                const newLevel = prev + 1;
                alert(`You leveled up! You are now a level ${newLevel} player.`);
                return newLevel;
            });
        }
    }, [xp]);

    const totalTasks = pathTiles.filter(tile => tile.task).length;

    const maxX = Math.max(...pathTiles.map(t => t.x)) + tile_size;
    const maxY = Math.max(...pathTiles.map(t => t.y)) + tile_size;

    useEffect(() => {
        if (!timerActive) return;

        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    handleTimeUp();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive]);

    useEffect(() => {
        if (taskVisible || quizVisible || showGoal) {
            setTimerActive(false);
        } else {
            setTimerActive(true);
        }
    }, [taskVisible, quizVisible, showGoal]);


    function handleTimeUp() {
        setTimerActive(false);
        setShowGameOver(true);
    }

    const lastTile = pathTiles.length -1;

    
    function completeTask(taskId) {
        if (!completedTasks.includes(taskId)) {
            const updated = [...completedTasks, taskId];
            setCompletedTasks(updated);

            setScore(prev => prev + currentLevel.scoring.taskCompleted);
            setXP(prev => prev + 25);

            if (playerPosition === lastTile && completedTasks.length >= totalTasks) {
                setShowLevelComplete(true);
                setXP(prev => prev + 25);
            }
        }
    }

    function animateDiceRoll() {
        if (isRolling) return;
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
        const lastTile = pathTiles.length - 1;

        // Check every tile between old and new position
        for (let i = 1; i <= roll; i++) {
            if (triggered) {
                break;
            }
            const nextIndex = newPosition + 1;
            if (nextIndex >= pathTiles.length) {
                break;
            }
            const tile = pathTiles[nextIndex];

            newPosition = nextIndex;
            tilesMoved++;

            if (tile.task) {
                setActiveTask(tile.task);
                setTaskVisible(true);
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
            setScore(prev => prev + currentLevel.scoring.finishReached);
        }

        return tilesMoved;
    }

    function triggerEvent(tile) {
        alert(tile.message);

        setScore(prev => prev + currentLevel.scoring.eventTriggered);
        setXP(prev => prev + 25);

        if (tile.movementPenalty) {
            setPlayerPosition(prev => Math.max(prev - tile.movementPenalty, 0));
        }
    }

    //Controls what happens when moving to the next level
    function goToNextLevel() {
        //If it's the last level in the index, reset to level 1
        if (levelIndex === levels.length - 1 || showGameOver) {
            setLevelIndex(0);
            setCompletedTasks([]);
            setShowLevelComplete(false);
            setPlayerPosition(0);
            setInventory([]);
            setPathTiles(levels[0].pathTiles);
            setTimeLeft(levels[0].timeLimit);
            setTimerActive(true);
            setShowGameOver(false);
            setShowGoal(true);
            setXP(0);
            return;
        }
        //Reset values and state
        setLevelIndex(levelIndex + 1);
        setCompletedTasks([]);
        setShowLevelComplete(false);
        setPlayerPosition(0);
        setInventory([]);
        setPathTiles(levels[levelIndex + 1].pathTiles);
        setTimeLeft(levels[levelIndex + 1].timeLimit);
        setTimerActive(true);
        setShowGoal(true);
        setXP(prev => prev + currentLevel.xpReward);
    }

    //When item is collected
    function collectItem(item, tileId) {
        //This add the item to the inventory
        setInventory(prev => [...prev, item]);

        // Clear item from the tile
        const updatedTiles = pathTiles.map(tile =>
            tile.id === tileId ? { ...tile, item: null } : tile
        )

        setPathTiles(updatedTiles);
        
        setFoundItem(item);
        setScore(prev => prev + currentLevel.scoring.itemCollected);
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={currentLevel.background} style={{ flex: 1 }} resizeMode="cover">
                <Animated.View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: rainOpacity,
                    pointerEvents: 'none',
                }}>
                    <Image
                        source={currentLevel.overlay}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Animated.View>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{currentLevel.name}</Text>

                    <View style={styles.progressBar}>
                        <View
                        style={[
                            styles.progressFill,
                            { width: `${(completedTasks.length / totalTasks) * 100}%` }
                        ]}
                        />
                    </View>

                    <Text style={styles.progressText}>{completedTasks.length} / {totalTasks} tasks completed </Text>
                    <Text style={styles.progressText}>⏳ {timeLeft} seconds</Text>
                    <Text style={styles.scoreText}>Score: {score} </Text>
                    <Text style={styles.xpText}>XP: {xp} </Text>
                    <Text style={{ fontSize: 18, textAlign: 'center' }}>
                        Danger Level: {playerLevel}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                        style={[
                            styles.progressFill,
                            { width: `${(xp / (playerLevel * 100)) * 100}%` }
                        ]}
                        />
                    </View>
                </View>
                <View style={styles.boardContainer}>
                    <Svg
                        width={width}
                        height={height * 0.5}  // Adjust height as needed
                        viewBox={`0 0 ${maxX} ${maxY}`}
                        pointerEvents='box-none'
                    >
                        <Rect
                            x={0}
                            y={0}
                            width={maxX}
                            height={maxY}
                            fill={currentLevel.tintColor}
                        />
                        <Path
                            tile_size = {tile_size}
                            pathTiles={pathTiles}
                            playerPosition={playerPosition}
                            //onTilePress={handleTilePress}
                        />
                        <Player
                            x = {pathTiles[playerPosition].x}
                            y = {pathTiles[playerPosition].y}
                            tile_size={tile_size}
                        />
                        {pathTiles.map(tile => (
                            tile.item && <InventoryItem
                                key={tile.item.id}
                                x={tile.x}
                                y={tile.y}
                                tile_size={tile_size}
                                onPress = {() => collectItem(tile.item, tile.id)}
                            />
                        ))}
                    </Svg>
                    <Text style={styles.inventoryHeaderText}>Inventory</Text>
                    <View style={styles.inventorySection}>
                        {inventory.map(item => (
                            <View key={item.id} style={styles.inventorySlot}>
                                <Text style={styles.inventoryText}>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>    
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                    <Text style={{ fontSize: 40, fontWeight: "bold" }}>🎲 {diceRoll} </Text>
                    {isRolling && 
                        <Text style={{ fontSize: 20, color: 'gray' }}> 
                            Rolling...
                        </Text>}
                    <Button title="🎲 Roll" onPress={animateDiceRoll} disabled={isRolling} />
                </View>
                <TaskModal
                    visible={taskVisible}
                    task={activeTask}
                    onClose={() => {
                        setTaskVisible(false);
                        if (!activeTask.quiz) {
                            completeTask(activeTask.id)
                        }
                    }}
                    onStartQuiz={(quiz) => {
                        setActiveQuiz(quiz);
                        setQuizVisible(true);
                    }}
                />

                <QuizModal
                    visible={quizVisible}
                    quiz={activeQuiz}
                    onClose={() => {
                        setQuizVisible(false);
                    }}
                    onDone={(passed) => {
                        if (passed) {
                            completeTask(activeTask.id);
                        }
                    }}
                />

                <ItemModal
                    item={foundItem}
                    onClose={() => setFoundItem(null)}
                />

                <GoalModal
                    visible={showGoal}
                    level={currentLevel}
                    onClose={() => setShowGoal(false)}
                />

                <LevelComplete
                    visible={showLevelComplete}
                    goToNextLevel={goToNextLevel}
                    levelScore={score}
                    xpGained={xp}
                />

                <GameOver
                    visible={showGameOver}
                    startOver={goToNextLevel}
                />
            </ImageBackground>
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
    width: '100%',
    height: '20%',
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#ADC4DB',
    opacity: 0.8
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#3D3D3D'
  },
  progressBar: {
    width: "80%",
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 5
  },
  scoreText: {
    marginTop: 8,
    fontSize: 12,
    color: '#3D3D3D'
  },
  xpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#3D3D3D'
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50"
  },
  inventorySection: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#ADC4DB',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTopWidth: 2,
    borderColor: '#ADADDB'
  },
  inventorySlot: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 5,
    borderWidth: 1,
    borderColor: "#B8C4CE",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inventoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3D3D3D",
  },
  inventoryHeaderText: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: '#ADC4DB'
  }
});