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
import EvacuationMaps from './screens/EvacuationMaps';

const Tab = createBottomTabNavigator();

function HomeScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Game Board"
        onPress={() => navigation.navigate('Game', {
          screen: 'GameBoard'
        })}
      />
    </View>
  );
}

const GameStack = createStackNavigator();

function GameStackScreen() {
  return (
    <GameStack.Navigator screenOptions={{headerShown: false}}>
      <GameStack.Screen name='Home' component={HomeScreen} />
      <GameStack.Screen name='GameBoard' component={GameBoard} />
    </GameStack.Navigator>
  )
}

const ResourceStack = createStackNavigator();

function ResourceScreen() {
  return (
    <ResourceStack.Navigator screenOptions={{headerShown: false}}>
      <ResourceStack.Screen name="ResourceHub" component={ResourceHub}/>
      <ResourceStack.Screen name="EvacuationMaps" component={EvacuationMaps}/>
    </ResourceStack.Navigator>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {backgroundColor: '#fff'},
              tabBarActiveTintColor: '#1976D2',
              tabBarInactiveTintColor: '#777'
            }}
          >
            <Tab.Screen
              name="Game"
              component={GameStackScreen}
              options={{
                tabBarLabel: 'Game',
              }}
            />
            <Tab.Screen
              name='ResourceHub'
              component={ResourceScreen}
              options={{
                tabBarLabel: 'Resources',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
