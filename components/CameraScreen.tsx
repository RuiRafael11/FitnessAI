import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { ImageManipulator } from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { getFoodByName, saveMeal } from '../services/firebase';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Replace with your Google Cloud Vision API key
const GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_API_KEY';

interface CameraScreenProps {
  userId: string;
  onFoodDetected?: (calories: number) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ userId, onFoodDetected }) => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<Camera>(null);

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No access to camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const toggleTorch = () => {
    setTorch(current => !current);
  };

  const analyzeImage = async (base64Image: string) => {
    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'LABEL_DETECTION',
                    maxResults: 5,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const labels = data.responses[0].labelAnnotations;
      
      // Find the most likely food item
      const foodLabel = labels.find((label: any) => 
        label.description.toLowerCase().includes('food') ||
        label.description.toLowerCase().includes('dish') ||
        label.description.toLowerCase().includes('meal')
      );

      if (foodLabel) {
        const food = await getFoodByName(foodLabel.description);
        if (food) {
          await saveMeal(userId, {
            foodId: foodLabel.description,
            timestamp: new Date(),
            quantity: 1,
          });
          onFoodDetected?.(food.calories);
          return food;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setScanning(true);
      const photo = await cameraRef.current.takePictureAsync();
      
      // Compress and convert to base64
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { base64: true }
      );

      if (manipResult.base64) {
        const result = await analyzeImage(manipResult.base64);
        if (!result) {
          alert('No food detected in the image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      alert('Error taking picture. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={torch ? 'torch' : 'off'}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={toggleTorch}>
            <MaterialIcons
              name={torch ? 'flash-on' : 'flash-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.scanButton]}
            onPress={takePicture}
            disabled={scanning}>
            {scanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.scanText}>Scan Food</ThemedText>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <MaterialIcons name="flip-camera-ios" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    paddingHorizontal: 30,
    backgroundColor: '#4A90E2',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 