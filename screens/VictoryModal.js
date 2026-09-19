import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

export default function Victory({ visible, startOver, navigation, levelScore, xpGained }) {
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
          <Text style={globalStyles.modalTitle}>🎉 You made it through all disasters!</Text>
          <Text style={globalStyles.modalBody}>Score: {levelScore}</Text>
          <Text style={globalStyles.modalBody}>XP gained: {xpGained}</Text>

          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={startOver}
          >
            <Text style={globalStyles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>

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
