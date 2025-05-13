import { CalorieCircle } from '@/components/CalorieCircle';
import { CameraScreen } from '@/components/CameraScreen';
import { ThemedView } from '@/components/ThemedView';
import { getUserDailyCalories } from '@/services/firebase';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// Temporary user ID until authentication is implemented
const TEMP_USER_ID = 'demo_user';
const DAILY_CALORIE_GOAL = 2000;

export default function HomeScreen() {
  const [currentCalories, setCurrentCalories] = useState(0);

  useEffect(() => {
    loadDailyCalories();
  }, []);

  const loadDailyCalories = async () => {
    const calories = await getUserDailyCalories(TEMP_USER_ID, new Date());
    setCurrentCalories(calories);
  };

  const handleFoodDetected = (calories: number) => {
    setCurrentCalories(current => current + calories);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.calorieContainer}>
        <CalorieCircle
          currentCalories={currentCalories}
          dailyGoal={DAILY_CALORIE_GOAL}
        />
      </ThemedView>
      <ThemedView style={styles.cameraContainer}>
        <CameraScreen
          userId={TEMP_USER_ID}
          onFoodDetected={handleFoodDetected}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calorieContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 2,
  },
});
