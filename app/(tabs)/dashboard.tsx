import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalorieCircle } from '../../components/CalorieCircle';
import { FoodCard } from '../../components/FoodCard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../lib/auth';
import { DailyCalorieSummary, getUserDailyCalories } from '../../services/firebase';

const DAILY_CALORIE_GOAL = 2000;

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailySummary, setDailySummary] = useState<DailyCalorieSummary>({
    totalCalories: 0,
    meals: [],
    date: new Date()
  });

  const loadDailySummary = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const summary = await getUserDailyCalories(user.uid, new Date());
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading daily summary:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDailySummary();
  }, [loadDailySummary]);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

  const progress = dailySummary.totalCalories / DAILY_CALORIE_GOAL;

  const navigateToCamera = useCallback(() => {
    router.push('/camera' as any); // TODO: Fix type when expo-router types are updated
  }, [router]);

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <CalorieCircle
          currentCalories={dailySummary.totalCalories}
          dailyGoal={DAILY_CALORIE_GOAL}
        />
        <ThemedText style={styles.dateText}>
          {format(dailySummary.date, 'EEEE, MMMM d')}
        </ThemedText>
      </View>

      <View style={styles.mealList}>
        <View style={styles.mealListHeader}>
          <ThemedText style={styles.title}>Today's Meals</ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={navigateToCamera}>
            <MaterialIcons name="add" size={20} color="#4A90E2" />
            <ThemedText style={styles.addButtonText}>Add Meal</ThemedText>
          </TouchableOpacity>
        </View>

        {dailySummary.meals.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="restaurant" size={48} color="#E0E0E0" />
            <ThemedText style={styles.emptyStateText}>
              No meals logged today
            </ThemedText>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={navigateToCamera}>
              <ThemedText style={styles.emptyStateButtonText}>
                Scan your first meal
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={dailySummary.meals}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4A90E2']}
              />
            }
            renderItem={({ item }) => (
              <FoodCard
                name={item.foodId}
                calories={item.calories}
                onPress={() => {
                  // TODO: Navigate to meal details
                  console.log('Meal pressed:', item);
                }}
              />
            )}
            contentContainerStyle={styles.mealListContent}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToCamera}>
        <MaterialIcons name="camera-alt" size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  mealList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mealListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#4A90E2',
    fontSize: 16,
  },
  mealListContent: {
    paddingBottom: 80, // Space for FAB
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 