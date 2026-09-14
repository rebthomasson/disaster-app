import React, {useState, useEffect} from 'react';
import { Checkbox, Text, Card, ProgressBar, IconButton, Avatar } from 'react-native-paper';
import {View, StyleSheet, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmergencyKit({navigation}) {
  const [checkedItems, setCheckedItems] = useState([]);

  const emergencyItems = [
    {
      id:
    }
  ]

  function toggleItems(id) {
    if (checkedItems.includes(id)) {
      setCheckedItems(
        checkedItems.filter(item => item !== id)
      );
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  }

  const progress = checkedItems.length / emergencyItems.length;

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="check-circle-outline" size={40} color="#fff" />
          <Text style={styles.title}>Emergency Kit Builder</Text>
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
              Build Your Emergency Kit
            </Text>
            <Text>
              This checklist helps you build a "go-bag" to prepare for a disaster. Check off items as you add them to your kit.
            </Text>
            <ProgressBar progress={progress}/>
            <Text>
              {checkedItems.length} / {emergencyItems.length} items completed
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title
            title="Food & Water Supplies"
            left={(props) => (
              <Avatar.Icon {...props} icon="" />
            )}
          />
          <Card.Content>
            {emergencyItems.map(item => (
              key={item.id}
              
            ))}
            <Checkbox.Item
              label={item.label}
              status={
                checkedItems.includes(item.id)
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={() => toggleItems(item.id)}
            />
          </Card.Content>
        </Card>
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
  }
})