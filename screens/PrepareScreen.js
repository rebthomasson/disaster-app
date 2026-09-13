import React, {useState, useCallback} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Card, Text, Button, Avatar, ProgressBar} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCompletedGoals, getFAQProgress } from '../entities/preparednessTracker';
import { useFocusEffect } from '@react-navigation/native';
import { prepGoals } from '../entities/preparednessGoals';

const prepareItems = [
  {
    title: 'Emergency Kit Checklist',
    screen: 'EmergencyKitChecklist',
    icon: 'check-circle-outline'
  },
  {
    title: 'Family Emergency Plan',
    screen: 'FamilyEmergencyPlan',
    icon: 'account-group'
  },
]

export default function PrepareScreen({navigation}) {

  const [completedGoals, setCompletedGoals] = useState([]);
  const [showGoals, setShowGoals] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [faqProgress, setFAQProgress] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  async function  loadGoals() {
    try {
      const goals = await getCompletedGoals();
      const faqCount = await getFAQProgress();

      setCompletedGoals(goals);
      setFAQProgress(faqCount);
    } catch (error) {
      console.error('Failed to load goals');
    }
  }

  const progress = Math.round((completedGoals.length / prepGoals.length) * 100);

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
          <MaterialCommunityIcons name="bag-personal" size={40} color="#fff" />
          <Text style={styles.title}>Prepare</Text>
          <Text style={styles.subtitle}>Plan • Organize • Be Ready</Text>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium">
              Let's Prepare
            </Text>
            <Text>
              Build an emergency kit, create a family emergency plan, and learn preparedness tips to stay safe during disasters.
            </Text>
          </Card.Content>
        </Card>
        {prepareItems.map((item) => (
            <Card
              key={item.title}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Card.Title
                title={item.title}
                left={(props) => (
                  <Avatar.Icon {...props} icon={item.icon} />
                )}
              />
            </Card>
        ))}
        <Card 
          style={styles.card}
          onPress={() => setShowGoals(!showGoals)}
        >
          <Card.Title
            title={`Preparedness Goals (${completedGoals.length}/${prepGoals.length})`}
            left={(props) => (
              <Avatar.Icon {...props} icon={"clipboard"} />
            )}
            right={() => (
              <MaterialCommunityIcons
                name={
                  showGoals
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={30}
                color="#777"
                style={{marginRight: 10}}
              />
            )}
          />
          {showGoals && (
            <Card.Content>
              {prepGoals.map(goal => (
                <View
                  key={goal.id}
                  style={styles.goalRow}
                >
                  <MaterialCommunityIcons
                    name={
                      completedGoals.includes(goal.id)
                        ? 'check-circle'
                        : 'circle-outline'
                    }
                    size={24}
                    color={
                      completedGoals.includes(goal.id)
                        ? '#4CAF50'
                        : '#9E9E9E'
                    }
                  />

                  <Text style={{ marginLeft: 10 }}>
                    {
                      goal.id === 'faq'
                        ? `Read Disaster FAQs (${faqProgress}/3)`
                        : goal.title
                    }
                  </Text>
                </View>
              ))}
            </Card.Content>
          )}
        </Card>
        
        <Card 
          style={styles.card}
          onPress={() => setShowProgress(!showProgress)}
        >
          <Card.Title
            title="Your Progress"
            left={(props) => (
              <Avatar.Icon {...props} icon={"chart-line"} />
            )}
            right={() => (
              <MaterialCommunityIcons
                name={
                  showProgress
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={30}
                color="#777"
                style={{marginRight: 10}}
              />
            )}
          />
          {showProgress && (
            <Card.Content>
              <Text style={{marginBottom: 10}}>
                {completedGoals.length} / {prepGoals.length} goals completed
              </Text>
              <ProgressBar
                progress={completedGoals.length / prepGoals.length}
                style={{marginTop: 10, marginBottom: 10}}
              /> 
              <Text>
                {progress}% Prepared
              </Text>
              <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                Badge: {getBadge(progress)}
              </Text>
            </Card.Content>
          )}
        </Card>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    backgroundColor: '#0D47A1',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#BBDEFB',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 6,
    borderLeftColor: '#1976D2',
    elevation: 4,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
    padding: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  }
});