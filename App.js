import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import GameBoard from "./screens/GameBoard"; 
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// function HomeScreen({navigation}) {
//   return (
//     <SafeAreaProvider>
//       <PaperProvider>
//         <GameBoard />
//       </PaperProvider>
//     </SafeAreaProvider>
//   );
// }

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Home" options={{headerShown: false}} component={HomeScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <GameBoard />
      </PaperProvider>
    </SafeAreaProvider>
  )
}
