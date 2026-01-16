import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { fetchPosts, filterByCategory, Post } from '../../services/api';
import { colors, typography, spacing, fontSize } from '../../constants/theme';
import { Clock, ArrowLeft, ChevronUp } from 'lucide-react-native';

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const router = useRouter();

    const flatListRef = React.useRef<FlatList>(null);

    const categoryName = typeof id === 'string' ? id.replace('-', ' ') : '';

    const loadPosts = async () => {
        try {
            const allPosts = await fetchPosts();
            const filtered = filterByCategory(allPosts, typeof id === 'string' ? id : 'all');
            setPosts(filtered);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 400 && !showScrollTop) {
            setShowScrollTop(true);
        } else if (offsetY <= 400 && showScrollTop) {
            setShowScrollTop(false);
        }
    };

    const scrollToTop = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const renderPost = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/article/${item.slug}`)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
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
            <View style={styles.cardFooter}>
                <Text style={styles.authorText}>By {item.author}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: categoryName.toUpperCase(),
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold' },
                }}
            />

            <FlatList
                ref={flatListRef}
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.slug}
                contentContainerStyle={styles.list}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No stories found in this section.</Text>
                    </View>
                }
            />

            {showScrollTop && (
                <TouchableOpacity
                    style={styles.scrollToTopButton}
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                >
                    <ChevronUp size={24} color={colors.background} />
                </TouchableOpacity>
            )}
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
    list: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing.sm,
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
        lineHeight: 24,
        marginBottom: spacing.sm,
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
    },
    scrollToTopButton: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.accent,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 100,
    },
});
