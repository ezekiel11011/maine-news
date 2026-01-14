import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors, spacing } from '../../constants/theme';

export default function TermsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Terms of Service' }} />
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.tagline}>Gold Standard Edition</Text>
            <Text style={styles.date}>Last Updated: January 14, 2026</Text>

            <View style={styles.section}>
                <Text style={styles.heading}>Introduction</Text>
                <Text style={styles.text}>These Terms of Service (the “Terms”) describe how Maine News Today (“Company,” “we,” “our,” or “us”) provides Services across all websites and online platforms. These Terms set a global standard for usage compliance. By using our Services, you agree to these Terms.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>1. Scope and Applicability</Text>
                <Text style={styles.text}>These Terms apply to all visitors and users of our Services. Continued use of our platform constitutes acceptance of these practices.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>3. Automated and AI‑Based Processing</Text>
                <Text style={styles.text}>We utilize AI/ML technologies to analyze data and enhance personalization. Users acknowledge that automated decision‑making may influence recommendations.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>10. Security and Safeguards</Text>
                <Text style={styles.text}>We employ technical and physical safeguards including encryption and multi‑factor authentication to protect our intellectual property and your accounts.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>13. Contact and Disputes</Text>
                <Text style={styles.text}>Any disputes regarding these Terms should be directed to privacy@mainenewstoday.com or our registered office in Florida, USA.</Text>
            </View>

            <Text style={styles.footerText}>© 2026 Maine News Today. All rights reserved.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    title: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 32,
        color: colors.text,
        marginBottom: 4,
    },
    tagline: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: colors.accent,
        marginBottom: 4,
    },
    date: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    heading: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    text: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 22,
        color: colors.textMuted,
    },
    footerText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
        textAlign: 'center',
        marginTop: spacing.xl,
    }
});
