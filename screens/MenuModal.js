import React from 'react';
import {Modal, Portal, Card, Button, Text} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';

export default function MenuModal({visible, onDismiss, navigation}) {
    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <Card>
                    <Card.Title title="Menu" />
                      <Card.Content>
                        <Button 
                          mode="contained"
                          onPress={onDismiss}
                          style={styles.button}
                        >
                          Resume
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => {onDismiss(); navigation.navigate('Resources')}}
                          style={styles.button}>
                          Resource Hub
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => {onDismiss(); navigation.navigate('Home')}}
                          style={styles.button}
                        >
                          Home
                        </Button>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    button: {
        marginVertical: 10,
    },
});