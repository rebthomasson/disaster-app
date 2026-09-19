import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

export default function TaskModal({ visible, task, onClose, onStartQuiz }) {
  if (!visible || !task) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>Task</Text>
          <Text style={globalStyles.modalBody}>{task.text}</Text>

          {task.quiz ? (
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={() => {
                onClose();
                onStartQuiz(task.quiz);
              }}
            >
              <Text style={globalStyles.primaryButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={globalStyles.outlineButton}
              onPress={onClose}
            >
              <Text style={globalStyles.outlineButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
