import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import GameBoard from "./screens/GameBoard"; 
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ResourceHub from './screens/ResourceHub';
import ShelterMaps from './screens/ShelterMaps';
import HomeScreen from './screens/HomeScreen';
import EmergencyContacts from './screens/Contacts';
import Prepare from './screens/Prepare';
import FAQs from './screens/FAQScreen';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FamilyPlan from './screens/FamilyPlan';
import EmergencyKit from './screens/EmergencyKit';
import { theme } from './theme/theme';

const Tab = createBottomTabNavigator();

const ResourceStack = createStackNavigator();

const PrepareStack = createStackNavigator();

function ResourceScreen() {
  return (
    <ResourceStack.Navigator screenOptions={{headerShown: false}}>
      <ResourceStack.Screen name="ResourceHub" component={ResourceHub}/>
      <ResourceStack.Screen name="ShelterMaps" component={ShelterMaps}/>
      <ResourceStack.Screen name="EmergencyContacts" component={EmergencyContacts}/>
      <ResourceStack.Screen name="FAQs" component={FAQs}/>
    </ResourceStack.Navigator>
  );
}

function PrepareScreen() {
  return (
    <PrepareStack.Navigator screenOptions={{headerShown: false}}>
      <PrepareStack.Screen name="Prepare" component={Prepare}/>
      <PrepareStack.Screen name="FamilyPlan" component={FamilyPlan}/>
      <PrepareStack.Screen name="EmergencyKit" component={EmergencyKit}/>
    </PrepareStack.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({route}) => ({
                headerShown: false,
                tabBarStyle: {backgroundColor: '#fff'},
                tabBarActiveTintColor: '#B33951',
                tabBarInactiveTintColor: '#777',

                tabBarIcon: ({color, size}) => {
                  let iconName;

                  if (route.name === 'Game') {
                    iconName = 'gamepad-variant';
                  } else if (route.name === 'Resources') {
                    iconName = 'book-open-page-variant';
                  } else if (route.name === 'Prepare') {
                    iconName = 'bag-personal';
                  } else if (route.name === 'Home') {
                    iconName = 'home';
                  }
                  return (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={size}
                      color={color}
                    />
                  );
                },
              })}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  tabBarLabel: 'Home',
                }}
              />
              <Tab.Screen
                name="Game"
                component={GameBoard}
                options={{
                  tabBarLabel: 'Game',
                }}
              />
              <Tab.Screen
                name='Resources'
                component={ResourceScreen}
                options={{
                  tabBarLabel: 'Resources',
                }}
              />
              <Tab.Screen
                name='Prepare'
                component={PrepareScreen}
                options={{
                  tabBarLabel: 'Prepare',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
