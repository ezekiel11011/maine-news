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
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react-native';
import { Image } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const XIcon = ({ color }: { color: string }) => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill={color} />
  </Svg>
);

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
        <Text style={styles.appTitle}>MAINE NEWS NOW</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FOLLOW US</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr')}>
            <Facebook size={28} color="#1877F2" fill="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr')}>
            <Instagram size={28} color="#E4405F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://x.com/MaineNews_Now')}>
            <XIcon color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.youtube.com/@MaineNewsToday')}>
            <Youtube size={28} color="#FF0000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.mylibertysocial.com/app/pages/200')}>
            <Image source={require('../../assets/liberty-social.png')} style={styles.libertyIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tagline}>Unbiased. Unafraid. Unfiltered.</Text>
        <Text style={styles.copyright}>© {new Date().getFullYear()} Maine News Now Media Group</Text>
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
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  socialIcon: {
    padding: 8,
  },
  libertyIcon: {
    width: 28,
    height: 28,
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
