import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Card, Text, Button, ProgressBar} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCompletedGoals } from '../entities/preparednessTracker';
import { useFocusEffect } from '@react-navigation/native';
import { prepGoals } from '../entities/preparednessGoals';

export default function HomeScreen({navigation}) {
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

  const today = new Date();

  const tipIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24)) % preparednessTips.length;

  const dailyTip = preparednessTips[tipIndex];
  
  const [completedGoals, setCompletedGoals] = useState([]);

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
  
  const progress = completedGoals.length / prepGoals.length;

  const progressPercent = Math.round(progress * 100);

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

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="home" size={40} color="#fff" />
          <Text style={styles.title}>Disaster Declassified</Text>
          <Text style={styles.subtitle}>Your guide to disaster preparedness</Text>
        </View>
        <Card style={styles.card}>
          <Card.Title
            title="Welcome Back!"
            left={(props) => (
              <MaterialCommunityIcons name="account-circle" size={40} color="#1976D2" />
            )}
          />
          <Card.Content>
            <Text>
              Continue your training, check for local alerts, and review your emergency plan.
            </Text>
          </Card.Content>
        </Card>
        {/* Preparedness Tip */}
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
        <Card style={styles.alertCard}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name="alert-octagon" size={40} color="#D32F2F" />
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
            <Button mode="contained" onPress={() => navigation.navigate('Resources')}>
              View Alerts
            </Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name="gamepad-variant" size={40} color="#1976D2" />
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
          <Card.Content>
            <Text>
              Level:
            </Text>
            <Text>
              Progress:
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('Game', { screen: 'GameBoard' })}>
              Resume Training
            </Button>
          </Card.Actions>
        </Card>
            <Text style={styles.sectionTitle}>
              Quick Access
            </Text>

            <View style={styles.grid}>
              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('Resources')}
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="shield-alert" size={40} color="#1976D2" />
                  <Text style={styles.gridItemText}>Resource Hub</Text>
                </Card.Content>
              </Card>

              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('Resources', { screen: 'ShelterMaps' })}
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="map-marker-radius" size={40} color="#1976D2" />
                  <Text style={styles.gridItemText}>Shelter Maps</Text>
                </Card.Content>
              </Card>

              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('Resources', { screen: 'EmergencyContacts' })}
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="contacts" size={40} color="#1976D2" />
                  <Text style={styles.gridItemText}>Emergency Contacts</Text>
                </Card.Content>
              </Card>
              <Card
                style={styles.gridCard}
                onPress={() => navigation.navigate('Prepare')}
              >
                <Card.Content style={styles.gridContent}>
                  <MaterialCommunityIcons name="bag-personal" size={40} color="#1976D2" />
                  <Text style={styles.gridItemText}>Emergency Kit</Text>
                </Card.Content>
              </Card>
            </View>

        {/* Preparedness Progress */}
        <Card style={styles.card}>
          <Card.Title
            title="Preparedness Progress"
            left={() => (
              <MaterialCommunityIcons
                name="shield-check"
                size={32}
                color="#388E3C"
              />
            )}
          />

          <Card.Content>
            <Text style={styles.progressText}>
              {completedGoals.length} / {prepGoals.length} goals completed
            </Text>

            <ProgressBar
              progress={progress}
              style={{marginTop: 10}}
            />

            <Text style={{marginTop: 10}}>
              {progressPercent}% Prepared
            </Text>

            <Text style={{
              marginTop: 10,
              fontWeight: 'bold'
            }}>
              {getBadge(progressPercent)}
            </Text>

            <Text
              style={{
                color: '#666',
                marginTop: 4,
              }}
            >
              Keep completing preparedness activities
              to unlock new badges.
            </Text>

            <Text style={{marginTop: 10}}>
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#1565C0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },

  subtitle: {
    color: '#E3F2FD',
    marginTop: 4,
  },

  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#d32f2f',
  },

  card: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },

  gridCard: {
    width: '48%',
    marginBottom: 12,
  },

  gridContent: {
    alignItems: 'center',
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  progressText: {
    marginTop: 12,
    marginBottom: 4,
  },

  tipCard: {
    marginBottom: 24,
    backgroundColor: '#FFF8E1',
  },
});