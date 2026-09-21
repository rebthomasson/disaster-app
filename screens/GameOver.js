import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

//Create the modal that appears when the user loses the game
export default function GameOver({ visible, startOver, navigation }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        {/**Modal card (content for the game over modal) */}
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>Game Over</Text>
          {/**Two buttons to either restart or return home */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={startOver}
          >
            <Text style={globalStyles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={globalStyles.primaryButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
