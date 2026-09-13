import AsyncStorage from "@react-native-async-storage/async-storage";

export async function completeGoal(goalId) {
  const savedGoals = await AsyncStorage.getItem('completedGoals');

  const goals = savedGoals
    ? JSON.parse(savedGoals)
    : [];
  
  if (!goals.includes(goalId)) {
    goals.push(goalId);

    await AsyncStorage.setItem(
      'completedGoals',
      JSON.stringify(goals)
    );
  }
}

export async function getCompletedGoals() {
  const savedGoals = await AsyncStorage.getItem(
    'completedGoals'
  );

  return savedGoals
    ? JSON.parse(savedGoals)
    : [];
}

export async function readFAQ(faqId) {
  const savedFAQs = await AsyncStorage.getItem(
    'readFAQs'
  );

  const readFAQs = savedFAQs
    ? JSON.parse(savedFAQs)
    : [];

  if (!readFAQs.includes(faqId)) {
    readFAQs.push(faqId);

    await AsyncStorage.setItem(
      'readFAQs',
      JSON.stringify(readFAQs)
    );
  }

  if (readFAQs.length >= 3) {
    await completeGoal('faq');
  }
}

export async function getFAQProgress() {
  const savedFAQs = await AsyncStorage.getItem(
    'readFAQs'
  );

  const readFAQs = savedFAQs
    ? JSON.parse(savedFAQs)
    : [];

  return readFAQs.length;
}