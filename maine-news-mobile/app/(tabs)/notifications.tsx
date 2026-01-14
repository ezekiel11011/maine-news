import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Bell size={64} color={colors.accent} />
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.subtitle}>No active alerts at this time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontFamily: 'Oswald_700Bold', fontSize: 24, color: colors.text, marginTop: 20 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
});
