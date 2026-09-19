import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

export default function GameOver({ visible, startOver }) {
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
          <Text style={globalStyles.modalTitle}>Game Over</Text>

          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={startOver}
          >
            <Text style={globalStyles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
