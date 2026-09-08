import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Card, Text, Button, Avatar} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  {
    title: 'Preparedness Tips',
    screen: 'PreparednessTips',
    icon: 'lightbulb-on-outline'
  },
  {
    title: 'Your Progress',
    screen: 'ProgressTracker',
    icon: 'chart-line'
  },
]

export default function PrepareScreen({navigation}) {
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
});