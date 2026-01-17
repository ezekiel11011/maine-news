import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors, spacing } from '../../constants/theme';

export default function PrivacyScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Privacy Policy' }} />
            <Text style={styles.title}>Global Privacy Policy</Text>
            <Text style={styles.tagline}>Gold Standard Edition</Text>
            <Text style={styles.date}>Last Updated: January 14, 2026</Text>

            <View style={styles.section}>
                <Text style={styles.heading}>Introduction</Text>
                <Text style={styles.text}>This Global Privacy Policy (the “Policy”) describes how Maine News Now (“Company,” “we,” “our,” or “us”) collects, uses, discloses, and safeguards personal information across all current and future websites, subdomains, and online services (collectively, the “Services”). This Policy sets a global standard for privacy compliance and data protection in accordance with high international legal frameworks (GDPR, CCPA/CPRA, etc.).</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>1. Scope and Applicability</Text>
                <Text style={styles.text}>This Policy applies to all visitors, customers, and users of our Services. By using our Services, you consent to the practices described herein.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>2. Information We Collect</Text>
                <Text style={styles.text}>We collect personal data directly and automatically, including identifiers (name, email), commercial data, geolocation, and behavioral analytics required for lawful business operations.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>3. Automated and AI‑Based Processing</Text>
                <Text style={styles.text}>We utilize AI/ML technologies to enhance service personalization and detect fraud. Automated decision‑making is always subject to appropriate human oversight.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>4. How We Use Information</Text>
                <Text style={styles.text}>We process data for legitimate business purposes: service delivery, account management, and platform security, grounded in a lawful basis under applicable law.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>5. Disclosure and Data Sharing</Text>
                <Text style={styles.text}>We do not sell personal data. We share information only with trusted service providers and legal authorities when required by law.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>13. Contact and DPO</Text>
                <Text style={styles.text}>We maintain a designated Data Protection Officer. Exercise your rights via email at privacy@mainenewstoday.com or by mail to our registered office in Florida, USA.</Text>
            </View>

            <Text style={styles.footerText}>© 2026 Maine News Now. All rights reserved.</Text>
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
