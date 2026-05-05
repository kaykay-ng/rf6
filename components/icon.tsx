import { SvgXml } from 'react-native-svg';
import { View } from 'react-native';

interface IconProps {
  name: 'date' | 'time' | 'location' | 'weather';
  size?: number;
  color?: string;
}

const SVG_PATHS: Record<string, string> = {
  date: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 4H19V6H5V4ZM5 20H19V22H5V20ZM3 10H5V20H3V10ZM3 6H5V8H3V6ZM19 6H21V8H19V6ZM19 10H21V20H19V10ZM3 8H21V10H3V8ZM15 2H17V4H15V2ZM7 2H9V4H7V2ZM7 12H9V14H7V12ZM7 16H9V18H7V16ZM11 12H13V14H11V12ZM11 16H13V18H11V16ZM15 12H17V14H15V12Z" fill="currentColor"/>
</svg>`,

  time: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 5H16V7H8V5ZM8 19H16V21H8V19ZM6 7H8V9H6V7ZM6 17H8V19H6V17ZM16 7H18V9H16V7ZM16 17H18V19H16V17ZM4 9H6V17H4V9ZM18 9H20V17H18V9ZM4 2H6V4H4V2ZM4 19H6V21H4V19ZM18 19H20V21H18V19ZM18 2H20V4H18V2ZM2 4H4V6H2V4ZM20 4H22V6H20V4ZM11 9H13V13H11V9ZM13 13H15V15H13V13Z" fill="currentColor"/>
</svg>`,

  location: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 19H23V21H1V19Z" fill="currentColor"/>
<path d="M3 17H5V20H3V17ZM5 14H7V17H5V14ZM7 11H9V14H7V11ZM9 8H11V11H9V8ZM11 5H13V8H11V5ZM9 3H11V5H9V3ZM13 8H15V11H13V8ZM15 11H17V14H15V11ZM17 14H19V17H17V14ZM19 17H21V20H19V17ZM9 17H11V19H9V17ZM13 17H15V19H13V17ZM11 15H13V17H11V15ZM13 3H15V5H13V3Z" fill="currentColor"/>
</svg>`,

  weather: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 22H4V20H14V22ZM4 20H2V16H4V20ZM16 20H14V16H16V20ZM10 18H8V16H10V18ZM8 16H4V14H8V16ZM14 16H12V14H14V16ZM12 14H8V12H12V14ZM24 13H20V11H24V13ZM18 12H16V10H18V12ZM8 10H6V8H8V10ZM16 10H14V8H16V10ZM14 8H8V6H14V8ZM6 6H4V4H6V6ZM20 6H18V4H20V6ZM4 4H2V2H4V4ZM13 4H11V0H13V4ZM22 4H20V2H22V4Z" fill="currentColor"/>
</svg>`,
};

export function Icon({ name, size = 24, color = '#000000' }: IconProps) {
  const svgString = SVG_PATHS[name];

  if (!svgString) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const coloredSvg = svgString.replace(/currentColor/g, color);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <SvgXml xml={coloredSvg} width={size} height={size} />
    </View>
  );
}
