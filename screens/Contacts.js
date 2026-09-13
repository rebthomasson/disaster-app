import React, {useState, useEffect} from 'react';
import {Text, Card, TextInput, Button, IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView, StyleSheet, View, Linking} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { completeGoal } from '../entities/preparednessTracker';

export default function EmergencyContacts({navigation}) {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
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
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="contacts"
            size={40}
            color="#fff"
          />

          <Text style={styles.title}>Emergency Contacts</Text>
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

        <Card style={styles.formCard}>
          <Card.Title title="Add Contact" />
          <Card.Content>
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
            <Button mode="contained" onPress={addContact} style={styles.addButton}>
              Add Contact
            </Button>
          </Card.Content>
        </Card>

        {contacts.map(contact => (
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
    paddingVertical: 10,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  contactCard: {
    marginBottom: 8,
  },
});