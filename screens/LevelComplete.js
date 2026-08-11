import { Modal, View, Text, Button } from 'react-native';

export default function LevelComplete({visible, goToNextLevel, levelScore, xpGained}) {
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                <View style={{ backgroundColor: 'lightblue', padding:20, borderRadius: 10}}>
                    <Text style={{fontSize:18, marginBottom:10}}>Level Complete!</Text>
                    <Text style={{fontSize:18, marginBottom:10}}>Score: {levelScore}</Text>
                    <Text style={{fontSize:18, marginBottom:10}}>XP gained: {xpGained}</Text>
                    <Button title='Next Level' onPress={goToNextLevel} />
                </View>
            </View>
        </Modal>
    );
}