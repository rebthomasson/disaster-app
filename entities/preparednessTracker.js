//Functions to keep track of goals completed across the app
//Uses AsyncStorage from React Native to save goals
import AsyncStorage from "@react-native-async-storage/async-storage";

//Function to track the completed goals
export async function completeGoal(goalId) {
  // Load the saved goals
  const savedGoals = await AsyncStorage.getItem('completedGoals');

  const goals = savedGoals
    ? JSON.parse(savedGoals)
    : [];
  
  //Once a goal is completed, push it to the goals array
  if (!goals.includes(goalId)) {
    goals.push(goalId);

    await AsyncStorage.setItem(
      'completedGoals',
      JSON.stringify(goals)
    );
  }
}
//
export async function getCompletedGoals() {
  const savedGoals = await AsyncStorage.getItem(
    'completedGoals'
  );

  return savedGoals
    ? JSON.parse(savedGoals)
    : [];
}
//Async function to track when disaster FAQs have been read
export async function readFAQ(faqId) {
  const savedFAQs = await AsyncStorage.getItem(
    'readFAQs'
  );

  const readFAQs = savedFAQs
    ? JSON.parse(savedFAQs)
    : [];
  //Push the faqs that have been opened to readFAQs array
  if (!readFAQs.includes(faqId)) {
    readFAQs.push(faqId);

    await AsyncStorage.setItem(
      'readFAQs',
      JSON.stringify(readFAQs)
    );
  }
  //Complete goal when 3 FAQs have been read
  if (readFAQs.length >= 3) {
    await completeGoal('faq');
  }
}

//Track the progress of FAQs that have been read
export async function getFAQProgress() {
  const savedFAQs = await AsyncStorage.getItem(
    'readFAQs'
  );

  const readFAQs = savedFAQs
    ? JSON.parse(savedFAQs)
    : [];

  return readFAQs.length;
}