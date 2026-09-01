import React, { useState, useEffect } from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Card, Text, Avatar, Button} from 'react-native-paper';
import * as Location from 'expo-location';

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

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async() => {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  async function getNWSZone(lat, lon) {
    const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: {
        "User-Agent": "DisasterPrepApp (disaster@example.com)",
        "Accept": "application/ld+json"
      }
    });

    const data = await response.json();
    return data.properties.forecastZone;
  }

  async function getAlerts(zoneId) {
    const response = await fetch(`https://api.weather.gov/alerts/active?zone=${zoneId}`, {
      headers: {
        "User-Agent": "DisasterPrepApp (disaster@example.com)",
        "Accept": "application/ld+json"
      }
    })

    const data = await response.json();
    return data.features;
  }

  async function fetchLocalAlerts() {
    if (!location) return;

    const {latitude, longitude} = location.coords;

    const zoneId = await getNWSZone(latitude, longitude);
    const alerts = await getAlerts(zoneId);

    setAlerts(alerts);
  }

  useEffect(() => {
    if (!location) return;

    fetchLocalAlerts();

    const interval = setInterval(() => {
      fetchLocalAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [location]);

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

  if (errorMsg !== null) {
    //There's been an error
    return (
      <View style={styles.container}>
        <Text>There's been an error: {errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    //waiting
    return (
      <View style={styles.container}>
        <Text>Getting location...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resource Hub</Text>
      {alerts.length === 0 && (
        <Card style={[styles.alertCard, alertStyles.info]}>
          <Card.Content>
            <Text>
              No active alerts for your area.
            </Text>
          </Card.Content>
        </Card>
      )}
      {alerts.map(alert => {
        const event = alert.properties.event;
        const headline = alert.properties.headline;
        const severity = alert.properties.severity;

        const styleKey =
          severity === 'Severe' ? 'danger' :
          severity === 'Moderate' ? 'warning' :
          'info';
        
        return (
          <Card
            key={alert.id}
            style={[styles.alertCard, alertStyles[styleKey]]}
          >
            <Card.Content style={styles.alertContent}>
              <Avatar.Icon size={40} icon='alert' style={styles.alertIcon} />
              <View style={{marginLeft: 12}}>
                <Text variant='titleMedium'>{event}</Text>
                <Text variant='bodySmall'>{headline}</Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button mode='contained'>Learn More</Button>
            </Card.Actions>
          </Card>
        )
      })}
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