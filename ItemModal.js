import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { use, useState } from 'react';
import Tiles from "../entities/Tiles";
import Player from "../entities/Player";
import InventoryItem from "../entities/InventoryItem";
import Svg from 'react-native-svg';
import TaskModal from "../screens/TaskModal"; 
import ItemModal from "../screens/ItemModal"; 
import QuizModal from "../screens/QuizModal";
import {levels} from "../systems/levels";
import LevelComplete from './LevelComplete';
import { SafeAreaView } from 'react-native-safe-area-context';

//Configure tile size for the grid
const tile_size = 70;
const grid_size = 5;

export default function GameBoard() {
    //Configuring state
    const [levelIndex, setLevelIndex] = useState(0);
    const currentLevel = levels[levelIndex];

    const [completedTasks, setCompletedTasks] = useState([]);

    const [playerRow, setPlayerRow] = useState(0);
    const [playerColumn, setPlayerColumn] = useState(0);
    const [activeTask, setActiveTask] = useState(null);
    const [taskVisible, setTaskVisible] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);

    const taskTiles = currentLevel.tasks;
    const itemTiles = currentLevel.items;

    const [items, setItems] = useState(currentLevel.items);
    const [inventory, setInventory] = useState([]);

    const [foundItem, setFoundItem] = useState(null);

    const [quizVisible, setQuizVisible] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);

    
    function completeTask(taskId) {
        if (!completedTasks.includes(taskId)) {
            const updated = [...completedTasks, taskId];
            setCompletedTasks(updated);
            if (updated.length >= currentLevel.requirementsToWin) {
                setShowLevelComplete(true);
            }
        }
    }

    //Handles what to do when a tile is pressed on screen
    function handleTilePress(row, column) {
        //Get the row and column of the task
        const task = taskTiles.find(t => t.row === row && t.column === column);
        
        //Move the player tile to the new tile
        setPlayerColumn(column);
        setPlayerRow(row);
        
        //If it's a task tile, activates the task/shows it to the user
        if (task) {
            setActiveTask(task);
            setTaskVisible(true);
            return;
        }
    }

    //Controls what happens when moving to the next level
    function goToNextLevel() {
        //If it's the last level in the index, reset to level 1
        if (levelIndex === levels.length - 1) {
            setLevelIndex(0);
            setCompletedTasks([]);
            setShowLevelComplete(false);
            setPlayerRow(0);
            setPlayerColumn(0);
            setItems(levels[0].items);
            setInventory([]);
            return;
        }
        //Reset values and state
        setLevelIndex(levelIndex + 1);
        setCompletedTasks([]);
        setShowLevelComplete(false);
        setPlayerRow(0);
        setPlayerColumn(0);
        setItems(levels[levelIndex + 1].items);
        setInventory([]);
    }

    //When item is collected
    function collectItem(item) {
        //This add the item to the inventory
        setInventory(prev => [...prev, item]);

        //This removes the item from the board
        setItems(prev => prev.filter(i => i.id !== item.id));
        
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
                        { width: `${(completedTasks.length / currentLevel.requirementsToWin) * 100}%` }
                    ]}
                    />
                </View>

                <Text style={styles.progressText}>{completedTasks.length} / {currentLevel.requirementsToWin} tasks completed </Text>
            </View>
            <View style={styles.boardContainer}>
                <Svg
                    width={grid_size *tile_size}
                    height={grid_size*tile_size}
                    pointerEvents='box-none'
                >
                    <Tiles
                        grid_size = {grid_size}
                        tile_size = {tile_size}
                        playerRow={playerRow}
                        playerColumn={playerColumn}
                        onTilePress={handleTilePress}
                    />
                    <Player
                        row={playerRow}
                        column={playerColumn}
                        tile_size={tile_size}
                    />
                    {items.map(item => (
                        <InventoryItem
                            key={item.id}
                            row={item.row}
                            column={item.column}
                            tile_size={tile_size}
                            onPress = {() => collectItem(item)}
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