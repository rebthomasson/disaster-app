import { Modal, View, Text, Button } from 'react-native';

export default function GameOver({visible, startOver}) {
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                <View style={{ backgroundColor: 'lightblue', padding:20, borderRadius: 10}}>
                    <Text style={{fontSize:22, fontWeight: 'bold', marginBottom:10, textAlign: 'center'}}>Game Over!</Text>
                    <Button title='Start Over' onPress={startOver} />
                </View>
            </View>
        </Modal>
    );
}