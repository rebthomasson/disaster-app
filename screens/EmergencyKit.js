//Imports for the emergency kit screen
import React, {useState, useEffect, use} from 'react';
import { Checkbox, Text, Card, ProgressBar, IconButton, Avatar, Divider } from 'react-native-paper';
import {View, StyleSheet, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import { completeGoal } from '../entities/preparednessTracker';

//Function to render the emergency kit builder screen
export default function EmergencyKit({navigation}) {
  //Tracks which kit items have been checked off
  const [checkedItems, setCheckedItems] = useState([]);
  //Array to maange emergency items in the checklist and their categories
  const emergencyItems = {
    nutritional: [
      {id: 'water', label: 'One gallon per person per day for at least 3 days'},
      {id: 'food', label: 'At least a several-day supply of non-perishable food'}
    ],
    tools: [
      {id: 'radio', label: 'Battery-powered or hand crank radio and a NOAA Weather Radio with tone alert'},
      {id: 'flashlight', label: 'Flashlight'},
      {id: 'first-aid kit', label: 'First Aid Kit'},
      {id: 'batteries', label: 'Extra batteries'},
      {id: 'whistle', label: 'Whistle (to signal for help)'},
      {id: 'shelter', label: 'Plastic sheeting, scissors and duct tape (to shelter in place)'},
      {id: 'wrench', label: 'Wrench or pliers (to turn off utilities)'},
      {id: 'can opener', label: 'Manual can opener (for food)'},
      {id: 'maps', label: 'Local maps'},
      {id: 'chargers', label: 'Cell phone with chargers and a backup battery'},
      {id: 'mask', label: 'Dust mask (to help filter contaminated air)'},
      {id: 'matches', label: 'Matches in a waterproof container'}
    ],
    medical: [
      {id: 'medications', label: 'Prescription medications'},
      {id: 'non-prescription medications', label: 'Non-prescription medications (pain relievers, anti-diarrhea, antacids, etc.'},
      {id: 'eyeglasses', label: 'Prescription eyeglasses and contact lens solution'},
    ],
    miscellaneous: [
      {id: 'docs', label: 'Important family documents in a waterproof, portable container'},
      {id: 'cash', label: 'Cash or travelers checks'},
      {id: 'clothes', label: 'Complete change of clothing appropriate for your climate and sturdy shoes'},
      {id: 'hygiene', label: 'Feminine supplies and personal hygiene items'},
      {id: 'sleeping bag', label: 'Sleeping bag or warm blanket for each person'},
      {id: 'cookware', label: 'Mess kits, paper cups, plates, paper towels and plastic utensils'},
      {id: 'games', label: 'Books, games, puzzles or other activities for children'},
      {id: 'paper and pencil', label: 'Paper and pencil'}
    ],
  }
  //Icons for each of the categories
  const categoryIcons = {
    nutritional: 'food-apple',
    tools: 'toolbox-outline',
    medical: 'medical-bag',
    miscellaneous: 'package-variant-closed'
  }
  //Toggle a single item in/out of the checklist
  function toggleItems(id) {
    if (checkedItems.includes(id)) {
      setCheckedItems(
        checkedItems.filter(item => item !== id)
      );
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  }
  //Keeps track of the total items across all categories
  const totalItems = Object.values(emergencyItems)
    .flat()
    .length;
  //Keeps track of the completion percentage for kit
  const progress = checkedItems.length / totalItems;
  //Load the saved kit progress
  useEffect(() => {
    AsyncStorage.getItem('checkedItems').then(data => {
      if (data) setCheckedItems(JSON.parse(data));
    });
  }, []);
  //Persist kit progress whenever items change
  useEffect(() => {
    AsyncStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  //Marks the emergency kit goal as completed when all items are checked off
  useEffect(() => {
    if (checkedItems.length === totalItems) {
      completeGoal('kit');
    }
  }, [checkedItems]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="check-circle-outline" size={40} color={theme.colors.surface} />
          <Text style={styles.title}>Emergency Kit Builder</Text>
          <IconButton
            icon="arrow-left"
            size={20}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 25,
              padding: 5,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()} //Go back to the previous screen
          />
        </View>
        {/** Info card*/}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={{fontFamily: theme.fonts.bold, fontSize: 16, paddingBottom: 10}}>
              Build Your Emergency Kit
            </Text>
            <Text style={{fontFamily: theme.fonts.regular}}>
              This checklist helps you build a "go-bag" to prepare for a disaster. Check off items as you add them to your kit.
            </Text>
            <ProgressBar progress={progress} style={{marginTop: 10}} color={theme.colors.border}/>
            <Text style={{marginVertical: 8, fontFamily: theme.fonts.regular}}>
              {checkedItems.length} / {totalItems} items completed
            </Text>
          </Card.Content>
        </Card>
        {/**Category sections */}
        {Object.entries(emergencyItems).map(([category, items]) => (
          <Card key={category} style={styles.card}>
            <Card.Title
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              left={(props) => (
                <Avatar.Icon {...props} icon={categoryIcons[category]} style={styles.cardIcon} />
              )}
            />
            <Card.Content>
              {/**Map the items to each checkbox */}
              {items.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <Checkbox
                      status={checkedItems.includes(item.id) ? "checked" : "unchecked"}
                      color={theme.colors.primary}
                      uncheckedColor={theme.colors.border}
                      onPress={() => toggleItems(item.id)}
                    />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>

                  {index < items.length - 1 && <Divider />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

//Styling for the emergency kit UI
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.surface,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.border,
    elevation: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  cardIcon: {
    backgroundColor: theme.colors.background
  },
  progressBar: {
    marginVertical: 10
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemLabel: {
    fontSize: 16,
    flexShrink: 1,
    fontFamily: theme.fonts.regular
  },
})