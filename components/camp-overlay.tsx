import { Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useEffect
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
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(6, {
        duration: 2000,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  if (imageUri) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: x,
            top: y,
            width: size,
            height: size,
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
          style={{ width: size, height: size }}
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
          width: size,
          height: size * 0.6,
        },
        animStyle,
      ]}
    >
      <Svg width={size} height={size * 0.6} viewBox="0 0 24 15">
        <Path d="M2 1 L22 1 L22 14 L2 14 Z" fill="#E8252A" />
        <Path d="M2 1 L22 14 M22 1 L2 14" stroke="white" strokeWidth="1.5" />
      </Svg>
    </Animated.View>
  );
}