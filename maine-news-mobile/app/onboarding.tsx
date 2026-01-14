import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, fontSize } from '../constants/theme';
import { ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('has_onboarded', 'true');
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.logoText}>MAINE NEWS TODAY</Text>
                    <View style={styles.accentBar} />
                </View>

                <Text style={styles.tagline}>Unbiased. Unafraid. Unfiltered.</Text>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                        The intelligence core for Maine. World-class journalism, delivered without clutter.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Enter Feed</Text>
                    <ChevronRight size={20} color={colors.background} />
                </TouchableOpacity>

                <Text style={styles.vLabel}>EST. 2026 — V1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xxl,
        justifyContent: 'space-between',
    },
    content: {
        marginTop: height * 0.15,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoImage: {
        width: 100,
        height: 100,
        marginBottom: spacing.md,
    },
    logoText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 32,
        color: colors.text,
        textAlign: 'center',
        letterSpacing: -1,
    },
    accentBar: {
        width: 60,
        height: 4,
        backgroundColor: colors.accent,
        marginTop: -4,
    },
    tagline: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: colors.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: spacing.xxl,
    },
    descriptionContainer: {
        paddingHorizontal: spacing.xl,
    },
    description: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.lg,
        borderRadius: 4,
        gap: 8,
    },
    buttonText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: colors.background,
        textTransform: 'uppercase',
    },
    vLabel: {
        marginTop: spacing.xl,
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: colors.textDim,
    }
});
