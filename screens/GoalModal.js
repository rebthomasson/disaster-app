import { Modal, View, Text, Button } from 'react-native';

export default function GoalModal({ onClose, visible, level }) {
    if (!visible || !level) {
        return null;
    }
    return (
        <Modal visible={true} transparent animationType='fade'>
            <View style={{
                flex:1,
                justifyContent:'center',
                alignItems:'center',
                backgroundColor:'rgba(0,0,0,0.5)'
            }}>
                <View style={{
                    backgroundColor: 'lightblue',
                    padding:20,
                    borderRadius: 10,
                    width: '80%'
                }}>
                    <Text style={{fontSize:24, marginBottom:10, alignItems: 'center', fontWeight: 'bold'}}>
                        {level.name}
                    </Text>
                    <Text style={{fontSize:18, marginBottom:10, alignItems: 'center'}}>
                        {level.goal}
                    </Text>
                    <Button title='Start Level' onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}