import { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type Props = {
  imageUri?: string;
  x: number;
  y: number;
  scale: number;
};

export function CampOverlay({ imageUri, x, y, scale }: Props) {
  const size = 28 * scale;
  const rotZ = useSharedValue(0);
  const rotX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    rotZ.value = withRepeat(
      withTiming(6, {
        duration: 2000,
      }),
      -1,
      true
    );
    rotX.value = withRepeat(
      withTiming(8, {
        duration: 2500,
      }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(-4, {
        duration: 1500,
      }),
      -1,
      true
    );
  }, [rotZ, rotX, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotX.value}deg` },
      { rotateZ: `${rotZ.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  if (imageUri) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: x,
            top: y,
            width: size * 1.4,
            height: size * 0.8,
            overflow: 'hidden',
            borderRadius: 2,
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.15)',
          },
          animStyle,
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: size * 1.4, height: size * 0.8 }}
          resizeMode="cover"
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size * 1.4,
          height: size * 0.5,
        },
        animStyle,
      ]}
    >
      <Svg width={size * 1.4} height={size * 0.5} viewBox="0 0 28 10">
        <Path d="M2 1 L26 1 L26 9 L2 9 Z" fill="#E8252A" />
        <Path d="M2 1 L26 9 M26 1 L2 9" stroke="white" strokeWidth="1" />
      </Svg>
    </Animated.View>
  );
}