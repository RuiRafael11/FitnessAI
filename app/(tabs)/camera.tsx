import { StyleSheet } from 'react-native';
import { CameraScreen } from '../../components/CameraScreen';
import { useAuth } from '../../lib/auth';

export default function CameraTab() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <CameraScreen
      userId={user.uid}
      onFoodDetected={(calories) => {
        // TODO: Update dashboard with new calories
        console.log('Food detected with calories:', calories);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 