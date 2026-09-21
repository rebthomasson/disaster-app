import React, { use, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import MapView, { Polygon, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {IconButton} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { completeGoal } from '../entities/preparednessTracker';

//Displays the shelter maps page
export default function ShelterMaps() {
  const navigation = useNavigation();
  //User location and FEMA/NWS data
  const [location, setLocation] = useState(null);
  const [zonePolygon, setZonePolygon] = useState([]);
  const [shelters, setShelters] = useState([]);
  //Selected shelter popup
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  //Mark goal as completed once the location loads
  useEffect(() => {
    if (location) {
      completeGoal('shelterMap');
    }
  }, [location]);

  //Fetch the users location, NWS zone and FEMA shelters
  useEffect(() => {
    //Request location permission on device
    (async () => {
        try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("Location permission:", status);

        if (status !== 'granted') return;
        //Get user coordinates
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        //Fetch NWS zone ID
        const zoneId = await getZoneId(loc.coords.latitude, loc.coords.longitude);
        console.log("Zone ID:", zoneId);
        // Fetch zone geometry
        const geometry = await getZoneGeometry(zoneId);
        console.log("Zone geometry:", geometry);
        
        if (geometry && geometry.coordinates) {
            const polygon = convertGeoPolygon(geometry);
            setZonePolygon(polygon);
        } else {
            console.log("No geometry available for this zone");
        }
        //Fetch the FEMA shelter data based on location
        console.log("Calling fetchShelters()");
        const shelterData = await fetchShelters();
        console.log("FEMA shelters:", shelterData.length);

        setShelters(shelterData);
        } catch (err) {
        console.log("ERROR IN ShelterMaps useEffect:", err);
        }
    })();
    }, []);
  //Fetch NWS zone ID for the latitude and longitude
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
  //Fetch the polygon geometry for the NWS zone
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
  //Fetch any open FEMA shelters from the API
  async function fetchShelters() {
    const url =
        "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query" +
        "?where=1%3D1" +
        "&outFields=*" +
        "&returnGeometry=true" +  
        "&f=json";

    const res = await fetch(url, {
        headers: {
        "User-Agent": "DisasterPrepApp (rebekah@example.com)"
        }
    });
    //Parse manually if the API returns HTML instead of JSON
    const text = await res.text();   // Readd the raw text first

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
    //Data normalization for the FEMA shelter fields
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

  //Convert the NWS polygon coordinates to a Mapview format
  function convertGeoPolygon(geometry) {
    const coords = geometry.coordinates[0];
    return coords.map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon
    }));
  }
  //Placeholder evacuation route (developed later)
  const sampleRoute = [
    { latitude: 44.95, longitude: -93.34 },
    { latitude: 44.96, longitude: -93.30 },
    { latitude: 44.98, longitude: -93.28 },
  ];
  //Loading the map (let's the user know what's happening)
  if (!location) {
    return (
      <SafeAreaView>
        <View>
          <Text>Loading map…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{flex: 1}}>
        <IconButton
            icon="arrow-left"
            size={30}
            style={{
              position: 'absolute',
              top: 50,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(215, 203, 240, 0.8)',
              borderRadius: 20,
              padding: 5,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()}
        />
        {/**Legend to help users understand the map */}
        <IconButton
            icon='information-outline'
            size={30}
            mode='contained'
            style={{ position: 'absolute', top: 50, right: 10, zIndex: 9999, elevation: 10, backgroundColor: 'rgba(215, 203, 240, 0.8)', borderRadius: 20 }}
            onPress={() => {
                setShowLegend(!showLegend);
            }}
        />
        {/** Show the legend fields*/}
        {showLegend && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendItem}>
              <View style={styles.legendColorBox} />
              <MaterialCommunityIcons name="map-marker" size={20} color="black" />
              <Text style={styles.legendText}>Your Location</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendColorBox} />
              <MaterialCommunityIcons name="home-heart" size={20} color="black" />
              <Text style={styles.legendText}>Shelter</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={{width: 5, height: 20, backgroundColor: 'rgba(255,0,0,0.8)', marginRight: 5}} />
              <Text style={styles.legendText}>Suggested Evacuation Route</Text>
            </View>
          </View>
        )}
        {/**Create the main map using mapview component */}
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            }}
            >
              {/**Marks the user's location */}
            <Marker
                coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
                }}
                title="You are here"
            />
            {/**NWS polygon */}
            {zonePolygon.length > 0 && (
                <Polygon
                coordinates={zonePolygon}
                strokeColor="rgba(0,0,255,0.8)"
                fillColor="rgba(0,0,255,0.2)"
                strokeWidth={2}
                />
            )}
            {/**Example evacuation route */}
            <Polyline
                coordinates={sampleRoute}
                strokeColor="red"
                strokeWidth={4}
            />
            {/**FEMA shelters */}
            {shelters.map(shelter => (
                <Marker
                    key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}
                    coordinate={{
                        latitude: shelter.latitude,
                        longitude: shelter.longitude
                    }}
                    onPress={() => {
                        console.log('Pressed shelter:', shelter); // debug
                        setSelectedShelter(shelter);
                    }}
                >
                  <MaterialCommunityIcons name="home-heart" size={28} color="black" />
                </Marker>
            ))}
            </MapView>
            {/**Shows information about the shelter */}
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
  },
  legendContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    padding:20,
    borderRadius: 8,
    elevation: 5,
    zIndex: 1000,
    marginRight: 10,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flex: 1,
    marginLeft: 5,
    flexDirection: 'row',
    marginBottom: 10,
  },
  legendColorBox: {
    width: 5,
    height: 20,
    backgroundColor: 'rgba(0,0,255,0.5)',
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    marginLeft: 7,
  },
});
