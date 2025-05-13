import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Add Meal',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="camera-alt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
