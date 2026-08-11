import { Modal, View, Text, Button } from 'react-native';

export default function ItemModal({ item, onClose }) {
    if (!item) return null;

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
                    borderRadius: 10
                }}>
                    <Text style={{fontSize:24, marginBottom:10, alignItems: 'center', fontWeight: 'bold'}}>
                        {item.name}
                    </Text>
                    <Text style={{fontSize:18, marginBottom:10, alignItems: 'center'}}>
                        {item.info}
                    </Text>
                    <Button title='Close' onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}