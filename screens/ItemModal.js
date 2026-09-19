import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

export default function ItemModal({ item, onClose }) {
  if (!item) return null;

  return (
    <Modal visible={!!item} transparent animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>{item.name}</Text>
          <Text style={globalStyles.modalBody}>{item.info}</Text>

          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={onClose}
          >
            <Text style={globalStyles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
