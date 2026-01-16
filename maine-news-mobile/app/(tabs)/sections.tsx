import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, fontSize } from '../../constants/theme';
import { LayoutGrid, ChevronRight, PlayCircle, Video } from 'lucide-react-native';

const CATEGORIES = [
    'Exclusives',
    'Top Stories',
    'Local',
    'Politics',
    'Health',
    'Opinion',
    'Sports',
    'Weather',
    'Entertainment',
    'National',
];

export default function SectionsScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <LayoutGrid size={32} color={colors.accent} />
                <Text style={styles.title}>All Sections</Text>
            </View>

            <View style={styles.grid}>
                {/* Featured Video Hub Link */}
                <TouchableOpacity
                    style={[styles.item, styles.videoHubItem]}
                    activeOpacity={0.8}
                    onPress={() => router.push('/video-hub')}
                >
                    <View style={styles.videoHubLabel}>
                        <Video size={24} color={colors.background} />
                        <Text style={styles.videoHubText}>Explore Video Hub</Text>
                    </View>
                    <PlayCircle size={24} color={colors.background} />
                </TouchableOpacity>

                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={styles.item}
                        activeOpacity={0.7}
                        onPress={() => router.push({
                            pathname: `/category/[id]`,
                            params: { id: cat.toLowerCase().replace(' ', '-') }
                        })}
                    >
                        <Text style={styles.itemText}>{cat}</Text>
                        <ChevronRight size={20} color={colors.textDim} />
                    </TouchableOpacity>
                ))}
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
        padding: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    title: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 28,
        color: colors.text,
    },
    grid: {
        paddingHorizontal: spacing.md,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    itemText: {
        fontFamily: 'Oswald_500Medium',
        fontSize: 18,
        color: colors.text,
        textTransform: 'uppercase',
    },
    videoHubItem: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        marginBottom: spacing.lg,
    },
    videoHubLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    videoHubText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: colors.background,
        textTransform: 'uppercase',
    },
});
