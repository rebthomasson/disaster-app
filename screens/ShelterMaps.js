import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {IconButton} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShelterMaps() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [zonePolygon, setZonePolygon] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    (async () => {
        try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("Location permission:", status);

        if (status !== 'granted') return;

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const zoneId = await getZoneId(loc.coords.latitude, loc.coords.longitude);
        console.log("Zone ID:", zoneId);

        const geometry = await getZoneGeometry(zoneId);
        console.log("Zone geometry:", geometry);

        if (geometry && geometry.coordinates) {
            const polygon = convertGeoPolygon(geometry);
            setZonePolygon(polygon);
        } else {
            console.log("No geometry available for this zone");
        }

        console.log("Calling fetchShelters()");
        const shelterData = await fetchShelters();
        console.log("FEMA shelters:", shelterData.length);

        setShelters(shelterData);
        } catch (err) {
        console.log("ERROR IN ShelterMaps useEffect:", err);
        }
    })();
    }, []);

  async function getZoneId(lat, lon) {
    const res = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: {
        "User-Agent": "DisasterPrepApp (disaster@example.com)",
        "Accept": "application/geo+json"
      }
    });
    const data = await res.json();
    return data.properties.forecastZone;
  }

  async function getZoneGeometry(zoneId) {
    const res = await fetch(`https://api.weather.gov/zones/forecast/${zoneId}`, {
      headers: {
        "User-Agent": "DisasterPrepApp (disaster@example.com)",
        "Accept": "application/geo+json"
      }
    });
    const data = await res.json();
    return data.geometry;
  }

  async function fetchShelters() {
    const url =
        "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query" +
        "?where=1%3D1" +
        "&outFields=*" +
        "&returnGeometry=true" +   // ⭐ REQUIRED
        "&f=json";

    const res = await fetch(url, {
        headers: {
        "User-Agent": "DisasterPrepApp (rebekah@example.com)"   // ⭐ REQUIRED
        }
    });

    const text = await res.text();   // ⭐ Read raw text first

    console.log("RAW FEMA RESPONSE TEXT:", text.slice(0, 200));

    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.log("JSON PARSE FAILED — RESPONSE WAS HTML");
        return [];
    }

    if (!data.features) {
        console.log("No features field in FEMA response");
        return [];
    }

    console.log("FEMA features count:", data.features.length);

    return data.features.map(f => ({
        id: f.attributes.objectid,
        name: f.attributes.shelter_name,
        latitude: f.geometry?.y,
        longitude: f.geometry?.x,
        address: f.attributes.address,
        city: f.attributes.city,
        state: f.attributes.state,
        zip: f.attributes.zip,
        status: f.attributes.shelter_status,
        capacity: f.attributes.evacuation_capacity,
        population: f.attributes.total_population,
        org: f.attributes.org_name,
    }));
  }


  function convertGeoPolygon(geometry) {
    const coords = geometry.coordinates[0];
    return coords.map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon
    }));
  }

  const sampleRoute = [
    { latitude: 44.95, longitude: -93.34 },
    { latitude: 44.96, longitude: -93.30 },
    { latitude: 44.98, longitude: -93.28 },
  ];

  if (!location) return <View><Text>Loading map…</Text></View>;

  return (
    <View style={{flex: 1}}>
        <IconButton
            icon="arrow-left"
            size={30}
            style={{
              position: 'absolute',
              top: 40,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              padding: 5,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()}
        />
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            }}
            >
            <Marker
                coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
                }}
                title="You are here"
            />

            {zonePolygon.length > 0 && (
                <Polygon
                coordinates={zonePolygon}
                strokeColor="rgba(0,0,255,0.8)"
                fillColor="rgba(0,0,255,0.2)"
                strokeWidth={2}
                />
            )}

            <Polyline
                coordinates={sampleRoute}
                strokeColor="red"
                strokeWidth={4}
            />
            {shelters.map(shelter => (
                <Marker
                    key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}
                    coordinate={{
                        latitude: shelter.latitude,
                        longitude: shelter.longitude
                    }}
                    image={require('../assets/shelter.png')}
                    onPress={() => {
                        console.log('Pressed shelter:', shelter); // debug
                        setSelectedShelter(shelter);
                    }}
                >
                </Marker>
            ))}
            </MapView>
            {selectedShelter && (
                <View style={styles.floatingPanel}>
                    <Text style={styles.panelTitle}>{selectedShelter.name}</Text>
                    <Text>{selectedShelter.address}</Text>
                    <Text>{selectedShelter.city}, {selectedShelter.state}</Text>
                    <Text>Status: {selectedShelter.status}</Text>
                    <Text>Capacity: {selectedShelter.capacity}</Text>

                    <Text
                    style={styles.closeButton}
                    onPress={() => setSelectedShelter(null)}
                    >
                    Close
                    </Text>
                </View>
            )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  floatingPanel: {
    position: "absolute",
    bottom: 65,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 12,
    color: "blue",
    fontWeight: "bold",
  }
});
