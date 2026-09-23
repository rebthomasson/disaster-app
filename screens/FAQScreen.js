import React, {useEffect} from 'react';
import {List, Text, IconButton, Card} from 'react-native-paper';
import {View, StyleSheet, ScrollView} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { readFAQ } from '../entities/preparednessTracker';
import { theme } from '../theme/theme';

//Array to manage the FAQ categories, questions and answers
const faqs = [
  {
    category: 'Emergency Kits',
    icon: 'bag-personal',
    questions: [
      {
        question: 'What should be included in an emergency kit?',
        answer: 'An emergency kit should include water, non-perishable food, flashlight, batteries, first aid supplies, medications, important documents, and other essentials for at least 72 hours.'
      },
      {
        question: 'How much water should I store?',
        answer: 'Store 1 gallon per day per person, and have at least 3 days worth of water on hand.'
      },
      {
        question: 'How often should I check my emergency kit?',
        answer: 'You should check your emergency kit at least once a year to ensure that all items are in good condition and that food and medications are not expired.'
      }
    ]
  },
  {
    category: 'Family Emergency Plans',
    icon: 'account-group',
    questions: [
      {
        question: 'What is a family emergency plan?',
        answer: 'A family emergency plan is a strategy that outlines how your family will communicate and where you will meet during an emergency. It should include contact information, evacuation routes, and designated meeting places.'
      },
      {
        question: 'How do I create a family emergency plan?',
        answer: 'To create a family emergency plan, discuss potential emergencies with your family, designate meeting spots, establish communication methods, and practice the plan regularly.'
      },
      {
        question: 'Why do I need an emergency contact?',
        answer: 'An emergency contact provides a reliable way to communicate with family members and emergency services during a disaster.'
      }
    ]
  },
  {
    category: 'Shelters & Evacuation',
    icon: 'home-group',
    questions: [
      {
        question: 'How do I find an emergency shelter?',
        answer: 'Use local government resources, emergency management agencies, or the shelter maps section of this app.',
      },
      {
        question: 'What should I bring to a shelter?',
        answer: 'Bring your emergency kit with you (includes medications, identification, documents, hygiene supplies, and any essential personal items).'
      },
      {
        question: 'Can I bring pets to a shelter?',
        answer: 'Some shelters accept pets, while others do not. Check local shelter information before evacuating.'
      }
    ]
  },
  {
    category: 'Flood Safety',
    icon: 'waves',
    questions: [
      {
        question: 'What should I do if I receive an evacuation order?',
        answer: 'If you receive an evacuation order, follow the instructions provided by local authorities and leave the area immediately.'
      },
      {
        question: 'Should I drive through floodwaters?',
        answer: 'You should never drive through floodwaters. Turn around and find an alternative route.'
      },
    ]
  },
  {
    category: 'Fire Safety',
    icon: 'fire',
    questions: [
      {
        question: 'What should I do if there is a wildfire near my area?',
        answer: 'If there is a wildfire near your area, follow evacuation orders, stay informed through local news and alerts, and have an emergency kit ready.'
      },
      {
        question: 'How can I prevent wildfires around my home?',
        answer: 'To prevent wildfires around your home, clear flammable materials, maintain a defensible space, and follow local fire safety regulations.'
      },
      {
        question: 'What should I do before evacuating?',
        answer: 'Follow local evacuation instructions, gather your emergency kit, secure your home if time allows, and leave immediately when directed.'
      }
    ]
  }
];

//Function to create the FAQ page
export default function FAQs({navigation}) {
  useEffect(() => {

  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView contentContainerStyle={{padding: 10}}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="help-circle"
            size={40}
            color={theme.colors.text}
          />
          <IconButton
            icon="arrow-left"
            size={25}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              padding: 5,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()} //Return to resource hub
          />
          {/**Header for the FAQ page */}
          <View style={{marginLeft: 12}}>
            <Text style={styles.title}>
              Disaster FAQs
            </Text>
            <Text style={styles.subtitle}>
              Learn how to stay prepared
            </Text>
          </View>
        </View>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant='titleMedium'>
              Frequently Asked Questions
            </Text>
            <Text>
              Browse common questions about emergency planning, disaster preparedness, evacuation and safety.
            </Text>
          </Card.Content>
        </Card>
        {/**Creates a list section using react-native-paper component for FAQ questions */}
        <List.Section>
          {/** Maps the category to section headers*/}
          {faqs.map(category => (
            <List.Accordion
              key={category.category}
              title={category.category}
              left={() => (
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  style={{paddingLeft: 10, color: theme.colors.primary}}
                />
              )}
              style={{flexWrap: 'wrap'}}
            >
              {/** Maps the questions to a list.accordion component*/}
              {category.questions.map(q => (
                <List.Accordion
                  key={q.question}
                  title={q.question}
                  titleNumberOfLines={3}
                  onPress={() => 
                    readFAQ(`${category.category}-${q.question}`) //Mark the FAQ as read
              }
                >
                  <View style={styles.answer}>
                    <Text style={{fontFamily: theme.fonts.regular}}>
                      {q.answer}
                    </Text>
                  </View>
                </List.Accordion>
              ))}
            </List.Accordion>
          ))}
        </List.Section>
      </ScrollView>
    </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.text,
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.border,
    elevation: 4,
  },
  answer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    fontFamily: theme.fonts.regular
  }
})