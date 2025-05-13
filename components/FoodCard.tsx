import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface FoodCardProps {
  name: string;
  calories: number;
  imageUrl?: string;
  onPress?: () => void;
}

export function FoodCard({ name, calories, imageUrl, onPress }: FoodCardProps) {
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        <ThemedText style={styles.calories}>{calories} cal</ThemedText>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  calories: {
    fontSize: 14,
    color: '#666',
  },
}); 