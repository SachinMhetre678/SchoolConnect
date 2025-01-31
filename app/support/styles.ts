import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: Colors.light.background,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportText: {
    marginLeft: 16,
    flex: 1,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  supportSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: Colors.light.textDim,
  },
});

export default styles;