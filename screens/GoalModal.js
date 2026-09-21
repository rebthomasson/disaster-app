import { Modal, View, Text, Button, Linking } from 'react-native';
import { theme } from '../theme/theme';
import { globalStyles } from '../theme/globalStyles';
import { TouchableOpacity } from 'react-native';

//Goal modal to display the level goals before starting
export default function GoalModal({ onClose, visible, level }) {
    if (!visible || !level) {
        return null;
    }
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{
                flex:1,
                justifyContent:'center',
                alignItems:'center',
                backgroundColor:'rgba(0,0,0,0.5)'
            }}>
                {/**Display the modal content including level name, goal and readings */}
                <View style={globalStyles.modalCard}>
                    <Text style={globalStyles.modalTitle}>
                        {level.name}
                    </Text>
                    <Text style={globalStyles.modalBody}>
                        {level.goal}
                    </Text>
                    <Text style={globalStyles.modalBody}>
                        {level.reading}
                    </Text>
                    <TouchableOpacity
                        style={globalStyles.primaryButton}
                        //Link the optional reading before the level
                        onPress={() =>
                            Linking.openURL(level.article_url)
                        }
                    >
                        <Text style={globalStyles.primaryButtonText}>View Reading</Text>
                    </TouchableOpacity>
                    {/** Begin level button*/}
                    <View style={{marginVertical: 10}}>
                        <TouchableOpacity
                            style={globalStyles.primaryButton}
                            onPress={onClose}
                        >
                            <Text style={globalStyles.primaryButtonText}>Start Level</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}