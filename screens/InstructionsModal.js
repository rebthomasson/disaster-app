import React from 'react';
import { Modal, View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function InstructionsModal({ onClose, visible, level }) {
    if (!visible) {
        return null;
    }
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{
                flex:1,
                justifyContent:'center',
                alignItems:'center',
                backgroundColor:'rgba(0,0,0,0.5)'
            }}>
                <View style={{
                    backgroundColor: 'lightblue',
                    padding:20,
                    borderRadius: 10,
                    width: '80%'
                }}>
                  <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                      <Text style={styles.title}>
                          How to Play
                      </Text>
                      <Text style={styles.sectionTitle}>🎯 Goal</Text>
                      <Text style={styles.text}>
                          Move through the disaster zone, complete tasks, collect items, and reach the finish tile before time runs out.
                      </Text>

                      <Text style={styles.sectionTitle}>🎲 Movement</Text>
                      <Text style={styles.text}>
                          Tap the dice to roll. Your player moves forward along the path based on the roll.
                      </Text>

                      <Text style={styles.sectionTitle}>🧭 Tiles</Text>
                      <Text style={styles.text}>
                          Each tile may contain terrain hazards, items, or tasks. Some tiles slow you down or trigger events.
                      </Text>

                      <Text style={styles.sectionTitle}>📝 Tasks</Text>
                      <Text style={styles.text}>
                          When you land on a task tile, a task modal appears. Complete the task to earn XP and progress.
                      </Text>

                      <Text style={styles.sectionTitle}>❓ Quizzes</Text>
                      <Text style={styles.text}>
                          Some tasks include quizzes. Answer correctly to earn extra XP and complete the task.
                      </Text>

                      <Text style={styles.sectionTitle}>🎒 Inventory</Text>
                      <Text style={styles.text}>
                          Items you find help you complete tasks or survive hazards. They appear in your inventory at the bottom.
                      </Text>

                      <Text style={styles.sectionTitle}>🔥 Danger Level</Text>
                      <Text style={styles.text}>
                          Completing tasks and quizzes increases your XP. Leveling up improves your preparedness score.
                      </Text>

                      <Text style={styles.sectionTitle}>⏳ Timer</Text>
                      <Text style={styles.text}>
                          Each level has a time limit. If it reaches zero, the game ends.
                      </Text>

                      <Text style={styles.sectionTitle}>🏁 Winning</Text>
                      <Text style={styles.text}>
                          Complete all tasks and reach the finish tile to complete the level. After Level 3, you unlock the Victory screen!
                      </Text>

                      <Button title='Start Game' onPress={onClose} />
                  </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles= StyleSheet.create({
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 22,
    },
})