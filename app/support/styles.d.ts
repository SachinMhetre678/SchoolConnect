import { StyleProp, ViewStyle, TextStyle } from 'react-native';

declare module './styles' {
  const styles: {
    container: StyleProp<ViewStyle>;
    header: StyleProp<ViewStyle>;
    headerTitle: StyleProp<TextStyle>;
    supportCard: StyleProp<ViewStyle>;
    supportContent: StyleProp<ViewStyle>;
    supportText: StyleProp<ViewStyle>;
    supportTitle: StyleProp<TextStyle>;
    supportSubtitle: StyleProp<TextStyle>;
  };
  export default styles;
}