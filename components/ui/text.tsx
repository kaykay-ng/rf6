import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'caption';

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function Text({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  return (
    <RNText
      style={[styles[variant], color ? { color } : null, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 28,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.text,
  },
  heading: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.text,
  },
  body: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: 15,
    color: Colors.text,
  },
  caption: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
