import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, spacing } from '../constants/theme';
import { CloudSun, Wind, Droplets, Thermometer, MapPin, Calendar, Clock, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchPosts, Post, getImageUrl, filterByCategory } from '../services/api';

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const router = useRouter();

    const flatListRef = React.useRef<FlatList>(null);

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        const loadWeatherPosts = async () => {
            try {
                const allPosts = await fetchPosts();
                const weatherPosts = filterByCategory(allPosts, 'weather');
                setPosts(weatherPosts);
            } catch (error) {
                console.error('Error loading weather posts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadWeatherPosts();
    }, []);

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

    const renderHeader = () => (
        <View>
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
                style={styles.heroGradient}
            >
                <View style={styles.heroContent}>
                    <View style={styles.locationRow}>
                        <MapPin size={20} color="#fff" />
                        <Text style={styles.locationText}>Bangor, Maine</Text>
                    </View>
                    <Text style={styles.dateText}>{dateString}</Text>

                    <View style={styles.mainWeather}>
                        <CloudSun size={100} color="#fff" strokeWidth={1.5} />
                        <View style={styles.tempContainer}>
                            <Text style={styles.currentTemp}>24°</Text>
                            <Text style={styles.conditionText}>Partly Cloudy</Text>
                        </View>
                    </View>

                    <View style={styles.highLowRow}>
                        <Text style={styles.highLowText}>H: 32°  L: 12°</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.detailsContainer}>
                <Text style={styles.sectionHeading}>WEATHER NEWS</Text>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Post }) => {
        const imageUrl = getImageUrl(item.image);
        return (
            <TouchableOpacity
                style={styles.postCard}
                onPress={() => router.push(`/article/${item.slug}`)}
                activeOpacity={0.7}
            >
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/hero-fallback.jpeg')}
                    style={styles.postImage}
                    resizeMode="cover"
                />
                <View style={styles.postContent}>
                    <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.postMeta}>
                        <Clock size={12} color={colors.textDim} />
                        <Text style={styles.postTime}>{formatRelativeTime(item.publishedDate)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'Maine Weather',
                headerTransparent: true,
                headerTintColor: '#fff',
                headerTitleStyle: { fontFamily: 'Oswald_700Bold' }
            }} />

            <FlatList
                ref={flatListRef}
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.slug}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No weather reports found.</Text>
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    )
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
    listContent: {
        paddingBottom: spacing.xl,
    },
    heroGradient: {
        paddingTop: 100,
        paddingBottom: 40,
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    heroContent: {
        alignItems: 'center',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    locationText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        color: '#fff',
        textTransform: 'uppercase',
    },
    dateText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 30,
    },
    mainWeather: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 20,
    },
    tempContainer: {
        justifyContent: 'center',
    },
    currentTemp: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 72,
        color: '#fff',
        lineHeight: 80,
    },
    conditionText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: '#fff',
    },
    highLowRow: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    highLowText: {
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        fontSize: 16,
    },
    detailsContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        marginTop: -20,
    },
    infoCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: spacing.xl,
    },
    cardTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: colors.text,
        marginBottom: 20,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
        paddingBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    gridItem: {
        width: (width - 100) / 2,
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 15,
    },
    gridLabel: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 8,
    },
    gridValue: {
        fontFamily: 'Oswald_500Medium',
        fontSize: 16,
        color: colors.text,
        marginTop: 4,
    },
    sectionHeading: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 22,
        color: colors.text,
        marginBottom: spacing.md,
        letterSpacing: 0.5,
    },
    postCard: {
        flexDirection: 'row',
        backgroundColor: colors.cardBg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    postImage: {
        width: 100,
        height: 100,
    },
    postContent: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'center',
    },
    postTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postTime: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: colors.textDim,
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        color: colors.textDim,
    },
    loadingContainer: {
        padding: spacing.xxl,
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
