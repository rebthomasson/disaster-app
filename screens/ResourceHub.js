import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Card, Text, Avatar, Button} from 'react-native-paper';

const resources = [
  {
    title: 'Evacuation Maps',
    screen: 'EvacuationMaps',
    icon: 'map'
  },
  {
    title: 'Disaster FAQs',
    screen: 'FAQs',
    icon: 'help-circle'
  }
]

export default function ResourceHub({navigation}) {

  const alertStyles = {
    warning: {
      backgroundColor: '#FFF4E5',
      borderColor: '#FF9800'
    },
    danger: {
      backgroundColor: '#FFE5E5',
      borderColor: '#D32F2F',
    },
    info: {
      backgroundColor: '#E3F2FD',
      borderColor: '#1976D2',
    },
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resource Hub</Text>
      <Card style={[
        styles.alertCard,
        {
        },
      ]}>
        <Card.Content style={styles.alertContent}>
          <Avatar.Icon
            size={40}
            icon='alert'
            style={styles.alertIcon}
          />

          <View>
            <Text variant='titleMedium'>

            </Text>
            <Text variant='bodySmall'>

            </Text>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button mode='contained'>
            Learn More
          </Button>
        </Card.Actions>
      </Card>
      {resources.map((item) => (
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
  )
} 

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold'
  },
  card: {
    marginBottom: 12,
  },
  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 6,
    elevation: 4,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertIcon: {
    backgroundColor: '#FF9800',
  },
  alertText: {
    marginLeft: 12,
    flex: 1
  }
})