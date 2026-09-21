import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

//Creates the item modal for when items are collected in the game
export default function ItemModal({ item, onClose }) {
  //If there isn't an item selected, don't render the modal
  if (!item) return null;

  return (
    <Modal visible={!!item} transparent animationType="fade">
      {/** Dims the background when the modal appears*/}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        {/** Display the content of the item modal*/}
        <View style={globalStyles.modalCard}>
          {/** Item name*/}
          <Text style={globalStyles.modalTitle}>{item.name}</Text>
          {/**Item description */}
          <Text style={globalStyles.modalBody}>{item.info}</Text>
          {/**Button to return to the game */}
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
