import React from 'react';
import {Modal, Portal, Card, Button, Text} from 'react-native-paper';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';

//Modal to display the in-game menu when they're playing the board game
//Imports variables from gameboard to manage state
export default function MenuModal({
  visible, 
  onDismiss, 
  navigation,
  setLevelIndex,
  setPlayerPosition,
  setInventory,
  setCompletedTasks,
  setScore,
  setXP,
  setTimeLeft,
  setPathTiles,
  resetPreparedness,
  levels
}) {
    return (
        //Uses the react-native-paper portal component for the menu
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
              <View style={globalStyles.modalCard}>
                <Text style={globalStyles.modalTitle}>
                    Menu
                </Text>
                {/** Add buttons to resume the game, go to resource hub or back to homescreen*/}
                <TouchableOpacity
                  style={globalStyles.primaryButton}
                  onPress={() => {onDismiss()}}
                >
                  <Text style={globalStyles.primaryButtonText}>Resume</Text>
                </TouchableOpacity>
                  <TouchableOpacity
                    style={globalStyles.outlineButton}
                    onPress={() => {onDismiss(); navigation.navigate('Resources')}}
                  >
                    <Text style={globalStyles.outlineButtonText}>Resource Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={globalStyles.outlineButton}
                    onPress={() => {onDismiss(); navigation.navigate('Home')}}
                  >
                    <Text style={globalStyles.outlineButtonText}>Home</Text>
                  </TouchableOpacity>
                  {/**Button to reset the game to completely wipe game state */}
                  <TouchableOpacity
                    style={globalStyles.outlineButton}
                    title="Reset Game State"
                    onPress={() => {
                      setLevelIndex(0);
                      setPlayerPosition(0);
                      setInventory([]);
                      setCompletedTasks([]);
                      setScore(0);
                      setXP(0);
                      setTimeLeft(levels[0].timeLimit);
                      setPathTiles(levels[0].pathTiles);
                      resetPreparedness(); //Reset the preparedness goals
                    }}
                  >
                    <Text style={globalStyles.outlineButtonText}> Reset Game </Text>
                  </TouchableOpacity>
              </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});