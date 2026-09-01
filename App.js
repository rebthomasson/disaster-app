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

const Tab = createBottomTabNavigator();

function HomeScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Game Board"
        onPress={() => navigation.navigate('GameBoard')}
      />
    </View>
  );
}

function GameStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='GameBoard' component={GameBoard} />
    </Stack.Navigator>
  )
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
              component={GameStack}
              options={{
                tabBarLabel: 'Game',
              }}
            />
            <Tab.Screen
              name='ResourceHub'
              component={ResourceHub}
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
