import React, { useState, useEffect } from 'react';
import {ScrollView, StyleSheet, View, Linking, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Card, Text, Avatar, Button, List} from 'react-native-paper';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Array for the resource hub for different screen links
const resources = [
  {
    title: 'Disaster Shelter Maps',
    screen: 'ShelterMaps',
    icon: 'map'
  },
  {
    title: 'Emergency Contacts',
    screen: 'EmergencyContacts',
    icon: 'phone'
  },
  {
    title: 'Disaster FAQs',
    screen: 'FAQs',
    icon: 'help-circle'
  },
]

//Creates a mock alert to simulate a tornado warning for testing the feature
const mockAlerts = [
  {
    id: "test-alert-001",
    properties: {
      id: "https://api.weather.gov/alerts/",
      event: "Tornado Warning",
      severity: "Severe",
      certainty: "Likely",
      urgency: "Immediate",
      headline: "TEST ALERT — Tornado Warning",
      description: "This is a simulated tornado warning for testing.",
      instruction: "Seek shelter immediately. This is only a test.",
      effective: new Date().toISOString(),
      expires: new Date(Date.now() + 3600000).toISOString(),
    }
  }
]

//Function for creating the resource hub screen
export default function ResourceHub({navigation}) {

  //State management
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showGuides, setShowGuides] = useState(false);
  const [TESTING_MODE, setTestingMode] = useState(false);
  const ALERT_CACHE = 'cachedWeatherAlerts';

  //Cache weather alerts for use when offline
  async function saveAlerts(alerts) {
    try {
      await AsyncStorage.setItem(
        ALERT_CACHE,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          alerts,
        })
      );
    } catch (error) {
      console.log('Failed to cache alerts:', error);
    }
  }

  async function loadCachedAlerts() {
    try {
      const cached = await AsyncStorage.getItem(ALERT_CACHE);

      if (!cached) return null;

      return JSON.parse(cached);
    } catch (error) {
      console.log('Failed to load cached alerts: ', error);
      return null;
    }
  }

  //Requests users location permission and fetches location if granted
  useEffect(() => {
    const getLocation = async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    };

    getLocation();
  }, []);

  //Fetch the NWS zone from user's coordinates
  async function getNWSZone(lat, lon) {
    const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: {
        "User-Agent": "DisasterPrepApp (disaster@example.com)",
        "Accept": "application/ld+json"
      }
    });

    const data = await response.json();

    return data?.properties?.forecastZone ?? null;
  }

  //Fetches the active alerts for a given NWS zone
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

  //Fetch alerts based on the user's location
  async function fetchLocalAlerts() {
    if (!location) return;

    try {
      const {latitude, longitude} = location.coords;

      const zoneId = await getNWSZone(latitude, longitude);

      if (!zoneId) {
        console.log('No zone found');
        return;
      }

      const alerts = await getAlerts(zoneId);

      setAlerts(alerts);

      await saveAlerts(alerts);
    } catch (error) {
      console.log('Failed to fetch live alerts: ', error);

      const cachedData = await loadCachedAlerts();

      if (cachedData?.alerts) {
        console.log('Using cached alerts');
        setAlerts(cachedData.alerts);
      }
    }
  }

  useEffect(() => {
    async function initializeAlerts() {
      const cache = await loadCachedAlerts();

      if (cache?.alerts) {
        console.log('Using cached alerts');
        setAlerts(cache.alerts);
      }
    }
    initializeAlerts();
  }, []);

  //Suto-refreshes the alerts every 30 secs when testing mode isn't enabled
  useEffect(() => {
    if (!location) return;

    async function fetchAlertsWrapper() {
      if(TESTING_MODE) {
        setAlerts(mockAlerts); //Use mock data in testing mode
      } else {
        setAlerts([]); //Clears the old alerts
        await fetchLocalAlerts(); 
      }
    }

    fetchAlertsWrapper();

    if (TESTING_MODE) return; //Skips the interval when testing mode

    const interval = setInterval(() => {
      fetchAlertsWrapper();
    }, 30000);

    return () => clearInterval(interval);
  }, [location, TESTING_MODE]);
  //Styles for active alerts and different severity levels
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
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.border,
    },
  }
  //Error state when location is denied
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
      <SafeAreaView style={styles.container}>
        <Text>Getting location...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="shield-alert"
            size={40}
            color={theme.colors.text}
          />
          <View style={{marginLeft: 12}}>
            <Text style={styles.title}>Resource Hub</Text>
            <Text style={styles.subtitle}>
              Knowledge • Alerts • Preparedness
            </Text>
          </View>
        </View>
        {/** Testing mode toggle*/}
        <TouchableOpacity
          style={globalStyles.outlineButton}
          onPress={() => {
            const newMode = !TESTING_MODE;
            setTestingMode(newMode);

            if (newMode) {
              setAlerts(mockAlerts); // enable a test alert
            } else {
              setAlerts([]);
              fetchLocalAlerts(); // return to live alerts
            }
          }}
        >
          <Text style={globalStyles.outlineButtonText}>
            {TESTING_MODE ? "Disable Testing Mode" : "Enable Testing Mode"}
          </Text>
        </TouchableOpacity>

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
          const description = alert.properties.description;

          const styleKey =
            severity === 'Severe' ? 'danger' :
            severity === 'Moderate' ? 'warning' :
            'info';
          console.log("Alert object:", alert);
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
                  <Text variant='bodySmall' style={{marginTop: 5}}>{description}</Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <TouchableOpacity
                  style={globalStyles.primaryButton}
                  onPress={() => Linking.openURL(alert.properties.id)}
                >
                  <Text style={globalStyles.primaryButtonText}> Learn More </Text>
                </TouchableOpacity>
              </Card.Actions>
            </Card>
          )
        })}
        {/** Resouce nav cards*/}
        {resources.map((item) => (
          <Card
            key={item.title}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
          <Card.Title
            title={item.title}
            style={{color: theme.colors.text}}
            left={(props) => (
              <Avatar.Icon {...props} icon={item.icon} style={styles.cardIcon} />
            )}
          />
        </Card>
        ))}
        {/**Preparedness guides (links to government resources) */}
        <Card
          style={styles.card}
          onPress={() => setShowGuides(!showGuides)}
        >
          <Card.Title
            title="Preparedness Guides"
            left={(props) => (
              <Avatar.Icon {...props} icon={"bookmark"} style={styles.cardIcon} />
            )}
            right={() => (
              <MaterialCommunityIcons
                name={
                  showGuides
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={30}
                color={theme.colors.accent}
                style={{marginRight: 10}}
              />
            )}
          />
          {showGuides && (
            <Card.Content>
              <List.Item
                title="FEMA Citizen Preparedness Guide"
                description="Comprehensive preparedness handbook"
                onPress={() => 
                  Linking.openURL("https://www.fema.gov/related-link/are-you-ready-guide-citizen-preparedness")
                }
                style={{flexWrap: 'wrap'}}
              />
              <List.Item
                title="American Red Cross"
                description="How to Prepare for Emergencies"
                onPress={() => 
                  Linking.openURL("https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html")
                }
                style={{flexWrap: 'wrap'}}
              />
              <List.Item
                title="Ready.gov Resources"
                description="A variety of free publications on disaster preparedness"
                onPress={() => 
                  Linking.openURL("https://www.ready.gov/publications")
                }
                style={{flexWrap: 'wrap'}}
              />
            </Card.Content>
          )}
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
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  card: {
    marginBottom: 12,
    backgroundColor: theme.colors.text
  },
  cardIcon: {
    backgroundColor: theme.colors.background
  },
  alertCard: {
    marginBottom: 16,
    borderLeftWidth: 6,
    elevation: 4,
    backgroundColor: theme.colors.border
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