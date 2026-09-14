import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Alert, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Avatar, Button, Card, TextInput, Text, IconButton} from 'react-native-paper'
import { completeGoal } from '../entities/preparednessTracker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FamilyPlan({navigation}) {
  const [familyName, setFamilyName] = useState('');
  const [meetingPlaceNearby, setMeetingPlaceNearby] = useState('');
  const [distantMeetingPlace, setDistantMeetingPlace] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  function validateForm() {
    const newErrors = {};

    if (!familyName.trim()) {
      newErrors.familyName = 'Family name is required';
    }

    if (!meetingPlaceNearby.trim()) {
      newErrors.meetingPlaceNearby = 'Local meeting place is required';
    }

    if (!distantMeetingPlace.trim()) {
      newErrors.distantMeetingPlace = 'Secondary meeting place is required';
    }

    if (!medicalInfo.trim()) {
      newErrors.medicalInfo = 'Medical information is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function savePlan(plan) {
    try {
      await AsyncStorage.setItem(
        'familyEmergencyPlan',
        JSON.stringify(plan)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPlan() {
    try {
      const savedPlan = await AsyncStorage.getItem(
        'familyEmergencyPlan'
      );

      if (savedPlan) {
        return JSON.parse(savedPlan);
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function loadSavedPlan() {
      const plan = await loadPlan();

      if (plan) {
        setFamilyName(plan.familyName || '');
        setMeetingPlaceNearby(plan.meetingPlaceNearby || '');
        setDistantMeetingPlace(plan.distantMeetingPlace || '');
        setMedicalInfo(plan.medicalInfo || '');
        setNotes(plan.notes || '');
      }
    }

    loadSavedPlan();
  }, []);


  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="clipboard-account" size={40} color="#fff" />
          <Text style={styles.title}>Family Emergency Plan</Text>
          <IconButton
            icon="arrow-left"
            size={30}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              padding: 5,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()}
          />
        </View>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium">
              Create Your Family Plan
            </Text>
            <Text>
              Identify meeting places and important information so your family knows what to do during an emergency.
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title
            title="Family Information"
            left={(props) => (
              <Avatar.Icon {...props} icon="account-group" />
            )}
          />
          <Card.Content>
            <TextInput
              label={"Family Name"}
              value={familyName}
              onChangeText={setFamilyName}
              style={styles.input}
              error={!!errors.familyName}
            />
            {errors.familyName && (
              <Text style={styles.errorText}>
                {errors.familyName}
              </Text>
            )}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title
            title="Meeting Locations"
            left={(props) => (
              <Avatar.Icon {...props} icon="map-marker" />
            )}
          />
          <Card.Content>
            <TextInput
              label={"Meeting Place Near Home"}
              value={meetingPlaceNearby}
              onChangeText={setMeetingPlaceNearby}
              style={styles.input}
              error={!!errors.meetingPlaceNearby}
            />
            {errors.meetingPlaceNearby && (
              <Text style={styles.errorText}>
                {errors.meetingPlaceNearby}
              </Text>
            )}
            <TextInput
            label={"Meeting Place Outside Neighborhood"}
            value={distantMeetingPlace}
            onChangeText={setDistantMeetingPlace}
            style={styles.input}
            error={!!errors.distantMeetingPlace}
            />
            {errors.distantMeetingPlace && (
              <Text style={styles.errorText}>
                {errors.distantMeetingPlace}
              </Text>
            )}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title
            title="Medical Information"
            left={(props) => (
              <Avatar.Icon {...props} icon="medical-bag" />
            )}
          />
          <Card.Content>
            <TextInput
              label={"Medical Information"}
              multiline
              numberOfLines={4}
              value={medicalInfo}
              onChangeText={setMedicalInfo}
              style={styles.input}
              error={!!errors.medicalInfo}
            />
            {errors.medicalInfo && (
              <Text style={styles.errorText}>
                {errors.medicalInfo}
              </Text>
            )}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title
            title="Additional Plan Notes"
            left={(props) => (
              <Avatar.Icon {...props} icon="note-text" />
            )}
          />
          <Card.Content>
            <TextInput
              label={"Additional Notes"}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
            />
          </Card.Content>
        </Card>
        <Button
          mode='contained'
          style={styles.saveButton}
          onPress={async () => {
            if (!validateForm()) {
              return;
            }

            const plan = {
              familyName,
              meetingPlaceNearby,
              distantMeetingPlace,
              medicalInfo,
              notes,
            };

            await savePlan(plan);

            Alert.alert(
              'Success',
              'Family Emergency Plan saved successfully.'
            )

            if (
              familyName.trim() &&
              meetingPlaceNearby.trim() &&
              distantMeetingPlace.trim() &&
              medicalInfo.trim()
            ) {
              await completeGoal('familyPlan');
            }

          }}
        >
          Save Plan
        </Button>
        <Button
          mode='outlined'
          onPress={() =>
            Linking.openURL('https://www.ready.gov/sites/default/files/2025-06/family-communication-plan_fillable-card.pdf')
          }
        >
          View Ready.gov Template
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
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
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginVertical: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
    marginTop: -8,
  }
});
