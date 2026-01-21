import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    Animated,
    Linking,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fetchPosts, Post, getImageUrl, filterByCategory } from '../../services/api';
import { colors, spacing, fontSize } from '../../constants/theme';
import { Clock, ArrowUpDown, ChevronUp, Facebook, Instagram, Youtube } from 'lucide-react-native';
import { Svg, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CATEGORIES = ['all', 'exclusives', 'top-stories', 'local', 'national', 'politics', 'opinion', 'editorial', 'health', 'sports', 'weather', 'entertainment'];

const XIcon = ({ color }: { color: string }) => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill={color} />
    </Svg>
);

const LiveTicker = React.memo(({ headlines }: { headlines: string[] }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const tickerItems = useMemo(() =>
        headlines.length > 0 ? headlines : ["No breaking news at this time"],
        [headlines]
    );

    useEffect(() => {
        if (contentWidth <= 0) return;

        translateX.setValue(0);
        const animation = Animated.loop(
            Animated.timing(translateX, {
                toValue: -contentWidth,
                duration: contentWidth * 35,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        animation.start();
        return () => animation.stop();
    }, [contentWidth, tickerItems]);

    const renderTrackPart = (isMain: boolean) => (
        <View
            key={isMain ? 'main' : 'dup'}
            style={styles.tickerTrackPart}
            onLayout={(e) => {
                if (isMain) {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0 && Math.abs(w - contentWidth) > 1) {
                        setContentWidth(w);
                    }
                }
            }}
        >
            {tickerItems.map((item, i) => (
                <View key={i} style={styles.tickerItemWrapper}>
                    <Text numberOfLines={1} style={styles.tickerItem}>{item.toUpperCase()}</Text>
                    <Text style={styles.tickerSeparator}>///</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.tickerContainer}>
            <View style={styles.tickerLabel}>
                <Text style={styles.tickerLabelText}>LIVE</Text>
            </View>
            <View style={styles.tickerWrapper}>
                <Animated.View
                    style={[
                        styles.tickerTrack,
                        {
                            transform: [{ translateX }],
                            width: contentWidth ? contentWidth * 2 : 10000
                        }
                    ]}
                >
                    {renderTrackPart(true)}
                    {renderTrackPart(false)}
                </Animated.View>
            </View>
        </View>
    );
});

export default function HomeFeed() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [interactionCount, setInteractionCount] = useState(0);

    const flatListRef = useRef<FlatList>(null);
    const heroScrollViewRef = useRef<ScrollView>(null);
    const heroTimerRef = useRef<NodeJS.Timeout | null>(null);
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
        let filtered = [...data];

        if (category === 'exclusives') {
            filtered = data.filter(post => post.isOriginal === true);
        } else if (category !== 'all') {
            filtered = filterByCategory(data, category);
        }

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
        if (allPosts.length > 1) {
            heroTimerRef.current = setInterval(() => {
                const nextIndex = (heroIndex + 1) % Math.min(6, allPosts.length);
                setHeroIndex(nextIndex);
                heroScrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
            }, 3500);
        }
        return () => {
            if (heroTimerRef.current) clearInterval(heroTimerRef.current);
        };
    }, [allPosts, heroIndex, interactionCount]);

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

    const formatRelativeTime = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        }
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return past.toLocaleDateString();
    };

    const renderHero = () => {
        const heroStories = allPosts.slice(0, 6);
        if (heroStories.length === 0) return null;

        return (
            <View style={styles.heroContainer}>
                <ScrollView
                    ref={heroScrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                        setHeroIndex(newIndex);
                        setInteractionCount(prev => prev + 1);
                    }}
                    onScrollBeginDrag={() => {
                        if (heroTimerRef.current) clearInterval(heroTimerRef.current);
                    }}
                >
                    {heroStories.map((post) => (
                        <TouchableOpacity
                            key={post.slug}
                            style={styles.heroSlide}
                            onPress={() => router.push(`/article/${post.slug}`)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.heroImagePlaceholder}>
                                <Image
                                    source={getImageUrl(post.image) ? { uri: getImageUrl(post.image) } : require('../../assets/hero-fallback.jpeg')}
                                    style={styles.heroFullImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <LinearGradient
                                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle} numberOfLines={3}>
                                    {post.title}
                                </Text>
                                <View style={styles.meta}>
                                    <Text style={styles.metaTextInverse}>{post.author}</Text>
                                    <Text style={styles.separatorInverse}>///</Text>
                                    <Text style={styles.metaTextInverse}>
                                        {formatRelativeTime(post.publishedDate)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.heroIndicatorsOverlay}>
                    {heroStories.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.heroIndicator,
                                i === heroIndex && styles.activeHeroIndicator
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderSocialBar = () => {
        return (
            <View style={styles.socialBar}>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr')}>
                    <Facebook size={18} color="#1877F2" fill="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr')}>
                    <Instagram size={18} color="#E4405F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://x.com/MaineNews_Now')}>
                    <XIcon color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.mylibertysocial.com/app/pages/200')}>
                    <Image source={require('../../assets/liberty-social.png')} style={{ width: 18, height: 18 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.youtube.com/@MaineNewsToday')}>
                    <Youtube size={18} color="#FF0000" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderSectionHeader = () => {
        return (
            <View style={styles.stickyHeaderContent}>
                {renderSocialBar()}
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
            </View>
        );
    };

    const headlinesArray = useMemo(() => allPosts.slice(0, 10).map(p => p.title), [allPosts]);

    const renderItem = ({ item }: { item: any }) => {
        if (item.isHero) return renderHero();
        if (item.isTicker) return <LiveTicker headlines={headlinesArray} />;
        if (item.isHeader) return renderSectionHeader();

        const post = item as Post;
        const heroSlugs = allPosts.slice(0, 6).map(p => p.slug);
        if (heroSlugs.includes(post.slug)) return null;

        const imageUrl = getImageUrl(post.image);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/article/${post.slug}`)}
                activeOpacity={0.7}
            >
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../../assets/hero-fallback.jpeg')}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryBadge}>{post.category.toUpperCase()}</Text>
                        <View style={styles.timeAgo}>
                            <Clock size={12} color={colors.textDim} />
                            <Text style={styles.timeText}>{formatRelativeTime(post.publishedDate)}</Text>
                        </View>
                    </View>
                    <Text style={styles.title} numberOfLines={3}>{post.title}</Text>
                    <Text style={styles.excerpt} numberOfLines={2}>
                        {post.excerpt || "Tap to read the full story on Maine News Now..."}
                    </Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.authorText}>By {post.author}</Text>
                    </View>
                </View>
            </TouchableOpacity>
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

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={[
                    { isHero: true, slug: 'home-hero' },
                    { isTicker: true, slug: 'live-ticker' },
                    { isHeader: true, slug: 'sticky-header' },
                    ...displayPosts
                ]}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.slug || `item-${index}`}
                stickyHeaderIndices={[2]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.list}
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        <Image source={require('../../assets/square-logo.png')} style={styles.footerLogo} resizeMode="contain" />
                        <Text style={styles.footerTitle}>MAINE NEWS NOW</Text>
                        <Text style={styles.footerTagline}>Truth. Independence. Maine.</Text>
                        <Text style={styles.footerCopyright}>© {new Date().getFullYear()} Maine News Now. All rights reserved.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No stories found for this selection.</Text>
                    </View>
                }
            />
            {showScrollTop && (
                <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop} activeOpacity={0.8}>
                    <ChevronUp size={24} color={colors.background} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centerContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontFamily: 'Inter_400Regular', color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.md },
    heroContainer: { height: 350, width: width, marginBottom: spacing.lg, overflow: 'hidden', backgroundColor: '#000' },
    heroSlide: { width: width, height: 350 },
    heroImagePlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, paddingBottom: spacing.xl, backgroundColor: 'transparent' },
    heroIndicatorsOverlay: { position: 'absolute', bottom: spacing.md, left: spacing.lg, flexDirection: 'row', gap: 6, zIndex: 20 },
    heroIndicator: { height: 4, width: 15, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 },
    activeHeroIndicator: { backgroundColor: '#fff', width: 35 },
    tickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', height: 40, borderBottomWidth: 1, borderBottomColor: colors.borderDim, zIndex: 5 },
    tickerLabel: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    tickerLabelText: { color: '#000', fontFamily: 'Oswald_700Bold', fontSize: 12, letterSpacing: 1 },
    tickerWrapper: { flex: 1, overflow: 'hidden' },
    tickerTrack: { flexDirection: 'row' },
    tickerTrackPart: { flexDirection: 'row', alignItems: 'center' },
    tickerItemWrapper: { flexDirection: 'row', alignItems: 'center', marginRight: 30 },
    tickerItem: { color: colors.text, fontFamily: 'Oswald_400Regular', fontSize: 13, letterSpacing: 0.5 },
    tickerSeparator: { color: colors.accent, fontSize: 13, marginLeft: 15 },
    stickyHeaderContent: { backgroundColor: colors.background },
    socialBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: colors.borderDim, gap: 24 },
    socialIcon: { padding: 4 },
    heroTitle: { fontFamily: 'Oswald_700Bold', fontSize: 28, color: colors.text, lineHeight: 34, marginBottom: spacing.md },
    sectionHeader: { paddingTop: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.background },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md },
    sectionTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: colors.text, letterSpacing: 0.5 },
    sortButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, backgroundColor: colors.cardBg },
    sortText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.accent },
    filterBar: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.borderDim, marginRight: spacing.xs },
    activeFilterChip: { backgroundColor: colors.accent, borderColor: colors.accent },
    filterChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.textMuted },
    activeFilterChipText: { color: colors.background },
    meta: { flexDirection: 'row', alignItems: 'center' },
    metaTextInverse: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textMuted },
    separatorInverse: { color: colors.accent, marginHorizontal: 8 },
    list: { paddingBottom: spacing.xxl },
    card: { backgroundColor: colors.cardBg, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.accent, overflow: 'hidden' },
    cardImage: { width: '100%', height: 180 },
    cardBody: { padding: spacing.lg },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    categoryBadge: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.accent, letterSpacing: 1 },
    timeAgo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textDim },
    title: { fontFamily: 'Oswald_700Bold', fontSize: 18, color: colors.text, marginBottom: spacing.sm, lineHeight: 24 },
    excerpt: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
    cardFooter: { borderTopWidth: 1, borderTopColor: colors.borderDim, paddingTop: spacing.sm },
    authorText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textDim, fontStyle: 'italic' },
    emptyContainer: { padding: spacing.xxl, alignItems: 'center' },
    emptyText: { fontFamily: 'Inter_400Regular', color: colors.textDim, textAlign: 'center' },
    scrollToTopButton: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, backgroundColor: colors.accent, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    footerContainer: { padding: spacing.xxl, alignItems: 'center', backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.borderDim, marginTop: spacing.lg },
    footerLogo: { width: 60, height: 60, marginBottom: spacing.md },
    footerTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: colors.text, marginBottom: spacing.xs },
    footerTagline: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.accent, marginBottom: spacing.lg },
    footerCopyright: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textDim, textAlign: 'center' },
    heroFullImage: { width: '100%', height: '100%' }
});
