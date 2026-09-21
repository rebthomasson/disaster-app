import { Modal, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyles } from '../theme/globalStyles';

//Modal that appears when a task tile has been found
export default function TaskModal({ visible, task, onClose, onStartQuiz }) {
  //Don't render the modal if no task is provided
  if (!visible || !task) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/** Background overlay for dimming the game screen*/}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={globalStyles.modalCard}>
          <Text style={globalStyles.modalTitle}>Task</Text>
          <Text style={globalStyles.modalBody}>{task.text}</Text>
          {/**Quiz button (only if a task is a quiz task) */}
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
            //Close button only for non-quiz tasks
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
