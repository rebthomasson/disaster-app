import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

//Creates the modal for when the user completes all the levels
export default function Victory({ visible, startOver, navigation, levelScore, xpGained }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/**Background overlay to dim the game */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        {/**Victory message box */}
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>🎉 You made it through all disasters!</Text>
          {/**Display the game stats */}
          <Text style={globalStyles.modalBody}>Score: {levelScore}</Text>
          <Text style={globalStyles.modalBody}>XP gained: {xpGained}</Text>
          {/**Button to restart the game */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={startOver}
          >
            <Text style={globalStyles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>
          {/**Button to go back to the home screen */}
          <TouchableOpacity
            style={globalStyles.outlineButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={globalStyles.outlineButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
