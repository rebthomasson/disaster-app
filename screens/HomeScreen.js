import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Card, Text, Button, ProgressBar} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCompletedGoals } from '../entities/preparednessTracker';
import { useFocusEffect } from '@react-navigation/native';
import { prepGoals } from '../entities/preparednessGoals';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';
import { levels } from '../systems/levels';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({navigation}) {
  //Array for rotating preparedness "tip of the day"
  const preparednessTips = [
    "Store at least one gallon of water per person per day for three days.",
    "Keep a flashlight and extra batteries in your emergency kit.",
    "Know at least two evacuation routes from your neighborhood.",
    "Maintain a list of emergency contacts in both digital and paper form.",
    "Sign up for local emergency weather alerts.",
    "Review your family's communication plan every six months.",
    "Keep copies of important documents in a waterproof container.",
    "Have a backup phone charger or power bank available.",
  ];

  //Gets a new daily tip baseed on the date
  const today = new Date(); //Get today's date
  //Calculate the index of the tips
  const tipIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24)) % preparednessTips.length;

  const dailyTip = preparednessTips[tipIndex];
  //Tracks the completed preparedness goals
  const [completedGoals, setCompletedGoals] = useState([]);

  //Load completed goals when the screen comes into focus
  async function  loadGoals() {
    try {
      const goals = await getCompletedGoals();

      setCompletedGoals(goals);
    } catch (error) {
      console.error('Failed to load goals');
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );
  //Get the current level index which is loaded from AsyncStorage
  const [levelIndex, setLevelIndex] = useState(0);
  // Load the saved level when the HomeScreen mounts
  useEffect(() => {
    AsyncStorage.getItem('levelIndex').then((value) => {
      const index = Number(value);
      if (!isNaN(index)) {
        setLevelIndex(index);
      }
    });
  }, []);
  
  //Preparedness goals progress (completed vs total goals)
  const progress = completedGoals.length / prepGoals.length;
  const progressPercent = Math.round(progress * 100);
  //Get the right badge based on progress gaoals percentage
  function getBadge(progress) {
    if (progress >= 100) {
      return '🏆 Disaster Ready';
    }

    if (progress >= 75) {
      return '🥇 Community Responder';
    }

    if (progress >= 50) {
      return '🥈 Emergency Planner'
    }

    if (progress >= 25) {
      return '🥉 Prepared Citizen'
    }

    return '🌱 Beginner';
  }
  //console.log('NAVIGATION ROUTES:', navigation.getState());

  return (
    //Render the UI for the HomeScreen
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="home" size={40} color="#fff" />
          <Text style={styles.title}>Disaster Declassified</Text>
          <Text style={styles.subtitle}>Your guide to disaster preparedness</Text>
        </View>
        {/** Welcome back card for home screen*/}
        <Card style={styles.card}>
          <Card.Title
            title="Welcome Back!"
            left={(props) => (
              <MaterialCommunityIcons name="account-circle" size={40} color={theme.colors.accent}/>
            )}
          />
          <Card.Content>
            <Text>
              Continue your training, check for local alerts, and review your emergency plan.
            </Text>
          </Card.Content>
        </Card>
        {/* Preparedness Tip Card */}
        <Card style={styles.tipCard}>
          <Card.Content>
             <View style={styles.row}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={40} color="#FFC107" />
              <View style={{marginLeft: 12}}>
                <Text variant="titleMedium">
                  Preparedness Tip of the Day
                </Text>
                <Text>
                  {dailyTip}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        {/**Local alerts card */}
        <Card style={styles.alertCard}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name="alert-octagon" size={40} color={theme.colors.border} />
              <View style={{ marginLeft: 12 }}>
                <Text variant="titleMedium">
                  Local Alerts
                </Text>

                <Text>
                  Check current hazards and weather updates.
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={() => navigation.navigate('AppTabs', {
                screen: 'Resources'
                })
              }
            >
              <Text style={globalStyles.primaryButtonText}>View Alerts</Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
        {/**Training card for the game levels */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name="gamepad-variant" size={40} color={theme.colors.accent} />
              <View style={{ marginLeft: 12 }}>
                <Text variant="titleMedium">
                  Training Simulation
                </Text>

                <Text>
                  Test your disaster preparedness skills.
                </Text>
              </View>
            </View>
          </Card.Content>
          {/** Current level styling using AsyncStorage*/}
          <Card.Content>
            <Text style={styles.cardLabel}>Level:</Text>
            <Text style={styles.cardValue}>
              {levels[levelIndex].name}
            </Text>
            {/** Checks off the levels once they have been completed*/}  
            <Text style={[styles.cardLabel, { marginTop: theme.spacing.s }]}>
              Progress:
            </Text>
            <Text style={styles.homeStatValue}>
              {completedGoals.includes('floodTraining') ? '✓ Flood Training' : '• Flood Training'}
            </Text>
            <Text style={styles.homeStatValue}>
              {completedGoals.includes('fireTraining') ? '✓ Fire Training' : '• Fire Training'}
            </Text>
            <Text style={styles.homeStatValue}>
              {completedGoals.includes('earthquakeTraining') ? '✓ Earthquake Training' : '• Earthquake Training'}
            </Text>
          </Card.Content>
          {/** Button to resume the game */}
          <Card.Actions>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={() => navigation.navigate('Game', { screen: 'GameBoard' })}>
              <Text style={globalStyles.primaryButtonText}>Resume Training</Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
        {/**Quick access section (emergency kit, contacts, resource hub, prepare page) */}
            <Text style={styles.sectionTitle}>
              Quick Access
            </Text>

            <View style={styles.grid}>
              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('Resources')}
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="shield-alert" size={40} color={theme.colors.accent} />
                  <Text style={styles.gridItemText}>Resource Hub</Text>
                </Card.Content>
              </Card>

              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('AppTabs', {
                  screen: 'Resources', 
                  params: { screen: 'ShelterMaps' }
                })
                }
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="map-marker-radius" size={40} color={theme.colors.accent} />
                  <Text style={styles.gridItemText}>Shelter Maps</Text>
                </Card.Content>
              </Card>

              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('AppTabs', {
                  screen: 'Resources', 
                  params: { screen: 'EmergencyContacts' }
                })
                }
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="contacts" size={40} color={theme.colors.accent} />
                  <Text style={styles.gridItemText}>Emergency Contacts</Text>
                </Card.Content>
              </Card>
              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('AppTabs', {
                  screen: 'Prepare',
                  params: { screen: 'EmergencyKit' }
                })
                }
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="bag-personal" size={40} color={theme.colors.accent} />
                  <Text style={styles.gridItemText}>Emergency Kit</Text>
                </Card.Content>
              </Card>
            </View>

        {/* Preparedness Progress Section */}
        <Card style={styles.card}>
          <Card.Title
            title="Preparedness Progress"
            left={() => (
              <MaterialCommunityIcons
                name="shield-check"
                size={32}
                color={theme.colors.accent}
              />
            )}
            style={{fontFamily: theme.fonts.bold}}
          />
          {/**Track the preparedness goals using progress bar */}
          <Card.Content>
            <Text style={styles.progressText}>
              {completedGoals.length} / {prepGoals.length} goals completed
            </Text>

            <ProgressBar
              progress={progress}
              color={theme.colors.border}
              style={{marginTop: 10, fontFamily: theme.fonts.regular}}
            />

            <Text style={{marginTop: 10, fontFamily: theme.fonts.regular}}>
              {progressPercent}% Prepared
            </Text>

            <Text style={{
              marginTop: 10,
              fontFamily: theme.fonts.bold
            }}>
              {/** Show the badge they've unlocked for completing goals*/}
              {getBadge(progressPercent)}
            </Text>

            <Text
              style={{
                color: '#666',
                marginTop: 4,
                fontFamily: theme.fonts.regular
              }}
            >
              Keep completing preparedness activities
              to unlock new badges.
            </Text>

            <Text style={{marginTop: 10, fontFamily: theme.fonts.regular}}>
              Next Goals:
            </Text>

            {prepGoals
              .filter(goal => !completedGoals.includes(goal.id)
              )
              .slice(0, 2)
              .map(goal => (
                <Text key={goal.id}>
                  • {goal.title}
                </Text>
              ))
            }

          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

//Styling for the home screen using React Stylesheet
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: theme.colors.accent,
    borderRadius: 20,
    padding: theme.spacing.l,
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    color: theme.colors.surface,
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    marginTop: 8,
  },

  subtitle: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.medium,
    marginTop: 4,
  },

  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#d32f2f',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderWidth: 1
  },

  card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.m,
      marginVertical: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 2,
  },
  cardLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.primary,
  },
  cardValue: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.accent,
  },
  homeStatValue: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap:'wrap'
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    color: theme.colors.surface
  },

  gridCard: {
    width: '48%',
    marginBottom: 12,
    color: theme.colors.surface
  },

  gridContent: {
    alignItems: 'center',
    color: theme.colors.surface
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: theme.fonts.regular
  },
  progressText: {
    marginTop: 12,
    marginBottom: 4,
    fontFamily: theme.fonts.regular
  },

  tipCard: {
    marginBottom: 24,
    backgroundColor: '#FFF8E1',
    borderColor: theme.colors.border,
    borderWidth: 1
  },
});