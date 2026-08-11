import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Button, useWindowDimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
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

export default function GameBoard() {
    const { width, height } = useWindowDimensions();

    //Configure tile size for the grid
    const tile_size = 70;

    //Configuring state
    const [levelIndex, setLevelIndex] = useState(0);
    const currentLevel = levels[levelIndex];

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
        if (taskVisible || quizVisible) {
            setTimerActive(false);
        } else {
            setTimerActive(true);
        }
    }, [taskVisible, quizVisible]);


    function handleTimeUp() {
        setTimerActive(false);
        setShowGameOver(true);
    }

    function completeTask(taskId) {
        if (!completedTasks.includes(taskId)) {
            const updated = [...completedTasks, taskId];
            setCompletedTasks(updated);

            if (updated.length >= totalTasks) {
                setShowLevelComplete(true);
            }
        }
    }

    function rollDice() {
        const roll = Math.floor(Math.random() * 6) + 1;

        let newPosition = playerPosition;
        let triggered = false;

        // Check every tile between old and new position
        for (let i = 1 + 1; i <= roll; i++) {
            if (triggered) {
                break;
            }
            const nextIndex = newPosition + 1;
            if (nextIndex >= pathTiles.length) {
                break;
            }
            const tile = pathTiles[nextIndex];

            newPosition = nextIndex;

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
            if (Math.random() < tile.eventChance) {
                triggerEvent(tile);
                triggered = true;
                continue;
            }
        }

        setPlayerPosition(newPosition);
    }

    function triggerEvent(tile) {
        alert(`Event triggered on tile ${tile.id} with terrain ${tile.terrain}`);
    }

    //Handles what to do when a tile is pressed on screen
    function handleTilePress(tile, index) {
        //Get the row and column of the task
        setPlayerPosition(index);
        
        
        //If it's a task tile, activates the task/shows it to the user
        if (tile.task) {
            setActiveTask(tile.task);
            setTaskVisible(true);
            return;
        }

        if (tile.item) {
            collectItem(tile.item, tile.id);
            return;
        }

        if (Math.random() < tile.eventChance) {
            triggerEvent(tile);
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
    }

    return (
        /*Wraps everything in a SafeAreaView to render app content within device boundaries */
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
                        fill="#cce5cc"   // light green for grass
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

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Roll the Dice</Text>
                <Button title="🎲 Roll" onPress={rollDice} />
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

            <LevelComplete
                visible={showLevelComplete}
                goToNextLevel={goToNextLevel}
            />

            <GameOver
                visible={showGameOver}
                startOver={goToNextLevel}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: '20%',
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#ADC4DB'
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
    backgroundColor: '#ADC4DB',

  }
});