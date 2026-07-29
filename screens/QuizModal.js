import { Modal, View, Text, Button, TouchableOpacity } from 'react-native';
import React, {useState, useEffect} from 'react';

export default function QuizModal({ visible, quiz, onClose, onDone}) {
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [passedQuiz, setPassedQuiz] = useState(true);

    useEffect(() => {
        if (visible) {
            setIndex(0);
            setSelected(null);
            setFeedback(null);
            setPassedQuiz(true);
        }
    }, [visible, quiz]);

    if (!visible || !quiz) return null;

    const current = quiz[index];

    function submit() {
        const correct = selected === current.answer;

        if (index === quiz.length - 1) {
            onDone(correct);
            onClose();
        } else {
            setIndex(index + 1);
            setSelected(null);
        }
    }

    //Check each quiz answer and whether the user passed or not
    function checkAnswer(i) {
        setSelected(i);

        const isRight = i === current.answer;
        if (!isRight) {
            setPassedQuiz(false);
        }
        setFeedback(isRight ? 'correct' : 'incorrect');

        setTimeout(() => {
            setFeedback(null);
            setSelected(null);

            if (index === quiz.length - 1) {
                onDone(passedQuiz && isRight);
                onClose();
            } else {
                setIndex(index + 1);
            }
        }, 3000);
    }

    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                <View style={{ backgroundColor: 'lightblue', padding:20, borderRadius: 10}}>
                    <Text style={{fontSize:18, marginBottom:10}}>{current.question}</Text>

                    {current.options.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            disabled={feedback !== null}
                            title={opt}
                            onPress={() => checkAnswer(i)}
                            style={{
                                padding: 10,
                                marginVertical: 5,
                                borderRadius: 8,
                                backgroundColor: 
                                    feedback && i === current.answer
                                    ? "#4caf50"
                                    : selected === i ? '#b7b1b1' : '#ffffff',
                                borderWidth: 2,
                                borderColor: feedback && i === current.answer ? '#388e3c' : '#cccccc'
                            }}
                        >
                            <Text style={{ fontSize: 16, color: '#000', textAlign: 'center' }}>{opt}</Text>
                        </TouchableOpacity>
                    ))}

                    {feedback && (
                        <Text
                            style = {{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: feedback === 'correct' ? 'green' : 'red',
                                marginTop: 10,
                                textAlign: 'center'
                            }}
                        >
                            {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}