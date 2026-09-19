import { Modal, View, Text, Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

export default function LevelComplete({ visible, goToNextLevel, levelScore, xpGained, navigation }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>Level Complete!</Text>
          <Text style={globalStyles.modalBody}>Score: {levelScore}</Text>
          <Text style={globalStyles.modalBody}>XP gained: {xpGained}</Text>

          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={goToNextLevel}
          >
            <Text style={globalStyles.primaryButtonText}>Next Level</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={globalStyles.primaryButtonText}>Leave Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
