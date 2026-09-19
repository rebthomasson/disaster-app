import React, {useState, useEffect} from 'react';
import {Text, Card, TextInput, Button, IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView, StyleSheet, View, Linking, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { completeGoal } from '../entities/preparednessTracker';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';

export default function EmergencyContacts({navigation}) {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const localContacts = [
    {
      id: 'police-non-emergency',
      name: 'Police (Non‑Emergency)',
      phone: '612-673-3000',
      relationship: 'Local Services',
    },
    {
      id: 'fire-department',
      name: 'Fire Department',
      phone: '612-673-2890',
      relationship: 'Local Services'
    },
    {
      id: 'natural-resources-department',
      name: 'MN Department of Natural Resources',
      phone: '651-296-6157',
      relationship: 'Local Services'
    },
    {
      id: 'fema',
      name: 'Federal Emergency Management Agency',
      phone: '1-800-621-3362',
      relationship:'National Services'
    }
  ]

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      const parsed = storedContacts ? JSON.parse(storedContacts) : [];

      // Merge defaults + user contacts, but avoid duplicates
      const merged = [
        ...localContacts,
        ...parsed.filter(c => !localContacts.some(l => l.id === c.id))
      ];

      // First load → store defaults
      if (!storedContacts) {
        await AsyncStorage.setItem('emergencyContacts', JSON.stringify(localContacts));
        setContacts(localContacts);
        return;
      }

      setContacts(merged);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  async function saveContacts(updatedContacts) {
    setContacts(updatedContacts);
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  async function addContact() {
    if (!name || !phone || !relationship) {
      alert('Please fill in all fields');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name,
      phone,
      relationship,
    };

    const updatedContacts = [...contacts, newContact];
    await saveContacts(updatedContacts);
    setName('');
    setPhone('');
    setRelationship('');
    await completeGoal('contacts');
  }

  async function deleteContact(id) {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    await saveContacts(updatedContacts);
  }

  function callContact(phone) {
    // Use Linking API to initiate a phone call
    Linking.openURL(`tel:${phone}`);
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="contacts"
            size={40}
            color={theme.colors.surface}
          />

          <Text style={styles.title}>Emergency Contacts</Text>
          <IconButton
            icon="arrow-left"
            size={25}
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

        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={{fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.surface, paddingBottom: 10}}>Add Contact</Text>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Relationship"
              value={relationship}
              onChangeText={setRelationship}
              style={styles.input}
            />
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={addContact}
            >
              <Text style={globalStyles.outlineButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <Text style={styles.contactsHeader}>Local Emergency Contacts</Text>
        {contacts
          .filter(c => c.relationship === 'Local Services' || c.relationship==='National Services')
          .map(contact => (
            <Card key={contact.id} style={styles.contactCard}>
              <Card.Title title={contact.name} subtitle={`${contact.relationship}`} />
              <Card.Content>
                <Text>Phone: {contact.phone}</Text>
              </Card.Content>
              <Card.Actions>
                <IconButton
                  icon="phone"
                  onPress={() => callContact(contact.phone)}
                />
              </Card.Actions>
            </Card>
          ))
        }

        <Text style={styles.contactsHeader}>Your Emergency Contacts</Text>
        {contacts
          .filter(c => !localContacts.some(d => d.id === c.id))
          .map(contact => (
          <Card key={contact.id} style={styles.contactCard}>
            <Card.Title title={contact.name} subtitle={`${contact.relationship}`} />
            <Card.Content>
              <Text>Phone: {contact.phone}</Text>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="phone"
                onPress={() => callContact(contact.phone)}
              />
              <IconButton
                icon="delete"
                style={{color: theme.colors.primary}}
                onPress={() => deleteContact(contact.id)}
              />
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40
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
    paddingVertical: 10,
  },
  contactsHeader: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
    fontFamily: theme.fonts.bold
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.primary
  },
  input: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  contactCard: {
    marginBottom: 8,
    backgroundColor: theme.colors.surface
  },
});