import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPosts, searchPosts, Post } from '../services/api';
import { colors, typography, spacing, fontSize } from '../constants/theme';
import { Search as SearchIcon, ArrowLeft, ChevronUp } from 'lucide-react-native';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const router = useRouter();

    const flatListRef = React.useRef<FlatList>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchPosts();
                setAllPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (query.trim()) {
            setFilteredPosts(searchPosts(allPosts, query));
        } else {
            setFilteredPosts([]);
        }
    }, [query, allPosts]);

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

    const renderItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push(`/article/${item.slug}`)}
        >
            <Text style={styles.resultTitle}>{item.title}</Text>
            <View style={styles.resultMeta}>
                <Text style={styles.category}>{item.category.toUpperCase()}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.metaText}>{item.author}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <SearchIcon size={20} color={colors.accent} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search Maine Intel..."
                    placeholderTextColor={colors.textDim}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    selectionColor={colors.accent}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.accent} />
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={filteredPosts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.slug}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>
                                    {query.trim() ? `No results for "${query}"` : 'Type to start searching...'}
                                </Text>
                            </View>
                        }
                        contentContainerStyle={styles.list}
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
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        margin: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: 50,
        color: colors.text,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    list: {
        padding: spacing.md,
    },
    resultItem: {
        padding: spacing.lg,
        backgroundColor: colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
        borderRadius: 4,
        marginBottom: spacing.xs,
    },
    resultTitle: {
        fontFamily: 'Oswald_500Medium',
        fontSize: 18,
        color: colors.text,
        marginBottom: 4,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    category: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.accent,
    },
    metaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: colors.textDim,
    },
    separator: {
        color: colors.textDim,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        color: colors.textDim,
        fontSize: 14,
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
