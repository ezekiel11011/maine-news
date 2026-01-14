import { View, Text, StyleSheet, TouchableOpacity, Share, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import {
  MoreHorizontal,
  Share2,
  Shield,
  FileText,
  Mail,
  ChevronRight,
  Github
} from 'lucide-react-native';

export default function MoreScreen() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Stay informed with Maine News Today - Unbiased. Unafraid. Unfiltered. Download the app now!',
        url: 'https://mainenewstoday.com',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReportIssue = () => {
    Linking.openURL('mailto:jamesezekiel039@gmail.com?subject=REPORT ISSUE TO DEVELOPER');
  };

  const MenuItem = ({ icon: Icon, title, onPress, color = colors.text }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Icon size={22} color={color} />
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={colors.textDim} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MoreHorizontal size={48} color={colors.accent} />
        <Text style={styles.appTitle}>MAINE NEWS TODAY</Text>
        <Text style={styles.versionText}>Version 1.0.2-gold</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMMUNITY & SUPPORT</Text>
        <MenuItem
          icon={Share2}
          title="Share App"
          onPress={handleShare}
          color={colors.accent}
        />
        <MenuItem
          icon={Mail}
          title="Report Issue"
          onPress={handleReportIssue}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL & POLICY</Text>
        <MenuItem
          icon={Shield}
          title="Privacy Policy"
          onPress={() => router.push('/more/privacy')}
        />
        <MenuItem
          icon={FileText}
          title="Terms of Service"
          onPress={() => router.push('/more/terms')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.tagline}>Unbiased. Unafraid. Unfiltered.</Text>
        <Text style={styles.copyright}>© 2026 Maine News Today Media Group</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
  },
  appTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  versionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textDim,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.accent,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  tagline: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  copyright: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textDim,
    marginTop: 8,
    opacity: 0.6,
  }
});
