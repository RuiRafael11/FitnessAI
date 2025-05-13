import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SVGText } from 'react-native-svg';
import { ThemedText } from './ThemedText';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieCircleProps {
  currentCalories: number;
  dailyGoal: number;
}

const CIRCLE_LENGTH = 600;
const CIRCLE_RADIUS = CIRCLE_LENGTH / (2 * Math.PI);
const STROKE_WIDTH = 20;

export const CalorieCircle: React.FC<CalorieCircleProps> = ({
  currentCalories,
  dailyGoal,
}) => {
  const progress = useSharedValue(0);
  const percentage = (currentCalories / dailyGoal) * 100;

  useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1500 });
  }, [currentCalories, dailyGoal]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCLE_LENGTH * (1 - progress.value);
    
    // Color interpolation based on progress
    const colorProgress = interpolate(
      progress.value,
      [0, 0.5, 0.75, 1],
      [0, 120, 240, 360]
    );
    
    return {
      strokeDashoffset,
      stroke: `hsl(${120 - colorProgress}, 70%, 50%)`,
    };
  });

  return (
    <View style={styles.container}>
      <Svg style={styles.svg} width={CIRCLE_RADIUS * 2} height={CIRCLE_RADIUS * 2}>
        {/* Background Circle */}
        <Circle
          cx={CIRCLE_RADIUS}
          cy={CIRCLE_RADIUS}
          r={CIRCLE_RADIUS - STROKE_WIDTH / 2}
          stroke="#E5E5E5"
          strokeWidth={STROKE_WIDTH}
        />
        
        {/* Animated Progress Circle */}
        <AnimatedCircle
          cx={CIRCLE_RADIUS}
          cy={CIRCLE_RADIUS}
          r={CIRCLE_RADIUS - STROKE_WIDTH / 2}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCLE_LENGTH}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
        
        {/* Center Text */}
        <SVGText
          x={CIRCLE_RADIUS}
          y={CIRCLE_RADIUS - 10}
          fontSize="24"
          fill="#333333"
          textAnchor="middle">
          {Math.round(currentCalories)}
        </SVGText>
        <SVGText
          x={CIRCLE_RADIUS}
          y={CIRCLE_RADIUS + 20}
          fontSize="16"
          fill="#666666"
          textAnchor="middle">
          calories
        </SVGText>
      </Svg>
      <ThemedText style={styles.goalText}>
        Daily Goal: {dailyGoal} calories
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  goalText: {
    marginTop: 16,
    fontSize: 16,
    transform: [{ rotate: '0deg' }],
  },
}); 