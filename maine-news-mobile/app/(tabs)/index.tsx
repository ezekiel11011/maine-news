import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPosts, Post, getImageUrl, filterByCategory } from '../../services/api';
import { colors, typography, spacing, fontSize } from '../../constants/theme';
import { Clock, Filter, ArrowUpDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = ['all', 'local', 'politics', 'health', 'opinion'];

export default function HomeFeed() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const router = useRouter();

    const loadPosts = async () => {
        try {
            const data = await fetchPosts();
            setAllPosts(data);
            applyFilters(data, activeCategory, sortBy);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyFilters = (data: Post[], category: string, sort: string) => {
        let filtered = filterByCategory(data, category);

        filtered.sort((a, b) => {
            const dateA = new Date(a.publishedDate).getTime();
            const dateB = new Date(b.publishedDate).getTime();
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setDisplayPosts(filtered);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    useEffect(() => {
        applyFilters(allPosts, activeCategory, sortBy);
    }, [activeCategory, sortBy]);

    const onRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };

    const toggleSort = () => {
        setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const renderHero = (heroPost: Post) => {
        const imageUrl = getImageUrl(heroPost.image);

        return (
            <TouchableOpacity
                style={styles.heroContainer}
                onPress={() => router.push(`/article/${heroPost.slug}`)}
                activeOpacity={0.9}
            >
                <View style={styles.heroImagePlaceholder}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : (
                        <Image source={require('../../assets/logo.jpeg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    )}
                </View>
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle} numberOfLines={3}>
                        {heroPost.title}
                    </Text>
                    <View style={styles.meta}>
                        <Text style={styles.metaTextInverse}>{heroPost.author}</Text>
                        <Text style={styles.separatorInverse}>///</Text>
                        <Text style={styles.metaTextInverse}>
                            {new Date(heroPost.publishedDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderPost = ({ item, index }: { item: Post; index: number }) => {
        // Skip the item if it's already shown as the hero
        if (item.slug === allPosts[0]?.slug) return null;

        const imageUrl = getImageUrl(item.image);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/article/${item.slug}`)}
                activeOpacity={0.7}
            >
                {imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                )}
                <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
                        <View style={styles.timeAgo}>
                            <Clock size={12} color={colors.textDim} />
                            <Text style={styles.timeText}>
                                {new Date(item.publishedDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.title} numberOfLines={3}>
                        {item.title}
                    </Text>
                    <Text style={styles.excerpt} numberOfLines={2}>
                        {item.excerpt || "Tap to read the full story on Maine News Today..."}
                    </Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.authorText}>By {item.author}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = () => {
        return (
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>LATEST NEWS</Text>
                    <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
                        <ArrowUpDown size={16} color={colors.accent} />
                        <Text style={styles.sortText}>{sortBy.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterBar}
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterChip,
                                activeCategory === cat && styles.activeFilterChip
                            ]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                activeCategory === cat && styles.activeFilterChipText
                            ]}>
                                {cat.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Fetching Maine Intelligence...</Text>
            </View>
        );
    }

    const heroPost = allPosts[0];

    return (
        <View style={styles.container}>
            <FlatList
                data={displayPosts}
                renderItem={renderPost}
                keyExtractor={item => item.slug}
                ListHeaderComponent={
                    <View>
                        {heroPost && renderHero(heroPost)}
                        {renderSectionHeader()}
                    </View>
                }
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No stories found for this selection.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Inter_400Regular',
        color: colors.textMuted,
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
    heroContainer: {
        height: 350,
        width: width,
        marginBottom: spacing.lg,
    },
    heroImagePlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        color: colors.border,
        opacity: 0.3,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: spacing.lg,
    },
    heroTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 28,
        color: colors.text,
        lineHeight: 34,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        color: colors.text,
        letterSpacing: 0.5,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: colors.cardBg,
    },
    sortText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.accent,
    },
    filterBar: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.borderDim,
        marginRight: spacing.xs,
    },
    activeFilterChip: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    filterChipText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: colors.textMuted,
    },
    activeFilterChipText: {
        color: colors.background,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaTextInverse: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textMuted,
    },
    separatorInverse: {
        color: colors.accent,
        marginHorizontal: 8,
    },
    list: {
        paddingBottom: spacing.xxl,
    },
    card: {
        backgroundColor: colors.cardBg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardBody: {
        padding: spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoryBadge: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.accent,
        letterSpacing: 1,
    },
    timeAgo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: colors.textDim,
    },
    title: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: 24,
    },
    excerpt: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
        paddingTop: spacing.sm,
    },
    authorText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        color: colors.textDim,
        textAlign: 'center',
    },
});
