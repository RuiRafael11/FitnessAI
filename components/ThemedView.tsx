import { View, ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(props: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: '#FFFFFF',
        },
        props.style,
      ]}
    />
  );
}
